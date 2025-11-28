/**
 * AI 服务
 * 负责处理与 AI API 的交互，支持流式响应
 */

import { logService } from './logService';

/**
 * 模型提供商类型
 */
export type ModelProvider = 'openai' | 'aliyun';

/**
 * AI 服务配置
 */
export interface AIConfig {
  provider: ModelProvider;
  apiKey: string;
}

export class AIService {
  private apiKey: string | null = null;
  private provider: ModelProvider = 'aliyun';
  // 默认API Key，从环境变量读取
  private readonly DEFAULT_API_KEY = import.meta.env.VITE_AI_API_KEY || null;
  // 默认模型提供商，从环境变量读取
  private readonly DEFAULT_PROVIDER = (import.meta.env.VITE_AI_PROVIDER as ModelProvider) || 'aliyun';

  /**
   * 设置 API Key
   */
  setApiKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem('ai-api-key', key);
  }

  /**
   * 获取保存的 API Key
   * 优先级：内存缓存 > localStorage > null
   */
  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('ai-api-key');
    }
    return this.apiKey;
  }

  /**
   * 删除保存的 API Key
   */
  deleteApiKey(): void {
    this.apiKey = null;
    localStorage.removeItem('ai-api-key');
  }

  /**
   * 设置模型提供商
   */
  setProvider(provider: ModelProvider): void {
    this.provider = provider;
    localStorage.setItem('ai-model-provider', provider);
  }

  /**
   * 获取保存的模型提供商
   * 优先级：内存缓存 > localStorage > 默认值 'aliyun'
   */
  getProvider(): ModelProvider {
    if (!this.provider) {
      const savedProvider = localStorage.getItem('ai-model-provider') as ModelProvider;
      this.provider = savedProvider || 'aliyun';
    }
    return this.provider;
  }

  /**
   * 使用指定的配置处理文本，返回流式响应
   * @param text 要处理的文本
   * @param onChunk 流式响应回调函数
   * @param onComplete 完成回调函数
   * @param onError 错误回调函数
   * @param useDefaultConfig 是否使用默认配置
   */
  private async processTextWithConfig(
    text: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    useDefaultConfig: boolean = false
  ): Promise<boolean> {
    // 根据是否使用默认配置选择 API Key 和提供商
    const apiKey = useDefaultConfig ? this.DEFAULT_API_KEY : this.getApiKey();
    const provider = useDefaultConfig ? this.DEFAULT_PROVIDER : this.getProvider();
    
    if (!apiKey) {
      return false;
    }

    const model = provider === 'openai' ? 'gpt-3.5-turbo' : 'qwen-turbo';
    const startTime = Date.now();
    let fullResponse = '';
    
    try {
      let response: Response;
      
      // 根据不同的模型提供商，生成不同的请求
      const baseUrl = provider === 'openai' ? 'https://api.openai.com' : 'https://dashscope.aliyuncs.com';
      response = await fetch(`${baseUrl}/compatible-mode/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: provider === 'openai' ? 'gpt-3.5-turbo' : 'qwen-turbo',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的写作助手，请帮助用户润色、扩展或总结他们的文本。保持原意，提高表达质量。'
            },
            {
              role: 'user',
              content: text
            }
          ],
          stream: true
        })
      });

      if (!response.ok) {
        let errorMessage = `API 请求失败: ${response.status}`;
        try {
          // 尝试解析JSON响应
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch (jsonError) {
          // 如果JSON解析失败，尝试获取文本响应
          try {
            const textData = await response.text();
            errorMessage = `${errorMessage}: ${textData.substring(0, 100)}...`;
          } catch (textError) {
            // 如果文本解析也失败，使用默认错误信息
          }
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        buffer += chunkValue;

        // 处理流式响应，提取 AI 生成的文本
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          // 处理 SSE 格式的响应
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete();
              // 记录成功日志
              const duration = Date.now() - startTime;
              logService.log({
                level: 'success',
                request: {
                  text,
                  model,
                  provider
                },
                response: {
                  content: fullResponse,
                  duration
                }
              });
              return true;
            }
            try {
              const json = JSON.parse(data);
              
              // 根据不同提供商解析响应
              let content = '';
              // 阿里云兼容 OpenAI 接口，使用相同的响应格式
              content = json.choices[0]?.delta?.content || '';
              
              if (content) {
                fullResponse += content;
                onChunk(content);
              }
            } catch (parseError) {
              console.error('Failed to parse AI response chunk:', parseError);
            }
          }
        }
      }

      onComplete();
      // 记录成功日志
      const duration = Date.now() - startTime;
      logService.log({
        level: 'success',
        request: {
          text,
          model,
          provider
        },
        response: {
          content: fullResponse,
          duration
        }
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'AI 处理失败';
      console.error('AI processing error:', error);
      
      // 记录错误日志
      const duration = Date.now() - startTime;
      logService.log({
        level: 'error',
        request: {
          text,
          model,
          provider
        },
        response: {
          content: fullResponse,
          duration
        },
        error: errorMessage
      });
      
      return false;
    }
  }

  /**
   * 处理文本，返回流式响应
   * @param text 要处理的文本
   * @param onChunk 流式响应回调函数
   * @param onComplete 完成回调函数
   * @param onError 错误回调函数
   */
  async processText(
    text: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    // 先使用用户配置尝试调用 API
    const userSuccess = await this.processTextWithConfig(text, onChunk, onComplete, onError, false);
    
    // 如果用户配置调用失败，且有默认 API Key，尝试使用默认配置重新调用
    if (!userSuccess && this.DEFAULT_API_KEY) {
      console.log('用户配置调用失败，尝试使用默认配置重新调用');
      const defaultSuccess = await this.processTextWithConfig(text, onChunk, onComplete, onError, true);
      
      // 如果默认配置调用也失败，调用 onError 回调
      if (!defaultSuccess) {
        onError(new Error('AI 处理失败，用户配置和默认配置均无法正常调用 API'));
      }
    } else if (!userSuccess) {
      // 如果用户配置调用失败，且没有默认 API Key，调用 onError 回调
      onError(new Error('请先设置 API Key'));
    }
  }
}

// 导出单例实例
export const aiService = new AIService();