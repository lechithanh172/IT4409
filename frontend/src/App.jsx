import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage/HomePage';
import adminLayout from './pages/AdminPage/adminLayout';
import Admin from './pages/AdminPage/AdminPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}> 
        <Route index element={<HomePage />} /> {/* Trang chủ */} 
      </Route>
        <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;