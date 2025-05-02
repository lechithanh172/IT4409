import { useEffect, useState } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import ListItem from '../../components/ListItem/ListItem';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import styles from './HomePage.module.css';
import apiService from '../../services/api';
import Banner from '../../components/Banner/Banner';

const FEATURED_PRODUCT_LIMIT = 8;

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const [categoryResponse, brandResponse, productResponse] = await Promise.all([
          apiService.getAllCategories(),
          apiService.getAllBrands(),
          apiService.getAllProducts()
        ]);

        setCategories(categoryResponse?.data && Array.isArray(categoryResponse.data) ? categoryResponse.data : []);
        setBrands(brandResponse?.data && Array.isArray(brandResponse.data) ? brandResponse.data : []);
        setFeaturedProducts(productResponse?.data && Array.isArray(productResponse.data) ? productResponse.data : []);

      } catch (error) {
        console.error("Có lỗi xảy ra khi gọi API:", error);
        setFetchError("Không thể tải dữ liệu trang chủ. Vui lòng thử lại.");
        setCategories([]);
        setBrands([]);
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayedFeaturedProducts = featuredProducts.slice(0, FEATURED_PRODUCT_LIMIT);

  return (
    <div className={styles.homePage}>
      <section className={styles.bannerSection}>
        <div className={styles.bannerContent}>
          <Banner />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sản Phẩm Nổi Bật</h2>
        {isLoading && <Spinner />}
        {fetchError && !isLoading && <p className={styles.error}>{fetchError}</p>}
        {!isLoading && !fetchError && (
          <>
            <div className={styles.productList}>
              {displayedFeaturedProducts.length > 0 ? (
                displayedFeaturedProducts.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))
              ) : (
                <p>Chưa có sản phẩm nổi bật.</p>
              )}
            </div>
            {featuredProducts.length > displayedFeaturedProducts.length && (
                 <div className={styles.viewAllContainer}>
                    <Link to="/products">
                        <Button variant="secondary">Xem Tất Cả Sản Phẩm</Button>
                    </Link>
                 </div>
            )}
            {featuredProducts.length > 0 && (
              <>
                <ListItem className={styles.popularListItem} category="Smartphone"/>
                <ListItem className={styles.popularListItem} category="Laptop"/>
              </>
            )}
          </>
        )}
      </section>

      {!isLoading && !fetchError && (
          <section className={`${styles.section} ${styles.categoriesSectionBg}`}>

          {brands.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>Khám Phá Thương Hiệu</h2>
              <div className={styles.brandList}>
                {brands.map((brand) => (
                  <Link to={`/products?brand=${encodeURIComponent(brand.brandName)}`} key={brand.brandId || brand.brandName} className={styles.brandCard}>
                    <div className={styles.brandImageWrapper}>
                      <img src={brand.logoUrl || '/placeholder-logo.png'} alt={brand.brandName} className={styles.brandLogo} />
                      <div className={styles.brandOverlay}></div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
           )}

           {categories.length > 0 && (
             <>
              <h2 className={styles.sectionTitle}>Khám Phá Danh Mục</h2>
              <div className={styles.categoryList}>
                {categories.map((category) => (
                  <Link to={`/products?category=${encodeURIComponent(category.categoryName)}`} key={category.categoryId || category.categoryName} className={styles.categoryCard}>
                    <div className={styles.categoryImageWrapper}>
                      <img src={category.imageUrl || '/placeholder-category.png'} alt={category.categoryName} className={styles.categoryLogo} />
                      <div className={styles.categoryOverlay}></div>
                    </div>
                    <h3 className={styles.categoryName}>{category.categoryName}</h3>
                  </Link>
                ))}
              </div>
             </>
            )}

          </section>
      )}
    </div>
  );
};

export default HomePage;