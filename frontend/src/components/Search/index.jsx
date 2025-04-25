import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Spin } from 'antd';
import styles from "./Search.module.css";
import HeadlessTippy from "@tippyjs/react/headless";
import ItemSearch from "../ItemSearch/ItemSearch";
import apiService from "../../services/api"
import { FiSearch } from "react-icons/fi";
// import unidecode from 'unidecode';


function Search(props) {
    const [searchValue, setSearchValue] = useState('');
    const [isSearch, setIsSearch] = useState(false);
    const [searchResult, setSearchResult] = useState([]);
    const [showResult, setShowResult] = useState(props.overlay);
    const [loading, setLoading] = useState(false); // Trạng thái loading
    const inputRef = useRef();

    // Hàm xóa input
    const handleClear = () => {
        setSearchValue('');
        setSearchResult([]);
        inputRef.current.focus();
    };

    // Ẩn kết quả
    const handleHideResult = () => {
        setShowResult(false);
    };

    // Gọi API để lấy sản phẩm khi từ khóa thay đổi
    useEffect(() => {
      if (!searchValue) {
          setSearchResult([]);
          return;
      }
  
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const response = await apiService.searchProducts(searchValue);
          console.log(response.data);
          
          const products = Array.isArray(response.data) ? response.data : [];
      
          // Cập nhật kết quả tìm kiếm
          setSearchResult(products);
          setShowResult(true);
        } catch (error) {
          console.error("Lỗi khi tìm kiếm sản phẩm:", error);
          setSearchResult([]);
        } finally {
          setLoading(false);
        }
      };
  
      const debounceFetch = setTimeout(fetchProducts, 500); // Debounce 500ms
      return () => clearTimeout(debounceFetch);
  }, [searchValue]);
  

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const inputValue = e.target.value;
        if (!inputValue.startsWith(' ')) {
            setSearchValue(inputValue);
        }
        console.log(inputValue);
        
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchValue.trim()) {
          navigate(`/search?=${searchValue}`); // Chuyển đến trang tìm kiếm
          setSearchValue(''); // Xóa ô tìm kiếm sau khi submit
          closeAllDropdowns(); // Đóng menu nếu đang mở
        }
    };

    const handleSearch = () => {
        setIsSearch(true);
        // document.body.classList.add('no-scroll');
    }

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    return (
        <div>
            {showResult && <div className={styles.overlay} onClick={handleHideResult}></div>}
            <HeadlessTippy
                interactive
                placement="bottom"
                visible={showResult}
                render={(attrs) => (
                    <div className={styles.searchResult} tabIndex="-1" {...attrs}>
                        <div className={styles.result}>
                            {
                            // loading ? (
                            //     <Spin style={{ height: "400px", width: "320px"}} />
                            // ) : 
                            searchResult.length === 0 ? (
                                <div className={styles.noResult}><ItemSearch noResult={true} /></div>
                            ) : (
                                <div className={styles.listResult}>

                                    {searchResult.map((item, index) => (
                                        <div key={index} onClick={handleClear}>
                                            <ItemSearch
                                                id={item.productId}
                                                name={item.productName}
                                                image={item.imageUrl}
                                                price={item.price}
                                                noResult={false}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                onClickOutside={handleHideResult}
            >
                <div className="search">
                    <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
                        <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className={styles.searchInput}
                        value={searchValue}
                        onChange={handleSearchChange}
                        onClick={handleSearch}
                        />
                        <button type="submit" className={styles.searchButton}>
                        <FiSearch />
                        </button>
                    </form>
                </div>
            </HeadlessTippy>
        </div>
    );
}

export default Search;
