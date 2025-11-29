import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

/**
 * 认证路由
 * 定义用户注册、登录和获取用户信息的API路由
 */
export const authRouter = Router();

// 用户注册
authRouter.post('/register', AuthController.register);

// 用户登录
authRouter.post('/login', AuthController.login);

// 获取当前用户信息（需要认证）
authRouter.get('/me', authMiddleware, AuthController.getCurrentUser);
