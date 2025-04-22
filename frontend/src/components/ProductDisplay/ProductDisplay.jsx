import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext'; // Import Cart Context
import Button from '../Button/Button';             // Import Button component
import styles from './ProductDisplay.module.css';   // Import CSS Module

// Import icons
import {
  FaStar, FaRegStar, FaStarHalfAlt, FaCartPlus, FaCheck, FaBolt, FaExclamationCircle, FaTag
} from 'react-icons/fa';

// --- Hàm tiện ích ---
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// --- Component con: Hiển thị sao đánh giá ---
const RatingStars = ({ rating = 0, reviewCount = 0 }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating > 0 && rating % 1 >= 0.3;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    if (rating <= 0 && reviewCount <= 0) {
        return <div className={styles.rating}><span className={styles.reviewCount}>Chưa có đánh giá</span></div>;
    }

    return (
      <div className={styles.rating}>
        <div className={styles.stars}>
          {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className={styles.starIcon} />)}
          {hasHalfStar && <FaStarHalfAlt key="half" className={styles.starIcon} />}
          {[...Array(Math.max(0, emptyStars))].map((_, i) => <FaRegStar key={`empty-${i}`} className={styles.starIcon} />)}
        </div>
        {reviewCount > 0 && <a href="#reviews" className={styles.reviewCountLink}>({reviewCount} đánh giá)</a>}
      </div>
    );
};

