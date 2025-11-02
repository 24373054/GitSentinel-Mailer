// 加载环境变量（必须在其他模块导入之前）
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');
const monitorService = require('./monitorService');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 初始化数据库
db.init();

// API路由

// 获取所有项目
app.get('/api/projects', (req, res) => {
  db.getAllProjects((err, projects) => {
    if (err) {
      return res.status(500).json({ error: '获取项目列表失败' });
    }
    res.json(projects);
  });
});

// 添加新项目
app.post('/api/projects', (req, res) => {
  const { repoUrl, email, emailTheme } = req.body;
  
  if (!repoUrl || !email) {
    return res.status(400).json({ error: '仓库地址和邮箱不能为空' });
  }

  // 验证仓库URL格式 (owner/repo)
  const repoPattern = /^[\w-]+\/[\w.-]+$/;
  if (!repoPattern.test(repoUrl)) {
    return res.status(400).json({ error: '仓库地址格式错误，应为: owner/repo' });
  }

  db.addProject(repoUrl, email, emailTheme, (err, id) => {
    if (err) {
      return res.status(500).json({ error: '添加项目失败' });
    }
    res.json({ id, repoUrl, email, emailTheme, isMonitoring: false, message: '项目添加成功' });
  });
});

// 更新项目
app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const { repoUrl, email, emailTheme } = req.body;

  if (!repoUrl || !email) {
    return res.status(400).json({ error: '仓库地址和邮箱不能为空' });
  }

  const repoPattern = /^[\w-]+\/[\w.-]+$/;
  if (!repoPattern.test(repoUrl)) {
    return res.status(400).json({ error: '仓库地址格式错误，应为: owner/repo' });
  }

  db.updateProject(id, repoUrl, email, emailTheme, (err) => {
    if (err) {
      return res.status(500).json({ error: '更新项目失败' });
    }
    res.json({ message: '项目更新成功' });
  });
});

// 删除项目
app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  
  // 如果项目正在监控，先停止监控
  monitorService.stopMonitoring(parseInt(id));
  
  db.deleteProject(id, (err) => {
    if (err) {
      return res.status(500).json({ error: '删除项目失败' });
    }
    res.json({ message: '项目删除成功' });
  });
});

// 启动监控
app.post('/api/monitor/start/:id', (req, res) => {
  const { id } = req.params;
  
  db.getProject(id, (err, project) => {
    if (err || !project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    monitorService.startMonitoring(project);
    
    db.updateMonitoringStatus(id, true, (err) => {
      if (err) {
        return res.status(500).json({ error: '更新监控状态失败' });
      }
      res.json({ message: '监控已启动' });
    });
  });
});

// 停止监控
app.post('/api/monitor/stop/:id', (req, res) => {
  const { id } = req.params;
  
  monitorService.stopMonitoring(parseInt(id));
  
  db.updateMonitoringStatus(id, false, (err) => {
    if (err) {
      return res.status(500).json({ error: '更新监控状态失败' });
    }
    res.json({ message: '监控已停止' });
  });
});

// 获取监控状态
app.get('/api/monitor/status', (req, res) => {
  const status = monitorService.getMonitoringStatus();
  res.json(status);
});

// 获取监控间隔
app.get('/api/monitor/interval', (req, res) => {
  const interval = monitorService.getMonitorInterval();
  res.json(interval);
});

// 设置监控间隔
app.post('/api/monitor/interval', (req, res) => {
  const { seconds } = req.body;
  
  if (!seconds || seconds < 5) {
    return res.status(400).json({ error: '监控间隔不能少于5秒' });
  }
  
  if (seconds > 3600) {
    return res.status(400).json({ error: '监控间隔不能超过1小时' });
  }
  
  try {
    const result = monitorService.setMonitorInterval(seconds);
    res.json({
      message: '监控间隔已更新',
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: '更新监控间隔失败' });
  }
});

// 获取所有邮件主题
app.get('/api/email/themes', (req, res) => {
  const { getAllThemes } = require('./emailThemes');
  res.json(getAllThemes());
});

// 生产环境下提供静态文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  if (process.env.GITHUB_TOKEN) {
    console.log('✅ GitHub Token 已加载，速率限制：5000次/小时');
  } else {
    console.log('⚠️  未检测到GitHub Token，速率限制：60次/小时');
  }
});

