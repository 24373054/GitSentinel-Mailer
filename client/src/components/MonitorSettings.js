import React, { useState, useEffect } from 'react';
import './MonitorSettings.css';
import api from '../services/api';

function MonitorSettings() {
  const [interval, setInterval] = useState(10);
  const [currentInterval, setCurrentInterval] = useState(10);
  const [intervalInfo, setIntervalInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // 加载当前监控间隔
  useEffect(() => {
    loadIntervalInfo();
  }, []);

  const loadIntervalInfo = async () => {
    try {
      const info = await api.getMonitorInterval();
      setCurrentInterval(info.seconds);
      setInterval(info.seconds);
      setIntervalInfo(info);
    } catch (error) {
      console.error('加载监控间隔失败:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (interval < 5) {
      alert('监控间隔不能少于5秒');
      return;
    }

    if (interval > 3600) {
      alert('监控间隔不能超过1小时（3600秒）');
      return;
    }

    try {
      setLoading(true);
      const result = await api.setMonitorInterval(interval);
      setCurrentInterval(interval);
      await loadIntervalInfo();
      
      if (result.restartedProjects > 0) {
        alert(`监控间隔已更新！\n${result.restartedProjects} 个监控项目已重启应用新间隔。`);
      } else {
        alert('监控间隔已更新！');
      }
    } catch (error) {
      alert('更新监控间隔失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (seconds) => {
    setInterval(seconds);
  };

  // 计算每小时请求数
  const getRequestsPerHour = () => {
    if (!intervalInfo) return 0;
    return Math.floor(3600 / interval) * intervalInfo.activeProjects;
  };

  // 判断是否安全
  const isSafe = () => {
    if (!intervalInfo) return true;
    const requestsPerHour = getRequestsPerHour();
    return requestsPerHour < intervalInfo.rateLimit * 0.8;
  };

  return (
    <div className="monitor-settings">
      <div className="settings-header">
        <h2>⚙️ 监控间隔设置</h2>
        <div className="current-info">
          当前间隔：<span className="highlight">{currentInterval}秒</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="interval">监控间隔（秒）</label>
          <input
            type="number"
            id="interval"
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value) || 5)}
            min="5"
            max="3600"
            step="1"
            disabled={loading}
          />
        </div>

        <div className="preset-buttons">
          <button type="button" onClick={() => setPreset(5)} className="btn-preset">
            5秒
          </button>
          <button type="button" onClick={() => setPreset(10)} className="btn-preset">
            10秒
          </button>
          <button type="button" onClick={() => setPreset(30)} className="btn-preset">
            30秒
          </button>
          <button type="button" onClick={() => setPreset(60)} className="btn-preset">
            1分钟
          </button>
          <button type="button" onClick={() => setPreset(300)} className="btn-preset">
            5分钟
          </button>
          <button type="button" onClick={() => setPreset(600)} className="btn-preset">
            10分钟
          </button>
        </div>

        <button type="submit" className="btn-update" disabled={loading}>
          {loading ? '更新中...' : '💾 应用设置'}
        </button>
      </form>

      {intervalInfo && (
        <div className="info-panel">
          <div className="info-section">
            <h3>📊 当前状态</h3>
            <div className="info-item">
              <span className="label">GitHub Token:</span>
              <span className={`value ${intervalInfo.hasToken ? 'success' : 'warning'}`}>
                {intervalInfo.hasToken ? '✅ 已配置' : '⚠️ 未配置'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">速率限制:</span>
              <span className="value">{intervalInfo.rateLimit}次/小时</span>
            </div>
            <div className="info-item">
              <span className="label">监控项目:</span>
              <span className="value">{intervalInfo.activeProjects}个</span>
            </div>
            <div className="info-item">
              <span className="label">推荐最小间隔:</span>
              <span className="value">{intervalInfo.recommendedMin}秒</span>
            </div>
          </div>

          <div className="info-section">
            <h3>📈 预计使用量</h3>
            <div className="info-item">
              <span className="label">每小时请求数:</span>
              <span className={`value ${isSafe() ? 'success' : 'danger'}`}>
                {getRequestsPerHour()}次
                {!isSafe() && ' ⚠️ 超出限制'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">安全余量:</span>
              <span className={`value ${isSafe() ? 'success' : 'danger'}`}>
                {intervalInfo.rateLimit - getRequestsPerHour()}次
              </span>
            </div>
          </div>

          <div className="tips">
            <h4>💡 使用建议</h4>
            <ul>
              {!intervalInfo.hasToken && (
                <li className="warning">⚠️ 未配置GitHub Token，速率限制为60次/小时，建议间隔≥60秒</li>
              )}
              {intervalInfo.hasToken && interval < 10 && (
                <li className="info">⚡ 间隔小于10秒，适合需要快速响应的场景</li>
              )}
              {getRequestsPerHour() > intervalInfo.rateLimit * 0.8 && (
                <li className="warning">⚠️ 预计使用量接近限制，建议增加间隔时间</li>
              )}
              {getRequestsPerHour() > intervalInfo.rateLimit && (
                <li className="danger">❌ 预计使用量超出限制！请立即增加间隔时间！</li>
              )}
              {isSafe() && intervalInfo.hasToken && (
                <li className="success">✅ 当前设置安全，使用量在合理范围内</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonitorSettings;
