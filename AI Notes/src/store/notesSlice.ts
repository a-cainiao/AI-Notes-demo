import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Note } from '../types/note';
import { noteService } from '../services/noteService';

/**
 * 笔记状态类型
 */
interface NotesState {
  /** 笔记列表 */
  notes: Note[];
  /** 当前选中的笔记 */
  selectedNote: Note | null;
  /** 加载状态 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 初始笔记状态
 */
const initialState: NotesState = {
  notes: [],
  selectedNote: null,
  isLoading: false,
  error: null,
};

/**
 * 异步 thunk：获取所有笔记
 */
export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (_, { rejectWithValue }) => {
    try {
      const notes = await noteService.getAllNotes();
      return notes;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * 异步 thunk：创建新笔记
 */
export const addNote = createAsyncThunk(
  'notes/addNote',
  async ({ title, content }: { title: string; content: string }, { rejectWithValue }) => {
    try {
      const note = await noteService.createNote(title, content);
      return note;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * 异步 thunk：更新笔记
 */
export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, updates }: { id: string; updates: Partial<Note> }, { rejectWithValue }) => {
    try {
      const note = await noteService.updateNote(id, updates);
      if (!note) {
        throw new Error('更新笔记失败');
      }
      return note;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * 异步 thunk：删除笔记
 */
export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id: string, { rejectWithValue }) => {
    try {
      const success = await noteService.deleteNote(id);
      if (!success) {
        throw new Error('删除笔记失败');
      }
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * 笔记切片
 */
export const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    /**
     * 选择笔记
     */
    selectNote: (state, action: PayloadAction<Note | null>) => {
      state.selectedNote = action.payload;
    },
    /**
     * 清除选中的笔记
     */
    clearSelectedNote: (state) => {
      state.selectedNote = null;
    },
    /**
     * 清除错误
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 获取所有笔记
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action: PayloadAction<Note[]>) => {
        state.isLoading = false;
        state.notes = action.payload;
        state.error = null;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 创建新笔记
    builder
      .addCase(addNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNote.fulfilled, (state, action: PayloadAction<Note>) => {
        state.isLoading = false;
        state.notes.unshift(action.payload);
        state.selectedNote = action.payload;
        state.error = null;
      })
      .addCase(addNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 更新笔记
    builder
      .addCase(updateNote.pending, (state) => {
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action: PayloadAction<Note>) => {
        const index = state.notes.findIndex((note) => note.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        if (state.selectedNote?.id === action.payload.id) {
          state.selectedNote = action.payload;
        }
        state.error = null;
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // 删除笔记
    builder
      .addCase(deleteNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.notes = state.notes.filter((note) => note.id !== action.payload);
        if (state.selectedNote?.id === action.payload) {
          state.selectedNote = null;
        }
        state.error = null;
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 导出 actions
export const { selectNote, clearSelectedNote, clearError } = notesSlice.actions;

// 导出 reducer
export default notesSlice.reducer;
