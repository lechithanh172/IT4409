import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from './FilterSortPanel.module.css';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Range, getTrackBackground } from 'react-range';
// import Spinner from '../Spinner/Spinner'; // Import Spinner đã bị comment out đúng cách

// --- Hàm định dạng tiền tệ ---
const formatCurrency = (amount, hideSymbol = false) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '';
    const options = {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    };
    if (hideSymbol) options.style = 'decimal';
    let formatted = new Intl.NumberFormat('vi-VN', options).format(amount);
    if (hideSymbol) formatted = formatted.replace(/\s?₫/, '');
    return formatted;
};

// --- Cấu trúc dữ liệu lồng nhau cho các tùy chọn lọc CPU ---
// Key cấp 1 là category, key cấp 2 là tên hãng chip, value là mảng các đời chip cụ thể
// Các chuỗi trong mảng đời chip (value) PHẢI KHỚP CHÍNH XÁC với giá trị bạn muốn gửi đến API FILTER endpoint cho trường 'cpu'
const CPU_OPTIONS_NESTED = {
    LAPTOP: {
        'Apple Silicon': ['Apple M1', 'Apple M1 Pro', 'Apple M1 Max', 'Apple M2', 'Apple M2 Pro', 'Apple M2 Max', 'Apple M3', 'Apple M3 Pro', 'Apple M3 Max'],
        'Intel': ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'Intel Core Ultra 5', 'Intel Core Ultra 7', 'Intel Core Ultra 9'],
        'AMD': ['AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9'],
    },
    SMARTPHONE: {
        'Apple': ['A14 Bionic', 'A15 Bionic', 'A16 Bionic', 'A17 Pro'],
        'Samsung Exynos': ['Exynos 1280', 'Exynos 2100', 'Exynos 2200', 'Exynos 2400'],
        'Qualcomm Snapdragon': ['Snapdragon 778G', 'Snapdragon 8 Gen 1', 'Snapdragon 8 Gen 2', 'Snapdragon 8 Gen 3', 'Snapdragon 8s Gen 3'],
        'MediaTek': ['Dimensity 900', 'Dimensity 1200', 'Dimensity 8200', 'Dimensity 9200', 'Dimensity 9300'],
        'Huawei Kirin': ['Kirin 9000'],
    },
};

// Các tùy chọn lọc cố định khác (không lồng nhau)
const availableRamCapacityOptionsUI = ['2GB', '4GB', '6GB', '8GB', '12GB', '16GB', '32GB', '64GB'];
const availableStorageOptionsUI = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];
const availableRefreshRateOptionsUI = ['60Hz', '90Hz', '120Hz', '144Hz', '240Hz'];


