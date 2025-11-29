import { Request, Response } from 'express';
import { CategoryModel } from '../models/category';
import { CreateCategoryRequest, UpdateCategoryRequest } from '../types';

/**
 * 分类控制器
 * 处理分类相关的 HTTP 请求
 */
export class CategoryController {
  /**
   * 获取用户的所有分类
   * @param req 请求对象
   * @param res 响应对象
   */
  static async getAllCategories(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const categories = await CategoryModel.findByUserId(userId);
      res.status(200).json(categories);
    } catch (error) {
      console.error('获取分类失败:', error);
      res.status(500).json({ error: '获取分类失败' });
    }
  }

  /**
   * 获取单个分类
   * @param req 请求对象
   * @param res 响应对象
   */
  static async getCategoryById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const category = await CategoryModel.findById(id, userId);
      if (!category) {
        return res.status(404).json({ error: '分类不存在' });
      }
      res.status(200).json(category);
    } catch (error) {
      console.error('获取分类失败:', error);
      res.status(500).json({ error: '获取分类失败' });
    }
  }

  /**
   * 创建分类
   * @param req 请求对象
   * @param res 响应对象
   */
  static async createCategory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const categoryData: CreateCategoryRequest = req.body;
      const category = await CategoryModel.create(categoryData, userId);
      res.status(201).json(category);
    } catch (error) {
      console.error('创建分类失败:', error);
      res.status(500).json({ error: '创建分类失败' });
    }
  }

  /**
   * 更新分类
   * @param req 请求对象
   * @param res 响应对象
   */
  static async updateCategory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const categoryData: UpdateCategoryRequest = req.body;
      const category = await CategoryModel.update(id, categoryData, userId);
      if (!category) {
        return res.status(404).json({ error: '分类不存在' });
      }
      res.status(200).json(category);
    } catch (error) {
      console.error('更新分类失败:', error);
      res.status(500).json({ error: '更新分类失败' });
    }
  }

  /**
   * 删除分类
   * @param req 请求对象
   * @param res 响应对象
   */
  static async deleteCategory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const success = await CategoryModel.delete(id, userId);
      if (!success) {
        return res.status(404).json({ error: '分类不存在' });
      }
      res.status(200).json({ message: '分类删除成功' });
    } catch (error) {
      console.error('删除分类失败:', error);
      res.status(500).json({ error: '删除分类失败' });
    }
  }
}
