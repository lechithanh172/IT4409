import React, { useState, useEffect, useRef } from "react";
import { Spin } from 'antd';
import styles from "./Search.module.css";
import HeadlessTippy from "@tippyjs/react/headless";
import ItemSearch from "../ItemSearch/ItemSearch";
import apiService from "../../services/api"; // Bỏ comment nếu dùng API
import { FiSearch } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

// --- Dữ liệu cứng (dùng khi focus mà chưa search, hoặc khi API bị comment) ---
const data = [
    {
      productId: 1,
      productName: "iPhone 16e 128GB | Chính hãng VN/A",
      description: "...",
      price: 16990000,
      imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16e-128gb_1__1.png",
      stockQuantity: 10,
      categoryId: 3,
      brandId: 1
    },
    {
      productId: 2,
      productName: "iPhone 15 Pro Max 512GB | Chính hãng VN/A",
       description: "...",
      price: 40990000,
      imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-512gb-titan-nau.jpg",
      stockQuantity: 13,
      categoryId: 3,
      brandId: 1
    },
    // ... (các sản phẩm khác) ...
    {
      productId: 10,
      productName: "MacBook Pro 14 M4 10CPU 10GPU 16GB 512GB",
       description: "...",
      price: 39990000,
      imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_pro_14-inch_m4_chip_space_black_pdp_image_position_1__vn-vi.jpg",
      stockQuantity: 7,
      categoryId: 1,
      brandId: 1
    },
];
// --- Kết thúc dữ liệu cứng ---

function Search(props) {
    const [searchValue, setSearchValue] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef();
    const navigate = useNavigate();

    const handleHideResult = () => {
        setShowResult(false);
    };

    const handleFocus = () => {
        setShowResult(true);
        if (!searchValue.trim()) {
            setSearchResult(data.slice(0, 5));
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!showResult) { // Nếu Tippy không hiển thị, không làm gì cả
            return;
        }

        if (!searchValue.trim()) {
             // Khi xóa hết text và Tippy đang mở, hiển thị lại gợi ý ban đầu
             setSearchResult(data.slice(0, 5));
             setLoading(false);
             return;
        }

        const fetchProducts = async () => {
            setLoading(true);
            setSearchResult([]);
            try {
                // --- DÙNG API ---
                console.log("Fetching API for:", searchValue);
                const response = await apiService.searchProducts(searchValue);
                console.log("API Response:", response); // Check the structure
                // Kiểm tra response.data có phải là mảng không
                const productsFromApi = Array.isArray(response.data) ? response.data : [];
                console.log("Products from API:", productsFromApi);
                setSearchResult(productsFromApi.slice(0, 10)); // Lấy tối đa 10 kết quả từ API

                // --- HOẶC DÙNG DATA CỨNG (comment phần API ở trên nếu dùng cái này) ---
                // console.log("Filtering local data for:", searchValue);
                // const filteredData = data.filter(item =>
                //     item.productName.toLowerCase().includes(searchValue.toLowerCase())
                // );
                // console.log("Filtered results:", filteredData);
                // // Giả lập độ trễ mạng
                // await new Promise(resolve => setTimeout(resolve, 300));
                // setSearchResult(filteredData.slice(0, 10));
                // --- KẾT THÚC PHẦN DATA CỨNG ---

            } catch (error) {
                console.error("Lỗi khi tìm kiếm sản phẩm:", error);
                setSearchResult([]);
            } finally {
                setLoading(false);
            }
        };

        const debounceFetch = setTimeout(fetchProducts, 300);
        return () => clearTimeout(debounceFetch);

    }, [searchValue, showResult]); // Thêm showResult vào dependency


    const handleChange = (e) => {
        const inputValue = e.target.value;
        if (!inputValue.startsWith(' ')) {
            setSearchValue(inputValue);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmedSearchValue = searchValue.trim();
        if (trimmedSearchValue) {
            // Chú ý: URL tìm kiếm thường dùng ?q= thay vì ?=
            navigate(`/search?q=${encodeURIComponent(trimmedSearchValue)}`);
            handleHideResult();
        }
    };

    return (
        <div>
            {showResult && <div className={styles.overlay} onClick={handleHideResult}></div>}
            <HeadlessTippy
                interactive
                placement="bottom-start"
                // Sửa điều kiện visible: chỉ cần showResult là true
                visible={showResult}
                render={(attrs) => (
                    // Đảm bảo div này luôn được render khi visible=true, logic bên trong quyết định nội dung
                    <div key={searchValue || 'initial'} className={styles.searchResult} tabIndex="-1" {...attrs}>
                        <div className={styles.result}>
                            {loading ? (
                                <div className={styles.loadingContainer}>
                                    <Spin size="large" />
                                </div>
                            // Điều kiện hiển thị "Không có kết quả"
                            ) : searchResult.length === 0 && searchValue.trim() ? (
                                <div className={styles.noResult}>Không tìm thấy sản phẩm nào khớp với "{searchValue}"</div>
                            ) : (
                                // Hiển thị danh sách (gợi ý ban đầu hoặc kết quả tìm kiếm)
                                <div className={styles.listResult}>
                                    {!searchValue.trim() && searchResult.length > 0 && (
                                        <h4 className={styles.suggestionTitle}>Sản phẩm gợi ý</h4>
                                    )}
                                    {searchValue.trim() && searchResult.length > 0 && (
                                        <h4 className={styles.suggestionTitle}>Kết quả tìm kiếm</h4>
                                    )}
                                    {searchResult.map((item) => (
                                        <div key={item.productId} onClick={handleHideResult}>
                                            <ItemSearch
                                                id={item.productId}
                                                name={item.productName}
                                                image={item.imageUrl}
                                                price={item.price}
                                            />
                                        </div>
                                    ))}
                                     {searchValue.trim() && searchResult.length > 0 && (
                                        <button
                                            className={styles.viewAllButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Tạo một sự kiện submit giả để dùng chung logic
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
                onClickOutside={handleHideResult}
            >
                <div className={styles.searchContainer}>
                    <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Bạn muốn tìm gì hôm nay?"
                            className={styles.searchInput}
                            value={searchValue}
                            onChange={handleChange}
                            onFocus={handleFocus}
                        />
                        <button type="submit" className={styles.searchButton} aria-label="Tìm kiếm">
                            <FiSearch />
                        </button>
                    </form>
                </div>
            </HeadlessTippy>
        </div>
    );
}

export default Search;