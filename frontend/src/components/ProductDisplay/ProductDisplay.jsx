import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext'; // Import Cart Context (nếu dùng để update UI)
import { useAuth } from '../../contexts/AuthContext';   // Import Auth Context
import apiService from '../../services/api';   // Import apiService
import Button from '../Button/Button';               // Import Button component
import styles from './ProductDisplay.module.css';     // Import CSS Module
import { toast } from 'react-toastify';               // Import toast để hiển thị thông báo
import Spinner from '../Spinner/Spinner';             // Import Spinner
import {
  FaStar, FaRegStar, FaStarHalfAlt, FaCartPlus, FaCheck, FaBolt, FaExclamationCircle, FaTag
} from 'react-icons/fa';
// Import các icon Feather (Fi...) từ /fi
import { FiLogIn } from 'react-icons/fi'; 
// --- Hàm tiện ích ---
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Liên hệ'; // Xử lý cả NaN
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// --- Component con: Hiển thị sao đánh giá ---
const RatingStars = ({ rating = 0, reviewCount = 0 }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating > 0 && rating % 1 >= 0.3; // Ngưỡng hiển thị nửa sao
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    if (rating <= 0 && reviewCount <= 0) {
        return <div className={styles.rating}><span className={styles.reviewCount}>Chưa có đánh giá</span></div>;
    }

    return (
      <div className={styles.rating}>
        <div className={styles.stars}>
          {/* Render sao đầy */}
          {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className={styles.starIcon} />)}
          {/* Render nửa sao nếu có */}
          {hasHalfStar && <FaStarHalfAlt key="half" className={styles.starIcon} />}
          {/* Render sao rỗng (đảm bảo không âm) */}
          {[...Array(Math.max(0, emptyStars))].map((_, i) => <FaRegStar key={`empty-${i}`} className={styles.starIcon} />)}
        </div>
        {/* Render số lượt đánh giá nếu có */}
        {reviewCount > 0 && <a href="#reviews" className={styles.reviewCountLink}>({reviewCount} đánh giá)</a>}
      </div>
    );
};


