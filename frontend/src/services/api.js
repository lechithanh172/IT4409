
import axios from "axios";


export const base_url = "https://ducable.id.vn";
const LOGIN_ENDPOINT = "/auth/login";
const SIGNUP_REQUEST_ENDPOINT = "/auth/signup";
const SIGNUP_OTP_ENDPOINT = "/auth/signup-otp";
const REFRESH_TOKEN_ENDPOINT = "/auth/refresh-token";

const apiInstance = axios.create({
  baseURL: base_url,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
});


let isRefreshing = false;
let failedQueue = [];


let setTokensCallback = null;
let logoutCallback = null;
let getTokensCallback = null;



export const setupApiInterceptors = (callbacks) => {
    setTokensCallback = callbacks.setTokens;
    logoutCallback = callbacks.logout;
    getTokensCallback = callbacks.getTokens;
    console.log("[apiService] Interceptors setup complete with AuthContext callbacks.");
};




apiInstance.interceptors.request.use(
  (config) => {
    const publicEndpoints = [
        LOGIN_ENDPOINT,
        SIGNUP_REQUEST_ENDPOINT,
        SIGNUP_OTP_ENDPOINT,

    ];


    if (!publicEndpoints.includes(config.url) && config.url !== REFRESH_TOKEN_ENDPOINT) {
      const tokens = getTokensCallback ? getTokensCallback() : null;
      const accessToken = tokens?.accessToken;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      } 
    }

    return config;
  },
  (error) => Promise.reject(error)
);




apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;


    if (status === 401 && originalRequest && originalRequest.url !== REFRESH_TOKEN_ENDPOINT) {


      if (isRefreshing) {
        console.log("[apiService] 401 intercepted. Refresh is ongoing. Adding request to queue:", originalRequest.url);

        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {

            originalRequest.headers['Authorization'] = 'Bearer ' + token;

            return apiInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }


      console.log("[apiService] 401 intercepted. Attempting token refresh...");
      isRefreshing = true;

      const tokens = getTokensCallback ? getTokensCallback() : null;
      const refreshToken = tokens?.refreshToken;


      if (!refreshToken) {
          console.warn("[apiService] 401 received, but no refresh token available. Logging out.");
          if (logoutCallback) logoutCallback(true);

          failedQueue.forEach(prom => prom.reject(error));
          failedQueue = [];
          isRefreshing = false;
          return Promise.reject(error);
      }

      try {

        console.log("[apiService] Calling refresh token API with refreshToken:", refreshToken);

        const refreshResponse = await axios.post(`${base_url}${REFRESH_TOKEN_ENDPOINT}`, {
          refreshToken: refreshToken,
        });

        const newAccessToken = refreshResponse.data?.accessToken;
        const newRefreshToken = refreshResponse.data?.refreshToken;

        if (newAccessToken && setTokensCallback) {
          console.log("[apiService] Token refresh successful. Updating tokens.");

          setTokensCallback({ accessToken: newAccessToken, refreshToken: newRefreshToken || refreshToken });

          apiInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;


          console.log(`[apiService] Retrying ${failedQueue.length} queued requests...`);
          failedQueue.forEach(prom => prom.resolve(newAccessToken));
          failedQueue = [];


          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          return apiInstance(originalRequest);
        } else {
            console.error("[apiService] Token refresh failed: No new access token received in response.");

            if (logoutCallback) logoutCallback(true);
            failedQueue.forEach(prom => prom.reject(new Error("Token refresh failed: No new token in response.")));
            failedQueue = [];
            return Promise.reject(new Error("Token refresh failed: No new token in response."));
        }
      } catch (refreshError) {
        console.error("[apiService] Token refresh API call failed:", refreshError.response?.data || refreshError.message);

        if (logoutCallback) logoutCallback(true);


        failedQueue.forEach(prom => prom.reject(refreshError));
        failedQueue = [];

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }


    console.error(`[API Error] Status: ${status || 'N/A'}`, error.response?.data || error.message || error);


     if (status === 403) {
         console.warn("[apiService] Forbidden (403). User may not have permission to access:", originalRequest?.url);

     }


    return Promise.reject(error);
  }
);


const apiService = {

  requestSignup: (data) => apiInstance.post(SIGNUP_REQUEST_ENDPOINT, data),
  signupWithOtp: (data) => apiInstance.post(SIGNUP_OTP_ENDPOINT, data),
  login: (data) => apiInstance.post(LOGIN_ENDPOINT, data),



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


  updateCategory: (data) => apiInstance.put("/category/update", data),
  deleteCategory: (categoryId) => apiInstance.delete(`/category/delete?categoryId=${categoryId}`),
  getProductsByCategory: (categoryName) => apiInstance.get(`/product/category=${encodeURIComponent(categoryName)}`),
  getAllCategories: () => apiInstance.get("/category/"),


  getAllBrands: () => apiInstance.get("/brand/"),
  getBrandByName: (brandName) =>
    apiInstance.get("/brand", { params: { brand: brandName } }),
  addBrand: (data) => apiInstance.post("/brand/add", data),
  deleteBrand: (brandId) =>
    apiInstance.delete("/brand/delete", {
      params: { brandId },
    }),
  updateBrand: (data) => apiInstance.put("/brand/update", data),


  getProductsbyBrandName: (data) => apiInstance.get(`product/brand=${data}`),
  getProductsbyCategory: (data) => apiInstance.get(`product/category=${data}`),
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


        return apiInstance.post("product/filter", body);
    },

  getCartItems: () => apiInstance.get("/cart-item/"),
  addToCart: (data) => apiInstance.post("/cart-item/add", data),
  updateCartItem: (data) => apiInstance.put("/cart-item/update", data),
  removeCartItem: (data) => apiInstance.post(`/cart-item/remove`, data),
  clearCart: () => apiInstance.delete("/cart-item/clear"),


  getProvinces: () => apiInstance.get("/location/province"),
  getDistricts: (provinceId) => apiInstance.get(`/location/district/${provinceId}`),
  getWards: (districtId) => apiInstance.get(`/location/ward/${districtId}`),
  calculateShippingFee: (data) => apiInstance.post("/order/shipping-fee", data),
  vnPayCreate: (data) => apiInstance.post("/api/vnpay/create", data),


  createOrder: (data) => apiInstance.post("/order/create", data),
  getOrderItems: (orderId) => apiInstance.get(`/order/get-items/${orderId}`),
  getOrderHistory: (username) => apiInstance.get(`/order/history/${username}`),
  getOrderById: (orderId) => apiInstance.get(`/order/view/${orderId}`),
  getOrdersByStatus: (status) => apiInstance.get(`/order/status/${status}`),
  approveOrder: (orderId) => apiInstance.post(`/order/approve/${orderId}`),
  getAllOrders: () => apiInstance.get('/order/view/all'),
applyOrderStatus: (data) => apiInstance.post('/order/apply-status', data),


  getUnassignedOrders: () => apiInstance.get("/order/unassigned"),
  getShipperOrders: (shipperId) => apiInstance.get(`/order/shipper/${shipperId}`),
  assignOrder: (orderId, shipperId) => apiInstance.post(`/order/assign/${orderId}`, null, {
    params: { shipperId }
  }),
  updateOrderStatus: (orderId, status) => apiInstance.post(`/order/status/${orderId}`, null, {
    params: { status }
  }),


  postRate: (data) => apiInstance.post("/rating/submit", data),
  getListRateOfProduct: (productId) => apiInstance.get(`/rating/list/${productId}`),
  getAverageRateOfProduct: (productId) => apiInstance.get(`/rating/average/${productId}`),
};

export default apiService;