// --- Component chính: ProductDisplay ---
const ProductDisplay = ({ product }) => {
  // Hooks
  const { addItemToCart } = useCart();
  const navigate = useNavigate();

  // State
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  // Effect để chọn variant đầu tiên còn hàng
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
        const firstAvailableIndex = product.variants.findIndex(v => v.stockQuantity > 0);
        setSelectedVariantIndex(firstAvailableIndex >= 0 ? firstAvailableIndex : 0);
    } else {
        setSelectedVariantIndex(0);
    }
  }, [product]);

  // Lấy thông tin variant đang được chọn
  const selectedVariant = (product?.variants && product.variants.length > selectedVariantIndex)
                           ? product.variants[selectedVariantIndex]
                           : null;

  // --- Handlers ---
  const handleSelectVariant = (index) => setSelectedVariantIndex(index);

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stockQuantity <= 0) {
        console.warn("Không thể thêm vào giỏ: Sản phẩm hết hàng hoặc không có thông tin.");
        return;
    }
    const itemToAdd = {
      productId: product.productId,
      variantId: selectedVariant.variantId,
      name: product.productName,
      variantName: selectedVariant.color,
      price: selectedVariant.finalPrice, // Giá cuối cùng đã tính discount
      image: selectedVariant.imageUrl,
      quantity: 1
    };
    addItemToCart(itemToAdd);
    alert(`Đã thêm "${product.productName} - ${selectedVariant.color}" vào giỏ hàng!`);
  };

  const handleOrderNow = () => {
    if (!selectedVariant || selectedVariant.stockQuantity <= 0) return;
    handleAddToCart(); // Thực hiện thêm vào giỏ trước
    navigate('/cart'); // Sau đó chuyển đến trang giỏ hàng
  };

  // --- Render Conditions ---
  if (!product || !product.variants || product.variants.length === 0) {
    return <p className={styles.errorMessage}>Không tìm thấy thông tin sản phẩm.</p>;
  }
  const currentVariant = selectedVariant || product.variants[0]; // Fallback

  // --- JSX Output ---
  return (
    <div className={styles.productDisplayContainer}>

      {/* === CỘT TRÁI: CHỈ CÓ HÌNH ẢNH === */}
      <div className={styles.leftColumn}>
          <div className={styles.imageWrapper}>
              <img
                  src={currentVariant.imageUrl}
                  alt={`${product.productName} - ${currentVariant.color}`}
                  className={styles.mainImage}
                  key={currentVariant.variantId} // Key giúp re-render khi ảnh thay đổi
                  loading="lazy" // Lazy loading cho ảnh
                  onError={(e) => { // Xử lý khi ảnh bị lỗi
                      e.target.onerror = null; // Ngăn lặp vô hạn
                      e.target.src="/images/placeholder-image.png"; // Thay bằng ảnh placeholder
                  }}
              />
              {/* Badge giảm giá trên ảnh */}
              {currentVariant.discount > 0 && (
                  <div className={styles.imageDiscountBadge}>
                      <FaTag /> -{currentVariant.discount.toFixed(0)}%
                  </div>
              )}
          </div>
          {/* Phần specs tóm tắt đã bị xóa */}
      </div>

      {/* === CỘT PHẢI: THÔNG TIN & ACTIONS === */}
      <div className={styles.rightColumn}>
          {/* Tên sản phẩm */}
          <h1 className={styles.productName}>{product.productName}</h1>
          {/* Đánh giá sao */}
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />

          {/* Badge hỗ trợ (ví dụ: giao nhanh) */}
          {product.supportRushOrder && (
              <div className={styles.badge} style={{ backgroundColor: '#e6f7ff', color: '#1890ff', borderColor: '#91d5ff'}}>
                  <FaBolt /> Hỗ trợ giao hàng nhanh
              </div>
          )}

          {/* Đường kẻ ngang phân cách */}
          <hr className={styles.divider} />

          {/* Khu vực hiển thị giá */}
          <div className={styles.priceSection}>
              <span className={styles.currentPrice}>{formatCurrency(currentVariant.finalPrice)}</span>
              {/* Hiển thị giá gốc nếu có giảm giá */}
              {currentVariant.discount > 0 && (
                  <span className={styles.oldPrice}>{formatCurrency(currentVariant.basePrice)}</span>
              )}
          </div>

          {/* Khu vực chọn màu sắc (variant) */}
          <div className={styles.variantSelector}>
            <p className={styles.selectorTitle}>Chọn màu sắc:</p>
            <div className={styles.variantGrid}>
              {product.variants.map((variant, index) => (
                <button
                  key={variant.variantId}
                  className={`
                      ${styles.variantCard}
                      ${index === selectedVariantIndex ? styles.selectedVariant : ''}
                      ${variant.stockQuantity <= 0 ? styles.disabledVariant : ''}
                  `}
                  onClick={() => handleSelectVariant(index)}
                  title={`${variant.color}\nGiá: ${formatCurrency(variant.finalPrice)}\n${variant.stockQuantity > 0 ? `Kho: ${variant.stockQuantity}` : 'Tạm hết hàng'}`}
                >
                  <img
                    src={variant.imageUrl} // Nên có ảnh thumbnail riêng nếu được
                    alt={variant.color}
                    className={styles.variantThumb}
                    onError={(e) => { e.target.style.display='none'; }}
                  />
                  <div className={styles.variantInfo}>
                      <span className={styles.variantColorName}>{variant.color}</span>
                      <span className={styles.variantPriceTag}>{formatCurrency(variant.finalPrice)}</span>
                  </div>
                  {index === selectedVariantIndex && variant.stockQuantity > 0 && (
                     <FaCheck className={styles.checkmarkIcon} />
                  )}
                  {variant.stockQuantity <= 0 && (
                       <div className={styles.outOfStockOverlay}>Hết hàng</div>
                  )}
                </button>
              ))}
            </div>
          </div>

           {/* Thông báo nếu màu đang chọn hết hàng */}
           {currentVariant.stockQuantity <= 0 && (
               <p className={styles.variantOutOfStockMsg}>
                   <FaExclamationCircle /> Màu [{currentVariant.color}] tạm hết hàng.
               </p>
           )}

           {/* Các nút hành động */}
           <div className={styles.actionButtons}>
                  <Button
                      variant="primary"
                      className={styles.orderNowButton}
                      onClick={handleOrderNow}
                      disabled={currentVariant.stockQuantity <= 0}
                  >
                      <strong>ĐẶT HÀNG</strong>
                      <span>Giao hàng tận nơi</span>
                  </Button>
                  <Button
                      variant="outline" // Hoặc secondary nếu đã định nghĩa
                      className={styles.addToCartButton}
                      onClick={handleAddToCart}
                      disabled={currentVariant.stockQuantity <= 0}
                  >
                      <FaCartPlus />
                      <span>Thêm vào giỏ</span>
                  </Button>
           </div>
      </div>
    </div>
  );
};

export default ProductDisplay;