import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import ProductDisplay from '../../components/ProductDisplay/ProductDisplay'; // Import component mới
import Spinner from '../../components/Spinner/Spinner';
import styles from './ProductDetailPage.module.css';
import Button from '../../components/Button/Button';

const ProductDetailPage = () => {
  const { productId } = useParams(); // Lấy ID từ URL
  const { getProductById, loading, error } = useProducts(); // Lấy hàm và state từ context

  // Tìm sản phẩm dựa trên ID
  const product = getProductById(productId);

  // --- Xử lý trạng thái Loading, Error, Not Found ---
  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.pageContainer} ${styles.errorContainer}`}>
        <p className={styles.errorMessage}>Lỗi tải sản phẩm: {error}</p>
        <Link to="/products">
            <Button variant="secondary">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
       <div className={`${styles.pageContainer} ${styles.errorContainer}`}>
         <p className={styles.errorMessage}>Sản phẩm không tồn tại!</p>
         <Link to="/products">
            <Button variant="secondary">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  // Nếu có sản phẩm, render ProductDisplay
  return (
    <div className={styles.pageContainer}>
       {/* Có thể thêm Breadcrumbs ở đây */}
      {/* <div className={styles.breadcrumbs}>
           <Link to="/">Trang chủ</Link> / <Link to="/products">Sản phẩm</Link> / <span>{product.name}</span>
       </div> */}
      <ProductDisplay product={product} />
       {/* Có thể thêm section mô tả chi tiết, đánh giá ở dưới ProductDisplay */}
       {/* <section className={styles.descriptionSection}>
            <h2>Mô tả sản phẩm</h2>
            <p>{product.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
       </section>
       <section className={styles.reviewSection}>
           <h2>Đánh giá sản phẩm</h2>
            {/* Render component đánh giá ở đây */}
       {/* </section> */}
    </div>
  );
};

export default ProductDetailPage;