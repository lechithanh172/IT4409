// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import styles from './MainLayout.module.css';   // Import CSS Module
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer và toast // Import CSS mặc định của toastify

const MainLayout = () => {

  // // Ví dụ test toast (có thể xóa đi)
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     toast.info("Toast từ MainLayout!");
  //   }, 1000);
  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <div className={styles.layoutContainer}>
      <Header />

      {/* Áp dụng class từ CSS Module */}
      {/* Các props cấu hình chính vẫn nên giữ lại */}
      <ToastContainer
          className={styles.customToastContainer} // *** THÊM CLASS CSS MODULE ***
          toastClassName={styles.customToast} // Style cho từng toast (tùy chọn)
          bodyClassName={styles.customToastBody} // Style cho nội dung toast (tùy chọn)
          progressClassName={styles.customProgressBar} // Style thanh progress (tùy chọn)
          position="top-right" // *** Vẫn nên giữ prop vị trí ở đây ***
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light" // Theme vẫn có thể đặt ở đây hoặc custom bằng CSS
      />

      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;