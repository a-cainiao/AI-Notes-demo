import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UserModel } from '../models/user';

/**
 * JWT认证中间件
 * 验证请求头中的Authorization token
 * 验证通过后将用户信息添加到req.user中
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 获取Authorization头
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: '缺少认证令牌' });
      return;
    }

    // 提取token，确保格式正确
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ message: '无效的认证令牌格式' });
      return;
    }

    const token = parts[1];
    if (!token) {
      res.status(401).json({ message: '无效的认证令牌' });
      return;
    }

    // 验证token
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      res.status(401).json({ message: '无效的认证令牌' });
      return;
    }

    // 查找用户
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: '用户不存在' });
      return;
    }

    // 将用户信息添加到请求对象中
    // @ts-ignore
    req.user = {
      id: user.id,
      username: user.username,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar
    };

    // 继续处理请求
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    res.status(401).json({ message: '认证失败' });
  }
};
