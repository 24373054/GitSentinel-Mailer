const axios = require('axios');
const db = require('./database');
const emailService = require('./emailService');

// 存储监控任务的Map
const monitoringTasks = new Map();

// GitHub API基础URL
const GITHUB_API_BASE = 'https://api.github.com';

// GitHub Token（可选，从环境变量读取）
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || null;

// 速率限制状态（使用Token时为5000，未使用时为60）
const INITIAL_RATE_LIMIT = GITHUB_TOKEN ? 5000 : 60;
let rateLimitStatus = {
  remaining: INITIAL_RATE_LIMIT,
  resetTime: null,
  isLimited: false
};

// 监控间隔时间（毫秒）已配置GitHub Token，可使用10秒间隔
let MONITOR_INTERVAL = 10 * 1000; // 10秒（默认值，可动态修改）

/**
 * 更新速率限制状态
 */
function updateRateLimitStatus(response) {
  if (response && response.headers) {
    const remaining = parseInt(response.headers['x-ratelimit-remaining'] || '0');
    const resetTime = parseInt(response.headers['x-ratelimit-reset'] || '0');
    const limit = parseInt(response.headers['x-ratelimit-limit'] || INITIAL_RATE_LIMIT.toString());
    
    rateLimitStatus.remaining = remaining;
    rateLimitStatus.resetTime = resetTime ? new Date(resetTime * 1000) : null;
    // 根据总限制数动态调整警告阈值（10%）
    rateLimitStatus.isLimited = remaining <= (limit * 0.1);
    
    if (rateLimitStatus.isLimited) {
      const resetDate = resetTime ? new Date(resetTime * 1000).toLocaleString('zh-CN') : '未知';
      console.warn(`⚠️  GitHub API速率限制警告：剩余 ${remaining}/${limit} 次请求，将在 ${resetDate} 重置`);
    }
  }
}

/**
 * 检查是否因为速率限制而需要等待
 */
function shouldWaitForRateLimit() {
  if (rateLimitStatus.remaining <= 0 && rateLimitStatus.resetTime) {
    const now = new Date();
    const waitTime = Math.max(0, rateLimitStatus.resetTime.getTime() - now.getTime());
    if (waitTime > 0) {
      const waitMinutes = Math.ceil(waitTime / 60000);
      return waitMinutes;
    }
  }
  return 0;
}

/**
 * 获取仓库最新提交
 */
async function getLatestCommits(repoUrl) {
  try {
    // 检查速率限制
    const waitMinutes = shouldWaitForRateLimit();
    if (waitMinutes > 0) {
      throw new Error(`GitHub API速率限制：需要等待 ${waitMinutes} 分钟后才能继续请求`);
    }

    const [owner, repo] = repoUrl.split('/');
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits`;
    
    // 构建请求头
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Monitor-System'
    };
    
    // 如果配置了GitHub Token，添加认证
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
      // 首次使用Token时输出提示
      if (rateLimitStatus.remaining === INITIAL_RATE_LIMIT) {
        console.log('🔑 使用GitHub Token认证，速率限制：5000次/小时');
      }
    }
    
    const response = await axios.get(url, {
      params: {
        per_page: 10 // 获取最新10个提交
      },
      headers: headers,
      validateStatus: function (status) {
        return status < 500; // 只对服务器错误抛出异常
      }
    });

    // 更新速率限制状态
    updateRateLimitStatus(response);

    // 处理HTTP错误状态
    if (response.status === 403) {
      // 检查是否是速率限制
      if (response.headers['x-ratelimit-remaining'] === '0') {
        const resetTime = parseInt(response.headers['x-ratelimit-reset'] || '0');
        const resetDate = resetTime ? new Date(resetTime * 1000).toLocaleString('zh-CN') : '未知';
        throw new Error(`GitHub API速率限制已达上限，将在 ${resetDate} 重置。建议添加GitHub Token以提高限制。`);
      } else {
        throw new Error(`GitHub API访问被拒绝(403)。可能是仓库不存在、私有仓库或需要认证。`);
      }
    }

    if (response.status !== 200) {
      throw new Error(`GitHub API返回错误：${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      // HTTP错误响应
      if (error.response.status === 403) {
        updateRateLimitStatus(error.response);
        const remaining = error.response.headers['x-ratelimit-remaining'] || '0';
        const resetTime = parseInt(error.response.headers['x-ratelimit-reset'] || '0');
        const resetDate = resetTime ? new Date(resetTime * 1000).toLocaleString('zh-CN') : '未知';
        
        const limit = error.response.headers['x-ratelimit-limit'] || '60';
        if (remaining === '0') {
          console.error(`❌ [速率限制] 获取仓库 ${repoUrl} 失败: 已达每小时${limit}次请求上限，将在 ${resetDate} 重置`);
          if (limit === '60') {
            console.error(`💡 建议：添加GitHub Token可提高限制到每小时5000次`);
          }
        } else {
          console.error(`❌ [访问被拒] 获取仓库 ${repoUrl} 失败: 403错误`);
        }
      } else if (error.response.status === 404) {
        console.error(`❌ [仓库不存在] 获取仓库 ${repoUrl} 失败: 仓库不存在或无权访问`);
      } else {
        console.error(`❌ 获取仓库 ${repoUrl} 提交失败: HTTP ${error.response.status}`);
      }
    } else if (error.message.includes('速率限制')) {
      console.error(`❌ ${error.message}`);
    } else {
      console.error(`❌ 获取仓库 ${repoUrl} 提交失败:`, error.message);
    }
    throw error;
  }
}

