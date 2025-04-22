// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header'; // Đảm bảo import đúng đường dẫn
import Footer from '../components/Footer/Footer'; // Đảm bảo import đúng đường dẫn
import styles from './MainLayout.module.css';   // Import CSS Module

const MainLayout = () => {
  return (
    // Container chính bao bọc toàn bộ layout
    <div className={styles.layoutContainer}>
      <Header />
      {/* Thẻ <main> chứa nội dung động */}
      <main className={styles.mainContent}>
        <Outlet /> {/* Nội dung từ các Route con sẽ được render ở đây */}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;