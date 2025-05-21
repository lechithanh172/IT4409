import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './FilterSortPanel.module.css';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Range, getTrackBackground } from 'react-range';
// import Spinner from '../Spinner/Spinner'; // Import Spinner đã bị comment out đúng cách

// --- Hàm định dạng tiền tệ ---
const formatCurrency = (amount, hideSymbol = false) => {
    // Kiểm tra null, undefined, NaN an toàn
    if (typeof amount !== 'number' || isNaN(amount) || amount === null) return '';
    const options = {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    };
    if (hideSymbol) options.style = 'decimal';
    // Thêm xử lý try/catch cho Intl.NumberFormat nếu có lỗi locale không mong muốn
    try {
        let formatted = new Intl.NumberFormat('vi-VN', options).format(amount);
        if (hideSymbol) formatted = formatted.replace(/\s?₫/, ''); // Loại bỏ ký hiệu tiền tệ và khoảng trắng
        return formatted;
    } catch (e) {
        console.error("Lỗi định dạng tiền tệ:", amount, e);
        return amount.toString(); // Fallback về chuỗi
    }
};

// --- Cấu trúc dữ liệu lồng nhau cho các tùy chọn lọc CPU ---
// Key cấp 1 là category, key cấp 2 là tên hãng chip, value là mảng các đời chip cụ thể
// Các chuỗi trong mảng đời chip (value) PHẢI KHỚP CHÍNH XÁC với giá trị bạn muốn gửi đến API FILTER endpoint cho trường 'cpu'
const CPU_OPTIONS_NESTED = {
    // Đảm bảo key này khớp với giá trị bạn muốn nhận từ API/props category
    LAPTOP: {
        'Apple Silicon': ['Apple M1', 'Apple M1 Pro', 'Apple M1 Max', 'Apple M2', 'Apple M2 Pro', 'Apple M2 Max', 'Apple M3', 'Apple M3 Pro', 'Apple M3 Max'],
        'Intel': ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'Intel Core Ultra 5', 'Intel Core Ultra 7', 'Intel Core Ultra 9'],
        'AMD': ['AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9'],
    },
    // TODO: Thêm data cho SMARTPHONE nếu cần lọc chip theo category này và cấu trúc API cho phép
    // SMARTPHONE: { ... }
};

// Các tùy chọn lọc cố định khác (không lồng nhau) - Giữ nguyên như code bạn cung cấp
const availableRamCapacityOptionsUI = ['2GB', '4GB', '6GB', '8GB', '12GB', '16GB', '32GB', '64GB'];
const availableStorageOptionsUI = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];
const availableRefreshRateOptionsUI = ['60Hz', '90Hz', '120Hz', '144Hz', '240Hz'];