// --- Component chính: ProductDisplay ---
const ProductDisplay = ({ product }) => {
  // Hooks
  // const { addItemToCart } = useCart(); // Có thể inject hàm này từ Context nếu cần update state global
  const { isAuthenticated } = useAuth(); // Lấy trạng thái đăng nhập từ Auth Context
  const navigate = useNavigate();         // Hook để điều hướng

  // State
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0); // Index của variant đang được chọn
  const [isAddingToCart, setIsAddingToCart] = useState(false);       // Trạng thái loading khi thêm vào giỏ
  const [addToCartError, setAddToCartError] = useState('');       // Thông báo lỗi khi thêm vào giỏ

  // Effect để tự động chọn variant đầu tiên còn hàng khi component được mount hoặc `product` prop thay đổi
  useEffect(() => {
    if (product?.variants?.length > 0) { // Kiểm tra product và variants tồn tại
        // Tìm index của variant đầu tiên có stockQuantity > 0
        const firstAvailableIndex = product.variants.findIndex(v => v.stockQuantity > 0);
        // Nếu tìm thấy variant còn hàng, chọn nó. Nếu không, chọn variant đầu tiên (index 0).
        setSelectedVariantIndex(firstAvailableIndex >= 0 ? firstAvailableIndex : 0);
    } else {
        // Nếu không có variant nào, đặt index về 0
        setSelectedVariantIndex(0);
    }
  }, [product]); // Chạy lại effect này mỗi khi `product` prop thay đổi

  // Lấy object variant đang được chọn dựa trên selectedVariantIndex
  // Xử lý trường hợp product.variants không tồn tại hoặc index không hợp lệ
  const selectedVariant = (product?.variants && product.variants.length > selectedVariantIndex)
                           ? product.variants[selectedVariantIndex]
                           : null;

  // --- Handlers ---
  // Xử lý khi người dùng click chọn một variant khác
  const handleSelectVariant = (index) => {
      setSelectedVariantIndex(index);
      setAddToCartError(''); // Xóa thông báo lỗi cũ (nếu có) khi người dùng chọn màu khác
  };

  // Xử lý khi nhấn nút "Thêm vào giỏ hàng"
  const handleAddToCart = async () => {
    // 1. Kiểm tra đăng nhập
    if (!isAuthenticated) {
        toast.warn('Vui lòng đăng nhập để thêm sản phẩm!', { position: "bottom-right" });
        // Tùy chọn: Điều hướng đến trang đăng nhập
        // navigate('/login');
        return; // Dừng thực thi
    }

    // 2. Kiểm tra xem variant có hợp lệ, còn hàng và không đang trong quá trình thêm khác không
    if (!selectedVariant || selectedVariant.stockQuantity <= 0 || isAddingToCart) {
        if (selectedVariant && selectedVariant.stockQuantity <= 0) {
             toast.error('Sản phẩm đã hết hàng!', { position: "bottom-right" });
        }
        console.warn("Add to cart stopped: Invalid variant, out of stock, or already adding.");
        return; // Dừng thực thi
    }

    // 3. Bắt đầu quá trình: Bật loading, xóa lỗi cũ
    setIsAddingToCart(true);
    setAddToCartError('');

    try {
        // 4. Chuẩn bị dữ liệu gửi lên API
        const cartItemData = {
            productId: product.productId,       // ID sản phẩm chính
            variantId: selectedVariant.variantId, // ID của variant (màu sắc) được chọn
            quantity: 1                       // Mặc định thêm 1 sản phẩm
        };
        console.log("Attempting to add to cart:", cartItemData);

        // 5. Gọi API để thêm sản phẩm vào giỏ hàng
        const response = await apiService.addToCart(cartItemData);
        console.log("API Add to Cart Response:", response);

        // 6. Xử lý thành công: Hiển thị toast thông báo
        toast.success(`Đã thêm "${product.productName} - ${selectedVariant.color}" vào giỏ hàng!`, {
             position: "bottom-right",
             autoClose: 2500,
        });

        // 7. (Tùy chọn) Cập nhật state global (ví dụ: CartContext) để cập nhật số lượng trên icon giỏ hàng
        // Ví dụ: dispatch({ type: 'FETCH_CART_COUNT' }); // Hoặc một cách khác để cập nhật

    } catch (err) { // 8. Xử lý lỗi
        console.error("Lỗi khi thêm vào giỏ hàng:", err);
        const errorMessage = err.response?.data?.message || err.message || "Thêm vào giỏ hàng thất bại.";
        setAddToCartError(errorMessage); // Lưu lỗi để có thể hiển thị gần nút
        // Hiển thị toast báo lỗi
        toast.error(errorMessage, { position: "bottom-right" });
    } finally {
        // 9. Kết thúc loading dù thành công hay thất bại
        setIsAddingToCart(false);
    }
  };

  // Xử lý khi nhấn nút "Đặt Hàng"
  const handleOrderNow = async () => {
     // 1. Kiểm tra đăng nhập
     if (!isAuthenticated) {
        toast.warn('Vui lòng đăng nhập để đặt hàng!', { position: "bottom-right" });
        return;
     }

     // 2. Kiểm tra variant, tồn kho, loading
    if (!selectedVariant || selectedVariant.stockQuantity <= 0 || isAddingToCart) return;

    // 3. Bắt đầu loading (có thể dùng chung state isAddingToCart)
    setIsAddingToCart(true);
    setAddToCartError('');

    try {
        // 4. Thêm sản phẩm vào giỏ hàng trước khi chuyển trang
         const cartItemData = {
            productId: product.productId,
            variantId: selectedVariant.variantId,
            quantity: 1
        };
        await apiService.addToCart(cartItemData); // Gọi API thêm vào giỏ
        console.log("Item added to cart before navigating to /cart");

        // 5. Chuyển hướng đến trang giỏ hàng
        navigate('/cart');
        // Không cần tắt loading ở đây nếu navigate thành công

    } catch(err) { // 6. Xử lý lỗi nếu thêm vào giỏ thất bại
         console.error("Lỗi khi thêm vào giỏ (trong Đặt hàng):", err);
         const errorMessage = err.response?.data?.message || err.message || "Không thể xử lý đặt hàng.";
         setAddToCartError(errorMessage);
         toast.error(errorMessage, { position: "bottom-right" });
         setIsAddingToCart(false); // Quan trọng: Tắt loading nếu lỗi ở bước này
    }
    // Nếu không có lỗi ở try, isAddingToCart sẽ tự reset khi component unmount hoặc navigate
  };

  // --- Render Conditions ---
  // Kiểm tra dữ liệu đầu vào cơ bản
  if (!product || !product.variants || product.variants.length === 0) {
    // Có thể hiển thị một thông báo lỗi cụ thể hơn ở đây
    return <p className={styles.errorMessage}>Không tìm thấy thông tin sản phẩm hoặc sản phẩm không có biến thể.</p>;
  }
  // Đảm bảo luôn có một `currentVariant` để tránh lỗi (dù đã có useEffect xử lý)
  const currentVariant = selectedVariant || product.variants[0];
  // Kiểm tra lại xem currentVariant có thực sự tồn tại không (trường hợp cực hiếm)
  if (!currentVariant) {
      return <p className={styles.errorMessage}>Lỗi hiển thị biến thể sản phẩm.</p>;
  }

  // --- JSX Output ---
  return (
    <div className={styles.productDisplayContainer}>

      {/* === CỘT TRÁI: HÌNH ẢNH SẢN PHẨM === */}
      <div className={styles.leftColumn}>
          <div className={styles.imageWrapper}>
              <img
                  src={currentVariant.imageUrl} // Ảnh của variant đang chọn
                  alt={`${product.productName} - ${currentVariant.color}`} // Text mô tả ảnh
                  className={styles.mainImage}
                  key={currentVariant.variantId} // Key giúp React nhận biết và cập nhật ảnh khi variant đổi
                  loading="lazy" // Tải ảnh trì hoãn
                  onError={(e) => { // Xử lý khi ảnh bị lỗi không tải được
                      e.target.onerror = null; // Ngăn vòng lặp lỗi vô hạn
                      e.target.src="/images/placeholder-image.png"; // Hiển thị ảnh dự phòng
                  }}
              />
              {/* Hiển thị badge giảm giá nếu có */}
              {currentVariant.discount > 0 && (
                  <div className={styles.imageDiscountBadge}>
                      <FaTag /> -{currentVariant.discount.toFixed(0)}%
                  </div>
              )}
          </div>
          {/* Phần specs tóm tắt đã bị xóa theo yêu cầu trước */}
      </div>

      {/* === CỘT PHẢI: THÔNG TIN & ACTIONS === */}
      <div className={styles.rightColumn}>
          {/* Tên sản phẩm */}
          <h1 className={styles.productName}>{product.productName}</h1>
          {/* Đánh giá sao và số lượt đánh giá */}
          <RatingStars rating={product.rating || 0} reviewCount={product.reviewCount || 0} />

          {/* Badge hỗ trợ giao nhanh */}
          {product.supportRushOrder && (
              <div className={styles.badge} style={{ backgroundColor: '#e6f7ff', color: '#1890ff', borderColor: '#91d5ff'}}>
                  <FaBolt /> Hỗ trợ giao hàng nhanh
              </div>
          )}
          {/* Badge cân nặng */}
           {product.weight && (
              <div className={styles.badge} style={{ backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0'}}>
                  ⚖️ {product.weight} kg
              </div>
           )}

          {/* Đường kẻ ngang */}
          <hr className={styles.divider} />

          {/* Khu vực giá */}
          <div className={styles.priceSection}>
              {/* Giá bán hiện tại (đã tính discount) */}
              <span className={styles.currentPrice}>{formatCurrency(currentVariant.finalPrice)}</span>
              {/* Giá gốc (chỉ hiển thị nếu có discount) */}
              {currentVariant.discount > 0 && currentVariant.basePrice && (
                  <span className={styles.oldPrice}>{formatCurrency(currentVariant.basePrice)}</span>
              )}
          </div>

          {/* Khu vực chọn màu sắc (variant) */}
          <div className={styles.variantSelector}>
            <p className={styles.selectorTitle}>Chọn màu sắc:</p>
            <div className={styles.variantGrid}>
              {/* Lặp qua mảng product.variants để tạo các nút chọn màu */}
              {product.variants.map((variant, index) => (
                <button
                  key={variant.variantId} // Key duy nhất cho mỗi variant
                  className={`
                      ${styles.variantCard}
                      ${index === selectedVariantIndex ? styles.selectedVariant : ''}
                      ${variant.stockQuantity <= 0 ? styles.disabledVariant : ''}
                  `}
                  onClick={() => handleSelectVariant(index)} // Gọi hàm xử lý khi click
                  // Tooltip hiển thị thông tin chi tiết khi hover
                  title={`${variant.color}\nGiá: ${formatCurrency(variant.finalPrice)}\n${variant.stockQuantity > 0 ? `Kho: ${variant.stockQuantity}` : 'Tạm hết hàng'}`}
                >
                  {/* Ảnh thumbnail của variant */}
                  <img
                    src={variant.imageUrl} // Nên dùng ảnh thumbnail nếu API cung cấp
                    alt={variant.color}
                    className={styles.variantThumb}
                    loading="lazy"
                    onError={(e) => { e.target.style.display='none'; /* Ẩn nếu ảnh thumb lỗi */ }}
                  />
                  {/* Thông tin tên màu và giá */}
                  <div className={styles.variantInfo}>
                      <span className={styles.variantColorName}>{variant.color}</span>
                      <span className={styles.variantPriceTag}>{formatCurrency(variant.finalPrice)}</span>
                  </div>
                  {/* Icon check nếu variant này được chọn và còn hàng */}
                  {index === selectedVariantIndex && variant.stockQuantity > 0 && (
                     <FaCheck className={styles.checkmarkIcon} />
                  )}
                  {/* Lớp phủ hiển thị "Hết hàng" */}
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
                   <FaExclamationCircle /> Màu [{currentVariant.color}] hiện đã hết hàng. Vui lòng chọn màu khác.
               </p>
           )}
           {/* Thông báo lỗi khi thêm vào giỏ (nếu có) */}
           {addToCartError && (
               <p className={`${styles.variantOutOfStockMsg} ${styles.addToCartError}`}>
                   <FaExclamationCircle /> {addToCartError}
               </p>
           )}

           {/* Các nút hành động: Đặt hàng & Thêm vào giỏ */}
           <div className={styles.actionButtons}>
                  {/* Nút Đặt Hàng */}
                  <Button
                      variant="primary" // Sử dụng variant primary (có thể custom gradient trong CSS)
                      className={styles.orderNowButton}
                      onClick={handleOrderNow} // Gọi hàm xử lý đặt hàng
                      // Disable nút nếu hết hàng hoặc đang xử lý thêm vào giỏ
                      disabled={currentVariant.stockQuantity <= 0 || isAddingToCart}
                  >
                       {/* Hiển thị spinner nếu đang xử lý */}
                      {isAddingToCart && <Spinner size="small" color="#fff"/> }
                      <strong>ĐẶT HÀNG</strong>
                      <span>Giao hàng tận nơi</span>
                  </Button>

                  {/* Nút Thêm vào giỏ hàng */}
                  <Button
                      variant="outline" // Sử dụng variant outline (hoặc secondary)
                      className={styles.addToCartButton}
                      onClick={handleAddToCart} // Gọi hàm xử lý thêm vào giỏ
                      disabled={currentVariant.stockQuantity <= 0 || isAddingToCart} // Disable khi hết hàng hoặc đang loading
                  >
                      {/* Hiển thị spinner hoặc icon tùy trạng thái loading */}
                      {isAddingToCart ? <Spinner size="small" /> : <FaCartPlus />}
                      <span>{isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}</span>
                  </Button>
           </div>
      </div>
    </div>
  );
};

export default ProductDisplay;