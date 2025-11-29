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
