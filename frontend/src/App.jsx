
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';


import MainLayout from './layouts/MainLayout';

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
import ProductListPage from './components/ProductListPage/ProductListPage';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import VNPayReturn from './pages/VNPayReturn/VNPayReturn';
import OrderHistoryPage from './pages/OrderHistoryPage/OrderHistoryPage';
import AdminPage from './pages/AdminPage/AdminPage';
import ProductMangerPage from './pages/ProductManagerPage/ProductManagerPage';
import UserInfoEdit from './pages/UserInfoEdit/UserInfoEdit';
import OrderSuccessPage from './pages/OrderSuccessPage/OrderSuccessPage';
import ShipperPage from './pages/ShipperPage/ShipperPage';

import ProtectedRoute from './components/Auth/ProtectedRoute';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './layouts/MainLayout.module.css';

function App() {
  return (
   
    <>
      
      <ToastContainer
         
          className="custom-toast-container" 

          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop={false} 
          closeOnClick 
          rtl={false}
          pauseOnFocusLoss 
          draggable
          pauseOnHover 
      />

     
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} /> {/* Route for the homepage */}
          <Route path="products" element={<ProductListPage />} /> {/* Route for all products */}
          <Route path="products/:productId" element={<ProductDetailPage />} /> {/* Route for product details */}
          <Route path="search" element={<SearchProductListPage />} /> {/* Route for search results */}
          <Route path="login" element={<LoginPage />} />
          <Route path="pre-signup" element={<SignupNoOtpPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="forget-password" element={<ForgetPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="/vnpay_jsp/vnpay_return.jsp" element={<VNPayReturn />} />
          <Route
            element={
              <ProtectedRoute>
                <Outlet /> 
              </ProtectedRoute>
            }
          >
            <Route path="cart" element={<CartPage />} />
            <Route path="place-order" element={<PlaceOrder />} />
            <Route path="profile" element={<UserProfilePage />} />
            <Route path="profile/edit" element={<UserInfoEdit />} />
            <Route path="order-success-cod" element={<OrderSuccessPage />} />
            <Route path="shipper" element={<ShipperPage />} /> {/* Assuming shipper page is also protected */}
            <Route path="profile/orders" element={<OrderHistoryPage />} />
          </Route>
        </Route> 
        <Route
          path="/admin/*" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
         <Route
             path="/pm/*" 
             element={
                 <ProtectedRoute requiredRole="product_manager">
                     <ProductMangerPage />
                 </ProtectedRoute>
             }
         />
      </Routes>
    </>
  );
}

export default App;