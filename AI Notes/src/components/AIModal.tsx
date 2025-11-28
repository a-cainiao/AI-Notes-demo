import React from 'react';

interface AIModalProps {
  /** 是否显示悬浮框 */
  isOpen: boolean;
  /** AI 处理的结果文本 */
  aiResult: string;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 接受 AI 结果的回调函数 */
  onAccept: () => void;
  /** 丢弃 AI 结果的回调函数 */
  onDiscard: () => void;
  /** 关闭悬浮框的回调函数 */
  onClose: () => void;
}

/**
 * AI 悬浮框组件
 * 显示 AI 处理结果，支持流式响应和接受/丢弃操作
 */
const AIModal: React.FC<AIModalProps> = ({
  isOpen,
  aiResult,
  isLoading,
  onAccept,
  onDiscard,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">AI 处理结果</h3>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {isLoading && <div className="loading">AI 正在处理中...</div>}
          {aiResult || <div style={{ color: '#666', fontStyle: 'italic' }}>暂无结果</div>}
        </div>
        <div className="modal-footer">
          <button 
            className="modal-btn modal-btn-secondary" 
            onClick={onDiscard}
            disabled={isLoading}
          >
            丢弃
          </button>
          <button 
            className="modal-btn modal-btn-primary" 
            onClick={onAccept}
            disabled={isLoading || !aiResult}
          >
            接受
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIModal;