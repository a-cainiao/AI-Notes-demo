import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Note } from '../types/note';

/**
 * AI 处理类型
 */
export type AIProcessType = 'expand' | 'rewrite' | 'summarize';

interface NoteDetailProps {
  /** 当前选中的笔记 */
  note: Note | null;
  /** 更新笔记的回调函数 */
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  /** 删除笔记的回调函数 */
  onDeleteNote: (id: string) => void;
  /** 触发 AI 处理的回调函数 */
  onAIProcess: (text: string, isSelection: boolean, processType: AIProcessType, start?: number, end?: number) => void;
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
  // 防抖定时器 ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 自动保存间隔（毫秒）
  const AUTO_SAVE_INTERVAL = 30000;

  // 当选中的笔记变化时，更新本地状态并清除防抖定时器
  useEffect(() => {
    // 清除之前的防抖定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 防抖处理更新笔记
  const debouncedUpdateNote = useCallback((id: string) => {
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 设置新的定时器，直接使用当前state的title和content
    debounceTimerRef.current = setTimeout(() => {
      onUpdateNote(id, { title, content });
    }, AUTO_SAVE_INTERVAL);
  }, [onUpdateNote, title, content]);

  // 处理标题变化
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (note) {
      debouncedUpdateNote(note.id);
    }
  };

  // 处理内容变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (note) {
      debouncedUpdateNote(note.id);
    }
  };

  // 处理删除笔记
  const handleDeleteNote = () => {
    if (note) {
      onDeleteNote(note.id);
    }
  };

  // 处理手动保存
  const handleSaveNote = () => {
    if (note) {
      // 清除现有的防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      // 立即保存当前内容
      onUpdateNote(note.id, { title, content });
    }
  };

  // 处理 AI 处理按钮点击
  const handleAIProcess = (processType: AIProcessType) => {
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

    onAIProcess(selectedText, isSelection, processType, start, end);
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
            className="save-btn"
            onClick={handleSaveNote}
          >
            保存
          </button>
          <button 
            className="ai-btn"
            onClick={() => handleAIProcess('rewrite')}
          >
            重写
          </button>
          <button 
            className="ai-btn"
            onClick={() => handleAIProcess('expand')}
          >
            扩展
          </button>
          <button 
            className="ai-btn"
            onClick={() => handleAIProcess('summarize')}
          >
            总结
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