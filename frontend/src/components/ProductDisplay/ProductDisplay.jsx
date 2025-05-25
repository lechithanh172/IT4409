import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import Button from '../Button/Button';
import styles from './ProductDisplay.module.css';
import { toast } from 'react-toastify';
import Spinner from '../Spinner/Spinner';
import {
  FaStar, FaRegStar, FaStarHalfAlt, FaCartPlus, FaCheck, FaBolt, FaExclamationCircle, FaTag
} from 'react-icons/fa';

import { FiLogIn } from 'react-icons/fi';


const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    return date.toLocaleString('vi-VN', options).replace(',', ' ');
  } catch (error) {
    console.error("Error formatting date:", error);
    return isoString;
  }
};


const COMMENT_TRUNCATE_LIMIT = 200;



const RatingStars = ({ rating = 0, reviewCount = null, isIndividualReview = false }) => {
    const clampedRating = Math.max(0, Math.min(5, rating));
    const fullStars = Math.floor(clampedRating);
    const hasHalfStar = clampedRating > 0 && (clampedRating % 1) >= 0.25 && (clampedRating % 1) < 0.75;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);


     if (isIndividualReview && rating <= 0) {
         return (
             <div className={styles.reviewRatingStars}>
                 <div className={styles.stars}>
                      {[...Array(5)].map((_, i) => <FaRegStar key={`empty-${i}`} className={styles.starIcon} />)}
                 </div>
             </div>
         );
     }

     if (isIndividualReview && rating > 0) {
         return (
              <div className={styles.reviewRatingStars}>
                 <div className={styles.stars}>
                    {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className={styles.starIcon} />)}
                    {hasHalfStar && <FaStarHalfAlt key="half" className={styles.starIcon} />}
                    {[...Array(Math.max(0, emptyStars))].map((_, i) => <FaRegStar key={`empty-${i}`} className={styles.starIcon} />)}
                 </div>
             </div>
         );
     }




    if (!isIndividualReview && (reviewCount === null || reviewCount <= 0)) {
        return <div className={styles.rating}><span className={styles.reviewCount}>Chưa có đánh giá</span></div>;
    }


    return (
      <div className={styles.rating}> {/* Chỉ component rating tổng dùng styles.rating */}
        <div className={styles.stars}>
          {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className={styles.starIcon} />)}
          {hasHalfStar && <FaStarHalfAlt key="half" className={styles.starIcon} />}
          {[...Array(Math.max(0, emptyStars))].map((_, i) => <FaRegStar key={`empty-${i}`} className={styles.starIcon} />)}
        </div>
        {/* Render số lượt đánh giá chỉ cho rating tổng nếu reviewCount > 0 */}
        {/* reviewCount có thể là số 0 ngay cả khi averageRating > 0 nếu API trả về như vậy */}
        {/* Hiển thị count chỉ khi nó > 0 để phù hợp với "Chưa có đánh giá" */}
        {reviewCount > 0 && (

             <a href="#reviews" className={styles.reviewCountLink}>({reviewCount} đánh giá)</a>
        )}
      </div>
    );
};


const ReviewItem = ({ review }) => {

    const [isCommentExpanded, setIsCommentExpanded] = useState(false);

    if (!review) return null;

    const comment = review.rateComment || '';

    const isCommentTooLong = comment.length > COMMENT_TRUNCATE_LIMIT;

    const displayedComment = isCommentTooLong && !isCommentExpanded
        ? comment.substring(0, COMMENT_TRUNCATE_LIMIT) + '...'
        : comment;

    return (
        <div className={styles.reviewItem}>
            <div className={styles.reviewerInfo}>
                 <strong className={styles.reviewerName}>{review.email || 'Người dùng ẩn danh'}</strong>
                <span className={styles.reviewDate}>{formatDateTime(review.ratingDate)}</span>
            </div>
            <RatingStars rating={review.rating} isIndividualReview={true} />
            {/* Hiển thị nội dung đánh giá */}
            <p className={styles.reviewComment}>{displayedComment}</p>
            {/* Hiển thị nút "Xem thêm" nếu comment dài và chưa được mở rộng */}
            {isCommentTooLong && !isCommentExpanded && (
                <button
                    className={styles.viewMoreButton}
                    onClick={() => setIsCommentExpanded(true)}
                >
                    Xem thêm
                </button>
            )}
             {/* Tùy chọn: Nút "Thu gọn" nếu comment đã được mở rộng và dài */}
             {/* {isCommentTooLong && isCommentExpanded && (
                 <button
                     className={styles.viewMoreButton}
                     onClick={() => setIsCommentExpanded(false)}
                 >
                     Thu gọn
                 </button>
             )} */}
        </div>
    );
};


