import axios from "axios";

// =========================
// 🔧 Cấu hình axios instance
// =========================
export const base_url = "http://3.27.90.134:8080";
axios.defaults.withCredentials = true;

const apiInstance = axios.create({
  baseURL: base_url,
  timeout: 60000,
});

// ✅ Interceptor: Thêm token vào Authorization header
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    // token = '';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ❌ Interceptor: Xử lý lỗi phản hồi
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

// ========================================
// 📦 API Service – Gom nhóm theo chức năng
// ========================================
const apiService = {

  // -------------------------------
  // 🗂 CATEGORY APIs
  // -------------------------------
  updateCategory: (data) => apiInstance.put("/category/update", data),
  deleteCategory: (categoryId) =>
    apiInstance.delete("/category/delete", {
      params: { categoryId },
    }),
  getProductsByCategory: (categoryName) =>
    apiInstance.get(`/product/category=${categoryName}`),

  // -------------------------------
  // 🛍 PRODUCT APIs
  // -------------------------------
  addProduct: (data) => apiInstance.post("/product/add", data),
  updateProduct: (data) => apiInstance.put("/product/update", data),
  deleteProduct: (productId) =>
    apiInstance.delete("/product/delete", {
      params: { productId },
    }),
  searchProducts: (keyword) =>
    apiInstance.get(`/product/search=${keyword}`),
  // -------------------------------
  // 🛒 CART ITEM APIs
  // -------------------------------
  addToCart: (data) => apiInstance.post("/cart-item/add", data),
  updateCartItem: (data) => apiInstance.put("/cart-item/update", data),
  removeCartItem: (data) => apiInstance.post("/cart-item/remove", data),

  // -------------------------------
  // 📦 ORDER APIs
  // -------------------------------
  createOrder: (data) => apiInstance.post("/order/create", data),
  getOrderHistory: (username) => apiInstance.get(`/order/history/${username}`),
  getOrderById: (orderId) => apiInstance.get(`/order/view/${orderId}`),
  getOrdersByStatus: (status) => apiInstance.get(`/order/status/${status}`),
  approveOrder: (orderId) => apiInstance.post(`/order/approve/${orderId}`),

  // -------------------------------
  // 👤 USER APIs
  // -------------------------------
  getUserInfo: (username) => apiInstance.get(`/user/info/${username}`),
  updateUserInfo: (data) => apiInstance.put("/user/update", data),
  deleteUser: (userId) =>
    apiInstance.delete("/user/delete", {
      params: { userId },
    }),
  changePassword: (data) => apiInstance.put("/user/change-password", data),
  forgetPassword: (email) =>
    apiInstance.post("/user/forget-password", null, {
      params: { email },
    }),
  resetPassword: (data) => apiInstance.post("/user/reset-password", data),
};

export default apiService;
