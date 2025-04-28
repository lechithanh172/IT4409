import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/api';
import Spinner from '../components/Spinner/Spinner';

const AuthContext = createContext();

// --- Hàm fetchUserInfo (Giả sử API trả về đầy đủ trừ username và role cần chuẩn hóa) ---
const fetchUserInfo = async (username) => {
    if (!username) throw new Error("Thiếu username để fetch info.");
    try {
        const response = await apiService.getUserInfo(username);
        if (response?.data && typeof response.data === 'object' && response.data.role) {
            return {
                ...response.data,
                username: username, // Thêm username
                role: String(response.data.role).toLowerCase() // Chuẩn hóa role
            };
        } else {
            throw new Error("Dữ liệu user info không hợp lệ từ API.");
        }
    } catch (error) {
        console.error(`Lỗi fetch user info cho ${username}:`, error);
        throw error; // Ném lỗi lên
    }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = (triggeredByError = false) => { // Thêm tham số để biết logout do lỗi hay do người dùng
    if (!triggeredByError) console.log("[AuthContext] Logging out (user action)...");
    else console.warn("[AuthContext] Logging out due to error or invalid state...");

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('pendingUsername');
    localStorage.removeItem('userData'); // Quan trọng: Xóa user data khi logout
    setUser(null);
  };

  // Kiểm tra Auth khi tải ứng dụng
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('accessToken');
      let usernameFromStorage = null;

      // Ưu tiên lấy username từ userData đã lưu
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try {
          usernameFromStorage = JSON.parse(storedUserData)?.username;
        } catch (e) {
          console.error("Lỗi parse userData, sẽ xóa:", e);
          localStorage.removeItem('userData'); // Xóa data lỗi
        }
      }

      // Nếu không có username từ userData, thử lấy từ pending (ít xảy ra khi hoạt động đúng)
      if (!usernameFromStorage) {
        usernameFromStorage = localStorage.getItem('pendingUsername');
      }

      if (token && usernameFromStorage) {
        console.log(`[AuthContext] Auth Check: Found token & username (${usernameFromStorage}). Validating...`);
        try {
          // Gọi API để xác thực token VÀ lấy thông tin user mới nhất
          const currentUserInfo = await fetchUserInfo(usernameFromStorage);
          if (currentUserInfo && currentUserInfo.role) {
            setUser(currentUserInfo);
            localStorage.setItem('userData', JSON.stringify(currentUserInfo)); // Cập nhật data mới nhất
            localStorage.removeItem('pendingUsername'); // Dọn dẹp pending
            console.log("[AuthContext] Auth Check: Valid session restored.", currentUserInfo);
          } else {
            // API trả về data không hợp lệ
            console.warn("[AuthContext] Auth Check: Fetched user info is invalid.");
            logout(true); // Logout do trạng thái không hợp lệ
          }
        } catch (error) {
          // API fetchUserInfo lỗi (vd: 401 do token hết hạn)
          console.error("[AuthContext] Auth Check: Error fetching user info.", error);
          logout(true); // Logout do lỗi xác thực
        }
      } else {
        // Không có token hoặc không có username -> không thể khôi phục session
        console.log("[AuthContext] Auth Check: No valid token or username found.");
        if (user !== null) setUser(null); // Đảm bảo user state là null nếu không có session
        // Không cần gọi logout() ở đây nữa vì các giá trị đã là null/không tồn tại
      }
      setIsLoading(false); // Kết thúc kiểm tra
    };

    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần

  // --- Hàm Đăng nhập ---
  const login = async (username, password) => {
    console.log(`[AuthContext] Attempting login: ${username}`);
    localStorage.removeItem('pendingUsername'); // Xóa cái cũ
    localStorage.removeItem('userData');      // Xóa data cũ

    // Lưu username tạm thời để gọi API info sau khi có token
    localStorage.setItem('pendingUsername', username);

    try {
      const loginResponse = await apiService.loginUser({ username, password });
      const token = loginResponse.data?.accessToken;
      const refreshToken = loginResponse.data?.refreshToken;

      if (!token) throw new Error('Không nhận được token xác thực.');

      localStorage.setItem('accessToken', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      console.log("[AuthContext] Login: Token received and stored.");

      // Lấy thông tin user ngay sau khi có token
      const userInfo = await fetchUserInfo(username); // Dùng username vừa nhập

      if (userInfo && userInfo.role) {
        setUser(userInfo);
        localStorage.setItem('userData', JSON.stringify(userInfo)); // Lưu user data đầy đủ
        localStorage.removeItem('pendingUsername'); // Xóa username tạm
        console.log("[AuthContext] Login: User state updated:", userInfo);
        return userInfo; // Trả về cho LoginPage
      } else {
        // Lỗi không mong muốn: Có token nhưng không lấy được info hợp lệ
        throw new Error("Không thể lấy thông tin tài khoản.");
      }
    } catch (error) {
      console.error("[AuthContext] Login failed:", error);
      logout(true); // Dọn dẹp triệt để khi login lỗi
      const message = error.response?.data?.message ||
                      (error.response?.status === 401 ? 'Sai tên đăng nhập hoặc mật khẩu' : null) ||
                      error.message ||
                      'Đăng nhập thất bại.';
      throw new Error(message); // Ném lỗi cho LoginPage hiển thị
    }
  };

  // --- Hàm Đăng ký ---
  const signup = async (signupData) => {
    // Code hàm signup giữ nguyên
     console.log("[AuthContext] Attempting signup with data:", signupData);
        try {
            const response = await apiService.signupUser(signupData);
            console.log("[AuthContext] API Signup Response:", response);
            if (response.status === 200 || response.status === 201) {
                console.log("[AuthContext] Signup successful");
                return response.data;
            } else {
                 console.error("[AuthContext] Signup API returned unexpected status:", response.status, response.data);
                 throw new Error("Đăng ký không thành công.");
            }
        } catch (error) {
            console.error("[AuthContext] Context Signup Error:", error);
            const message = error.response?.data?.message || error.message || "Đăng ký không thành công.";
            throw new Error(message);
        }
  };

  // Giá trị context
  const value = { user, isAuthenticated: !!user, isLoading, login, logout, signup };

  // Render children khi loading xong, hoặc luôn render và để ProtectedRoute xử lý
  return <AuthContext.Provider value={value}>{!isLoading ? children : null}</AuthContext.Provider>;
  // Hoặc nếu muốn hiện spinner toàn trang:
  // if (isLoading) return <div style={{...}}><Spinner size="large" /></div>;
  // return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};