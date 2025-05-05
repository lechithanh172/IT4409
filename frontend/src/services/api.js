import axios from "axios";

export const base_url = "http://ducable.id.vn:8080";
axios.defaults.withCredentials = true;

const apiInstance = axios.create({
  baseURL: base_url,
  timeout: 60000,
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "Lỗi API:",
      error.response?.data || error.response?.statusText || error.message
    );
    return Promise.reject(error);
  }
);

const apiService = {
  // AUTH APIs
  requestSignup: (data) => apiInstance.post("/auth/signup", data),
  signupWithOtp: (data) => apiInstance.post("/auth/signup-otp", data),
  login: (data) => apiInstance.post("/auth/login", data),

  // CATEGORY APIs
  getAllCategories: () => apiInstance.get("/category/"),
  getCategoryByName: (categoryName) =>
    apiInstance.get("/category", { params: { category: categoryName } }),
  addCategory: (data) => apiInstance.post("/category/add", data),
  deleteCategory: (categoryId) =>
    apiInstance.delete("/category/delete", {
      params: { categoryId },
    }),
  updateCategory: (data) => apiInstance.put("/category/update", data),

  // BRAND APIs
  getAllBrands: () => apiInstance.get("/brand/"),
  getBrandByName: (brandName) =>
    apiInstance.get("/brand", { params: { brand: brandName } }),
  addBrand: (data) => apiInstance.post("/brand/add", data),
  deleteBrand: (brandId) =>
    apiInstance.delete("/brand/delete", {
      params: { brandId },
    }),
  updateBrand: (data) => apiInstance.put("/brand/update", data),

  // PRODUCT APIs
  getAllProducts: () => apiInstance.get("/product/all"),
  addProduct: (data) => apiInstance.post("/product/add", data),
  deleteProduct: (productId) =>
    apiInstance.delete("/product/delete", {
      params: { productId },
    }),
  updateProduct: (data) => apiInstance.put("/product/update", data),
  getProductById: (productId) => apiInstance.get(`/product/${productId}`),
  getProductsByCategory: (categoryName) =>
    apiInstance.get(`/product/category=${categoryName}`),
  searchProducts: (keyword) =>
    apiInstance.get(`/product/search=${keyword}`),

  // CART ITEM APIs
  checkCartItemStock: (data) => apiInstance.post("/cart-item/check", data),
  addToCart: (data) => apiInstance.post("/cart-item/add", data),
  updateCartItem: (data) => apiInstance.put("/cart-item/update", data),
  removeCartItem: (data) => apiInstance.post("/cart-item/remove", data),

  // ORDER APIs
  createOrder: (data) => apiInstance.post("/order/create", data),
  getOrderHistory: (username) => apiInstance.get(`/order/history/${username}`),
  getOrderById: (orderId) => apiInstance.get(`/order/view/${orderId}`),
  getOrdersByStatus: (status) => apiInstance.get(`/order/status/${status}`),
  getAllOrders: () => apiInstance.get('/order/view/all'),
  updateOrderStatus: (data) => apiInstance.post('/order/apply-status', data),
  getProductByOrderId: (orderId) => apiInstance.get(`/order/get-items/${orderId}`),

  // USER APIs
  getUserInfo: (username) => apiInstance.get(`/user/info/${username}`),
  getUsersByRole: (role) => apiInstance.get(`/user/${role}`),
  updateUserInfo: (data) => apiInstance.put("/user/update", data),
  deleteUser: (userId) =>
    apiInstance.delete("/user/delete", {
      params: { userId },
    }),
  setUserRole: (data) => apiInstance.post('/user/set-role', data),

  // PASSWORD APIs
  forgetPassword: (email) =>
    apiInstance.post("/user/forget-password", null, {
      params: { email },
    }),
  resetPassword: (data) => apiInstance.post("/user/reset-password", data),
  changePassword: (data) => apiInstance.post("/user/change-password", data),

  // PAYMENT APIs
  createVnPayPayment: (data) => apiInstance.post("/api/vnpay/create", data),
};

export default apiService;