import { Note } from '../types/note';
import { authService } from './authService';

/**
 * 笔记 API 服务
 * 负责处理笔记数据的持久化和 CRUD 操作，通过 API 与后端交互
 */
class NoteService {
  private readonly API_URL = '/api/notes';

  /**
   * 获取所有笔记
   */
  async getAllNotes(): Promise<Note[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('未登录');
      }

      const response = await fetch(this.API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取笔记失败');
      }

      // 检查响应体是否为空
      const text = await response.text();
      if (!text) {
        return [];
      }

      const notes = JSON.parse(text);
      // 直接返回笔记，不转换日期为 Date 对象
      return notes;
    } catch (error) {
      console.error('Failed to get notes from API:', error);
      return [];
    }
  }

  /**
   * 根据 ID 获取笔记
   */
  async getNoteById(id: string): Promise<Note | undefined> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('未登录');
      }

      const response = await fetch(`${this.API_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取笔记失败');
      }

      // 检查响应体是否为空
      const text = await response.text();
      if (!text) {
        return undefined;
      }

      const note = JSON.parse(text);
      // 直接返回笔记，不转换日期为 Date 对象
      return note;
    } catch (error) {
      console.error(`Failed to get note ${id} from API:`, error);
      return undefined;
    }
  }

  /**
   * 创建新笔记
   */
  async createNote(title: string = '新笔记', content: string = ''): Promise<Note> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('未登录');
      }

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error('创建笔记失败');
      }

      // 检查响应体是否为空
      const text = await response.text();
      if (!text) {
        throw new Error('创建笔记失败，响应为空');
      }

      const note = JSON.parse(text);
      // 直接返回笔记，不转换日期为 Date 对象
      return note;
    } catch (error) {
      console.error('Failed to create note:', error);
      // 如果 API 调用失败，返回一个临时笔记对象
      const now = new Date();
      return {
        id: this.generateId(),
        title,
        content,
        categoryId: null,
        tags: [],
        createdAt: now,
        updatedAt: now
      };
    }
  }

  /**
   * 更新笔记
   */
  async updateNote(id: string, updates: Partial<Note>): Promise<Note | undefined> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('未登录');
      }

      const response = await fetch(`${this.API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('更新笔记失败');
      }

      const note = await response.json();
      // 直接返回笔记，不转换日期为 Date 对象
      return note;
    } catch (error) {
      console.error(`Failed to update note ${id}:`, error);
      return undefined;
    }
  }

  /**
   * 删除笔记
   */
  async deleteNote(id: string): Promise<boolean> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('未登录');
      }

      const response = await fetch(`${this.API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('删除笔记失败');
      }

      return true;
    } catch (error) {
      console.error(`Failed to delete note ${id}:`, error);
      return false;
    }
  }

  /**
   * 生成唯一 ID（仅用于 API 调用失败时的临时笔记）
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }
}

// 导出单例实例
export const noteService = new NoteService();