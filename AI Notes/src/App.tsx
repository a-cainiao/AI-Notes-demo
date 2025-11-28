import React, { useState, useEffect } from 'react';
import NotesList from './components/NotesList';
import NoteDetail from './components/NoteDetail';
import AIModal from './components/AIModal';
import ApiKeyModal from './components/ApiKeyModal';
import Logs from './components/Logs';
import { Note } from './types/note';
import { noteService } from './services/noteService';
import { aiService } from './services/aiService';

/**
 * 主应用组件
 * 集成所有组件，实现完整的 AI 笔记应用功能
 */
const App: React.FC = () => {
  // 笔记相关状态
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  // AI 相关状态
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<string[]>([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isSelection, setIsSelection] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const contentRef = React.useRef<HTMLTextAreaElement>(null);
  
  // 初始化：加载笔记和检查 API Key
  useEffect(() => {
    // 加载所有笔记
    const loadedNotes = noteService.getAllNotes();
    setNotes(loadedNotes);
    
    // 如果有笔记，默认选中第一个
    if (loadedNotes.length > 0) {
      const firstNote = loadedNotes[0];
      setSelectedNoteId(firstNote.id);
      setSelectedNote(firstNote);
    }
    
    // 检查是否已设置 API Key，如果没有则显示设置弹窗
    const hasApiKey = !!aiService.getApiKey();
    if (!hasApiKey) {
      setIsApiKeyModalOpen(true);
    }
  }, []);
  
  // 当选中的笔记 ID 变化时，更新选中的笔记
  useEffect(() => {
    if (selectedNoteId) {
      const note = noteService.getNoteById(selectedNoteId);
      setSelectedNote(note ?? null);
    } else {
      setSelectedNote(null);
    }
  }, [selectedNoteId]);
  
  /**
   * 创建新笔记
   */
  const handleCreateNote = () => {
    const newNote = noteService.createNote();
    const updatedNotes = noteService.getAllNotes();
    setNotes(updatedNotes);
    setSelectedNoteId(newNote.id);
    setSelectedNote(newNote);
  };
  
  /**
   * 选择笔记
   */
  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
  };
  
  /**
   * 更新笔记
   */
  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    noteService.updateNote(id, updates);
    const updatedNotes = noteService.getAllNotes();
    setNotes(updatedNotes);
    
    // 更新当前选中的笔记
    if (selectedNoteId === id) {
      const updatedNote = noteService.getNoteById(id);
      if (updatedNote) {
        setSelectedNote(updatedNote);
      }
    }
  };
  
  /**
   * 删除笔记
   */
  const handleDeleteNote = (id: string) => {
    noteService.deleteNote(id);
    const updatedNotes = noteService.getAllNotes();
    setNotes(updatedNotes);
    
    // 如果删除的是当前选中的笔记，重新选择第一个笔记或取消选择
    if (selectedNoteId === id) {
      if (updatedNotes.length > 0) {
        setSelectedNoteId(updatedNotes[0].id);
        setSelectedNote(updatedNotes[0]);
      } else {
        setSelectedNoteId(null);
        setSelectedNote(null);
      }
    }
  };
  
  /**
   * 触发 AI 处理
   */
  const handleAIProcess = (text: string, isSelection: boolean, start: number = 0, end: number = 0) => {
    // 检查是否已设置 API Key
    const hasApiKey = !!aiService.getApiKey();
    if (!hasApiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }
    
    // 打开 AI 悬浮框，开始 AI 处理
    setIsAIModalOpen(true);
    setIsAIProcessing(true);
    setAiResult([]);
    setIsSelection(isSelection);
    setOriginalText(text);
    setSelectionStart(start);
    setSelectionEnd(end);
    
    // 调用 AI 服务处理文本
    aiService.processText(
      text,
      (chunk) => {
        // 流式响应回调，使用 requestAnimationFrame 调度更新
        requestAnimationFrame(() => {
          // 使用数组 push 而非字符串拼接
          setAiResult(prev => [...prev, chunk]);
        });
      },
      () => {
        // 完成回调
        setIsAIProcessing(false);
      },
      (error) => {
        // 错误回调
        console.error('AI processing error:', error);
        requestAnimationFrame(() => {
          setAiResult([`AI 处理失败: ${error.message}`]);
        });
        setIsAIProcessing(false);
      }
    );
  };
  
  /**
   * 接受 AI 结果
   */
  const handleAcceptAIResult = () => {
    if (!selectedNote) return;
    
    let newContent = selectedNote.content;
    const aiResultText = aiResult.join('');
    
    if (isSelection && selectionStart !== null && selectionEnd !== null) {
      // 使用保存的选择范围替换文本
      newContent = newContent.substring(0, selectionStart) + aiResultText + newContent.substring(selectionEnd);
    } else {
      // 替换整篇笔记内容
      newContent = aiResultText;
    }
    
    // 更新笔记内容
    handleUpdateNote(selectedNote.id, { content: newContent });
    
    // 关闭 AI 悬浮框
    setIsAIModalOpen(false);
  };
  
  /**
   * 丢弃 AI 结果
   */
  const handleDiscardAIResult = () => {
    setIsAIModalOpen(false);
    setAiResult([]);
    setIsAIProcessing(false);
  };
  
  /**
   * 关闭 AI 悬浮框
   */
  const handleCloseAIModal = () => {
    if (!isAIProcessing) {
      setIsAIModalOpen(false);
      setAiResult([]);
      setIsAIProcessing(false);
    }
  };
  
  /**
   * 关闭 API Key 悬浮框
   */
  const handleCloseApiKeyModal = () => {
    setIsApiKeyModalOpen(false);
  };
  
  /**
   * API Key 设置完成
   */
  const handleApiKeySet = () => {
    // API Key 设置完成，无需额外操作
  };

  /**
   * 打开 API Key 设置弹窗
   */
  const handleOpenSettings = () => {
    setIsApiKeyModalOpen(true);
  };

  /**
   * API Key 删除完成
   */
  const handleApiKeyDeleted = () => {
    // API Key 删除完成，无需额外操作
  };

  /**
   * 打开日志模态框
   */
  const handleOpenLogs = () => {
    setIsLogsModalOpen(true);
  };

  /**
   * 关闭日志模态框
   */
  const handleCloseLogs = () => {
    setIsLogsModalOpen(false);
  };
  
  return (
    <div className="app-container">
      <NotesList
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onOpenSettings={handleOpenSettings}
        onOpenLogs={handleOpenLogs}
      />
      <NoteDetail
        note={selectedNote}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={handleDeleteNote}
        onAIProcess={handleAIProcess}
        contentRef={contentRef}
      />
      <AIModal
        isOpen={isAIModalOpen}
        aiResult={aiResult}
        isLoading={isAIProcessing}
        onAccept={handleAcceptAIResult}
        onDiscard={handleDiscardAIResult}
        onClose={handleCloseAIModal}
      />
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={handleCloseApiKeyModal}
        onApiKeySet={handleApiKeySet}
        onApiKeyDeleted={handleApiKeyDeleted}
      />
      <Logs
        isOpen={isLogsModalOpen}
        onClose={handleCloseLogs}
      />
    </div>
  );
};

export default App;