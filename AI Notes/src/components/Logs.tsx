/**
 * 日志组件
 * 显示和管理 AI 处理日志
 */

import React, { useState, useEffect } from 'react';
import { logService, AILog } from '../services/logService';
import './Logs.css';

interface LogsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Logs: React.FC<LogsProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AILog | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10; // 固定每页10条，不需要动态设置
  const [totalLogs, setTotalLogs] = useState<number>(0);

  /**
   * 刷新日志列表（支持分页）
   */
  const refreshLogs = async (page: number = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const result = await logService.getLogs(page, pageSize);
      setLogs(result.logs);
      setTotalLogs(result.total);
      setCurrentPage(result.page);
    } catch (err) {
      setError('获取日志失败');
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 组件挂载或打开时刷新日志
   */
  useEffect(() => {
    if (isOpen) {
      refreshLogs();
    }
  }, [isOpen]);

  /**
   * 删除指定日志
   */
  const handleDeleteLog = async (logId: string) => {
    try {
      await logService.deleteLog(logId);
      // 直接从本地状态中移除该日志，避免重新加载所有日志
      setLogs(logs.filter(log => log.id !== logId));
      if (selectedLog?.id === logId) {
        setSelectedLog(null);
      }
    } catch (err) {
      setError('删除日志失败');
      console.error('Failed to delete log:', err);
      // 出错时刷新日志列表，确保数据一致性
      refreshLogs();
    }
  };

  /**
   * 清除所有日志
   */
  const handleClearLogs = async () => {
    if (window.confirm('确定要清除所有日志吗？此操作不可恢复。')) {
      try {
        await logService.clearLogs();
        // 清除所有日志后，重置到第一页
        setLogs([]);
        setTotalLogs(0);
        setCurrentPage(1);
        setSelectedLog(null);
      } catch (err) {
        setError('清除日志失败');
        console.error('Failed to clear logs:', err);
        // 出错时刷新日志列表，确保数据一致性
        refreshLogs(1);
      }
    }
  };

  /**
   * 计算总页数
   */
  const totalPages = Math.ceil(totalLogs / pageSize);

  /**
   * 切换到上一页
   */
  const handlePrevPage = () => {
    if (currentPage > 1) {
      refreshLogs(currentPage - 1);
      setSelectedLog(null);
    }
  };

  /**
   * 切换到下一页
   */
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      refreshLogs(currentPage + 1);
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
    isOpen && (
      <div className="modal-overlay">
        <div className="logs-container">
          <div className="logs-header">
            <h2>AI 处理日志</h2>
            <div className="logs-header-actions">
              <button 
                className="btn btn-secondary" 
                onClick={handleClearLogs}
                disabled={logs.length === 0 || loading}
              >
                清除所有日志
              </button>
              <button 
                className="btn btn-primary" 
                onClick={onClose}
              >
                关闭详情
              </button>
            </div>
          </div>

          <div className="logs-content">
            {error && (
              <div className="logs-error">
                <p>{error}</p>
                <button className="btn btn-sm" onClick={() => refreshLogs()}>重试</button>
              </div>
            )}
            
            {loading ? (
              <div className="logs-loading">
                <p>加载日志中...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="logs-empty">
                <p>暂无日志记录</p>
              </div>
            ) : (
              <>
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
                          disabled={loading}
                        >
                          删除
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* 分页控件 */}
                <div className="logs-pagination">
                  <div className="pagination-info">
                    <span>共 {totalLogs} 条记录</span>
                  </div>
                  <div className="pagination-controls">
                    <button 
                      className="btn btn-sm" 
                      onClick={handlePrevPage}
                      disabled={loading || currentPage === 1}
                    >
                      上一页
                    </button>
                    <span className="pagination-current">
                      第 {currentPage} / {totalPages} 页
                    </span>
                    <button 
                      className="btn btn-sm" 
                      onClick={handleNextPage}
                      disabled={loading || currentPage === totalPages}
                    >
                      下一页
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {selectedLog && (
          <div className="log-detail">
            <div className="log-detail-header">
              <h3>日志详情</h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedLog(null)}
              >
                关闭详情
              </button>
            </div>
            <div className="log-detail-content-scrollable">
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
            </div>
          </div>
        )}
        </div>
      </div>
    )
  );
};

export default Logs;
