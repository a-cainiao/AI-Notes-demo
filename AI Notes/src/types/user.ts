/**
 * 用户类型定义
 */
export interface User {
  id: number;
  username: string;
  phone: string;
  email: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 登录请求类型
 */
export interface LoginRequest {
  phone: string;
  password: string;
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
 * 登录响应类型
 */
export interface LoginResponse {
  token: string;
  user: User;
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
