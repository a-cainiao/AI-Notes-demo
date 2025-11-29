/**
 * 日志服务
 * 负责记录和管理 AI 处理的日志信息
 */

/**
 * 日志级别类型
 */
export type LogLevel = 'info' | 'error' | 'success';

/**
 * AI 处理日志接口
 */
export interface AILog {
  id: string;
  timestamp: number;
  level: LogLevel;
  request: {
    text: string;
    model: string;
    provider: string;
  };
  response: {
    content: string;
    duration: number;
  };
  error?: string;
}

import { authService } from './authService';

export class LogService {
  private baseUrl = '/api';

  /**
   * 获取所有日志
   */
  async getLogs(): Promise<AILog[]> {
    const token = authService.getToken();
    if (!token) {
      return [];
    }
    
    const response = await fetch(`${this.baseUrl}/logs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch logs');
    }
    
    // 检查响应体是否为空
    const text = await response.text();
    if (!text) {
      return [];
    }
    
    const logs = JSON.parse(text);
    // 转换日期格式并添加timestamp字段以保持兼容性
    return logs.map((log: any) => ({
      ...log,
      timestamp: new Date(log.createdAt).getTime()
    }));
  }

  /**
   * 记录 AI 处理日志
   * @param log 日志信息
   */
  async log(log: Omit<AILog, 'id' | 'timestamp'>): Promise<AILog> {
    const token = authService.getToken();
    if (!token) {
      // 未登录时，返回模拟日志，不发送到后端
      return {
        ...log,
        id: Date.now().toString(),
        timestamp: Date.now()
      };
    }
    
    const response = await fetch(`${this.baseUrl}/logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(log)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create log');
    }
    
    const createdLog = await response.json();
    return {
      ...createdLog,
      timestamp: new Date(createdLog.createdAt).getTime()
    };
  }

  /**
   * 删除指定日志
   * @param logId 日志 ID
   */
  async deleteLog(logId: string): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      return;
    }
    
    const response = await fetch(`${this.baseUrl}/logs/${logId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete log');
    }
  }

  /**
   * 清除所有日志
   */
  async clearLogs(): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      return;
    }
    
    const response = await fetch(`${this.baseUrl}/logs`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear logs');
    }
  }
}

// 导出单例实例
export const logService = new LogService();
