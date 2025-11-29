import { pool } from '../config/database';
import { User, RegisterRequest } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * 用户模型
 * 负责处理用户数据的数据库操作
 */
export class UserModel {
  /**
   * 根据手机号查找用户
   * @param phone 手机号
   * @returns 用户信息或null
   */
  static async findByPhone(phone: string): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE phone = ?',
      [phone]
    );
    return rows[0] as User || null;
  }

  /**
   * 根据邮箱查找用户
   * @param email 邮箱
   * @returns 用户信息或null
   */
  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] as User || null;
  }

  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户信息或null
   */
  static async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0] as User || null;
  }

  /**
   * 创建新用户
   * @param userData 用户注册数据
   * @returns 创建的用户信息
   */
  static async create(userData: RegisterRequest & { password: string }): Promise<User> {
    const { username, password, phone, email } = userData;
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO users (username, password, phone, email) VALUES (?, ?, ?, ?)',
      [username, password, phone, email]
    );

    return this.findById(result.insertId) as Promise<User>;
  }
}
