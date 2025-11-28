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

  /**
   * 设置 API Key
   */
  setApiKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem('ai-api-key', key);
  }

  /**
   * 获取保存的 API Key
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
   */
  getProvider(): ModelProvider {
    if (!this.provider) {
      const savedProvider = localStorage.getItem('ai-model-provider') as ModelProvider;
      this.provider = savedProvider || 'aliyun';
    }
    return this.provider;
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
    const apiKey = this.getApiKey();
    if (!apiKey) {
      const error = new Error('请先设置 API Key');
      onError(error);
      return;
    }

    const provider = this.getProvider();
    const model = provider === 'openai' ? 'gpt-3.5-turbo' : 'qwen-turbo';
    const startTime = Date.now();
    let fullResponse = '';
    
    try {
      let response: Response;
      
      // 根据不同的模型提供商，生成不同的请求
      // 阿里云兼容模式 API 请求
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
              return;
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'AI 处理失败';
      console.error('AI processing error:', error);
      onError(error instanceof Error ? error : new Error('AI 处理失败'));
      
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
    }
  }
}

// 导出单例实例
export const aiService = new AIService();