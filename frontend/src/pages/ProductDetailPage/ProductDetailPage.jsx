import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductDisplay from '../../components/ProductDisplay/ProductDisplay'; // Import component chính
import SpecificationTable from '../../components/SpecificationTable/SpecificationTable'; // Import bảng specs
import Dialog from '../../components/Dialog/Dialog'; // Import Dialog component
import Spinner from '../../components/Spinner/Spinner'; // Import Spinner
import styles from './ProductDetailPage.module.css'; // Import CSS Module của trang
import { FaClipboardList } from 'react-icons/fa'; // Import lại icon

// --- DỮ LIỆU MẪU (Sử dụng tạm thời, sẽ thay bằng API fetch) ---
const sampleProductData = {
    "productId": 3,
    "productName": "Dell XPS 13 Siêu Mỏng Nhẹ - Hiệu Năng Vượt Trội",
    "description": "Trải nghiệm đỉnh cao với Dell XPS 13. Thiết kế kim loại nguyên khối sang trọng, màn hình InfinityEdge viền siêu mỏng sắc nét, cùng cấu hình mạnh mẽ đáp ứng mọi nhu cầu công việc và giải trí.\n\n**Ưu điểm nổi bật:**\n- Thiết kế sang trọng, mỏng nhẹ (chỉ từ 1.17kg).\n- Màn hình hiển thị xuất sắc với viền siêu mỏng.\n- Hiệu năng mạnh mẽ với chip Intel Core thế hệ 12 mới nhất.\n- Thời lượng pin ấn tượng cho cả ngày làm việc.\n- Bàn phím và touchpad chất lượng cao, trải nghiệm gõ tuyệt vời.\n\n*Đây là lựa chọn hoàn hảo cho người dùng chuyên nghiệp, doanh nhân, và những ai yêu thích sự tinh tế, hiệu quả trong công việc và cuộc sống.*",
    "weight": 1.2,
    "price": 25676004,
    "supportRushOrder": true,
    "rating": 4.7,
    "reviewCount": 132,
    "variants": [
      { "variantId": 109, "color": "Bạc Ánh Kim (Silver)", "imageUrl": "https://via.placeholder.com/600x600/E3E4E6/8A8A8D?text=XPS+13+Silver", "stockQuantity": 26, "discount": 6.48 },
      { "variantId": 110, "color": "Trắng Bạch Kim (Platinum White)", "imageUrl": "https://via.placeholder.com/600x600/F5F5F5/444444?text=XPS+13+White", "stockQuantity": 47, "discount": 11.8 },
      { "variantId": 111, "color": "Vàng Hồng (Rose Gold)", "imageUrl": "https://via.placeholder.com/600x600/E4CFC0/6A4C4C?text=XPS+13+RoseGold", "stockQuantity": 15, "discount": 5.0 },
      { "variantId": 112, "color": "Đen Carbon (Carbon Black)", "imageUrl": "https://via.placeholder.com/600x600/333333/EEEEEE?text=XPS+13+Black", "stockQuantity": 0, "discount": 10.0 }
    ],
    "specifications": { // Thêm dữ liệu specs
        "summary": [], // Phần summary không dùng nữa nhưng giữ lại cấu trúc
        "full": [ // Dữ liệu đầy đủ cho bảng specs
            { group: "Bộ xử lý", items: [
                { label: "CPU", value: "Intel® Core™ i5-1230U (upto 4.4GHz, 12MB) / Intel® Core™ i7-1250U (upto 4.7GHz, 12MB)" },
                { label: "Số nhân / luồng", value: "10 nhân (2 P-core + 8 E-core) / 12 luồng" },
                { label: "Công nghệ CPU", value: "Thế hệ 12 (Alder Lake)" },
            ]},
            { group: "Bộ nhớ RAM, Ổ cứng", items: [
                { label: "RAM", value: "8GB / 16GB LPDDR5 5200 MHz (Onboard - không nâng cấp được)" },
                { label: "Loại ổ cứng", value: "SSD NVMe PCIe Gen4" },
                { label: "Dung lượng ổ cứng", value: "256GB / 512GB / 1TB (Tùy chọn cấu hình)" },
            ]},
            { group: "Màn hình", items: [
                { label: "Kích thước", value: "13.4 inch" },
                { label: "Tỷ lệ", value: "16:10" },
                { label: "Độ phân giải", value: "FHD+ (1920 x 1200) hoặc 3.5K (3456x2160) OLED" },
                { label: "Tần số quét", value: "60Hz" },
                { label: "Độ sáng", value: "500 nits" },
                { label: "Công nghệ", value: "InfinityEdge viền siêu mỏng, Anti-Glare (chống chói - bản FHD+), Touch (cảm ứng - bản OLED), Eyesafe® (giảm ánh sáng xanh)" },
                { label: "Độ phủ màu", value: "100% sRGB (FHD+), 100% DCI-P3 (OLED)" },
            ]},
            { group: "Đồ họa và Âm thanh", items: [
                { label: "Card đồ họa", value: "Intel® Iris® Xe Graphics (Tích hợp)" },
                { label: "Âm thanh", value: "Loa Stereo (2 loa x 2W), công nghệ Waves MaxxAudio® Pro" },
            ]},
            { group: "Cổng kết nối & Tính năng mở rộng", items: [
                { label: "Cổng giao tiếp", value: "2 x Thunderbolt™ 4 (USB Type-C™) hỗ trợ Power Delivery và DisplayPort" },
                { label: "Adapter kèm theo", value: "USB-C to USB-A 3.0, USB-C to 3.5mm headset" },
                { label: "Kết nối không dây", value: "Wi-Fi 6E (Intel Killer™ AX1675) + Bluetooth 5.2" },
                { label: "Webcam", value: "HD 720p RGB + IR camera (hỗ trợ Windows Hello)" },
                { label: "Đèn bàn phím", value: "Có, màu trắng" },
                { label: "Bảo mật vân tay", value: "Có (Tích hợp vào nút nguồn)" },
            ]},
            { group: "Kích thước & Trọng lượng", items: [
                { label: "Kích thước (Dài x Rộng x Dày)", value: "295.4 mm x 199.4 mm x 13.99 mm" },
                { label: "Trọng lượng", value: "Khoảng 1.17 kg" },
                { label: "Chất liệu", value: "Nhôm nguyên khối CNC" },
            ]},
            { group: "Thông tin khác", items: [
                { label: "Pin", value: "3 Cell, 51 Wh Lithium-Ion" },
                { label: "Bộ sạc", value: "USB-C 45W" },
                { label: "Hệ điều hành", value: "Windows 11 Home / Pro (Bản quyền)" },
            ]},
        ]
    }
};
// Tính giá cuối cùng
sampleProductData.variants = sampleProductData.variants.map(variant => {
    const discountMultiplier = (100 - (variant.discount || 0)) / 100;
    const finalPrice = sampleProductData.price * discountMultiplier;
    return { ...variant, finalPrice: finalPrice, basePrice: sampleProductData.price };
});
// --- KẾT THÚC DỮ LIỆU MẪU ---


