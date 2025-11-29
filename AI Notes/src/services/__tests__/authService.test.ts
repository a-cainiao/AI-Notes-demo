import { AuthService } from '../authService';
import { LoginResponse, User, RegisterRequest, LoginRequest } from '../../types/user';

// 模拟fetch API
global.fetch = jest.fn();

describe('AuthService', () => {
  let authService: AuthService;
  
  beforeEach(() => {
    // 创建新的AuthService实例
    authService = new AuthService();
  });
  
  describe('saveAuthData', () => {
    it('should save token and user to localStorage', () => {
      const loginResponse: LoginResponse = {
        token: 'test-token',
        user: {
          id: 1,
          username: 'test-user',
          email: 'test@example.com',
          phone: '13800138000',
          avatar: null,
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
          updatedAt: new Date('2023-01-01T00:00:00.000Z')
        }
      };
      
      authService.saveAuthData(loginResponse);
      
      // 检查 localStorage 中是否存储了正确的数据
      expect(localStorage.getItem('ai-notes-token')).toBe(loginResponse.token);
      
      // 由于 JSON.parse 会将 Date 对象转换为字符串，所以需要调整期望
      const storedUser = JSON.parse(localStorage.getItem('ai-notes-user') || '{}');
      const expectedUser = {
        ...loginResponse.user,
        createdAt: loginResponse.user.createdAt.toISOString(),
        updatedAt: loginResponse.user.updatedAt.toISOString()
      };
      expect(storedUser).toEqual(expectedUser);
    });
  });
  
  describe('getToken', () => {
    it('should return null when no token is stored', () => {
      // 确保 localStorage 中没有存储 token
      localStorage.clear();
      
      const token = authService.getToken();
      expect(token).toBeNull();
    });
    
    it('should return the stored token when it exists', () => {
      // 确保 localStorage 中存储了 token
      localStorage.setItem('ai-notes-token', 'test-token');
      
      const token = authService.getToken();
      expect(token).toBe('test-token');
    });
  });
  
  describe('getUser', () => {
    it('should return null when no user is stored', () => {
      // 确保 localStorage 中没有存储 user
      localStorage.clear();
      
      const user = authService.getUser();
      expect(user).toBeNull();
    });
    
    it('should return the stored user when it exists', () => {
      const user: User = {
        id: 1,
        username: 'test-user',
        email: 'test@example.com',
        phone: '13800138000',
        avatar: null,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z')
      };
      // 确保 localStorage 中存储了 user
      localStorage.setItem('ai-notes-user', JSON.stringify(user));
      
      const retrievedUser = authService.getUser();
      // 由于 JSON.parse 会将 Date 对象转换为字符串，所以需要调整期望
      const expectedUser = {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      };
      expect(retrievedUser).toEqual(expectedUser);
    });
  });
  
  describe('clearAuthData', () => {
    it('should remove token and user from localStorage', () => {
      // 先存储一些数据
      localStorage.setItem('ai-notes-token', 'test-token');
      localStorage.setItem('ai-notes-user', JSON.stringify({ id: 1, username: 'test-user' }));
      
      authService.clearAuthData();
      
      // 检查 localStorage 中是否清除了数据
      expect(localStorage.getItem('ai-notes-token')).toBeNull();
      expect(localStorage.getItem('ai-notes-user')).toBeNull();
    });
  });
  
  describe('isLoggedIn', () => {
    it('should return false when no token is stored', () => {
      // 确保 localStorage 中没有存储 token
      localStorage.clear();
      
      const isLoggedIn = authService.isLoggedIn();
      expect(isLoggedIn).toBe(false);
    });
    
    it('should return true when a token is stored', () => {
      // 确保 localStorage 中存储了 token
      localStorage.setItem('ai-notes-token', 'test-token');
      
      const isLoggedIn = authService.isLoggedIn();
      expect(isLoggedIn).toBe(true);
    });
  });
  
  describe('logout', () => {
    it('should clear auth data', () => {
      // 模拟clearAuthData方法
      const clearAuthDataSpy = jest.spyOn(authService, 'clearAuthData').mockImplementation(() => {});
      
      authService.logout();
      
      expect(clearAuthDataSpy).toHaveBeenCalled();
    });
  });
  
  describe('register', () => {
    it('should register a user and save auth data', async () => {
      const registerData: RegisterRequest = {
        username: 'test-user',
        email: 'test@example.com',
        password: 'password123',
        phone: '13800138000'
      };
      
      const loginResponse: LoginResponse = {
        token: 'test-token',
        user: {
          id: 1,
          username: 'test-user',
          email: 'test@example.com',
          phone: '13800138000',
          avatar: null,
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
          updatedAt: new Date('2023-01-01T00:00:00.000Z')
        }
      };
      
      // 模拟fetch成功返回
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(loginResponse)
      });
      
      // 模拟saveAuthData方法
      const saveAuthDataSpy = jest.spyOn(authService, 'saveAuthData').mockImplementation(() => {});
      
      const result = await authService.register(registerData);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });
      expect(saveAuthDataSpy).toHaveBeenCalledWith(loginResponse);
      expect(result).toEqual(loginResponse);
    });
    
    it('should throw an error when register fails', async () => {
      const registerData: RegisterRequest = {
        username: 'test-user',
        email: 'test@example.com',
        password: 'password123',
        phone: '13800138000'
      };
      
      // 模拟fetch失败返回
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: '注册失败' })
      });
      
      await expect(authService.register(registerData)).rejects.toThrow('注册失败');
    });
  });
  
  describe('login', () => {
    it('should login a user and save auth data', async () => {
      const loginData: LoginRequest = {
        phone: '13800138000',
        password: 'password123'
      };
      
      const loginResponse: LoginResponse = {
        token: 'test-token',
        user: {
          id: 1,
          username: 'test-user',
          email: 'test@example.com',
          phone: '13800138000',
          avatar: null,
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
          updatedAt: new Date('2023-01-01T00:00:00.000Z')
        }
      };
      
      // 模拟fetch成功返回
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(loginResponse)
      });
      
      // 模拟saveAuthData方法
      const saveAuthDataSpy = jest.spyOn(authService, 'saveAuthData').mockImplementation(() => {});
      
      const result = await authService.login(loginData);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      expect(saveAuthDataSpy).toHaveBeenCalledWith(loginResponse);
      expect(result).toEqual(loginResponse);
    });
    
    it('should throw an error when login fails', async () => {
      const loginData: LoginRequest = {
        phone: '13800138000',
        password: 'wrong-password'
      };
      
      // 模拟fetch失败返回
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: '登录失败' })
      });
      
      await expect(authService.login(loginData)).rejects.toThrow('登录失败');
    });
  });
  
  describe('getCurrentUser', () => {
    it('should throw an error when no token is stored', async () => {
      // 确保 localStorage 中没有存储 token
      localStorage.clear();
      
      await expect(authService.getCurrentUser()).rejects.toThrow('未登录');
    });
    
    it('should get current user when token is stored', async () => {
      // 存储token
      localStorage.setItem('ai-notes-token', 'test-token');
      
      const user: User = {
        id: 1,
        username: 'test-user',
        email: 'test@example.com',
        phone: '13800138000',
        avatar: null,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z')
      };
      
      // 模拟fetch成功返回
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(user))
      });
      
      const result = await authService.getCurrentUser();
      
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/me', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      
      // 由于 JSON.parse 会将 Date 对象转换为字符串，所以需要调整期望
      const expectedUser = {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      };
      expect(result).toEqual(expectedUser);
    });
    
    it('should clear auth data and throw an error when fetch fails', async () => {
      // 存储token
      localStorage.setItem('ai-notes-token', 'test-token');
      
      // 模拟fetch失败返回
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false
      });
      
      // 模拟clearAuthData方法
      const clearAuthDataSpy = jest.spyOn(authService, 'clearAuthData').mockImplementation(() => {});
      
      await expect(authService.getCurrentUser()).rejects.toThrow('获取用户信息失败');
      expect(clearAuthDataSpy).toHaveBeenCalled();
    });
    
    it('should clear auth data and throw an error when response is empty', async () => {
      // 存储token
      localStorage.setItem('ai-notes-token', 'test-token');
      
      // 模拟fetch返回空响应
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('')
      });
      
      // 模拟clearAuthData方法
      const clearAuthDataSpy = jest.spyOn(authService, 'clearAuthData').mockImplementation(() => {});
      
      await expect(authService.getCurrentUser()).rejects.toThrow('获取用户信息失败，响应为空');
      expect(clearAuthDataSpy).toHaveBeenCalled();
    });
  });
});
