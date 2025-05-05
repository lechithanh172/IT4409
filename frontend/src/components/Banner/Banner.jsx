import React from 'react';
import { Link } from 'react-router-dom';
import { Carousel, Button as AntButton } from 'antd';
import styles from './Banner.module.css';

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
    key: 'slide_Mac_M4',
    imageUrl: 'https://cdn.hoanghamobile.com/i/home/Uploads/2025/04/15/m4-w.png',
    alt: 'Máy tính bảng Apple M4',
    title: 'Sức Mạnh M4 Mới',
    subtitle: 'Hiệu năng đột phá, xử lý đa nhiệm mượt mà trên iPad mới',
    link: '/products?brand=Apple',
    buttonText: 'Tìm Hiểu Thêm'
  },
  {
    key: 'slide_LG',
    imageUrl: 'https://cdn.hoanghamobile.com/i/home/Uploads/2025/04/28/1200x375-manlg-220425.jpg',
    alt: 'Màn hình LG chính hãng',
    title: 'Màn Hình LG Chất Lượng Cao',
    subtitle: 'Trải nghiệm hình ảnh sống động, sắc nét trong từng khung hình',
    link: '/products?brand=LG',
    buttonText: 'Khám Phá Màn Hình'
  },
  {
    "key": "slide_huawei_band_10",
    "imageUrl": "https://cdn.hoanghamobile.com/i/home/Uploads/2025/03/28/kv-huawei-band-10.jpg",
    "alt": "Huawei Band 10",
    "title": "Huawei Band 10 - Định Nghĩa Mới Cho Vòng Đeo Thông Minh",
    "subtitle": "Màn hình AMOLED 1.47\", theo dõi sức khỏe 24/7, pin lên đến 14 ngày.",
    "link": "/products?brand=Huawei",
    "buttonText": "Khám Phá Huawei Band 10"
  },
  {
    "key": "slide_vnsky_sim",
    "imageUrl": "https://cdn.hoanghamobile.com/i/home/Uploads/2025/04/01/vnsky-banner-1200x375.png",
    "alt": "SIM VNSKY",
    "title": "VNSKY SIM - Kết Nối Mọi Nơi, Không Lo Giới Hạn",
    "subtitle": "Gói cước hấp dẫn, tốc độ cao, phủ sóng toàn quốc.",
    "link": "/products",
    "buttonText": "Khám Phá SIM VNSKY"
  },
  {
    "key": "slide_tecno_camon_40",
    "imageUrl": "https://cdn.hoanghamobile.com/i/home/Uploads/2025/04/10/banner-web-tecno-camon-40.jpg",
    "alt": "TECNO Camon 40",
    "title": "TECNO Camon 40 - Chụp Ảnh Đỉnh Cao, Trải Nghiệm Mượt Mà",
    "subtitle": "Màn hình AMOLED 6.78\" 120Hz, camera 50MP, pin 5200mAh, sạc nhanh 45W.",
    "link": "/products?brand=TECNO",
    "buttonText": "Khám Phá Camon 40"
  },
  {
    "key": "slide_realme_c75x",
    "imageUrl": "https://cdn.hoanghamobile.com/i/home/Uploads/2025/03/31/c75x-1200x375.jpg",
    "alt": "Realme C75x",
    "title": "Realme C75x - Bền Bỉ, Hiệu Năng Ấn Tượng",
    "subtitle": "Màn hình 6.67\" 120Hz, pin 5600mAh, sạc nhanh 45W, chuẩn quân đội MIL-STD-810H.",
    "link": "/products?brand=Xiaomi",
    "buttonText": "Khám Phá Realme C75x"
  }
];


const Banner = () => (
  <Carousel autoplay autoplaySpeed={3000} effect="fade" className={styles.bannerCarousel}>
    {bannerSlides.map(slide => (
      <div key={slide.key}>
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