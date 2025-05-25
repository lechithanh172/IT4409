import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

import apiService, { setupApiInterceptors, base_url } from '../services/api';
import axios from 'axios';
import Spinner from '../components/Spinner/Spinner';


import { toast } from 'react-toastify';


const AuthContext = createContext();


const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'userData';
const PENDING_USERNAME_KEY = 'pendingUsername';



const REFRESH_INTERVAL = 270000;
const REFRESH_TOKEN_ENDPOINT = "/auth/refresh-token";



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






const fetchUserInfo = async (username) => {
    if (!username) {
         console.warn("[AuthContext] fetchUserInfo called without username.");
         return null;
    }
    console.log(`[AuthContext] Fetching user info for ${username}...`);
    try {


        const response = await apiService.getUserInfo(username);

        if (response?.data && typeof response.data === 'object' && response.data.role) {
            const userInfo = {
                ...response.data,
                username: username,
                role: String(response.data.role).toLowerCase()
            };
             console.log("[AuthContext] fetchUserInfo success:", userInfo);
             return userInfo;
        } else {
            console.error("[AuthContext] Fetched user info is invalid:", response?.data);








            return null;
        }
    } catch (error) {



        console.error(`[AuthContext] Error fetching user info for ${username}:`, error);

        throw error;
    }
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  const refreshTimerRef = useRef(null);


  const logout = useCallback((triggeredByError = false) => {
    console.log(`[AuthContext] Logging out. Triggered by error: ${triggeredByError}`);
    clearAuthStorage();
    setUser(null);

    if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
        console.log("[AuthContext] Refresh timer cleared on logout.");
    }




    if (!triggeredByError) {
        toast.success("Đăng xuất thành công!");
        console.log("[AuthContext] Showing logout success toast (not triggered by error).");
    } else {
         console.warn("[AuthContext] Logout triggered by error, skipping success toast.");
    }


  }, []);


  const startRefreshTokenTimer = useCallback(() => {

    const { refreshToken } = getTokens();
    if (!refreshToken) {
        console.log("[AuthContext] No refresh token found, not starting refresh timer.");
        return;
    }


    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
      console.log("[AuthContext] Cleared existing refresh timer.");
    }

    console.log(`[AuthContext] Starting refresh token timer (${REFRESH_INTERVAL / 1000} seconds interval).`);

    refreshTimerRef.current = setInterval(async () => {
        console.log("[AuthContext] Refresh timer fired. Attempting to refresh token...");
        const { refreshToken: currentRefreshToken } = getTokens();

        if (!currentRefreshToken) {
            console.warn("[AuthContext] No refresh token found during timer tick. Logging out.");
            logout(true);
            return;
        }


        try {




            const refreshResponse = await axios.post(`${base_url}${REFRESH_TOKEN_ENDPOINT}`, {
              refreshToken: currentRefreshToken,
            });

            const newAccessToken = refreshResponse.data?.accessToken;
            const newRefreshToken = refreshResponse.data?.refreshToken;

            if (newAccessToken) {
              console.log("[AuthContext] Timer refresh successful. Updating tokens.");


              setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken || currentRefreshToken });

            } else {
                console.error("[AuthContext] Timer refresh failed: No new access token received in response.");

                logout(true);
            }
        } catch (refreshError) {
            console.error("[AuthContext] Timer refresh API call failed:", refreshError.response?.data || refreshError.message);


            logout(true);
        }
    }, REFRESH_INTERVAL);

  }, [logout]);




  useEffect(() => {
      console.log("[AuthContext] Setting up API interceptors...");

      setupApiInterceptors({
          getTokens: getTokens,
          setTokens: setTokens,
          logout: () => logout(true),
      });
      console.log("[AuthContext] API interceptors linked with logout(true).");


      return () => {
           if (refreshTimerRef.current) {
              clearInterval(refreshTimerRef.current);
              refreshTimerRef.current = null;
              console.log("[AuthContext] Refresh timer cleared on unmount.");
          }
      };



  }, [logout]);



  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log("[AuthContext] Starting initial auth check...");
      const { accessToken } = getTokens();
      let usernameFromStorage = null;


      const storedUserData = localStorage.getItem(USER_DATA_KEY);
      if (storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData);

          if (parsedUser?.username && parsedUser?.role) {
               usernameFromStorage = parsedUser.username;


               parsedUser.role = String(parsedUser.role).toLowerCase();
               setUser(parsedUser);
               console.log("[AuthContext] User data found in storage. Setting user state temporarily.");
           } else {
               console.warn("[AuthContext] Stored user data is incomplete or invalid.");
               localStorage.removeItem(USER_DATA_KEY);
           }
        } catch (e) {
          console.error("[AuthContext] Error parsing userData from storage:", e);
          localStorage.removeItem(USER_DATA_KEY);
        }
      }


      if (!usernameFromStorage) {
          usernameFromStorage = localStorage.getItem(PENDING_USERNAME_KEY);
          if (usernameFromStorage) {
               console.log("[AuthContext] Found pendingUsername in storage.");
           }
      }


      if (accessToken && usernameFromStorage) {
        console.log(`[AuthContext] Found tokens & username (${usernameFromStorage}). Validating session by fetching user info...`);
        try {




          const currentUserInfo = await fetchUserInfo(usernameFromStorage);

          if (currentUserInfo) {
            setUser(currentUserInfo);
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(currentUserInfo));
            localStorage.removeItem(PENDING_USERNAME_KEY);
            console.log("[AuthContext] Valid session restored:", currentUserInfo);

            startRefreshTokenTimer();
          } else {

            console.warn("[AuthContext] Initial user info fetch returned invalid data.");

            logout(true);
          }
        } catch (error) {

          console.error("[AuthContext] Error during initial user info fetch:", error);


          logout(true);
        }
      } else {

        console.log("[AuthContext] No valid tokens or username found for session restore. Ensuring clean state.");



        logout(true);
      }

      setIsLoading(false);
      console.log("[AuthContext] Initial auth check finished.");
    };


    checkAuthStatus();




  }, [startRefreshTokenTimer, logout]);


  const login = async (username, password) => {
    console.log(`[AuthContext] Attempting login: ${username}`);

    clearAuthStorage();
    localStorage.setItem(PENDING_USERNAME_KEY, username);

    try {

      const loginResponse = await apiService.login({ username, password });
      const { accessToken, refreshToken } = loginResponse.data;

      if (!accessToken || !refreshToken) {
          console.error("[AuthContext] Login response missing tokens.");
          throw new Error('Không nhận đủ token xác thực (access/refresh) từ API.');
      }

      setTokens({ accessToken, refreshToken });
      console.log("[AuthContext] Login: Tokens received and stored.");



      const userInfo = await fetchUserInfo(username);

      if (userInfo) {
        setUser(userInfo);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userInfo));
        localStorage.removeItem(PENDING_USERNAME_KEY);
        console.log("[AuthContext] Login successful. User state updated:", userInfo);
        startRefreshTokenTimer();

        return userInfo;
      } else {

        console.error("[AuthContext] Login successful but could not fetch valid user info.");
        logout(true);
        throw new Error("Đăng nhập thành công nhưng không thể lấy thông tin tài khoản hợp lệ.");
      }
    } catch (error) {
      console.error("[AuthContext] Login failed:", error);



      clearAuthStorage();

      const message = error.response?.data?.message ||
        (error.response?.status === 401 ? 'Sai tên đăng nhập hoặc mật khẩu' : null) ||
        error.message ||
        'Đăng nhập thất bại.';
      throw new Error(message);
    }
  };



  const preSignup = async (data) => {
    console.log("[AuthContext] Attempting pre-signup with data:", data);
    try {
      const response = await apiService.requestSignup(data);
      console.log("[AuthContext] Pre-signup success:", response.data);
      return response.data;
    } catch (error) {
      console.error("[AuthContext] Pre-signup error:", error);
      const message = error.response?.data?.message || error.message || "Gửi email OTP không thành công.";
      throw new Error(message);
    }
  };


  const signup = async (signupData) => {
    console.log("[AuthContext] Attempting signup with OTP with data:", signupData);
    try {
      const response = await apiService.signupWithOtp(signupData);
      console.log("[AuthContext] API Signup with OTP Response:", response);
      if (response.status === 200 || response.status === 201) {
        console.log("[AuthContext] Signup with OTP successful");


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


  const forgetPassword = async (email) => {
    console.log("[AuthContext] Sending forget password request for:", email);
    try {
      const response = await apiService.forgetPassword(email);
      console.log("[AuthContext] Forget password response:", response.data);
      return response.data || "OTP đã được gửi đến email của bạn.";
    } catch (error) {
      console.error("[AuthContext] Forget password error:", error);
      const message = error.response?.data?.message || error.message || "Không thể gửi OTP.";
      throw new Error(message);
    }
  };


  const resetPassword = async (data) => {
    console.log("[AuthContext] Attempting reset password.");
    try {
      const response = await apiService.resetPassword(data);
      console.log("[AuthContext] Reset password success:", response.data);
      return response.data;
    } catch (error) {
      console.error("[AuthContext] Reset password error:", error);
      const message = error.response?.data?.message || error.message || 'Đặt lại mật khẩu thất bại.';
      throw new Error(message);
    }
  };


  const changePassword = async ({ currentPassword, newPassword }) => {
    console.log('[AuthContext] Attempting change password.');
    try {


      const response = await apiService.changePassword({
        currentPassword,
        newPassword
      });

      console.log('[AuthContext] Password changed successfully.');


       return response.data;
    } catch (error) {
      console.error('[AuthContext] Change password error:', error);


      const message = error.response?.data?.message || error.message || 'Đổi mật khẩu thất bại.';


      throw new Error(message);
    }
  };



  const value = {
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      preSignup,
      signup,
      forgetPassword,
      resetPassword,
      changePassword

  };


  if (isLoading) {

      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%', backgroundColor: 'var(--color-background)'  }}>
           {}
          <Spinner size="large" /> {}
        </div>
      );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {

    console.error('useAuth must be used within an AuthProvider');
    return { user: null, isAuthenticated: false, isLoading: false, login: async()=>{}, logout:()=>{}, preSignup: async()=>{}, signup: async()=>{}, forgetPassword: async()=>{}, resetPassword: async()=>{}, changePassword: async()=>{} };
  }
  return context;
};