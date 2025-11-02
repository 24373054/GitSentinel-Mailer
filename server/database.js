const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../github_monitor.db');
let db;

// 初始化数据库
function init() {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('数据库连接失败:', err.message);
    } else {
      console.log('数据库连接成功');
      createTables();
    }
  });
}

// 创建表
function createTables() {
  const createProjectsTable = `
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      repo_url TEXT NOT NULL,
      email TEXT NOT NULL,
      email_theme TEXT DEFAULT 'default',
      is_monitoring INTEGER DEFAULT 0,
      last_commit_sha TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createProjectsTable, (err) => {
    if (err) {
      console.error('创建表失败:', err.message);
    } else {
      console.log('数据表初始化成功');
      // 检查并添加email_theme列（兼容旧数据库）
      db.run('ALTER TABLE projects ADD COLUMN email_theme TEXT DEFAULT "default"', (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('添加email_theme列失败:', err.message);
        }
      });
    }
  });
}

// 获取所有项目
function getAllProjects(callback) {
  const query = 'SELECT * FROM projects ORDER BY created_at DESC';
  db.all(query, [], (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      const projects = rows.map(row => ({
        id: row.id,
        repoUrl: row.repo_url,
        email: row.email,
        emailTheme: row.email_theme || 'default',
        isMonitoring: row.is_monitoring === 1,
        lastCommitSha: row.last_commit_sha,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      callback(null, projects);
    }
  });
}

// 获取单个项目
function getProject(id, callback) {
  const query = 'SELECT * FROM projects WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      callback(err, null);
    } else if (!row) {
      callback(null, null);
    } else {
      const project = {
        id: row.id,
        repoUrl: row.repo_url,
        email: row.email,
        emailTheme: row.email_theme || 'default',
        isMonitoring: row.is_monitoring === 1,
        lastCommitSha: row.last_commit_sha,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
      callback(null, project);
    }
  });
}

// 添加项目
function addProject(repoUrl, email, emailTheme, callback) {
  const query = 'INSERT INTO projects (repo_url, email, email_theme) VALUES (?, ?, ?)';
  db.run(query, [repoUrl, email, emailTheme || 'default'], function(err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, this.lastID);
    }
  });
}

// 更新项目
function updateProject(id, repoUrl, email, emailTheme, callback) {
  const query = 'UPDATE projects SET repo_url = ?, email = ?, email_theme = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.run(query, [repoUrl, email, emailTheme || 'default', id], (err) => {
    callback(err);
  });
}

// 删除项目
function deleteProject(id, callback) {
  const query = 'DELETE FROM projects WHERE id = ?';
  db.run(query, [id], (err) => {
    callback(err);
  });
}

// 更新监控状态
function updateMonitoringStatus(id, isMonitoring, callback) {
  const query = 'UPDATE projects SET is_monitoring = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.run(query, [isMonitoring ? 1 : 0, id], (err) => {
    callback(err);
  });
}

// 更新最后提交SHA
function updateLastCommitSha(id, sha, callback) {
  const query = 'UPDATE projects SET last_commit_sha = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.run(query, [sha, id], (err) => {
    if (callback) callback(err);
  });
}

module.exports = {
  init,
  getAllProjects,
  getProject,
  addProject,
  updateProject,
  deleteProject,
  updateMonitoringStatus,
  updateLastCommitSha
};

