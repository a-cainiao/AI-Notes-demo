import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Tag } from '../types/note';

// 模拟标签服务，实际项目中应替换为真实的 API 服务
class TagService {
  private readonly API_URL = '/api/tags';

  async getAllTags(): Promise<Tag[]> {
    try {
      const response = await fetch(this.API_URL, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('获取标签失败');
      }
      const tags = await response.json();
      return tags.map((tag: any) => ({
        ...tag,
        createdAt: new Date(tag.createdAt),
        updatedAt: new Date(tag.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to get tags:', error);
      return [];
    }
  }

  async createTag(name: string): Promise<Tag> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error('创建标签失败');
      }
      const tag = await response.json();
      return {
        ...tag,
        createdAt: new Date(tag.createdAt),
        updatedAt: new Date(tag.updatedAt)
      };
    } catch (error) {
      console.error('Failed to create tag:', error);
      // 模拟返回
      return {
        id: Date.now().toString(36),
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  async updateTag(id: string, name: string): Promise<Tag | null> {
    try {
      const response = await fetch(`${this.API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error('更新标签失败');
      }
      const tag = await response.json();
      return {
        ...tag,
        createdAt: new Date(tag.createdAt),
        updatedAt: new Date(tag.updatedAt)
      };
    } catch (error) {
      console.error('Failed to update tag:', error);
      return null;
    }
  }

  async deleteTag(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to delete tag:', error);
      return false;
    }
  }
}

const tagService = new TagService();

/**
 * 标签状态类型
 */
interface TagsState {
  /** 标签列表 */
  tags: Tag[];
  /** 当前选中的标签ID列表 */
  selectedTagIds: string[];
  /** 加载状态 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 初始标签状态
 */
const initialState: TagsState = {
  tags: [],
  selectedTagIds: [],
  isLoading: false,
  error: null,
};

/**
 * 异步 thunk：获取所有标签
 */
export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const tags = await tagService.getAllTags();
      return tags;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * 异步 thunk：创建标签
 */
export const addTag = createAsyncThunk(
  'tags/addTag',
  async (name: string, { rejectWithValue }) => {
    try {
      const tag = await tagService.createTag(name);
      return tag;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * 异步 thunk：更新标签
 */
export const updateTag = createAsyncThunk(
  'tags/updateTag',
  async ({ id, name }: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const tag = await tagService.updateTag(id, name);
      if (!tag) {
        throw new Error('更新标签失败');
      }
      return tag;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * 异步 thunk：删除标签
 */
export const deleteTag = createAsyncThunk(
  'tags/deleteTag',
  async (id: string, { rejectWithValue }) => {
    try {
      const success = await tagService.deleteTag(id);
      if (!success) {
        throw new Error('删除标签失败');
      }
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * 标签切片
 */
export const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    /**
     * 切换标签选中状态
     */
    toggleTag: (state, action: PayloadAction<string>) => {
      const tagId = action.payload;
      if (state.selectedTagIds.includes(tagId)) {
        state.selectedTagIds = state.selectedTagIds.filter((id) => id !== tagId);
      } else {
        state.selectedTagIds.push(tagId);
      }
    },
    /**
     * 设置选中的标签
     */
    setSelectedTags: (state, action: PayloadAction<string[]>) => {
      state.selectedTagIds = action.payload;
    },
    /**
     * 清除选中的标签
     */
    clearSelectedTags: (state) => {
      state.selectedTagIds = [];
    },
    /**
     * 清除错误
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 获取所有标签
    builder
      .addCase(fetchTags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action: PayloadAction<Tag[]>) => {
        state.isLoading = false;
        state.tags = action.payload;
        state.error = null;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 创建标签
    builder
      .addCase(addTag.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTag.fulfilled, (state, action: PayloadAction<Tag>) => {
        state.isLoading = false;
        state.tags.push(action.payload);
        state.error = null;
      })
      .addCase(addTag.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 更新标签
    builder
      .addCase(updateTag.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTag.fulfilled, (state, action: PayloadAction<Tag>) => {
        state.isLoading = false;
        const index = state.tags.findIndex((tag) => tag.id === action.payload.id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 删除标签
    builder
      .addCase(deleteTag.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTag.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.tags = state.tags.filter((tag) => tag.id !== action.payload);
        state.selectedTagIds = state.selectedTagIds.filter((id) => id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 导出 actions
export const { toggleTag, setSelectedTags, clearSelectedTags, clearError } = tagsSlice.actions;

// 导出 reducer
export default tagsSlice.reducer;
