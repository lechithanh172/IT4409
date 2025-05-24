import React, { useRef, useEffect, useState } from 'react'; // Import useState nếu cần dùng state cho debug
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y, Autoplay } from 'swiper/modules';
import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductSlider.module.css';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import 'swiper/css';
import 'swiper/css/navigation';

const ProductSlider = ({ products = [], title }) => {
  // Refs cho các nút điều hướng tùy chỉnh
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  // Ref để lưu trữ Swiper instance
  const swiperInstanceRef = useRef(null);

  // useEffect để cấu hình navigation sau khi component mount và refs được gán
  useEffect(() => {
    console.log("[ProductSlider] useEffect for navigation setup running.");

    // Kiểm tra xem Swiper instance và các nút điều hướng đã có trong DOM chưa
    // Refs chỉ có giá trị .current là DOM element sau khi component mount
    if (swiperInstanceRef.current && navigationPrevRef.current && navigationNextRef.current) {
      console.log("[ProductSlider] Swiper instance and navigation refs are ready. Wiring custom navigation.");

      // Gán các phần tử DOM (từ refs) vào tham số navigation của Swiper
      // Điều này cho Swiper biết các nút nào sẽ được sử dụng
      swiperInstanceRef.current.params.navigation.prevEl = navigationPrevRef.current;
      swiperInstanceRef.current.params.navigation.nextEl = navigationNextRef.current;

      // Khởi tạo lại và cập nhật module Navigation của Swiper
      // Điều này buộc Swiper gắn các sự kiện click vào các nút mới được gán
      swiperInstanceRef.current.navigation.init();
      swiperInstanceRef.current.navigation.update();

      console.log("[ProductSlider] Custom navigation wiring complete.");
    } else {
       console.log("[ProductSlider] Swiper instance or navigation elements not yet available for wiring.");
       // Đây là hành vi bình thường trong lần render đầu tiên trước khi refs được gán
    }

    // Dependency array trống: Effect này chỉ chạy MỘT LẦN sau render đầu tiên.
    // Tại thời điểm này, các refs đã được gán giá trị DOM element.
    // Việc kiểm tra swiperInstanceRef.current bên trong đảm bảo Swiper cũng đã sẵn sàng.
    // return () => {
        // Optional: Cleanup function if needed when component unmounts
        // if (swiperInstanceRef.current) {
        //     swiperInstanceRef.current.navigation.destroy(); // Clean up listeners
        //     swiperInstanceRef.current.params.navigation.prevEl = null; // Reset params
        //     swiperInstanceRef.current.params.navigation.nextEl = null;
        // }
    // };
  }, []); // Dependency array rỗng, effect chạy sau render đầu tiên

  // Conditional return NẰM SAU các lời gọi Hooks ở top level
  if (!products || products.length === 0) {
    console.log("[ProductSlider] No products, returning null.");
    return null; // Early return nếu không có sản phẩm
  }

  // Render logic chỉ chạy khi có sản phẩm
  return (
    <div className={styles.sliderContainer}>
      {title && <h3 className={styles.sliderTitle}>{title}</h3>}

      <div className={styles.swiperWrapper}>
        <Swiper
          modules={[Navigation, Autoplay]} // Đảm bảo Navigation, Autoplay, A11y được sử dụng
          spaceBetween={20} // Khoảng cách mặc định
          slidesPerView={'auto'} // Số lượng slide mặc định

          // Responsive breakpoints
          breakpoints={{
             0: { slidesPerView: 1.2, spaceBetween: 15 },
            480: { slidesPerView: 2.2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 25 },
            1024: { slidesPerView: 4, spaceBetween: 30 },
            1200: { slidesPerView: 5, spaceBetween: 35 },
            1400: { slidesPerView: 5, spaceBetween: 40 },
          }}

          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}

          // --- Cấu hình Navigation prop ---
          // Truyền vào một object RỖNG. Swiper sẽ tìm kiếm các phần tử
          // navigationPrevEl/nextEl TRONG PARAMS SAU khi chúng được gán trong useEffect.
          // Việc truyền object rỗng ở đây chỉ để báo cho Swiper biết rằng module Navigation
          // đang được sử dụng và cần chuẩn bị cấu hình.
          // Chúng ta KHÔNG truyền ref.current trực tiếp vào đây lúc này.
          navigation={{}}


          // Lưu trữ Swiper instance vào ref sau khi nó được khởi tạo
          onSwiper={(swiper) => {
             swiperInstanceRef.current = swiper;
             console.log("[ProductSlider] Swiper instance created and stored in ref via onSwiper.");
             // Logic gán refs và init/update Swiper.navigation đã được chuyển sang useEffect
             // để đảm bảo refs của nút đã được gán DOM element.
           }}

          className={styles.mySwiper}
          watchOverflow={true} // Quan sát khi không đủ slide để ẩn/hiện navigation/pagination
          loop={true} // Lặp vô hạn

        >
          {products.map((product) => (
            // Đảm bảo ProductCard có key duy nhất
            <SwiperSlide key={product.productId || product.id} className={styles.swiperSlide}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Nút điều hướng tùy chỉnh */}
        {/* Refs được gán vào các nút này */}
        {/* Các nút này cần nằm trong .swiperWrapper và .swiperWrapper có position: relative */}
       <button ref={navigationPrevRef} className={`${styles.navButton} ${styles.prevButton}`} aria-label="Trước"><FiChevronLeft></FiChevronLeft></button>
        <button ref={navigationNextRef} className={`${styles.navButton} ${styles.nextButton}`} aria-label="Sau"><FiChevronRight></FiChevronRight></button>
      </div>
    </div>
  );
};

export default ProductSlider;