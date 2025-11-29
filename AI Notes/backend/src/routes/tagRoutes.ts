import { Router } from 'express';
import { TagController } from '../controllers/tagController';
import { authMiddleware } from '../middleware/authMiddleware';

/**
 * 标签路由
 * 定义标签相关的 API 路由
 */
export const tagRoutes = Router();

// 应用认证中间件
tagRoutes.use(authMiddleware);

/**
 * 获取用户的所有标签
 * GET /api/tags
 */
tagRoutes.get('/', TagController.getAllTags);

/**
 * 获取单个标签
 * GET /api/tags/:id
 */
tagRoutes.get('/:id', TagController.getTagById);

/**
 * 创建标签
 * POST /api/tags
 */
tagRoutes.post('/', TagController.createTag);

/**
 * 更新标签
 * PUT /api/tags/:id
 */
tagRoutes.put('/:id', TagController.updateTag);

/**
 * 删除标签
 * DELETE /api/tags/:id
 */
tagRoutes.delete('/:id', TagController.deleteTag);
