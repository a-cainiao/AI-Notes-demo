import React, { useState, useRef, useEffect } from 'react';
import { Note } from '../types/note';

interface NoteDetailProps {
  /** 当前选中的笔记 */
  note: Note | null;
  /** 更新笔记的回调函数 */
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  /** 删除笔记的回调函数 */
  onDeleteNote: (id: string) => void;
  /** 触发 AI 处理的回调函数 */
  onAIProcess: (text: string, isSelection: boolean, start?: number, end?: number) => void;
  /** 内容文本域的 ref */
  contentRef?: React.RefObject<HTMLTextAreaElement>;
}

/**
 * 笔记详情组件
 * 显示和编辑笔记内容，支持 AI 处理和删除笔记
 */
const NoteDetail: React.FC<NoteDetailProps> = ({
  note,
  onUpdateNote,
  onDeleteNote,
  onAIProcess,
  contentRef
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const internalContentRef = useRef<HTMLTextAreaElement>(null);
  // 使用外部传入的 ref 或内部 ref
  const textareaRef = contentRef || internalContentRef;

  // 当选中的笔记变化时，更新本地状态
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  // 处理标题变化
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (note) {
      onUpdateNote(note.id, { title: newTitle });
    }
  };

  // 处理内容变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (note) {
      onUpdateNote(note.id, { content: newContent });
    }
  };

  // 处理删除笔记
  const handleDeleteNote = () => {
    if (note) {
      onDeleteNote(note.id);
    }
  };

  // 处理 AI 处理按钮点击
  const handleAIProcess = () => {
    if (!note) return;

    const textarea = textareaRef.current;
    let selectedText = '';
    let start = 0;
    let end = note.content.length;
    let isSelection = false;

    if (textarea) {
      // 获取文本域中的选中文本和位置
      const textareaSelectionStart = textarea.selectionStart;
      const textareaSelectionEnd = textarea.selectionEnd;
      
      if (textareaSelectionStart !== textareaSelectionEnd) {
        selectedText = textarea.value.substring(textareaSelectionStart, textareaSelectionEnd);
        start = textareaSelectionStart;
        end = textareaSelectionEnd;
        isSelection = true;
      }
    } else {
      // 降级处理：获取全局选中文本
      const selection = window.getSelection();
      const globalSelectedText = selection?.toString() || '';
      if (globalSelectedText) {
        selectedText = globalSelectedText;
        isSelection = true;
      }
    }

    if (!selectedText) {
      // 没有选中文本，处理整篇笔记
      selectedText = note.content;
    }

    onAIProcess(selectedText, isSelection, start, end);
  };

  // 如果没有选中笔记，显示提示信息
  if (!note) {
    return (
      <div className="note-detail">
        <div className="note-detail-content" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          color: '#666',
          fontSize: '16px'
        }}>
          请选择或创建一条笔记
        </div>
      </div>
    );
  }

  return (
    <div className="note-detail">
      <div className="note-detail-header">
        <div className="note-detail-actions">
          <button 
            className="ai-btn"
            onClick={handleAIProcess}
          >
            AI 处理
          </button>
          <button 
            className="delete-btn"
            onClick={handleDeleteNote}
          >
            删除
          </button>
        </div>
      </div>
      <div className="note-detail-content">
        <input
          type="text"
          className="note-title-input"
          value={title}
          onChange={handleTitleChange}
          placeholder="请输入笔记标题"
        />
        <textarea
          ref={textareaRef}
          className="note-content-textarea"
          value={content}
          onChange={handleContentChange}
          placeholder="请输入笔记内容"
        />
      </div>
    </div>
  );
};

export default NoteDetail;