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

  return (
    <></>
  );
};

export default ProductDetailPage;