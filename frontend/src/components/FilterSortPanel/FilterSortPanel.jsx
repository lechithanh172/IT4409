import React, { useState, useEffect } from 'react';
import styles from './FilterSortPanel.module.css';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Range, getTrackBackground } from 'react-range'; // Import react-range

// Hàm định dạng tiền tệ
const formatCurrency = (amount, hideSymbol = false) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '';
    const options = {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    };
    if (hideSymbol) {
      options.style = 'decimal';
    }
    let formatted = new Intl.NumberFormat('vi-VN', options).format(amount);
    if (hideSymbol) {
         return formatted;
    }
    // Giữ ký hiệu '₫'
    return formatted;
};

const FilterSortPanel = ({ currentFilters, onFilterChange, availableBrands = [], minPrice = 0, maxPrice = 50000000 }) => {
  // State quản lý mở/đóng section
  const [isSortOpen, setIsSortOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);

  // Lấy giá trị hiện tại từ prop hoặc đặt giá trị mặc định
  const { sort = '', brand = '', price_gte = minPrice.toString(), price_lte = maxPrice.toString() } = currentFilters;

  // State cho Price Range Slider, khởi tạo từ prop/mặc định
  const [priceRange, setPriceRange] = useState([
      parseInt(price_gte, 10) || minPrice,
      parseInt(price_lte, 10) || maxPrice
  ]);

   // Cập nhật state slider khi query param (currentFilters) thay đổi từ bên ngoài
   useEffect(() => {
       const numGte = parseInt(price_gte, 10);
       const numLte = parseInt(price_lte, 10);
       // Chỉ cập nhật nếu giá trị khác state hiện tại và hợp lệ
       if ((!isNaN(numGte) && numGte !== priceRange[0]) || (!isNaN(numLte) && numLte !== priceRange[1])) {
            setPriceRange([
               !isNaN(numGte) ? numGte : minPrice,
               !isNaN(numLte) ? numLte : maxPrice
           ]);
       }
   // Thêm minPrice, maxPrice vào dependency nếu chúng có thể thay đổi động
   }, [price_gte, price_lte, minPrice, maxPrice]);


  // Hàm gọi callback khi filter/sort thay đổi
  const handleSortChange = (e) => {
    onFilterChange({ sort: e.target.value });
  };

  const handleBrandChange = (e) => {
    onFilterChange({ brand: e.target.value });
  };

  // Hàm gọi callback KHI NGƯỜI DÙNG THẢ CHUỘT khỏi slider giá
  const handlePriceChangeFinal = (values) => {
    // *** THÊM LOG ***
    console.log("[FilterSortPanel] onFinalChange - values:", values);
    console.log("[FilterSortPanel] currentFilters (before change):", { price_gte, price_lte });
    console.log("[FilterSortPanel] Default min/max:", { minPrice, maxPrice });

    const currentGte = parseInt(price_gte, 10) || minPrice;
    const currentLte = parseInt(price_lte, 10) || maxPrice;

    // Chỉ gọi onFilterChange nếu giá trị thực sự thay đổi
    if (values[0] !== currentGte || values[1] !== currentLte) {
        console.log("[FilterSortPanel] Price changed! Calling onFilterChange with:", { price_gte: values[0], price_lte: values[1] });
        onFilterChange({ price_gte: values[0], price_lte: values[1] });
    } else {
        console.log("[FilterSortPanel] Price did not change. Not calling onFilterChange.");
    }
 };

  // Hàm toggle section
  const toggleSection = (setter) => setter(prev => !prev);

  // Đảm bảo min/max hợp lệ
   const validMinPrice = isNaN(parseInt(minPrice, 10)) ? 0 : parseInt(minPrice, 10);
   const validMaxPrice = isNaN(parseInt(maxPrice, 10)) || parseInt(maxPrice, 10) <= validMinPrice ? validMinPrice + 100000 : parseInt(maxPrice, 10); // Đảm bảo max > min
   const step = Math.max(100000, Math.round((validMaxPrice - validMinPrice) / 100)); // Bước nhảy slider

  return (
    <aside className={styles.filterPanel}>
      <h3 className={styles.panelTitle}><FiFilter /> Bộ lọc & Sắp xếp</h3>

      {/* --- Sắp xếp --- */}
      <div className={styles.filterGroup}>
        <button className={styles.groupHeader} onClick={() => toggleSection(setIsSortOpen)} aria-expanded={isSortOpen} aria-controls="sort-content">
          <span>Sắp xếp theo</span>
          {isSortOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {isSortOpen && (
          <div id="sort-content" className={styles.groupContent}>
            <select
              value={sort} // Giá trị hiện tại
              onChange={handleSortChange} // Gọi hàm khi thay đổi
              className={styles.sortSelect}
              aria-label="Tiêu chí sắp xếp"
            >
              <option value="">Mặc định</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="name_asc">Tên: A-Z</option>
              <option value="name_desc">Tên: Z-A</option>
              {/* <option value="newest">Mới nhất</option> */}
            </select>
          </div>
        )}
      </div>

       {/* --- Khoảng giá --- */}
       <div className={styles.filterGroup}>
            <button className={styles.groupHeader} onClick={() => toggleSection(setIsPriceOpen)} aria-expanded={isPriceOpen} aria-controls="price-content">
                <span>Khoảng giá</span>
                {isPriceOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>
           {isPriceOpen && (
               <div id="price-content" className={styles.groupContent}>
                   <div className={styles.priceRangeValues}>
                       <span>Từ: {formatCurrency(priceRange[0])}</span>
                       <span>Đến: {formatCurrency(priceRange[1])}</span>
                   </div>
                    <div className={styles.rangeSliderWrapper}>
                       {/* Chỉ render Range nếu min < max */}
                       {validMinPrice < validMaxPrice ? (
                            <Range
                                values={priceRange} // Giá trị hiện tại của slider
                                step={step}        // Bước nhảy
                                min={validMinPrice} // Giá trị nhỏ nhất
                                max={validMaxPrice} // Giá trị lớn nhất
                                onChange={(values) => setPriceRange(values)} // Cập nhật state khi kéo
                                onFinalChange={handlePriceChangeFinal} // Gửi giá trị cuối cùng khi thả chuột
                                renderTrack={({ props, children }) => (
                                <div
                                    onMouseDown={props.onMouseDown}
                                    onTouchStart={props.onTouchStart}
                                    style={{ ...props.style }}
                                    className={styles.rangeTrackContainer}
                                >
                                    <div
                                        ref={props.ref}
                                        className={styles.rangeTrack}
                                        style={{
                                            background: getTrackBackground({
                                            values: priceRange,
                                            colors: ['#e5e7eb', '#6366f1', '#e5e7eb'], // Màu track: xám, tím, xám
                                            min: validMinPrice,
                                            max: validMaxPrice
                                            }),
                                        }}
                                    >
                                    {children} {/* Render các nút kéo */}
                                    </div>
                                </div>
                                )}
                                renderThumb={({ props, isDragged }) => (
                                <div
                                    {...props}
                                    className={styles.rangeThumb}
                                    style={{
                                        ...props.style,
                                        // Có thể thêm hiệu ứng khi kéo
                                        // boxShadow: isDragged ? '0px 0px 8px rgba(99,102,241,0.5)' : 'none'
                                    }}
                                />
                                )}
                            />
                       ) : (
                           <p className={styles.priceError}>Không đủ dữ liệu để lọc giá.</p> // Thông báo nếu min >= max
                       )}
                    </div>
               </div>
           )}
       </div>

      {/* --- Thương hiệu --- */}
      <div className={styles.filterGroup}>
         <button className={styles.groupHeader} onClick={() => toggleSection(setIsBrandOpen)} aria-expanded={isBrandOpen} aria-controls="brand-content">
             <span>Thương hiệu</span>
             {isBrandOpen ? <FiChevronUp /> : <FiChevronDown />}
         </button>
        {isBrandOpen && (
          <div id="brand-content" className={`${styles.groupContent} ${styles.brandList}`}>
             {/* Nút Tất cả */}
             <label className={styles.brandLabel}>
                 <input
                    type="radio" name="brandFilter" value=""
                    checked={!brand} onChange={handleBrandChange}
                    className={styles.radioInput}
                 />
                 <span className={styles.brandName}>Tất cả</span>
             </label>
             {/* Lặp qua brands */}
            {availableBrands.length > 0 ? availableBrands.map((b) => (
              <label key={b.brandId} className={styles.brandLabel}>
                <input
                  type="radio" name="brandFilter" value={b.brandName}
                  checked={brand === b.brandName} onChange={handleBrandChange}
                  className={styles.radioInput}
                />
                {/* Logo nếu muốn */}
                {/* <img src={b.logoUrl} alt={b.brandName} className={styles.brandLogo}/> */}
                <span className={styles.brandName}>{b.brandName}</span>
              </label>
            )) : <p className={styles.noOptions}>Không có thương hiệu</p> }
          </div>
        )}
      </div>

      {/* Thêm các bộ lọc khác ở đây */}

    </aside>
  );
};

export default FilterSortPanel;