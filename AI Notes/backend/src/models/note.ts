import { pool } from '../config/database';
import { Note, CreateNoteRequest, UpdateNoteRequest } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { CategoryModel } from './category';
import { TagModel } from './tag';

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
    // 获取所有笔记
    const [noteRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );

    const notes: Note[] = [];

    // 为每个笔记获取分类和标签
    for (const noteRow of noteRows as any[]) {
      // 获取分类
      let category = null;
      if (noteRow.category_id) {
        category = await CategoryModel.findById(noteRow.category_id, userId);
      }

      // 获取标签
      const [tagIdsRows] = await pool.execute<RowDataPacket[]>(
        'SELECT tag_id FROM note_tags WHERE note_id = ?',
        [noteRow.id]
      );
      const tagIds = (tagIdsRows as any[]).map(row => row.tag_id);
      const tags = await TagModel.findByIds(tagIds, userId);

      // 构建笔记对象
      notes.push({
        ...noteRow,
        categoryId: noteRow.category_id,
        category,
        tags,
        createdAt: new Date(noteRow.created_at),
        updatedAt: new Date(noteRow.updated_at)
      });
    }

    return notes;
  }

  /**
   * 根据ID查找笔记
   * @param id 笔记ID
   * @param userId 用户ID
   * @returns 笔记信息或null
   */
  static async findById(id: string, userId: number): Promise<Note | null> {
    // 获取笔记基本信息
    const [noteRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (noteRows.length === 0) {
      return null;
    }

    const noteRow = noteRows[0] as any;

    // 获取分类
    let category = null;
    if (noteRow.category_id) {
      category = await CategoryModel.findById(noteRow.category_id, userId);
    }

    // 获取标签
    const [tagIdsRows] = await pool.execute<RowDataPacket[]>(
      'SELECT tag_id FROM note_tags WHERE note_id = ?',
      [id]
    );
    const tagIds = (tagIdsRows as any[]).map(row => row.tag_id);
    const tags = await TagModel.findByIds(tagIds, userId);

    // 构建笔记对象
    return {
      ...noteRow,
      categoryId: noteRow.category_id,
      category,
      tags,
      createdAt: new Date(noteRow.created_at),
      updatedAt: new Date(noteRow.updated_at)
    };
  }

  /**
   * 创建新笔记
   * @param noteData 笔记数据
   * @param userId 用户ID
   * @returns 创建的笔记信息
   */
  static async create(noteData: CreateNoteRequest, userId: number): Promise<Note> {
    const { title, content, categoryId = null, tagIds = [] } = noteData;
    const id = this.generateId();
    const createdAt = new Date();
    const updatedAt = new Date();

    // 开始事务
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 创建笔记
      await connection.execute(
        'INSERT INTO notes (id, user_id, title, content, category_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, userId, title, content, categoryId, createdAt, updatedAt]
      );

      // 添加标签关联
      if (tagIds.length > 0) {
        const tagValues = tagIds.map(tagId => [id, tagId]);
        await connection.execute(
          'INSERT INTO note_tags (note_id, tag_id) VALUES ?',
          [tagValues]
        );
      }

      await connection.commit();

      // 获取完整的笔记信息（包含分类和标签）
      const note = await this.findById(id, userId);
      if (!note) {
        throw new Error('创建笔记失败');
      }

      return note;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 更新笔记
   * @param id 笔记ID
   * @param noteData 笔记更新数据
   * @param userId 用户ID
   * @returns 更新后的笔记信息或null
   */
  static async update(id: string, noteData: UpdateNoteRequest, userId: number): Promise<Note | null> {
    const { title, content, categoryId, tagIds } = noteData;
    const updatedAt = new Date();

    // 开始事务
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

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

      if (categoryId !== undefined) {
        updates.push('category_id = ?');
        values.push(categoryId);
      }

      updates.push('updated_at = ?');
      values.push(updatedAt);
      values.push(id);
      values.push(userId);

      // 更新笔记基本信息
      await connection.execute(
        `UPDATE notes SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      );

      // 更新标签关联
      if (tagIds !== undefined) {
        // 删除旧的标签关联
        await connection.execute(
          'DELETE FROM note_tags WHERE note_id = ?',
          [id]
        );

        // 添加新的标签关联
        if (tagIds.length > 0) {
          const tagValues = tagIds.map(tagId => [id, tagId]);
          await connection.execute(
            'INSERT INTO note_tags (note_id, tag_id) VALUES ?',
            [tagValues]
          );
        }
      }

      await connection.commit();

      // 获取完整的笔记信息（包含分类和标签）
      return await this.findById(id, userId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 删除笔记
   * @param id 笔记ID
   * @param userId 用户ID
   * @returns 是否删除成功
   */
  static async delete(id: string, userId: number): Promise<boolean> {
    // 开始事务
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 删除标签关联
      await connection.execute(
        'DELETE FROM note_tags WHERE note_id = ?',
        [id]
      );

      // 删除笔记
      const [result] = await connection.execute<ResultSetHeader>(
        'DELETE FROM notes WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      await connection.commit();

      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 生成唯一ID
   * @returns 唯一ID
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }
}
