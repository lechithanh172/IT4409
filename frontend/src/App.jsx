import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
// Import các layout khác nếu có (AdminLayout, ProductManagerLayout...)

// Pages chung
import HomePage from './pages/HomePage/HomePage';
import SearchProductListPage from './pages/SearchProductListPage/SearchProductListPage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import CartPage from './pages/CartPage/CartPage';
import UserProfilePage from './pages/UserProfilePage/UserProfilePage';
import LoginPage from './pages/AuthPage/loginPage';
import EmailInputPage from './pages/AuthPage/emailPage';
import SignupPage from './pages/AuthPage/signupPage';
import ChangePassword from './pages/AuthPage/changePasswordPage';
import OtpPage from './pages/AuthPage/otpPage';
import ProductListPage from './components/ProductListPage/ProductListPage';
// Admin Pages (ví dụ)
// import AdminDashboardPage from './pages/Admin/AdminDashboardPage';

// Product Manager Pages (ví dụ)
// import ProductManagerListPage from './pages/ProductManager/ProductManagerListPage';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute'; // Import component bảo vệ

function App() {
  return (
    <Routes>
      {/* === ROUTES TRONG MAINLAYOUT === */}
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="search" element={<SearchProductListPage />} />
        {/* Auth Routes (VẪN NẰM TRONG MAINLAYOUT NẾU MUỐN CÓ HEADER/FOOTER) */}
        {/* Nếu muốn các trang này không có Header/Footer, hãy đưa ra ngoài MainLayout */}
        <Route path="login" element={<LoginPage />} />
        <Route path="email" element={<EmailInputPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="otp" element={<OtpPage />} />

        {/* Protected Routes (Cần đăng nhập) */}
        <Route
          path="cart"
          element={
            <ProtectedRoute> {/* Chỉ yêu cầu đăng nhập */}
              <CartPage />
            </ProtectedRoute>
          }
        />
        {/* --- ROUTE PROFILE ĐƯỢC BẢO VỆ --- */}
        <Route
          path="profile"
          element={
             <ProtectedRoute> {/* Chỉ yêu cầu đăng nhập */}
               <UserProfilePage />
             </ProtectedRoute>
          }
        />
      </Route>

    </Routes>
  );
}

export default App;