import { pool } from '../config/database';
import { Log, CreateLogRequest } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * 日志模型
 * 负责处理日志数据的数据库操作，支持逻辑删除
 */
export class LogModel {
  /**
   * 获取用户的所有未删除日志（支持分页）
   * @param userId 用户ID
   * @param page 页码（从1开始）
   * @param pageSize 每页记录数
   * @returns 日志列表和总记录数
   */
  static async findByUserId(userId: number, page: number = 1, pageSize: number = 10): Promise<{ logs: Log[], total: number }> {
    // 计算偏移量
    const offset = (page - 1) * pageSize;
    
    // 使用query方法代替execute方法，避免参数类型问题
    // 直接在SQL语句中拼接数值参数，因为它们都是安全的数字类型
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM logs WHERE user_id = ${userId} AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`
    );
    
    // 获取总记录数
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM logs WHERE user_id = ${userId} AND deleted_at IS NULL`
    );
    
    const total = countRows[0].total as number;
    
    const logs = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      level: row.level,
      request: JSON.parse(row.request),
      response: JSON.parse(row.response),
      error: row.error,
      createdAt: row.created_at,
      deletedAt: row.deleted_at
    })) as Log[];
    
    return { logs, total };
  }

  /**
   * 根据ID查找日志
   * @param id 日志ID
   * @param userId 用户ID
   * @returns 日志信息或null
   */
  static async findById(id: string, userId: number): Promise<Log | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM logs WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [id, userId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      level: row.level,
      request: JSON.parse(row.request),
      response: JSON.parse(row.response),
      error: row.error,
      createdAt: row.created_at,
      deletedAt: row.deleted_at
    } as Log;
  }

  /**
   * 创建新日志
   * @param logData 日志数据
   * @param userId 用户ID
   * @returns 创建的日志信息
   */
  static async create(logData: CreateLogRequest, userId: number): Promise<Log> {
    const { level, request, response, error } = logData;
    const id = this.generateId();
    const createdAt = new Date();
    
    await pool.execute(
      'INSERT INTO logs (id, user_id, level, request, response, error, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, userId, level, JSON.stringify(request), JSON.stringify(response), error || null, createdAt]
    );
    
    return {
      id,
      userId,
      level,
      request,
      response,
      error,
      createdAt,
      deletedAt: null
    };
  }

  /**
   * 逻辑删除日志
   * @param id 日志ID
   * @param userId 用户ID
   * @returns 是否删除成功
   */
  static async delete(id: string, userId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE logs SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [id, userId]
    );
    
    return result.affectedRows > 0;
  }

  /**
   * 逻辑删除用户的所有日志
   * @param userId 用户ID
   * @returns 是否删除成功
   */
  static async deleteAll(userId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE logs SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = ? AND deleted_at IS NULL',
      [userId]
    );
    
    return result.affectedRows > 0;
  }

  /**
   * 生成唯一ID
   * @returns 唯一ID
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }
}
