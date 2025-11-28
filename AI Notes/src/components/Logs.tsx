/**
 * 日志组件
 * 显示和管理 AI 处理日志
 */

import React, { useState } from 'react';
import { logService, AILog } from '../services/logService';
import './Logs.css';

interface LogsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Logs: React.FC<LogsProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AILog[]>(logService.getLogs());
  const [selectedLog, setSelectedLog] = useState<AILog | null>(null);

  /**
   * 刷新日志列表
   */
  const refreshLogs = () => {
    setLogs(logService.getLogs());
  };

  /**
   * 删除指定日志
   */
  const handleDeleteLog = (logId: string) => {
    logService.deleteLog(logId);
    refreshLogs();
    if (selectedLog?.id === logId) {
      setSelectedLog(null);
    }
  };

  /**
   * 清除所有日志
   */
  const handleClearLogs = () => {
    if (window.confirm('确定要清除所有日志吗？此操作不可恢复。')) {
      logService.clearLogs();
      refreshLogs();
      setSelectedLog(null);
    }
  };

  /**
   * 格式化时间戳
   */
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  /**
   * 格式化时长
   */
  const formatDuration = (duration: number): string => {
    if (duration < 1000) {
      return `${duration}ms`;
    }
    return `${(duration / 1000).toFixed(2)}s`;
  };

  return (
    <div className="logs-container" style={{ display: isOpen ? 'flex' : 'none' }}>
      <div className="logs-header">
        <h2>AI 处理日志</h2>
        <div className="logs-header-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleClearLogs}
            disabled={logs.length === 0}
          >
            清除所有日志
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>

      <div className="logs-content">
        {logs.length === 0 ? (
          <div className="logs-empty">
            <p>暂无日志记录</p>
          </div>
        ) : (
          <div className="logs-list">
            <div className="logs-list-header">
              <span className="log-column-time">时间</span>
              <span className="log-column-status">状态</span>
              <span className="log-column-model">模型</span>
              <span className="log-column-duration">时长</span>
              <span className="log-column-actions">操作</span>
            </div>
            {logs.map(log => (
              <div 
                key={log.id} 
                className={`log-item ${log.level} ${selectedLog?.id === log.id ? 'selected' : ''}`}
                onClick={() => setSelectedLog(log)}
              >
                <span className="log-column-time">{formatTimestamp(log.timestamp)}</span>
                <span className={`log-column-status status-${log.level}`}>
                  {log.level === 'success' ? '成功' : log.level === 'error' ? '失败' : '信息'}
                </span>
                <span className="log-column-model">{log.request.model}</span>
                <span className="log-column-duration">{formatDuration(log.response.duration)}</span>
                <span className="log-column-actions">
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLog(log.id);
                    }}
                  >
                    删除
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedLog && (
        <div className="log-detail">
          <h3>日志详情</h3>
          <div className="log-detail-content">
            <div className="log-detail-section">
              <h4>请求信息</h4>
              <div className="log-detail-item">
                <label>文本内容：</label>
                <pre>{selectedLog.request.text}</pre>
              </div>
              <div className="log-detail-item">
                <label>模型：</label>
                <span>{selectedLog.request.model}</span>
              </div>
              <div className="log-detail-item">
                <label>提供商：</label>
                <span>{selectedLog.request.provider}</span>
              </div>
            </div>

            <div className="log-detail-section">
              <h4>响应信息</h4>
              <div className="log-detail-item">
                <label>生成内容：</label>
                <pre>{selectedLog.response.content}</pre>
              </div>
              <div className="log-detail-item">
                <label>处理时长：</label>
                <span>{formatDuration(selectedLog.response.duration)}</span>
              </div>
            </div>

            {selectedLog.error && (
              <div className="log-detail-section error">
                <h4>错误信息</h4>
                <div className="log-detail-item">
                  <pre>{selectedLog.error}</pre>
                </div>
              </div>
            )}
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => setSelectedLog(null)}
          >
            关闭详情
          </button>
        </div>
      )}
    </div>
  );
};

export default Logs;
