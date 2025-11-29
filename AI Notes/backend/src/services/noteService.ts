import { NoteModel } from '../models/note';
import { Note, CreateNoteRequest, UpdateNoteRequest } from '../types';

/**
 * 笔记服务
 * 负责处理笔记的CRUD操作
 */
export class NoteService {
  /**
   * 获取用户的所有笔记
   * @param userId 用户ID
   * @returns 笔记列表
   */
  static async getAllNotes(userId: number): Promise<Note[]> {
    return NoteModel.findByUserId(userId);
  }

  /**
   * 获取指定笔记
   * @param id 笔记ID
   * @param userId 用户ID
   * @returns 笔记信息或null
   */
  static async getNoteById(id: string, userId: number): Promise<Note | null> {
    return NoteModel.findById(id, userId);
  }

  /**
   * 创建新笔记
   * @param noteData 笔记数据
   * @param userId 用户ID
   * @returns 创建的笔记信息
   */
  static async createNote(noteData: CreateNoteRequest, userId: number): Promise<Note> {
    return NoteModel.create(noteData, userId);
  }

  /**
   * 更新笔记
   * @param id 笔记ID
   * @param noteData 笔记更新数据
   * @param userId 用户ID
   * @returns 更新后的笔记信息或null
   */
  static async updateNote(id: string, noteData: UpdateNoteRequest, userId: number): Promise<Note | null> {
    return NoteModel.update(id, noteData, userId);
  }

  /**
   * 删除笔记
   * @param id 笔记ID
   * @param userId 用户ID
   * @returns 是否删除成功
   */
  static async deleteNote(id: string, userId: number): Promise<boolean> {
    return NoteModel.delete(id, userId);
  }
}
