/**
 * API密钥管理组件
 * 允许用户管理多个模型提供商的API密钥
 */

import React, { useState, useEffect } from 'react';
import { apiKeyService, ApiKey, CreateApiKeyRequest } from '../services/apiKeyService';

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ isOpen, onClose }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingApiKey, setEditingApiKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState<CreateApiKeyRequest>({
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    apiKey: ''
  });

  /**
   * 获取所有API密钥
   */
  const fetchApiKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const keys = await apiKeyService.getApiKeys();
      setApiKeys(keys);
    } catch (err) {
      setError('获取API密钥失败');
      console.error('Failed to fetch API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 组件挂载或打开时获取API密钥
   */
  useEffect(() => {
    if (isOpen) {
      fetchApiKeys();
    }
  }, [isOpen]);

  /**
   * 处理表单输入变化
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * 重置表单
   */
  const resetForm = () => {
    setFormData({
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      apiKey: ''
    });
    setEditingApiKey(null);
    setShowAddForm(false);
  };

  /**
   * 保存API密钥
   */
  const handleSaveApiKey = async () => {
    if (!formData.apiKey.trim()) {
      setError('请输入有效的API密钥');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (editingApiKey) {
        // 更新现有API密钥
        await apiKeyService.updateApiKey(editingApiKey.id, { apiKey: formData.apiKey });
      } else {
        // 创建新API密钥
        await apiKeyService.createApiKey(formData);
      }
      await fetchApiKeys();
      resetForm();
    } catch (err: any) {
      setError(err.message || '保存API密钥失败');
      console.error('Failed to save API key:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 编辑API密钥
   */
  const handleEditApiKey = (apiKey: ApiKey) => {
    setEditingApiKey(apiKey);
    setFormData({
      provider: apiKey.provider,
      model: apiKey.model,
      apiKey: apiKey.apiKey
    });
    setShowAddForm(true);
  };

  /**
   * 删除API密钥
   */
  const handleDeleteApiKey = async (id: number) => {
    if (window.confirm('确定要删除此API密钥吗？')) {
      setLoading(true);
      setError(null);
      try {
        await apiKeyService.deleteApiKey(id);
        await fetchApiKeys();
      } catch (err) {
        setError('删除API密钥失败');
        console.error('Failed to delete API key:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * 格式化显示API密钥（隐藏中间部分）
   */
  const formatApiKeyDisplay = (key: string): string => {
    if (!key) return '';
    if (key.length <= 10) return key;
    return `${key.slice(0, 5)}...${key.slice(-5)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">API密钥管理</h3>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
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

          {/* 添加/编辑表单 */}
          {showAddForm && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ marginBottom: '16px', fontSize: '16px' }}>
                {editingApiKey ? '编辑API密钥' : '添加API密钥'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 提供商选择 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="provider" style={{ fontSize: '14px', fontWeight: 500 }}>
                    模型提供商
                  </label>
                  <select
                    id="provider"
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    disabled={!!editingApiKey || loading}
                    style={{
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="openai">OpenAI</option>
                    <option value="aliyun">阿里云</option>
                   
                  </select>
                </div>

                {/* 模型选择 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="model" style={{ fontSize: '14px', fontWeight: 500 }}>
                    模型名称
                  </label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="例如: qwen-turbo"
                    disabled={!!editingApiKey || loading}
                    style={{
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* API密钥输入 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="apiKey" style={{ fontSize: '14px', fontWeight: 500 }}>
                    API密钥
                  </label>
                  <input
                    type="text"
                    id="apiKey"
                    name="apiKey"
                    value={formData.apiKey}
                    onChange={handleInputChange}
                    placeholder="请输入API密钥"
                    disabled={loading}
                    style={{
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      outline: 'none',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                {/* 表单操作按钮 */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    className="modal-btn modal-btn-secondary"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    取消
                  </button>
                  <button
                    className="modal-btn modal-btn-primary"
                    onClick={handleSaveApiKey}
                    disabled={loading}
                  >
                    {loading ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* API密钥列表 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '16px' }}>已配置的API密钥</h4>
              <button
                className="modal-btn modal-btn-primary"
                onClick={() => setShowAddForm(true)}
                disabled={loading}
              >
                添加API密钥
              </button>
            </div>

            {loading && !showAddForm ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
                加载中...
              </div>
            ) : apiKeys.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
                暂无API密钥配置
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: '#f8f9fa',
                      borderBottom: '2px solid #dee2e6'
                    }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>提供商</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>模型</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>API密钥</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>创建时间</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map(apiKey => (
                      <tr key={apiKey.id} style={{
                        borderBottom: '1px solid #dee2e6',
                        transition: 'background-color 0.2s'
                      }}>
                        <td style={{ padding: '12px' }}>{apiKey.provider}</td>
                        <td style={{ padding: '12px' }}>{apiKey.model}</td>
                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                          {formatApiKeyDisplay(apiKey.apiKey)}
                        </td>
                        <td style={{ padding: '12px', color: '#666' }}>
                          {new Date(apiKey.createdAt).toLocaleString('zh-CN')}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="modal-btn modal-btn-sm modal-btn-secondary"
                              onClick={() => handleEditApiKey(apiKey)}
                              disabled={loading}
                            >
                              编辑
                            </button>
                            <button
                              className="modal-btn modal-btn-sm"
                              onClick={() => handleDeleteApiKey(apiKey.id)}
                              disabled={loading}
                              style={{ backgroundColor: '#dc3545', color: 'white' }}
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="modal-btn modal-btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;
