import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
// Import các layout khác nếu có (AdminLayout, ProductManagerLayout...)
import LoginPage from './pages/AuthPage/loginPage';
import EmailInputPage from './pages/AuthPage/emailPage';
import SignupPage from './pages/AuthPage/signupPage';
import ChangePassword from './pages/AuthPage/changePasswordPage';
import OtpPage from './pages/AuthPage/otpPage';
// Pages chung
import HomePage from './pages/HomePage/HomePage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import CartPage from './pages/CartPage/CartPage'; // Import trang giỏ hàng

// Admin Pages (ví dụ)
// import AdminDashboardPage from './pages/Admin/AdminDashboardPage';

// Product Manager Pages (ví dụ)
// import ProductManagerListPage from './pages/ProductManager/ProductManagerListPage';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute'; // Import component bảo vệ

function App() {
  return (
    <Routes>
      {/* === PUBLIC & USER ROUTES trong MainLayout === */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} /> {/* Trang chủ */}
        <Route path="products/:productId" element={<ProductDetailPage />} /> {/* Trang chi tiết SP */}
          <Route path="login" element={<LoginPage />} />
                  <Route path="email" element={<EmailInputPage />} />
                  <Route path="signup" element={<SignupPage />} />
                  <Route path="change-password" element={<ChangePassword />} />
                  <Route path="otp" element={<OtpPage />} />
        {/* --- ROUTE GIỎ HÀNG ĐƯỢC BẢO VỆ --- */}
        <Route
          path="cart"
          element={
            // Chỉ cần đăng nhập, không cần vai trò cụ thể
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        {/* --- KẾT THÚC ROUTE GIỎ HÀNG --- */}

        {/* Thêm các route public hoặc cần login khác trong MainLayout nếu có */}
        {/* Ví dụ: Trang profile người dùng */}
        {/* <Route path="profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} /> */}
      </Route>

      {/* === AUTH ROUTES (Ngoài MainLayout) === */}
      {/* === ADMIN PROTECTED ROUTES (Ví dụ) === */}
      {/* <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}> */}
        {/* <Route index element={<AdminDashboardPage />} /> */}
        {/* ... các route con của admin */}
      {/* </Route> */}

      {/* === PRODUCT MANAGER PROTECTED ROUTES (Ví dụ) === */}
      {/* <Route path="/pm" element={<ProtectedRoute requiredRole="productmanager"><ProductManagerLayout /></ProtectedRoute>}> */}
         {/* <Route index element={<ProductManagerListPage />} /> */}
         {/* ... các route con của pm */}
      {/* </Route> */}


      {/* === NOT FOUND ROUTE (Luôn đặt cuối cùng) === */}

    </Routes>
  );
}

export default App;