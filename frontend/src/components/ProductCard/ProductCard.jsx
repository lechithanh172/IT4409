import React from "react";
import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'N/A';
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const ProductCard = ({ product }) => {
  if (!product || !product.productId) {
    return null;
  }

  let bestVariant = null;
  let maxDiscount = 0;

  if (product.variants && product.variants.length > 0) {
    bestVariant = product.variants[0];
    maxDiscount = bestVariant.discountPercentage || 0;
    for (let i = 1; i < product.variants.length; i++) {
      const currentVariant = product.variants[i];
      const currentDiscount = currentVariant.discountPercentage || 0;
      if (currentDiscount > maxDiscount) {
        maxDiscount = currentDiscount;
        bestVariant = currentVariant;
      }
    }
  }

  const imageUrl = bestVariant?.imageUrl || "/placeholder-image.png";
  const displayProductName = product.productName;
  const originalPrice = product.price;
  const discountPercentage = bestVariant?.discountPercentage || 0;
  const hasDiscount = discountPercentage > 0;
  const discountedPrice = hasDiscount ? originalPrice * (1 - discountPercentage / 100) : originalPrice;
  const displayPriceNew = discountedPrice;
  const displayPriceOld = hasDiscount ? originalPrice : null;

  return (
    <Link to={`/products/${product.productId}`} className={styles.cardLink}>
      <div className={styles.card}>
        <img
          src={imageUrl}
          alt={displayProductName}
          className={styles.productImage}
        />
        <div className={styles.cardBody}>
          <h3 className={styles.productName}>{displayProductName}</h3>
          <div className={styles.boxPrice}>
            <p className={styles.productPriceNew}>
              {formatCurrency(displayPriceNew)}
            </p>

            {hasDiscount && displayPriceOld !== null && (
              <p className={styles.productPriceOld}>
                {formatCurrency(displayPriceOld)}
              </p>
            )}

             {/* **** Chỉ giữ lại MỘT khối hiển thị tag giảm giá **** */}
             {hasDiscount && (
               <div className={styles.itemPricePercent}>
                 <p className={styles.itemPricePercentDetail}>
                    {/* Sử dụng template literal cho dễ đọc */}
                    {`Giảm ${discountPercentage.toFixed(0)}%`}
                  </p>
               </div>
            )}

            {/* ---- Khối trùng lặp đã được xóa ---- */}

          </div>

          <div className={styles.itemPromotions}>
            <div className={styles.promotion}>
              <p className={styles.couponPrice}>
                Mua ngay, trả góp sau - 0% lãi suất, không tốn phí chuyển đổi cho kỳ hạn 3-6 tháng
              </p>
            </div>
          </div>

          <div className={styles.bottomDiv}>
            <div className={styles.itemRating}>
              {[...Array(5)].map((_, i) => (
                 <div className={styles.iconStar} key={i}>
                   <FontAwesomeIcon icon={faStar} />
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;