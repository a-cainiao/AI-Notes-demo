import { UserModel } from '../models/user';
import { RegisterRequest, LoginRequest, LoginResponse } from '../types';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

/**
 * 认证服务
 * 负责处理用户注册、登录和认证相关逻辑
 */
export class AuthService {
  /**
   * 用户注册
   * @param registerData 注册数据
   * @returns 登录响应（包含token和用户信息）
   */
  static async register(registerData: RegisterRequest): Promise<LoginResponse> {
    const { username, password, phone, email } = registerData;

    // 检查手机号是否已存在
    const existingUserByPhone = await UserModel.findByPhone(phone);
    if (existingUserByPhone) {
      throw new Error('该手机号已被注册');
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await UserModel.findByEmail(email);
    if (existingUserByEmail) {
      throw new Error('该邮箱已被注册');
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建用户
    const user = await UserModel.create({
      username,
      password: hashedPassword,
      phone,
      email
    });

    // 生成JWT令牌
    const token = generateToken({ userId: user.id });

    // 返回登录响应
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
  }

  /**
   * 用户登录
   * @param loginData 登录数据
   * @returns 登录响应（包含token和用户信息）
   */
  static async login(loginData: LoginRequest): Promise<LoginResponse> {
    const { phone, password } = loginData;

    // 查找用户
    const user = await UserModel.findByPhone(phone);
    if (!user) {
      throw new Error('手机号或密码错误');
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('手机号或密码错误');
    }

    // 生成JWT令牌
    const token = generateToken({ userId: user.id });

    // 返回登录响应
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
  }

  /**
   * 获取当前用户信息
   * @param userId 用户ID
   * @returns 用户信息
   */
  static async getCurrentUser(userId: number) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 返回不包含密码的用户信息
    return {
      id: user.id,
      username: user.username,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
