import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage/HomePage';
import Admin from './pages/AdminPage/AdminPage';

import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import LoginPage from './pages/AuthPage/loginPage';
import SignupPage from './pages/AuthPage/signupPage';
import ChangePassword from './pages/AuthPage/changePasswordPage';
import ProductManager from './pages/ProductManagerPage/ProductManagerPage';
import ForgetPasswordPage from './pages/AuthPage/forgetPassword';
import SignupNoOtpPage from './pages/AuthPage/signupNoOtp';
import ResetPasswordPage from './pages/AuthPage/resetPassword';
function App() {
  return (
    <Routes>

      <Route path="/" element={<MainLayout />}>
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route index element={<HomePage />} /> {/* Trang chủ */}
        <Route path="login" element={<LoginPage />} />
        <Route path="pre-signup" element={<SignupNoOtpPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forget-password" element={<ForgetPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="change-password" element={<ChangePassword />} />


      </Route>
      <Route path="/admin" element={<Admin />} />
      <Route path="/pm" element={<ProductManager />} />
    </Routes>
  );
}

export default App;