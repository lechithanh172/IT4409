
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import styles from './MainLayout.module.css';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const MainLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (

    <div className={`${styles.layoutContainer} ${isHomePage ? styles.homepageActive : ''}`}>
      <Header />

      {/* Đặt ToastContainer ở đây, không nằm trong main */}
      <ToastContainer
          className={styles.customToastContainer}

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

      <main className={styles.mainContent}>
        <Outlet /> {/* Nội dung các trang con sẽ render ở đây */}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;