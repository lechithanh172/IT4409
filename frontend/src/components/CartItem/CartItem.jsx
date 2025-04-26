import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CartItem.module.css';
import { FaTrashAlt, FaPlus, FaMinus } from 'react-icons/fa';

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const CartItem = ({ item, onRemove, onQuantityChange, onToggleSelect }) => {

   // Cập nhật trực tiếp khi bấm nút +/-
   const handleIncreaseQuantity = () => {
        // Sử dụng key duy nhất (ví dụ: kết hợp ID) để xác định item cần cập nhật
        onQuantityChange(item.uniqueId || `${item.productId}-${item.variantId}`, item.quantity + 1);
   };

   const handleDecreaseQuantity = () => {
        if (item.quantity > 1) {
            onQuantityChange(item.uniqueId || `${item.productId}-${item.variantId}`, item.quantity - 1);
        }
   };

  // Xử lý ảnh lỗi
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/images/placeholder-image.png'; // Ảnh dự phòng
  };

  // Tạo key duy nhất nếu chưa có
  const itemKey = item.uniqueId || `${item.productId}-${item.variantId}`;

  return (
    <tr className={styles.cartItemRow}>
      {/* Cột Checkbox */}
      <td className={styles.columnSelect}>
        <input
          type="checkbox"
          className={styles.itemSelectCheckbox}
          checked={item.is_selected ?? true} // Mặc định là true nếu chưa có
          onChange={() => onToggleSelect(itemKey)}
          aria-label={`Chọn sản phẩm ${item.name}`}
        />
      </td>

      {/* Cột Tên sản phẩm & Hình ảnh */}
      <td className={styles.columnProduct}>
        <div className={styles.productInfo}>
          {/* Link đến trang chi tiết sản phẩm */}
          <Link to={`/products/${item.productId}`} className={styles.productImageLink}>
            <img
              src={item.image || '/images/placeholder-image.png'}
              alt={item.name}
              className={styles.productImage}
              onError={handleImageError}
              loading="lazy"
            />
          </Link>
          <div className={styles.productDetails}>
            {/* Tên sản phẩm */}
            <Link to={`/products/${item.productId}`} className={styles.productName}>
              {item.name}
            </Link>
            {/* Thông tin biến thể */}
            {item.variantName && (
              <p className={styles.variantName}>{item.variantName}</p>
            )}
          </div>
        </div>
      </td>

      {/* Cột Số lượng */}
      <td className={styles.columnQuantity}>
        <div className={styles.quantityControl}>
          <button
            onClick={handleDecreaseQuantity}
            className={styles.quantityButton}
            disabled={item.quantity <= 1}
            aria-label="Giảm số lượng"
          >
            <FaMinus />
          </button>
          <span className={styles.quantityDisplay}>{item.quantity}</span>
          <button
            onClick={handleIncreaseQuantity}
            className={styles.quantityButton}
            aria-label="Tăng số lượng"
          >
            <FaPlus />
          </button>
        </div>
      </td>

      {/* Cột Đơn giá */}
      <td className={`${styles.columnPrice} ${styles.alignRight}`}>{formatCurrency(item.price)}</td>

       {/* Cột Thành tiền */}
       <td className={`${styles.columnTotal} ${styles.alignRight}`}>{formatCurrency(item.price * item.quantity)}</td>

      {/* Cột Thao tác */}
      <td className={styles.columnActions}>
        <button
          onClick={() => onRemove(itemKey)}
          className={styles.removeButton}
          title="Xóa sản phẩm"
          aria-label="Xóa sản phẩm"
        >
          <FaTrashAlt />
        </button>
      </td>
    </tr>
  );
};

export default CartItem;