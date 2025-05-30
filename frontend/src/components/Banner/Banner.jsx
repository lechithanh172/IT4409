import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { Carousel } from 'antd';
import styles from './Banner.module.css';
const heroBgUrl = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80';
const laptopCatImgUrl = 'https://cdn.hoanghamobile.com/i/home/Uploads/2025/04/04/xiaomi-14-5g-mo-ban-web_638793576531280349.jpg';
const smartphoneCatImgUrl = 'https://cdn.hoanghamobile.com/i/home/Uploads/2025/04/22/a56-a36-1200x375-2.jpg';

const Banner = () => (
  <Carousel autoplay={{ dotDuration: true }} autoplaySpeed={2000} >
    <div className={styles.bannerItem}>
      <img src={heroBgUrl} alt="Banner 1" className={styles.bannerImage} />
      <div className={styles.heroOverlay}></div> {/* Lớp phủ mờ */}
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>Khám Phá Thế Giới Công Nghệ</h1>
        <p className={styles.heroSubtitle}>
          Tìm kiếm Smartphone & Laptop mới nhất với giá tốt nhất.
        </p>
        <Link to="/products">
          <Button variant="primary" className={styles.heroCtaButton}>
            Mua Sắm Ngay
          </Button>
        </Link>
      </div>
    </div>
    <div className={styles.bannerItem}>
      <img src={smartphoneCatImgUrl} alt="Banner 1" className={styles.bannerImage} />
      <div className={styles.heroOverlay}></div> {/* Lớp phủ mờ */}
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>Khám Phá Thế Giới Công Nghệ</h1>
        <p className={styles.heroSubtitle}>
          Tìm kiếm Smartphone & Laptop mới nhất với giá tốt nhất.
        </p>
        <Link to="/products">
          <Button variant="primary" className={styles.heroCtaButton}>
            Mua Sắm Ngay
          </Button>
        </Link>
      </div>
    </div>
    <div className={styles.bannerItem}>
      <img src={laptopCatImgUrl} alt="Banner 1" className={styles.bannerImage} />
      <div className={styles.heroOverlay}></div> {/* Lớp phủ mờ */}
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>Khám Phá Thế Giới Công Nghệ</h1>
        <p className={styles.heroSubtitle}>
          Tìm kiếm Smartphone & Laptop mới nhất với giá tốt nhất.
        </p>
        <Link to="/products">
          <Button variant="primary" className={styles.heroCtaButton}>
            Mua Sắm Ngay
          </Button>
        </Link>
      </div>
    </div>
  </Carousel>
);
export default Banner;