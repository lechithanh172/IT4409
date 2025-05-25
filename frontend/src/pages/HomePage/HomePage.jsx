import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import ProductSlider from '../../components/ProductSlider/ProductSlider';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import styles from './HomePage.module.css';
import apiService from '../../services/api';
import { FiChevronRight } from 'react-icons/fi';


const heroSlides = [
  {
    id: 1,
    title: 'Khám Phá Thế Giới Công Nghệ',
    subtitle: 'Sản phẩm chính hãng, giá tốt hàng đầu.',
    ctaText: 'Mua Sắm Ngay',
    ctaLink: '/products',

    bgUrl: '/images/bg1.jpg',
  },
  {
    id: 2,
    title: 'Ưu Đãi Hấp Dẫn Mỗi Ngày',
    subtitle: 'Đừng bỏ lỡ cơ hội sở hữu sản phẩm yêu thích với giá tốt.',
    ctaText: 'Xem Ưu Đãi',
    ctaLink: '/promotions',

    bgUrl: '/images/bg2.jpg',
  },
  {
    id: 3,
    title: 'Bộ Sưu Tập Mới Nhất',
    subtitle: 'Cập nhật xu hướng công nghệ mới nhất.',
    ctaText: 'Khám Phá Ngay',
    ctaLink: '/latest',

    bgUrl: '/images/bg3.jpg',

  },
];


