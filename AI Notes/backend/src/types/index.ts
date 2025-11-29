/**
 * 用户类型定义
 */
export interface User {
  id: number;
  username: string;
  password: string;
  phone: string;
  email: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 注册请求类型
 */
export interface RegisterRequest {
  username: string;
  password: string;
  phone: string;
  email: string;
}

/**
 * 登录请求类型
 */
export interface LoginRequest {
  phone: string;
  password: string;
}

/**
 * 登录响应类型
 */
export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

/**
 * 笔记类型定义
 */
export interface Note {
  id: string;
  userId: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建笔记请求类型
 */
export interface CreateNoteRequest {
  title: string;
  content: string;
}

/**
 * 更新笔记请求类型
 */
export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

/**
 * 日志级别类型
 */
export type LogLevel = 'info' | 'error' | 'success';

/**
 * 日志请求数据类型
 */
export interface LogRequest {
  text: string;
  model: string;
  provider: string;
}

/**
 * 日志响应数据类型
 */
export interface LogResponse {
  content: string;
  duration: number;
}

/**
 * 日志类型定义
 */
export interface Log {
  id: string;
  userId: number;
  level: LogLevel;
  request: LogRequest;
  response: LogResponse;
  error?: string;
  createdAt: Date;
  deletedAt: Date | null;
}

/**
 * 创建日志请求类型
 */
export interface CreateLogRequest {
  level: LogLevel;
  request: LogRequest;
  response: LogResponse;
  error?: string;
}

/**
 * API密钥类型定义
 */
export interface ApiKey {
  id: number;
  userId: number;
  provider: string;
  model: string;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建API密钥请求类型
 */
export interface CreateApiKeyRequest {
  provider: string;
  model: string;
  apiKey: string;
}

/**
 * 更新API密钥请求类型
 */
export interface UpdateApiKeyRequest {
  apiKey: string;
}
