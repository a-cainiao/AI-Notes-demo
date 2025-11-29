import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { authService } from '../services/authService';

/**
 * 认证上下文类型定义
 */
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (username: string, password: string, phone: string, email: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

/**
 * 认证上下文
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 认证上下文提供者组件
 * 管理用户状态，提供登录、注册、登出等方法
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：从localStorage加载用户信息
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = authService.getUser();
        if (savedUser) {
          setUser(savedUser);
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
        authService.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * 用户登录
   * @param phone 手机号
   * @param password 密码
   */
  const login = async (phone: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authService.login({ phone, password });
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 用户注册
   * @param username 用户名
   * @param password 密码
   * @param phone 手机号
   * @param email 邮箱
   */
  const register = async (username: string, password: string, phone: string, email: string) => {
    setIsLoading(true);
    try {
      const data = await authService.register({ username, password, phone, email });
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 用户登出
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  /**
   * 刷新用户信息
   */
  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.getCurrentUser();
      setUser(updatedUser);
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      authService.clearAuthData();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 上下文值
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 自定义Hook，用于访问认证上下文
 * @returns 认证上下文
 */
export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
