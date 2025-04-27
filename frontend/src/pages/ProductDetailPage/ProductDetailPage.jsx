import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProductDisplay from '../../components/ProductDisplay/ProductDisplay';           // Component hiển thị ảnh, giá, nút mua
import SpecificationTable from '../../components/SpecificationTable/SpecificationTable'; // Component bảng thông số
import Dialog from '../../components/Dialog/Dialog';                       // Component Dialog
import Spinner from '../../components/Spinner/Spinner';                   // Component Loading
import styles from './ProductDetailPage.module.css';                     // CSS cho trang này
import { FaClipboardList } from 'react-icons/fa';                      // Icon cho nút xem thêm
import apiService from '../../services/api';                     // Service gọi API
import { transformSpecifications } from '../../utils/transformSpecifications';     // Hàm chuyển đổi specs (cần tạo file này)
import Button from '../../components/Button/Button';                   // Import Button component


// --- KẾT THÚC HÀM CHUYỂN ĐỔI ---

const ProductDetailPage = () => {
  const { productId } = useParams(); // Lấy ID sản phẩm từ URL
  const navigate = useNavigate();     // Hook để điều hướng
  const [product, setProduct] = useState(null); // State lưu trữ dữ liệu sản phẩm hoàn chỉnh
  const [loading, setLoading] = useState(true); // State quản lý trạng thái loading
  const [error, setError] = useState(null);     // State quản lý lỗi
  const [isSpecDialogOpen, setIsSpecDialogOpen] = useState(false); // State cho dialog specs

  // useEffect để fetch dữ liệu khi productId thay đổi
  useEffect(() => {
    // Reset trạng thái khi bắt đầu fetch mới
    setLoading(true);
    setError(null);
    setProduct(null);

    // Hàm bất đồng bộ để fetch và xử lý dữ liệu
    const loadProductDetails = async () => {
      // Kiểm tra productId hợp lệ
      if (!productId) {
        setError("ID sản phẩm không hợp lệ.");
        setLoading(false);
        return;
      }

      try {
        console.log(`[ProductDetailPage] Fetching product details for ID: ${productId}`);
        // 1. Gọi API lấy thông tin sản phẩm chính
        const productResponse = await apiService.getProductById(productId);
        console.log("[ProductDetailPage] API Product Data Response:", productResponse);

        // Kiểm tra xem API có trả về dữ liệu hợp lệ không
        if (productResponse?.data && typeof productResponse.data === 'object') {
          const productData = productResponse.data;
          let transformedSpecs = null; // Khởi tạo specs đã chuyển đổi là null
          let flatSpecs = null; // Khởi tạo specs phẳng

          // 2. *** XỬ LÝ TRƯỜNG specifications LÀ CHUỖI JSON HOẶC NULL ***
          if (typeof productData.specifications === 'string') {
            console.log("[ProductDetailPage] Parsing specifications JSON string...");
            try {
              // Cần bọc chuỗi trong [] để tạo mảng JSON hợp lệ trước khi parse
              flatSpecs = JSON.parse(`[${productData.specifications}]`);
              console.log("[ProductDetailPage] Parsed flat specs:", flatSpecs);
            } catch (parseError) {
              console.error("[ProductDetailPage] Lỗi parse JSON specifications:", parseError);
              flatSpecs = null; // Đặt là null nếu parse lỗi
            }
          } else if (productData.specifications === null || productData.specifications === undefined) {
             console.log("[ProductDetailPage] Specifications field is null or undefined.");
             flatSpecs = null;
          } else {
             console.warn("[ProductDetailPage] Specifications field received in unexpected format:", productData.specifications);
             flatSpecs = null; // Bỏ qua nếu định dạng không mong muốn
          }

          // 3. Chuyển đổi specs phẳng nếu lấy được
          if(flatSpecs) {
             transformedSpecs = transformSpecifications(flatSpecs);
             console.log("[ProductDetailPage] Transformed Specs:", transformedSpecs);
          }

          // 4. Tạo object product cuối cùng để lưu vào state
          const finalProductData = {
            ...productData, // Giữ lại tất cả thông tin từ API
            specifications: transformedSpecs // Gán specs đã xử lý (có thể là null)
          };

          // 5. Tính toán lại giá finalPrice/basePrice cho variants (quan trọng!)
          if (finalProductData.variants && typeof finalProductData.price === 'number') {
              finalProductData.variants = finalProductData.variants.map(variant => {
                  const discountMultiplier = (100 - (variant.discount || 0)) / 100;
                  const finalPrice = finalProductData.price * discountMultiplier;
                  return {
                      ...variant,
                      finalPrice: Math.round(finalPrice), // Làm tròn giá cuối cùng
                      basePrice: finalProductData.price // Giữ giá gốc
                  };
              });
          } else {
               console.warn("[ProductDetailPage] Product data missing 'variants' or valid 'price' for final price calculation.");
               finalProductData.variants = finalProductData.variants || [];
          }

          console.log("[ProductDetailPage] Final product data set to state:", finalProductData);
          setProduct(finalProductData); // Cập nhật state

        } else {
           // Trường hợp API trả về 200 OK nhưng data không đúng định dạng
           console.error("[ProductDetailPage] Invalid product data structure received from API:", productResponse);
           setError("Dữ liệu sản phẩm không hợp lệ.");
           setProduct(null);
        }

      } catch (err) { // Bắt lỗi từ apiService (ví dụ: 404, 500, network error)
         console.error("[ProductDetailPage] Error fetching product details:", err);
         if (err.response?.status === 404) {
            setError(`Sản phẩm với ID "${productId}" không tồn tại.`);
         } else if (err.message === 'Network Error') {
             setError("Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền.");
         }
         else {
            setError(err.message || "Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
         }
         setProduct(null); // Đặt product là null khi có lỗi
      } finally {
        setLoading(false); // Kết thúc loading
      }
    };

    loadProductDetails(); // Gọi hàm fetch

  }, [productId]); // Dependency: useEffect sẽ chạy lại nếu productId trên URL thay đổi

  // --- Hàm mở/đóng dialog ---
  const openSpecDialog = () => setIsSpecDialogOpen(true);
  const closeSpecDialog = () => setIsSpecDialogOpen(false);

  // --- Render trạng thái Loading ---
  if (loading) {
    return (
      <div className={styles.pageContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Spinner size="large" />
      </div>
    );
  }

  // --- Render trạng thái Lỗi hoặc Không tìm thấy ---
  if (error || !product) {
     return (
       <div className={`${styles.pageContainer} ${styles.errorContainer}`}>
         <p className={styles.errorMessage}>{error || "Không tìm thấy thông tin sản phẩm."}</p>
         {/* Sử dụng Button component */}
         <Link to="/products">
             <Button variant="secondary">Quay lại danh sách</Button>
         </Link>
       </div>
     );
  }

  // --- Render nội dung chính khi có dữ liệu ---
  // Kiểm tra specs hợp lệ sau khi đã fetch và transform
  const hasValidSpecs = product.specifications?.full?.length > 0;

  return (
    <> {/* Bọc Fragment để chứa Dialog */}
      <div className={styles.pageContainer}>
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className={styles.breadcrumbs}>
           <Link to="/">Trang chủ</Link> <span>›</span>
           {/* Nên có category trong product data để link đúng */}
           <Link to={`/products?category=${product.category?.name || 'all'}`}>Sản phẩm</Link> <span>›</span>
           <span>{product.productName}</span>
        </nav>

        {/* Component ProductDisplay (Ảnh, giá, nút mua...) */}
        {/* Truyền product đã được xử lý */}
        <ProductDisplay product={product} />

        {/* --- KHU VỰC NỘI DUNG CHI TIẾT (Mô tả + Specs) --- */}
        <div className={styles.detailsColumns}>

          {/* === CỘT TRÁI: MÔ TẢ === */}
          <div className={styles.descriptionColumn}>
            {product.description ? (
              <section className={styles.extraSection}>
                  <h2 className={styles.sectionTitle}>Mô tả sản phẩm</h2>
                  <div className={styles.descriptionContent}>
                    {/* Xử lý xuống dòng và markdown đơn giản */}
                    {product.description.split('\n').map((paragraph, index) => (
                        <p key={index} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') || '\u00A0' }} />
                    ))}
                  </div>
              </section>
            ) : (
                 <section className={styles.extraSection}>
                    <h2 className={styles.sectionTitle}>Mô tả sản phẩm</h2>
                    <p>Hiện chưa có mô tả chi tiết cho sản phẩm này.</p>
                </section>
             )}
          </div>

          {/* === CỘT PHẢI: THÔNG SỐ KỸ THUẬT === */}
          <div className={styles.specsColumn}>
            {/* Chỉ hiển thị nếu có specs hợp lệ */}
            {hasValidSpecs ? (
              <section className={`${styles.extraSection} ${styles.specsSection}`}>
                <h2 className={styles.sectionTitle}>Thông số kỹ thuật</h2>
                {/* Container giới hạn chiều cao */}
                <div className={styles.specsPreviewContainer}>
                  {/* Truyền specs đã được chuyển đổi */}
                  <SpecificationTable specs={product.specifications} type="full" />
                   <div className={styles.fadeOverlay}></div>
                   <button onClick={openSpecDialog} className={styles.viewFullSpecsButton}>
                      <FaClipboardList /> Xem đầy đủ
                   </button>
                </div>
              </section>
            ) : ( /* Hiển thị thông báo nếu không có specs */
                  <section className={styles.extraSection}>
                       <h2 className={styles.sectionTitle}>Thông số kỹ thuật</h2>
                       <p>Thông số kỹ thuật chi tiết đang được cập nhật.</p>
                  </section>
             )}
          </div>
        </div>
        {/* --- KẾT THÚC KHU VỰC 2 CỘT --- */}

         {/* Section Đánh giá (Tùy chọn) */}
         {/* <section id="reviews" className={styles.extraSection}>...</section> */}
      </div>

       {/* --- DIALOG HIỂN THỊ SPECS ĐẦY ĐỦ --- */}
       {hasValidSpecs && (
          <Dialog
            isOpen={isSpecDialogOpen}
            onClose={closeSpecDialog}
            title={`Thông số kỹ thuật chi tiết - ${product.productName}`}
          >
             {/* Truyền specs đã được chuyển đổi */}
            <SpecificationTable specs={product.specifications} type="full" />
          </Dialog>
       )}
    </>
  );
};

export default ProductDetailPage;