const HomePage = () => {

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);


  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [isBrandLoading, setIsBrandLoading] = useState(true);


  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Trang chủ | HustShop";
  }, []);


  const heroSliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    cssEase: 'linear',
    arrows: false,
  };



  useEffect(() => {
    const loadHomePageData = async () => {
      setIsProductsLoading(true);
      setIsCategoryLoading(true);
      setIsBrandLoading(true);
      setError(null);

      try {
        console.log("Starting to fetch all homepage data...");
        const [productsRes, categoryRes, brandRes] = await Promise.allSettled([
          apiService.getAllProducts(),
          apiService.getAllCategories(),
          apiService.getAllBrands()
        ]);

        let fetchedProducts = [];
        if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value?.data)) {
          fetchedProducts = productsRes.value.data;
          console.log("All products data fetched:", fetchedProducts);

        } else {
          console.error("Lỗi fetch All Products:", productsRes.reason || productsRes.value);

        }
        setIsProductsLoading(false);

        let fetchedCategories = [];
        if (categoryRes.status === 'fulfilled' && Array.isArray(categoryRes.value?.data)) {
          fetchedCategories = categoryRes.value.data;
          console.log("Categories data fetched:", fetchedCategories);
          setCategories(fetchedCategories);
        } else {
          console.error("Lỗi fetch Categories:", categoryRes.reason || categoryRes.value);
          setCategories([]);
        }
        setIsCategoryLoading(false);

        if (brandRes.status === 'fulfilled' && Array.isArray(brandRes.value?.data)) {
            console.log("Brands data fetched:", brandRes.value.data);
            setBrands(brandRes.value.data);
          } else {
            console.error("Lỗi fetch Brands:", brandRes.reason || brandRes.value);
            setBrands([]);
          }
         setIsBrandLoading(false);




        const categoryMap = fetchedCategories.reduce((map, category) => {

          if (category.categoryId) {
              map[category.categoryId] = category.name;
          } else if (category.id) {
              map[category.id] = category.name;
          }
          return map;
        }, {});


        const productsWithCategoryNames = fetchedProducts.map(product => {

          const categoryName = product.categoryId
            ? categoryMap[product.categoryId]
            : 'Chưa phân loại';

          return {
            ...product,
            categoryName: categoryName
          };
        });

        setProducts(productsWithCategoryNames);



        const errors = [];
        if (productsRes.status === 'rejected') errors.push(`Sản phẩm: ${productsRes.reason?.message || 'Lỗi không xác định'}`);
        if (categoryRes.status === 'rejected') errors.push(`Danh mục: ${categoryRes.reason?.message || 'Lỗi không xác định'}`);
        if (brandRes.status === 'rejected') errors.push(`Thương hiệu: ${brandRes.reason?.message || 'Lỗi không xác định'}`);

        if (errors.length > 0) {
            const combinedError = `Lỗi tải dữ liệu: ${errors.join('; ')}`;
            setError(combinedError);
            console.error(combinedError);
        }

      } catch (err) {
        console.error("Lỗi hệ thống khi tải dữ liệu HomePage:", err);
        setError("Đã xảy ra lỗi hệ thống. Vui lòng tải lại trang.");
        setIsProductsLoading(false);
        setIsCategoryLoading(false);
        setIsBrandLoading(false);

        setProducts([]);
        setCategories([]);
        setBrands([]);
      }
    };

    loadHomePageData();
  }, []);



  const productsForSlider = products.slice(0, 15);


  return (
    <div className={styles.homePage}>

      {/* --- Hero Section (Slider) --- */}
      <section className={styles.heroSliderSection}>
        <Slider {...heroSliderSettings}>
          {heroSlides.map(slide => (
            <div key={slide.id} className={styles.heroSlide}>
              <div
                className={styles.heroSlideBackground}
                style={{ backgroundImage: `url(${slide.bgUrl})` }}
              ></div>
              <div className={styles.heroSlideOverlay}></div>
              <div className={styles.heroSlideContent}>
                <h2 className={styles.heroSlideTitle}>{slide.title}</h2>
                <p className={styles.heroSlideSubtitle}>{slide.subtitle}</p>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Hiển thị lỗi chung nếu có */}
      {error && <p className={`${styles.error} ${styles.pageError}`}>{error}</p>}


      {/* --- Section Sản phẩm mới về --- */}
      <section className={styles.section}>
         <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Sản Phẩm Mới Về</h2>
             <Link to={`/products`} className={styles.viewAllLink}>Xem tất cả <FiChevronRight/></Link>
         </div>
        {isProductsLoading ? (
             <div className={styles.loadingContainer}><Spinner /></div>
        ) : productsForSlider.length > 0 ? (

             <ProductSlider products={productsForSlider} />
        ) : (
            !error && <p className={styles.noProducts}>Hiện chưa có sản phẩm nào.</p>
        )}
      </section>

       {/* --- Section Thương Hiệu --- */}
       <section className={`${styles.section} ${styles.brandsSectionBg}`}>
          <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Thương Hiệu Hàng Đầu</h2>
          </div>
          {isBrandLoading ? (
             <div className={styles.loadingContainer}><Spinner /></div>
          ) : brands.length > 0 ? (
                <div className={styles.brandList}>
                {brands.map((brand) => (
                    <Link to={`/products?brand=${encodeURIComponent(brand.brandName)}`} key={brand.brandId} className={styles.brandCard} title={brand.name}>
                    <div className={styles.brandImageWrapper}>
                        <img src={brand.logoUrl} alt={`${brand.name} logo`} className={styles.brandLogo} onError={(e)=>{e.target.style.opacity='0.5'; e.target.style.filter='grayscale(1)'}}/>
                    </div>
                    </Link>
                ))}
                </div>
            ) : (
                 !error && <p className={styles.noProducts}>Không tìm thấy thông tin thương hiệu.</p>
            )}
       </section>

      {/* --- Section Danh Mục (Không hiển thị link "Xem thêm" vì không có trang danh mục riêng) --- */}
      <section className={`${styles.section} ${styles.categoriesSectionBg}`}>
        <div className={styles.sectionHeader}>
             <h2 className={styles.sectionTitle}>Khám Phá Danh Mục</h2>
             {/* <Link to={`/categories`} className={styles.viewAllLink}>Xem tất cả <FiChevronRight/></Link> */} {/* Bỏ link xem thêm */}
        </div>
         {isCategoryLoading ? (
             <div className={styles.loadingContainer}><Spinner /></div>
         ) : categories.length > 0 ? (
            <div className={styles.categoryList}>
            {categories.map((category) => (

                <Link to={`/products?category=${encodeURIComponent(category.categoryName)}`} key={category.categoryId} className={styles.categoryCard}>
                <div className={styles.categoryImageWrapper}>
                    {/* Sử dụng imageUrl từ category nếu có, fallback về placeholder */}
                    <img src={category.imageUrl || '/images/placeholder-category.png'} alt={`${category.name} category image`} className={styles.categoryImage} onError={(e)=>{e.target.src='/images/placeholder-category.png'}}/>
                    <div className={styles.categoryOverlay}></div>
                </div>
                {/* Hiển thị tên danh mục */}
                <h3 className={styles.categoryName}>{category.categoryName}</h3>
                </Link>
            ))}
            </div>
         ) : (
             !error && <p className={styles.noProducts}>Không tìm thấy danh mục nào.</p>
         )}
      </section>

    </div>
  );
};

export default HomePage;