import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginRequest, RegisterRequest } from '../types/user';
import { authService } from '../services/authService';

/**
 * 认证状态类型
 */
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

/**
 * 初始认证状态
 */
const initialState: AuthState = {
  user: authService.getUser(),
  isLoading: false,
  isAuthenticated: !!authService.getToken(),
  error: null,
};

/**
 * 异步 thunk：用户登录
 */
export const login = createAsyncThunk(
  'auth/login',
  async ({ phone, password }: LoginRequest, { rejectWithValue }) => {
    try {
      const data = await authService.login({ phone, password });
      return data.user;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * 异步 thunk：用户注册
 */
export const register = createAsyncThunk(
  'auth/register',
  async (
    { username, password, phone, email }: RegisterRequest,
    { rejectWithValue }
  ) => {
    try {
      const data = await authService.register({ username, password, phone, email });
      return data.user;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * 异步 thunk：刷新用户信息
 */
export const refreshUser = createAsyncThunk(
  'auth/refreshUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * 认证切片
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * 用户登出
     */
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    /**
     * 清除错误
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 登录
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // 注册
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // 刷新用户信息
    builder
      .addCase(refreshUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        authService.logout();
      });
  },
});

// 导出 actions
export const { logout, clearError } = authSlice.actions;

// 导出 reducer
export default authSlice.reducer;
