import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom'; // Import Outlet
// Layouts
import MainLayout from './layouts/MainLayout';
// Import other layouts if needed

// Pages
import HomePage from './pages/HomePage/HomePage';
import SearchProductListPage from './pages/SearchProductListPage/SearchProductListPage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import CartPage from './pages/CartPage/CartPage';
import UserProfilePage from './pages/UserProfilePage/UserProfilePage';
import LoginPage from './pages/AuthPage/loginPage';
import SignupPage from './pages/AuthPage/signupPage';
import ChangePassword from './pages/AuthPage/changePasswordPage';
import ForgetPasswordPage from './pages/AuthPage/forgetPassword';
import SignupNoOtpPage from './pages/AuthPage/signupNoOtp';
import ResetPasswordPage from './pages/AuthPage/resetPassword';
import ProductListPage from './components/ProductListPage/ProductListPage'; // Assuming this is also a page
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import VNPayReturn from './pages/VNPayReturn/VNPayReturn';
import OrderHistoryPage from './pages/OrderHistoryPage/OrderHistoryPage'; // Import OrderHistoryPage
import AdminPage from './pages/AdminPage/AdminPage';
import ProductMangerPage from './pages/ProductManagerPage/ProductManagerPage'
import UserInfoEdit from './pages/UserInfoEdit/UserInfoEdit';
import OrderSuccessPage from './pages/OrderSuccessPage/OrderSuccessPage';
import ShipperPage from './pages/ShipperPage/ShipperPage';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* --- Main Layout Routes --- */}
      <Route path="/" element={<MainLayout />}>
        {/* Public Pages */}
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="search" element={<SearchProductListPage />} />

        {/* Authentication Pages (within MainLayout) */}
        <Route path="login" element={<LoginPage />} />
         <Route path="pre-signup" element={<SignupNoOtpPage />} />
                <Route path="signup" element={<SignupPage />} />
       <Route path="forget-password" element={<ForgetPasswordPage />} />
               <Route path="reset-password" element={<ResetPasswordPage />} />
               <Route path="change-password" element={<ChangePassword />} />

        {/* Payment Callback Route (Publicly accessible but likely processes sensitive info) */}
        <Route path="/vnpay_jsp/vnpay_return.jsp" element={<VNPayReturn />} />

        {/* --- Protected Routes (Require Login) --- */}
        <Route
          element={ // Group protected routes under a single ProtectedRoute element
            <ProtectedRoute>
              <Outlet /> {/* Outlet renders the matched child route */}
            </ProtectedRoute>
          }
        >
          {/* These routes will only be accessible if ProtectedRoute allows */}
          <Route path="cart" element={<CartPage />} />
          <Route path="place-order" element={<PlaceOrder />} />
          <Route path="profile" element={<UserProfilePage />} />
           <Route path="profile/edit" element={<UserInfoEdit />} />
           <Route path="order-success-cod" element={<OrderSuccessPage />} />
          {/* Corrected route for Order History */}
          <Route path="profile/orders" element={<OrderHistoryPage />} />
          {/* Add other protected routes here */}
        </Route>
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin"> {/* Yêu cầu đăng nhập VÀ role 'admin' */}
            {/* Nếu muốn có Admin Layout riêng thì thay AdminPage bằng AdminLayout */}
            {/* <AdminLayout> */}
              <AdminPage />
            {/* </AdminLayout> */}
          </ProtectedRoute>
        }
      > </Route>
      <Route
        path="/pm"
        element={
          <ProtectedRoute requiredRole="product_manager"> {/* Yêu cầu đăng nhập VÀ role 'admin' */}
            {/* Nếu muốn có Admin Layout riêng thì thay AdminPage bằng AdminLayout */}
            {/* <AdminLayout> */}
              <ProductMangerPage />
            {/* </AdminLayout> */}
          </ProtectedRoute>
        }
      > </Route>
      {/* --- Routes Outside MainLayout (e.g., Admin, Fullscreen Auth) --- */}

      <Route path="/shipper" element={<MainLayout />}>
          <Route index element={<ShipperPage />} />
      </Route>
     

      {/* Global 404 Not Found Route (if no other route matches) */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}

    </Routes>
  );
}

export default App;