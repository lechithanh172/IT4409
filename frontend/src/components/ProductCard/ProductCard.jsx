
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";
import RatingStars from '../RatingStars/RatingStars';
import apiService from "../../services/api";
import Spinner from "../Spinner/Spinner";

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

  if (!product || !product.productId) {
    console.warn("ProductCard: Invalid product data received.", product);
    return null;
  }



  const [cardAverageRating, setCardAverageRating] = useState(0);
  const [cardReviewCount, setCardReviewCount] = useState(0);
  const [isRatingLoading, setIsRatingLoading] = useState(true);
  const [ratingError, setRatingError] = useState(null);


  useEffect(() => {
      const fetchRating = async () => {
          if (!product.productId) return;

          setIsRatingLoading(true);
          setRatingError(null);

          try {


               const [averageRes, listRes] = await Promise.allSettled([
                   apiService.getAverageRateOfProduct(product.productId),
                   apiService.getListRateOfProduct(product.productId)
               ]);


               if (averageRes.status === 'fulfilled') {

                   if (typeof averageRes.value?.data === 'number') {
                       setCardAverageRating(averageRes.value.data);
                   } else {

                        console.warn(`API getAverageRateOfProduct for product ${product.productId} returned unexpected format:`, averageRes.value?.data);
                        setCardAverageRating(0);
                   }
               } else {
                   console.error(`Error fetching average rating for product ${product.productId}:`, averageRes.reason);
                   setCardAverageRating(0);
               }


              if (listRes.status === 'fulfilled' && Array.isArray(listRes.value?.data)) {
                   setCardReviewCount(listRes.value.data.length);
               } else {
                   console.error(`Error fetching review list for product ${product.productId} (to get count):`, listRes.reason);
                   setCardReviewCount(0);
               }

          } catch (err) {

              console.error(`System error fetching rating for product ${product.productId}:`, err);
              setRatingError("Lỗi tải đánh giá");
              setCardAverageRating(0);
              setCardReviewCount(0);
          } finally {
              setIsRatingLoading(false);
          }
      };

      fetchRating();

  }, [product.productId]); 



  const firstVariant = product.variants?.[0];
  const imageUrl = firstVariant?.imageUrl || "/placeholder-image.png";



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