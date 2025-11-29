/**
 * @jest-environment node
 */
import { AIService } from '../aiService';

// 集成测试：发送真实请求到阿里模型接口
describe('AIService Integration Tests', () => {
  let aiService: AIService;
  
  beforeEach(() => {
    // 创建新的AIService实例
    aiService = new AIService();
  });
  
  it('should send real request to Aliyun model API and handle streaming response', async () => {
    // 使用真实的API密钥进行测试
    // 注意：在实际运行时需要提供有效的API密钥
    const realApiKey = process.env.ALIYUN_API_KEY;
    
    // 跳过测试如果没有提供API密钥或者是占位符密钥
    if (!realApiKey || realApiKey.startsWith('your-real-')) {
      console.warn('Skipping real API test: ALIYUN_API_KEY not provided or is a placeholder');
      return;
    }
    
    const testText = 'Hello, please respond with a short greeting.';
    
    // API密钥将通过processTextWithConfig方法从后端获取
    // 提供商使用默认值aliyun
    
    const chunks: string[] = [];
    let isComplete = false;
    let errorOccurred = false;
    
    // 调用processText方法，发送真实请求
    await aiService.processText(
      testText,
      (chunk: string) => {
        console.log('Received chunk:', chunk);
        chunks.push(chunk);
      },
      () => {
        console.log('Request completed');
        isComplete = true;
      },
      (error: Error) => {
        console.error('Request failed:', error);
        errorOccurred = true;
      }
    );
    
    // 验证真实请求的结果
    expect(errorOccurred).toBe(false);
    expect(isComplete).toBe(true);
    expect(chunks.length).toBeGreaterThan(0);
    
    // 验证响应内容
    const fullResponse = chunks.join('');
    console.log('Full response:', fullResponse);
    expect(fullResponse.length).toBeGreaterThan(0);
    expect(typeof fullResponse).toBe('string');
  }, 30000); // 设置30秒超时，确保有足够时间处理请求
});
