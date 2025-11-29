import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authMiddleware } from '../middleware/authMiddleware';

/**
 * 分类路由
 * 定义分类相关的 API 路由
 */
export const categoryRoutes = Router();

// 应用认证中间件
categoryRoutes.use(authMiddleware);

/**
 * 获取用户的所有分类
 * GET /api/categories
 */
categoryRoutes.get('/', CategoryController.getAllCategories);

/**
 * 获取单个分类
 * GET /api/categories/:id
 */
categoryRoutes.get('/:id', CategoryController.getCategoryById);

/**
 * 创建分类
 * POST /api/categories
 */
categoryRoutes.post('/', CategoryController.createCategory);

/**
 * 更新分类
 * PUT /api/categories/:id
 */
categoryRoutes.put('/:id', CategoryController.updateCategory);

/**
 * 删除分类
 * DELETE /api/categories/:id
 */
categoryRoutes.delete('/:id', CategoryController.deleteCategory);