const ProductDetailPage = () => {
  // const { productId } = useParams(); // Dùng khi fetch API
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpecDialogOpen, setIsSpecDialogOpen] = useState(false); // State cho dialog specs
  // const [error, setError] = useState(null); // Dùng khi fetch API

  // Effect để load data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setProduct(sampleProductData); // Gán dữ liệu mẫu
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

   // Hàm mở/đóng dialog
   const openSpecDialog = () => setIsSpecDialogOpen(true);
   const closeSpecDialog = () => setIsSpecDialogOpen(false);

  // --- Render Loading ---
  if (loading) {
    return (
      <div className={styles.pageContainer} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="large" />
      </div>
    );
  }

  // --- Render Error / Not Found ---
  if (!product) {
     return (
       <div className={`${styles.pageContainer} ${styles.errorContainer}`}>
         <p className={styles.errorMessage}>Không tìm thấy thông tin sản phẩm.</p>
         <Link to="/products" className={styles.backLink}>Quay lại danh sách</Link>
       </div>
     );
  }

  // Kiểm tra xem có dữ liệu specs đầy đủ không
  const hasFullSpecs = product.specifications?.full && product.specifications.full.length > 0;

  // --- Render Nội dung chính ---
  return (
    <> {/* Bọc bởi Fragment để chứa Dialog */}
      <div className={styles.pageContainer}>
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className={styles.breadcrumbs}>
           <Link to="/">Trang chủ</Link> <span>›</span>
           <Link to="/products">Laptop</Link> <span>›</span> {/* Thay bằng category thật */}
           <span>{product.productName}</span>
        </nav>

        {/* Component hiển thị Ảnh, Giá, Màu, Nút Mua */}
        <ProductDisplay product={product} />

        {/* --- KHU VỰC NỘI DUNG CHI TIẾT (Mô tả + Specs) --- */}
        <div className={styles.detailsColumns}>

          {/* === CỘT TRÁI: MÔ TẢ SẢN PHẨM === */}
          <div className={styles.descriptionColumn}>
            {product.description && (
              <section className={styles.extraSection}>
                  <h2 className={styles.sectionTitle}>Mô tả sản phẩm</h2>
                  <div className={styles.descriptionContent}>
                      {product.description.split('\n').map((paragraph, index) => (
                          <p key={index} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') || '\u00A0' }} />
                      ))}
                  </div>
              </section>
            )}
             {!product.description && (
                 <section className={styles.extraSection}>
                    <h2 className={styles.sectionTitle}>Mô tả sản phẩm</h2>
                    <p>Thông tin mô tả sản phẩm đang được cập nhật.</p>
                </section>
             )}
          </div>

          {/* === CỘT PHẢI: THÔNG SỐ KỸ THUẬT (PREVIEW + DIALOG) === */}
          <div className={styles.specsColumn}>
            {hasFullSpecs && (
              <section className={`${styles.extraSection} ${styles.specsSection}`}>
                <h2 className={styles.sectionTitle}>Thông số kỹ thuật</h2>
                {/* Container giới hạn chiều cao */}
                <div className={styles.specsPreviewContainer}>
                   {/* Bảng specs đầy đủ (CSS sẽ ẩn phần thừa) */}
                  <SpecificationTable specs={product.specifications} type="full" />
                   {/* Lớp phủ mờ dần */}
                   <div className={styles.fadeOverlay}></div>
                   {/* Nút xem thêm */}
                   <button onClick={openSpecDialog} className={styles.viewFullSpecsButton}>
                      <FaClipboardList /> Xem đầy đủ
                   </button>
                </div>
              </section>
            )}
            {!hasFullSpecs && (
                  <section className={styles.extraSection}>
                       <h2 className={styles.sectionTitle}>Thông số kỹ thuật</h2>
                       <p>Thông số kỹ thuật chi tiết đang được cập nhật.</p>
                  </section>
             )}
          </div>

        </div>
        {/* --- KẾT THÚC KHU VỰC 2 CỘT --- */}

        {/* Section Đánh giá (Tùy chọn) */}
        {/* <section id="reviews" className={styles.extraSection}> ... </section> */}
      </div>

      {/* --- DIALOG HIỂN THỊ SPECS ĐẦY ĐỦ --- */}
      {hasFullSpecs && (
          <Dialog
            isOpen={isSpecDialogOpen}
            onClose={closeSpecDialog}
            title={`Thông số kỹ thuật - ${product.productName}`}
          >
            <SpecificationTable specs={product.specifications} type="full" />
          </Dialog>
      )}
    </>
  );
};

export default ProductDetailPage;