
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import styles from './MainLayout.module.css';
const MainLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className={`${styles.layoutContainer} ${isHomePage ? styles.homepageActive : ''}`}>
      <Header />
      <main className={styles.mainContent}>
        <Outlet /> 
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;