import React from "react";
import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const formatCurrency = (amount) => {
  // Add a check for valid input
  if (typeof amount !== 'number' || isNaN(amount)) {
    // Return a placeholder or handle as appropriate
    // console.warn("formatCurrency received invalid input:", amount);
    return 'N/A'; // Or perhaps formatCurrency(0) or ''
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const ProductCard = ({ product }) => {
  // Handle cases where product data might be incomplete
  if (!product || !product.productId) {
    return null; // Or return a placeholder/loading component
  }

  // --- Logic to find the best variant ---
  let bestVariant = null;
  let maxDiscount = 0; // Initialize max discount to 0

  if (product.variants && product.variants.length > 0) {
    // Start by assuming the first variant is the best
    bestVariant = product.variants[0];
    maxDiscount = bestVariant.discountPercentage || 0; // Handle null discount

    // Iterate through the rest of the variants
    for (let i = 1; i < product.variants.length; i++) {
      const currentVariant = product.variants[i];
      const currentDiscount = currentVariant.discountPercentage || 0; // Handle null discount

      if (currentDiscount > maxDiscount) {
        maxDiscount = currentDiscount;
        bestVariant = currentVariant;
      }
    }
  }
  // --- End of logic to find best variant ---


  // --- Determine display values ---
  const imageUrl = bestVariant?.imageUrl || "/placeholder-image.png"; // Use best variant image or placeholder
  const displayProductName = product.productName;
  const originalPrice = product.price;

  const discountPercentage = bestVariant?.discountPercentage || 0; // Get discount from best variant (or 0)
  const hasDiscount = discountPercentage > 0;

  // Calculate the final price to display
  const discountedPrice = hasDiscount
    ? originalPrice * (1 - discountPercentage / 100)
    : originalPrice; // If no discount, display price is original price

  const displayPriceNew = discountedPrice;
  const displayPriceOld = hasDiscount ? originalPrice : null; // Only show old price if there's a discount

  return (
    // Use productId for the link
    <Link to={`/products/${product.productId}`} className={styles.cardLink}>
      <div className={styles.card}>
        <img
          src={imageUrl} // Use image from best variant
          alt={displayProductName}
          className={styles.productImage}
        />
        <div className={styles.cardBody}>
          <h3 className={styles.productName}>{displayProductName}</h3> {/* Use productName */}
          <div className={styles.boxPrice}>
            <p className={styles.productPriceNew}>
              {formatCurrency(displayPriceNew)} {/* Show calculated new price */}
            </p>

            {/* Conditionally render old price only if there's a discount */}
            {hasDiscount && displayPriceOld !== null && (
              <p className={styles.productPriceOld}>
                {formatCurrency(displayPriceOld)}
              </p>
            )}

            {hasDiscount && (
               <div className={styles.itemPricePercent}>      {/* Div bao ngoài tag */}
                 <p className={styles.itemPricePercentDetail}> {/* Thẻ p chứa chữ */}
                   Giảm                               {/* Chữ "Giảm" */}
                   {discountPercentage.toFixed(0)}%        {/* Số % giảm giá */}
                 </p>
               </div>
            )}

            {/* Conditionally render discount badge only if there's a discount */}
            {hasDiscount && (
               <div className={styles.itemPricePercent}>
                 <p className={styles.itemPricePercentDetail}>
                   Giảm 
                   {discountPercentage.toFixed(0)}% {/* Show the actual discount % */}
                 </p>
               </div>
            )}
          </div>

          {/* Static Promotion - consider making this dynamic if needed */}
          <div className="itemPromotions">
            <div className="promotion">
              <p className="couponPrice">
                Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6 tháng
              </p>
            </div>
          </div>

          {/* Static Rating - consider making this dynamic if product data includes rating */}
          <div className={styles.bottomDiv}>
            <div className={styles.itemRating}>
              {/* Render 5 stars statically for now */}
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