import { Request, Response } from 'express';
import { TagModel } from '../models/tag';
import { CreateTagRequest, UpdateTagRequest } from '../types';

/**
 * 标签控制器
 * 处理标签相关的 HTTP 请求
 */
export class TagController {
  /**
   * 获取用户的所有标签
   * @param req 请求对象
   * @param res 响应对象
   */
  static async getAllTags(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const tags = await TagModel.findByUserId(userId);
      res.status(200).json(tags);
    } catch (error) {
      console.error('获取标签失败:', error);
      res.status(500).json({ error: '获取标签失败' });
    }
  }

  /**
   * 获取单个标签
   * @param req 请求对象
   * @param res 响应对象
   */
  static async getTagById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const tag = await TagModel.findById(id, userId);
      if (!tag) {
        return res.status(404).json({ error: '标签不存在' });
      }
      res.status(200).json(tag);
    } catch (error) {
      console.error('获取标签失败:', error);
      res.status(500).json({ error: '获取标签失败' });
    }
  }

  /**
   * 创建标签
   * @param req 请求对象
   * @param res 响应对象
   */
  static async createTag(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const tagData: CreateTagRequest = req.body;
      const tag = await TagModel.create(tagData, userId);
      res.status(201).json(tag);
    } catch (error) {
      console.error('创建标签失败:', error);
      res.status(500).json({ error: '创建标签失败' });
    }
  }

  /**
   * 更新标签
   * @param req 请求对象
   * @param res 响应对象
   */
  static async updateTag(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const tagData: UpdateTagRequest = req.body;
      const tag = await TagModel.update(id, tagData, userId);
      if (!tag) {
        return res.status(404).json({ error: '标签不存在' });
      }
      res.status(200).json(tag);
    } catch (error) {
      console.error('更新标签失败:', error);
      res.status(500).json({ error: '更新标签失败' });
    }
  }

  /**
   * 删除标签
   * @param req 请求对象
   * @param res 响应对象
   */
  static async deleteTag(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const success = await TagModel.delete(id, userId);
      if (!success) {
        return res.status(404).json({ error: '标签不存在' });
      }
      res.status(200).json({ message: '标签删除成功' });
    } catch (error) {
      console.error('删除标签失败:', error);
      res.status(500).json({ error: '删除标签失败' });
    }
  }
}
