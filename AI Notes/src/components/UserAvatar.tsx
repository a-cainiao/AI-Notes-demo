import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserAvatarProps {
  /** 打开登录模态框的回调函数 */
  onOpenLoginModal: () => void;
}

/**
 * 用户头像组件
 * 显示当前登录用户的头像，鼠标悬停时显示用户信息下拉菜单
 */
const UserAvatar: React.FC<UserAvatarProps> = ({ onOpenLoginModal }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  /**
   * 处理头像点击
   */
  const handleAvatarClick = () => {
    if (isAuthenticated) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      onOpenLoginModal();
    }
  };

  /**
   * 处理登出
   */
  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  /**
   * 处理点击外部关闭下拉菜单
   */
  React.useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownOpen(false);
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // 如果未登录，显示登录按钮
  if (!isAuthenticated) {
    return (
      <button 
        className="login-btn" 
        onClick={onOpenLoginModal}
      >
        登录
      </button>
    );
  }

  return (
    <div className="user-avatar-container" onClick={(e) => e.stopPropagation()}>
      <div 
        className="user-avatar" 
        onClick={handleAvatarClick}
      >
        {/* 显示用户名首字母或默认头像 */}
        <span className="avatar-text">
          {user?.username.charAt(0).toUpperCase() || 'U'}
        </span>
      </div>

      {/* 用户信息下拉菜单 */}
      {isDropdownOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="user-info">
              <div className="user-name">{user?.username}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <div className="dropdown-divider"></div>
          <div className="dropdown-footer">
            <button 
              className="logout-btn" 
              onClick={handleLogout}
            >
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
