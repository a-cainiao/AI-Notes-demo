import React from 'react';
import { Note } from '../types/note';

interface NotesListProps {
  /** 笔记列表数据 */
  notes: Note[];
  /** 当前选中的笔记 ID */
  selectedNoteId: string | null;
  /** 选择笔记的回调函数 */
  onSelectNote: (noteId: string) => void;
  /** 创建新笔记的回调函数 */
  onCreateNote: () => void;
  /** 打开设置的回调函数 */
  onOpenSettings?: () => void;
  /** 打开日志的回调函数 */
  onOpenLogs?: () => void;
}

/**
 * 笔记列表组件
 * 显示所有笔记，并支持选择和创建新笔记
 */
const NotesList: React.FC<NotesListProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onOpenSettings,
  onOpenLogs
}) => {
  /**
   * 格式化日期显示
   */
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * 获取笔记内容预览
   */
  const getNotePreview = (content: string): string => {
    // 移除换行符，截取前 100 个字符作为预览
    return content.replace(/\n/g, ' ').slice(0, 100) + (content.length > 100 ? '...' : '');
  };

  return (
    <div className="notes-list">
      <div className="notes-list-header">
        <h2 className="notes-list-title">AI 笔记</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {onOpenLogs && (
            <button 
              className="new-note-btn" 
              onClick={onOpenLogs}
              style={{ backgroundColor: '#28a745' }}
              title="查看 AI 处理日志"
            >
              日志
            </button>
          )}
          {onOpenSettings && (
            <button 
              className="new-note-btn" 
              onClick={onOpenSettings}
              style={{ backgroundColor: '#6c757d' }}
              title="设置 API Key"
            >
              设置
            </button>
          )}
          <button 
            className="new-note-btn" 
            onClick={onCreateNote}
          >
            新建笔记
          </button>
        </div>
      </div>
      <div className="notes-list-content">
        {notes.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            color: '#666',
            fontSize: '14px'
          }}>
            暂无笔记，点击上方按钮创建新笔记
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className={`note-item ${selectedNoteId === note.id ? 'active' : ''}`}
              onClick={() => onSelectNote(note.id)}
            >
              <div className="note-item-title">{note.title}</div>
              <div className="note-item-preview">
                {getNotePreview(note.content)}
              </div>
              <div className="note-item-date">
                {formatDate(note.updatedAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesList;