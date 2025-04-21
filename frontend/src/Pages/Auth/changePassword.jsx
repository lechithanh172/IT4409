import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import './changePassword.css';

function ChangePassword() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
      password: '',
      confirmPassword: '',
    });
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
    const handleSubmit = (e) => {
      e.preventDefault();
  
      if (formData.password !== formData.confirmPassword) {
        alert('Mật khẩu không khớp!');
        return;
      }
      navigate('/login');
    };
  
    return (
      <div>
        <Header />
  
        <div className="reset-password-container">
          <form onSubmit={handleSubmit} className="reset-password-form">
            <h2>Đặt lại mật khẩu</h2>
  
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Mật khẩu mới"
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
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
  
            <button type="submit">Xác nhận</button>
          </form>
        </div>
  
        <Footer />
      </div>
    );
}

export default ChangePassword;
