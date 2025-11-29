import { LoginRequest, RegisterRequest, LoginResponse, User } from '../types/user';

/**
 * 认证服务
 * 负责处理用户登录、注册和获取用户信息请求
 */
export class AuthService {
  private readonly API_URL = '/api/auth';
  private readonly TOKEN_KEY = 'ai-notes-token';
  private readonly USER_KEY = 'ai-notes-user';

  /**
   * 用户注册
   * @param registerData 注册数据
   * @returns 登录响应
   */
  async register(registerData: RegisterRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '注册失败');
    }

    const data = await response.json();
    this.saveAuthData(data);
    return data;
  }

  /**
   * 用户登录
   * @param loginData 登录数据
   * @returns 登录响应
   */
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '登录失败');
    }

    const data = await response.json();
    this.saveAuthData(data);
    return data;
  }

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('未登录');
    }

    const response = await fetch(`${this.API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      this.clearAuthData();
      throw new Error('获取用户信息失败');
    }

    // 检查响应体是否为空
    const text = await response.text();
    if (!text) {
      this.clearAuthData();
      throw new Error('获取用户信息失败，响应为空');
    }

    return JSON.parse(text);
  }

  /**
   * 保存认证数据到localStorage
   * @param data 登录响应数据
   */
  saveAuthData(data: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
  }

  /**
   * 从localStorage获取token
   * @returns token或null
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * 从localStorage获取用户信息
   * @returns 用户信息或null
   */
  getUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      const user = JSON.parse(userJson);
      // 将字符串日期转换为Date对象
      return {
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      };
    }
    return null;
  }

  /**
   * 清除localStorage中的认证数据
   */
  clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * 检查用户是否已登录
   * @returns 是否已登录
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * 用户登出
   */
  logout(): void {
    this.clearAuthData();
  }
}

// 导出单例实例
export const authService = new AuthService();
