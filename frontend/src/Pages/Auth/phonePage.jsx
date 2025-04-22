import React, { useState } from 'react';
import {useLocation, useNavigate } from 'react-router-dom';
import './phonePage.css'; 
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
function PhoneInputPage() {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();
  const location= useLocation();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get("type");
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/otp?type=${type}`);
  };

  return (
    <div>
      <Header />
      <div className="phone-input-container">
        <form onSubmit={handleSubmit} className="phone-form">
        <h2>{type === "reset" ? " Đặt lại mật khẩu" : "Đăng ký"}</h2>
          <input
            type="text"
            placeholder="Nhập số điện thoại..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button type="submit">Tiếp tục</button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default PhoneInputPage;
