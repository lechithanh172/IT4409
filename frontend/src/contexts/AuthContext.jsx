import React, { createContext, useState, useContext, useEffect } from 'react';
import Spinner from '../components/Spinner/Spinner'; // Import Spinner
import { useNavigate, useLocation } from 'react-router-dom';

// Dữ liệu người dùng giả lập (thay bằng logic thật)
const fakeUsers = {
  adminUser: { id: 'adm1', username: 'Admin', role: 'admin' },
  pmUser: { id: 'pm1', username: 'ProductMgr', role: 'productmanager' },
  normalUser: { id: 'usr1', username: 'Customer', role: 'user' }, // Role người dùng thường
};
const fakeAuth = {
  token: 'fake-jwt-token', // Token xác thực giả
  expiresIn: '1h' // Thời gian hết hạn 
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null: chưa đăng nhập, object: đã đăng nhập
  const [isLoading, setIsLoading] = useState(true); // Trạng thái kiểm tra đăng nhập ban đầu

  // Giả lập kiểm tra trạng thái đăng nhập khi tải ứng dụng (ví dụ: kiểm tra token)
  useEffect(() => {
    setIsLoading(true);
    // --- Logic kiểm tra thật sẽ ở đây ---
    // Ví dụ: đọc token từ localStorage, gọi API /me để lấy user info
    // --- Kết thúc logic thật ---

    // --- Giả lập: Lấy user từ localStorage nếu có ---
    const storedUserType = localStorage.getItem('loggedInUserType'); // Ví dụ: 'admin', 'pm', 'user'
    if (storedUserType === 'admin') {
      setUser(fakeUsers.adminUser);
    } else if (storedUserType === 'pm') {
      setUser(fakeUsers.pmUser);
    } else if (storedUserType === 'user') {
      setUser(fakeUsers.normalUser);
    } else {
      setUser(null);
    }
    // --- Kết thúc giả lập ---

    // Giả lập độ trễ
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Giảm thời gian chờ nếu cần

    return () => clearTimeout(timer);
  }, []);


  const login = async (username, password) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      let loggedInUser = null;
      if (username === 'admin' && password === 'admin123') {
        loggedInUser = fakeUsers.adminUser;
      } else if (username === 'pm' && password === 'pm123') {
        loggedInUser = fakeUsers.pmUser;
      } else if (username === 'user' && password === 'user123') {
        loggedInUser = fakeUsers.normalUser;
      } else {
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
      }

      // Lưu vào localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('loggedInUserType', user.role); // lưu 'admin', 'productManager', 'user'

      // Cập nhật user context
      setUser(loggedInUser);

      return loggedInUser; // trả về user để phía UI có thể điều hướng theo role nếu muốn
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  // --- Hàm đăng xuất ---
  const logout = () => {
    setIsLoading(true);
    setTimeout(() => {
      setUser(null);
      localStorage.removeItem('loggedInUserType');
      localStorage.removeItem('authToken');
      setIsLoading(false);
    }, 200);
  };

  //-- Hàm đổi mật khẩu 
  const changePassword = async (newPassword) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('Đổi mật khẩu thành công!');
      return true;
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      alert('Lỗi khi đổi mật khẩu!');
      throw error;
    }
  };


  //hàm đăng ký
  const signup = async (userData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Giả lập tạo user mới
      const newUser = {
        id: `usr${Math.floor(Math.random() * 1000)}`,
        username: userData.username,
        role: 'user'
      };

      localStorage.setItem('authToken', fakeAuth.token);
      localStorage.setItem('loggedInUserType', newUser.role);
      setUser(newUser);

      return true;
    } catch (err) {
      console.error('Signup error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  //hàm lấy otp
  const Otp = (onSuccessCallback) => {
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const [secondsLeft, setSecondsLeft] = useState(300);

    useEffect(() => {
      if (secondsLeft === 0) return;
      const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
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
      if (element.nextSibling) element.nextSibling.focus();
    };

    const handleSubmit = (e, type, navigate) => {
      e.preventDefault();
      const otpCode = otp.join('');
      if (otpCode === '123456') {
        if (onSuccessCallback) onSuccessCallback(type, navigate);
      } else {
        alert('OTP không đúng!');
      }
    };
    return {
      otp,
      secondsLeft,
      formatTime,
      handleChange,
      handleSubmit,
    };
  }
  //hàm nhập email
  const EmailInput = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get('type');

    const handleSubmit = (e) => {
      e.preventDefault();

      //thêm validate email ở đây

      // encodeURIComponent để tránh lỗi URL khi có ký tự lạ
      navigate(`/otp?type=${type}&email=${encodeURIComponent(email)}`);
    };

    return {
      email,
      setEmail,
      handleSubmit,
      type,
    };
  };

  const value = {
    user,
    isAuthenticated: !!user, // True nếu user khác null
    isLoading,
    login,
    logout,
    changePassword,
    signup,
    Otp,
    EmailInput
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};