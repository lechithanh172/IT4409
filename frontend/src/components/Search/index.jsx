import React, { useState, useEffect, useRef, useCallback } from "react";
import { Spin } from "antd";
import styles from "./Search.module.css";
import HeadlessTippy from "@tippyjs/react/headless";
import ItemSearch from "../ItemSearch/ItemSearch"; // Đảm bảo đường dẫn đúng
import apiService from "../../services/api";     // Đảm bảo đường dẫn đúng
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// Số lượng gợi ý/kết quả hiển thị tối đa trong dropdown
const RESULT_LIMIT = 10;
const SUGGESTION_LIMIT = 5; // Số lượng gợi ý ban đầu

function Search(props) {
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [initialSuggestions, setInitialSuggestions] = useState([]); // State lưu gợi ý ban đầu
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true); // State loading cho gợi ý ban đầu
  const inputRef = useRef();
  const navigate = useNavigate();

  // Fetch gợi ý ban đầu khi component mount
  useEffect(() => {
    const fetchInitialSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const response = await apiService.getAllProducts();
        const products = response?.data || [];
        if (Array.isArray(products)) {
          setInitialSuggestions(products); // Lưu tất cả sản phẩm vào gợi ý ban đầu
        } else {
           console.warn("API getAllProducts không trả về mảng hợp lệ:", response);
           setInitialSuggestions([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải gợi ý ban đầu:", error);
        setInitialSuggestions([]); // Đặt thành mảng rỗng nếu lỗi
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchInitialSuggestions();
  }, []); // Chạy 1 lần

  const handleHideResult = () => {
    setShowResult(false);
  };

  // Xử lý khi focus vào input
  const handleFocus = () => {
    setShowResult(true);
    // Nếu input trống, hiển thị gợi ý ban đầu từ state đã fetch
    if (!searchValue.trim() && initialSuggestions.length > 0) {
      setSearchResult(initialSuggestions.slice(0, SUGGESTION_LIMIT));
      setLoading(false); // Không cần loading vì dùng dữ liệu đã có
    }
    // Nếu input có chữ, useEffect tìm kiếm sẽ chạy
  };

  // useEffect để fetch kết quả tìm kiếm hoặc hiển thị gợi ý
  useEffect(() => {
    // Không làm gì nếu dropdown không hiển thị
    if (!showResult) {
      return;
    }

    // --- Xử lý khi input trống ---
    if (!searchValue.trim()) {
      // Nếu đang loading gợi ý ban đầu thì thôi
      if (loadingSuggestions) {
          setLoading(true); // Hiển thị loading chung
          setSearchResult([]);
          return;
      }
      // Hiển thị gợi ý ban đầu đã fetch
      setSearchResult(initialSuggestions.slice(0, SUGGESTION_LIMIT));
      setLoading(false);
      return; // Dừng ở đây nếu input trống
    }

    // --- Xử lý khi input có chữ (Debounced Search) ---
    const fetchProducts = async () => {
      console.log(`Searching for: ${searchValue}`);
      setLoading(true);
      setSearchResult([]); // Xóa kết quả cũ
      try {
        const response = await apiService.searchProducts(searchValue.trim()); // Gọi API tìm kiếm
        const productsFromApi = response?.data || [];

        if (Array.isArray(productsFromApi)) {
            setSearchResult(productsFromApi.slice(0, RESULT_LIMIT)); // Giới hạn số kết quả hiển thị
        } else {
            console.warn("API searchProducts không trả về mảng hợp lệ:", response);
            setSearchResult([]);
        }

      } catch (error) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", error);
        setSearchResult([]); // Đặt thành mảng rỗng nếu lỗi
      } finally {
        setLoading(false);
      }
    };

    // Debounce: Chỉ gọi API sau khi người dùng ngừng gõ 300ms
    const debounceFetch = setTimeout(fetchProducts, 300);

    // Cleanup function: Hủy bỏ timeout nếu người dùng gõ tiếp
    return () => clearTimeout(debounceFetch);

  }, [searchValue, showResult, initialSuggestions, loadingSuggestions]); // Thêm dependencies mới

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const inputValue = e.target.value;
    // Không cho phép bắt đầu bằng dấu cách
    if (!inputValue.startsWith(" ")) {
      setSearchValue(inputValue);
    }
  };

  // Xử lý submit form tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Ngăn trang reload
    const trimmedSearchValue = searchValue.trim();
    if (trimmedSearchValue) {
      console.log("Navigating to search page with:", trimmedSearchValue);
      navigate(`/search?q=${encodeURIComponent(trimmedSearchValue)}`); // Chuyển hướng đến trang tìm kiếm
      handleHideResult(); // Ẩn dropdown
    }
  };

  // Helper lấy ảnh từ variant đầu tiên
  const getProductImage = (product) => {
    // Kiểm tra có variants và phần tử đầu tiên không, rồi mới lấy imageUrl
    return product?.variants?.[0]?.imageUrl || "/placeholder-image.png"; // Thêm ảnh placeholder
  };


  return (
    <div>
      {/* Overlay để click ra ngoài sẽ ẩn kết quả */}
      {showResult && (
        <div className={styles.overlay} onClick={handleHideResult}></div>
      )}
      <HeadlessTippy
        interactive // Cho phép tương tác với nội dung Tippy
        placement="bottom-start" // Vị trí hiển thị
        visible={showResult} // Điều khiển hiển thị
        render={(attrs) => (
          <div
            // Key thay đổi để Tippy biết nội dung đã cập nhật
            key={searchValue || "initial-suggestions"}
            className={styles.searchResult}
            tabIndex="-1"
            {...attrs}
          >
            <div className={styles.result}>
              {/* Hiển thị loading */}
              {loading ? (
                <div className={styles.loadingContainer}>
                  <Spin size="large" />
                </div>
              ) : /* Hiển thị không có kết quả */
              searchResult.length === 0 && searchValue.trim() ? (
                <div className={styles.noResult}>
                  Không tìm thấy sản phẩm nào khớp với "{searchValue}"
                </div>
              ) : (
                /* Hiển thị danh sách kết quả/gợi ý */
                <div className={styles.listResult}>
                  {/* Tiêu đề gợi ý (khi input trống) */}
                  {!searchValue.trim() && searchResult.length > 0 && (
                    <h4 className={styles.suggestionTitle}>Sản phẩm gợi ý</h4>
                  )}
                  {/* Tiêu đề kết quả tìm kiếm (khi input có chữ) */}
                  {searchValue.trim() && searchResult.length > 0 && (
                    <h4 className={styles.suggestionTitle}>Kết quả tìm kiếm</h4>
                  )}
                  {/* Map qua kết quả/gợi ý */}
                  {searchResult.map((item) => (
                    <div key={item.productId} onClick={handleHideResult}> {/* Ẩn khi click vào item */}
                      <ItemSearch
                        id={item.productId}
                        name={item.productName}
                        // **** Lấy ảnh từ variant đầu tiên ****
                        image={getProductImage(item)}
                        price={item.price}
                      />
                    </div>
                  ))}
                  {/* Nút xem tất cả kết quả (chỉ hiện khi có kết quả tìm kiếm) */}
                  {searchValue.trim() && searchResult.length > 0 && (
                    <button
                      className={styles.viewAllButton}
                      onClick={(e) => {
                        e.stopPropagation(); // Ngăn chặn event click khác
                        // Tạo event giả để dùng lại hàm submit
                        const fakeEvent = { preventDefault: () => {} };
                        handleSearchSubmit(fakeEvent);
                      }}
                    >
                      Xem tất cả kết quả cho "{searchValue}"
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        onClickOutside={handleHideResult} // Ẩn khi click ra ngoài Tippy
      >
        {/* Phần input tìm kiếm */}
        <div className={styles.searchContainer}>
          <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Bạn muốn tìm gì hôm nay?"
              className={styles.searchInput}
              value={searchValue}
              onChange={handleChange}
              onFocus={handleFocus} // Hiện gợi ý/kết quả khi focus
            />
            <button
              type="submit"
              className={styles.searchButton}
              aria-label="Tìm kiếm"
            >
              <FiSearch />
            </button>
          </form>
        </div>
      </HeadlessTippy>
    </div>
  );
}

export default Search;