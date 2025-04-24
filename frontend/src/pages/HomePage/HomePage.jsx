import { useEffect, useState } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import ProductCard from '../../Components/ProductCard/ProductCard';
import Popular from '../../Components/Popular/Popular';
import List from '../../components/List/List';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import styles from './HomePage.module.css';

// Import hình ảnh (hoặc dùng URL trực tiếp)
// import heroBg from '../../assets/images/hero-background.jpg'; // Ví dụ nếu có ảnh trong assets
// import smartphoneCatImg from '../../assets/images/category-smartphone.jpg';
// import laptopCatImg from '../../assets/images/category-laptop.jpg';

const Category = [
  { "categoryId": 1, "name": "Laptop", "description": "Portable personal computers" },
  { "categoryId": 2, "name": "Tablet", "description": "Touchscreen mobile devices" },
  { "categoryId": 3, "name": "Smartphone", "description": "Mobile phones" },
  { "categoryId": 4, "name": "Accessory", "description": "Computer accessories" },
  { "categoryId": 5, "name": "Monitor", "description": "Display devices" },
  { "categoryId": 6, "name": "Printer", "description": "Printing machines" },
  { "categoryId": 7, "name": "Router", "description": "Network routers" },
  { "categoryId": 8, "name": "Speaker", "description": "Audio output devices" },
  { "categoryId": 9, "name": "Camera", "description": "Photography and video" },
  { "categoryId": 10, "name": "Smartwatch", "description": "Wearable smart devices" }
]

const Brand = [
  { "brand_id": 1, "name": "Apple", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_59.png" },
  { "brand_id": 2, "name": "Samsung", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_60.png" },
  { "brand_id": 3, "name": "Dell", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Dell.png" },
  { "brand_id": 4, "name": "HP", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/HP.png" },
  { "brand_id": 5, "name": "Lenovo", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Lenovo.png" },
  { "brand_id": 6, "name": "Asus", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Asus.png" },
  { "brand_id": 7, "name": "MSI", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/MSI.png" },
  { "brand_id": 8, "name": "Acer", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/acer.png" },
  { "brand_id": 9, "name": "Xiaomi", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_61.png" },
  { "brand_id": 10, "name": "Sony", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/b/r/brand-icon-sony_2.png" }
]

const HomePage = () => {
  const { products, loading, error } = useProducts();
  const [categories, setCategories] = useState(['']);
  const [brands, setBrands] = useState(['']);

  // Lấy một số sản phẩm nổi bật (ví dụ: 4 sản phẩm đầu tiên)
  // console.log("products", products);
  const featuredProducts = products;
  
  useEffect(() => {
    setCategories(Category);
    setBrands(Brand);
  },[])

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
                  <ProductCard key={product.productId} product={product} />
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
            {/* <List className={styles.popularListItem} category="Smartphone"/> */}
          </>
        )}
      </section>

      <section className={`${styles.section} ${styles.categoriesSectionBg}`}>
        <h2 className={styles.sectionTitle}>Khám Phá Thương Hiệu</h2>
        <div className={styles.brandList}>
          {brands.map((brand) => (
            <Link to={`/products?brand=${brand.name}`} key={brand.brand_id} className={styles.categoryCard}>
              <div className={styles.brandImageWrapper}>
                <img src={brand.logoUrl} alt={brand.name} className={styles.brandLogo} />
              </div>
            </Link>
          ))}
        </div>
        <div className={styles.categoryList}>
          {categories.map((category) => (
            <Link to={`/products?category=${category.name}`} key={category.categoryId} className={styles.categoryCard}>
              <div className={styles.categoryImageWrapper}>
                <div className={styles.categoryOverlay}></div>
              </div>
              <h3 className={styles.categoryName}>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;