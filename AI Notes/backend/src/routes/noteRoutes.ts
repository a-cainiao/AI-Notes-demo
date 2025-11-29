import { Router } from 'express';
import { NoteController } from '../controllers/noteController';
import { authMiddleware } from '../middleware/authMiddleware';

/**
 * 笔记路由
 * 定义笔记的CRUD API路由
 */
export const noteRouter = Router();

// 应用认证中间件，保护所有笔记路由
noteRouter.use(authMiddleware);

// 获取用户的所有笔记
noteRouter.get('/', NoteController.getAllNotes);

// 获取指定笔记
noteRouter.get('/:id', NoteController.getNoteById);

// 创建新笔记
noteRouter.post('/', NoteController.createNote);

// 更新笔记
noteRouter.put('/:id', NoteController.updateNote);

// 删除笔记
noteRouter.delete('/:id', NoteController.deleteNote);
