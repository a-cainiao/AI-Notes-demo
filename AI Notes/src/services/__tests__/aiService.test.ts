import { AIService, ModelProvider } from '../aiService';

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



describe('AIService', () => {
  let aiService: AIService;
  
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
    // 确保localStorage.store是一个对象，并清空它
    const localStorageMock = global.localStorage as any;
    localStorageMock.store = {};
    // 创建新的AIService实例
    aiService = new AIService();
  });
  
  describe('API Key Management', () => {
    it('should set and get API Key', () => {
      const testKey = 'test-api-key';
      
      aiService.setApiKey(testKey);
      const retrievedKey = aiService.getApiKey();
      
      expect(retrievedKey).toBe(testKey);
    });
    
    it('should delete API Key', () => {
      const testKey = 'test-api-key';
      aiService.setApiKey(testKey);
      
      aiService.deleteApiKey();
      const retrievedKey = aiService.getApiKey();
      
      expect(retrievedKey).toBeNull();
    });
  });
  
  describe('Provider Management', () => {
    it('should set and get provider', () => {
      const testProvider: ModelProvider = 'openai';
      
      aiService.setProvider(testProvider);
      const retrievedProvider = aiService.getProvider();
      
      expect(retrievedProvider).toBe(testProvider);
    });
    
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
      // 清除API Key
      aiService.deleteApiKey();
      
      // 确保没有默认API Key
      (aiService as any).DEFAULT_API_KEY = null;
      
      const chunks: string[] = [];
      let isComplete = false;
      let errorOccurred = false;
      
      await aiService.processText(
        'test text',
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
    it('should validate API Key and provider configuration', () => {
      // 设置API密钥和提供商
      aiService.setApiKey('test-api-key');
      aiService.setProvider('aliyun');
      
      // 验证配置是否正确保存
      expect(aiService.getApiKey()).toBe('test-api-key');
      expect(aiService.getProvider()).toBe('aliyun');
      
      // 验证默认值
      const newAiService = new AIService();
      expect(newAiService.getProvider()).toBe('aliyun');
    });
    
    it('should handle API Key deletion correctly', () => {
      // 设置API密钥
      aiService.setApiKey('test-api-key');
      expect(aiService.getApiKey()).toBe('test-api-key');
      
      // 删除API密钥
      aiService.deleteApiKey();
      expect(aiService.getApiKey()).toBeNull();
    });
  });
  
  describe('Request Flow Validation', () => {
    it('should validate request parameters without sending actual request', async () => {
      // 模拟processTextWithConfig方法，避免发送真实请求
      const mockProcessTextWithConfig = jest.spyOn(aiService as any, 'processTextWithConfig');
      mockProcessTextWithConfig.mockResolvedValue(false);
      
      // 设置API密钥
      aiService.setApiKey('test-api-key');
      aiService.setProvider('aliyun');
      
      // 调用processText方法，验证参数传递
      await aiService.processText(
        'test text',
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
