// 邮件主题模板配置

const themes = {
  // 默认主题（原来的渐变蓝紫色）
  default: {
    name: '默认（蓝紫渐变）',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      background: '#ffffff',
      cardBg: '#f9f9f9',
      text: '#333',
      lightText: '#666',
      link: '#1976D2',
      border: '#4CAF50'
    },
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    generateHTML: function(repoUrl, commits) {
      return generateDefaultHTML(repoUrl, commits, this);
    }
  },

  // 瀛州纪主题
  yingzhouji: {
    name: '瀛州纪（赛博史诗）',
    colors: {
      primary: '#00d4ff',      // 青蓝霓虹
      secondary: '#6b46c1',    // 紫色
      background: '#0a0e27',   // 深邃蓝黑
      cardBg: '#1a2b5c',       // 幽蓝
      text: '#ffffff',
      lightText: '#9ca3af',
      link: '#00d4ff',
      border: '#00d4ff',
      gold: '#ffd700'
    },
    gradient: 'linear-gradient(135deg, #0a0e27 0%, #1a2b5c 100%)',
    generateHTML: function(repoUrl, commits) {
      return generateYingzhoujiHTML(repoUrl, commits, this);
    }
  },

  // 简约黑白主题
  minimal: {
    name: '简约黑白',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      background: '#ffffff',
      cardBg: '#f5f5f5',
      text: '#000000',
      lightText: '#666666',
      link: '#000000',
      border: '#000000'
    },
    gradient: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
    generateHTML: function(repoUrl, commits) {
      return generateMinimalHTML(repoUrl, commits, this);
    }
  },

  // 温暖橙色主题
  warm: {
    name: '温暖橙色',
    colors: {
      primary: '#ff6b35',
      secondary: '#f7931e',
      background: '#fff8f0',
      cardBg: '#fff',
      text: '#333',
      lightText: '#666',
      link: '#ff6b35',
      border: '#ff6b35'
    },
    gradient: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    generateHTML: function(repoUrl, commits) {
      return generateDefaultHTML(repoUrl, commits, this);
    }
  },

  // 清新绿色主题
  fresh: {
    name: '清新绿色',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      background: '#f0fdf4',
      cardBg: '#fff',
      text: '#333',
      lightText: '#666',
      link: '#10b981',
      border: '#10b981'
    },
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    generateHTML: function(repoUrl, commits) {
      return generateDefaultHTML(repoUrl, commits, this);
    }
  }
};

