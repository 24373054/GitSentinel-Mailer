import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  // 获取所有项目
  async getProjects() {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || '获取项目列表失败');
    }
  },

  // 添加项目
  async addProject(projectData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects`, projectData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || '添加项目失败');
    }
  },

  // 更新项目
  async updateProject(id, projectData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || '更新项目失败');
    }
  },

  // 删除项目
  async deleteProject(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/projects/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || '删除项目失败');
    }
  },

  // 启动监控
  async startMonitoring(id) {
    try {
      const response = await axios.post(`${API_BASE_URL}/monitor/start/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || '启动监控失败');
    }
  },

  // 停止监控
  async stopMonitoring(id) {
    try {
      const response = await axios.post(`${API_BASE_URL}/monitor/stop/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || '停止监控失败');
    }
  },

  // 获取监控状态
  async getMonitoringStatus() {
    try {
      const response = await axios.get(`${API_BASE_URL}/monitor/status`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || '获取监控状态失败');
    }
  },

  // 获取监控间隔
  async getMonitorInterval() {
    try {
      const response = await axios.get(`${API_BASE_URL}/monitor/interval`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || '获取监控间隔失败');
    }
  },

  // 设置监控间隔
  async setMonitorInterval(seconds) {
    try {
      const response = await axios.post(`${API_BASE_URL}/monitor/interval`, { seconds });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || '设置监控间隔失败');
    }
  },

  // 获取邮件主题列表
  async getEmailThemes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/email/themes`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || '获取邮件主题失败');
    }
  }
};

export default api;

