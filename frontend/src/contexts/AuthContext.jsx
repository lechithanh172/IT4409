import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/api'; // Import apiService
import Spinner from '../components/Spinner/Spinner';

const AuthContext = createContext();

// Hàm lấy thông tin user từ API sử dụng username đã lưu tạm
const fetchUserInfo = async (username) => {
    if (!username) {
        console.error("fetchUserInfo: Cần username để gọi API.");
        throw new Error("Thiếu thông tin người dùng.");
    }
    try {
        console.log(`Fetching user info for: ${username}`);
        const response = await apiService.getUserInfo(username);
        console.log("Fetched user info:", response.data);
        if (response.data && typeof response.data === 'object') {
             // **QUAN TRỌNG: Thêm username và role mặc định vào đây**
             // Vì API info không trả về role, chúng ta cần tự gán
             // Bạn cần có logic để xác định role (ví dụ: dựa vào username?)
             // Tạm thời gán role 'user' cho tất cả
            const userDataWithRole = {
                ...response.data,
                username: username, // Thêm trường username vào object user
                role: 'user' // **GÁN ROLE MẶC ĐỊNH - CẦN ĐIỀU CHỈNH LOGIC NÀY**
                // Hoặc logic phức tạp hơn:
                // role: determineRoleBasedOnUsername(username) // Nếu có hàm xác định role
            };
            return userDataWithRole;
        } else {
            throw new Error("Dữ liệu người dùng trả về không hợp lệ.");
        }
    } catch (error) {
        console.error(`Lỗi khi fetch user info cho ${username}:`, error);
        throw error; // Ném lỗi để hàm gọi xử lý
    }
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading kiểm tra token ban đầu

  // Hàm logout dùng chung
  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('pendingUsername'); // Xóa username tạm
    localStorage.removeItem('userData');
    setUser(null);
    console.log("Logged out successfully.");
  };


  // Kiểm tra token và lấy thông tin user khi tải ứng dụng
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('accessToken');
      const pendingUsername = localStorage.getItem('pendingUsername'); // Lấy username đã lưu

      if (token && pendingUsername) {
        console.log(`Auth Check: Tìm thấy token và username (${pendingUsername}), đang lấy thông tin user...`);
        try {
          const userInfo = await fetchUserInfo(pendingUsername); // Gọi API info
          if (userInfo && userInfo.role) { // API info giờ đã có role (tự gán)
            setUser(userInfo);
            localStorage.setItem('userData', JSON.stringify(userInfo)); // Lưu data đầy đủ
            console.log("Auth Check: Token hợp lệ, user đã được đặt:", userInfo);
          } else {
            console.warn("Auth Check: Thông tin user trả về không hợp lệ sau khi fetch.");
            logout(); // Xóa token và username nếu info không hợp lệ
          }
        } catch (error) {
          console.error("Auth Check: Lỗi khi xác thực token/lấy user info.", error);
          logout(); // Xóa token nếu có lỗi (vd: 401)
        }
      } else {
        console.log("Auth Check: Không tìm thấy token hoặc username.");
        logout(); // Đảm bảo trạng thái sạch sẽ
      }
      setIsLoading(false); // Hoàn tất kiểm tra
    };

    checkAuthStatus();
  }, []); // Chỉ chạy 1 lần

  // --- Hàm Đăng nhập ---
  const login = async (username, password) => {
    console.log(`Attempting login for user: ${username}`);
    // 1. Lưu username vào localStorage TRƯỚC KHI gọi API login
    localStorage.setItem('pendingUsername', username);
    console.log("Login: Stored pending username:", username);

    try {
      // 2. Gọi API đăng nhập
      const loginResponse = await apiService.loginUser({ username, password });
      console.log("API Login Response:", loginResponse);

      const token = loginResponse.data?.accessToken;
      const refreshToken = loginResponse.data?.refreshToken;

      if (token) {
        console.log("Login successful, received token.");
        // 3. Lưu token
        localStorage.setItem('accessToken', token);
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }

        // 4. Gọi API lấy thông tin user bằng username đã lưu
        console.log("Login: Fetching user info using stored username...");
        const userInfo = await fetchUserInfo(username); // Dùng username từ tham số

        if (userInfo && userInfo.role) {
            // 5. Cập nhật state và lưu userData đầy đủ
            setUser(userInfo);
            localStorage.setItem('userData', JSON.stringify(userInfo));
            // Xóa username tạm đi sau khi đã lấy được info thành công
            localStorage.removeItem('pendingUsername');
            console.log("Login: User info fetched and state updated:", userInfo);
            return userInfo; // Trả về user cho LoginPage điều hướng
        } else {
            console.error("Lỗi: Lấy được token nhưng không lấy được thông tin user hợp lệ.");
            logout(); // Logout để xóa token và username tạm
            throw new Error("Không thể lấy thông tin tài khoản.");
        }
      } else {
        console.error("API trả về OK nhưng không có accessToken:", loginResponse.data);
         localStorage.removeItem('pendingUsername'); // Xóa username tạm nếu login lỗi
        throw new Error('Không nhận được thông tin xác thực.');
      }
    } catch (error) {
      console.error("Context Login Error:", error);
      logout(); // Đảm bảo dọn dẹp khi có lỗi

      const message = error.response?.data?.message ||
                      (error.response?.status === 401 ? 'Sai tên đăng nhập hoặc mật khẩu' : null) ||
                      error.message ||
                      'Đăng nhập thất bại, vui lòng kiểm tra lại.';
      throw new Error(message);
    }
  };

   // --- Hàm Đăng ký --- (Giữ nguyên logic gọi API)
   const signup = async (signupData) => { /* ... */ };


  // --- Giá trị cung cấp bởi Context ---
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading, // Trạng thái loading ban đầu
    login,
    logout,
    signup
  };

  // Hiển thị spinner trong khi kiểm tra token ban đầu
  if (isLoading) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spinner size="large" /></div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};