// 默认主题HTML生成器
function generateDefaultHTML(repoUrl, commits, theme) {
  const commitListHTML = commits.map(commit => `
    <div style="border-left: 3px solid ${theme.colors.border}; padding: 10px; margin: 15px 0; background-color: ${theme.colors.cardBg};">
      <h3 style="margin: 0 0 10px 0; color: ${theme.colors.text};">
        <a href="${commit.url}" style="color: ${theme.colors.link}; text-decoration: none;">
          ${commit.sha.substring(0, 7)}
        </a>
      </h3>
      <p style="margin: 5px 0; color: ${theme.colors.lightText};">
        <strong>提交信息:</strong> ${commit.message}
      </p>
      <p style="margin: 5px 0; color: ${theme.colors.lightText};">
        <strong>提交者:</strong> ${commit.author}
      </p>
      <p style="margin: 5px 0; color: ${theme.colors.lightText};">
        <strong>提交时间:</strong> ${commit.date}
      </p>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>GitHub仓库变更通知</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: ${theme.colors.text}; max-width: 800px; margin: 0 auto; padding: 20px; background-color: ${theme.colors.background};">
      <div style="background: ${theme.gradient}; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">
          🔔 GitHub仓库变更通知
        </h1>
      </div>
      
      <div style="background-color: ${theme.colors.cardBg}; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; margin-bottom: 20px;">
          您监控的仓库 
          <strong style="color: ${theme.colors.link};">
            <a href="https://github.com/${repoUrl}" style="color: ${theme.colors.link}; text-decoration: none;">
              ${repoUrl}
            </a>
          </strong> 
          有新的提交！
        </p>
        
        <h2 style="color: ${theme.colors.text}; border-bottom: 2px solid ${theme.colors.border}; padding-bottom: 10px;">
          最新提交 (共 ${commits.length} 个)
        </h2>
        
        ${commitListHTML}
        
        <div style="margin-top: 30px; padding: 15px; background-color: ${theme.colors.background}; border-radius: 5px;">
          <p style="margin: 0; color: ${theme.colors.link};">
            💡 <strong>提示:</strong> 点击提交SHA可以查看详细的变更内容
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding: 20px; color: #999; font-size: 14px;">
        <p style="margin: 5px 0;">此邮件由 GitHub监控系统 自动发送</p>
        <p style="margin: 5px 0;">如需停止监控，请登录系统进行设置</p>
      </div>
    </body>
    </html>
  `;
}

// 瀛州纪主题HTML生成器
function generateYingzhoujiHTML(repoUrl, commits, theme) {
  const commitListHTML = commits.map(commit => `
    <div style="border-left: 2px solid ${theme.colors.border}; padding-left: 16px; margin: 20px 0; background: linear-gradient(90deg, rgba(0, 212, 255, 0.05) 0%, transparent 100%);">
      <h3 style="margin: 0 0 10px 0; color: ${theme.colors.primary}; font-family: 'Courier New', monospace; text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);">
        <a href="${commit.url}" style="color: ${theme.colors.primary}; text-decoration: none;">
          ▸ ${commit.sha.substring(0, 7)}
        </a>
      </h3>
      <p style="margin: 8px 0; color: ${theme.colors.text}; font-size: 15px;">
        <span style="color: ${theme.colors.lightText};">提交信息 ›</span> ${commit.message}
      </p>
      <p style="margin: 8px 0; color: ${theme.colors.lightText}; font-size: 14px;">
        <span style="color: ${theme.colors.gold};">📜</span> ${commit.author} · ${commit.date}
      </p>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>瀛州纪 · 链上记录通知</title>
    </head>
    <body style="font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif; line-height: 1.8; color: ${theme.colors.text}; max-width: 800px; margin: 0 auto; padding: 0; background-color: ${theme.colors.background}; background-image: repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(0, 212, 255, 0.03) 19px, rgba(0, 212, 255, 0.03) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(0, 212, 255, 0.03) 19px, rgba(0, 212, 255, 0.03) 20px);">
      
      <!-- 头部 -->
      <div style="background: ${theme.gradient}; padding: 40px 30px; margin: 0; position: relative; overflow: hidden;">
        <div style="position: relative; z-index: 2;">
          <h1 style="color: ${theme.colors.primary}; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 0 20px rgba(0, 212, 255, 0.8), 0 0 40px rgba(0, 212, 255, 0.4); letter-spacing: 4px;">
            ▣ 链上记录 · 数字碑文
          </h1>
          <p style="color: ${theme.colors.lightText}; margin: 15px 0 0 0; font-size: 16px; letter-spacing: 2px;">
            合约即生命 · 账本即史书
          </p>
        </div>
        <!-- 装饰线条 -->
        <div style="position: absolute; top: 0; right: 0; width: 200px; height: 100%; background: linear-gradient(90deg, transparent 0%, rgba(0, 212, 255, 0.1) 100%); opacity: 0.3;"></div>
      </div>
      
      <!-- 主体内容 -->
      <div style="padding: 30px; background-color: ${theme.colors.cardBg}; margin: 20px; border-radius: 8px; border: 1px solid ${theme.colors.primary}; box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);">
        
        <!-- 仓库信息 -->
        <div style="margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, transparent 100%); border-left: 3px solid ${theme.colors.border}; box-shadow: 0 0 15px rgba(0, 212, 255, 0.1);">
          <p style="font-size: 16px; margin: 0; color: ${theme.colors.lightText};">
            <span style="color: ${theme.colors.gold};">⬡</span> 监控仓库
          </p>
          <p style="font-size: 20px; margin: 10px 0 0 0; font-weight: bold;">
            <a href="https://github.com/${repoUrl}" style="color: ${theme.colors.primary}; text-decoration: none; text-shadow: 0 0 10px rgba(0, 212, 255, 0.5); font-family: 'Courier New', monospace;">
              ${repoUrl}
            </a>
          </p>
          <p style="font-size: 14px; margin: 10px 0 0 0; color: ${theme.colors.lightText};">
            检测到新的提交记录 · 已被永久记录于链上账本
          </p>
        </div>
        
        <!-- 提交列表标题 -->
        <h2 style="color: ${theme.colors.primary}; border-bottom: 2px solid ${theme.colors.border}; padding-bottom: 15px; margin: 30px 0 20px 0; font-size: 22px; text-shadow: 0 0 10px rgba(0, 212, 255, 0.3); font-family: 'Courier New', monospace;">
          ▣ 最新记录 <span style="color: ${theme.colors.gold}; font-size: 18px;">[${commits.length}]</span>
        </h2>
        
        ${commitListHTML}
        
        <!-- 底部提示 -->
        <div style="margin-top: 40px; padding: 20px; background: linear-gradient(135deg, rgba(107, 70, 193, 0.1) 0%, transparent 100%); border-radius: 5px; border: 1px solid ${theme.colors.secondary}; box-shadow: 0 0 15px rgba(107, 70, 193, 0.1);">
          <p style="margin: 0; color: ${theme.colors.primary}; font-size: 14px;">
            <span style="color: ${theme.colors.gold};">◆</span> <strong>链上见证</strong>
          </p>
          <p style="margin: 10px 0 0 0; color: ${theme.colors.lightText}; font-size: 14px; line-height: 1.8;">
            每一次提交都是文明演进的印记<br>
            每一行代码都被记录在永恒的账本之中<br>
            点击提交SHA查看详细的变更碑文
          </p>
        </div>
      </div>
      
      <!-- 页脚 -->
      <div style="text-align: center; padding: 30px 20px; color: ${theme.colors.lightText}; font-size: 13px;">
        <p style="margin: 5px 0; font-family: 'Courier New', monospace;">
          ━━━━━━━━━━━━━━━━━━━━━━
        </p>
        <p style="margin: 10px 0; color: ${theme.colors.primary}; text-shadow: 0 0 8px rgba(0, 212, 255, 0.3);">
          《瀛州纪》· 链上文明监控系统
        </p>
        <p style="margin: 5px 0;">
          永恒被记录 · 毁灭被见证
        </p>
        <p style="margin: 15px 0 5px 0; font-size: 12px;">
          此邮件由智能合约自动生成并发送<br>
          如需停止监控，请访问系统进行配置
        </p>
      </div>
    </body>
    </html>
  `;
}

// 简约黑白主题HTML生成器
function generateMinimalHTML(repoUrl, commits, theme) {
  const commitListHTML = commits.map(commit => `
    <div style="border-left: 2px solid ${theme.colors.border}; padding-left: 20px; margin: 20px 0;">
      <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 14px;">
        <a href="${commit.url}" style="color: ${theme.colors.text}; text-decoration: none; font-weight: bold;">
          ${commit.sha.substring(0, 7)}
        </a>
      </p>
      <p style="margin: 8px 0 4px 0; color: ${theme.colors.text};">
        ${commit.message}
      </p>
      <p style="margin: 4px 0; color: ${theme.colors.lightText}; font-size: 13px;">
        ${commit.author} · ${commit.date}
      </p>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>GitHub更新通知</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: ${theme.colors.text}; max-width: 700px; margin: 40px auto; padding: 20px; background-color: ${theme.colors.background};">
      
      <div style="border-bottom: 3px solid ${theme.colors.border}; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: ${theme.colors.text}; margin: 0; font-size: 28px; font-weight: 600;">
          GitHub Repository Update
        </h1>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="margin: 0 0 10px 0; color: ${theme.colors.lightText}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
          Repository
        </p>
        <p style="margin: 0; font-size: 18px; font-weight: 600;">
          <a href="https://github.com/${repoUrl}" style="color: ${theme.colors.text}; text-decoration: none;">
            ${repoUrl}
          </a>
        </p>
      </div>
      
      <div style="margin: 30px 0;">
        <p style="margin: 0 0 15px 0; color: ${theme.colors.lightText}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
          Recent Commits (${commits.length})
        </p>
        ${commitListHTML}
      </div>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid ${theme.colors.lightText}; color: ${theme.colors.lightText}; font-size: 12px;">
        <p style="margin: 5px 0;">Automated notification from GitHub Monitor System</p>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  themes,
  getTheme: (themeName) => themes[themeName] || themes.default,
  getAllThemes: () => Object.keys(themes).map(key => ({
    value: key,
    label: themes[key].name
  }))
};

