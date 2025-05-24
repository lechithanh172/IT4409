import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
// Import apiService, setupApiInterceptors, và base_url
import apiService, { setupApiInterceptors, base_url } from '../services/api';
import axios from 'axios'; // Import axios để gọi API refresh trực tiếp trong timer
import Spinner from '../components/Spinner/Spinner'; // Giả sử Spinner tồn tại

// === Import toast từ react-toastify ===
import { toast } from 'react-toastify';
// ======================================

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
// Hàm này được thiết kế để gọi API lấy thông tin user,
// nó sẽ tự động dùng access token từ localStorage.
// Nếu access token hết hạn và refresh token còn hạn, interceptor sẽ tự refresh.
// Nếu cả hai hết hạn, interceptor sẽ gọi logout.
const fetchUserInfo = async (username) => {
    if (!username) {
         console.warn("[AuthContext] fetchUserInfo called without username.");
         return null;
    }
    console.log(`[AuthContext] Fetching user info for ${username}...`);
    try {
        // apiService.getUserInfo sẽ tự động thêm access token nhờ interceptor
        // Interceptor sẽ xử lý refresh token nếu cần HOẶC gọi logout() nếu không thể refresh
        const response = await apiService.getUserInfo(username);

        if (response?.data && typeof response.data === 'object' && response.data.role) {
            const userInfo = {
                ...response.data,
                username: username, // Đảm bảo có username
                role: String(response.data.role).toLowerCase() // Chuẩn hóa role
            };
             console.log("[AuthContext] fetchUserInfo success:", userInfo);
             return userInfo;
        } else {
            console.error("[AuthContext] Fetched user info is invalid:", response?.data);
            // Dữ liệu không hợp lệ -> coi như thất bại
            // **Quan trọng:** fetchUserInfo không nên tự logout ở đây.
            // Interceptor 401 đã chịu trách nhiệm logout nếu token hết hạn.
            // Nếu API trả về 200 OK nhưng data format sai, đó là lỗi ứng dụng,
            // nhưng việc tự động logout user có thể không phải UX tốt nhất.
            // Tuy nhiên, trong ngữ cảnh AuthProvider kiểm tra session, nếu data user không hợp lệ,
            // ta coi như session không thể khôi phục và báo cho AuthProvider xử lý (bằng cách trả về null hoặc throw).
            // Giữ nguyên logic trả về null để AuthProvider quyết định logout.
            return null; // Báo hiệu data user không hợp lệ
        }
    } catch (error) {
        // Lỗi API (vd: 404 User Not Found, Network Error, etc.)
        // Lỗi 401 và 403 đã được xử lý trong interceptor bằng cách gọi logout.
        // Nếu lỗi đến đây, nó là lỗi khác.
        console.error(`[AuthContext] Error fetching user info for ${username}:`, error);
        // Ném lỗi lên để AuthProvider biết session không thể khôi phục.
        throw error;
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
    // (Nhưng thường nên để component sử dụng hook useAuth xử lý chuyển hướng)

    // === Thêm toast đăng xuất thành công chỉ khi KHÔNG phải do lỗi ===
    if (!triggeredByError) {
        toast.success("Đăng xuất thành công!");
        console.log("[AuthContext] Showing logout success toast (not triggered by error).");
    } else {
         console.warn("[AuthContext] Logout triggered by error, skipping success toast.");
    }
    // =========================================================

  }, []); // Dependencies trống vì nó không phụ thuộc vào state/props thay đổi (triggeredByError là tham số)

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
            logout(true); // Logout nếu không tìm thấy refresh token (triggeredByError = true)
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
              // Sử dụng newRefreshToken nếu có, ngược lại giữ currentRefreshToken
              setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken || currentRefreshToken });
              // User state không cần cập nhật ở đây vì chỉ có token thay đổi, thông tin user không đổi.
            } else {
                console.error("[AuthContext] Timer refresh failed: No new access token received in response.");
                // Refresh thành công nhưng không có access token mới -> Trạng thái lỗi -> Đăng xuất
                logout(true); // Logout do lỗi (triggeredByError = true)
            }
        } catch (refreshError) {
            console.error("[AuthContext] Timer refresh API call failed:", refreshError.response?.data || refreshError.message);
            // Refresh thất bại (vd: refresh token hết hạn, server lỗi, network error) -> Đăng xuất
            // Interceptor của apiService sẽ không bắt lỗi này vì ta dùng axios trực tiếp.
            logout(true); // Logout do lỗi (triggeredByError = true)
        }
    }, REFRESH_INTERVAL);

  }, [logout]); // Dependency là logout vì nó gọi logout


  // --- Setup API Interceptors (chỉ chạy 1 lần) ---
  // Interceptor sẽ gọi logout(true) khi phát hiện lỗi 401 không thể refresh
  useEffect(() => {
      console.log("[AuthContext] Setting up API interceptors...");
      // Truyền các hàm quản lý token và logout cho apiService
      setupApiInterceptors({
          getTokens: getTokens, // Hàm lấy token từ localStorage
          setTokens: setTokens, // Hàm lưu token vào localStorage
          logout: () => logout(true), // Truyền hàm logout LUÔN với triggeredByError = true cho interceptor
      });
      console.log("[AuthContext] API interceptors linked with logout(true).");

      // Cleanup function để clear timer khi AuthProvider unmount
      return () => {
           if (refreshTimerRef.current) {
              clearInterval(refreshTimerRef.current);
              refreshTimerRef.current = null;
              console.log("[AuthContext] Refresh timer cleared on unmount.");
          }
      };
      // setupApiInterceptors chỉ cần gọi 1 lần. logout không thay đổi vì dùng useCallback với []
      // Nên dependency array có thể là [] hoặc [logout] tùy cấu hình linter,
      // nhưng [logout] an toàn hơn nếu linter yêu cầu.
  }, [logout]);


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
          // Kiểm tra tối thiểu cấu trúc dữ liệu user hợp lệ
          if (parsedUser?.username && parsedUser?.role) {
               usernameFromStorage = parsedUser.username;
               // Set user tạm thời từ localStorage để hiển thị nhanh UI
               // Chuẩn hóa role ngay khi đọc
               parsedUser.role = String(parsedUser.role).toLowerCase();
               setUser(parsedUser);
               console.log("[AuthContext] User data found in storage. Setting user state temporarily.");
           } else {
               console.warn("[AuthContext] Stored user data is incomplete or invalid.");
               localStorage.removeItem(USER_DATA_KEY); // Xóa data lỗi
           }
        } catch (e) {
          console.error("[AuthContext] Error parsing userData from storage:", e);
          localStorage.removeItem(USER_DATA_KEY); // Xóa data lỗi
        }
      }

      // Nếu vẫn chưa có username, thử lấy từ pendingUsername (trường hợp đang trong luồng login/signup nhưng bị reload)
      if (!usernameFromStorage) {
          usernameFromStorage = localStorage.getItem(PENDING_USERNAME_KEY);
          if (usernameFromStorage) {
               console.log("[AuthContext] Found pendingUsername in storage.");
           }
      }

      // Case 1: Có cả accessToken VÀ username (từ localStorage hoặc pending)
      if (accessToken && usernameFromStorage) {
        console.log(`[AuthContext] Found tokens & username (${usernameFromStorage}). Validating session by fetching user info...`);
        try {
          // Gọi API để xác thực token VÀ lấy thông tin user mới nhất
          // fetchUserInfo sẽ kích hoạt refresh token nếu cần qua interceptor 401
          // Nếu fetchUserInfo ném lỗi (không phải 401 đã được interceptor xử lý),
          // hoặc trả về null (data user không hợp lệ), session không khôi phục được.
          const currentUserInfo = await fetchUserInfo(usernameFromStorage);

          if (currentUserInfo) {
            setUser(currentUserInfo); // Cập nhật user state với data mới nhất
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(currentUserInfo)); // Cập nhật data mới nhất
            localStorage.removeItem(PENDING_USERNAME_KEY); // Dọn dẹp pending username
            console.log("[AuthContext] Valid session restored:", currentUserInfo);
            // Sau khi khôi phục session thành công, khởi động timer refresh
            startRefreshTokenTimer(); // <<< Start timer here
          } else {
            // fetchUserInfo không trả về user hợp lệ (mặc dù API có thể trả 200, nhưng data cấu trúc sai)
            console.warn("[AuthContext] Initial user info fetch returned invalid data.");
            // Xem đây là lỗi khôi phục session -> Logout để dọn dẹp
            logout(true); // Logout do trạng thái không hợp lệ (triggeredByError = true)
          }
        } catch (error) {
          // fetchUserInfo lỗi (có thể do API down, network error, hoặc lỗi khác không phải 401 đã được interceptor xử lý)
          console.error("[AuthContext] Error during initial user info fetch:", error);
          // Interceptor đã xử lý 401 (refresh/logout). Nếu lỗi khác, vẫn nên logout để đảm bảo trạng thái sạch.
          // Điều này cũng bao gồm trường hợp API /user/:username không tìm thấy user dù token hợp lệ.
          logout(true); // Logout do lỗi (triggeredByError = true)
        }
      } else {
        // Case 2: Không có đủ token hoặc username để khôi phục session
        console.log("[AuthContext] No valid tokens or username found for session restore. Ensuring clean state.");
        // Dọn dẹp bất kỳ token/data cũ nào có thể còn sót
        // **Quan trọng:** Gọi logout(true) ở đây để KHÔNG hiển thị toast "Đăng xuất thành công!"
        // vì người dùng không chủ động đăng xuất lúc này.
        logout(true); // <--- SỬA TỪ logout(false) THÀNH logout(true)
      }

      setIsLoading(false); // Kết thúc kiểm tra ban đầu
      console.log("[AuthContext] Initial auth check finished.");
    };

    // Chạy kiểm tra auth khi component mount
    checkAuthStatus();

    // Dependency array: Bao gồm các hàm callback được gọi bên trong useEffect
    // startRefreshTokenTimer và logout được bọc bởi useCallback và có dependencies [] hoặc [logout],
    // nên chúng không thay đổi thường xuyên.
  }, [startRefreshTokenTimer, logout]); // Bao gồm cả startRefreshTokenTimer và logout

  // --- Hàm Đăng nhập ---
  const login = async (username, password) => {
    console.log(`[AuthContext] Attempting login: ${username}`);
    // Xóa các trạng thái cũ trước khi login mới
    clearAuthStorage();
    localStorage.setItem(PENDING_USERNAME_KEY, username); // Lưu tạm username

    try {
      // apiService.login không cần token, nên không bị ảnh hưởng bởi interceptor 401
      const loginResponse = await apiService.login({ username, password });
      const { accessToken, refreshToken } = loginResponse.data; // Nhận cả hai token

      if (!accessToken || !refreshToken) { // Cần cả hai token để session hợp lệ
          console.error("[AuthContext] Login response missing tokens.");
          throw new Error('Không nhận đủ token xác thực (access/refresh) từ API.');
      }

      setTokens({ accessToken, refreshToken }); // Lưu cả hai token vào localStorage
      console.log("[AuthContext] Login: Tokens received and stored.");

      // Lấy thông tin user ngay sau khi có token mới
      // fetchUserInfo sẽ sử dụng apiService đã có interceptor (sẽ dùng token mới lưu)
      const userInfo = await fetchUserInfo(username);

      if (userInfo) {
        setUser(userInfo); // Cập nhật user state
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userInfo)); // Lưu user data đầy đủ
        localStorage.removeItem(PENDING_USERNAME_KEY); // Dọn dẹp pending
        console.log("[AuthContext] Login successful. User state updated:", userInfo);
        startRefreshTokenTimer(); // <<< Start timer here after successful login
        // Không cần toast ở đây, thường toast login thành công được hiển thị ở LoginPage hoặc nơi gọi login
        return userInfo; // Trả về thông tin user cho LoginPage
      } else {
        // Lỗi không mong muốn: Có token nhưng fetchUserInfo trả về null (data user không hợp lệ)
        console.error("[AuthContext] Login successful but could not fetch valid user info.");
        logout(true); // Dọn dẹp do trạng thái không nhất quán (triggeredByError = true)
        throw new Error("Đăng nhập thành công nhưng không thể lấy thông tin tài khoản hợp lệ."); // Báo lỗi cho người dùng
      }
    } catch (error) {
      console.error("[AuthContext] Login failed:", error);
      // Dọn dẹp triệt để khi login lỗi (vd: sai mật khẩu 401, user không tồn tại 404, network error)
      // apiService.login không cần token, nên nếu nó lỗi thì chưa có token nào được set thông qua setTokens.
      // Tuy nhiên, clear storage vẫn là an toàn nếu có bất kỳ token cũ nào sót lại.
      clearAuthStorage(); // Dọn dẹp

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
      // Interceptor sẽ xử lý 401 (refresh/logout) nếu token hết hạn
      const response = await apiService.changePassword({
        currentPassword,
        newPassword
      });

      console.log('[AuthContext] Password changed successfully.');
       // Có thể thêm toast đổi mật khẩu thành công ở đây nếu cần
       // toast.success("Mật khẩu đã được đổi thành công!");
       return response.data; // Trả về kết quả từ API
    } catch (error) {
      console.error('[AuthContext] Change password error:', error);
      // Interceptor 401 sẽ tự động logout nếu token hết hạn.
      // Nếu lỗi khác, ta ném lỗi lên cho UI xử lý.
      const message = error.response?.data?.message || error.message || 'Đổi mật khẩu thất bại.';
      // Có thể thêm toast lỗi ở đây nếu không muốn UI xử lý
      // toast.error(`Đổi mật khẩu thất bại: ${message}`);
      throw new Error(message);
    }
  };


  // Giá trị context
  const value = {
      user,
      isAuthenticated: !!user, // Dễ dàng kiểm tra trạng thái đăng nhập (true nếu user khác null)
      isLoading, // Cho biết AuthProvider đang kiểm tra ban đầu
      login,
      logout, // Hàm logout đã được cập nhật
      preSignup, // Yêu cầu đăng ký (gửi OTP)
      signup,    // Hoàn tất đăng ký với OTP
      forgetPassword,
      resetPassword,
      changePassword
      // Có thể thêm các hàm khác liên quan đến user tại đây nếu cần
  };

  // Chỉ render children sau khi quá trình loading ban đầu hoàn tất.
  if (isLoading) {
      // Render Spinner toàn trang khi đang kiểm tra auth ban đầu
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%', backgroundColor: 'var(--color-background)' /* Thêm màu nền nếu cần */ }}>
           {/* Spinner sẽ tự lấp đầy div này nhờ CSS đã chỉnh sửa */}
          <Spinner size="large" /> {/* Đảm bảo Spinner có prop size="large" hoặc CSS tương ứng */}
        </div>
      );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // throw new Error('useAuth must be used within an AuthProvider'); // Có thể bỏ throw error này nếu bạn muốn hook trả về undefined khi ở ngoài provider
    console.error('useAuth must be used within an AuthProvider');
    return { user: null, isAuthenticated: false, isLoading: false, login: async()=>{}, logout:()=>{}, preSignup: async()=>{}, signup: async()=>{}, forgetPassword: async()=>{}, resetPassword: async()=>{}, changePassword: async()=>{} }; // Trả về giá trị mặc định an toàn
  }
  return context;
};