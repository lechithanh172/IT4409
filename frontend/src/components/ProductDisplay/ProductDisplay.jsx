// import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import Button from "../Button/Button";
import styles from "./ProductDisplay.module.css";

import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCartPlus,
  FaCheck,
} from "react-icons/fa";

const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const RatingStars = ({ rating, reviewCount }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={styles.rating}>
      <div className={styles.stars}>
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className={styles.starIcon} />
        ))}
        {hasHalfStar && (
          <FaStarHalfAlt key="half" className={styles.starIcon} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className={styles.starIcon} />
        ))}
      </div>
      {reviewCount > 0 && (
        <span className={styles.reviewCount}>({reviewCount} đánh giá)</span>
      )}
    </div>
  );
};

const ProductDisplay = ({ product }) => {
  const { addItemToCart } = useCart();
  const navigate = useNavigate();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const selectedVariant = product.variants[selectedVariantIndex];
  const currentImages = selectedVariant.images;

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedVariantIndex]);

  const handleSelectVariant = (index) => {
    setSelectedVariantIndex(index);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? currentImages.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === currentImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      productId: product.id,
      sku: selectedVariant.sku,
      name: product.name,
      variantName: selectedVariant.colorName,
      price: selectedVariant.price,
      image: selectedVariant.images[0],
      quantity: 1,
    };
    addItemToCart(itemToAdd);
    alert(
      `Đã thêm "${product.name} - ${selectedVariant.colorName}" vào giỏ hàng!`
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  return (
    <div className={styles.productDisplayContainer}>
      <div className={styles.leftColumn}>
        <div className={styles.galleryContainer}>
          <div className={styles.mainImageWrapper}>
            <img
              src={currentImages[currentImageIndex]}
              alt={`${product.name} - ${selectedVariant.colorName} - Ảnh ${currentImageIndex + 1
                }`}
              className={styles.mainImage}
              key={currentImages[currentImageIndex]}
            />
            {currentImages.length > 1 && (
              <>
                <button
                  className={`${styles.navButton} ${styles.prevButton}`}
                  onClick={handlePrevImage}
                  aria-label="Ảnh trước"
                >
                  <FaChevronLeft />
                </button>
                <button
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={handleNextImage}
                  aria-label="Ảnh kế tiếp"
                >
                  <FaChevronRight />
                </button>
              </>
            )}
          </div>

          {currentImages.length > 1 && (
            <div className={styles.thumbnailList}>
              {currentImages.map((imgSrc, index) => (
                <button
                  key={index}
                  className={`${styles.thumbnailItem} ${index === currentImageIndex ? styles.activeThumbnail : ""
                    }`}
                  onClick={() => handleThumbnailClick(index)}
                  aria-label={`Xem ảnh ${index + 1}`}
                >
                  <img src={imgSrc} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.rightColumn}>
        <h1 className={styles.productName}>{product.name}</h1>
        <RatingStars
          rating={product.rating}
          reviewCount={product.reviewCount}
        />
        <hr className={styles.divider} />

        <div className={styles.variantSelector}>
          <p className={styles.selectorTitle}>
            Chọn màu sắc: <strong>{selectedVariant.colorName}</strong>
          </p>
          <ul className={styles.variantList}>
            {product.variants.map((variant, index) => (
              <li
                key={variant.sku}
                className={`${styles.variantItem} ${index === selectedVariantIndex ? styles.selectedVariant : ""
                  }`}
                onClick={() => handleSelectVariant(index)}
                title={variant.colorName}
              >
                <img
                  src={variant.thumbnail}
                  alt={variant.colorName}
                  className={styles.variantThumbnail}
                />
                <span className={styles.variantName}>{variant.colorName}</span>
                <span className={styles.variantPrice}>
                  {formatCurrency(variant.price)}
                </span>
                {index === selectedVariantIndex && (
                  <FaCheck className={styles.checkmarkIcon} />
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.priceBox}>
          <span className={styles.currentPrice}>
            {formatCurrency(selectedVariant.price)}
          </span>
          {selectedVariant.oldPrice &&
            selectedVariant.oldPrice > selectedVariant.price && (
              <span className={styles.oldPrice}>
                {formatCurrency(selectedVariant.oldPrice)}
              </span>
            )}
          {selectedVariant.oldPrice &&
            selectedVariant.oldPrice > selectedVariant.price && (
              <span className={styles.discountBadge}>
                -
                {Math.round(
                  ((selectedVariant.oldPrice - selectedVariant.price) /
                    selectedVariant.oldPrice) *
                  100
                )}
                %
              </span>
            )}
        </div>

        <div className={styles.actionButtons}>
          <Button
            variant="primary"
            className={styles.buyNowButton}
            onClick={handleBuyNow}
            disabled={selectedVariant.stock <= 0}
          >
            <strong>MUA NGAY</strong>
            <span>Giao hàng tận nơi hoặc nhận tại cửa hàng</span>
          </Button>
          <Button
            variant="secondary"
            className={styles.addToCartButton}
            onClick={handleAddToCart}
            disabled={selectedVariant.stock <= 0}
          >
            <FaCartPlus className={styles.cartIcon} />
            <span>Thêm vào giỏ</span>
          </Button>
        </div>
        {selectedVariant.stock <= 0 && (
          <p className={styles.outOfStockMessage}>Sản phẩm tạm hết hàng</p>
        )}
      </div>
    </div>
  );
};

export default ProductDisplay;