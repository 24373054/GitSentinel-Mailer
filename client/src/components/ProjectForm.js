import React, { useState, useEffect } from 'react';
import './ProjectForm.css';
import api from '../services/api';

function ProjectForm({ onSubmit, editingProject, onCancelEdit }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [email, setEmail] = useState('');
  const [emailTheme, setEmailTheme] = useState('default');
  const [themes, setThemes] = useState([]);

  // 加载邮件主题列表
  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const themeList = await api.getEmailThemes();
      setThemes(themeList);
    } catch (error) {
      console.error('加载主题失败:', error);
      // 使用默认主题列表
      setThemes([
        { value: 'default', label: '默认（蓝紫渐变）' },
        { value: 'yingzhouji', label: '瀛州纪（赛博史诗）' },
        { value: 'minimal', label: '简约黑白' },
        { value: 'warm', label: '温暖橙色' },
        { value: 'fresh', label: '清新绿色' }
      ]);
    }
  };

  // 当编辑项目时，填充表单
  useEffect(() => {
    if (editingProject) {
      setRepoUrl(editingProject.repoUrl);
      setEmail(editingProject.email);
      setEmailTheme(editingProject.emailTheme || 'default');
    } else {
      setRepoUrl('');
      setEmail('');
      setEmailTheme('default');
    }
  }, [editingProject]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // 验证表单
    if (!repoUrl.trim() || !email.trim()) {
      alert('请填写所有字段');
      return;
    }

    // 验证仓库地址格式
    const repoPattern = /^[\w-]+\/[\w.-]+$/;
    if (!repoPattern.test(repoUrl.trim())) {
      alert('仓库地址格式错误，应为: owner/repo\n例如: facebook/react');
      return;
    }

    // 验证邮箱格式
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      alert('邮箱格式错误');
      return;
    }

    // 提交数据
    if (editingProject) {
      onSubmit(editingProject.id, {
        repoUrl: repoUrl.trim(),
        email: email.trim(),
        emailTheme: emailTheme
      });
    } else {
      onSubmit({
        repoUrl: repoUrl.trim(),
        email: email.trim(),
        emailTheme: emailTheme
      });
    }

    // 清空表单
    if (!editingProject) {
      setRepoUrl('');
      setEmail('');
      setEmailTheme('default');
    }
  };

  const handleCancel = () => {
    setRepoUrl('');
    setEmail('');
    setEmailTheme('default');
    onCancelEdit();
  };

  return (
    <div className="project-form">
      <h2>{editingProject ? '✏️ 编辑项目' : '➕ 添加新项目'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="repoUrl">
            <span className="label-icon">📦</span>
            仓库地址
          </label>
          <input
            type="text"
            id="repoUrl"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="例如: facebook/react"
            required
          />
          <small>格式: owner/repo</small>
        </div>

        <div className="form-group">
          <label htmlFor="email">
            <span className="label-icon">📧</span>
            通知邮箱
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="emailTheme">
            <span className="label-icon">🎨</span>
            邮件主题
          </label>
          <select
            id="emailTheme"
            value={emailTheme}
            onChange={(e) => setEmailTheme(e.target.value)}
            className="theme-select"
          >
            {themes.map(theme => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
          <small>选择邮件通知的视觉风格</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingProject ? '💾 保存修改' : '➕ 添加项目'}
          </button>
          {editingProject && (
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              ❌ 取消
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProjectForm;