/**
 * 格式化提交信息
 */
function formatCommitInfo(commits) {
  return commits.map(commit => {
    const commitDate = new Date(commit.commit.author.date);
    return {
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commitDate.toLocaleString('zh-CN', { 
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      url: commit.html_url
    };
  });
}

/**
 * 检查并处理仓库变更
 */
async function checkRepositoryChanges(project) {
  try {
    // 如果速率限制已达上限，跳过本次检查
    if (rateLimitStatus.remaining <= 0 && rateLimitStatus.isLimited) {
      const waitMinutes = shouldWaitForRateLimit();
      if (waitMinutes > 0) {
        console.warn(`⏸️  项目 ${project.repoUrl} 检查已跳过：等待速率限制重置（还需 ${waitMinutes} 分钟）`);
        return;
      }
    }

    console.log(`🔍 正在检查项目 ${project.repoUrl} 的变更... (剩余请求: ${rateLimitStatus.remaining})`);
    
    const commits = await getLatestCommits(project.repoUrl);
    
    if (commits && commits.length > 0) {
      const latestCommit = commits[0];
      
      // 如果是第一次检查，只记录当前最新提交
      if (!project.lastCommitSha) {
        console.log(`✅ 初始化项目 ${project.repoUrl}，记录最新提交: ${latestCommit.sha.substring(0, 7)}`);
        db.updateLastCommitSha(project.id, latestCommit.sha);
        return;
      }
      
      // 检查是否有新提交
      if (latestCommit.sha !== project.lastCommitSha) {
        console.log(`🎉 检测到项目 ${project.repoUrl} 有新提交！`);
        
        // 找出所有新提交
        const newCommits = [];
        for (const commit of commits) {
          if (commit.sha === project.lastCommitSha) {
            break;
          }
          newCommits.push(commit);
        }
        
        // 格式化提交信息
        const formattedCommits = formatCommitInfo(newCommits);
        
        // 发送邮件通知
        try {
          await emailService.sendChangeNotification(
            project.email,
            project.repoUrl,
            formattedCommits,
            project.emailTheme || 'default'
          );
          console.log(`📧 已向 ${project.email} 发送 ${newCommits.length} 个新提交的通知 [主题: ${project.emailTheme || 'default'}]`);
        } catch (emailError) {
          console.error(`❌ 发送邮件失败:`, emailError.message);
          // 即使邮件发送失败，也更新提交SHA，避免重复发送
        }
        
        // 更新最后提交SHA
        db.updateLastCommitSha(project.id, latestCommit.sha);
      } else {
        console.log(`✓ 项目 ${project.repoUrl} 暂无新提交`);
      }
    }
  } catch (error) {
    // 如果是速率限制错误，不频繁打印日志
    if (error.message && error.message.includes('速率限制')) {
      // 只在第一次遇到时打印详细信息
      if (!rateLimitStatus.lastWarning || Date.now() - rateLimitStatus.lastWarning > 60000) {
        console.error(`⚠️  ${error.message}`);
        rateLimitStatus.lastWarning = Date.now();
      }
    } else {
      console.error(`❌ 检查项目 ${project.repoUrl} 时出错:`, error.message);
    }
  }
}

/**
 * 启动监控
 */
function startMonitoring(project) {
  // 如果已经在监控，先停止
  if (monitoringTasks.has(project.id)) {
    stopMonitoring(project.id);
  }
  
  console.log(`开始监控项目: ${project.repoUrl} (间隔: ${MONITOR_INTERVAL / 1000}秒)`);
  
  // 立即执行一次检查
  checkRepositoryChanges(project);
  
  // 设置定时任务
  const intervalId = setInterval(() => {
    // 重新获取项目信息以获取最新的lastCommitSha
    db.getProject(project.id, (err, updatedProject) => {
      if (err || !updatedProject) {
        console.error(`获取项目 ${project.id} 信息失败，停止监控`);
        stopMonitoring(project.id);
        return;
      }
      checkRepositoryChanges(updatedProject);
    });
  }, MONITOR_INTERVAL);
  
  monitoringTasks.set(project.id, {
    intervalId,
    project,
    interval: MONITOR_INTERVAL
  });
}

/**
 * 停止监控
 */
function stopMonitoring(projectId) {
  const task = monitoringTasks.get(projectId);
  if (task) {
    clearInterval(task.intervalId);
    monitoringTasks.delete(projectId);
    console.log(`停止监控项目 ID: ${projectId}`);
  }
}

/**
 * 获取监控状态
 */
function getMonitoringStatus() {
  const status = {};
  monitoringTasks.forEach((task, projectId) => {
    status[projectId] = {
      repoUrl: task.project.repoUrl,
      isMonitoring: true
    };
  });
  return status;
}

/**
 * 初始化时恢复所有处于监控状态的项目
 */
function restoreMonitoring() {
  db.getAllProjects((err, projects) => {
    if (err) {
      console.error('恢复监控状态失败:', err);
      return;
    }
    
    projects.forEach(project => {
      if (project.isMonitoring) {
        console.log(`恢复监控: ${project.repoUrl}`);
        startMonitoring(project);
      }
    });
  });
}

// 启动时恢复监控
setTimeout(restoreMonitoring, 2000);

/**
 * 获取速率限制状态
 */
function getRateLimitStatus() {
  return {
    ...rateLimitStatus,
    resetTime: rateLimitStatus.resetTime ? rateLimitStatus.resetTime.toLocaleString('zh-CN') : null
  };
}

/**
 * 设置监控间隔
 */
function setMonitorInterval(seconds) {
  const newInterval = seconds * 1000;
  const oldInterval = MONITOR_INTERVAL;
  
  MONITOR_INTERVAL = newInterval;
  console.log(`📝 监控间隔已从 ${oldInterval / 1000}秒 更改为 ${seconds}秒`);
  
  // 重启所有正在监控的项目以应用新间隔
  const activeProjects = [];
  monitoringTasks.forEach((task, projectId) => {
    activeProjects.push(task.project);
    stopMonitoring(projectId);
  });
  
  // 使用新间隔重新启动监控
  activeProjects.forEach(project => {
    startMonitoring(project);
  });
  
  return {
    oldInterval: oldInterval / 1000,
    newInterval: seconds,
    restartedProjects: activeProjects.length
  };
}

/**
 * 获取当前监控间隔
 */
function getMonitorInterval() {
  return {
    seconds: MONITOR_INTERVAL / 1000,
    milliseconds: MONITOR_INTERVAL,
    hasToken: !!GITHUB_TOKEN,
    rateLimit: GITHUB_TOKEN ? 5000 : 60,
    recommendedMin: GITHUB_TOKEN ? 5 : 60,
    activeProjects: monitoringTasks.size
  };
}

module.exports = {
  startMonitoring,
  stopMonitoring,
  getMonitoringStatus,
  getRateLimitStatus,
  setMonitorInterval,
  getMonitorInterval
};

