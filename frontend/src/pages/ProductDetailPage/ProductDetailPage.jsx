import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductDisplay from '../../components/ProductDisplay/ProductDisplay';


import Dialog from '../../components/Dialog/Dialog';
import Spinner from '../../components/Spinner/Spinner';
import styles from './ProductDetailPage.module.css';
import { FaClipboardList } from 'react-icons/fa';
import apiService from '../../services/api';

import Button from '../../components/Button/Button';
import SpecificationTable from '../../components/SpecificationTable/SpecificationTable';




const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSpecDialogOpen, setIsSpecDialogOpen] = useState(false);
  useEffect(() => {
          document.title = "Chi tiết sản phẩm | HustShop";
      }, []);
  useEffect(() => {
    setLoading(true);
    setError(null);
    setProduct(null);

    const loadProductDetails = async () => {
      if (!productId || isNaN(parseInt(productId))) {
        setError("ID sản phẩm không hợp lệ.");
        setLoading(false);
        return;
      }

      try {
        console.log(`[ProductDetailPage] Fetching product details for ID: ${productId}`);
        const productResponse = await apiService.getProductById(productId);
        console.log("[ProductDetailPage] API Product Data Response:", productResponse);

        if (productResponse?.data && typeof productResponse.data === 'object') {
          let productData = { ...productResponse.data };




          console.log("[ProductDetailPage] Received specifications:", productData.specifications);


          if (productData.variants && Array.isArray(productData.variants) && typeof productData.price === 'number') {
              productData.variants = productData.variants.map(variant => {
                  const discountMultiplier = (100 - (variant.discount || 0)) / 100;

                  const basePriceForVariant = variant.basePrice ?? productData.price;
                  const finalPrice = basePriceForVariant * discountMultiplier;
                  return {
                      ...variant,
                      finalPrice: Math.round(finalPrice),
                      basePrice: basePriceForVariant
                  };
              });
          } else {
               console.warn("[ProductDetailPage] Product data missing 'variants' or valid 'price' for price calculation.");
               productData.variants = productData.variants || [];
          }

          console.log("[ProductDetailPage] Final product data set to state:", productData);
          setProduct(productData);

        } else {
           console.error("[ProductDetailPage] Invalid product data structure from API:", productResponse);
           setError("Dữ liệu sản phẩm nhận được không hợp lệ.");
           setProduct(null);
        }

      } catch (err) {
         console.error("[ProductDetailPage] Error fetching product details:", err);
         if (err.response?.status === 404) { setError(`Sản phẩm với ID "${productId}" không được tìm thấy.`); }
         else if (err.message === 'Network Error') { setError("Lỗi kết nối mạng."); }
         else { setError(err.response?.data?.message || err.message || "Không thể tải thông tin sản phẩm."); }
         setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [productId]);


  const openSpecDialog = () => setIsSpecDialogOpen(true);
  const closeSpecDialog = () => setIsSpecDialogOpen(false);


  if (loading) {
    return (
      <div className={styles.pageContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Spinner size="large" />
      </div>
    );
  }


  if (error || !product) {
     return (
       <div className={`${styles.pageContainer} ${styles.errorContainer}`}>
         <p className={styles.errorMessage}>{error || "Không tìm thấy thông tin sản phẩm."}</p>
         <Link to="/products">
             <Button variant="secondary">Quay lại danh sách</Button>
         </Link>
       </div>
     );
  }



  const hasSpecsData = product.specifications && (typeof product.specifications === 'string' || (Array.isArray(product.specifications) && product.specifications.length > 0));

  return (
    <>
      <div className={styles.pageContainer}>
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className={styles.breadcrumbs}>
           <Link to="/">Trang chủ</Link>
           <span>›</span>
           <Link to={`/products`}>Sản phẩm</Link>
           {/* API response mẫu không có category trong product, nên tạm ẩn */}
           {/* {product.category?.categoryName && (
               <>
                   <span>›</span>
                   <Link to={`/products?category=${encodeURIComponent(product.category.categoryName)}`}>
                       {product.category.categoryName}
                   </Link>
               </>
           )} */}
           <span>›</span>
           <span className={styles.breadcrumbCurrent}>{product.productName}</span>
        </nav>

        {/* Component ProductDisplay để hiển thị ảnh, giá, nút mua... */}
        {/* Truyền product với specifications gốc */}
        <ProductDisplay product={product} />

        {/* --- KHU VỰC NỘI DUNG CHI TIẾT (Mô tả + Specs) --- */}
        <div className={styles.detailsColumns}>

          {/* === CỘT TRÁI: MÔ TẢ === */}
          <div className={styles.descriptionColumn}>
            {product.description ? (
              <section className={styles.extraSection}>
                  <h2 className={styles.sectionTitle}>Mô tả sản phẩm</h2>
                  <div className={styles.descriptionContent}>
                    {product.description.split('\n').map((paragraph, index) => (
                        <p key={index} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') || '\u00A0' }} />
                    ))}
                  </div>
              </section>
            ) : (
                 <section className={styles.extraSection}>
                    <h2 className={styles.sectionTitle}>Mô tả sản phẩm</h2>
                    <p>Chưa có mô tả chi tiết.</p>
                </section>
             )}
          </div>

          {/* === CỘT PHẢI: THÔNG SỐ KỸ THUẬT === */}
          <div className={styles.specsColumn}>
             {/* Kiểm tra trực tiếp prop gốc */}
            {hasSpecsData ? (
              <section className={`${styles.extraSection} ${styles.specsSection}`}>
                <h2 className={styles.sectionTitle}>Thông số kỹ thuật</h2>
                <div className={styles.specsPreviewContainer}>
                   {/* Truyền trực tiếp specifications gốc vào bảng */}
                  <SpecificationTable specs={product.specifications} />
                   <div className={styles.fadeOverlay}></div>
                   <button onClick={openSpecDialog} className={styles.viewFullSpecsButton}>
                      <FaClipboardList /> Xem đầy đủ
                   </button>
                </div>
              </section>
            ) : (
                  <section className={styles.extraSection}>
                       <h2 className={styles.sectionTitle}>Thông số kỹ thuật</h2>
                       <p>Thông số đang được cập nhật.</p>
                  </section>
             )}
          </div>
        </div>
        {/* --- KẾT THÚC KHU VỰC 2 CỘT --- */}

      </div>

       {/* --- DIALOG HIỂN THỊ SPECS ĐẦY ĐỦ --- */}
       {/* Kiểm tra lại hasSpecsData */}
       {hasSpecsData && (
          <Dialog
            isOpen={isSpecDialogOpen}
            onClose={closeSpecDialog}
            title={`Thông số kỹ thuật - ${product.productName}`}
          >
             {/* Truyền trực tiếp specifications gốc vào bảng trong dialog */}
            <SpecificationTable specs={product.specifications} />
          </Dialog>
       )}
    </>
  );
};

export default ProductDetailPage;