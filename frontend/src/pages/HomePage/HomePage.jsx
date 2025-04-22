import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import styles from './HomePage.module.css';

// Import hình ảnh (hoặc dùng URL trực tiếp)
// import heroBg from '../../assets/images/hero-background.jpg'; // Ví dụ nếu có ảnh trong assets
// import smartphoneCatImg from '../../assets/images/category-smartphone.jpg';
// import laptopCatImg from '../../assets/images/category-laptop.jpg';

const HomePage = () => {
  const { products, loading, error } = useProducts();

  // Lấy một số sản phẩm nổi bật (ví dụ: 4 sản phẩm đầu tiên)
  const featuredProducts = products.slice(0, 4);

  // URL ảnh mẫu (thay thế bằng ảnh của bạn)
  const heroBgUrl = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80'; // Ví dụ ảnh nền Macbook
  const smartphoneCatImgUrl = 'https://images.unsplash.com/photo-1604671368394-22ae7daced1 S?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'; // Ví dụ ảnh smartphone
  const laptopCatImgUrl = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'; // Ví dụ ảnh laptop

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section
        className={styles.heroSection}
        style={{ backgroundImage: `url(${heroBgUrl})` }} // Set ảnh nền
      >
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
      </section>

      {/* Featured Products Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sản Phẩm Nổi Bật</h2>
        {loading && <Spinner />}
        {error && <p className={styles.error}>Lỗi tải sản phẩm: {error}</p>}
        {!loading && !error && (
          <>
            <div className={styles.productList}>
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p>Chưa có sản phẩm nổi bật.</p>
              )}
            </div>
            {products.length > featuredProducts.length && ( // Chỉ hiện nút nếu còn sản phẩm khác
                 <div className={styles.viewAllContainer}>
                    <Link to="/products">
                        <Button variant="secondary">Xem Tất Cả Sản Phẩm</Button>
                    </Link>
                 </div>
            )}
          </>
        )}
      </section>

      {/* Categories Section */}
      <section className={`${styles.section} ${styles.categoriesSectionBg}`}>
        <h2 className={styles.sectionTitle}>Khám Phá Danh Mục</h2>
        <div className={styles.categoryList}>
          {/* Category Card: Smartphone */}
          <Link to="/products?category=Smartphone" className={styles.categoryCard}>
             <div className={styles.categoryImageWrapper}>
                <img src={smartphoneCatImgUrl} alt="Smartphones" className={styles.categoryImage} />
                <div className={styles.categoryOverlay}></div>
             </div>
            <h3 className={styles.categoryName}>Smartphones</h3>
          </Link>

          {/* Category Card: Laptop */}
          <Link to="/products?category=Laptop" className={styles.categoryCard}>
            <div className={styles.categoryImageWrapper}>
                <img src={laptopCatImgUrl} alt="Laptops" className={styles.categoryImage} />
                 <div className={styles.categoryOverlay}></div>
             </div>
            <h3 className={styles.categoryName}>Laptops</h3>
          </Link>

           {/* Thêm danh mục khác nếu cần */}
           {/*
           <Link to="/products?category=Accessories" className={styles.categoryCard}>
             <img src="/path/to/accessories.jpg" alt="Accessories" className={styles.categoryImage} />
             <h3 className={styles.categoryName}>Phụ Kiện</h3>
           </Link>
           */}
        </div>
      </section>

       {/* Có thể thêm các section khác: Ưu đãi, Tin tức,... */}

    </div>
  );
};

export default HomePage;