import { LogService, LogLevel } from '../logService';

// 模拟fetch API
global.fetch = jest.fn();

// 模拟authService模块
jest.mock('../authService', () => ({
  authService: {
    getToken: jest.fn().mockReturnValue('test-token'),
    isLoggedIn: jest.fn().mockReturnValue(true),
    getUser: jest.fn().mockReturnValue(null),
    saveAuthData: jest.fn(),
    clearAuthData: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

// 导入被模拟的authService
import { authService } from '../authService';

describe('LogService', () => {
  let logService: LogService;
  
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
    
    // 确保 authService.getToken 返回 test-token
    (authService.getToken as jest.Mock).mockReturnValue('test-token');
    
    // 创建新的LogService实例
    logService = new LogService();
  });
  
  describe('getLogs', () => {
    it('should return empty logs when no token is available', async () => {
      // 模拟authService.getToken返回null
      (authService.getToken as jest.Mock).mockReturnValue(null);
      
      const result = await logService.getLogs();
      
      expect(result).toEqual({ logs: [], total: 0, page: 1, pageSize: 10 });
    });
    
    it('should fetch logs with token', async () => {
      const mockLogs = [{
        id: '1',
        createdAt: '2023-01-01T00:00:00.000Z',
        timestamp: 1672531200000,
        level: 'success',
        request: {
          text: 'test text',
          model: 'test-model',
          provider: 'test-provider'
        },
        response: {
          content: 'test response',
          duration: 1000
        }
      }];
      
      const mockResponse = {
        logs: mockLogs,
        total: 1,
        page: 1,
        pageSize: 10
      };
      
      // 模拟fetch成功返回，同时提供text和json方法
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse)),
        json: jest.fn().mockResolvedValue(mockResponse)
      });
      
      const result = await logService.getLogs();
      
      expect(global.fetch).toHaveBeenCalledWith('/api/logs?page=1&pageSize=10', {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
      expect(result).toEqual({
        logs: mockLogs.map(log => ({
          ...log,
          timestamp: new Date(log.createdAt).getTime()
        })),
        total: 1,
        page: 1,
        pageSize: 10
      });
    });
    
    it('should handle fetch error', async () => {
      // 模拟fetch失败返回
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue('')
      });
      
      await expect(logService.getLogs()).rejects.toThrow('Failed to fetch logs');
    });
    
    it('should return empty logs when response is empty', async () => {
      // 模拟fetch返回空响应
      const mockResponse = { logs: [], total: 0, page: 1, pageSize: 10 };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse)),
        json: jest.fn().mockResolvedValue(mockResponse)
      });
      
      const result = await logService.getLogs();
      
      expect(result.logs).toEqual([]);
      expect(result.total).toBe(0);
    });
    
    it('should use custom page and pageSize', async () => {
      // 模拟fetch成功返回
      const mockResponse = { logs: [], total: 0, page: 2, pageSize: 20 };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse)),
        json: jest.fn().mockResolvedValue(mockResponse)
      });
      
      const result = await logService.getLogs(2, 20);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/logs?page=2&pageSize=20', expect.any(Object));
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(20);
    });
  });
  
  describe('log', () => {
    it('should return mock log when no token is available', async () => {
      // 模拟authService.getToken返回null
      (authService.getToken as jest.Mock).mockReturnValue(null);
      
      const logData = {
        level: 'success' as LogLevel,
        request: {
          text: 'test text',
          model: 'test-model',
          provider: 'test-provider'
        },
        response: {
          content: 'test response',
          duration: 1000
        }
      };
      
      const result = await logService.log(logData);
      
      expect(result).toEqual({
        ...logData,
        id: expect.any(String),
        timestamp: expect.any(Number)
      });
      expect(global.fetch).not.toHaveBeenCalled();
    });
    
    it('should send log to server when token is available', async () => {
      const logData = {
        level: 'success' as LogLevel,
        request: {
          text: 'test text',
          model: 'test-model',
          provider: 'test-provider'
        },
        response: {
          content: 'test response',
          duration: 1000
        }
      };
      
      const mockResponse = {
        id: '1',
        createdAt: '2023-01-01T00:00:00.000Z',
        ...logData
      };
      
      // 模拟fetch成功返回
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
        text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse))
      });
      
      const result = await logService.log(logData);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/logs', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      });
      expect(result).toEqual({
        ...mockResponse,
        timestamp: new Date(mockResponse.createdAt).getTime()
      });
    });
    
    it('should throw error when log fails', async () => {
      const logData = {
        level: 'success' as LogLevel,
        request: {
          text: 'test text',
          model: 'test-model',
          provider: 'test-provider'
        },
        response: {
          content: 'test response',
          duration: 1000
        }
      };
      
      // 模拟fetch失败返回
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue('')
      });
      
      await expect(logService.log(logData)).rejects.toThrow('Failed to create log');
    });
    
    it('should handle error logs', async () => {
      const logData = {
        level: 'error' as LogLevel,
        request: {
          text: 'test text',
          model: 'test-model',
          provider: 'test-provider'
        },
        response: {
          content: 'test response',
          duration: 1000
        },
        error: 'test error'
      };
      
      const mockResponse = {
        id: '1',
        createdAt: '2023-01-01T00:00:00.000Z',
        ...logData
      };
      
      // 模拟fetch成功返回
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
        text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse))
      });
      
      const result = await logService.log(logData);
      
      expect(result.error).toBe('test error');
    });
  });
  
  describe('deleteLog', () => {
    it('should return without action when no token is available', async () => {
      // 模拟authService.getToken返回null
      (authService.getToken as jest.Mock).mockReturnValue(null);
      
      await logService.deleteLog('test-id');
      
      expect(global.fetch).not.toHaveBeenCalled();
    });
    
    it('should delete log with token', async () => {
      // 模拟fetch成功返回
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('')
      });
      
      await logService.deleteLog('test-id');
      
      expect(global.fetch).toHaveBeenCalledWith('/api/logs/test-id', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
    });
    
    it('should throw error when delete fails', async () => {
      // 模拟fetch失败返回
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue('')
      });
      
      await expect(logService.deleteLog('test-id')).rejects.toThrow('Failed to delete log');
    });
  });
  
  describe('clearLogs', () => {
    it('should return without action when no token is available', async () => {
      // 模拟authService.getToken返回null
      (authService.getToken as jest.Mock).mockReturnValue(null);
      
      await logService.clearLogs();
      
      expect(global.fetch).not.toHaveBeenCalled();
    });
    
    it('should clear logs with token', async () => {
      // 模拟fetch成功返回
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('')
      });
      
      await logService.clearLogs();
      
      expect(global.fetch).toHaveBeenCalledWith('/api/logs', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
    });
    
    it('should throw error when clear fails', async () => {
      // 模拟fetch失败返回
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue('')
      });
      
      await expect(logService.clearLogs()).rejects.toThrow('Failed to clear logs');
    });
  });
});
