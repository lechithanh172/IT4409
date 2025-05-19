// src/services/api.js
import axios from "axios";

// --- Cấu hình cơ bản ---
export const base_url = "http://ducable.id.vn:8080";
const LOGIN_ENDPOINT = "/auth/login";
const SIGNUP_ENDPOINT = "/auth/signup"; // Giả sử

const apiInstance = axios.create({
  baseURL: base_url,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
});

// --- Interceptor Request ---
apiInstance.interceptors.request.use(
  (config) => {
    if (config.url === LOGIN_ENDPOINT || config.url === SIGNUP_ENDPOINT) {
      return config;
    }
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Interceptor Response ---
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`[API Response Error] Request to ${error.config?.url} failed`);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      // Xử lý lỗi 401, 403 nếu cần
      if (error.response.status === 401) {
        console.warn("Unauthorized (401). Logging out.");
        // Có thể gọi hàm logout toàn cục ở đây hoặc để context xử lý
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('pendingUsername'); // Xóa username tạm
        localStorage.removeItem('userData');
        // window.location.href = '/login'; // Chuyển hướng cứng nếu cần
      }
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

// --- API Service ---
const apiService = {
  // AUTH
  requestSignup: (data) => apiInstance.post("/auth/signup", data), // 1. API Yêu cầu đăng ký
  signupWithOtp: (data) => apiInstance.post("/auth/signup-otp", data), // 2. API Đăng ký khi có otp
  login: (data) => apiInstance.post("/auth/login", data), // 3. API Login
  // USER
  // Hàm này cần username
  getUserInfo: (username) => apiInstance.get(`/user/info/${username}`),
  getUsersByRole: (role) => apiInstance.get(`/user/${role}`),
  updateUserInfo: (data) => apiInstance.put("/user/update", data),
  deleteUser: (userId) =>
    apiInstance.delete("/user/delete", {
      params: { userId },
    }),
  setUserRole: (data) => apiInstance.post('/user/set-role', data),
  changePassword: (data) => apiInstance.put("/user/change-password", data),
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
  vnPayCreate: (data) => apiInstance.post("/api/vnpay/create", data),
  //
  // ORDER
  createOrder: (data) => apiInstance.post("/order/create", data),
  getOrderItems: (orderId) => apiInstance.get(`/order/get-items/${orderId}`),
  getOrderHistory: (username) => apiInstance.get(`/order/history/${username}`),
  getOrderById: (orderId) => apiInstance.get(`/order/view/${orderId}`),
  getOrdersByStatus: (status) => apiInstance.get(`/order/status/${status}`), // Cho admin
  approveOrder: (orderId) => apiInstance.post(`/order/approve/${orderId}`), // Cho admin
  getAllOrders: () => apiInstance.get('/order/view/all'),
};

export default apiService;