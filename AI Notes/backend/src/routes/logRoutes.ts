import { Router } from 'express';
import { LogController } from '../controllers/logController';
import { authMiddleware } from '../middleware/authMiddleware';

/**
 * 日志路由
 * 定义日志相关的API路由
 */
const router = Router();

// 应用身份验证中间件
router.use(authMiddleware);

// 获取用户的所有日志
router.get('/logs', LogController.getLogs);

// 获取指定日志
router.get('/logs/:id', LogController.getLog);

// 创建日志
router.post('/logs', LogController.createLog);

// 删除日志
router.delete('/logs/:id', LogController.deleteLog);

// 删除所有日志
router.delete('/logs', LogController.deleteAllLogs);

export default router;
