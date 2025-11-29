// 简化版 API 密钥服务，解决 esbuild 解析错误
import { ApiKey, CreateApiKeyRequest, UpdateApiKeyRequest } from '../types/user';

export type { ApiKey, CreateApiKeyRequest, UpdateApiKeyRequest };

export class ApiKeyService {
  private baseUrl = '/api';

  async getApiKeys(): Promise<ApiKey[]> {
    const token = localStorage.getItem('ai-notes-token');
    if (!token) {
      throw new Error('未登录');
    }
    
    const response = await fetch(`${this.baseUrl}/api-keys`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('获取API密钥失败');
    }
    
    const text = await response.text();
    return text ? JSON.parse(text) : [];
  }

  async createApiKey(apiKeyData: CreateApiKeyRequest): Promise<ApiKey> {
    const token = localStorage.getItem('ai-notes-token');
    if (!token) {
      throw new Error('未登录');
    }
    
    const response = await fetch(`${this.baseUrl}/api-keys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiKeyData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '创建API密钥失败');
    }
    
    return response.json();
  }

  async updateApiKey(id: number, apiKeyData: UpdateApiKeyRequest): Promise<ApiKey> {
    const token = localStorage.getItem('ai-notes-token');
    if (!token) {
      throw new Error('未登录');
    }
    
    const response = await fetch(`${this.baseUrl}/api-keys/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiKeyData)
    });
    
    if (!response.ok) {
      throw new Error('更新API密钥失败');
    }
    
    return response.json();
  }

  async deleteApiKey(id: number): Promise<void> {
    const token = localStorage.getItem('ai-notes-token');
    if (!token) {
      throw new Error('未登录');
    }
    
    const response = await fetch(`${this.baseUrl}/api-keys/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('删除API密钥失败');
    }
  }
}

export const apiKeyService = new ApiKeyService();