import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDatabaseConnection } from './config/database';
import { authRouter } from './routes/authRoutes';
import { noteRouter } from './routes/noteRoutes';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置路由
app.use('/api/auth', authRouter);
app.use('/api/notes', noteRouter);

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '服务运行正常' });
});

// 获取端口号
const PORT = process.env.PORT || 3001;

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await testDatabaseConnection();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`✅ 服务器已启动，监听端口 ${PORT}`);
      console.log(`📦 API 基础路径: http://localhost:${PORT}/api`);
      console.log(`🔐 认证路由: http://localhost:${PORT}/api/auth`);
      console.log(`📝 笔记路由: http://localhost:${PORT}/api/notes`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 启动服务器
startServer();