const ProductDescription = ({ description }) => {
    if (!description) return null;

    return (
        <div className={styles.descriptionColumn}>
            <h3 className={styles.detailsHeading}>Mô tả sản phẩm</h3>
             {/* Cẩn thận với dangerouslySetInnerHTML để tránh XSS */}
             {/* <div dangerouslySetInnerHTML={{ __html: description }} /> */}
            <p>{description}</p>
        </div>
    );
};


const TechnicalSpecs = ({ specs }) => {

    if (!specs || !Array.isArray(specs) || specs.length === 0) return null;

    return (
        <div className={styles.specsColumn}>
            <h3 className={styles.detailsHeading}>Thông số kỹ thuật</h3>
            <table className={styles.specsTable}>
                 <tbody>
                    {specs.map((spec, index) => (
                        <tr key={index}>
                            <td className={styles.specName}>{spec.name}:</td>
                            <td className={styles.specValue}>{spec.value}</td>
                        </tr>
                    ))}
                 </tbody>
             </table>
        </div>
    );
};



const ProductDisplay = ({ product }) => {

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();


  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState('');


  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState('');


  const [averageRating, setAverageRating] = useState(0);
  const [averageReviewCount, setAverageReviewCount] = useState(0);



  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitReviewError, setSubmitReviewError] = useState('');


  const fetchProductReviewsData = async (productId) => {
      if (!productId) {
          setReviews([]);
          setAverageRating(0);
          setAverageReviewCount(0);
          setIsLoadingReviews(false);
          setReviewsError('');
          return;
      }

      setIsLoadingReviews(true);
      setReviewsError('');

      try {

          const reviewsResponse = await apiService.getListRateOfProduct(productId);
          console.log("API Get Reviews List Response:", reviewsResponse);
          if (Array.isArray(reviewsResponse.data)) {
               setReviews(reviewsResponse.data);

               setAverageReviewCount(reviewsResponse.data.length);
          } else {
               console.warn("API Get Reviews List returned non-array data:", reviewsResponse.data);
               setReviews([]);
               setAverageReviewCount(0);
          }


          const averageResponse = await apiService.getAverageRateOfProduct(productId);
          console.log("API Get Average Rating Response:", averageResponse);


          if (typeof averageResponse.data === 'number') {
              setAverageRating(averageResponse.data);

          }


          else if (averageResponse.data && typeof averageResponse.data === 'object' && typeof averageResponse.data.averageRating === 'number') {
              setAverageRating(averageResponse.data.averageRating);

              if (typeof averageResponse.data.totalReviews === 'number') {
                  setAverageReviewCount(averageResponse.data.totalReviews);
              }
          }
          else {
               console.warn("API Get Average Rating returned unexpected data format:", averageResponse.data);

          }


      } catch (err) {
        console.error("Lỗi khi fetch đánh giá (list hoặc average):", err);
        let errorMessage = "Không thể tải thông tin đánh giá.";
         if (err.response) {
            console.error("API Error Response (Fetch Reviews):", err.response.data);
            errorMessage = err.response.data?.message || `Lỗi ${err.response.status} khi tải đánh giá.`;
          } else if (err.request) {
            errorMessage = "Không nhận được phản hồi khi tải đánh giá.";
            console.error("API No Response (Fetch Reviews):", err.request);
          } else {
            errorMessage = err.message;
            console.error("API Request Setup Error (Fetch Reviews):", err.message);
          }
        setReviewsError(errorMessage);
        setReviews([]);
        setAverageRating(0);
        setAverageReviewCount(0);
      } finally {
        setIsLoadingReviews(false);
      }
  };



  useEffect(() => {
    fetchProductReviewsData(product?.productId);


    if (product?.variants?.length > 0) {
        const firstAvailableIndex = product.variants.findIndex(v => v.stockQuantity > 0);
        setSelectedVariantIndex(firstAvailableIndex >= 0 ? firstAvailableIndex : 0);
    } else {
        setSelectedVariantIndex(0);
    }


    setNewRating(0);
    setNewComment('');
    setSubmitReviewError('');

  }, [product?.productId, product?.variants]);



  const selectedVariant = (product?.variants && product.variants.length > selectedVariantIndex) ? product.variants[selectedVariantIndex] : null;
  const effectiveVariant = selectedVariant || (product?.variants?.length > 0 ? product.variants[0] : null);



   const handleSelectVariant = (index) => { setSelectedVariantIndex(index); setAddToCartError(''); };

   const handleAddToCart = async () => { /* ... logic ... */
       if (!isAuthenticated) { toast.warn('Vui lòng đăng nhập để thêm sản phẩm!', { position: "bottom-right" }); navigate('/login'); return; }
       if (!user?.userId) { console.error("Add to cart failed: User ID not found."); toast.error("Lỗi: Không thể xác định người dùng.", { position: "bottom-right" }); return; }
       if (!effectiveVariant || effectiveVariant.stockQuantity <= 0 || isAddingToCart) { if (effectiveVariant && effectiveVariant.stockQuantity <= 0) { toast.error('Sản phẩm đã hết hàng!', { position: "bottom-right" }); } return; }
       setIsAddingToCart(true); setAddToCartError('');
       try {
           const cartItemData = { userId: user.userId, productId: product.productId, variantId: effectiveVariant.variantId, quantity: 1, isSelected: true };
           await apiService.addToCart(cartItemData);
           toast.success(`Đã thêm "${product.productName} - ${effectiveVariant.color}" vào giỏ hàng!`, { position: "bottom-right", autoClose: 2500, });
       } catch (err) { console.error("Lỗi khi thêm vào giỏ hàng:", err); let errorMessage = "Thêm vào giỏ hàng thất bại."; if (err.response) { console.error("API Error Response (Add to Cart):", err.response.data); errorMessage = err.response.data?.message || err.response.data || `Lỗi ${err.response.status}`; } else if (err.request) { errorMessage = "Không nhận được phản hồi từ máy chủ khi thêm giỏ hàng."; console.error("API No Response (Add to Cart):", err.request); } else { errorMessage = err.message; console.error("API Request Setup Error (Add to Cart):", err.message); } setAddToCartError(errorMessage); toast.error(errorMessage, { position: "bottom-right" }); } finally { setIsAddingToCart(false); }
   };
   const handleOrderNow = async () => { /* ... logic ... */
       if (!isAuthenticated) { toast.warn('Vui lòng đăng nhập để đặt hàng!', { position: "bottom-right" }); navigate('/login'); return; }
       if (!user?.userId) { console.error("Order now failed: User ID not found."); toast.error("Lỗi: Không thể xác định người dùng.", { position: "bottom-right" }); return; }
       if (!effectiveVariant || effectiveVariant.stockQuantity <= 0 || isAddingToCart) { if (effectiveVariant && effectiveVariant.stockQuantity <= 0) { toast.error('Sản phẩm đã hết hàng, không thể đặt ngay!', { position: "bottom-right" }); } return; }
       setIsAddingToCart(true); setAddToCartError('');
       try {
            const cartItemData = { userId: user.userId, productId: product.productId, variantId: effectiveVariant.variantId, quantity: 1, isSelected: true };
            await apiService.addToCart(cartItemData);
            navigate('/cart');
       } catch(err) { console.error("Lỗi khi thêm vào giỏ (trong Đặt hàng):", err); let errorMessage = "Không thể xử lý đặt hàng."; if (err.response) { console.error("API Error Response (Order Now):", err.response.data); errorMessage = err.response.data?.message || err.response.data || `Lỗi ${err.response.status}`; } else if (err.request) { errorMessage = "Không nhận được phản hồi từ máy chủ."; console.error("API No Response (Order Now):", err.request); } else { errorMessage = err.message; console.error("API Request Setup Error (Order Now):", err.message); } setAddToCartError(errorMessage); toast.error(`Đặt hàng thất bại: ${errorMessage}`, { position: "bottom-right" }); setIsAddingToCart(false); }
   };


   const handleRatingClick = (rating) => { setNewRating(rating); };
   const handleCommentChange = (event) => { setNewComment(event.target.value); };
   const handleSubmitReview = async () => {
       if (!isAuthenticated || !user?.userId) { toast.warn('Vui lòng đăng nhập để gửi đánh giá!', { position: "bottom-right" }); navigate('/login'); return; }
       if (!product?.productId) { toast.error('Lỗi: Không tìm thấy ID sản phẩm để gửi đánh giá.', { position: "bottom-right" }); return; }
       if (newRating === 0) { toast.warn('Vui lòng chọn số sao đánh giá.', { position: "bottom-right" }); return; }
       if (!newComment.trim()) { toast.warn('Vui lòng nhập nội dung đánh giá.', { position: "bottom-right" }); return; }
       if (isSubmittingReview) { console.warn("Already submitting a review."); return; }

       setIsSubmittingReview(true); setSubmitReviewError('');
       try {
           const reviewData = { productId: product.productId, rating: newRating, ratingComment: newComment.trim(), userId: user.userId };
           await apiService.postRate(reviewData);
           toast.success('Đánh giá của bạn đã được gửi thành công!', { position: "bottom-right" });
           setNewRating(0); setNewComment('');

           fetchProductReviewsData(product.productId);
       } catch (err) {
           console.error("Lỗi khi gửi đánh giá:", err);
           let errorMessage = "Gửi đánh giá thất bại.";
            if (err.response) { console.error("API Error Response (Submit Review):", err.response.data); errorMessage = err.response.data?.message || err.response.data || `Lỗi ${err.response.status}`; } else if (err.request) { errorMessage = "Không nhận được phản hồi từ máy chủ khi gửi đánh giá."; console.error("API No Response (Submit Review):", err.request); } else { errorMessage = err.message; console.error("API Request Setup Error (Submit Review):", err.message); }
           setSubmitReviewError(errorMessage); toast.error(errorMessage, { position: "bottom-right" });
       } finally { setIsSubmittingReview(false); }
   };




  if (!product || !product.variants || product.variants.length === 0 || !effectiveVariant) {

    if (isLoadingReviews) {
        return (
            <div className={styles.productDisplayWrapper}>
                <div className={styles.loadingReviews}>
                    <Spinner /> Đang tải thông tin sản phẩm...
                </div>
            </div>
        );
    }

     return (
        <div className={styles.productDisplayWrapper}>
            <p className={styles.errorMessage}>Không tìm thấy thông tin sản phẩm hoặc sản phẩm không có biến thể hợp lệ.</p>
        </div>
     );
  }



  return (
    <div className={styles.productDisplayWrapper}> {/* Wrapper cho toàn bộ nội dung */}

      {/* === KHỐI 1: CỘT TRÁI (ẢNH) VÀ CỘT PHẢI (THÔNG TIN CHÍNH & ACTIONS) === */}
      <div className={styles.productDisplayContainer}> {/* Flex container cho Cột trái (ảnh) và Cột phải (info) */}

        {/* CỘT TRÁI: HÌNH ẢNH SẢN PHẨM */}
        <div className={styles.leftColumn}>
             <div className={styles.imageWrapper}>
                <img
                    src={effectiveVariant.imageUrl || "/images/placeholder-image.png"}
                    alt={`${product.productName} - ${effectiveVariant.color}`}
                    className={styles.mainImage}
                    key={effectiveVariant.variantId}
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src="/images/placeholder-image.png"; }}
                />
                {effectiveVariant.discount > 0 && (
                    <div className={styles.imageDiscountBadge}>
                        <FaTag /> -{effectiveVariant.discount.toFixed(0)}%
                    </div>
                )}
            </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN CHÍNH & ACTIONS */}
        <div className={styles.rightColumn}>
            <h1 className={styles.productName}>{product.productName}</h1>

            {/* HIỂN THỊ ĐÁNH GIÁ TRUNG BÌNH VÀ SỐ LƯỢT NGAY DƯỚI TÊN */}
            {/* Sử dụng state averageRating và averageReviewCount từ API */}
            {/* averageReviewCount được lấy từ độ dài mảng reviews, averageRating từ API average */}
            <RatingStars rating={averageRating} reviewCount={averageReviewCount} isIndividualReview={false} />

            {product.supportRushOrder && (
                <div className={styles.badge} style={{ backgroundColor: '#e6f7ff', color: '#1890ff', borderColor: '#91d5ff'}}>
                    <FaBolt /> Hỗ trợ giao hàng nhanh
                </div>
            )}
             {product.weight && (
                <div className={styles.badge} style={{ backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0'}}>
                    ⚖️ {product.weight} kg
                </div>
             )}

            <hr className={styles.divider} />

            <div className={styles.priceSection}>
                <span className={styles.currentPrice}>{formatCurrency(effectiveVariant.finalPrice)}</span>
                {effectiveVariant.discount > 0 && effectiveVariant.basePrice && effectiveVariant.basePrice > effectiveVariant.finalPrice && (
                    <span className={styles.oldPrice}>{formatCurrency(effectiveVariant.basePrice)}</span>
                )}
            </div>

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
                    disabled={variant.stockQuantity <= 0}
                  >
                    <img
                      src={variant.imageUrl || "/images/placeholder-image.png"}
                      alt={variant.color}
                      className={styles.variantThumb}
                      loading="lazy"
                      onError={(e) => { e.target.style.display='none'; }}
                    />
                    <div className={styles.variantInfo}>
                        <span className={styles.variantColorName}>{variant.color}</span>
                        <span className={styles.variantPriceTag}>{formatCurrency(variant.finalPrice)}</span>
                    </div>
                    {index === selectedVariantIndex && (
                       <FaCheck className={styles.checkmarkIcon} />
                    )}
                    {variant.stockQuantity <= 0 && (
                         <div className={styles.outOfStockOverlay}>Hết hàng</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

             {effectiveVariant.stockQuantity <= 0 && (
                 <p className={styles.variantOutOfStockMsg}>
                     <FaExclamationCircle /> Màu [{effectiveVariant.color}] hiện đã hết hàng. Vui lòng chọn màu khác.
                 </p>
             )}
             {addToCartError && !isAddingToCart && (
                 <p className={`${styles.variantOutOfStockMsg} ${styles.addToCartError}`}>
                     <FaExclamationCircle /> {addToCartError}
                 </p>
             )}

             <div className={styles.actionButtons}>
                    <Button
                        variant="primary"
                        className={styles.orderNowButton}
                        onClick={handleOrderNow}
                        disabled={effectiveVariant.stockQuantity <= 0 || isAddingToCart || !isAuthenticated}
                    >
                         {isAddingToCart ? <Spinner size="small" color="#fff"/> : 'ĐẶT HÀNG' }
                         {!isAddingToCart && <span>Giao hàng tận nơi</span>}
                    </Button>

                    <Button
                        variant="outline"
                        className={styles.addToCartButton}
                        onClick={handleAddToCart}
                        disabled={effectiveVariant.stockQuantity <= 0 || isAddingToCart || !isAuthenticated}
                    >
                        {isAddingToCart ? <Spinner size="small" /> : <FaCartPlus />}
                        <span>{isAddingToCart ? 'Đang xử lý...' : 'Thêm vào giỏ'}</span>
                    </Button>
             </div>
              {!isAuthenticated && (
                   <Button
                      variant="secondary"
                      onClick={() => navigate('/login')}
                      className={styles.loginPromptButton}
                    >
                        <FiLogIn /> Đăng nhập để mua hàng
                   </Button>
              )}
        </div>
      </div> {/* End of .productDisplayContainer */}


      {/* === KHỐI 2: MÔ TẢ VÀ THÔNG SỐ KỸ THUẬT === */}
      {/* Nằm dưới khối 1, chiếm full width */}
      <div className={styles.detailsSection}>
          {/* Truyền dữ liệu mô tả và specs từ product prop */}
          {/* Giả định product có các field description (string) và specs (array of {name, value}) */}
          <ProductDescription description={product.description} />
          <TechnicalSpecs specs={product.specs} />
      </div> {/* End of .detailsSection */}


      {/* === KHỐI 3: HIỂN THỊ ĐÁNH GIÁ CHI TIẾT === */}
      {/* Nằm dưới khối 2, chiếm full width */}
      <div className={styles.reviewsSection} id="reviews">
          {/* Hiển thị số lượng đánh giá trong tiêu đề */}
          {/* Sử dụng averageReviewCount từ state (lấy từ độ dài danh sách reviews) */}
          <h2 className={styles.reviewsHeading}>Đánh giá sản phẩm ({averageReviewCount || 0})</h2>

          {/* Form viết đánh giá */}
          {isAuthenticated && (
              <div className={styles.reviewForm}>
                  <h3 className={styles.reviewFormTitle}>Viết đánh giá của bạn</h3>
                  <div className={styles.starPicker}>
                      {[1, 2, 3, 4, 5].map(star => (
                          <span
                              key={star}
                              className={`${styles.starPickerIcon} ${star <= newRating ? styles.starSelected : ''}`}
                              onClick={() => handleRatingClick(star)}
                          >
                              <FaStar />
                          </span>
                      ))}
                  </div>
                  <textarea
                      className={styles.commentInput}
                      placeholder="Nhập nội dung đánh giá của bạn..."
                      value={newComment}
                      onChange={handleCommentChange}
                      rows={4}
                  />
                   {submitReviewError && (
                       <p className={`${styles.addToCartError} ${styles.submitReviewError}`}>
                           <FaExclamationCircle /> {submitReviewError}
                       </p>
                   )}
                  <Button
                      variant="primary"
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview || newRating === 0 || !newComment.trim()}
                      className={styles.submitReviewButton}
                  >
                       {isSubmittingReview ? <Spinner size="small" color="#fff"/> : 'Gửi đánh giá'}
                  </Button>
              </div>
          )}
          {/* Danh sách các đánh giá đã có */}
          {isLoadingReviews && (
              <div className={styles.loadingReviews}>
                  <Spinner /> Đang tải đánh giá...
              </div>
          )}
          {!isLoadingReviews && reviewsError && (
              <p className={styles.reviewsErrorMessage}>
                  <FaExclamationCircle /> {reviewsError}
              </p>
          )}
          {!isLoadingReviews && !reviewsError && reviews.length === 0 && (
              <p className={styles.noReviewsMessage}>Chưa có đánh giá nào cho sản phẩm này.</p>
          )}
          {/* Hiển thị danh sách nếu có reviews */}
          {!isLoadingReviews && !reviewsError && reviews.length > 0 && (
              <div className={styles.reviewsList}>
                  {reviews.map((review, index) => (

                      <ReviewItem key={`${review.userId}-${review.ratingDate}-${index}`} review={review} />
                  ))}
              </div>
          )}
      </div> {/* End of .reviewsSection */}

    </div>
  );
};

export default ProductDisplay;