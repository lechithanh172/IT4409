import React, { useState, useEffect, useRef } from "react";
import { Spin } from "antd";
import styles from "./Search.module.css";
import HeadlessTippy from "@tippyjs/react/headless";
import ItemSearch from "../ItemSearch/ItemSearch";
import apiService from "../../services/api";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const data = [
  {
    productId: 1,
    productName: "iPhone 16e 128GB | Chính hãng VN/A",
    description: "...",
    price: 16990000,
    imageUrl:
      "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16e-128gb_1__1.png",
    stockQuantity: 10,
    categoryId: 3,
    brandId: 1,
  },
  {
    productId: 2,
    productName: "iPhone 15 Pro Max 512GB | Chính hãng VN/A",
    description: "...",
    price: 40990000,
    imageUrl:
      "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-512gb-titan-nau.jpg",
    stockQuantity: 13,
    categoryId: 3,
    brandId: 1,
  },
  {
    productId: 10,
    productName: "MacBook Pro 14 M4 10CPU 10GPU 16GB 512GB",
    description: "...",
    price: 39990000,
    imageUrl:
      "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_pro_14-inch_m4_chip_space_black_pdp_image_position_1__vn-vi.jpg",
    stockQuantity: 7,
    categoryId: 1,
    brandId: 1,
  },
];

function Search(props) {
  const [searchValue, setSearchValue] = useState("");
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
    if (!showResult) {
      return;
    }

    if (!searchValue.trim()) {
      setSearchResult(data.slice(0, 5));
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setSearchResult([]);
      try {
        const response = await apiService.searchProducts(searchValue);
        const productsFromApi = Array.isArray(response.data)
          ? response.data
          : [];
        setSearchResult(productsFromApi.slice(0, 10));
      } catch (error) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", error);
        setSearchResult([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounceFetch);
  }, [searchValue, showResult]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    if (!inputValue.startsWith(" ")) {
      setSearchValue(inputValue);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedSearchValue = searchValue.trim();
    if (trimmedSearchValue) {
      navigate(`/search?q=${encodeURIComponent(trimmedSearchValue)}`);
      handleHideResult();
    }
  };

  return (
    <div>
      {showResult && (
        <div className={styles.overlay} onClick={handleHideResult}></div>
      )}
      <HeadlessTippy
        interactive
        placement="bottom-start"
        visible={showResult}
        render={(attrs) => (
          <div
            key={searchValue || "initial"}
            className={styles.searchResult}
            tabIndex="-1"
            {...attrs}
          >
            <div className={styles.result}>
              {loading ? (
                <div className={styles.loadingContainer}>
                  <Spin size="large" />
                </div>
              ) : searchResult.length === 0 && searchValue.trim() ? (
                <div className={styles.noResult}>
                  Không tìm thấy sản phẩm nào khớp với "{searchValue}"
                </div>
              ) : (
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
