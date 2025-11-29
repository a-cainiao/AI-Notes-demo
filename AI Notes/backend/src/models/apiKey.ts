import { pool } from '../config/database';
import { ApiKey, CreateApiKeyRequest, UpdateApiKeyRequest } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { encrypt, decrypt } from '../utils/encryption';

/**
 * API密钥模型
 * 负责处理API密钥的数据库操作，支持加密存储和多提供商
 */
export class ApiKeyModel {
  /**
   * 获取用户的所有API密钥
   * @param userId 用户ID
   * @returns API密钥列表
   */
  static async findByUserId(userId: number): Promise<ApiKey[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM api_keys WHERE user_id = ? ORDER BY provider, model',
      [userId]
    );
    
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      provider: row.provider,
      model: row.model,
      apiKey: decrypt(row.api_key), // 解密返回
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })) as ApiKey[];
  }

  /**
   * 根据提供商和模型查找API密钥
   * @param provider 提供商名称
   * @param model 模型名称
   * @param userId 用户ID
   * @returns API密钥信息或null
   */
  static async findByProviderAndModel(provider: string, model: string, userId: number): Promise<ApiKey | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM api_keys WHERE provider = ? AND model = ? AND user_id = ?',
      [provider, model, userId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      provider: row.provider,
      model: row.model,
      apiKey: decrypt(row.api_key), // 解密返回
      createdAt: row.created_at,
      updatedAt: row.updated_at
    } as ApiKey;
  }

  /**
   * 根据ID查找API密钥
   * @param id API密钥ID
   * @param userId 用户ID
   * @returns API密钥信息或null
   */
  static async findById(id: number, userId: number): Promise<ApiKey | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM api_keys WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      provider: row.provider,
      model: row.model,
      apiKey: decrypt(row.api_key), // 解密返回
      createdAt: row.created_at,
      updatedAt: row.updated_at
    } as ApiKey;
  }

  /**
   * 创建新API密钥
   * @param apiKeyData API密钥数据
   * @param userId 用户ID
   * @returns 创建的API密钥信息
   */
  static async create(apiKeyData: CreateApiKeyRequest, userId: number): Promise<ApiKey> {
    const { provider, model, apiKey } = apiKeyData;
    const encryptedApiKey = encrypt(apiKey); // 加密存储
    
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO api_keys (user_id, provider, model, api_key) VALUES (?, ?, ?, ?)',
      [userId, provider, model, encryptedApiKey]
    );
    
    return this.findById(result.insertId, userId) as Promise<ApiKey>;
  }

  /**
   * 更新API密钥
   * @param id API密钥ID
   * @param apiKeyData API密钥更新数据
   * @param userId 用户ID
   * @returns 更新后的API密钥信息或null
   */
  static async update(id: number, apiKeyData: UpdateApiKeyRequest, userId: number): Promise<ApiKey | null> {
    const { apiKey } = apiKeyData;
    const encryptedApiKey = encrypt(apiKey); // 加密存储
    
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE api_keys SET api_key = ? WHERE id = ? AND user_id = ?',
      [encryptedApiKey, id, userId]
    );
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return this.findById(id, userId);
  }

  /**
   * 删除API密钥
   * @param id API密钥ID
   * @param userId 用户ID
   * @returns 是否删除成功
   */
  static async delete(id: number, userId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM api_keys WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    return result.affectedRows > 0;
  }

  /**
   * 检查API密钥是否存在
   * @param provider 提供商名称
   * @param model 模型名称
   * @param userId 用户ID
   * @returns 是否存在
   */
  static async exists(provider: string, model: string, userId: number): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT 1 FROM api_keys WHERE provider = ? AND model = ? AND user_id = ? LIMIT 1',
      [provider, model, userId]
    );
    
    return rows.length > 0;
  }
}
