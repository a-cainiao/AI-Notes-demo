/**
 * AI 服务
 * 负责处理与 AI API 的交互，支持流式响应
 */

import { logService } from './logService';
import { authService } from './authService';

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

/**
 * AI 处理类型
 */
export type AIProcessType = 'expand' | 'rewrite' | 'summarize';

export class AIService {
  // 默认API Key，从环境变量读取
  private readonly DEFAULT_API_KEY = import.meta.env.VITE_AI_API_KEY || null;
  // 默认模型提供商，从环境变量读取
  private readonly DEFAULT_PROVIDER = (import.meta.env.VITE_AI_PROVIDER as ModelProvider) || 'aliyun';

  /**
   * 获取保存的 API Key 和模型配置
   * 从后端获取完整的API Key配置
   */
  async getApiKeyConfig(): Promise<{ apiKey: string; provider: ModelProvider; model: string } | null> {
    try {
      const token = authService.getToken();
      if (!token) {
        return null;
      }
      
      const response = await fetch('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return null;
      }
      
      const apiKeys = await response.json();
      // 目前默认返回第一个API Key配置，后续可以根据提供商和模型选择
      return apiKeys.length > 0 ? {
        apiKey: apiKeys[0].apiKey,
        provider: apiKeys[0].provider as ModelProvider,
        model: apiKeys[0].model
      } : null;
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      return null;
    }
  }

  /**
   * 获取模型提供商
   * 目前默认返回阿里云，后续可以根据配置选择
   */
  getProvider(): ModelProvider {
    return this.DEFAULT_PROVIDER;
  }

  /**
   * 使用指定的配置处理文本，返回流式响应
   * @param text 要处理的文本
   * @param processType AI 处理类型
   * @param onChunk 流式响应回调函数
   * @param onComplete 完成回调函数
   * @param onError 错误回调函数
   * @param useDefaultConfig 是否使用默认配置
   */
  private async processTextWithConfig(
    text: string,
    processType: AIProcessType,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    _onError: (error: Error) => void,
    useDefaultConfig: boolean = false
  ): Promise<boolean> {
    // 根据是否使用默认配置选择 API Key 和提供商
    let apiKey: string | null;
    let provider: ModelProvider;
    let model: string;
    
    if (useDefaultConfig) {
      apiKey = this.DEFAULT_API_KEY;
      provider = this.DEFAULT_PROVIDER;
      model = provider === 'openai' ? 'gpt-3.5-turbo' : 'qwen-turbo';
    } else {
      const apiKeyConfig = await this.getApiKeyConfig();
      if (!apiKeyConfig) {
        return false;
      }
      apiKey = apiKeyConfig.apiKey;
      provider = apiKeyConfig.provider;
      model = apiKeyConfig.model;
    }
    
    if (!apiKey) {
      return false;
    }

    const startTime = Date.now();
    let fullResponse = '';
    
    try {
      let response: Response;
      
      // 根据处理类型生成不同的提示
      let systemPrompt = '你是一个专业的写作助手，请帮助用户处理他们的文本。保持原意，提高表达质量，注意不要生成与内容无关或冗余的文本。';
      let userPrompt = text;
      
      switch (processType) {
        case 'expand':
          systemPrompt = '你是一个专业的写作助手，请帮助用户扩展他们的文本。保持原意，丰富内容，增加细节，使文本更加全面和深入。';
          userPrompt = `请扩展以下文本，增加更多细节和内容，保持原意不变：\n\n${text}`;
          break;
        case 'rewrite':
          systemPrompt = '你是一个专业的写作助手，请帮助用户重写他们的文本。保持原意，改进表达方式，使文本更加流畅、生动和专业。';
          userPrompt = `请重写以下文本，改进表达方式，保持原意不变：\n\n${text}`;
          break;
        case 'summarize':
          systemPrompt = '你是一个专业的写作助手，请帮助用户总结他们的文本。保持核心内容，提炼关键信息，使文本更加简洁和精炼。';
          userPrompt = `请总结以下文本，提炼核心内容和关键信息：\n\n${text}`;
          break;
      }
      
      // 根据不同的模型提供商，生成不同的请求
      const baseUrl = provider === 'openai' ? 'https://api.openai.com' : 'https://dashscope.aliyuncs.com';
      response = await fetch(`${baseUrl}/compatible-mode/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
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
        // 添加更详细的错误信息
        console.error('Response details:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: response.body
        });
        throw new Error(`无法获取响应流，响应状态: ${response.status} ${response.statusText}`);
      }

      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';
      
      // 添加chunk合并相关变量
      let chunkBuffer = ''; // 临时存储小chunk
      let lastChunkTime = Date.now(); // 上次发送时间
      const CHUNK_SIZE_THRESHOLD = 100; // 字符数阈值
      const TIME_THRESHOLD = 50; // 时间阈值(ms)

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
              // 流式响应结束，不解析JSON
              continue;
            }
            try {
              const json = JSON.parse(data);
              
              // 根据不同提供商解析响应
              let content = '';
              // 阿里云兼容 OpenAI 接口，使用相同的响应格式
              content = json.choices[0]?.delta?.content || '';
              
              if (content) {
                fullResponse += content;
                chunkBuffer += content; // 累积到临时buffer
                
                // 检查是否需要发送合并后的chunk
                const now = Date.now();
                if (chunkBuffer.length >= CHUNK_SIZE_THRESHOLD || now - lastChunkTime >= TIME_THRESHOLD) {
                  onChunk(chunkBuffer);
                  chunkBuffer = '';
                  lastChunkTime = now;
                }
              }
            } catch (parseError) {
              console.error('Failed to parse AI response chunk:', parseError);
            }
          }
        }
      }

      // 发送剩余buffer
      if (chunkBuffer) {
        onChunk(chunkBuffer);
      }
      
      onComplete();
      // 记录成功日志
      const duration = Date.now() - startTime;
      try {
        await logService.log({
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
      } catch (logError) {
        console.error('Failed to log AI success:', logError);
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'AI 处理失败';
      console.error('AI processing error:', error);
      
      // 记录错误日志
      const duration = Date.now() - startTime;
      try {
        await logService.log({
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
      } catch (logError) {
        console.error('Failed to log AI error:', logError);
      }
      
      return false;
    }
  }

  /**
   * 处理文本，返回流式响应
   * @param text 要处理的文本
   * @param processType AI 处理类型
   * @param onChunk 流式响应回调函数
   * @param onComplete 完成回调函数
   * @param onError 错误回调函数
   */
  async processText(
    text: string,
    processType: AIProcessType,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    // 先使用用户配置尝试调用 API
    const userSuccess = await this.processTextWithConfig(text, processType, onChunk, onComplete, onError, false);
    
    // 如果用户配置调用失败，且有默认 API Key，尝试使用默认配置重新调用
    if (!userSuccess && this.DEFAULT_API_KEY) {
      console.log('用户配置调用失败，尝试使用默认配置重新调用');
      const defaultSuccess = await this.processTextWithConfig(text, processType, onChunk, onComplete, onError, true);
      
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