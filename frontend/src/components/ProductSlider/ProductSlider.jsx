import React, { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y, Autoplay } from 'swiper/modules';
import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductSlider.module.css';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import 'swiper/css';
import 'swiper/css/navigation';

const ProductSlider = ({ products = [], title }) => {

  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);


  const swiperInstanceRef = useRef(null);


  useEffect(() => {
    console.log("[ProductSlider] useEffect for navigation setup running.");



    if (swiperInstanceRef.current && navigationPrevRef.current && navigationNextRef.current) {
      console.log("[ProductSlider] Swiper instance and navigation refs are ready. Wiring custom navigation.");



      swiperInstanceRef.current.params.navigation.prevEl = navigationPrevRef.current;
      swiperInstanceRef.current.params.navigation.nextEl = navigationNextRef.current;



      swiperInstanceRef.current.navigation.init();
      swiperInstanceRef.current.navigation.update();

      console.log("[ProductSlider] Custom navigation wiring complete.");
    } else {
       console.log("[ProductSlider] Swiper instance or navigation elements not yet available for wiring.");

    }












  }, []);


  if (!products || products.length === 0) {
    console.log("[ProductSlider] No products, returning null.");
    return null;
  }


  return (
    <div className={styles.sliderContainer}>
      {title && <h3 className={styles.sliderTitle}>{title}</h3>}

      <div className={styles.swiperWrapper}>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={'auto'}


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







          navigation={{}}



          onSwiper={(swiper) => {
             swiperInstanceRef.current = swiper;
             console.log("[ProductSlider] Swiper instance created and stored in ref via onSwiper.");


           }}

          className={styles.mySwiper}
          watchOverflow={true}
          loop={true}

        >
          {products.map((product) => (

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