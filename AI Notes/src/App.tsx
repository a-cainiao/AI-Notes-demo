import React, { useState, useEffect } from 'react';
import NotesList from './components/NotesList';
import NoteDetail, { AIProcessType } from './components/NoteDetail';
import AIModal from './components/AIModal';
import ApiKeyManager from './components/ApiKeyManager';
import Logs from './components/Logs';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import { Note } from './types/note';
import { noteService } from './services/noteService';
import { aiService } from './services/aiService';
import { useAuth } from './contexts/AuthContext';

/**
 * 主应用组件
 * 集成所有组件，实现完整的 AI 笔记应用功能
 */
const App: React.FC = () => {
  // 笔记相关状态
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  
  // AI 相关状态
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<string[]>([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isSelection, setIsSelection] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const contentRef = React.useRef<HTMLTextAreaElement>(null);
  
  // 登录注册相关状态
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  
  // 获取认证上下文
  const { isAuthenticated } = useAuth();
  
  // 初始化：加载笔记
  useEffect(() => {
    const loadNotes = async () => {
      if (isAuthenticated) {
        setIsLoadingNotes(true);
        try {
          // 加载所有笔记
          const loadedNotes = await noteService.getAllNotes();
          setNotes(loadedNotes);
          
          // 如果有笔记，默认选中第一个
          if (loadedNotes.length > 0) {
            const firstNote = loadedNotes[0];
            setSelectedNoteId(firstNote.id);
            setSelectedNote(firstNote);
          }
        } catch (error) {
          console.error('Failed to load notes:', error);
        } finally {
          setIsLoadingNotes(false);
        }
      } else {
        // 未登录时清空笔记
        setNotes([]);
        setSelectedNoteId(null);
        setSelectedNote(null);
      }
    };
    
    loadNotes();
  }, [isAuthenticated]);
  
  // 当选中的笔记 ID 变化时，更新选中的笔记
  useEffect(() => {
    const loadSelectedNote = async () => {
      if (selectedNoteId && isAuthenticated) {
        try {
          const note = await noteService.getNoteById(selectedNoteId);
          setSelectedNote(note ?? null);
        } catch (error) {
          console.error('Failed to load selected note:', error);
          setSelectedNote(null);
        }
      } else {
        setSelectedNote(null);
      }
    };
    
    loadSelectedNote();
  }, [selectedNoteId, isAuthenticated]);
  
  /**
   * 打开登录模态框
   */
  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };
  
  /**
   * 打开注册模态框
   */
  const handleOpenRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };
  
  /**
   * 关闭登录注册模态框
   */
  const handleCloseAuthModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
  };
  
  /**
   * 创建新笔记
   */
  const handleCreateNote = async () => {
    if (!isAuthenticated) {
      handleOpenLoginModal();
      return;
    }
    
    try {
      const newNote = await noteService.createNote();
      const updatedNotes = await noteService.getAllNotes();
      setNotes(updatedNotes);
      setSelectedNoteId(newNote.id);
      setSelectedNote(newNote);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
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
  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    if (!isAuthenticated) return;
    
    try {
      await noteService.updateNote(id, updates);
      const updatedNotes = await noteService.getAllNotes();
      setNotes(updatedNotes);
      
      // 更新当前选中的笔记
      if (selectedNoteId === id) {
        const updatedNote = await noteService.getNoteById(id);
        if (updatedNote) {
          setSelectedNote(updatedNote);
        }
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };
  
  /**
   * 删除笔记
   */
  const handleDeleteNote = async (id: string) => {
    if (!isAuthenticated) return;
    
    try {
      const success = await noteService.deleteNote(id);
      if (success) {
        const updatedNotes = await noteService.getAllNotes();
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
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };
  
  /**
   * 触发 AI 处理
   */
  const handleAIProcess = (text: string, isSelection: boolean, processType: AIProcessType, start: number = 0, end: number = 0) => {
    // 检查是否已登录
    if (!isAuthenticated) {
      handleOpenLoginModal();
      return;
    }
    
    // 打开 AI 悬浮框，开始 AI 处理
    setIsAIModalOpen(true);
    setIsAIProcessing(true);
    setAiResult([]);
    setIsSelection(isSelection);
    setSelectionStart(start);
    setSelectionEnd(end);
    
    // 调用 AI 服务处理文本
    aiService.processText(
      text,
      processType,
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
   * 关闭 API Key 管理器
   */
  const handleCloseApiKeyManager = () => {
    setIsApiKeyManagerOpen(false);
  };

  /**
   * 打开 API Key 管理器
   */
  const handleOpenSettings = () => {
    setIsApiKeyManagerOpen(true);
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
        onOpenLoginModal={handleOpenLoginModal}
        isLoading={isLoadingNotes}
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
      <ApiKeyManager
        isOpen={isApiKeyManagerOpen}
        onClose={handleCloseApiKeyManager}
      />
      <Logs
        isOpen={isLogsModalOpen}
        onClose={handleCloseLogs}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseAuthModals}
        onSwitchToRegister={handleOpenRegisterModal}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={handleCloseAuthModals}
        onSwitchToLogin={handleOpenLoginModal}
      />
    </div>
  );
};

export default App;