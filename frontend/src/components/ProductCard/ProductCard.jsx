import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import styles from './ProductCard.module.css';
import Button from '../Button/Button'; // Import Button component

// Hàm định dạng tiền tệ (có thể đặt trong src/utils/formatters.js)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const ProductCard = ({ product }) => {
  const { addItemToCart } = useCart(); // Lấy hàm thêm vào giỏ hàng

  const handleAddToCart = (e) => {
    e.preventDefault(); // Ngăn Link chuyển trang nếu bấm vào nút
    e.stopPropagation(); // Ngăn sự kiện nổi bọt lên Link cha
    addItemToCart(product, 1); // Thêm 1 sản phẩm
    // Optional: Hiển thị thông báo đã thêm thành công
    alert(`${product.name} đã được thêm vào giỏ hàng!`);
  };

  if (!product) {
    return null; // Hoặc hiển thị placeholder
  }

  return (
    <Link to={`/products/${product.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <img
          src={product.image || '/placeholder-image.png'} // Dùng ảnh placeholder nếu không có
          alt={product.name}
          className={styles.productImage}
        />
        <div className={styles.cardBody}>
          <h3 className={styles.productName}>{product.name}</h3>
          <p className={styles.productPrice}>{formatCurrency(product.price * 25000)}</p> {/* Giả sử giá USD */}
          <p className={styles.productCategory}>{product.category}</p>
          <Button onClick={handleAddToCart} className={styles.addToCartButton}>
             Thêm vào giỏ
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;