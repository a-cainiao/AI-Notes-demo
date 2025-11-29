import { Request, Response } from 'express';
import { ApiKeyModel } from '../models/apiKey';
import { CreateApiKeyRequest, UpdateApiKeyRequest } from '../types';

/**
 * API密钥控制器
 * 处理API密钥相关的HTTP请求
 */
export class ApiKeyController {
  /**
   * 获取用户的所有API密钥
   * @param req 请求对象
   * @param res 响应对象
   */
  static async getApiKeys(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const apiKeys = await ApiKeyModel.findByUserId(userId);
      res.json(apiKeys);
    } catch (error) {
      res.status(500).json({ message: '获取API密钥失败', error });
    }
  }

  /**
   * 获取指定API密钥
   * @param req 请求对象
   * @param res 响应对象
   */
  static async getApiKey(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const apiKey = await ApiKeyModel.findById(parseInt(id), userId);
      
      if (!apiKey) {
        res.status(404).json({ message: 'API密钥不存在' });
        return;
      }
      
      res.json(apiKey);
    } catch (error) {
      res.status(500).json({ message: '获取API密钥失败', error });
    }
  }

  /**
   * 创建API密钥
   * @param req 请求对象
   * @param res 响应对象
   */
  static async createApiKey(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const apiKeyData: CreateApiKeyRequest = req.body;
      
      // 检查是否已存在相同提供商和模型的API密钥
      const exists = await ApiKeyModel.exists(
        apiKeyData.provider,
        apiKeyData.model,
        userId
      );
      
      if (exists) {
        res.status(409).json({ message: '该提供商和模型的API密钥已存在' });
        return;
      }
      
      const apiKey = await ApiKeyModel.create(apiKeyData, userId);
      res.status(201).json(apiKey);
    } catch (error) {
      res.status(500).json({ message: '创建API密钥失败', error });
    }
  }

  /**
   * 更新API密钥
   * @param req 请求对象
   * @param res 响应对象
   */
  static async updateApiKey(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const apiKeyData: UpdateApiKeyRequest = req.body;
      
      const updatedApiKey = await ApiKeyModel.update(parseInt(id), apiKeyData, userId);
      
      if (!updatedApiKey) {
        res.status(404).json({ message: 'API密钥不存在' });
        return;
      }
      
      res.json(updatedApiKey);
    } catch (error) {
      res.status(500).json({ message: '更新API密钥失败', error });
    }
  }

  /**
   * 删除API密钥
   * @param req 请求对象
   * @param res 响应对象
   */
  static async deleteApiKey(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const success = await ApiKeyModel.delete(parseInt(id), userId);
      
      if (!success) {
        res.status(404).json({ message: 'API密钥不存在' });
        return;
      }
      
      res.json({ message: 'API密钥删除成功' });
    } catch (error) {
      res.status(500).json({ message: '删除API密钥失败', error });
    }
  }
}
