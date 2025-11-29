import { Request, Response } from 'express';
import { LogModel } from '../models/log';
import { CreateLogRequest } from '../types';

/**
 * 日志控制器
 * 处理日志相关的HTTP请求
 */
export class LogController {
  /**
   * 获取用户的所有日志
   * @param req 请求对象
   * @param res 响应对象
   */
  static async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const logs = await LogModel.findByUserId(userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: '获取日志失败', error });
    }
  }

  /**
   * 获取指定日志
   * @param req 请求对象
   * @param res 响应对象
   */
  static async getLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const log = await LogModel.findById(id, userId);
      
      if (!log) {
        res.status(404).json({ message: '日志不存在' });
        return;
      }
      
      res.json(log);
    } catch (error) {
      res.status(500).json({ message: '获取日志失败', error });
    }
  }

  /**
   * 创建日志
   * @param req 请求对象
   * @param res 响应对象
   */
  static async createLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const logData: CreateLogRequest = req.body;
      const log = await LogModel.create(logData, userId);
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ message: '创建日志失败', error });
    }
  }

  /**
   * 删除日志
   * @param req 请求对象
   * @param res 响应对象
   */
  static async deleteLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const success = await LogModel.delete(id, userId);
      
      if (!success) {
        res.status(404).json({ message: '日志不存在' });
        return;
      }
      
      res.json({ message: '日志删除成功' });
    } catch (error) {
      res.status(500).json({ message: '删除日志失败', error });
    }
  }

  /**
   * 删除所有日志
   * @param req 请求对象
   * @param res 响应对象
   */
  static async deleteAllLogs(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      await LogModel.deleteAll(userId);
      res.json({ message: '所有日志删除成功' });
    } catch (error) {
      res.status(500).json({ message: '删除日志失败', error });
    }
  }
}
