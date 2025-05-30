
import React from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import styles from './RatingStars.module.css';

const RatingStars = ({ rating = 0, reviewCount = null, isSmall = false }) => {
    const clampedRating = Math.max(0, Math.min(5, rating));
    const fullStars = Math.floor(clampedRating);

    const hasHalfStar = clampedRating > 0 && (clampedRating % 1) >= 0.25 && (clampedRating % 1) < 0.75;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);


     if (reviewCount !== null && reviewCount <= 0) {
         return <div className={`${styles.rating} ${isSmall ? styles.smallRating : ''}`}><span className={styles.reviewCount}>Chưa có đánh giá</span></div>;
     }


    return (
      <div className={`${styles.rating} ${isSmall ? styles.smallRating : ''}`}>
        <div className={styles.stars}>
          {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className={styles.starIcon} />)}
          {hasHalfStar && <FaStarHalfAlt key="half" className={styles.starIcon} />}
          {[...Array(Math.max(0, emptyStars))].map((_, i) => <FaRegStar key={`empty-${i}`} className={styles.starIcon} />)}
        </div>
        {/* Chỉ hiển thị số lượt đánh giá nếu reviewCount > 0 */}
        {reviewCount !== null && reviewCount > 0 && (
             <span className={styles.reviewCount}>({reviewCount})</span>
        )}
      </div>
    );
};

export default RatingStars;