# AI交互核心逻辑测试计划

## 1. 测试框架安装与配置

### 1.1 安装测试依赖
- jest: 测试运行器
- @jest/globals: Jest全局类型定义
- @testing-library/react: React组件测试库
- @testing-library/jest-dom: React测试DOM扩展
- ts-jest: TypeScript支持
- jest-environment-jsdom: JSDOM环境支持

### 1.2 配置Jest
- 创建jest.config.ts配置文件
- 配置TypeScript支持
- 配置DOM环境

## 2. 单元测试编写

### 2.1 aiService单元测试
- 测试API Key管理功能（setApiKey, getApiKey, deleteApiKey）
- 测试模型提供商管理功能（setProvider, getProvider）
- 测试processTextWithConfig方法的流处理逻辑
- 测试processText方法的重试机制
- 测试错误处理机制

### 2.2 logService单元测试
- 测试日志记录功能
- 测试日志获取功能
- 测试日志清除功能
- 测试日志删除功能

## 3. 组件测试编写

### 3.1 AIModal组件测试
- 测试组件显示/隐藏逻辑
- 测试加载状态显示
- 测试AI结果显示
- 测试按钮点击事件
- 测试流式响应显示
- 测试禁用状态

## 4. 测试运行指导文档

### 4.1 测试命令
- 添加测试脚本到package.json
- 说明如何运行所有测试
- 说明如何运行特定测试文件
- 说明如何生成测试覆盖率报告

### 4.2 测试最佳实践
- 如何编写有效的测试用例
- 如何模拟依赖
- 如何测试异步逻辑

## 5. 测试文件结构

```
src/
├── components/
│   ├── AIModal.tsx
│   └── __tests__/
│       └── AIModal.test.tsx
├── services/
│   ├── aiService.ts
│   ├── logService.ts
│   └── __tests__/
│       ├── aiService.test.ts
│       └── logService.test.ts
└── ...
```