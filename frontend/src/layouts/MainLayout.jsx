import React from 'react';
import { Outlet } from 'react-router-dom'; // Outlet để render các route con
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import styles from './MainLayout.module.css'; // Optional: nếu layout có style riêng

const MainLayout = () => {
  return (
    <div className={styles.layoutContainer}> {/* Optional: thêm class nếu cần */}
      <Header />
      <main className={styles.mainContent}> {/* Optional: thêm class */}
        <Outlet /> {/* Nội dung của các trang con sẽ được render ở đây */}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;