import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Spin } from 'antd';
import "./Search.css";
import HeadlessTippy from "@tippyjs/react/headless";
import ItemSearch from "../ItemSearch/ItemSearch";
import apiService from "../../api/api";
// import unidecode from 'unidecode';


function Search() {
    const [searchValue, setSearchValue] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [showResult, setShowResult] = useState(false);
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
      if (!searchValue.trim()) {
          setSearchResult([]);
          setShowResult(false);
          return;
      }
  
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const response = await apiService.searchProducts(searchValue);
          const products = response.data.products || [];
      
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
    };

    return (
        <div>
            {showResult && <div className="overlay" onClick={handleHideResult}></div>}
            <HeadlessTippy
                interactive
                placement="bottom"
                visible={showResult}
                render={(attrs) => (
                    <div className="search-results" tabIndex="-1" {...attrs}>
                        <div>
                            {loading ? (
                                <Spin style={{ height: "400px", width: "320px"}} />
                            ) : searchResult.length === 0 ? (
                                <ItemSearch noResult={true} />
                            ) : (
                                searchResult.map((item, index) => (
                                    <div key={index} className="" onClick={handleClear}>
                                        <ItemSearch
                                            id={item.productId}
                                            name={item.productName}
                                            image={item.imageUrl}
                                            // sale={item.variants[0].sale}
                                            price={item.price}
                                            // noResult={false}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
                onClickOutside={handleHideResult}
            >
                <div className="search">
                    <div>
                        <form className="form-y" onSubmit={(e) => e.preventDefault()}>
                            <input
                                className="input-y"
                                ref={inputRef}
                                value={searchValue}
                                placeholder="Tìm kiếm..."
                                spellCheck={false}
                                onChange={handleChange}
                                onFocus={() => setShowResult(true)}
                            />
                        </form>
                    </div>
                    <div className="input-btn" style={{ marginLeft: 5 }}>
                        <button
                            className="button-y"
                            type="submit"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => inputRef.current.focus()}
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlass} height={40} />
                        </button>
                    </div>
                </div>
            </HeadlessTippy>
        </div>
    );
}

export default Search;
