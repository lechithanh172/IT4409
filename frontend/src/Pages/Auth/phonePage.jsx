import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './phonePage.css'; 
function PhoneInputPage() {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone === '123456789') {
      navigate('/login');
    } else {
      navigate('/otp?mode=register');
    }
  };

  return (
    <div>
      <div className="phone-input-container">
        <form onSubmit={handleSubmit} className="phone-form">
          <h2>Đăng ký </h2>
          <h6>Vui lòng đăng ký để hưởng những đặc quyền dành cho thành viên.</h6>
          <input
            type="text"
            placeholder="Nhập số điện thoại..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button type="submit">Tiếp tục</button>
        </form>
      </div>
    </div>
  );
}

export default PhoneInputPage;
