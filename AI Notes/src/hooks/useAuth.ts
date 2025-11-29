import { useAppSelector, useAppDispatch } from '../store/hooks';
import { login, register, logout, refreshUser, clearError } from '../store/authSlice';
import { LoginRequest, RegisterRequest } from '../types/user';

/**
 * 自定义的 useAuth hook，使用 Redux 状态
 * 替代原来的 React Context API
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth);

  /**
   * 用户登录
   */
  const handleLogin = async (phone: string, password: string) => {
    await dispatch(login({ phone, password })).unwrap();
  };

  /**
   * 用户注册
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

  /**
   * 清除错误
   */
  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser: handleRefreshUser,
    clearError: handleClearError,
  };
};
