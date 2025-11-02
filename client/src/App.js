import React, { useState, useEffect } from 'react';
import './App.css';
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import MonitorSettings from './components/MonitorSettings';
import api from './services/api';

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);

  // 加载项目列表
  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      alert('加载项目列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadProjects();
  }, []);

  // 添加项目
  const handleAddProject = async (projectData) => {
    try {
      await api.addProject(projectData);
      await loadProjects();
      alert('项目添加成功！');
    } catch (error) {
      alert('添加项目失败: ' + error.message);
    }
  };

  // 更新项目
  const handleUpdateProject = async (id, projectData) => {
    try {
      await api.updateProject(id, projectData);
      await loadProjects();
      setEditingProject(null);
      alert('项目更新成功！');
    } catch (error) {
      alert('更新项目失败: ' + error.message);
    }
  };

  // 删除项目
  const handleDeleteProject = async (id) => {
    if (!window.confirm('确定要删除这个项目吗？')) {
      return;
    }
    
    try {
      await api.deleteProject(id);
      await loadProjects();
      alert('项目删除成功！');
    } catch (error) {
      alert('删除项目失败: ' + error.message);
    }
  };

  // 启动监控
  const handleStartMonitoring = async (id) => {
    try {
      await api.startMonitoring(id);
      await loadProjects();
      alert('监控已启动！');
    } catch (error) {
      alert('启动监控失败: ' + error.message);
    }
  };

  // 停止监控
  const handleStopMonitoring = async (id) => {
    try {
      await api.stopMonitoring(id);
      await loadProjects();
      alert('监控已停止！');
    } catch (error) {
      alert('停止监控失败: ' + error.message);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🔍 GitHub仓库监控系统</h1>
          <p>实时监控GitHub仓库变更，自动发送邮件通知</p>
        </header>

        <div className="settings-section">
          <MonitorSettings />
        </div>

        <div className="main-content">
          <div className="form-section">
            <ProjectForm
              onSubmit={editingProject ? handleUpdateProject : handleAddProject}
              editingProject={editingProject}
              onCancelEdit={() => setEditingProject(null)}
            />
          </div>

          <div className="list-section">
            <ProjectList
              projects={projects}
              loading={loading}
              onEdit={setEditingProject}
              onDelete={handleDeleteProject}
              onStartMonitoring={handleStartMonitoring}
              onStopMonitoring={handleStopMonitoring}
            />
          </div>
        </div>

        <footer className="footer">
          <p>💡 提示：仓库地址格式为 owner/repo (例如: facebook/react)</p>
          <p>⏱️ 监控间隔：5分钟检查一次</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

