import { pool } from '../config/database';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * 分类模型
 * 负责处理分类数据的数据库操作
 */
export class CategoryModel {
  /**
   * 获取用户的所有分类
   * @param userId 用户ID
   * @returns 分类列表
   */
  static async findByUserId(userId: number): Promise<Category[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows as Category[];
  }

  /**
   * 根据ID查找分类
   * @param id 分类ID
   * @param userId 用户ID
   * @returns 分类信息或null
   */
  static async findById(id: string, userId: number): Promise<Category | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0] as Category || null;
  }

  /**
   * 创建新分类
   * @param categoryData 分类数据
   * @param userId 用户ID
   * @returns 创建的分类信息
   */
  static async create(categoryData: CreateCategoryRequest, userId: number): Promise<Category> {
    const { name } = categoryData;
    const id = this.generateId();
    const createdAt = new Date();
    const updatedAt = new Date();

    await pool.execute(
      'INSERT INTO categories (id, user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
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
   * 更新分类
   * @param id 分类ID
   * @param categoryData 分类更新数据
   * @param userId 用户ID
   * @returns 更新后的分类信息或null
   */
  static async update(id: string, categoryData: UpdateCategoryRequest, userId: number): Promise<Category | null> {
    const { name } = categoryData;
    const updatedAt = new Date();

    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE categories SET name = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      [name, updatedAt, id, userId]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id, userId);
  }

  /**
   * 删除分类
   * @param id 分类ID
   * @param userId 用户ID
   * @returns 是否删除成功
   */
  static async delete(id: string, userId: number): Promise<boolean> {
    // 首先将使用该分类的笔记的categoryId设置为null
    await pool.execute(
      'UPDATE notes SET category_id = NULL WHERE category_id = ? AND user_id = ?',
      [id, userId]
    );

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
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
