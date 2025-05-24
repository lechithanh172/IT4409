// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // Import useLocation
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import styles from './MainLayout.module.css';   // Import CSS Module
import { ToastContainer, toast } from 'react-toastify';
// Import CSS mặc định của toastify ở đây hoặc trong file CSS global của bạn
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = () => {
  const location = useLocation(); // Lấy thông tin route hiện tại
  const isHomePage = location.pathname === '/'; // Kiểm tra xem có phải trang chủ không

  return (
    // Thêm class 'homepageActive' nếu đang ở trang chủ
    <div className={`${styles.layoutContainer} ${isHomePage ? styles.homepageActive : ''}`}>
      <Header />

      {/* Đặt ToastContainer ở đây, không nằm trong main */}
      <ToastContainer
          className={styles.customToastContainer} // Vẫn giữ class tùy chỉnh
          // ... các props khác của ToastContainer ...
          position="top-right" // Vẫn nên cấu hình vị trí ở đây
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
      />

      <main className={styles.mainContent}>
        <Outlet /> {/* Nội dung các trang con sẽ render ở đây */}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;