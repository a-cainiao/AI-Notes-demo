import { pool } from '../config/database';
import { Note, CreateNoteRequest, UpdateNoteRequest } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * 笔记模型
 * 负责处理笔记数据的数据库操作
 */
export class NoteModel {
  /**
   * 获取用户的所有笔记
   * @param userId 用户ID
   * @returns 笔记列表
   */
  static async findByUserId(userId: number): Promise<Note[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    return rows as Note[];
  }

  /**
   * 根据ID查找笔记
   * @param id 笔记ID
   * @param userId 用户ID
   * @returns 笔记信息或null
   */
  static async findById(id: string, userId: number): Promise<Note | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0] as Note || null;
  }

  /**
   * 创建新笔记
   * @param noteData 笔记数据
   * @param userId 用户ID
   * @returns 创建的笔记信息
   */
  static async create(noteData: CreateNoteRequest, userId: number): Promise<Note> {
    const { title, content } = noteData;
    const id = this.generateId();
    const createdAt = new Date();
    const updatedAt = new Date();

    await pool.execute(
      'INSERT INTO notes (id, user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId, title, content, createdAt, updatedAt]
    );

    return {
      id,
      userId,
      title,
      content,
      createdAt,
      updatedAt
    };
  }

  /**
   * 更新笔记
   * @param id 笔记ID
   * @param noteData 笔记更新数据
   * @param userId 用户ID
   * @returns 更新后的笔记信息或null
   */
  static async update(id: string, noteData: UpdateNoteRequest, userId: number): Promise<Note | null> {
    const { title, content } = noteData;
    const updatedAt = new Date();

    // 构建更新语句
    const updates: string[] = [];
    const values: any[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }

    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }

    updates.push('updated_at = ?');
    values.push(updatedAt);
    values.push(id);
    values.push(userId);

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE notes SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id, userId);
  }

  /**
   * 删除笔记
   * @param id 笔记ID
   * @param userId 用户ID
   * @returns 是否删除成功
   */
  static async delete(id: string, userId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
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
