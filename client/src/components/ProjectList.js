import React from 'react';
import './ProjectList.css';

function ProjectList({
  projects,
  loading,
  onEdit,
  onDelete,
  onStartMonitoring,
  onStopMonitoring
}) {
  const getThemeName = (theme) => {
    const themeNames = {
      'default': '🎨 默认',
      'yingzhouji': '⬡ 瀛州纪',
      'minimal': '⚪ 简约',
      'warm': '🟠 温暖',
      'fresh': '🟢 清新'
    };
    return themeNames[theme] || '🎨 默认';
  };
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>暂无项目</h3>
        <p>添加您的第一个GitHub项目开始监控</p>
      </div>
    );
  }

  return (
    <div className="project-list">
      <h2>📋 项目列表 ({projects.length})</h2>
      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <div className="project-info">
                <h3>
                  <a
                    href={`https://github.com/${project.repoUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="repo-link"
                  >
                    📦 {project.repoUrl}
                  </a>
                </h3>
                <p className="project-email">
                  📧 {project.email}
                </p>
              </div>
              <div className={`status-badge ${project.isMonitoring ? 'monitoring' : 'stopped'}`}>
                {project.isMonitoring ? '🟢 监控中' : '⚪ 已停止'}
              </div>
            </div>

            <div className="project-meta">
              {project.lastCommitSha && (
                <div className="commit-info">
                  <span className="label">最后提交:</span>
                  <code className="commit-sha">{project.lastCommitSha.substring(0, 7)}</code>
                </div>
              )}
              <div className="commit-info">
                <span className="label">邮件主题:</span>
                <span className="theme-badge">
                  {getThemeName(project.emailTheme)}
                </span>
              </div>
            </div>

            <div className="project-actions">
              <div className="action-group">
                {!project.isMonitoring ? (
                  <button
                    className="btn-action btn-start"
                    onClick={() => onStartMonitoring(project.id)}
                  >
                    ▶️ 启动监控
                  </button>
                ) : (
                  <button
                    className="btn-action btn-stop"
                    onClick={() => onStopMonitoring(project.id)}
                  >
                    ⏸️ 停止监控
                  </button>
                )}
              </div>

              <div className="action-group">
                <button
                  className="btn-action btn-edit"
                  onClick={() => onEdit(project)}
                  disabled={project.isMonitoring}
                  title={project.isMonitoring ? '请先停止监控' : '编辑项目'}
                >
                  ✏️ 编辑
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => onDelete(project.id)}
                  disabled={project.isMonitoring}
                  title={project.isMonitoring ? '请先停止监控' : '删除项目'}
                >
                  🗑️ 删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectList;

