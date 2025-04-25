import { useEffect, useState } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import ProductCard from '../../Components/ProductCard/ProductCard';
// import Popular from '../../Components/Popular/Popular';
import ListItem from '../../components/ListItem/ListItem';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import styles from './HomePage.module.css';
import apiService from '../../services/api';
import Banner from '../../components/Banner/Banner';

// Import hình ảnh (hoặc dùng URL trực tiếp)
// import heroBg from '../../assets/images/hero-background.jpg'; // Ví dụ nếu có ảnh trong assets
// import smartphoneCatImg from '../../assets/images/category-smartphone.jpg';
// import laptopCatImg from '../../assets/images/category-laptop.jpg';

const allCategory = [
  { "categoryId": 1, "name": "Laptop", "description": "Portable personal computers", "image": "https://hanoicomputercdn.com/media/product/89677_laptop_lenovo_ideapad_slim_5_14irh10_83k0000avn_i5_13420h_24gb_ram_512gb_ssd_14_wuxga_win11_xam_0005_layer_2.jpg" },
  { "categoryId": 2, "name": "Tablet", "description": "Touchscreen mobile devices", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtSLFI5VEetrtdyPEDnn55_2OTomtzGFwzSQ&s" },
  { "categoryId": 3, "name": "Smartphone", "description": "Mobile phones", "image": "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-256gb.png" },
  { "categoryId": 4, "name": "Accessory", "description": "Computer accessories", "image": "https://i5.walmartimages.com/seo/Wireless-Charger-Magnetic-Fast-Charging-Stand-Compatible-iPhone-16-15-14-13-12-11-Pro-Max-Plus-XS-XR-X-8-Apple-Watch-9-8-7-6-5-4-3-2-SE-AirPods-3-2-P_66f5dc9c-ca3c-4097-8e8b-39ccfa66b6a0.b5cb13def4077c44bc9e6ffa883a35ee.jpeg?odnHeight=320&odnWidth=320&odnBg=FFFFFF" },
  { "categoryId": 5, "name": "Monitor", "description": "Display devices", "image": "https://www.lg.com/content/dam/channel/wcms/vn/images/man-hinh-may-tinh/24mr400-b_atvq_eavh_vn_c/gallery/small03.jpg" },
  { "categoryId": 6, "name": "Printer", "description": "Printing machines", "image": "https://cdn2.cellphones.com.vn/x/media/catalog/product/t/_/t_i_xu_ng_52__1_4.png" },
  { "categoryId": 7, "name": "Router", "description": "Network routers", "image": "https://owlgaming.vn/wp-content/uploads/2024/06/Thiet-bi-phat-Wifi-6-Router-ASUS-TUF-Gaming-AX6000-1.jpg" },
  { "categoryId": 8, "name": "Speaker", "description": "Audio output devices", "image": "https://product.hstatic.net/1000187560/product/loa-bluetooth-havit-sk832bt_2__459d04d6a66e4ff38bfa4f528e3cb2d5_large.png" },
  { "categoryId": 9, "name": "Camera", "description": "Photography and video", "image": "https://www.bachkhoashop.com/wp-content/uploads/2022/12/gth788_1_.webp" },
  { "categoryId": 10, "name": "Smartwatch", "description": "Wearable smart devices", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx-zhXJ2eJ5OxH7xxs0MnPpu5eNikP79VGbYQG_AEqHw57ezRC8BNLqqokP4n0KhtWCPo&usqp=CAU" }
]

const allBrand = [
  { "brandId": 1, "name": "Apple", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_59.png" },
  { "brandId": 2, "name": "Samsung", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_60.png" },
  { "brandId": 3, "name": "Dell", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Dell.png" },
  { "brandId": 4, "name": "HP", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/HP.png" },
  { "brandId": 5, "name": "Lenovo", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Lenovo.png" },
  { "brandId": 6, "name": "Asus", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Asus.png" },
  { "brandId": 7, "name": "MSI", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/MSI.png" },
  { "brandId": 8, "name": "Acer", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/acer.png" },
  { "brandId": 9, "name": "Xiaomi", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_61.png" },
  { "brandId": 10, "name": "Sony", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/b/r/brand-icon-sony_2.png" }
]

const HomePage = () => {
  const { products, loading, error } = useProducts();
  const [categories, setCategories] = useState(['']);
  const [brands, setBrands] = useState(['']);

  // Lấy một số sản phẩm nổi bật (ví dụ: 4 sản phẩm đầu tiên)
  // console.log("products", products);
  const featuredProducts = products;
  
  useEffect(() => {
    (async () => {
      // const allCategory = await apiService.getAllCategories();
      // const allBrand = await apiService.getAllBrands();
      // console.log("allBrand", allBrand.data);
      // console.log("allCategory", allCategory.data);
      // setCategories(allCategory.data);
      setCategories(allCategory);
      setBrands(allBrand);
      // setBrands(allBrand.data);
      
    })();
  },[])

  // URL ảnh mẫu (thay thế bằng ảnh của bạn)
  const heroBgUrl = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80'; // Ví dụ ảnh nền Macbook
  const smartphoneCatImgUrl = 'https://images.unsplash.com/photo-1604671368394-22ae7daced1 S?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'; // Ví dụ ảnh smartphone
  const laptopCatImgUrl = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'; // Ví dụ ảnh laptop

  return (
    <div className={styles.homePage}>
      <section className={styles.bannerSection}>
      {/* <div className={styles.heroOverlay}></div> */}
      <div className={styles.bannerContent}>
        <Banner />
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
            <ListItem className={styles.popularListItem} category="Smartphone"/>
            <ListItem className={styles.popularListItem} category="Laptop"/>
          </>
        )}
      </section>

      <section className={`${styles.section} ${styles.categoriesSectionBg}`}>
        <h2 className={styles.sectionTitle}>Khám Phá Thương Hiệu</h2>
        <div className={styles.brandList}>
          {brands.map((brand, index) => (
            <Link to={`/products?brand=${brand.name}`} key={index} className={styles.brandCard}>
              <div className={styles.brandImageWrapper}>
                <img src={brand.logoUrl} alt={brand.name} className={styles.brandLogo} />
                <div className={styles.brandOverlay}></div>
              </div>
            </Link>
          ))}
        </div>
        <h2 className={styles.sectionTitle}>Khám Phá Danh Mục</h2>
        <div className={styles.categoryList}>
          {categories.map((category, index) => (
            <Link to={`/products?category=${category.name}`} key={index} className={styles.categoryCard}>
              <div className={styles.categoryImageWrapper}>
                <img src={category.image} alt={category.name} className={styles.categoryLogo} />
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