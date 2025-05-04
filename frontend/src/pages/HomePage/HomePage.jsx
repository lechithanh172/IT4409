import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductSlider from '../../components/ProductSlider/ProductSlider'; // Component Slider ngang
import Button from '../../components/Button/Button';                     // Component Nút bấm
import Spinner from '../../components/Spinner/Spinner';                 // Component Loading
import styles from './HomePage.module.css';                             // CSS Module cho trang Home
import apiService from '../../services/api';                     // Service gọi API
import { FiChevronRight } from 'react-icons/fi';                      // Icon cho link "Xem thêm"

// Hàm fetch sản phẩm theo danh sách ID
const fetchProductsByIds = async (productIds = []) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return []; // Trả về mảng rỗng nếu không có ID nào
  }
  try {
    console.log(`Fetching products for IDs: ${productIds.join(', ')}`);
    // Gọi API song song cho từng ID sản phẩm
    const productPromises = productIds.map(id => apiService.getProductById(id));
    const results = await Promise.allSettled(productPromises);

    // Lọc ra những sản phẩm fetch thành công và có dữ liệu
    const fetchedProducts = results
      .filter(result => result.status === 'fulfilled' && result.value?.data)
      .map(result => result.value.data);

    console.log("Fetched products by IDs:", fetchedProducts);
    return fetchedProducts;

  } catch (error) {
    console.error(`Lỗi khi fetch sản phẩm theo IDs:`, error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
};


const HomePage = () => {
  // State cho dữ liệu từ API
  const [initialProducts, setInitialProducts] = useState([]); // State cho các sản phẩm ban đầu (ID 1-15)
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // State quản lý loading
  const [isInitialProductLoading, setIsInitialProductLoading] = useState(true); // Loading cho sản phẩm ban đầu
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [isBrandLoading, setIsBrandLoading] = useState(true);

  // State quản lý lỗi
  const [error, setError] = useState(null);

  // useEffect để fetch tất cả dữ liệu cần thiết
  useEffect(() => {
    const loadHomePageData = async () => {
      setIsInitialProductLoading(true);
      setIsCategoryLoading(true);
      setIsBrandLoading(true);
      setError(null);

      // Tạo mảng ID từ 1 đến 15
      const initialProductIds = Array.from({ length: 15 }, (_, i) => i + 1);

      try {
        console.log("Starting to fetch homepage data (initial products by ID)...");
        // Gọi API song song
        const [initialProductRes, categoryRes, brandRes] = await Promise.allSettled([
          fetchProductsByIds(initialProductIds), // Fetch sản phẩm theo ID
          apiService.getAllCategories(),
          apiService.getAllBrands()
        ]);

        // Xử lý kết quả sản phẩm ban đầu
        if (initialProductRes.status === 'fulfilled') {
          console.log("Initial products (1-15) fetched:", initialProductRes.value);
          setInitialProducts(initialProductRes.value);
        } else {
          console.error("Lỗi fetch Initial Products:", initialProductRes.reason);
        }
        setIsInitialProductLoading(false);

        // Xử lý kết quả Categories
        if (categoryRes.status === 'fulfilled' && Array.isArray(categoryRes.value?.data)) {
          console.log("Categories data fetched:", categoryRes.value.data);
          setCategories(categoryRes.value.data);
        } else {
          console.error("Lỗi fetch Categories:", categoryRes.reason || categoryRes.value);
          setCategories([]);
        }
        setIsCategoryLoading(false);

         // Xử lý kết quả Brands
         if (brandRes.status === 'fulfilled' && Array.isArray(brandRes.value?.data)) {
            console.log("Brands data fetched:", brandRes.value.data);
            setBrands(brandRes.value.data);
          } else {
            console.error("Lỗi fetch Brands:", brandRes.reason || brandRes.value);
            setBrands([]);
          }
         setIsBrandLoading(false);

        // Gộp lỗi nếu có
        const errors = [initialProductRes, categoryRes, brandRes]
                            .filter(r => r.status === 'rejected')
                            .map(r => r.reason?.message || 'Lỗi không xác định');
        if (errors.length > 0) {
            const combinedError = `Lỗi tải dữ liệu: ${errors.join('; ')}`;
            setError(combinedError);
            console.error(combinedError);
        }

      } catch (err) {
        console.error("Lỗi hệ thống khi tải dữ liệu HomePage:", err);
        setError("Đã xảy ra lỗi hệ thống. Vui lòng tải lại trang.");
        // Đặt tất cả loading thành false nếu có lỗi chung
        setIsInitialProductLoading(false);
        setIsCategoryLoading(false);
        setIsBrandLoading(false);
      }
    };

    loadHomePageData();
  }, []); // Chỉ chạy 1 lần

  // URL ảnh nền Hero Section
  const heroBgUrl = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80';

  return (
    <div className={styles.homePage}>
      {/* --- Hero Section --- */}
      <section
        className={styles.heroSection}
        style={{ backgroundImage: `url(${heroBgUrl})` }}
      >
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Khám Phá Thế Giới Công Nghệ</h1>
          <p className={styles.heroSubtitle}>
            Sản phẩm chính hãng, giá tốt hàng đầu.
          </p>
          <Link to="/products">
            <Button variant="primary" className={styles.heroCtaButton}>
              Mua Sắm Ngay
            </Button>
          </Link>
        </div>
      </section>

      {error && <p className={`${styles.error} ${styles.pageError}`}>{error}</p>}

      {/* --- Section Sản phẩm mới về (ID 1-15) --- */}
      <section className={styles.section}>
         <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Sản Phẩm Mới Về</h2>
             {/* Link tới trang tất cả sản phẩm */}
             <Link to={`/products`} className={styles.viewAllLink}>Xem tất cả <FiChevronRight/></Link>
         </div>
        {isInitialProductLoading ? (
             <div className={styles.loadingContainer}><Spinner /></div>
        ) : initialProducts.length > 0 ? (
            <ProductSlider products={initialProducts} />
        ) : (
            !error && <p className={styles.noProducts}>Hiện chưa có sản phẩm mới nào.</p>
        )}
      </section>

       {/* --- Section Thương Hiệu --- */}
       <section className={`${styles.section} ${styles.brandsSectionBg}`}>
          <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Thương Hiệu Hàng Đầu</h2>
               <Link to={`/brands`} className={styles.viewAllLink}>Xem tất cả <FiChevronRight/></Link>
          </div>
          {isBrandLoading ? (
             <div className={styles.loadingContainer}><Spinner /></div>
          ) : brands.length > 0 ? (
                <div className={styles.brandList}>
                {brands.map((brand) => (
                    <Link to={`/products?brand=${encodeURIComponent(brand.name)}`} key={brand.brandId} className={styles.brandCard} title={brand.name}>
                    <div className={styles.brandImageWrapper}>
                        <img src={brand.logoUrl} alt={brand.name} className={styles.brandLogo} onError={(e)=>{e.target.style.opacity='0.5'; e.target.style.filter='grayscale(1)'}}/>
                    </div>
                    </Link>
                ))}
                </div>
            ) : (
                 !error && <p className={styles.noProducts}>Không tìm thấy thông tin thương hiệu.</p>
            )}
       </section>

       {/* --- Section Danh Mục --- */}
      <section className={`${styles.section} ${styles.categoriesSectionBg}`}>
        <div className={styles.sectionHeader}>
             <h2 className={styles.sectionTitle}>Khám Phá Danh Mục</h2>
              <Link to={`/categories`} className={styles.viewAllLink}>Xem tất cả <FiChevronRight/></Link>
        </div>
         {isCategoryLoading ? (
             <div className={styles.loadingContainer}><Spinner /></div>
         ) : categories.length > 0 ? (
            <div className={styles.categoryList}>
            {categories.map((category) => (
                <Link to={`/products?category=${encodeURIComponent(category.name)}`} key={category.categoryId} className={styles.categoryCard}>
                <div className={styles.categoryImageWrapper}>
                    <img src={category.image} alt={category.name} className={styles.categoryImage} onError={(e)=>{e.target.src='/images/placeholder-category.png'}}/>
                    <div className={styles.categoryOverlay}></div>
                </div>
                <h3 className={styles.categoryName}>{category.name}</h3>
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