import { Note } from '../types/note';

/**
 * 笔记本地存储服务
 * 负责处理笔记数据的持久化和 CRUD 操作
 */
class NoteService {
  private readonly STORAGE_KEY = 'ai-notes-app';

  /**
   * 获取所有笔记
   */
  getAllNotes(): Note[] {
    try {
      const notesJson = localStorage.getItem(this.STORAGE_KEY);
      if (notesJson) {
        const notes = JSON.parse(notesJson);
        // 将字符串日期转换为 Date 对象
        return notes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get notes from localStorage:', error);
      return [];
    }
  }

  /**
   * 根据 ID 获取笔记
   */
  getNoteById(id: string): Note | undefined {
    const notes = this.getAllNotes();
    return notes.find(note => note.id === id);
  }

  /**
   * 创建新笔记
   */
  createNote(title: string = '新笔记', content: string = ''): Note {
    const newNote: Note = {
      id: this.generateId(),
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const notes = this.getAllNotes();
    notes.unshift(newNote); // 新笔记放在最前面
    this.saveNotes(notes);
    return newNote;
  }

  /**
   * 更新笔记
   */
  updateNote(id: string, updates: Partial<Note>): Note | undefined {
    const notes = this.getAllNotes();
    const index = notes.findIndex(note => note.id === id);

    if (index === -1) {
      return undefined;
    }

    const updatedNote: Note = {
      ...notes[index],
      ...updates,
      updatedAt: new Date()
    };

    notes[index] = updatedNote;
    this.saveNotes(notes);
    return updatedNote;
  }

  /**
   * 删除笔记
   */
  deleteNote(id: string): boolean {
    const notes = this.getAllNotes();
    const newNotes = notes.filter(note => note.id !== id);

    if (newNotes.length === notes.length) {
      return false; // 没有找到要删除的笔记
    }

    this.saveNotes(newNotes);
    return true;
  }

  /**
   * 保存笔记到本地存储
   */
  private saveNotes(notes: Note[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error);
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
}

// 导出单例实例
export const noteService = new NoteService();