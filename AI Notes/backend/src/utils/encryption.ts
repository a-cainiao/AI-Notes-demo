import * as crypto from 'crypto';

// 加密算法配置
const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-here'; // 生产环境应使用环境变量
const IV_LENGTH = 16; // AES-256-CBC需要16字节的IV

/**
 * 生成加密密钥
 * @returns 32字节的密钥
 */
const generateKey = (): Buffer => {
  return crypto.scryptSync(SECRET_KEY, 'salt', 32);
};

/**
 * 加密数据
 * @param text 要加密的文本
 * @returns 加密后的字符串
 */
export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = generateKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * 解密数据
 * @param encryptedText 加密后的字符串
 * @returns 解密后的文本
 */
export const decrypt = (encryptedText: string): string => {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = generateKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
