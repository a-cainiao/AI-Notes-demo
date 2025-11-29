import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * 自定义的 useDispatch hook，带有类型定义
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * 自定义的 useSelector hook，带有类型定义
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
