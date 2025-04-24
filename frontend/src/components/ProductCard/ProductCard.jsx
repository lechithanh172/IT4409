import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import { useCart } from '../../contexts/CartContext';
import styles from './ProductCard.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";


// Hàm định dạng tiền tệ (có thể đặt trong src/utils/formatters.js)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const ProductCard = ({ product }) => {

  return (
    <Link to={`/products/${product.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <img
          src={product.imageUrl || '/placeholder-image.png'} // Dùng ảnh placeholder nếu không có
          alt={product.name}
          className={styles.productImage}
        />
        <div className={styles.cardBody}>
          <h3 className={styles.productName}>{product.productName}</h3>
          <div className={styles.boxPrice}>
            <p className={styles.productPriceNew}>{formatCurrency(product.price)}</p> {/* Giả sử giá USD */}
            <p className={styles.productPriceOld}>{formatCurrency(product.price)}</p> {/* Giả sử giá USD */}
            <div className={styles.itemPricePercent}>
              <p className={styles.itemPricePercentDetail}>
                  Giảm&nbsp;
                  {(100 - (product.price / product.price) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          {/* <p className={styles.productCategory}>{title}</p> */}

          <div className="itemPromotions">
            <div className="promotion">
              <p className="couponPrice">
                Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6
                tháng
              </p>
            </div>
          </div>

          <div className={styles.bottomDiv}>
            <div className={styles.itemRating}>
              <div className={styles.iconStar}>
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div className={styles.iconStar}>
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div className={styles.iconStar}>
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div className={styles.iconStar}>
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div className={styles.iconStar}>
                <FontAwesomeIcon icon={faStar} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
};

export default ProductCard;