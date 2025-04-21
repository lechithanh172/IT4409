import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './signupPage.css';  // Import CSS riêng
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }
    navigate('/');
  };

  return (
    <div>
      <Header />

      <div className="register-container">
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Đăng ký tài khoản</h2>

          <input
            type="text"
            name="username"
            placeholder="Tên người dùng"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="firstname"
            placeholder="firstname"
            value={formData.username}
            onChange={handleChange}
            required
          />
          
          <input
            type="text"
            name="lastname"
            placeholder="lastname"
            value={formData.username}
            onChange={handleChange}
            required
          />
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="address"
            name="address"
            placeholder="Địa chỉ"
            value={formData.address}
            onChange={handleChange}
            required
          />
          
          <input
            type="role"
            name="role"
            placeholder="Role"
            value={formData.role}
            onChange={handleChange}
            required
          />
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
               required
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          <button type="submit">Đăng ký</button>
        </form>
      </div>

      <Footer />
    </div>
  );
}


export default SignupPage;
