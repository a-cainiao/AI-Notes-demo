import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '../types/note';

// 模拟分类服务，实际项目中应替换为真实的 API 服务
class CategoryService {
  private readonly API_URL = '/api/categories';

  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await fetch(this.API_URL, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('获取分类失败');
      }
      const categories = await response.json();
      return categories.map((category: any) => ({
        ...category,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to get categories:', error);
      return [];
    }
  }

  async createCategory(name: string): Promise<Category> {
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
        throw new Error('创建分类失败');
      }
      const category = await response.json();
      return {
        ...category,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt)
      };
    } catch (error) {
      console.error('Failed to create category:', error);
      // 模拟返回
      return {
        id: Date.now().toString(36),
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  async updateCategory(id: string, name: string): Promise<Category | null> {
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
        throw new Error('更新分类失败');
      }
      const category = await response.json();
      return {
        ...category,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt)
      };
    } catch (error) {
      console.error('Failed to update category:', error);
      return null;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to delete category:', error);
      return false;
    }
  }
}

const categoryService = new CategoryService();

/**
 * 分类状态类型
 */
interface CategoriesState {
  /** 分类列表 */
  categories: Category[];
  /** 当前选中的分类 */
  selectedCategory: Category | null;
  /** 加载状态 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 初始分类状态
 */
const initialState: CategoriesState = {
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
};

/**
 * 异步 thunk：获取所有分类
 */
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categoryService.getAllCategories();
      return categories;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * 异步 thunk：创建分类
 */
export const addCategory = createAsyncThunk(
  'categories/addCategory',
  async (name: string, { rejectWithValue }) => {
    try {
      const category = await categoryService.createCategory(name);
      return category;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * 异步 thunk：更新分类
 */
export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, name }: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const category = await categoryService.updateCategory(id, name);
      if (!category) {
        throw new Error('更新分类失败');
      }
      return category;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * 异步 thunk：删除分类
 */
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      const success = await categoryService.deleteCategory(id);
      if (!success) {
        throw new Error('删除分类失败');
      }
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * 分类切片
 */
export const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    /**
     * 选择分类
     */
    selectCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
    /**
     * 清除选中的分类
     */
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
    /**
     * 清除错误
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 获取所有分类
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 创建分类
    builder
      .addCase(addCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        state.categories.push(action.payload);
        state.error = null;
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 更新分类
    builder
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        const index = state.categories.findIndex((category) => category.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.selectedCategory?.id === action.payload.id) {
          state.selectedCategory = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 删除分类
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.categories = state.categories.filter((category) => category.id !== action.payload);
        if (state.selectedCategory?.id === action.payload) {
          state.selectedCategory = null;
        }
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 导出 actions
export const { selectCategory, clearSelectedCategory, clearError } = categoriesSlice.actions;

// 导出 reducer
export default categoriesSlice.reducer;
