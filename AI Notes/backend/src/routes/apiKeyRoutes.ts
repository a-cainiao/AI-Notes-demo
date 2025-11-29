import { Router } from 'express';
import { ApiKeyController } from '../controllers/apiKeyController';
import { authMiddleware } from '../middleware/authMiddleware';

/**
 * API密钥路由
 * 定义API密钥相关的API路由
 */
const router = Router();

// 应用身份验证中间件
router.use(authMiddleware);

// 获取用户的所有API密钥
router.get('/api-keys', ApiKeyController.getApiKeys);

// 获取指定API密钥
router.get('/api-keys/:id', ApiKeyController.getApiKey);

// 创建API密钥
router.post('/api-keys', ApiKeyController.createApiKey);

// 更新API密钥
router.put('/api-keys/:id', ApiKeyController.updateApiKey);

// 删除API密钥
router.delete('/api-keys/:id', ApiKeyController.deleteApiKey);

export default router;
