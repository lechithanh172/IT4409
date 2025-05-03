import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Spin } from 'antd'; // Import Spin để hiển thị loading
import styles from "./ListItem.module.css";
import ProductCard from "../ProductCard/ProductCard.jsx"; // Đảm bảo đường dẫn đúng
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import apiService from "../../services/api.js";

// --- Helper để tìm categoryId (có thể bỏ qua chữ hoa/thường) ---
const findCategoryIdByName = (categories, categoryName) => {
    if (!categories || !categoryName) return null;
    const lowerCaseCategoryName = categoryName.toLowerCase();
    const foundCategory = categories.find(cat => cat.categoryName?.toLowerCase() === lowerCaseCategoryName);
    return foundCategory?.categoryId || null; // Trả về categoryId hoặc null nếu không tìm thấy
};

function ListItem({ category }) { // category là tên danh mục (String) như "Smartphone"
  const [allProducts, setAllProducts] = useState([]); // State lưu trữ TẤT CẢ sản phẩm
  const [allCategories, setAllCategories] = useState([]); // State lưu trữ TẤT CẢ danh mục
  const [popularProducts, setPopularProducts] = useState([]); // State lưu sản phẩm ĐÃ LỌC cho category này
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true); // Loading cho fetch ban đầu
  const [error, setError] = useState(null); // Lỗi fetch ban đầu
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [width, setWidth] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const elementRef = useRef(null);

  // --- Effect 1: Fetch TẤT CẢ sản phẩm và danh mục MỘT LẦN khi component mount ---
  // **** CẢNH BÁO HIỆU SUẤT: Mỗi ListItem sẽ gọi lại API này. Nên fetch ở cha hoặc dùng Context ****
  useEffect(() => {
    const fetchInitialData = async () => {
      console.log(`[ListItem - ${category}] Fetching ALL products and categories... (Inefficient if multiple ListItems exist)`);
      setLoading(true);
      setError(null);
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          apiService.getAllProducts(),
          apiService.getAllCategories()
        ]);

        const fetchedProducts = productResponse?.data || [];
        const fetchedCategories = categoryResponse?.data || [];

        if (!Array.isArray(fetchedProducts)) throw new Error("Dữ liệu sản phẩm không hợp lệ.");
        if (!Array.isArray(fetchedCategories)) throw new Error("Dữ liệu danh mục không hợp lệ.");

        setAllProducts(fetchedProducts);
        setAllCategories(fetchedCategories);
        console.log(`[ListItem - ${category}] Fetched ${fetchedProducts.length} products and ${fetchedCategories.length} categories.`);

      } catch (err) {
        console.error(`[ListItem - ${category}] Error fetching initial data:`, err);
        setError(`Không thể tải dữ liệu cần thiết. ${err.message}`);
        setAllProducts([]);
        setAllCategories([]);
      } finally {
        setLoading(false); // Chỉ tắt loading sau khi fetch xong (thành công hoặc lỗi)
      }
    };
    fetchInitialData();
  }, []); // Dependency rỗng -> chạy 1 lần khi mount

  // --- Effect 2: Lọc sản phẩm và đặt tiêu đề KHI category prop THAY ĐỔI hoặc dữ liệu đã fetch xong ---
  useEffect(() => {
    // Chỉ thực hiện khi đã fetch xong dữ liệu và có category prop
    if (loading || error || !category || allCategories.length === 0 || allProducts.length === 0) {
        // Nếu đang loading hoặc có lỗi fetch ban đầu, hoặc chưa có category, hoặc chưa fetch xong data -> không làm gì cả
        // Có thể reset popularProducts nếu muốn
        // setPopularProducts([]);
        return;
    }

    console.log(`[ListItem - ${category}] Filtering products...`);

    // 1. Đặt Tiêu đề
    let displayTitle = category.toUpperCase() + " NỔI BẬT";
      switch (category) {
         case "Laptop": displayTitle = "LAPTOP NỔI BẬT"; break;
         case "Tablet": displayTitle = "MÁY TÍNH BẢNG NỔI BẬT"; break;
         case "Smartphone": displayTitle = "ĐIỆN THOẠI NỔI BẬT"; break;
         case "Accessory": displayTitle = "PHỤ KIỆN MÁY TÍNH NỔI BẬT"; break;
         case "Monitor": displayTitle = "MÀN HÌNH NỔI BẬT"; break;
         case "Printer": displayTitle = "MÁY IN NỔI BẬT"; break;
         case "Router": displayTitle = "THIẾT BỊ MẠNG NỔI BẬT"; break;
         case "Speaker": displayTitle = "LOA ÂM THANH NỔI BẬT"; break;
         case "Camera": displayTitle = "MÁY ẢNH & CAMERA NỔI BẬT"; break;
         case "Smartwatch": displayTitle = "ĐỒNG HỒ THÔNG MINH NỔI BẬT"; break;
         default: break;
      }
      setTitle(displayTitle);

    // 2. Tìm categoryId tương ứng
    // **** Quan trọng: Đảm bảo tên trường 'categoryName' và 'categoryId' khớp với API của bạn ****
    const targetCategoryId = findCategoryIdByName(allCategories, category);
    console.log(`[ListItem - ${category}] Target Category ID for "${category}":`, targetCategoryId);

    if (targetCategoryId === null) {
      console.warn(`[ListItem - ${category}] Category name "${category}" not found in fetched categories.`);
      setPopularProducts([]); // Không tìm thấy category -> không có sản phẩm
      return;
    }

    // 3. Lọc danh sách sản phẩm
    // **** Quan trọng: Đảm bảo tên trường 'categoryId' trong object sản phẩm khớp với API ****
    const filteredProducts = allProducts.filter(product => product.categoryId === targetCategoryId);
    console.log(`[ListItem - ${category}] Found ${filteredProducts.length} products for Category ID ${targetCategoryId}.`);

    setPopularProducts(filteredProducts); // Cập nhật state với sản phẩm đã lọc
    setIndex(0); // Reset slider về đầu khi đổi category

  // Phụ thuộc vào category prop và dữ liệu đã fetch (allProducts, allCategories) và trạng thái loading/error
  }, [category, allProducts, allCategories, loading, error]);

  // --- Effect 3: Slider calculations (Giữ nguyên logic cũ, nhưng phụ thuộc vào popularProducts) ---
  useEffect(() => {
    const handleOffset = () => {
      const element = elementRef.current;
      let containerWidth;
      let calculatedMaxIndex = 0;

      // Chỉ tính toán nếu có sản phẩm để hiển thị
      if (popularProducts.length > 0) {
          if (window.innerWidth > 1200) {
            setOffset(index * 305);
            calculatedMaxIndex = popularProducts.length > 4 ? popularProducts.length - 4 : 0;
          } else if (window.innerWidth > 990) {
            setOffset(index * (width / 3));
            calculatedMaxIndex = popularProducts.length > 4 ? popularProducts.length - 4 : 0;
          } else if (window.innerWidth > 717) {
            setOffset(index * (width / 3 + 3.33333));
            calculatedMaxIndex = popularProducts.length > 3 ? popularProducts.length - 3 : 0;
          } else {
            setOffset(index * (width / 2 + 5));
            calculatedMaxIndex = popularProducts.length > 2 ? popularProducts.length - 2 : 0;
          }
      } else {
          // Nếu không có sản phẩm, reset offset và maxIndex
          setOffset(0);
          calculatedMaxIndex = 0;
      }

      setMaxIndex(calculatedMaxIndex);

      if (element) {
        containerWidth = element.offsetWidth;
        setWidth(containerWidth);
      }
    };

    // Chỉ chạy handleOffset khi không loading và có elementRef
    if (!loading && elementRef.current) {
       handleOffset();
    }

    window.addEventListener("resize", handleOffset);
    return () => window.removeEventListener("resize", handleOffset);
  // Phụ thuộc vào index, width, và QUAN TRỌNG là popularProducts.length
  }, [index, width, popularProducts.length, loading]);


  // --- Effect 4: Index correction (Giữ nguyên) ---
  useEffect(() => {
    if (index < -maxIndex && index !== 0) { setIndex(0); }
    if (index > 0) { setIndex(0); }
  }, [maxIndex, index]);

  // --- Render Logic ---
  if (loading) { // Chỉ hiển thị loading ban đầu
    return (
      <div className={styles.popular}>
        <div className={styles.popularTitle}>
             <h2>{category.toUpperCase()} NỔI BẬT</h2> {/* Hiển thị title tạm thời */}
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
             <Spin size="large" /> {/* Hiển thị Spin */}
        </div>
      </div>
    );
  }

  if (error) { // Hiển thị lỗi nếu fetch ban đầu thất bại
     return (
      <div className={styles.popular}>
        <div className={styles.popularTitle}>
          {/* Link có thể không hoạt động đúng nếu không có categoryId */}
          <Link to={`/products?category=${category}`} className={styles.title}>
             <h2>{title || category.toUpperCase()}</h2>
          </Link>
        </div>
        <p style={{ color: "red" }}>Lỗi: {error}</p>
      </div>
    );
  }

  // --- Render khi đã có dữ liệu (kể cả khi không có sản phẩm nào) ---
  return (
    <div className={styles.popular}>
      <div className={styles.popularTitle}>
        {/* Sử dụng category prop cho Link, hoặc bạn có thể tìm lại categoryId nếu cần URL chính xác */}
        <Link to={`/products?category=${category}`} className={styles.title}>
          <h2>{title}</h2>
        </Link>
      </div>

      {popularProducts.length > 0 ? ( // Chỉ hiển thị slider nếu có sản phẩm
        <div className={styles.productList}>
          <div className={styles.productListSwipper}>
            <div className={styles.swiperContainer}>
              <div
                className={styles.productList}
                ref={elementRef}
                style={{
                  transform: `translateX(${offset}px)`,
                  transitionDuration: "300ms",
                  display: 'flex' // Đảm bảo flex layout cho slider
                }}
              >
                {popularProducts.map((product) => (
                  <div className={styles.listItem} key={product.productId}>
                    {/* Truyền product đã lọc */}
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              {/* Nút Previous */}
              <div
                onClick={() => setIndex((prev) => prev + 1)}
                className={styles.swiperButtonPrev}
                style={index === 0 ? { display: "none" } : {}}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </div>
              {/* Nút Next */}
              <div
                onClick={() => setIndex((prev) => prev - 1)}
                className={styles.swiperButtonNext}
                style={maxIndex === 0 || index <= -maxIndex ? { display: "none" } : {}}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Hiển thị message khi không có sản phẩm sau khi đã lọc
        <p style={{ textAlign: 'center', padding: '20px 0' }}>
            Chưa có sản phẩm nổi bật nào cho danh mục này.
        </p>
      )}
    </div>
  );
}

export default ListItem;