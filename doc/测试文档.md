# 测试运行指导文档

## 1. 测试框架介绍

本项目使用以下测试框架和库：

- **Jest**: JavaScript/TypeScript 测试运行器
- **@testing-library/react**: React 组件测试库
- **@testing-library/jest-dom**: React 测试 DOM 扩展
- **ts-jest**: TypeScript 支持
- **jest-environment-jsdom**: JSDOM 环境支持

## 2. 测试文件结构

测试文件按照以下结构组织：

```
src/
├── components/
│   ├── ComponentName.tsx
│   └── __tests__/
│       └── ComponentName.test.tsx
├── services/
│   ├── serviceName.ts
│   └── __tests__/
│       └── serviceName.test.ts
└── ...
```

- 单元测试文件位于 `__tests__` 目录下
- 测试文件命名格式：`{文件名}.test.ts` 或 `{文件名}.test.tsx`
- 组件测试使用 `.test.tsx` 扩展名
- 服务测试使用 `.test.ts` 扩展名

## 3. 测试命令

### 3.1 运行所有测试

```bash
npm test
```

### 3.2 运行特定测试文件

```bash
npm test -- src/services/__tests__/aiService.test.ts
npm test -- src/components/__tests__/AIModal.test.tsx  
```

### 3.3 运行特定测试套件

```bash
npm test -- -t "AIService"
```

### 3.4 运行测试并生成覆盖率报告

```bash
npm run test:coverage
```

覆盖率报告将生成在 `coverage` 目录下，包含：
- 文本报告（终端输出）
- HTML 报告（`coverage/index.html`）
- LCOV 报告

### 3.5 监听模式运行测试

```bash
npm run test:watch
```

监听模式下，当文件发生变化时，Jest 会自动重新运行相关测试。

## 4. 测试最佳实践

### 4.1 编写有效的测试用例

1. **测试命名清晰**：使用描述性的测试名称，说明测试的功能和预期结果
2. **测试单一职责**：每个测试用例只测试一个功能点
3. **测试边界情况**：测试空值、边界值、异常情况等
4. **测试真实场景**：模拟真实用户使用场景
5. **保持测试独立**：测试用例之间不应相互依赖

### 4.2 如何模拟依赖

1. **模拟模块**：使用 `jest.mock()` 模拟整个模块

```typescript
jest.mock('../logService', () => ({
  logService: {
    log: jest.fn(),
  },
}));
```

2. **模拟全局对象**：在 `jest.setup.ts` 中模拟全局对象

```typescript
// 模拟localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
} as any;
```

3. **模拟fetch**：模拟网络请求

```typescript
const mockFetch = jest.fn();
global.fetch = mockFetch;

// 模拟成功响应
mockFetch.mockResolvedValue({
  ok: true,
  body: mockStream,
} as Response);
```

### 4.3 如何测试异步逻辑

1. **使用 async/await**：测试异步函数时使用 `async/await`

```typescript
it('should process text with streaming response successfully', async () => {
  // 测试代码
  const result = await aiService.processText(
    'test text',
    () => {},
    () => {},
    () => {}
  );
  
  expect(result).toBe(true);
});
```

2. **使用 Jest 异步匹配器**：测试异步操作的结果

```typescript
expect(mockFetch).toHaveBeenCalledTimes(1);
expect(logService.log).toHaveBeenCalled();
```

3. **模拟流响应**：测试流式处理逻辑

```typescript
const mockStream = new ReadableStream({
  start(controller) {
    controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'));
    controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
    controller.close();
  },
});
```

## 5. 测试类型

### 5.1 单元测试

- 测试独立的函数、类或模块
- 不依赖外部系统
- 运行速度快
- 例如：`aiService.test.ts`、`logService.test.ts`

### 5.2 组件测试

- 测试 React 组件的渲染和交互
- 模拟用户行为
- 测试组件的不同状态
- 例如：`AIModal.test.tsx`

## 6. 常见问题与解决方案

### 6.1 测试失败：Cannot find module

**解决方案**：确保测试文件路径正确，检查导入语句是否正确。

### 6.2 测试失败：ReferenceError: localStorage is not defined

**解决方案**：确保在 `jest.setup.ts` 中正确模拟了 localStorage。

### 6.3 测试失败：fetch is not defined

**解决方案**：确保在 `jest.setup.ts` 中正确模拟了 fetch。

### 6.4 测试失败：Cannot read properties of null

**解决方案**：确保测试环境中所有依赖都已正确模拟，检查组件 props 是否正确传递。

## 7. 测试覆盖率目标

- 核心功能覆盖率：100%
- 分支覆盖率：≥ 80%
- 语句覆盖率：≥ 85%

## 8. 持续集成

建议在 CI/CD 流程中添加测试步骤，确保每次代码提交都通过所有测试。

```yaml
# 示例：GitHub Actions 配置
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Run lint
        run: npm run lint
```

## 9. 测试开发流程

1. **编写测试用例**：根据需求编写测试用例
2. **运行测试**：执行测试，确保测试失败（红）
3. **实现功能**：编写代码实现功能
4. **运行测试**：执行测试，确保测试通过（绿）
5. **重构代码**：优化代码结构，保持测试通过
6. **运行测试**：再次执行测试，确保重构后测试仍通过

## 10. 测试工具推荐

- **Jest CLI**：命令行工具，提供丰富的测试选项
- **Jest VS Code Extension**：VS Code 扩展，提供测试运行和调试功能
- **Coverage Gutters**：VS Code 扩展，显示代码覆盖率

## 11. 参考资源

- [Jest 官方文档](https://jestjs.io/docs/getting-started)
- [Testing Library 官方文档](https://testing-library.com/docs/react-testing-library/intro/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
