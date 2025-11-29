import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * 生成JWT令牌
 * @param payload 令牌载荷
 * @returns JWT令牌
 */
export const generateToken = (payload: any): string => {
  const secretKey = JWT_SECRET as jwt.Secret;
  const options: jwt.SignOptions = {
    expiresIn: JWT_EXPIRES_IN as any
  };
  return jwt.sign(payload, secretKey, options);
};

/**
 * 验证JWT令牌
 * @param token JWT令牌
 * @returns 解码后的令牌载荷
 */
export const verifyToken = (token: string): any => {
  const secretKey = JWT_SECRET as jwt.Secret;
  return jwt.verify(token, secretKey);
};
