// src/services/api.js
import axios from "axios";

// --- Cấu hình cơ bản ---
export const base_url = "http://ducable.id.vn:8080";
const LOGIN_ENDPOINT = "/auth/login";
const SIGNUP_REQUEST_ENDPOINT = "/auth/signup"; // Endpoint yêu cầu signup (gửi email)
const SIGNUP_OTP_ENDPOINT = "/auth/signup-otp"; // Endpoint xác nhận OTP
const REFRESH_TOKEN_ENDPOINT = "/auth/refresh-token"; // Endpoint refresh token (Đảm bảo backend có)

const apiInstance = axios.create({
  baseURL: base_url,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
});

// Biến để quản lý trạng thái refresh token
let isRefreshing = false;
let failedQueue = [];

// Biến để lưu các callback từ AuthContext
let setTokensCallback = null;
let logoutCallback = null;
let getTokensCallback = null;

// Hàm setup để AuthContext truyền các callback vào
// Gọi hàm này một lần khi AuthProvider mount
export const setupApiInterceptors = (callbacks) => {
    setTokensCallback = callbacks.setTokens;
    logoutCallback = callbacks.logout;
    getTokensCallback = callbacks.getTokens;
    console.log("[apiService] Interceptors setup complete with AuthContext callbacks.");
};


// --- Interceptor Request ---
// Thêm accessToken vào header Authorization trừ các endpoint public và refresh token
apiInstance.interceptors.request.use(
  (config) => {
    const publicEndpoints = [
        LOGIN_ENDPOINT,
        SIGNUP_REQUEST_ENDPOINT,
        SIGNUP_OTP_ENDPOINT,
        // Thêm các endpoint public khác nếu có
    ];

    // Chỉ thêm token nếu không phải các endpoint public VÀ không phải endpoint refresh token
    if (!publicEndpoints.includes(config.url) && config.url !== REFRESH_TOKEN_ENDPOINT) {
      const tokens = getTokensCallback ? getTokensCallback() : null;
      const accessToken = tokens?.accessToken;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      } else {
         // Tùy chọn: Nếu request cần auth mà không có token, bạn có thể từ chối nó ngay lập tức
         // return Promise.reject(new Error("Không có token xác thực cho yêu cầu này."));
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// --- Interceptor Response ---
// Xử lý lỗi 401 bằng cách sử dụng refreshToken
apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Kiểm tra nếu lỗi là 401 và không phải request refresh token đã thất bại
    if (status === 401 && originalRequest && originalRequest.url !== REFRESH_TOKEN_ENDPOINT) {

      // Nếu đang trong quá trình refresh
      if (isRefreshing) {
        console.log("[apiService] 401 intercepted. Refresh is ongoing. Adding request to queue:", originalRequest.url);
        // Trả về một Promise mới sẽ được giải quyết sau khi refresh xong
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            // Thử lại request gốc với token mới
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            // Sử dụng apiInstance để request retry, đảm bảo các cấu hình khác vẫn được giữ
            return apiInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err); // Nếu refresh thất bại, từ chối request gốc
          });
      }

      // Nếu lỗi 401 và refresh chưa diễn ra
      console.log("[apiService] 401 intercepted. Attempting token refresh...");
      isRefreshing = true; // Bắt đầu quá trình refresh

      const tokens = getTokensCallback ? getTokensCallback() : null;
      const refreshToken = tokens?.refreshToken;

      // Nếu không có refresh token, không thể refresh -> Đăng xuất
      if (!refreshToken) {
          console.warn("[apiService] 401 received, but no refresh token available. Logging out.");
          if (logoutCallback) logoutCallback(true); // Trigger logout do lỗi
          // Từ chối tất cả các request đang chờ (nếu có lỗi trước đó)
          failedQueue.forEach(prom => prom.reject(error));
          failedQueue = [];
          isRefreshing = false; // Kết thúc refresh
          return Promise.reject(error); // Từ chối request gốc
      }

      try {
        // Gọi API refresh token - SỬ DỤNG AXIOS TRỰC TIẾP ĐỂ BYPASS INTERCEPTOR
        console.log("[apiService] Calling refresh token API with refreshToken:", refreshToken);
        // Endpoint refresh token nhận body: { refreshToken: "..." }
        const refreshResponse = await axios.post(`${base_url}${REFRESH_TOKEN_ENDPOINT}`, {
          refreshToken: refreshToken, // <-- Đúng định dạng body theo API spec
        });

        const newAccessToken = refreshResponse.data?.accessToken;
        const newRefreshToken = refreshResponse.data?.refreshToken; // Backend có thể trả về refresh token mới

        if (newAccessToken && setTokensCallback) {
          console.log("[apiService] Token refresh successful. Updating tokens.");
          // Lưu cả access token mới và refresh token mới (nếu có)
          setTokensCallback({ accessToken: newAccessToken, refreshToken: newRefreshToken || refreshToken });
          // Cập nhật default header cho instance axios hiện tại
          apiInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;

          // Xử lý tất cả các request trong queue
          console.log(`[apiService] Retrying ${failedQueue.length} queued requests...`);
          failedQueue.forEach(prom => prom.resolve(newAccessToken));
          failedQueue = [];

          // Thử lại request gốc với access token mới
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          return apiInstance(originalRequest); // Trả về promise của request retry
        } else {
            console.error("[apiService] Token refresh failed: No new access token received in response.");
            // Refresh thành công nhưng không có token mới -> Trạng thái lỗi -> Đăng xuất
            if (logoutCallback) logoutCallback(true);
            failedQueue.forEach(prom => prom.reject(new Error("Token refresh failed: No new token in response.")));
            failedQueue = [];
            return Promise.reject(new Error("Token refresh failed: No new token in response."));
        }
      } catch (refreshError) {
        console.error("[apiService] Token refresh API call failed:", refreshError.response?.data || refreshError.message);
        // Refresh thất bại (vd: refresh token hết hạn, server lỗi 400) -> Đăng xuất
        if (logoutCallback) logoutCallback(true); // Trigger logout do lỗi refresh

        // Từ chối tất cả các request trong queue
        failedQueue.forEach(prom => prom.reject(refreshError));
        failedQueue = [];

        return Promise.reject(refreshError); // Từ chối request gốc
      } finally {
        isRefreshing = false; // Kết thúc quá trình refresh
      }
    }

    // Nếu lỗi không phải 401 hoặc đã là request refresh token bị lỗi
    console.error(`[API Error] Status: ${status || 'N/A'}`, error.response?.data || error.message || error);

     // Nếu lỗi là 403 (Forbidden) và không phải 401, có thể xử lý đặc biệt
     if (status === 403) {
         console.warn("[apiService] Forbidden (403). User may not have permission to access:", originalRequest?.url);
         // Bạn có thể thêm logic hiển thị thông báo "không có quyền" ở đây
     }


    return Promise.reject(error);
  }
);

