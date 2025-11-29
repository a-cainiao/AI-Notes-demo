import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 数据库连接配置
 */
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'notes',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

/**
 * 创建数据库连接池
 */
export const pool = mysql.createPool(dbConfig);

/**
 * 测试数据库连接
 */
export const testDatabaseConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
};
