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

export class LogService {
  private logs: AILog[] = [];
  private readonly STORAGE_KEY = 'ai-notes-logs';

  constructor() {
    this.loadLogs();
  }

  /**
   * 从本地存储加载日志
   */
  private loadLogs(): void {
    try {
      const storedLogs = localStorage.getItem(this.STORAGE_KEY);
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
      this.logs = [];
    }
  }

  /**
   * 保存日志到本地存储
   */
  private saveLogs(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save logs:', error);
    }
  }

  /**
   * 记录 AI 处理日志
   * @param log 日志信息
   */
  log(log: Omit<AILog, 'id' | 'timestamp'>): void {
    const newLog: AILog = {
      ...log,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };

    this.logs.unshift(newLog);
    
    // 只保留最近 100 条日志
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }

    this.saveLogs();
  }

  /**
   * 获取所有日志
   */
  getLogs(): AILog[] {
    return [...this.logs];
  }

  /**
   * 清除所有日志
   */
  clearLogs(): void {
    this.logs = [];
    this.saveLogs();
  }

  /**
   * 删除指定日志
   * @param logId 日志 ID
   */
  deleteLog(logId: string): void {
    this.logs = this.logs.filter(log => log.id !== logId);
    this.saveLogs();
  }
}

// 导出单例实例
export const logService = new LogService();
