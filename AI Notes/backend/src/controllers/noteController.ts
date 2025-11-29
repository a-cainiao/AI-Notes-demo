import { Request, Response } from 'express';
import { NoteService } from '../services/noteService';
import { CreateNoteRequest, UpdateNoteRequest } from '../types';

/**
 * 笔记控制器
 * 处理笔记的CRUD请求
 */
export class NoteController {
  /**
   * 获取用户的所有笔记
   * @param req 请求对象
   * @param res 响应对象
   */
  static async getAllNotes(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userId = req.user.id;
      const notes = await NoteService.getAllNotes(userId);
      res.status(200).json(notes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * 获取指定笔记
   * @param req 请求对象
   * @param res 响应对象
   */
  static async getNoteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // @ts-ignore
      const userId = req.user.id;
      const note = await NoteService.getNoteById(id, userId);
      
      if (!note) {
        res.status(404).json({ message: '笔记不存在' });
        return;
      }
      
      res.status(200).json(note);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * 创建新笔记
   * @param req 请求对象
   * @param res 响应对象
   */
  static async createNote(req: Request, res: Response): Promise<void> {
    try {
      const noteData: CreateNoteRequest = req.body;
      // @ts-ignore
      const userId = req.user.id;
      const note = await NoteService.createNote(noteData, userId);
      res.status(201).json(note);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * 更新笔记
   * @param req 请求对象
   * @param res 响应对象
   */
  static async updateNote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const noteData: UpdateNoteRequest = req.body;
      // @ts-ignore
      const userId = req.user.id;
      const note = await NoteService.updateNote(id, noteData, userId);
      
      if (!note) {
        res.status(404).json({ message: '笔记不存在' });
        return;
      }
      
      res.status(200).json(note);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * 删除笔记
   * @param req 请求对象
   * @param res 响应对象
   */
  static async deleteNote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // @ts-ignore
      const userId = req.user.id;
      const success = await NoteService.deleteNote(id, userId);
      
      if (!success) {
        res.status(404).json({ message: '笔记不存在' });
        return;
      }
      
      res.status(200).json({ message: '笔记删除成功' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
