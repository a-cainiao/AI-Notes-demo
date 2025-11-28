import React, { useState, useEffect } from 'react';
import { aiService, ModelProvider } from '../services/aiService';

interface ApiKeyModalProps {
  /** 是否显示 API Key 设置弹窗 */
  isOpen: boolean;
  /** 关闭弹窗的回调函数 */
  onClose: () => void;
  /** API Key 设置完成的回调函数 */
  onApiKeySet: () => void;
  /** API Key 删除完成的回调函数 */
  onApiKeyDeleted?: () => void;
}

/**
 * API Key 设置组件
 * 允许用户输入和保存 AI API Key，并选择模型提供商
 */
const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onApiKeySet, onApiKeyDeleted }) => {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<ModelProvider>('openai');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // 当弹窗打开时，获取已保存的 API Key 和模型提供商
  useEffect(() => {
    if (isOpen) {
      const savedApiKey = aiService.getApiKey() || '';
      const savedProvider = aiService.getProvider();
      setApiKey(savedApiKey);
      setProvider(savedProvider);
      setError('');
      setShowApiKey(false);
    }
  }, [isOpen]);

  /**
   * 删除 API Key
   */
  const handleDeleteApiKey = () => {
    if (window.confirm('确定要删除当前的 API Key 吗？')) {
      setIsDeleting(true);
      setError('');

      try {
        aiService.deleteApiKey();
        setApiKey('');
        if (onApiKeyDeleted) {
          onApiKeyDeleted();
        }
        onClose();
      } catch (err) {
        setError('删除 API Key 失败');
        console.error('Failed to delete API Key:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  /**
   * 格式化显示 API Key（隐藏中间部分）
   */
  const formatApiKeyDisplay = (key: string): string => {
    if (!key) return '';
    if (key.length <= 10) return key;
    return `${key.slice(0, 5)}...${key.slice(-5)}`;
  };

  if (!isOpen) return null;

  /**
   * 保存 API Key 和模型提供商
   */
  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      setError('请输入有效的 API Key');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      aiService.setProvider(provider);
      aiService.setApiKey(apiKey.trim());
      onApiKeySet();
      onClose();
    } catch (err) {
      setError('保存 API Key 失败');
      console.error('Failed to save API Key:', err);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 获取 API Key 输入提示文本
   */
  const getApiKeyPlaceholder = (): string => {
    return provider === 'openai' ? 'sk-...' : '阿里云 API Key';
  };

  /**
   * 获取 API Key 说明文本
   */
  const getApiKeyDescription = (): string => {
    if (provider === 'openai') {
      return '请输入您的 OpenAI API Key，用于 AI 笔记处理功能。';
    } else {
      return '请输入您的阿里云 API Key，用于 AI 笔记处理功能。';
    }
  };

  const hasApiKey = !!aiService.getApiKey();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">设置 API Key</h3>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            disabled={isSaving || isDeleting}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
            {getApiKeyDescription()}
          </p>
          
          {/* 当前 API Key 状态 */}
          {hasApiKey && (
            <div style={{ 
              marginBottom: '16px', 
              padding: '12px', 
              backgroundColor: '#f0f8ff', 
              borderRadius: '4px',
              border: '1px solid #cce7ff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#0066cc' }}>
                  当前 API Key
                </span>
                <button 
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0066cc',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {showApiKey ? '隐藏' : '显示'}
                </button>
              </div>
              <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                {showApiKey ? apiKey : formatApiKeyDisplay(apiKey)}
              </div>
            </div>
          )}
          
          {error && (
            <div style={{ 
              color: '#dc3545', 
              fontSize: '14px', 
              marginBottom: '16px',
              padding: '8px',
              backgroundColor: '#f8d7da',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 模型提供商选择 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="provider-select" style={{ fontSize: '14px', fontWeight: 500 }}>
                模型提供商
              </label>
              <select
                id="provider-select"
                value={provider}
                onChange={(e) => setProvider(e.target.value as ModelProvider)}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                disabled={isSaving || isDeleting}
              >
                <option value="openai">OpenAI</option>
                <option value="aliyun">阿里云</option>
              </select>
            </div>

            {/* API Key 输入 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="api-key-input" style={{ fontSize: '14px', fontWeight: 500 }}>
                API Key
              </label>
              <input
                type={showApiKey ? 'text' : 'password'}
                id="api-key-input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={getApiKeyPlaceholder()}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                disabled={isSaving || isDeleting}
              />
              <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                您的 API Key 将安全地存储在浏览器本地存储中，不会被发送到任何第三方服务器。
              </p>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          {hasApiKey && (
            <button 
              className="modal-btn modal-btn-secondary" 
              onClick={handleDeleteApiKey}
              disabled={isSaving || isDeleting}
              style={{ backgroundColor: '#dc3545', marginRight: 'auto' }}
            >
              {isDeleting ? '删除中...' : '删除'}
            </button>
          )}
          <button 
            className="modal-btn modal-btn-secondary" 
            onClick={onClose}
            disabled={isSaving || isDeleting}
          >
            取消
          </button>
          <button 
            className="modal-btn modal-btn-primary" 
            onClick={handleSaveApiKey}
            disabled={isSaving || isDeleting}
          >
            {isSaving ? '保存中...' : hasApiKey ? '更新' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;