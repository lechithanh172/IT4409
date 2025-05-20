import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
// Import apiService, setupApiInterceptors, và base_url
import apiService, { setupApiInterceptors, base_url } from '../services/api';
import axios from 'axios'; // Import axios để gọi API refresh trực tiếp trong timer
import Spinner from '../components/Spinner/Spinner'; // Giả sử Spinner tồn tại

const AuthContext = createContext();

// Keys for localStorage
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'userData';
const PENDING_USERNAME_KEY = 'pendingUsername';

// --- Thời gian refresh định kỳ (tính bằng mili giây) ---
// 4 phút 30 giây = 4 * 60 * 1000 + 30 * 1000 = 270000 ms
const REFRESH_INTERVAL = 270000; // 4.5 minutes
const REFRESH_TOKEN_ENDPOINT = "/auth/refresh-token"; // Định nghĩa lại endpoint refresh cho timer


// --- Hàm hỗ trợ đọc/ghi token từ localStorage ---
const getTokens = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  return { accessToken, refreshToken };
};

const setTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);

  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
  console.log("[AuthContext] Tokens updated in localStorage.");
};

const clearAuthStorage = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(PENDING_USERNAME_KEY);
    console.log("[AuthContext] Auth storage cleared.");
};

// --- Hàm fetchUserInfo (Sử dụng apiService đã có interceptor) ---
const fetchUserInfo = async (username) => {
    if (!username) {
         console.warn("[AuthContext] fetchUserInfo called without username.");
         return null;
    }
    console.log(`[AuthContext] Fetching user info for ${username}...`);
    try {
        // apiService.getUserInfo sẽ tự động thêm access token nhờ interceptor
        // Interceptor sẽ xử lý refresh token nếu cần
        const response = await apiService.getUserInfo(username);

        if (response?.data && typeof response.data === 'object' && response.data.role) {
            const userInfo = {
                ...response.data,
                username: username,
                role: String(response.data.role).toLowerCase() // Chuẩn hóa role
            };
             console.log("[AuthContext] fetchUserInfo success:", userInfo);
             return userInfo;
        } else {
            console.error("[AuthContext] Fetched user info is invalid:", response?.data);
            // Dữ liệu không hợp lệ -> coi như thất bại
            return null;
        }
    } catch (error) {
        console.error(`[AuthContext] Error fetching user info for ${username}:`, error);
        // Lỗi API (vd: 401 đã được interceptor xử lý bằng refresh/logout,
        // các lỗi khác như 404, network error sẽ bị ném ra)
        throw error; // Ném lỗi lên để nơi gọi có thể bắt
    }
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Trạng thái loading khi kiểm tra auth ban đầu

  // Ref để lưu ID của timer refresh
  const refreshTimerRef = useRef(null);

  // --- Hàm Logout ---
  const logout = useCallback((triggeredByError = false) => {
    console.log(`[AuthContext] Logging out. Triggered by error: ${triggeredByError}`);
    clearAuthStorage(); // Xóa tất cả liên quan auth trong localStorage
    setUser(null); // Xóa user state
    // Dừng timer refresh khi logout
    if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
        console.log("[AuthContext] Refresh timer cleared on logout.");
    }
    // Có thể thêm logic chuyển hướng về trang login tại đây nếu cần
    // window.location.href = '/login'; // Chuyển hướng cứng nếu cần
  }, []); // Dependencies trống vì nó không phụ thuộc vào state/props thay đổi

  // --- Hàm thực hiện refresh token định kỳ ---
  const startRefreshTokenTimer = useCallback(() => {
    // Chỉ khởi động timer nếu có refresh token
    const { refreshToken } = getTokens();
    if (!refreshToken) {
        console.log("[AuthContext] No refresh token found, not starting refresh timer.");
        return;
    }

    // Dừng timer cũ nếu có
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
      console.log("[AuthContext] Cleared existing refresh timer.");
    }

    console.log(`[AuthContext] Starting refresh token timer (${REFRESH_INTERVAL / 1000} seconds interval).`);

    refreshTimerRef.current = setInterval(async () => {
        console.log("[AuthContext] Refresh timer fired. Attempting to refresh token...");
        const { refreshToken: currentRefreshToken } = getTokens(); // Lấy token mới nhất trong mỗi tick

        if (!currentRefreshToken) {
            console.warn("[AuthContext] No refresh token found during timer tick. Logging out.");
            logout(true); // Logout nếu không tìm thấy refresh token
            return;
        }

        // Gọi API refresh token
        try {
            // Sử dụng axios trực tiếp để gọi endpoint refresh token
            // Điều này giúp bypass interceptor response 401 của apiInstance
            // (vì chính request này là để giải quyết vấn đề token hết hạn)
            // Gửi refreshToken trong body đúng định dạng JSON: { "refreshToken": "..." }
            const refreshResponse = await axios.post(`${base_url}${REFRESH_TOKEN_ENDPOINT}`, {
              refreshToken: currentRefreshToken, // <-- Đúng định dạng body
            });

            const newAccessToken = refreshResponse.data?.accessToken;
            const newRefreshToken = refreshResponse.data?.refreshToken; // Backend có thể trả về refresh token mới

            if (newAccessToken) {
              console.log("[AuthContext] Timer refresh successful. Updating tokens.");
              // setTokens sẽ tự động lưu vào localStorage
              setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken || currentRefreshToken });
              // User state không cần cập nhật ở đây vì chỉ có token thay đổi, thông tin user không đổi.
            } else {
                console.error("[AuthContext] Timer refresh failed: No new access token received in response.");
                // Refresh thành công nhưng không có token mới -> Trạng thái lỗi -> Đăng xuất
                logout(true);
            }
        } catch (refreshError) {
            console.error("[AuthContext] Timer refresh API call failed:", refreshError.response?.data || refreshError.message);
            // Refresh thất bại (vd: refresh token hết hạn, server lỗi) -> Đăng xuất
            logout(true);
        }
    }, REFRESH_INTERVAL);

  }, [logout]); // Dependency là logout vì nó gọi logout


  // --- Setup API Interceptors (chỉ chạy 1 lần) ---
  useEffect(() => {
      // Truyền các hàm quản lý token và logout cho apiService
      setupApiInterceptors({
          getTokens: getTokens, // Hàm lấy token từ localStorage
          setTokens: setTokens, // Hàm lưu token vào localStorage
          logout: logout,       // Hàm logout từ AuthContext state
      });
      console.log("[AuthContext] API interceptors linked.");

      // Cleanup function để clear timer khi AuthProvider unmount
      return () => {
           if (refreshTimerRef.current) {
              clearInterval(refreshTimerRef.current);
              refreshTimerRef.current = null;
              console.log("[AuthContext] Refresh timer cleared on unmount.");
          }
      };
  }, [logout]); // Chỉ re-run nếu hàm logout thay đổi (không xảy ra với useCallback và [])


  // --- Kiểm tra trạng thái Auth khi ứng dụng khởi động & Quản lý timer ---
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log("[AuthContext] Starting initial auth check...");
      const { accessToken } = getTokens();
      let usernameFromStorage = null;

      // Ưu tiên lấy username từ userData đã lưu
      const storedUserData = localStorage.getItem(USER_DATA_KEY);
      if (storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData);
          if (parsedUser?.username) {
               usernameFromStorage = parsedUser.username;
               // Set user tạm thời từ localStorage để hiển thị nhanh
               if (parsedUser.role) { // Chuẩn hóa role ngay khi đọc
                   parsedUser.role = String(parsedUser.role).toLowerCase();
               }
               setUser(parsedUser);
               console.log("[AuthContext] User data found in storage. Setting user state temporarily.");
           }
        } catch (e) {
          console.error("[AuthContext] Error parsing userData from storage:", e);
          localStorage.removeItem(USER_DATA_KEY); // Xóa data lỗi
        }
      }

      // Nếu vẫn chưa có username, thử lấy từ pendingUsername
      if (!usernameFromStorage) {
          usernameFromStorage = localStorage.getItem(PENDING_USERNAME_KEY);
          if (usernameFromStorage) {
               console.log("[AuthContext] Found pendingUsername in storage.");
           }
      }

      if (accessToken && usernameFromStorage) {
        console.log(`[AuthContext] Found tokens & username (${usernameFromStorage}). Validating session...`);
        try {
          // Gọi API để xác thực token VÀ lấy thông tin user mới nhất
          // fetchUserInfo sẽ kích hoạt refresh token nếu cần qua interceptor 401
          const currentUserInfo = await fetchUserInfo(usernameFromStorage);

          if (currentUserInfo) {
            setUser(currentUserInfo); // Cập nhật user state với data mới nhất
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(currentUserInfo)); // Cập nhật data mới nhất
            localStorage.removeItem(PENDING_USERNAME_KEY); // Dọn dẹp pending
            console.log("[AuthContext] Valid session restored:", currentUserInfo);
            // Sau khi khôi phục session thành công, khởi động timer refresh
            startRefreshTokenTimer(); // <<< Start timer here
          } else {
            // fetchUserInfo không trả về user hợp lệ (mặc dù không ném lỗi)
            console.warn("[AuthContext] Fetched user info is invalid or missing.");
            logout(true); // Logout do trạng thái không hợp lệ
          }
        } catch (error) {
          // fetchUserInfo lỗi (có thể do API down, network error, hoặc lỗi khác không phải 401 đã được interceptor xử lý)
          console.error("[AuthContext] Error during initial user info fetch:", error);
          // Interceptor đã xử lý 401 (refresh/logout). Nếu lỗi khác, vẫn nên logout để đảm bảo trạng thái sạch.
          logout(true);
        }
      } else {
        // Không có đủ token hoặc username để khôi phục session
        console.log("[AuthContext] No valid tokens or username found for session restore.");
        logout(false); // Dọn dẹp bất kỳ token/data cũ nào có thể còn sót và đặt user=null
      }

      setIsLoading(false); // Kết thúc kiểm tra ban đầu
      console.log("[AuthContext] Initial auth check finished.");
    };

    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startRefreshTokenTimer]); // Dependency on startRefreshTokenTimer


  // --- Hàm Đăng nhập ---
  const login = async (username, password) => {
    console.log(`[AuthContext] Attempting login: ${username}`);
    // Xóa các trạng thái cũ trước khi login mới
    clearAuthStorage();
    localStorage.setItem(PENDING_USERNAME_KEY, username); // Lưu tạm username

    try {
      const loginResponse = await apiService.login({ username, password });
      const { accessToken, refreshToken } = loginResponse.data; // Nhận cả hai token

      if (!accessToken || !refreshToken) { // Cần cả hai token
          throw new Error('Không nhận đủ token xác thực (access/refresh).');
      }

      setTokens({ accessToken, refreshToken }); // Lưu cả hai token vào localStorage
      console.log("[AuthContext] Login: Tokens received and stored.");

      // Lấy thông tin user ngay sau khi có token mới
      // fetchUserInfo sẽ sử dụng apiService đã có interceptor
      const userInfo = await fetchUserInfo(username);

      if (userInfo) {
        setUser(userInfo); // Cập nhật user state
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userInfo)); // Lưu user data đầy đủ
        localStorage.removeItem(PENDING_USERNAME_KEY); // Dọn dẹp pending
        console.log("[AuthContext] Login successful. User state updated:", userInfo);
        startRefreshTokenTimer(); // <<< Start timer here after successful login
        return userInfo; // Trả về cho LoginPage
      } else {
        // Lỗi không mong muốn: Có token nhưng không lấy được info hợp lệ
        console.error("[AuthContext] Login successful but could not fetch user info.");
        logout(true); // Dọn dẹp do trạng thái không nhất quán
        throw new Error("Đăng nhập thành công nhưng không thể lấy thông tin tài khoản."); // Báo lỗi cho người dùng
      }
    } catch (error) {
      console.error("[AuthContext] Login failed:", error);
      // Dọn dẹp triệt để khi login lỗi (vd: sai mật khẩu, user không tồn tại)
      // apiService.login không cần token, nên nếu nó lỗi thì chưa có token nào được set thông qua setTokens.
      // Tuy nhiên, clear storage vẫn là an toàn nếu có bất kỳ token cũ nào sót lại.
      clearAuthStorage();

      const message = error.response?.data?.message ||
        (error.response?.status === 401 ? 'Sai tên đăng nhập hoặc mật khẩu' : null) ||
        error.message ||
        'Đăng nhập thất bại.';
      throw new Error(message); // Ném lỗi cho LoginPage hiển thị
    }
  };

    // ... (các hàm preSignup, signup, forgetPassword, resetPassword, changePassword giữ nguyên)
     // --- Hàm Đăng ký yêu cầu OTP ---
  const preSignup = async (data) => {
    console.log("[AuthContext] Attempting pre-signup with data:", data);
    try {
      const response = await apiService.requestSignup(data); // apiService.requestSignup không cần token
      console.log("[AuthContext] Pre-signup success:", response.data);
      return response.data; // Trả về data từ API (vd: success message)
    } catch (error) {
      console.error("[AuthContext] Pre-signup error:", error);
      const message = error.response?.data?.message || error.message || "Gửi email OTP không thành công.";
      throw new Error(message);
    }
  };

  // --- Hàm Đăng ký hoàn tất với OTP ---
  const signup = async (signupData) => {
    console.log("[AuthContext] Attempting signup with OTP with data:", signupData);
    try {
      const response = await apiService.signupWithOtp(signupData); // apiService.signupWithOtp không cần token
      console.log("[AuthContext] API Signup with OTP Response:", response);
      if (response.status === 200 || response.status === 201) {
        console.log("[AuthContext] Signup with OTP successful");
        // Sau khi đăng ký thành công, có thể tự động login hoặc để user tự login
        // Ở đây chỉ trả về thành công
        return response.data;
      } else {
        console.error("[AuthContext] Signup with OTP API returned unexpected status:", response.status, response.data);
        throw new Error("Đăng ký không thành công.");
      }
    } catch (error) {
      console.error("[AuthContext] Signup with OTP Error:", error);
      const message = error.response?.data?.message || error.message || "Đăng ký không thành công.";
      throw new Error(message);
    }
  };

  // --- Hàm Quên Mật Khẩu ---
  const forgetPassword = async (email) => {
    console.log("[AuthContext] Sending forget password request for:", email);
    try {
      const response = await apiService.forgetPassword(email); // apiService.forgetPassword không cần token
      console.log("[AuthContext] Forget password response:", response.data);
      return response.data || "OTP đã được gửi đến email của bạn."; // Trả về thông báo hoặc data từ API
    } catch (error) {
      console.error("[AuthContext] Forget password error:", error);
      const message = error.response?.data?.message || error.message || "Không thể gửi OTP.";
      throw new Error(message);
    }
  };

  // --- Hàm Đặt Lại Mật Khẩu ---
  const resetPassword = async (data) => {
    console.log("[AuthContext] Attempting reset password.");
    try {
      const response = await apiService.resetPassword(data); // apiService.resetPassword không cần token
      console.log("[AuthContext] Reset password success:", response.data);
      return response.data;
    } catch (error) {
      console.error("[AuthContext] Reset password error:", error);
      const message = error.response?.data?.message || error.message || 'Đặt lại mật khẩu thất bại.';
      throw new Error(message);
    }
  };

  // --- Hàm Đổi Mật Khẩu (Cần Auth) ---
  const changePassword = async ({ currentPassword, newPassword }) => {
    console.log('[AuthContext] Attempting change password.');
    try {
      // Hàm này cần user đã đăng nhập, API sẽ tự động thêm token nhờ interceptor
      const response = await apiService.changePassword({
        currentPassword,
        newPassword
      });

      console.log('[AuthContext] Password changed successfully.');
       return response.data; // Trả về kết quả từ API
    } catch (error) {
      console.error('[AuthContext] Change password error:', error);
      const message = error.response?.data?.message || error.message || 'Đổi mật khẩu thất bại.';
      throw new Error(message);
    }
  };


  // Giá trị context
  const value = {
      user,
      isAuthenticated: !!user, // Dễ dàng kiểm tra trạng thái đăng nhập
      isLoading, // Cho biết AuthProvider đang kiểm tra ban đầu
      login,
      logout,
      preSignup, // Yêu cầu đăng ký (gửi OTP)
      signup,    // Hoàn tất đăng ký với OTP
      forgetPassword,
      resetPassword,
      changePassword
      // Có thể thêm các hàm khác liên quan đến user tại đây nếu cần
  };

  // Chỉ render children sau khi quá trình loading ban đầu hoàn tất.
  if (isLoading) {
      // Hoặc bạn có thể render một Spinner toàn trang
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spinner size="large" /></div>;
  }

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