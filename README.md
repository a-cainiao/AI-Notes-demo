# AI Notes - 智能笔记应用

## 项目介绍
AI Notes 是一个集成了人工智能功能的现代化笔记应用，允许用户创建、管理和智能处理笔记内容。应用采用前后端分离架构，提供了完整的用户认证、笔记管理、AI处理、API Key管理和日志管理功能。

## 技术栈

### 前端
- **框架**: React 18.2.0
- **语言**: TypeScript 5.2.2
- **构建工具**: Vite 5.0.8
- **状态管理**: Redux Toolkit
- **UI组件**: 自定义组件
- **测试框架**: Jest + React Testing Library

### 后端
- **运行环境**: Node.js
- **框架**: Express 5.1.0
- **语言**: TypeScript 5.9.3
- **数据库**: MySQL
- **ORM**: 原生SQL查询
- **认证**: JWT (JSON Web Token)
- **密码加密**: bcrypt
- **跨域支持**: cors
- **环境变量**: dotenv

## 功能特性

### 1. 用户认证
- 注册新用户
- 用户登录/登出
- JWT令牌认证
- 密码加密存储

### 2. 笔记管理
- 创建新笔记
- 查看笔记列表
- 编辑笔记内容
- 删除笔记
- 自动保存功能

### 3. AI智能处理
- 支持多种AI处理类型
- 流式AI响应
- 支持处理整篇笔记或选中内容
- AI处理结果预览和应用

### 4. API Key管理
- 安全存储API密钥
- 加密保护
- 便捷的密钥管理界面

### 5. 日志管理
- 操作日志记录
- 日志查看和删除
- 优化的日志加载性能

### 6. 分类和标签
- 笔记分类管理
- 标签系统
- 分类和标签的增删改查

## 项目结构

```
AI Notes/
├── backend/              # 后端代码
│   ├── src/
│   │   ├── config/       # 配置文件
│   │   ├── controllers/  # 控制器
│   │   ├── middleware/   # 中间件
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由
│   │   ├── services/     # 业务逻辑
│   │   ├── types/        # TypeScript类型定义
│   │   └── utils/        # 工具函数
│   ├── .env              # 环境变量
│   └── package.json      # 后端依赖
├── src/                  # 前端代码
│   ├── components/       # React组件
│   ├── contexts/         # React上下文
│   ├── hooks/            # 自定义Hooks
│   ├── services/         # API服务
│   ├── store/            # Redux状态管理
│   ├── types/            # TypeScript类型定义
│   ├── App.tsx           # 主应用组件
│   └── main.tsx          # 应用入口
└── package.json          # 前端依赖
```

## 安装和运行

### 前置要求
- Node.js (v16+)
- MySQL数据库

### 1. 克隆项目
```bash
git clone https://github.com/a-cainiao/AI-Notes-demo.git
cd AI-Notes-demo
```

### 2. 配置后端

#### 2.1 安装依赖
```bash
cd backend
npm install
```

#### 2.2 配置环境变量
创建 `.env` 文件并配置：
```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ai_notes
JWT_SECRET=your_jwt_secret
```

#### 2.3 初始化数据库
运行SQL脚本初始化数据库：
```bash
mysql -u root -p < init-database.sql
```

#### 2.4 启动后端服务
```bash
npm run dev
```

### 3. 配置前端

#### 3.1 安装依赖
```bash
cd ..
npm install
```

#### 3.2 启动前端开发服务器
```bash
npm run dev
```

### 4. 访问应用
打开浏览器访问：`http://localhost:5173`

## 核心功能实现

### AI处理流程
1. 用户选择笔记内容或整篇笔记
2. 选择AI处理类型
3. 前端发送请求到后端
4. 后端调用AI服务处理文本
5. 后端返回流式响应
6. 前端实时展示AI处理结果
7. 用户选择应用或丢弃结果

### 数据安全
- 密码使用bcrypt加密存储
- API Key加密保存
- JWT令牌认证保护API
- 敏感数据传输使用HTTPS

### 性能优化
- 笔记自动保存优化
- AI处理后笔记列表刷新优化
- 日志删除功能优化
- 流式AI响应处理
- 组件懒加载

## 测试

### 前端测试
```bash
npm run test
npm run test:coverage
```




