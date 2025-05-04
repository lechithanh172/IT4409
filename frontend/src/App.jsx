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
import EmailInputPage from './pages/AuthPage/emailPage';
import SignupPage from './pages/AuthPage/signupPage';
import ChangePassword from './pages/AuthPage/changePasswordPage';
import OtpPage from './pages/AuthPage/otpPage';
import ProductListPage from './components/ProductListPage/ProductListPage'; // Assuming this is also a page
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import VNPayReturn from './pages/VNPayReturn/VNPayReturn';
import OrderHistoryPage from './pages/OrderHistoryPage/OrderHistoryPage'; // Import OrderHistoryPage

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
        <Route path="email" element={<EmailInputPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="otp" element={<OtpPage />} />

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
          {/* Corrected route for Order History */}
          <Route path="profile/orders" element={<OrderHistoryPage />} />
          {/* Add other protected routes here */}
        </Route>

        {/* Add 404 Not Found Route within MainLayout if desired */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Route>

      {/* --- Routes Outside MainLayout (e.g., Admin, Fullscreen Auth) --- */}
      {/* Example:
      <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          ... admin routes
      </Route>
      */}

      {/* Global 404 Not Found Route (if no other route matches) */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}

    </Routes>
  );
}

export default App;