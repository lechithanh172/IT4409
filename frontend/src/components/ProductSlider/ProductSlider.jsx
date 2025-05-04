import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react'; // Import Swiper components
import { Navigation, A11y } from 'swiper/modules'; // Import Navigation module
import ProductCard from '../ProductCard/ProductCard'; // Import ProductCard
import styles from './ProductSlider.module.css';      // CSS Module cho Slider
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'; // Icons

// Import Swiper styles (QUAN TRỌNG)
import 'swiper/css';
import 'swiper/css/navigation';

const ProductSlider = ({ products = [], title }) => {
  // Refs cho các nút điều hướng tùy chỉnh
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  if (!products || products.length === 0) {
    return null; // Không render gì nếu không có sản phẩm
  }

  return (
    <div className={styles.sliderContainer}>
      {/* Tiêu đề của slider (nếu có) */}
      {title && <h3 className={styles.sliderTitle}>{title}</h3>}

      <div className={styles.swiperWrapper}>
        <Swiper
          modules={[Navigation, A11y]} // Kích hoạt các module cần thiết
          spaceBetween={20} // Khoảng cách giữa các slide
          slidesPerView={'auto'} // Hiển thị số lượng slide tự động dựa trên kích thước
          // Responsive breakpoints (điều chỉnh số lượng slide trên các màn hình)
          breakpoints={{
            // >= 480px
            480: { slidesPerView: 2, spaceBetween: 15 },
            // >= 768px
            768: { slidesPerView: 3, spaceBetween: 20 },
            // >= 1024px
            1024: { slidesPerView: 4, spaceBetween: 20 },
             // >= 1200px
             1200: { slidesPerView: 5, spaceBetween: 25 }, // Hiển thị 5 SP trên màn hình lớn
          }}
          navigation={{ // Sử dụng refs cho nút tùy chỉnh
            prevEl: navigationPrevRef.current,
            nextEl: navigationNextRef.current,
          }}
          // Đảm bảo các nút được render và gắn ref trước khi Swiper init
          onBeforeInit={(swiper) => {
             swiper.params.navigation.prevEl = navigationPrevRef.current;
             swiper.params.navigation.nextEl = navigationNextRef.current;
             swiper.navigation.update(); // Cập nhật lại navigation
           }}
          className={styles.mySwiper} // Class tùy chỉnh cho Swiper
          a11y={{ // Cải thiện accessibility
              prevSlideMessage: 'Sản phẩm trước',
              nextSlideMessage: 'Sản phẩm kế tiếp',
          }}
          watchOverflow={true} // Tự động ẩn nút nav nếu không đủ slide
        >
          {products.map((product) => (
            <SwiperSlide key={product.productId} className={styles.swiperSlide}>
              {/* Đặt ProductCard vào trong mỗi Slide */}
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Nút điều hướng tùy chỉnh */}
        <button ref={navigationPrevRef} className={`${styles.navButton} ${styles.prevButton}`} aria-label="Trước">
          <FiChevronLeft />
        </button>
        <button ref={navigationNextRef} className={`${styles.navButton} ${styles.nextButton}`} aria-label="Sau">
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ProductSlider;