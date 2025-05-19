import React from "react";
import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css"; // Đảm bảo đường dẫn file CSS Module này chính xác
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

// Hàm định dạng tiền tệ Việt Nam Đồng
const formatCurrency = (amount) => {
  // Kiểm tra nếu amount không phải là số hoặc là NaN thì trả về 'N/A' hoặc giá trị mặc định khác
  if (typeof amount !== 'number' || isNaN(amount)) {
    console.warn("formatCurrency received invalid input:", amount);
    return "Đang cập nhật"; // Hoặc return 'N/A', 0, etc.
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const ProductCard = ({ product }) => {
  // --- Bước 1: Kiểm tra dữ liệu đầu vào ---
  // Nếu không có product, hoặc product không có productId, hoặc không có variants -> không hiển thị gì cả
  if (!product || !product.productId) {
    console.warn("ProductCard: Invalid product data received.", product);
    return null; // Hoặc hiển thị một component báo lỗi/placeholder
  }

  // --- Bước 2: Lấy thông tin từ biến thể đầu tiên ---
  // Sử dụng optional chaining (?.) để truy cập an toàn, phòng trường hợp variants là null/undefined hoặc rỗng
  const firstVariant = product.variants?.[0];

  // --- Bước 3: Xác định URL hình ảnh ---
  // Ưu tiên ảnh từ biến thể đầu tiên, nếu không có thì dùng ảnh placeholder
  const imageUrl = firstVariant?.imageUrl || "/placeholder-image.png"; // Thay bằng đường dẫn ảnh placeholder của bạn

  // --- Bước 4: Xác định và tính toán giá hiển thị ---
  const basePrice = product.price; // Giá gốc của sản phẩm

  // Lấy phần trăm giảm giá từ biến thể đầu tiên. Mặc định là 0 nếu không có biến thể hoặc không có discount.
  // Dùng Number() để đảm bảo giá trị là số, và || 0 để xử lý null/undefined/NaN thành 0.
  const discountPercent = Number(firstVariant?.discount) || 0;

  // Kiểm tra xem có áp dụng giảm giá không (discount > 0)
  const hasDiscount = discountPercent > 0;

  // Tính giá cuối cùng sẽ hiển thị
  // Nếu có giảm giá, tính giá sau giảm. Nếu không, giá hiển thị là giá gốc.
  const displayPrice = hasDiscount
    ? basePrice * (1 - discountPercent / 100)
    : basePrice;

  return (
    <Link to={`/products/${product.productId}`} className={styles.cardLink}>
      <div className={styles.card}>
        <img
          src={imageUrl}
          alt={product.productName} // Sử dụng tên sản phẩm làm alt text
          className={styles.productImage}
          // Xử lý lỗi nếu ảnh không tải được
          onError={(e) => {
            e.target.onerror = null; // Ngăn lặp vô hạn nếu placeholder cũng lỗi
            e.target.src = "/placeholder-image.png"; // Fallback về placeholder
          }}
        />
        <div className={styles.cardBody}>
          {/* Tên sản phẩm */}
          <h3 className={styles.productName}>{product.productName}</h3>

          {/* --- Khối hiển thị giá (Đã cập nhật logic) --- */}
          <div className={styles.boxPrice}>
            {/* Giá hiển thị cuối cùng (đã giảm giá hoặc giá gốc) */}
            <p className={styles.productPriceNew}>
              {formatCurrency(displayPrice)}
            </p>

            {/* Chỉ hiển thị giá gốc (gạch ngang) VÀ phần trăm giảm nếu có giảm giá */}
            {hasDiscount && (
              <>
                {/* Giá gốc bị gạch ngang */}
                <p className={styles.productPriceOld}>
                  {formatCurrency(basePrice)}
                </p>
                {/* Tag hiển thị phần trăm giảm giá */}
                <div className={styles.itemPricePercent}>
                  <p className={styles.itemPricePercentDetail}>
                    Giảm {discountPercent}% {/* Hiển thị % giảm giá */}
                  </p>
                </div>
              </>
            )}
          </div>
          {/* --- Kết thúc khối giá --- */}

          {/* --- Khối Khuyến mãi (Giữ nguyên hoặc tùy chỉnh) --- */}
          <div className="itemPromotions">
            <div className="promotion">
              <p className="couponPrice">
                Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6 tháng
              </p>
            </div>
          </div>
          {/* --- Kết thúc khuyến mãi --- */}

          {/* --- Khối Đánh giá sao (Giữ nguyên hoặc tùy chỉnh) --- */}
          <div className={styles.bottomDiv}>
            <div className={styles.itemRating}>
              {/* Ví dụ hiển thị 5 sao tĩnh */}
              {[...Array(5)].map((_, index) => (
                <div className={styles.iconStar} key={`star-${product.productId}-${index}`}>
                  <FontAwesomeIcon icon={faStar} />
                </div>
              ))}
              {/* Có thể thêm số lượt đánh giá ở đây nếu API cung cấp */}
              {/* <span className={styles.ratingCount}>(12)</span> */}
            </div>
          </div>
          {/* --- Kết thúc đánh giá sao --- */}

        </div>
      </div>
    </Link>
  );
};

export default ProductCard;