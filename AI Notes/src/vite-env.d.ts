/// <reference types="vite/client" />

// 扩展ImportMetaEnv接口，添加自定义环境变量类型
declare interface ImportMetaEnv {
  readonly VITE_AI_API_KEY: string;
  readonly VITE_AI_PROVIDER: 'openai' | 'aliyun';
}

// 确保ImportMeta类型正确
declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}