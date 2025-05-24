// src/components/ProductCard/ProductCard.js (hoặc .jsx)
import React, { useEffect, useState } from "react"; // Import useEffect và useState
import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";
import RatingStars from '../RatingStars/RatingStars'; // Import RatingStars component
import apiService from "../../services/api"; // Import apiService
import Spinner from "../Spinner/Spinner";
// Hàm định dạng tiền tệ Việt Nam Đồng
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    console.warn("formatCurrency received invalid input:", amount);
    return "Đang cập nhật";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const ProductCard = ({ product }) => {
  // --- Bước 1: Kiểm tra dữ liệu đầu vào ---
  if (!product || !product.productId) {
    console.warn("ProductCard: Invalid product data received.", product);
    return null;
  }

  // --- State cho đánh giá trung bình và số lượt (Fetch riêng cho từng card) ---
  // LƯU Ý: APPROACH NÀY KHÔNG HIỆU QUẢ CHO DANH SÁCH LỚN (N+1 PROBLEM)
  const [cardAverageRating, setCardAverageRating] = useState(0);
  const [cardReviewCount, setCardReviewCount] = useState(0);
  const [isRatingLoading, setIsRatingLoading] = useState(true); // Loading state riêng cho rating card
  const [ratingError, setRatingError] = useState(null); // Error state riêng cho rating card

  // --- Effect để fetch đánh giá khi productId thay đổi ---
  useEffect(() => {
      const fetchRating = async () => {
          if (!product.productId) return; // Không fetch nếu không có productId

          setIsRatingLoading(true);
          setRatingError(null);

          try {
               // Gọi cả hai API: lấy average và lấy list (để đếm số lượng)
               // Sử dụng Promise.allSettled để đảm bảo cả hai request đều hoàn thành
               const [averageRes, listRes] = await Promise.allSettled([
                   apiService.getAverageRateOfProduct(product.productId),
                   apiService.getListRateOfProduct(product.productId) // Fetch list để lấy count
               ]);

               // Xử lý kết quả Average Rating
               if (averageRes.status === 'fulfilled') {
                   // Giả định API trả về chỉ một số (ví dụ: 4.0)
                   if (typeof averageRes.value?.data === 'number') {
                       setCardAverageRating(averageRes.value.data);
                   } else {
                        // Nếu API trả về format khác (ví dụ: object), cần điều chỉnh
                        console.warn(`API getAverageRateOfProduct for product ${product.productId} returned unexpected format:`, averageRes.value?.data);
                        setCardAverageRating(0); // Fallback về 0
                   }
               } else {
                   console.error(`Error fetching average rating for product ${product.productId}:`, averageRes.reason);
                   setCardAverageRating(0); // Fallback về 0 khi lỗi
               }

               // Xử lý kết quả Review List (để lấy số lượng)
              if (listRes.status === 'fulfilled' && Array.isArray(listRes.value?.data)) {
                   setCardReviewCount(listRes.value.data.length); // Lấy số lượng từ độ dài mảng
               } else {
                   console.error(`Error fetching review list for product ${product.productId} (to get count):`, listRes.reason);
                   setCardReviewCount(0); // Fallback về 0 khi lỗi
               }

          } catch (err) {
              // Lỗi tổng quát nếu Promise.allSettled cũng bị lỗi hệ thống
              console.error(`System error fetching rating for product ${product.productId}:`, err);
              setRatingError("Lỗi tải đánh giá");
              setCardAverageRating(0);
              setCardReviewCount(0);
          } finally {
              setIsRatingLoading(false);
          }
      };

      fetchRating();

  }, [product.productId]); // Dependency: chạy lại khi product.productId thay đổi


  // --- Bước 2: Lấy thông tin từ biến thể đầu tiên ---
  const firstVariant = product.variants?.[0];
  const imageUrl = firstVariant?.imageUrl || "/placeholder-image.png";

  // --- Bước 3: Xác định và tính toán giá hiển thị ---
  // Giả định product.price là giá gốc
  const basePrice = product.price;
  const discountPercent = Number(firstVariant?.discount) || 0;
  const hasDiscount = discountPercent > 0;
  const displayPrice = hasDiscount
    ? basePrice * (1 - discountPercent / 100)
    : basePrice;


  return (
    <Link to={`/products/${product.productId}`} className={styles.cardLink}>
      <div className={styles.card}>
        {/* Thẻ giảm giá */}
        {hasDiscount && (
           <div className={styles.itemPricePercent}>
             <p className={styles.itemPricePercentDetail}>
               Giảm {discountPercent}%
             </p>
           </div>
        )}

        {/* Ảnh sản phẩm */}
        <img
          src={imageUrl}
          alt={product.productName}
          className={styles.productImage}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/placeholder-image.png";
          }}
        />
        <div className={styles.cardBody}>
          {/* Tên sản phẩm */}
          <h3 className={styles.productName}>{product.productName}</h3>

          {/* --- Khối hiển thị giá --- */}
          <div className={styles.boxPrice}>
            <p className={styles.productPriceNew}>
              {formatCurrency(displayPrice)}
            </p>
            {hasDiscount && (
                <p className={styles.productPriceOld}>
                  {formatCurrency(basePrice)}
                </p>
            )}
          </div>
          {/* --- Kết thúc khối giá --- */}

          {/* --- Khối Khuyến mãi --- */}
          <div className={styles.itemPromotions}>
            <div className={styles.promotion}>
              <p className={styles.couponPrice}>
                Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6 tháng
              </p>
            </div>
          </div>
          {/* --- Kết thúc khuyến mãi --- */}

          {/* --- Khối Đánh giá sao (Sử dụng RatingStars component) --- */}
          <div className={styles.bottomDiv}>
             {/* Hiển thị loading/error hoặc RatingStars */}
             {(
                // Sử dụng RatingStars component với state riêng của card
                <RatingStars
                   rating={cardAverageRating}
                   reviewCount={cardReviewCount}
                   isSmall={true}
                />
             )}
          </div>
          {/* --- Kết thúc đánh giá sao --- */}

        </div>
      </div>
    </Link>
  );
};

export default ProductCard;