import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { RegisterRequest, LoginRequest } from '../types';

/**
 * 认证控制器
 * 处理用户注册、登录和获取用户信息请求
 */
export class AuthController {
  /**
   * 用户注册
   * @param req 请求对象
   * @param res 响应对象
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const registerData: RegisterRequest = req.body;
      const result = await AuthService.register(registerData);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * 用户登录
   * @param req 请求对象
   * @param res 响应对象
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;
      const result = await AuthService.login(loginData);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  /**
   * 获取当前用户信息
   * @param req 请求对象
   * @param res 响应对象
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userId = req.user.id;
      const user = await AuthService.getCurrentUser(userId);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
