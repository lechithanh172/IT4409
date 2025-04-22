import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage/HomePage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}> 
      <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route index element={<HomePage />} /> {/* Trang chủ */} 
      </Route>
    </Routes>
  );
}

export default App;