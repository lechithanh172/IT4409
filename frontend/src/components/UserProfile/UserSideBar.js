import React from 'react';
import { Link } from 'react-router-dom';
import './UserSideBar.css';

function UserSideBar() {
  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
        <li>
          <Link to="/profile/change-password">
            <i className="fas fa-home icon"></i> Trang chủ
          </Link>
        </li>
        <li>
          <Link to="/profile" className="active"> {}
            <i className="fas fa-user icon"></i> Tài khoản của bạn {}
          </Link>
        </li>
        <li>
          <Link to="/profile/change-password">
            <i className="fas fa-key icon"></i> Đổi mật khẩu
          </Link>
        </li>
        <li>
          <Link to="/profile/order-history">
            <i className="fas fa-history icon"></i> Lịch sử đặt hàng
          </Link>
        </li>
        <li>
          <Link to="/profile/order-history">
            <i className="fas fa-question-circle icon"></i> Hỗ trợ
          </Link>
        </li>
        <li>
          <a href="/">
            <i className="fas fa-sign-out-alt icon"></i> Đăng xuất
          </a>
        </li>
      </ul>
    </div>
  );
}

export default UserSideBar;