import { configureStore } from '@reduxjs/toolkit';

// 导入切片
import authReducer from './authSlice';
import notesReducer from './notesSlice';
import categoriesReducer from './categoriesSlice';
import tagsReducer from './tagsSlice';

/**
 * Redux Store 配置
 * 集中管理应用的所有状态
 */
export const store = configureStore({
  reducer: {
    // 注册切片
    auth: authReducer,
    notes: notesReducer,
    categories: categoriesReducer,
    tags: tagsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略某些 action 类型的序列化检查
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// 导出 RootState 和 AppDispatch 类型，用于 TypeScript 类型安全
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