const FilterSortPanel = ({
    currentFilters, // Object chứa tất cả các filter đang áp dụng từ URL
    onFilterChange, // Hàm callback để gửi các filter mới lên ProductListPage
    availableBrands = [], // Danh sách brands từ API
    availableCategories = [], // Danh sách categories từ API
    minPrice = 0, // Giá nhỏ nhất tổng thể từ ProductListPage (từ dữ liệu đã fetch)
    maxPrice = 100000000, // Giá lớn nhất tổng thể từ ProductListPage (từ dữ liệu đã fetch)
    currentCategory = '', // Category đang chọn từ URL (đã normalize về string)
    isLoading = false, // Trạng thái loading từ ProductListPage
}) => {
    // --- State quản lý trạng thái mở/đóng của các section ---
    const [isSortOpen, setIsSortOpen] = useState(true);
    const [isPriceOpen, setIsPriceOpen] = useState(true);
    const [isBrandOpen, setIsBrandOpen] = useState(true);
    const [isCategoryOpen, setIsCategoryOpen] = useState(true);
    const [isMemoryOpen, setIsMemoryOpen] = useState(true);
    const [isStorageOpen, setIsStorageOpen] = useState(true);
    // CPU chỉ mở mặc định nếu category hiện tại là Laptop (không phân biệt hoa thường)
    const [isCpuOpen, setIsCpuOpen] = useState(currentCategory.toLowerCase() === 'laptop');
    const [isRefreshRateOpen, setIsRefreshRateOpen] = useState(true);

    // --- State quản lý trạng thái mở/đóng của từng hãng chip con ---
    // Sử dụng Set để lưu trữ tên các hãng đang mở
    const [openCpuManufacturers, setOpenCpuManufacturers] = useState(new Set());

    // --- Trích xuất các giá trị lọc hiện tại từ props ---
    // Sử dụng default value là {} để tránh lỗi khi currentFilters undefined
    const {
        category: currentCategoryFilter = '', // Sử dụng tên biến khác để tránh trùng currentCategory prop
        sort = '',
        brandName = '',
        price_gte = '',
        price_lte = '',
        memory = [], // array
        storage = [], // array
        cpu = [], // array (các giá trị CPU được chọn) - vd: ["Intel Core i5", "Apple M1"]
        refreshRate = [],
    } = currentFilters || {}; // Đảm bảo currentFilters là object


    // --- Calculate valid min/max price for the slider ---
    // Giá trị min/max thực tế cho slider
    const { validMinPrice, validMaxPrice, step } = useMemo(() => {
        const min = typeof minPrice === 'number' && !isNaN(minPrice) ? minPrice : 0;
        const max = typeof maxPrice === 'number' && !isNaN(maxPrice) ? maxPrice : 100000000;
        // Đảm bảo max luôn lớn hơn min cho thanh trượt
        const effectiveMax = max <= min ? min + 100000 : max; // Đảm bảo có khoảng cách tối thiểu
        // Bước nhảy: ít nhất 10k (hoặc giá trị nhỏ hơn phù hợp), hoặc 1% của khoảng giá
        const calculatedStep = Math.max(10000, Math.round((effectiveMax - min) / 100)); // Bước nhảy min 10k
        return { validMinPrice: min, validMaxPrice: effectiveMax, step: calculatedStep };
    }, [minPrice, maxPrice]); // Tính lại khi minPrice hoặc maxPrice từ ProductListPage thay đổi


    // --- State quản lý giá trị của thanh trượt giá (cục bộ khi đang kéo) ---
    const [priceRange, setPriceRange] = useState([
        parseInt(price_gte, 10) || validMinPrice, // Lấy từ URL, nếu không hợp lệ dùng giá trị min
        parseInt(price_lte, 10) || validMaxPrice // Lấy từ URL, nếu không hợp lệ dùng giá trị max
    ]);

    // Effect cập nhật thanh trượt giá khi bộ lọc giá thay đổi từ bên ngoài (qua URL)
    useEffect(() => {
         const initialMin = parseInt(price_gte, 10);
         const initialMax = parseInt(price_lte, 10);

         // Lấy giá trị từ URL nếu hợp lệ và nằm trong bounds tổng thể, ngược lại dùng giá trị bounds
         let newMin = !isNaN(initialMin) ? Math.max(validMinPrice, Math.min(initialMin, validMaxPrice)) : validMinPrice;
         let newMax = !isNaN(initialMax) ? Math.max(validMinPrice, Math.min(initialMax, validMaxPrice)) : validMaxPrice;

         // Đảm bảo min <= max sau khi xử lý
         if (newMin > newMax) {
             [newMin, newMax] = [newMax, newMin]; // Swap
         }

        // Cập nhật state chỉ khi giá trị thực sự thay đổi
        const isCurrentStateMatchingProps = priceRange[0] === newMin && priceRange[1] === newMax;

        if (!isCurrentStateMatchingProps) {
            console.log(`FilterSortPanel: Cập nhật state priceRange từ props [${newMin}, ${newMax}]. State hiện tại [${priceRange[0]}, ${priceRange[1]}]`);
            setPriceRange([newMin, newMax]);
        } else {
             // console.log(`FilterSortPanel: State priceRange đã khớp với props [${newMin}, ${newMax}]`);
        }
    }, [price_gte, price_lte, validMinPrice, validMaxPrice]); // Phụ thuộc vào tham số URL và bounds giá


    // --- Tạo danh sách tùy chọn CPU lồng nhau CHỈ KHI CATEGORY LÀ LAPTOP ---
    const nestedCpuOptions = useMemo(() => {
        // Chuyển category hiện tại sang chữ thường để so sánh
        const lowerCaseCategory = currentCategory.toLowerCase();

        // Nếu category không phải 'laptop', trả về null để ẩn section CPU
        if (lowerCaseCategory !== 'laptop') {
             console.log("[FilterSortPanel] Category không phải Laptop. Không tạo danh sách tùy chọn CPU.");
            return null;
        }

        console.log("[FilterSortPanel] Category là Laptop. Tạo danh sách tùy chọn CPU.");

        // Lấy data CPU cho category LAPTOP
        const optionsForLaptop = CPU_OPTIONS_NESTED['LAPTOP'] || {};

        // Chuyển object các hãng/đời chip thành mảng object { manufacturer, models }
        let manufacturersData = Object.entries(optionsForLaptop).map(([manufacturer, models]) => ({
             manufacturer,
             models: models ? [...models].sort() : [] // Copy mảng và sort đời chip, xử lý null/undefined models
         }));

        // Sort các hãng chip theo tên
        manufacturersData.sort((a, b) => a.manufacturer.localeCompare(b.manufacturer));

        // Trả về danh sách đã tạo. Nếu không có hãng/đời chip nào, nó sẽ là []
        return manufacturersData;

    }, [currentCategory]); // Tính toán lại khi category thay đổi


    // --- Hàm xử lý đóng/mở section hãng chip con ---
    const toggleManufacturerSection = useCallback((manufacturerName) => {
        setOpenCpuManufacturers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(manufacturerName)) {
                newSet.delete(manufacturerName);
            } else {
                newSet.add(manufacturerName);
            }
            return newSet;
        });
    }, []);


    // --- Hàm xử lý thay đổi bộ lọc Category ---
     const handleCategoryChange = (e) => {
         const newCategory = e.target.value;
         console.log(`[FilterSortPanel] Thay đổi category: "${currentCategory}" -> "${newCategory}"`);

         const filtersToUpdate = {
             category: newCategory,
             // Khi category thay đổi, LUÔN reset các bộ lọc con
             // vì chúng có thể không liên quan đến category mới.
             // Điều này ĐẢM BẢO lọc CPU bị xóa khi chuyển khỏi Laptop.
             cpu: [], // Reset CPU filter
             storage: [], // Reset Storage filter
             memory: [], // Reset Memory filter
             refreshRate: [] // Reset RefreshRate filter
         };
         // TODO: Thêm các bộ lọc spec khác vào đây để reset khi đổi category

         onFilterChange(filtersToUpdate);

         // Tùy chọn: đóng tất cả các hãng chip con khi đổi category
         setOpenCpuManufacturers(new Set());

         // Cập nhật trạng thái mở/đóng section CPU dựa trên category mới
         setIsCpuOpen(newCategory.toLowerCase() === 'laptop'); // Chỉ mở nếu category mới là Laptop
     };

    const handleSortChange = useCallback((e) => {
        onFilterChange({ sort: e.target.value });
    }, [onFilterChange]);


    const handleBrandChange = useCallback((e) => {
        onFilterChange({ brandName: e.target.value });
    }, [onFilterChange]);


    // Hàm được gọi khi người dùng thả thanh trượt giá
    const handlePriceChangeFinal = useCallback((values) => {
        console.log(`[FilterSortPanel] onFinalChange triggered with [${values[0]}, ${values[1]}].`);
        // Kiểm tra xem giá trị mới có khác với giá trị hiện tại trên URL không
        // Parse giá trị từ URL về số để so sánh an toàn
        const currentGteNum = parseInt(price_gte, 10);
        const currentLteNum = parseInt(price_lte, 10);

        // Lấy giá trị mặc định nếu parse thất bại
        const compareGte = isNaN(currentGteNum) ? validMinPrice : currentGteNum;
        const compareLte = isNaN(currentLteNum) ? validMaxPrice : currentLteNum;


        // So sánh giá trị từ slider với giá trị số đã parse/mặc định từ URL
        const isPriceChanged = values[0] !== compareGte || values[1] !== compareLte;

        if (isPriceChanged) {
             console.log(`FilterSortPanel: Giá trị thay đổi. Calling onFilterChange.`);
             // Gọi onFilterChange với giá trị mới dưới dạng chuỗi
             onFilterChange({ price_gte: values[0].toString(), price_lte: values[1].toString() });
         } else {
             console.log(`FilterSortPanel: Giá trị không thay đổi so với URL. Không gọi onFilterChange.`);
         }
    }, [price_gte, price_lte, validMinPrice, validMaxPrice, onFilterChange]); // Phụ thuộc vào giá trị URL, bounds và handler


    // --- Hàm xử lý thay đổi bộ lọc cho các checkbox (Chung) ---
    // filterKey sẽ là 'cpu', 'storage', 'memory', or 'refreshRate'
    // value là chuỗi giá trị checkbox (ví dụ: 'Intel Core i5', '16GB')
    const handleCheckboxChange = useCallback((filterKey, value) => {
        // Lấy mảng hiện tại cho filterKey từ props (vd: currentFilters.cpu)
        const currentSelected = currentFilters && Array.isArray(currentFilters[filterKey]) ? currentFilters[filterKey] : [];
        let newSelected;
        if (currentSelected.includes(value)) {
            newSelected = currentSelected.filter(item => item !== value);
        } else {
            newSelected = [...currentSelected, value];
        }
        console.log(`FilterSortPanel: Checkbox changed for "${filterKey}": "${value}". New selected:`, newSelected);
        onFilterChange({ [filterKey]: newSelected }); // Gửi mảng mới lên ProductListPage
    }, [currentFilters, onFilterChange]); // Phụ thuộc vào currentFilters và onFilterChange


    // --- Hàm tiện ích để toggle mở/đóng section ---
    const toggleSection = useCallback((setter) => setter(prev => !prev), []);


    // --- Render ---
    return (
        <aside className={styles.filterPanel}>
            <h3 className={styles.panelTitle}><FiFilter /> Bộ lọc & Sắp xếp</h3>

             {/* --- Bộ lọc Category (API: type) --- */}
             {/* Hiển thị nếu có danh sách category hoặc đang loading */}
            { (availableCategories && availableCategories.length > 0) || isLoading ? (
                <div className={styles.filterGroup}>
                    <button className={styles.groupHeader} onClick={() => toggleSection(setIsCategoryOpen)} aria-expanded={isCategoryOpen} aria-controls="category-content">
                        <span>Danh mục sản phẩm</span>
                        {/* Hiển thị indicator loading nếu đang tải và chưa có data category */}
                        {isLoading && (!availableCategories || availableCategories.length === 0) ? (
                             <span className={styles.loadingIndicator}>...</span>
                         ) : isCategoryOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {isCategoryOpen && (
                        <div id="category-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                            {/* Hiển thị loading message nếu đang tải và chưa có data */}
                            {isLoading && (!availableCategories || availableCategories.length === 0) ? (
                                // Giả định sharedStyles.loadingMessage tồn tại từ file CSS chung bạn có
                                <p className={styles.loadingMessage}>Đang tải danh mục...</p>
                             ) : availableCategories && availableCategories.length > 0 ? (
                                <>
                                    {/* Option "Tất cả" */}
                                    <label className={styles.radioLabel}>
                                        <input
                                            type="radio" name="categoryFilter" value=""
                                            checked={!currentCategoryFilter}
                                            onChange={handleCategoryChange}
                                            className={styles.radioInput}
                                        />
                                        <span className={styles.labelText}>Tất cả</span>
                                    </label>
                                    {/* Render actual categories */}
                                    {availableCategories.map((cat) => (
                                        // Sử dụng categoryId hoặc categoryName làm key, đảm bảo duy nhất và ổn định
                                        <label key={cat.categoryId || cat.categoryName} className={styles.radioLabel}>
                                            <input
                                                type="radio" name="categoryFilter" value={cat.categoryName}
                                                checked={currentCategoryFilter === cat.categoryName}
                                                onChange={handleCategoryChange}
                                                className={styles.radioInput}
                                            />
                                            <span className={styles.labelText}>{cat.categoryName}</span>
                                        </label>
                                    ))}
                                </>
                             ) : (
                                 // Trường hợp fetch xong nhưng danh sách rỗng
                                 // Giả định sharedStyles.noOptionsMessage tồn tại
                                 <p className={styles.noOptionsMessage}>Không có danh mục</p>
                             )}
                        </div>
                    )}
                </div>
            ) : null /* Không render section nếu không có data và không loading */ }


            {/* --- Bộ lọc Sắp xếp (Client-side) --- */}
            {/* Sort is always available */}
            <div className={styles.filterGroup}>
                <button className={styles.groupHeader} onClick={() => toggleSection(setIsSortOpen)} aria-expanded={isSortOpen} aria-controls="sort-content">
                    <span>Sắp xếp theo</span>
                    {isSortOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {isSortOpen && (
                    <div id="sort-content" className={styles.groupContent}>
                        <select
                            value={sort}
                            onChange={handleSortChange}
                            className={styles.sortSelect}
                            aria-label="Tiêu chí sắp xếp"
                        >
                            <option value="">Mặc định</option>
                            <option value="price_asc">Giá: Thấp đến Cao</option>
                            <option value="price_desc">Giá: Cao đến Thấp</option>
                             <option value="name_asc">Tên: A-Z</option>
                             <option value="name_desc">Tên: Z-A</option>
                        </select>
                    </div>
                )}
            </div>

            {/* --- Bộ lọc Khoảng giá (Client-side) --- */}
            {/* Hiển thị nếu có khoảng giá tổng thể hợp lý (min < max) hoặc đang loading */}
            { (validMinPrice < validMaxPrice) || isLoading ? (
                <div className={styles.filterGroup}>
                    <button className={styles.groupHeader} onClick={() => toggleSection(setIsPriceOpen)} aria-expanded={isPriceOpen} aria-controls="price-content">
                        <span>Khoảng giá</span>
                         {/* Hiển thị indicator loading nếu đang tải và chưa có khoảng giá hợp lệ */}
                         {isLoading && !(validMinPrice < validMaxPrice) ? (
                              <span className={styles.loadingIndicator}>...</span>
                         ) : isPriceOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {isPriceOpen && (
                        <div id="price-content" className={styles.groupContent}>
                            {/* Hiển thị loading message nếu đang tải và chưa có khoảng giá */}
                            { isLoading && !(validMinPrice < validMaxPrice) ? (
                                 <p className={styles.loadingMessage}>Đang tải khoảng giá...</p>
                            ) : validMinPrice < validMaxPrice ? (
                                <>
                                    <div className={styles.priceRangeValues}>
                                        <span>Từ: <strong>{formatCurrency(priceRange[0])}</strong></span>
                                        <span>Đến: <strong>{formatCurrency(priceRange[1])}</strong></span>
                                    </div>
                                    <div className={styles.rangeSliderWrapper}>
                                        <Range
                                            values={priceRange}
                                            step={step}
                                            min={validMinPrice}
                                            max={validMaxPrice}
                                            onChange={(values) => setPriceRange(values)} // Cập nhật state cục bộ khi kéo
                                            onFinalChange={handlePriceChangeFinal} // Cập nhật URL khi thả
                                            allowCross={false} // Không cho phép hai handle vượt qua nhau
                                            rtl={false} // Left-to-right
                                            renderTrack={({ props, children }) => (
                                                // Sử dụng div tùy chỉnh cho track để dùng getTrackBackground
                                                <div
                                                    onMouseDown={props.onMouseDown}
                                                    onTouchStart={props.onTouchStart}
                                                    style={{ ...props.style }}
                                                    className={styles.rangeTrackContainer} // Sử dụng class từ CSS module
                                                >
                                                    <div
                                                        ref={props.ref}
                                                        className={styles.rangeTrack} // Sử dụng class từ CSS module
                                                        style={{
                                                            background: getTrackBackground({
                                                                values: priceRange,
                                                                colors: ['var(--color-gray-300, #d1d5db)', 'var(--color-primary, #3498db)', 'var(--color-gray-300, #d1d5db)'], // Màu xám, xanh, xám
                                                                min: validMinPrice,
                                                                max: validMaxPrice
                                                            }),
                                                            // Thêm style cố định cho track nếu cần
                                                            height: '5px',
                                                             borderRadius: '4px',
                                                             cursor: 'pointer',
                                                        }}
                                                    >
                                                        {children} {/* Các handle được render bên trong */}
                                                    </div>
                                                </div>
                                            )}
                                             renderThumb={({ props }) => (
                                                <div
                                                    {...props}
                                                    className={styles.rangeThumb} // Sử dụng class từ CSS module
                                                    style={{
                                                        ...props.style,
                                                        // Thêm style cố định cho handle
                                                         height: '14px',
                                                         width: '14px',
                                                         backgroundColor: 'var(--color-primary, #3498db)',
                                                         borderRadius: '50%',
                                                         display: 'flex',
                                                         justifyContent: 'center',
                                                         alignItems: 'center',
                                                         boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
                                                         cursor: 'grab',
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                </>
                            ) : (
                                 // Trường hợp fetch xong nhưng khoảng giá không hợp lý
                                 // Giả định sharedStyles.noOptionsMessage tồn tại
                                 <p className={styles.noOptionsMessage}>Không có dữ liệu giá phù hợp để lọc.</p>
                            )}
                        </div>
                    )}
                </div>
            ) : null /* Không render section nếu không có data giá và không loading */ }


            {/* --- Bộ lọc Thương hiệu (API: brandName) --- */}
             { (availableBrands && availableBrands.length > 0) || isLoading ? (
                <div className={styles.filterGroup}>
                    <button className={styles.groupHeader} onClick={() => toggleSection(setIsBrandOpen)} aria-expanded={isBrandOpen} aria-controls="brand-content">
                        <span>Thương hiệu</span>
                         {/* Hiển thị indicator loading nếu đang tải và chưa có data brand */}
                         {isLoading && (!availableBrands || availableBrands.length === 0) ? (
                              <span className={styles.loadingIndicator}>...</span>
                         ) : isBrandOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {isBrandOpen && (
                        <div id="brand-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                             {/* Hiển thị loading message nếu đang tải và chưa có data */}
                             {isLoading && (!availableBrands || availableBrands.length === 0) ? (
                                <p className={styles.loadingMessage}>Đang tải thương hiệu...</p>
                             ) : availableBrands && availableBrands.length > 0 ? (
                                <>
                                    {/* Option "Tất cả" */}
                                    <label className={styles.radioLabel}>
                                        <input
                                            type="radio" name="brandFilter" value=""
                                            checked={!brandName}
                                            onChange={handleBrandChange}
                                            className={styles.radioInput}
                                        />
                                        <span className={styles.labelText}>Tất cả</span>
                                    </label>
                                    {/* Render actual brands */}
                                    {availableBrands.map((b) => (
                                        <label key={b.brandId || b.brandName} className={styles.radioLabel}>
                                            <input
                                                type="radio" name="brandFilter" value={b.brandName}
                                                checked={brandName === b.brandName}
                                                onChange={handleBrandChange}
                                                className={styles.radioInput}
                                            />
                                            <span className={styles.labelText}>{b.brandName}</span>
                                        </label>
                                    ))}
                                </>
                             ) : (
                                 // Trường hợp fetch xong nhưng danh sách rỗng
                                 // Giả định sharedStyles.noOptionsMessage tồn tại
                                 <p className={styles.noOptionsMessage}>Không có thương hiệu</p>
                             )}
                        </div>
                    )}
                </div>
            ) : null /* Không render section nếu không có data và không loading */ }


            {/* --- Bộ lọc CPU (API: cpu) - CHỈ HIỂN THỊ KHI CATEGORY LÀ LAPTOP --- */}
            { /* Kiểm tra nestedCpuOptions. useMemo này sẽ trả về null nếu category không phải Laptop */ }
            { nestedCpuOptions && nestedCpuOptions.length > 0 ? ( // Chỉ hiển thị nếu nestedCpuOptions không null và có data
                <div className={styles.filterGroup}>
                    <button className={styles.groupHeader} onClick={() => toggleSection(setIsCpuOpen)} aria-expanded={isCpuOpen} aria-controls="cpu-content">
                        <span>Chip xử lý / CPU</span>
                         {isCpuOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {isCpuOpen && (
                        <div id="cpu-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                             {/* Map qua danh sách các hãng chip */}
                            {nestedCpuOptions.map(({ manufacturer, models }) => (
                                <div key={manufacturer} className={styles.nestedFilterGroup}> {/* Thêm class cho nhóm lồng nhau */}
                                    <button
                                        className={styles.groupHeader} // Dùng lại style group header cho hãng
                                        onClick={() => toggleManufacturerSection(manufacturer)}
                                        aria-expanded={openCpuManufacturers.has(manufacturer)}
                                        aria-controls={`cpu-${manufacturer.replace(/\s+/g, '-')}-content`} // ID động, thay khoảng trắng bằng '-'
                                    >
                                        <span>{manufacturer}</span>
                                        {/* Hiển thị số lượng đời chip của hãng này */}
                                        {models && models.length > 0 && <span className={styles.optionCount}>({models.length})</span>}
                                        {openCpuManufacturers.has(manufacturer) ? <FiChevronUp /> : <FiChevronDown />}
                                    </button>
                                    {/* Nội dung của hãng chip (các đời chip) */}
                                    {openCpuManufacturers.has(manufacturer) && models && models.length > 0 && (
                                        <div id={`cpu-${manufacturer.replace(/\s+/g, '-')}-content`} className={`${styles.groupContent} ${styles.nestedGroupContent}`}> {/* Thêm class cho nội dung lồng nhau */}
                                            {models.map((specificModel) => (
                                                // Sử dụng specificModel làm key, đảm bảo duy nhất
                                                <label key={`cpu-${specificModel}`} className={styles.checkboxLabel}>
                                                    <input
                                                        type="checkbox"
                                                        value={specificModel} // Giá trị là chuỗi đời chip đầy đủ (vd: "Intel Core i5")
                                                        checked={(cpu || []).includes(specificModel)} // Check nếu đời chip này có trong mảng 'cpu' đang chọn
                                                        onChange={() => handleCheckboxChange('cpu', specificModel)} // Call handler với key 'cpu' và chuỗi đời chip
                                                        className={styles.checkboxInput}
                                                    />
                                                    <span className={styles.labelText}>{specificModel}</span> {/* Hiển thị chuỗi đời chip */}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {/* Message nếu hãng chip không có đời chip nào (không nên xảy ra với static data này) */}
                                     {openCpuManufacturers.has(manufacturer) && (!models || models.length === 0) && (
                                        <p className={styles.noOptionsMessage}>Không có đời chip nào</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : isLoading && currentCategory.toLowerCase() === 'laptop' ? (
                 // Hiển thị loading nếu category là Laptop nhưng nestedCpuOptions chưa có data (chờ ProductListPage fetch sản phẩm)
                 <div className={styles.filterGroup}> {/* Có thể hiển thị tiêu đề và spinner */}
                     <button className={styles.groupHeader}>
                        <span>Chip xử lý / CPU</span>
                         {/* Giả định styles.loadingIndicator tồn tại */}
                          <span className={styles.loadingIndicator}>...</span>
                     </button>
                      {isCpuOpen && ( // Vẫn kiểm tra isCpuOpen để quyết định hiển thị loading message hay không
                         <div id="cpu-content" className={styles.groupContent}>
                              {/* Giả định sharedStyles.loadingMessage tồn tại */}
                             <p className={styles.loadingMessage}>Đang tải tùy chọn CPU...</p>
                         </div>
                      )}
                 </div>
             ) : null /* Không hiển thị section nếu không phải Laptop hoặc không có tùy chọn CPU */ }


            {/* --- Bộ lọc RAM (Dung lượng) (API: memory) --- */}
            {/* Hiển thị nếu có các tùy chọn tĩnh (hoặc data động) */}
            { availableRamCapacityOptionsUI && availableRamCapacityOptionsUI.length > 0 ? (
                <div className={styles.filterGroup}>
                    <button className={styles.groupHeader} onClick={() => toggleSection(setIsMemoryOpen)} aria-expanded={isMemoryOpen} aria-controls="memory-content">
                        <span>RAM (Dung lượng)</span>
                        {isMemoryOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {isMemoryOpen && (
                        <div id="memory-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                            {availableRamCapacityOptionsUI.map((memoryValueOption) => (
                                // Sử dụng memoryValueOption làm key, đảm bảo duy nhất
                                <label key={`memory-${memoryValueOption}`} className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        value={memoryValueOption}
                                        checked={(memory || []).includes(memoryValueOption)}
                                        onChange={() => handleCheckboxChange('memory', memoryValueOption)}
                                        className={styles.checkboxInput}
                                    />
                                    <span className={styles.labelText}>{memoryValueOption}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            ) : null /* Hoặc hiển thị loading/no options nếu dùng data động */ }


            {/* --- Bộ lọc Dung lượng lưu trữ / Ổ cứng (API: storage) --- */}
            {/* Hiển thị nếu có các tùy chọn tĩnh (hoặc data động) */}
             { availableStorageOptionsUI && availableStorageOptionsUI.length > 0 ? (
                <div className={styles.filterGroup}>
                    <button className={styles.groupHeader} onClick={() => toggleSection(setIsStorageOpen)} aria-expanded={isStorageOpen} aria-controls="storage-content">
                        <span>
                            {/* Có thể đổi tên hiển thị dựa trên category, ví dụ: "Ổ cứng (SSD/HDD)" cho Laptop */}
                            {currentCategory.toLowerCase() === 'laptop' ? 'Ổ cứng (SSD/HDD)' : 'Dung lượng lưu trữ'}
                        </span>
                        {isStorageOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {isStorageOpen && (
                        <div id="storage-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                            {availableStorageOptionsUI.map((storageValueOption) => (
                                // Sử dụng storageValueOption làm key, đảm bảo duy nhất
                                <label key={`storage-${storageValueOption}`} className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        value={storageValueOption}
                                        checked={(storage || []).includes(storageValueOption)}
                                        onChange={() => handleCheckboxChange('storage', storageValueOption)}
                                        className={styles.checkboxInput}
                                    />
                                    <span className={styles.labelText}>{storageValueOption}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            ) : null /* Hoặc hiển thị loading/no options nếu dùng data động */ }

             {/* --- Bộ lọc Tốc độ làm mới (Refresh Rate) (API: refreshRate) --- */}
             {/* Hiển thị nếu có các tùy chọn tĩnh (hoặc data động) */}
             { availableRefreshRateOptionsUI && availableRefreshRateOptionsUI.length > 0 ? (
                <div className={styles.filterGroup}>
                    <button className={styles.groupHeader} onClick={() => toggleSection(setIsRefreshRateOpen)} aria-expanded={isRefreshRateOpen} aria-controls="refreshRate-content">
                        <span>Tốc độ làm mới</span>
                        {isRefreshRateOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {isRefreshRateOpen && (
                        <div id="refreshRate-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                            {availableRefreshRateOptionsUI.map((rateOption) => (
                                // Sử dụng rateOption làm key, đảm bảo duy nhất
                                <label key={`refreshRate-${rateOption}`} className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        value={rateOption}
                                        checked={(refreshRate || []).includes(rateOption)}
                                        onChange={() => handleCheckboxChange('refreshRate', rateOption)}
                                        className={styles.checkboxInput}
                                    />
                                    <span className={styles.labelText}>{rateOption}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
             ) : null /* Hoặc hiển thị loading/no options nếu dùng data động */ }


        </aside>
    );
};

export default FilterSortPanel;