const FilterSortPanel = ({
    currentFilters,
    onFilterChange,
    availableBrands = [],
    availableCategories = [],
    minPrice = 0,
    maxPrice = 100000000,
    currentCategory = '',
    isLoading = false,
}) => {
    // --- State quản lý trạng thái mở/đóng của các section ---
    const [isSortOpen, setIsSortOpen] = useState(true);
    const [isPriceOpen, setIsPriceOpen] = useState(true);
    const [isBrandOpen, setIsBrandOpen] = useState(true);
    const [isCategoryOpen, setIsCategoryOpen] = useState(true);
    const [isMemoryOpen, setIsMemoryOpen] = useState(true);
    const [isStorageOpen, setIsStorageOpen] = useState(true);
    const [isCpuOpen, setIsCpuOpen] = useState(true); // State cho section CPU chính
    const [isRefreshRateOpen, setIsRefreshRateOpen] = useState(true);

    // --- State quản lý trạng thái mở/đóng của từng hãng chip con ---
    // Sử dụng Set để lưu trữ tên các hãng đang mở
    const [openCpuManufacturers, setOpenCpuManufacturers] = useState(new Set());

    // --- Trích xuất các giá trị lọc hiện tại từ props ---
    const {
        category: currentCategoryFilter = '',
        sort = '',
        brandName = '',
        price_gte = '',
        price_lte = '',
        memory = [], // array
        storage = [], // array
        cpu = [], // array (các giá trị CPU được chọn) - vd: ["Intel Core i5", "Apple M1"]
        refreshRate = [],
    } = currentFilters;

    // --- Calculate valid min/max price for the slider ---
    const { validMinPrice, validMaxPrice, step } = useMemo(() => {
        const min = typeof minPrice === 'number' && !isNaN(minPrice) ? minPrice : 0;
        const max = typeof maxPrice === 'number' && !isNaN(maxPrice) ? maxPrice : 100000000;
        const effectiveMax = max <= min ? min + 100000 : max;
        const calculatedStep = Math.max(100000, Math.round((effectiveMax - min) / 100));
        return { validMinPrice: min, validMaxPrice: effectiveMax, step: calculatedStep };
    }, [minPrice, maxPrice]);


    // --- State quản lý giá trị của thanh trượt giá ---
    const [priceRange, setPriceRange] = useState([
        parseInt(price_gte, 10) || validMinPrice,
        parseInt(price_lte, 10) || validMaxPrice
    ]);

    // --- Effect cập nhật thanh trượt giá khi bộ lọc giá thay đổi từ bên ngoài ---
    useEffect(() => {
        const newMin = parseInt(price_gte, 10) || validMinPrice;
        const newMax = parseInt(price_lte, 10) || validMaxPrice;
        const validatedNewMin = Math.max(validMinPrice, Math.min(newMin, validMaxPrice));
        const validatedNewMax = Math.max(validMinPrice, Math.min(newMax, validMaxPrice));

        const isCurrentStateMatchingProps = priceRange[0] === validatedNewMin && priceRange[1] === validatedNewMax;

        if (!isCurrentStateMatchingProps) {
            console.log(`FilterSortPanel: Updating priceRange state from props [${validatedNewMin}, ${validatedNewMax}]`);
            setPriceRange([validatedNewMin, validatedNewMax]);
        }
    }, [price_gte, price_lte, validMinPrice, validMaxPrice]);


    // --- Tạo danh sách tùy chọn CPU lồng nhau dựa trên currentCategory ---
    // Danh sách này dùng để hiển thị UI lồng nhau
    const nestedCpuOptions = useMemo(() => {
        const categoryKey = currentCategory.toLowerCase();
        let manufacturersData = [];

        if (categoryKey === 'Laptop' || categoryKey === 'Smartphone') {
             // Cho các category đã biết, lấy data từ cấu trúc lồng nhau
            const optionsForCategory = CPU_OPTIONS_NESTED[categoryKey] || {};
             manufacturersData = Object.entries(optionsForCategory).map(([manufacturer, models]) => ({
                 manufacturer,
                 models: models.sort() // Sort đời chip
             }));
        } else {
            // Cho category rỗng ('') hoặc category khác không xác định
            // Kết hợp tất cả các đời chip từ tất cả các hãng qua tất cả các category
            const allManufacturers = new Set();
            Object.values(CPU_OPTIONS_NESTED).forEach(options => {
               Object.keys(options).forEach(manufacturer => allManufacturers.add(manufacturer));
            });

             manufacturersData = Array.from(allManufacturers).sort().map(manufacturer => {
                 // Đối với mỗi hãng, tìm tất cả các đời chip của họ trên TẤT CẢ category
                 const modelsForThisManufacturer = new Set();
                 Object.values(CPU_OPTIONS_NESTED).forEach(options => {
                     if(options[manufacturer]) {
                         options[manufacturer].forEach(model => modelsForThisManufacturer.add(model));
                     }
                 });
                 return {
                     manufacturer: manufacturer,
                     models: Array.from(modelsForThisManufacturer).sort() // Loại bỏ trùng lặp và sort đời chip
                 };
             });
            // console.log("Combined manufacturersData for non-specific category:", manufacturersData); // Debugging log

        }

        // Sort hãng chip theo tên
        return manufacturersData.sort((a, b) => a.manufacturer.localeCompare(b.manufacturer));

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


    // --- Hàm xử lý thay đổi bộ lọc ---
     const handleCategoryChange = (e) => {
         const newCategory = e.target.value;
         // Khi category thay đổi, reset các bộ lọc con
         onFilterChange({
             category: newCategory,
             cpu: [], // Reset CPU filter
             storage: [], // Reset Storage filter
             memory: [], // Reset Memory filter
             refreshRate: [] // Reset RefreshRate filter
         });
         // Tùy chọn: đóng tất cả các hãng chip con khi đổi category
         setOpenCpuManufacturers(new Set());
     };

    const handleSortChange = (e) => {
        onFilterChange({ sort: e.target.value });
    };

    const handleBrandChange = (e) => {
        onFilterChange({ brandName: e.target.value });
    };

    // Hàm được gọi khi người dùng thả thanh trượt giá
    const handlePriceChangeFinal = (values) => {
         const currentGte = parseInt(price_gte, 10);
         const currentLte = parseInt(price_lte, 10);
         const compareGte = isNaN(currentGte) ? validMinPrice : currentGte;
         const compareLte = isNaN(currentLte) ? validMaxPrice : currentLte;

        if (values[0] !== compareGte || values[1] !== compareLte) { // Compare slider values with *parsed prop* values
             console.log(`FilterSortPanel: onFinalChange triggered with [${values[0]}, ${values[1]}]. Comparing to props [${compareGte}, ${compareLte}]. Calling onFilterChange.`);
             onFilterChange({ price_gte: values[0].toString(), price_lte: values[1].toString() });
         } else {
             console.log(`FilterSortPanel: onFinalChange - no effective change detected compared to current filters.`);
         }
    };

    // --- Hàm xử lý thay đổi bộ lọc cho các checkbox (Chung) ---
    // filterKey sẽ là 'cpu', 'storage', 'memory', or 'refreshRate'
    // value là chuỗi giá trị checkbox (ví dụ: 'Intel Core i5', '16GB')
    const handleCheckboxChange = (filterKey, value) => {
        // Lấy mảng hiện tại cho filterKey từ props (vd: currentFilters.cpu)
        const currentSelected = currentFilters[filterKey] || [];
        let newSelected;
        if (currentSelected.includes(value)) {
            newSelected = currentSelected.filter(item => item !== value);
        } else {
            newSelected = [...currentSelected, value];
        }
        console.log(`FilterSortPanel: Checkbox changed for ${filterKey}: "${value}". New selected:`, newSelected);
        onFilterChange({ [filterKey]: newSelected }); // Gửi mảng mới lên ProductListPage
    };

    // --- Hàm tiện ích để toggle mở/đóng section ---
    const toggleSection = (setter) => setter(prev => !prev);

    // --- Render ---
    return (
        <aside className={styles.filterPanel}>
            <h3 className={styles.panelTitle}><FiFilter /> Bộ lọc & Sắp xếp</h3>

             {/* --- Bộ lọc Category (API: type) --- */}
             {/* Chỉ hiển thị nếu có danh sách category được truyền vào và danh sách không rỗng */}
            { availableCategories && availableCategories.length > 0 ? ( // Removed isLoading check here
                <div className={styles.filterGroup}>
                    <button className={styles.groupHeader} onClick={() => toggleSection(setIsCategoryOpen)} aria-expanded={isCategoryOpen} aria-controls="category-content">
                        <span>Danh mục sản phẩm</span>
                        {isCategoryOpen ? <FiChevronUp /> : <FiChevronDown />} {/* Removed spinner */}
                    </button>
                    {isCategoryOpen && (
                        <div id="category-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
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
                        </div>
                    )}
                </div>
            ) : !isLoading && (!availableCategories || availableCategories.length === 0) ? ( // Show message only if not loading and list is empty/null/undefined
                 <p className={styles.noOptions}>Không có danh mục</p>
            ) : null }


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
            {/* Price filter is always available if the range is valid */}
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
                            {validMinPrice < validMaxPrice ? (
                                <Range
                                    values={priceRange}
                                    step={step}
                                    min={validMinPrice}
                                    max={validMaxPrice}
                                    onChange={(values) => setPriceRange(values)}
                                    onFinalChange={handlePriceChangeFinal}
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
                                                        colors: ['#e5e7eb', '#6366f1', '#e5e7eb'],
                                                        min: validMinPrice,
                                                        max: validMaxPrice
                                                    }),
                                                }}
                                            >
                                                {children}
                                            </div>
                                        </div>
                                    )}
                                    renderThumb={({ props }) => (
                                        <div
                                            {...props}
                                            className={styles.rangeThumb}
                                            style={{ ...props.style }}
                                        />
                                    )}
                                />
                            ) : (
                                <p className={styles.noOptions}>Không có dữ liệu giá phù hợp để lọc.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* --- Bộ lọc Thương hiệu (API: brandName) --- */}
             { (availableBrands && availableBrands.length > 0) ? ( // Removed isLoading check from here
                <div className={styles.filterGroup}>
                    <button className={styles.groupHeader} onClick={() => toggleSection(setIsBrandOpen)} aria-expanded={isBrandOpen} aria-controls="brand-content">
                        <span>Thương hiệu</span>
                        {isBrandOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {isBrandOpen && (
                        <div id="brand-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                             {availableBrands && availableBrands.length > 0 ? (
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
                             ) : null }
                             {/* Show message if brands were fetched but list is empty */}
                             { !isLoading && (!availableBrands || availableBrands.length === 0) && <p className={styles.noOptions}>Không có thương hiệu</p>}
                        </div>
                    )}
                </div>
            ) : !isLoading ? (
                 <p className={styles.noOptions}>Không có thương hiệu</p>
            ) : null }


            {/* --- Bộ lọc CPU (API: cpu) --- */}
            {/* Hiển thị nếu có tùy chọn CPU tĩnh cho category hiện tại (luôn có nếu category là laptop/smartphone hoặc rỗng) */}
            { nestedCpuOptions && nestedCpuOptions.length > 0 ? (
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
                                        aria-controls={`cpu-${manufacturer.replace(/\s+/g, '-')}-content`} // ID động
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
                                    {/* Message nếu hãng chip không có đời chip nào (không nên xảy ra với static data) */}
                                    {openCpuManufacturers.has(manufacturer) && (!models || models.length === 0) && (
                                        <p className={styles.noOptions}>Không có đời chip nào</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : null /* Don't render section if staticOptions is empty (e.g., category is something else entirely) */ }


            {/* --- Bộ lọc RAM (Dung lượng) (API: memory) --- */}
            <div className={styles.filterGroup}>
                <button className={styles.groupHeader} onClick={() => toggleSection(setIsMemoryOpen)} aria-expanded={isMemoryOpen} aria-controls="memory-content">
                    <span>RAM (Dung lượng)</span>
                    {isMemoryOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {isMemoryOpen && (
                    <div id="memory-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                        {availableRamCapacityOptionsUI.map((memoryValueOption) => (
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

            {/* --- Bộ lọc Dung lượng lưu trữ / Ổ cứng (API: storage) --- */}
            <div className={styles.filterGroup}>
                <button className={styles.groupHeader} onClick={() => toggleSection(setIsStorageOpen)} aria-expanded={isStorageOpen} aria-controls="storage-content">
                    <span>
                        {currentCategory.toLowerCase() === 'laptop' ? 'Dung lượng ổ cứng' : 'Dung lượng lưu trữ'}
                    </span>
                    {isStorageOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {isStorageOpen && (
                    <div id="storage-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                        {availableStorageOptionsUI.map((storageValueOption) => (
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

             {/* --- Bộ lọc Tốc độ làm mới (Refresh Rate) (API: refreshRate) --- */}
            <div className={styles.filterGroup}>
                <button className={styles.groupHeader} onClick={() => toggleSection(setIsRefreshRateOpen)} aria-expanded={isRefreshRateOpen} aria-controls="refreshRate-content">
                    <span>Tốc độ làm mới</span>
                    {isRefreshRateOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {isRefreshRateOpen && (
                    <div id="refreshRate-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                        {availableRefreshRateOptionsUI.map((rateOption) => (
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


        </aside>
    );
};

export default FilterSortPanel;