// --- API Service Functions ---
const apiService = {
  // AUTH
  requestSignup: (data) => apiInstance.post(SIGNUP_REQUEST_ENDPOINT, data),
  signupWithOtp: (data) => apiInstance.post(SIGNUP_OTP_ENDPOINT, data),
  login: (data) => apiInstance.post(LOGIN_ENDPOINT, data),
  // Xóa refreshTokenAgain ở đây

  // USER
  getUserInfo: (username) => apiInstance.get(`/user/info/${username}`),
  getUsersByRole: (role) => apiInstance.get(`/user/${role}`),
  updateUserInfo: (data) => apiInstance.put("/user/update", data),
  deleteUser: (userId) =>
    apiInstance.delete("/user/delete", {
      params: { userId },
    }),
  setUserRole: (data) => apiInstance.post('/user/set-role', data),
  changePassword: (data) => apiInstance.put("/user/change-password", data),
  // Endpoint forgetPassword có vẻ nhận email qua query param. Giữ nguyên theo spec của bạn.
  forgetPassword: (email) => apiInstance.post(`/user/forget-password?email=${encodeURIComponent(email)}`),
  resetPassword: (data) => apiInstance.post("/user/reset-password", data),

  // CATEGORY
  updateCategory: (data) => apiInstance.put("/category/update", data),
  deleteCategory: (categoryId) => apiInstance.delete(`/category/delete?categoryId=${categoryId}`),
  getProductsByCategory: (categoryName) => apiInstance.get(`/product/category=${encodeURIComponent(categoryName)}`),
  getAllCategories: () => apiInstance.get("/category/"),

  // BRAND
  getAllBrands: () => apiInstance.get("/brand/"),
  getBrandByName: (brandName) =>
    apiInstance.get("/brand", { params: { brand: brandName } }),
  addBrand: (data) => apiInstance.post("/brand/add", data),
  deleteBrand: (brandId) =>
    apiInstance.delete("/brand/delete", {
      params: { brandId },
    }),
  updateBrand: (data) => apiInstance.put("/brand/update", data),

  // PRODUCT
  addProduct: (data) => apiInstance.post("/product/add", data),
  updateProduct: (data) => apiInstance.put("/product/update", data),
  deleteProduct: (productId) => apiInstance.delete(`/product/delete?productId=${productId}`),
  searchProducts: (keyword) => apiInstance.get(`/product/search=${encodeURIComponent(keyword)}`),
  getProductById: (productId) => apiInstance.get(`/product/${productId}`),
  getAllProducts: () => apiInstance.get("/product/all"),
  filterProducts: (filters = {}) => {
        console.log("[apiService] Calling product/filter POST with filters:", filters);
        const body = {};
        if (filters.type) body.type = filters.type;
        if (filters.brandName) body.brandName = filters.brandName;
        if (filters.cpu && filters.cpu.length > 0) body.cpu = filters.cpu;
        if (filters.storage && filters.storage.length > 0) body.storage = filters.storage;
        if (filters.memory && filters.memory.length > 0) body.memory = filters.memory;
        // Thêm các filter khác nếu có

        return apiInstance.post("product/filter", body);
    },
  // CART ITEM
  getCartItems: () => apiInstance.get("/cart-item/"),
  addToCart: (data) => apiInstance.post("/cart-item/add", data),
  updateCartItem: (data) => apiInstance.put("/cart-item/update", data),
  removeCartItem: (data) => apiInstance.post(`/cart-item/remove`, data),
  clearCart: () => apiInstance.delete("/cart-item/clear"),

  // ADDRESS
  getProvinces: () => apiInstance.get("/location/province"),
  getDistricts: (provinceId) => apiInstance.get(`/location/district/${provinceId}`),
  getWards: (districtId) => apiInstance.get(`/location/ward/${districtId}`),
  calculateShippingFee: (data) => apiInstance.post("/order/shipping-fee", data),
  vnPayCreate: (data) => apiInstance.post("/api/vnpay/create", data), // Endpoint này có vẻ không đúng pattern /api/v1/...

  // ORDER
  createOrder: (data) => apiInstance.post("/order/create", data),
  getOrderItems: (orderId) => apiInstance.get(`/order/get-items/${orderId}`),
  getOrderHistory: (username) => apiInstance.get(`/order/history/${username}`),
  getOrderById: (orderId) => apiInstance.get(`/order/view/${orderId}`),
  getOrdersByStatus: (status) => apiInstance.get(`/order/status/${status}`), // Cho admin
  approveOrder: (orderId) => apiInstance.post(`/order/approve/${orderId}`), // Cho admin
  getAllOrders: () => apiInstance.get('/order/view/all'),


  // SHIPPER
  getUnassignedOrders: () => apiInstance.get("/order/unassigned"),
  getShipperOrders: (shipperId) => apiInstance.get(`/order/shipper/${shipperId}`),
  assignOrder: (orderId, shipperId) => apiInstance.post(`/order/assign/${orderId}`, null, {
    params: { shipperId }
  }),
  updateOrderStatus: (orderId, status) => apiInstance.post(`/order/status/${orderId}`, null, {
    params: { status }
  }),

  // RATE
  postRate: (data) => apiInstance.post("/rating/submit", data),
  getListRateOfProduct: (productId) => apiInstance.get(`/rating/list/${productId}`),
  getAverageRateOfProduct: (productId) => apiInstance.get(`/rating/average/${productId}`),
};

export default apiService;