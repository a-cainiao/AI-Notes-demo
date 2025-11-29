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
