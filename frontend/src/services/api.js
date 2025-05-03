import axios from "axios";

export const base_url = "http://ducable.id.vn:8080";
axios.defaults.withCredentials = true; // Quan trọng đối với xác thực dựa trên session/cookie nếu được sử dụng

const apiInstance = axios.create({
  baseURL: base_url,
  timeout: 60000,
});

// Interceptor yêu cầu để thêm Bearer token
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

// Interceptor phản hồi để xử lý lỗi toàn cục
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
  requestSignup: (data) => apiInstance.post("/auth/signup", data), // 1. API Yêu cầu đăng ký
  signupWithOtp: (data) => apiInstance.post("/auth/signup-otp", data), // 2. API Đăng ký khi có otp
  login: (data) => apiInstance.post("/auth/login", data), // 3. API Login

  // CATEGORY APIs
  getAllCategories: () => apiInstance.get("/category/"), // 4. API Lấy tất cả danh mục
  getCategoryByName: (categoryName) => // 5. API Lấy danh mục theo tên
    apiInstance.get("/category", { params: { category: categoryName } }),
  addCategory: (data) => apiInstance.post("/category/add", data), // 6. API Thêm danh mục
  deleteCategory: (categoryId) => // 7. API Xoá danh mục
    apiInstance.delete("/category/delete", {
      params: { categoryId },
    }),
  updateCategory: (data) => apiInstance.put("/category/update", data), // 8. API Cập nhật danh mục

  // BRAND APIs
  getAllBrands: () => apiInstance.get("/brand/"), // 9. API Lấy tất cả brand
  getBrandByName: (brandName) => // 10. API Lấy brand theo tên
    apiInstance.get("/brand", { params: { brand: brandName } }),
  addBrand: (data) => apiInstance.post("/brand/add", data), // 11. API Thêm brand
  deleteBrand: (brandId) => // 12. API Xoá brand (Đã sửa đường dẫn từ tài liệu)
    apiInstance.delete("/brand/delete", {
      params: { brandId },
    }),
  updateBrand: (data) => apiInstance.put("/brand/update", data), // 13. API Cập nhật brand

  // PRODUCT APIs+
  getAllProducts: () => apiInstance.get("/product/all"),
  addProduct: (data) => apiInstance.post("/product/add", data), // 14. API Thêm sản phẩm
  deleteProduct: (productId) => // 15. API Xoá sản phẩm
    apiInstance.delete("/product/delete", {
      params: { productId },
    }),
  updateProduct: (data) => apiInstance.put("/product/update", data), // 16. API Cập nhật sản phẩm
  getProductById: (productId) => apiInstance.get(`/product/${productId}`), // 33. API Xem sản phẩm
  getProductsByCategory: (categoryName) => // 34. API Xem sản phẩm theo danh mục (Hiện có)
    apiInstance.get(`/product/category=${categoryName}`),
  searchProducts: (keyword) => // 35. API Search sản phẩm (Hiện có)
    apiInstance.get(`/product/search=${keyword}`),

  // CART ITEM APIs
  checkCartItemStock: (data) => apiInstance.post("/cart-item/check", data), // 17. API Kiểm tra số lượng sản phẩm
  addToCart: (data) => apiInstance.post("/cart-item/add", data), // 18. API Thêm sản phẩm vào giỏ hàng (Hiện có)
  updateCartItem: (data) => apiInstance.put("/cart-item/update", data), // 19. API Cập nhật sản phẩm trong giỏ hàng (Hiện có)
  removeCartItem: (data) => apiInstance.post("/cart-item/remove", data), // 20. API Xoá sản phẩm khỏi giỏ hàng (Hiện có)

  // ORDER APIs
  createOrder: (data) => apiInstance.post("/order/create", data), // 21. API Tạo đơn hàng (Hiện có)
  getOrderHistory: (username) => apiInstance.get(`/order/history/${username}`), // 22. API Xem lịch sử đơn hàng (Hiện có)
  getOrderById: (orderId) => apiInstance.get(`/order/view/${orderId}`), // 23. API Xem đơn hàng cụ thể (Hiện có)
  getOrdersByStatus: (status) => apiInstance.get(`/order/status/${status}`), // 24. API Lọc đơn theo trạng thái (Hiện có)
  getAllOrders: () => apiInstance.get('/order/view/all'),
  updateOrderStatus: (data) => apiInstance.post('/order/apply-status', data),
  // USER APIs

getUserInfo: (username) => apiInstance.get(`/user/info/${username}`),
getUsersByRole: (role) => apiInstance.get(`/user/${role}`),
updateUserInfo: (data) => apiInstance.put("/user/update", data), // data nên là object chứa các trường cần cập nhật
deleteUser: (userId) =>
  apiInstance.delete("/user/delete", {
    params: { userId }, // Gửi userId như một query parameter
  }),
setUserRole: (data) => apiInstance.post('/user/set-role', data), // data = { userId, role }

forgetPassword: (email) =>
  apiInstance.post("/user/forget-password", null, { // Gửi body là null
    params: { email }, // Gửi email như query parameter
  }),


resetPassword: (data) => apiInstance.post("/user/reset-password", data), // Gửi email, otp, newPassword trong body

changePassword: (data) => apiInstance.post("/user/change-password", data),


  // PAYMENT APIs
  createVnPayPayment: (data) => apiInstance.post("/api/vnpay/create", data), // 32. API Tạo thanh toán
};

export default apiService;