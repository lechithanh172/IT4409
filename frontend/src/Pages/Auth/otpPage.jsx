import React, { useState,  useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './otpPage.css';  

function OtpPage() {
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const [secondsLeft, setSecondsLeft] = useState(300); 
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get('mode'); 
    // đếm ngược
    useEffect(() => {
      if (secondsLeft === 0) return;
  
      const timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
  
      return () => clearInterval(timer);
    }, [secondsLeft]);
  
    const formatTime = () => {
      const minutes = Math.floor(secondsLeft / 60);
      const seconds = secondsLeft % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
  
    const handleChange = (element, index) => {
      if (isNaN(element.value)) return;
      let newOtp = [...otp];
      newOtp[index] = element.value;
      setOtp(newOtp);
  
      if (element.nextSibling) {
        element.nextSibling.focus();
      }
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
  
      const otpCode = otp.join('');
      if (otpCode.length === 6) {
        navigate('/register');
      } else {
        alert('Vui lòng nhập đủ 6 số');
      }
      if (otp === '123456') {  
        if (mode === 'reset-password') {
          navigate('/reset-password'); 
        } else if (mode === 'register') {
          navigate('/register'); 
        }
      } else {
        alert('OTP không đúng!');
      }
    };
  
    return (
      <div>
        <div className="otp-container">
          <form onSubmit={handleSubmit} className="otp-form">
            <h2>xác minh mã OTP</h2>
  
            <div className="otp-inputs">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                  disabled={secondsLeft === 0}
                />
              ))}
            </div>
  
            <div className="timer">
              {secondsLeft > 0 ? (
                <span>Còn lại: {formatTime()}</span>
              ) : (
                <span className="expired">OTP đã hết hạn. Vui lòng gửi lại mã mới.</span>
              )}
            </div>
  
            <button type="submit" disabled={secondsLeft === 0}>
              Xác nhận
            </button>
          </form>
        </div>
      </div>
    );
  }
  
export default OtpPage;
