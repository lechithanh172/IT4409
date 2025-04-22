import React, { createContext, useState, useContext, useEffect } from 'react';
import Spinner from '../components/Spinner/Spinner'; // Import Spinner

// Dữ liệu người dùng giả lập (thay bằng logic thật)
const fakeUsers = {
  adminUser: { id: 'adm1', username: 'Admin', role: 'admin' },
  pmUser: { id: 'pm1', username: 'ProductMgr', role: 'productmanager' },
  normalUser: { id: 'usr1', username: 'Customer', role: 'user' }, // Role người dùng thường
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

  // --- Hàm giả lập đăng nhập ---
  const login = (userType) => {
     setIsLoading(true); // Bắt đầu loading
     // Giả lập gọi API đăng nhập
     setTimeout(() => {
        if (userType === 'admin') {
            setUser(fakeUsers.adminUser);
            localStorage.setItem('loggedInUserType', 'admin');
        } else if (userType === 'pm') {
            setUser(fakeUsers.pmUser);
            localStorage.setItem('loggedInUserType', 'pm');
        } else {
            setUser(fakeUsers.normalUser);
            localStorage.setItem('loggedInUserType', 'user');
        }
         setIsLoading(false); // Kết thúc loading
     }, 300);
  };

  // --- Hàm đăng xuất ---
  const logout = () => {
     setIsLoading(true);
     setTimeout(() => {
        setUser(null);
        localStorage.removeItem('loggedInUserType');
         setIsLoading(false);
     }, 200);
  };

  // Nếu đang kiểm tra auth, hiển thị loading toàn trang hoặc layout trống
  // if (isLoading) {
  //   return (
  //     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  //       <Spinner size="large" />
  //     </div>
  //   );
  // }

  const value = {
    user,
    isAuthenticated: !!user, // True nếu user khác null
    isLoading,
    login, // Cung cấp hàm login
    logout, // Cung cấp hàm logout
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