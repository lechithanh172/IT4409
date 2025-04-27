import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductDisplay from '../../components/ProductDisplay/ProductDisplay';
import SpecificationTable from '../../components/SpecificationTable/SpecificationTable';
import Dialog from '../../components/Dialog/Dialog';
import Spinner from '../../components/Spinner/Spinner';
import styles from './ProductDetailPage.module.css';
import { FaClipboardList } from 'react-icons/fa';
import apiService from '../../services/api'; // Đảm bảo đường dẫn đúng
import { transformSpecifications } from '../../utils/transformSpecifications'; // Đảm bảo đường dẫn đúng và file tồn tại
import Button from '../../components/Button/Button';

// --- HÀM CHUYỂN ĐỔI SPECS (Đảm bảo hàm này tồn tại, có thể đặt ở utils) ---
// const transformSpecifications = (flatSpecs) => { ... }; // Code hàm đã cung cấp ở trên

const ProductDetailPage = () => {
  const { productId } = useParams(); // Lấy ID sản phẩm từ URL
  const [product, setProduct] = useState(null); // State lưu trữ dữ liệu sản phẩm
  const [loading, setLoading] = useState(true); // State quản lý trạng thái loading
  const [error, setError] = useState(null);     // State quản lý lỗi fetch
  const [isSpecDialogOpen, setIsSpecDialogOpen] = useState(false); // State cho dialog specs

  // useEffect để fetch dữ liệu khi productId thay đổi
  useEffect(() => {
    // Reset trạng thái trước mỗi lần fetch
    setLoading(true);
    setError(null);
    setProduct(null);

    // Hàm bất đồng bộ để fetch và xử lý dữ liệu
    const loadProductDetails = async () => {
      // Kiểm tra productId hợp lệ
      if (!productId || isNaN(parseInt(productId))) { // Thêm kiểm tra isNaN
        setError("ID sản phẩm không hợp lệ.");
        setLoading(false);
        return;
      }

      try {
        console.log(`[ProductDetailPage] Fetching product details for ID: ${productId}`);
        // 1. Gọi API lấy thông tin sản phẩm chính
        const productResponse = await apiService.getProductById(productId);
        console.log("[ProductDetailPage] API Product Data Response:", productResponse);

        // Kiểm tra response và data có hợp lệ không
        if (productResponse?.data && typeof productResponse.data === 'object') {
          const productData = productResponse.data;
          let transformedSpecs = null; // Khởi tạo specs
          let flatSpecs = null;        // Khởi tạo specs phẳng

          // 2. Xử lý trường specifications (có thể là chuỗi JSON hoặc null)
          if (typeof productData.specifications === 'string') {
            console.log("[ProductDetailPage] Parsing specifications JSON string...");
            try {
              // Parse chuỗi JSON (bọc trong []) thành mảng JavaScript
              flatSpecs = JSON.parse(`[${productData.specifications}]`);
              console.log("[ProductDetailPage] Parsed flat specs:", flatSpecs);
            } catch (parseError) {
              console.error("[ProductDetailPage] Lỗi parse JSON specifications:", parseError);
              flatSpecs = null; // Đặt là null nếu parse lỗi
              // Có thể set lỗi riêng cho specs nếu muốn: setError("Lỗi định dạng thông số kỹ thuật.");
            }
          } else if (productData.specifications === null || productData.specifications === undefined) {
             console.log("[ProductDetailPage] Specifications field is null or undefined.");
             flatSpecs = null; // Giữ nguyên là null
          } else {
             // Log cảnh báo nếu định dạng không mong đợi
             console.warn("[ProductDetailPage] Specifications field received in unexpected format:", productData.specifications);
             flatSpecs = null; // Bỏ qua specs nếu định dạng lạ
          }

          // 3. Chuyển đổi specs phẳng nếu có dữ liệu
          if(flatSpecs) {
             transformedSpecs = transformSpecifications(flatSpecs);
             console.log("[ProductDetailPage] Transformed Specs:", transformedSpecs);
          }

          // 4. Tạo object product cuối cùng
          const finalProductData = {
            ...productData, // Giữ lại thông tin gốc từ API
            specifications: transformedSpecs // Gán specs đã xử lý
          };

          // 5. Tính toán giá finalPrice/basePrice cho variants
          if (finalProductData.variants && Array.isArray(finalProductData.variants) && typeof finalProductData.price === 'number') {
              finalProductData.variants = finalProductData.variants.map(variant => {
                  // Tính giá sau khi áp dụng discount
                  const discountMultiplier = (100 - (variant.discount || 0)) / 100;
                  const finalPrice = finalProductData.price * discountMultiplier;
                  return {
                      ...variant, // Giữ lại các trường khác của variant
                      finalPrice: Math.round(finalPrice), // Làm tròn giá cuối
                      basePrice: finalProductData.price   // Giữ giá gốc
                  };
              });
          } else {
               console.warn("[ProductDetailPage] Product data missing 'variants' or valid 'price' for price calculation.");
               finalProductData.variants = finalProductData.variants || []; // Đảm bảo variants là mảng
          }

          console.log("[ProductDetailPage] Final product data set to state:", finalProductData);
          setProduct(finalProductData); // Cập nhật state

        } else {
           // Trường hợp API trả về thành công nhưng data không hợp lệ
           console.error("[ProductDetailPage] Invalid product data structure from API:", productResponse);
           setError("Dữ liệu sản phẩm nhận được không hợp lệ.");
           setProduct(null);
        }

      } catch (err) { // Bắt lỗi từ axios (network, 404, 500,...)
         console.error("[ProductDetailPage] Error fetching product details:", err);
         if (err.response?.status === 404) {
            setError(`Sản phẩm với ID "${productId}" không được tìm thấy.`);
         } else if (err.message === 'Network Error') {
             setError("Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền và thử lại.");
         } else {
            // Lỗi khác từ server hoặc lỗi không xác định
            setError(err.response?.data?.message || err.message || "Không thể tải thông tin sản phẩm.");
         }
         setProduct(null); // Đảm bảo product là null khi có lỗi
      } finally {
        setLoading(false); // Luôn tắt loading sau khi hoàn tất
      }
    };

    loadProductDetails(); // Gọi hàm fetch khi component mount hoặc productId thay đổi
  }, [productId]); // Dependency array chỉ chứa productId

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
         <Link to="/products">
             <Button variant="secondary">Quay lại danh sách</Button>
         </Link>
       </div>
     );
  }

  // --- Render nội dung chính khi có dữ liệu ---
  // Kiểm tra lại xem có specs hợp lệ không sau khi đã xử lý
  const hasValidSpecs = product.specifications?.full?.length > 0;

  return (
    // Fragment để chứa cả trang và Dialog (nếu dùng)
    <>
      <div className={styles.pageContainer}>
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className={styles.breadcrumbs}>
           <Link to="/">Trang chủ</Link>
           <span>›</span>
           {/* Link đến trang danh sách sản phẩm chung */}
           <Link to={`/products`}>Sản phẩm</Link>
           {/* Hiển thị category nếu có trong dữ liệu product */}
           {product.category?.categoryName && (
               <>
                   <span>›</span>
                   <Link to={`/products?category=${encodeURIComponent(product.category.categoryName)}`}>
                       {product.category.categoryName}
                   </Link>
               </>
           )}
           <span>›</span>
           {/* Tên sản phẩm là trang hiện tại */}
           <span className={styles.breadcrumbCurrent}>{product.productName}</span>
        </nav>

        {/* Component ProductDisplay để hiển thị ảnh, giá, nút mua... */}
        <ProductDisplay product={product} />

        {/* --- KHU VỰC NỘI DUNG CHI TIẾT (Mô tả + Specs) --- */}
        <div className={styles.detailsColumns}>

          {/* === CỘT TRÁI: MÔ TẢ === */}
          <div className={styles.descriptionColumn}>
            {/* Chỉ render section nếu có mô tả */}
            {product.description ? (
              <section className={styles.extraSection}>
                  <h2 className={styles.sectionTitle}>Mô tả sản phẩm</h2>
                  <div className={styles.descriptionContent}>
                    {/* Xử lý xuống dòng và markdown đơn giản cho <strong> và <em> */}
                    {product.description.split('\n').map((paragraph, index) => (
                        <p key={index} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') || '\u00A0' }} />
                    ))}
                  </div>
              </section>
            ) : (
                 // Hiển thị thông báo nếu không có mô tả
                 <section className={styles.extraSection}>
                    <h2 className={styles.sectionTitle}>Mô tả sản phẩm</h2>
                    <p>Hiện chưa có mô tả chi tiết cho sản phẩm này.</p>
                </section>
             )}
          </div>

          {/* === CỘT PHẢI: THÔNG SỐ KỸ THUẬT === */}
          <div className={styles.specsColumn}>
            {/* Chỉ hiển thị section nếu có specs hợp lệ */}
            {hasValidSpecs ? (
              <section className={`${styles.extraSection} ${styles.specsSection}`}>
                <h2 className={styles.sectionTitle}>Thông số kỹ thuật</h2>
                {/* Container giới hạn chiều cao */}
                <div className={styles.specsPreviewContainer}>
                  {/* Truyền specs đã được chuyển đổi vào bảng */}
                  <SpecificationTable specs={product.specifications} type="full" />
                   {/* Lớp phủ mờ dần ở cuối */}
                   <div className={styles.fadeOverlay}></div>
                   {/* Nút mở dialog xem đầy đủ */}
                   <button onClick={openSpecDialog} className={styles.viewFullSpecsButton}>
                      <FaClipboardList /> Xem đầy đủ
                   </button>
                </div>
              </section>
            ) : ( /* Hiển thị thông báo nếu không có specs */
                  <section className={styles.extraSection}>
                       <h2 className={styles.sectionTitle}>Thông số kỹ thuật</h2>
                       <p>Thông số kỹ thuật chi tiết hiện đang được cập nhật.</p>
                  </section>
             )}
          </div>
        </div>
        {/* --- KẾT THÚC KHU VỰC 2 CỘT --- */}

         {/* Section Đánh giá (Tùy chọn - Có thể thêm component riêng ở đây) */}
         {/* <section id="reviews" className={styles.extraSection}>...</section> */}
      </div>

       {/* --- DIALOG HIỂN THỊ SPECS ĐẦY ĐỦ --- */}
       {/* Chỉ render Dialog nếu có specs hợp lệ */}
       {hasValidSpecs && (
          <Dialog
            isOpen={isSpecDialogOpen} // Trạng thái mở/đóng từ state
            onClose={closeSpecDialog} // Hàm để đóng dialog
            title={`Thông số kỹ thuật chi tiết - ${product.productName}`} // Tiêu đề Dialog
          >
             {/* Nội dung Dialog là bảng specs đầy đủ */}
            <SpecificationTable specs={product.specifications} type="full" />
          </Dialog>
       )}
    </>
  );
};

export default ProductDetailPage;