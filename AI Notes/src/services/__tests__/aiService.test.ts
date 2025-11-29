import { AIService } from '../aiService';

// 模拟authService模块
jest.mock('../authService', () => ({
  authService: {
    getToken: jest.fn().mockReturnValue('test-token'),
    setToken: jest.fn(),
    clearToken: jest.fn(),
    isAuthenticated: jest.fn().mockReturnValue(true),
  },
}));

// 模拟logService模块，防止单例状态泄漏
jest.mock('../logService', () => {
  const mockLog = jest.fn();
  return {
    logService: {
      log: mockLog,
      getLogs: jest.fn().mockReturnValue([]),
      clearLogs: jest.fn(),
    },
    LogService: jest.fn().mockImplementation(() => ({
      log: mockLog,
      getLogs: jest.fn().mockReturnValue([]),
      clearLogs: jest.fn(),
    })),
  };
});

// 模拟fetch API
global.fetch = jest.fn();



describe('AIService', () => {
  let aiService: AIService;
  
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
    // 重置fetch模拟
    global.fetch = jest.fn();
    // 确保localStorage.store是一个对象，并清空它
    const localStorageMock = global.localStorage as any;
    localStorageMock.store = {};
    // 创建新的AIService实例
    aiService = new AIService();
  });
  
  describe('Provider Management', () => {
    it('should return default provider when none is set', () => {
      // 创建新实例，没有设置provider
      const newAiService = new AIService();
      const retrievedProvider = newAiService.getProvider();
      
      expect(retrievedProvider).toBe('aliyun');
    });
  });
  
  describe('processTextWithConfig', () => {
    it('should return false when API Key is null', async () => {
      const result = await (aiService as any).processTextWithConfig(
        'test text',
        () => {},
        () => {},
        () => {},
        false
      );
      
      expect(result).toBe(false);
    });
  });
  
  describe('processText', () => {
    it('should call onError when no API Key is set', async () => {
      // 确保没有默认API Key
      (aiService as any).DEFAULT_API_KEY = null;
      
      const chunks: string[] = [];
      let isComplete = false;
      let errorOccurred = false;
      
      await aiService.processText(
        'test text',
        'expand',
        (chunk: string) => chunks.push(chunk),
        () => { isComplete = true; },
        () => { errorOccurred = true; }
      );
      
      expect(chunks).toEqual([]);
      expect(isComplete).toBe(false);
      expect(errorOccurred).toBe(true);
    });
  });
  
  describe('Configuration Validation', () => {
    it('should validate provider configuration', () => {
      // 验证默认值
      const newAiService = new AIService();
      expect(newAiService.getProvider()).toBe('aliyun');
    });
  });
  
  describe('getApiKeyConfig', () => {
    it('should return null when no token is available', async () => {
      // 模拟authService.getToken返回null
      const { authService } = require('../authService');
      (authService.getToken as jest.Mock).mockReturnValue(null);
      
      const result = await aiService.getApiKeyConfig();
      
      expect(result).toBeNull();
    });
    
    it('should return API key config when fetch succeeds', async () => {
      const mockApiKeys = [{
        apiKey: 'test-api-key',
        provider: 'openai',
        model: 'gpt-3.5-turbo'
      }];
      
      // 确保authService.getToken返回预期的token
      const { authService } = require('../authService');
      (authService.getToken as jest.Mock).mockReturnValue('test-token');
      
      // 确保fetch被正确模拟，返回预期的响应对象
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiKeys)
      };
      
      // 直接模拟fetch返回预期的响应对象
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await aiService.getApiKeyConfig();
      
      expect(result).toEqual(mockApiKeys[0]);
      expect(global.fetch).toHaveBeenCalledWith('/api/api-keys', expect.any(Object));
      expect(mockResponse.json).toHaveBeenCalled();
    });
    
    it('should return null when fetch fails', async () => {
      // 模拟fetch失败
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false
      });
      
      const result = await aiService.getApiKeyConfig();
      
      expect(result).toBeNull();
    });
    
    it('should return null when fetch throws an error', async () => {
      // 模拟fetch抛出错误
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const result = await aiService.getApiKeyConfig();
      
      expect(result).toBeNull();
    });
  });
  
  describe('processTextWithConfig', () => {
    it('should return false when API Key is null', async () => {
      const result = await (aiService as any).processTextWithConfig(
        'test text',
        'expand',
        () => {},
        () => {},
        () => {},
        false
      );
      
      expect(result).toBe(false);
    });
    
    it('should return false when getApiKeyConfig returns null', async () => {
      // 模拟getApiKeyConfig返回null
      jest.spyOn(aiService, 'getApiKeyConfig' as any).mockResolvedValue(null);
      
      const result = await (aiService as any).processTextWithConfig(
        'test text',
        'expand',
        () => {},
        () => {},
        () => {},
        false
      );
      
      expect(result).toBe(false);
    });
  });
  
  describe('processText', () => {
    it('should call onError when no API Key is set', async () => {
      // 确保没有默认API Key
      (aiService as any).DEFAULT_API_KEY = null;
      
      const chunks: string[] = [];
      let isComplete = false;
      let errorOccurred = false;
      
      await aiService.processText(
        'test text',
        'expand',
        (chunk: string) => chunks.push(chunk),
        () => { isComplete = true; },
        () => { errorOccurred = true; }
      );
      
      expect(chunks).toEqual([]);
      expect(isComplete).toBe(false);
      expect(errorOccurred).toBe(true);
    });
    
    it('should call onError when both user and default config fail', async () => {
      // 模拟processTextWithConfig总是返回false
      jest.spyOn(aiService as any, 'processTextWithConfig').mockResolvedValue(false);
      
      // 设置默认API Key，以便测试能够进入预期的错误分支
      (aiService as any).DEFAULT_API_KEY = 'default-api-key';
      
      let errorOccurred = false;
      
      await aiService.processText(
        'test text',
        'expand',
        () => {},
        () => {},
        (error: Error) => {
          errorOccurred = true;
          expect(error.message).toBe('AI 处理失败，用户配置和默认配置均无法正常调用 API');
        }
      );
      
      expect(errorOccurred).toBe(true);
    });
    
    it('should call onError with API key error when no default API key', async () => {
      // 模拟processTextWithConfig总是返回false
      jest.spyOn(aiService as any, 'processTextWithConfig').mockResolvedValue(false);
      // 确保没有默认API Key
      (aiService as any).DEFAULT_API_KEY = null;
      
      let errorOccurred = false;
      
      await aiService.processText(
        'test text',
        'expand',
        () => {},
        () => {},
        (error: Error) => {
          errorOccurred = true;
          expect(error.message).toBe('请先设置 API Key');
        }
      );
      
      expect(errorOccurred).toBe(true);
    });
    
    it('should use default config when user config fails', async () => {
      // 模拟第一次调用失败，第二次调用成功
      const mockProcessTextWithConfig = jest.spyOn(aiService as any, 'processTextWithConfig');
      mockProcessTextWithConfig.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
      
      // 设置默认API Key
      (aiService as any).DEFAULT_API_KEY = 'default-api-key';
      
      await aiService.processText(
        'test text',
        'expand',
        () => {},
        () => {},
        () => {}
      );
      
      // 验证processTextWithConfig被调用了两次
      expect(mockProcessTextWithConfig).toHaveBeenCalledTimes(2);
      // 第二次调用应该使用默认配置
      expect(mockProcessTextWithConfig).toHaveBeenNthCalledWith(2, 
        'test text', 
        'expand', 
        expect.any(Function), 
        expect.any(Function), 
        expect.any(Function), 
        true
      );
    });
    
    it('should handle different process types', async () => {
      // 模拟processTextWithConfig返回成功
      const mockProcessTextWithConfig = jest.spyOn(aiService as any, 'processTextWithConfig');
      mockProcessTextWithConfig.mockResolvedValue(true);
      
      const processTypes: Array<'expand' | 'rewrite' | 'summarize'> = ['expand', 'rewrite', 'summarize'];
      
      for (const processType of processTypes) {
        await aiService.processText(
          'test text',
          processType,
          () => {},
          () => {},
          () => {}
        );
        
        // 验证processTextWithConfig被调用，并且传递了正确的processType
        expect(mockProcessTextWithConfig).toHaveBeenCalledWith(
          'test text',
          processType,
          expect.any(Function),
          expect.any(Function),
          expect.any(Function),
          false
        );
      }
    });
  });
  
  describe('Request Flow Validation', () => {
    it('should validate request parameters without sending actual request', async () => {
      // 模拟processTextWithConfig方法，避免发送真实请求
      const mockProcessTextWithConfig = jest.spyOn(aiService as any, 'processTextWithConfig');
      mockProcessTextWithConfig.mockResolvedValue(false);
      
      // 调用processText方法，验证参数传递
      await aiService.processText(
        'test text',
        'expand',
        () => {},
        () => {},
        () => {}
      );
      
      // 验证processTextWithConfig方法被调用
      expect(mockProcessTextWithConfig).toHaveBeenCalled();
      
      // 恢复原始方法
      mockProcessTextWithConfig.mockRestore();
    });
  });
});
