import React from 'react';
import { Link } from 'react-router-dom'; 
import './UserSideBar.css';

function UserSideBar() {
  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
      <li>
          <Link to="/profile/">Thông tin cá nhân</Link>
        </li>
        <li>
          <Link to="/profile/change-password">Đổi mật khẩu</Link>
        </li>
        <li>
          <Link to="/profile/order-history">Lịch sử đặt hàng</Link>
        </li>
        <li>
          <a href="/">Đăng xuất</a>
        </li>
      </ul>
    </div>
  );
}

export default UserSideBar;