# AI流式打字卡顿优化实现方案

## 优化目标

<br />

1. 合并多个小更新为单次DOM操作
2. 使用 requestAnimationFrame 调度渲染
3. 优化字符串处理效率
4. 保留完整长文本渲染
5. 不使用Web Workers
6. 短文本不需要优化处理。比如少于1万字。

## 实现方案

### 1. 合并小更新为单次DOM操作

**实现思路**：

* 在 `aiService` 中添加chunk合并机制

* 累计一定大小或时间间隔后再调用 `onChunk` 回调

* 避免频繁触发React状态更新

**修改点**：

* **文件**：`src/services/aiService.ts`

* **方法**：`processTextWithConfig`

* **实现**：

  * 添加 `chunkBuffer` 变量存储临时chunk

  * 添加 `lastChunkTime` 记录上次发送时间

  * 当buffer达到100字符或时间间隔超过50ms时，发送合并后的chunk

### 2. 使用 requestAnimationFrame 调度渲染

**实现思路**：

* 在React组件中使用RAF调度状态更新

* 确保渲染在浏览器的动画帧中进行

* 避免JavaScript执行阻塞渲染线程

**修改点**：

* **文件**：`src/App.tsx`

* **方法**：`handleAIProcess`

* **实现**：

  * 修改 `onChunk` 回调，使用 `requestAnimationFrame` 包裹 `setAiResult`

  * 确保每次动画帧只更新一次状态

### 3. 优化字符串处理效率

**实现思路**：

* 使用数组存储chunk，减少字符串拼接开销

* 只在渲染时合并数组，避免频繁创建新字符串

**修改点**：

* **文件**：`src/App.tsx`

* **状态管理**：

  * 将 `aiResult` 状态从字符串改为字符串数组

  * 修改 `onChunk` 回调，使用 `push` 而非字符串拼接

* **文件**：`src/components/AIModal.tsx`

* **渲染逻辑**：

  * 渲染时使用 `aiResult.join('')` 合并数组

### 4. 保留完整长文本渲染

**实现思路**：

* 不使用虚拟滚动，保持完整文本渲染

* 通过其他优化手段提升长文本渲染性能

* 确保用户可以看到完整的AI生成结果

**修改点**：

* **文件**：`src/components/AIModal.tsx`

* **样式优化**：

  * 确保 `modal-body` 有合适的 `max-height` 和 `overflow-y: auto`

  * 优化文本渲染性能，如使用 `content-visibility: auto`

## 代码修改详细计划

### 1. 修改 aiService.ts

```typescript
// 在 processTextWithConfig 方法中添加chunk合并逻辑
private async processTextWithConfig(
  text: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
  useDefaultConfig: boolean = false
): Promise<boolean> {
  // ... 现有代码 ...
  
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('无法获取响应流');
  }

  const decoder = new TextDecoder();
  let done = false;
  let buffer = '';
  
  // 添加chunk合并相关变量
  let chunkBuffer = ''; // 临时存储小chunk
  let lastChunkTime = Date.now(); // 上次发送chunk的时间
  const CHUNK_SIZE_THRESHOLD = 100; // 字符数阈值
  const TIME_THRESHOLD = 50; // 时间阈值(ms)

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    buffer += chunkValue;

    // 处理流式响应，提取 AI 生成的文本
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim() === '') continue;
      
      // 处理 SSE 格式的响应
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          // 发送剩余buffer
          if (chunkBuffer) {
            onChunk(chunkBuffer);
          }
          onComplete();
          // ... 日志记录 ...
          return true;
        }
        try {
          const json = JSON.parse(data);
          let content = json.choices[0]?.delta?.content || '';
          
          if (content) {
            fullResponse += content;
            chunkBuffer += content; // 累积到临时buffer
            
            // 检查是否需要发送合并后的chunk
            const now = Date.now();
            if (chunkBuffer.length >= CHUNK_SIZE_THRESHOLD || now - lastChunkTime >= TIME_THRESHOLD) {
              onChunk(chunkBuffer);
              chunkBuffer = '';
              lastChunkTime = now;
            }
          }
        } catch (parseError) {
          console.error('Failed to parse AI response chunk:', parseError);
        }
      }
    }
  }
  
  // 发送剩余buffer
  if (chunkBuffer) {
    onChunk(chunkBuffer);
  }
  
  onComplete();
  // ... 日志记录 ...
  return true;
}
```

### 2. 修改 App.tsx

```typescript
// 修改状态管理，使用数组存储chunk
const [aiResult, setAiResult] = useState<string[]>([]);

// 修改handleAIProcess方法中的onChunk回调
const handleAIProcess = (text: string, isSelection: boolean, start: number = 0, end: number = 0) => {
  // ... 现有代码 ...
  
  // 调用 AI 服务处理文本
  aiService.processText(
    text,
    (chunk) => {
      // 使用requestAnimationFrame调度状态更新
      requestAnimationFrame(() => {
        // 使用数组push而非字符串拼接
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

// 修改handleAcceptAIResult方法，处理数组形式的aiResult
const handleAcceptAIResult = () => {
  if (!selectedNote) return;
  
  let newContent = selectedNote.content;
  const aiResultText = aiResult.join(''); // 合并数组为字符串
  
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
```

### 3. 修改 AIModal.tsx

```typescript
// 修改渲染逻辑，使用join('')合并数组
const AIModal: React.FC<AIModalProps> = ({
  isOpen,
  aiResult,
  isLoading,
  onAccept,
  onDiscard,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">AI 处理结果</h3>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {isLoading && <div className="loading">AI 正在处理中...</div>}
          {aiResult.length > 0 ? (
            <div>{aiResult.join('')}</div> // 使用join('')合并数组
          ) : (
            <div style={{ color: '#666', fontStyle: 'italic' }}>暂无结果</div>
          )}
        </div>
        <div className="modal-footer">
          <button 
            className="modal-btn modal-btn-secondary" 
            onClick={onDiscard}
            disabled={isLoading}
          >
            丢弃
          </button>
          <button 
            className="modal-btn modal-btn-primary" 
            onClick={onAccept}
            disabled={isLoading || aiResult.length === 0}
          >
            接受
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 4. 修改 index.css（可选优化）

```css
/* 优化长文本渲染性能 */
.modal-body {
  /* 其他现有样式 */
  content-visibility: auto; /* 优化渲染性能 */
  contain-intrinsic-size: 1000px; /* 预估内容高度 */
}
```

## 优化效果预期

1. **合并小更新**：减少DOM操作次数，降低浏览器渲染压力
2. **requestAnimationFrame**：确保渲染在浏览器动画帧中进行，避免卡顿
3. **数组存储chunk**：减少字符串拼接开销，优化内存使用
4. **完整长文本渲染**：保留原有功能，用户可查看完整AI结果
5. **无Web Workers**：简化实现，避免跨线程通信复杂性

## 实现步骤

1. 修改 `aiService.ts`，添加chunk合并机制
2. 修改 `App.tsx`，使用数组存储aiResult和requestAnimationFrame调度
3. 修改 `AIModal.tsx`，使用join('')合并数组渲染
4. 可选：修改CSS，添加content-visibility优化
5. 测试优化效果，确保功能正常

## 验证标准

1. 超长文本（万行）下AI流式打字流畅，无明显卡顿
2. 完整长文本渲染正常，无截断
3. 内存占用合理，无明显内存泄漏
4. 响应速度快，用户体验良好

