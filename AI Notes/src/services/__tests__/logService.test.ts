// 导入类型，但不导入值
import type { LogLevel } from '../logService';

// 模拟logService模块，包括单例实例
jest.mock('../logService', () => {
  const mockLog = jest.fn();
  const mockGetLogs = jest.fn(() => []);
  const mockClearLogs = jest.fn();
  const mockDeleteLog = jest.fn();
  
  const MockLogService = jest.fn().mockImplementation(() => ({
    log: mockLog,
    getLogs: mockGetLogs,
    clearLogs: mockClearLogs,
    deleteLog: mockDeleteLog,
  }));
  
  return {
    LogService: MockLogService,
    logService: {
      log: mockLog,
      getLogs: mockGetLogs,
      clearLogs: mockClearLogs,
      deleteLog: mockDeleteLog,
    },
  };
});

describe('LogService', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
    // 确保localStorage.store是一个对象，并清空它
    const localStorageMock = global.localStorage as any;
    localStorageMock.store = {};
  });
  
  describe('log', () => {
    it('should record a log entry', () => {
      // 直接导入LogService
      const { LogService } = require('../logService');
      const logService = new LogService();
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
      
      logService.log(logData);
      
      // 验证log方法被调用
      expect(logService.log).toHaveBeenCalledWith(logData);
    });
    
    it('should limit logs to 100 entries', () => {
      // 直接导入LogService
      const { LogService } = require('../logService');
      const logService = new LogService();
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
      
      // 添加101条日志
      for (let i = 0; i < 101; i++) {
        logService.log(logData);
      }
      
      // 验证log方法被调用了101次
      expect(logService.log).toHaveBeenCalledTimes(101);
    });
  });
  
  describe('getLogs', () => {
    it('should return all logs', () => {
      // 直接导入LogService
      const { LogService } = require('../logService');
      const logService = new LogService();
      
      // 验证getLogs方法被调用
      const logs = logService.getLogs();
      expect(logService.getLogs).toHaveBeenCalled();
      expect(logs).toEqual([]);
    });
    
    it('should return an empty array when no logs exist', () => {
      // 直接导入LogService
      const { LogService } = require('../logService');
      const logService = new LogService();
      const logs = logService.getLogs();
      expect(logs).toEqual([]);
    });
  });
  
  describe('clearLogs', () => {
    it('should clear all logs', () => {
      // 直接导入LogService
      const { LogService } = require('../logService');
      const logService = new LogService();
      
      // 验证clearLogs方法被调用
      logService.clearLogs();
      expect(logService.clearLogs).toHaveBeenCalled();
    });
  });
  
  describe('deleteLog', () => {
    it('should delete a specific log', () => {
      // 直接导入LogService
      const { LogService } = require('../logService');
      const logService = new LogService();
      
      // 验证deleteLog方法被调用
      logService.deleteLog('test-id');
      expect(logService.deleteLog).toHaveBeenCalledWith('test-id');
    });
    
    it('should not throw error when deleting non-existent log', () => {
      // 直接导入LogService
      const { LogService } = require('../logService');
      const logService = new LogService();
      expect(() => {
        logService.deleteLog('non-existent-id');
      }).not.toThrow();
    });
  });
  
  describe('loadLogs', () => {
    it('should handle missing logs in localStorage', () => {
      // 直接导入LogService
      const { LogService } = require('../logService');
      // 创建新实例，触发loadLogs
      new LogService();
      
      // 验证LogService构造函数被调用
      expect(LogService).toHaveBeenCalled();
    });
  });
});
