import { AIService } from '../aiService';

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
