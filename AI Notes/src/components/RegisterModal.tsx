import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RegisterModalProps {
  /** 是否显示模态框 */
  isOpen: boolean;
  /** 关闭模态框的回调函数 */
  onClose: () => void;
  /** 切换到登录模态框的回调函数 */
  onSwitchToLogin: () => void;
}

/**
 * 注册模态框组件
 * 处理用户注册逻辑
 */
const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, isLoading } = useAuth();

  // 如果模态框未打开，不渲染任何内容
  if (!isOpen) return null;

  /**
   * 处理表单提交
   * @param e 表单提交事件
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // 验证输入
      if (!username.trim()) {
        throw new Error('请输入用户名');
      }
      if (!phone.trim()) {
        throw new Error('请输入手机号');
      }
      if (!email.trim()) {
        throw new Error('请输入邮箱');
      }
      if (!password.trim()) {
        throw new Error('请输入密码');
      }
      if (password !== confirmPassword) {
        throw new Error('两次输入的密码不一致');
      }
      if (password.length < 6) {
        throw new Error('密码长度不能少于6位');
      }

      // 调用注册方法
      await register(username, password, phone, email);
      onClose();
    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>注册</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            disabled={isLoading || isSubmitting}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              disabled={isLoading || isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">手机号</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              disabled={isLoading || isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              disabled={isLoading || isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码（不少于6位）"
              disabled={isLoading || isSubmitting}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入密码"
              disabled={isLoading || isSubmitting}
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? '注册中...' : '注册'}
            </button>
          </div>

          <div className="modal-footer">
            <p>
              已有账号？
              <button 
                type="button" 
                className="switch-btn"
                onClick={onSwitchToLogin}
                disabled={isLoading || isSubmitting}
              >
                立即登录
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
