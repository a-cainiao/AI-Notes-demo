import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  /** 是否显示模态框 */
  isOpen: boolean;
  /** 关闭模态框的回调函数 */
  onClose: () => void;
  /** 切换到注册模态框的回调函数 */
  onSwitchToRegister: () => void;
}

/**
 * 登录模态框组件
 * 处理用户登录逻辑
 */
const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isLoading } = useAuth();

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
      if (!phone.trim()) {
        throw new Error('请输入手机号');
      }
      if (!password.trim()) {
        throw new Error('请输入密码');
      }

      // 调用登录方法
      await login(phone, password);
      onClose();
    } catch (err: any) {
      setError(err.message || '登录失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>登录</h2>
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
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
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
              {isLoading || isSubmitting ? '登录中...' : '登录'}
            </button>
          </div>

          <div className="modal-footer">
            <p>
              还没有账号？
              <button 
                type="button" 
                className="switch-btn"
                onClick={onSwitchToRegister}
                disabled={isLoading || isSubmitting}
              >
                立即注册
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
