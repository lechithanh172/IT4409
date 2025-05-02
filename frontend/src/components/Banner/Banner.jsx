import React from 'react';
import { Link } from 'react-router-dom';
import { Carousel, Button as AntButton } from 'antd'; // Import Ant Button
import styles from './Banner.module.css'; // Use your specific CSS module

// Define Banner Slides Data
const bannerSlides = [
  {
    key: 'slide1',
    imageUrl: 'https://cdn.hoanghamobile.com/i/home/Uploads/2025/04/02/iphone-16-series-w.png',
    alt: 'Hình ảnh iPhone 16 Series',
    title: 'Khám Phá iPhone 16 Series',
    subtitle: 'Sức mạnh Apple A18 Bionic vượt trội, thiết kế đẳng cấp mới',
    link: '/products?brand=Apple',
    buttonText: 'Xem Ngay'
  },
  {
    key: 'slide2',
    imageUrl: 'https://cdn.hoanghamobile.com/i/home/Uploads/2025/04/15/m4-w.png',
    alt: 'Máy tính bảng Apple M4',
    title: 'Sức Mạnh M4 Mới',
    subtitle: 'Hiệu năng đột phá, xử lý đa nhiệm mượt mà trên iPad mới',
    link: '/products?category=Tablet',
    buttonText: 'Tìm Hiểu Thêm'
  },
  {
    key: 'slide3',
    imageUrl: 'https://cdn.hoanghamobile.com/i/home/Uploads/2025/04/28/1200x375-manlg-220425.jpg',
    alt: 'Màn hình LG chính hãng',
    title: 'Màn Hình LG Chất Lượng Cao',
    subtitle: 'Trải nghiệm hình ảnh sống động, sắc nét trong từng khung hình',
    link: '/products?brand=LG',
    buttonText: 'Khám Phá Màn Hình'
  }
];


const Banner = () => (
  <Carousel autoplay autoplaySpeed={3000} effect="fade" className={styles.bannerCarousel}>
    {bannerSlides.map(slide => (
      <div key={slide.key}> {/* Outer div for Carousel */}
        <div
          className={styles.bannerItem}
          style={{ backgroundImage: `url(${slide.imageUrl})` }}
          aria-label={slide.alt}
        >
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{slide.title}</h1>
            <p className={styles.heroSubtitle}>{slide.subtitle}</p>
            <Link to={slide.link}>
              <AntButton type="primary" size="large" ghost className={styles.heroCtaButton}>
                {slide.buttonText}
              </AntButton>
            </Link>
          </div>
        </div>
      </div>
    ))}
  </Carousel>
);
export default Banner;