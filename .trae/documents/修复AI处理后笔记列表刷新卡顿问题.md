## 问题分析
当用户点击接受AI处理结果时，会触发以下流程：
1. `handleAcceptAIResult` 调用 `handleUpdateNote`
2. `handleUpdateNote` 调度 Redux 的 `updateNote` 异步 thunk
3. `updateNote` 在 pending 状态下将 `isLoading` 设置为 true
4. `NotesList` 组件检测到 `isLoading` 为 true，显示"加载中..."
5. 这导致左侧笔记列表在每次AI处理后都会刷新并显示加载状态，给用户带来卡顿感

## 解决方案
将加载状态精细化，只在获取、创建、删除笔记时显示加载状态，而在更新笔记时不显示。这样可以避免局部操作影响整个列表的用户体验。

## 修复步骤
1. 修改 `notesSlice.ts` 中的 `extraReducers`：
   - 移除 `updateNote.pending` 中的 `isLoading = true` 设置
   - 移除 `updateNote.fulfilled` 和 `updateNote.rejected` 中的 `isLoading = false` 设置
   - 保留其他操作（fetchNotes、addNote、deleteNote）的加载状态管理

2. 验证修复效果：
   - 运行应用，测试AI处理功能
   - 确认接受AI结果后，左侧笔记列表不再显示加载状态
   - 确认其他操作（获取、创建、删除笔记）的加载状态正常显示

## 预期效果
- 接受AI处理结果后，左侧笔记列表保持稳定，不会显示加载状态
- 笔记内容更新平滑，没有卡顿感
- 其他操作的加载状态正常显示，不影响用户体验