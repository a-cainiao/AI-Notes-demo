import { pool } from '../config/database';
import { Tag, CreateTagRequest, UpdateTagRequest } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * 标签模型
 * 负责处理标签数据的数据库操作
 */
export class TagModel {
  /**
   * 获取用户的所有标签
   * @param userId 用户ID
   * @returns 标签列表
   */
  static async findByUserId(userId: number): Promise<Tag[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tags WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows as Tag[];
  }

  /**
   * 根据ID查找标签
   * @param id 标签ID
   * @param userId 用户ID
   * @returns 标签信息或null
   */
  static async findById(id: string, userId: number): Promise<Tag | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tags WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0] as Tag || null;
  }

  /**
   * 根据ID列表查找标签
   * @param ids 标签ID列表
   * @param userId 用户ID
   * @returns 标签列表
   */
  static async findByIds(ids: string[], userId: number): Promise<Tag[]> {
    if (ids.length === 0) {
      return [];
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM tags WHERE user_id = ? AND id IN (${ids.map(() => '?').join(',')})`,
      [userId, ...ids]
    );
    return rows as Tag[];
  }

  /**
   * 创建新标签
   * @param tagData 标签数据
   * @param userId 用户ID
   * @returns 创建的标签信息
   */
  static async create(tagData: CreateTagRequest, userId: number): Promise<Tag> {
    const { name } = tagData;
    const id = this.generateId();
    const createdAt = new Date();
    const updatedAt = new Date();

    await pool.execute(
      'INSERT INTO tags (id, user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [id, userId, name, createdAt, updatedAt]
    );

    return {
      id,
      userId,
      name,
      createdAt,
      updatedAt
    };
  }

  /**
   * 更新标签
   * @param id 标签ID
   * @param tagData 标签更新数据
   * @param userId 用户ID
   * @returns 更新后的标签信息或null
   */
  static async update(id: string, tagData: UpdateTagRequest, userId: number): Promise<Tag | null> {
    const { name } = tagData;
    const updatedAt = new Date();

    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE tags SET name = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      [name, updatedAt, id, userId]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id, userId);
  }

  /**
   * 删除标签
   * @param id 标签ID
   * @param userId 用户ID
   * @returns 是否删除成功
   */
  static async delete(id: string, userId: number): Promise<boolean> {
    // 首先删除关联表中的记录
    await pool.execute(
      'DELETE FROM note_tags WHERE tag_id = ?',
      [id]
    );

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM tags WHERE id = ? AND user_id = ?',
      [id, userId]
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
