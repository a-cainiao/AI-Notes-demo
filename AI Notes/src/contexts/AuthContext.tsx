import React, { createContext, ReactNode, useContext } from 'react';
import { User } from '../types/user';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { login, register, logout, refreshUser } from '../store/authSlice';

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
 * 现在使用 Redux 状态，提供登录、注册、登出等方法
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);

  /**
   * 用户登录
   * @param phone 手机号
   * @param password 密码
   */
  const handleLogin = async (phone: string, password: string) => {
    await dispatch(login({ phone, password })).unwrap();
  };

  /**
   * 用户注册
   * @param username 用户名
   * @param password 密码
   * @param phone 手机号
   * @param email 邮箱
   */
  const handleRegister = async (username: string, password: string, phone: string, email: string) => {
    await dispatch(register({ username, password, phone, email })).unwrap();
  };

  /**
   * 用户登出
   */
  const handleLogout = () => {
    dispatch(logout());
  };

  /**
   * 刷新用户信息
   */
  const handleRefreshUser = async () => {
    await dispatch(refreshUser()).unwrap();
  };

  // 上下文值
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser: handleRefreshUser
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
