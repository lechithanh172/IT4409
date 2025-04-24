import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage/HomePage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import LoginPage from './pages/AuthPage/loginPage';
import EmailInputPage from './pages/AuthPage/emailPage';
import SignupPage from './pages/AuthPage/signupPage';
import ChangePassword from './pages/AuthPage/changePasswordPage';
// import OtpPage from './pages/AuthPage/otpPage';
function App() {
  return (
    <Routes>

      <Route path="/" element={<MainLayout />}>
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route index element={<HomePage />} /> {/* Trang chủ */}
        <Route path="login" element={<LoginPage />} />
        <Route path="email" element={<EmailInputPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>
    </Routes>
  );
}

export default App;