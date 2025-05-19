import React, { useState, useEffect } from 'react';
import styles from './FilterSortPanel.module.css'; // Đảm bảo đường dẫn file CSS Module này chính xác
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Range, getTrackBackground } from 'react-range';

// --- Hàm định dạng tiền tệ ---
const formatCurrency = (amount, hideSymbol = false) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '';
    const options = {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    };
    if (hideSymbol)
        options.style = 'decimal';
    let formatted = new Intl.NumberFormat('vi-VN', options).format(amount);
    if (hideSymbol)
        return formatted;
    return formatted;
};

// --- Các tùy chọn lọc cố định (Dùng cho UI lọc dung lượng RAM và Lưu trữ/Ổ cứng) ---
const availableRamCapacityOptions = ['2GB', '4GB', '6GB', '8GB', '12GB', '16GB', '32GB', '64GB'];
// Danh sách này vẫn dùng chung cho cả Smartphone và Laptop trong UI filter
const availableStorageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];

const FilterSortPanel = ({
    currentFilters,         // Object chứa các bộ lọc hiện tại (bao gồm ramCapacity, storage, cpu, ramType)
    onFilterChange,         // Hàm callback để cập nhật bộ lọc ở component cha
    availableBrands = [],   // Danh sách các thương hiệu có sẵn
    minPrice = 0,           // Giá tối thiểu
    maxPrice = 50000000,    // Giá tối đa
    currentCategory = '',      // Category hiện tại (QUAN TRỌNG để hiển thị filter đúng ngữ cảnh)
    availableCpuOptions = [],  // Danh sách TÙY CHỌN LỌC CPU (đã được chuẩn hóa)
    availableRamTypes = []   // Danh sách TÙY CHỌN LỌC Loại RAM (chỉ cho Laptop)
}) => {
    // --- State quản lý trạng thái mở/đóng của các section ---
    const [isSortOpen, setIsSortOpen] = useState(true);
    const [isPriceOpen, setIsPriceOpen] = useState(true);
    const [isBrandOpen, setIsBrandOpen] = useState(true);
    const [isRamCapacityOpen, setIsRamCapacityOpen] = useState(true); // State cho dung lượng RAM
    const [isStorageOpen, setIsStorageOpen] = useState(true);        // State cho lưu trữ/ổ cứng
    const [isCpuOpen, setIsCpuOpen] = useState(true);
    const [isRamTypeOpen, setIsRamTypeOpen] = useState(true);       // State cho loại RAM Laptop

    // --- Trích xuất các giá trị lọc hiện tại từ props ---
    const {
        sort = '',
        brand = '',
        price_gte = minPrice.toString(),
        price_lte = maxPrice.toString(),
        ramCapacity = [], // Filter key cho dung lượng RAM
        storage = [],       // Filter key cho lưu trữ/ổ cứng (key giữ nguyên là 'storage')
        cpu = [],
        ramType = []     // Filter key cho loại RAM
    } = currentFilters;

    // --- State quản lý giá trị của thanh trượt giá ---
    const [priceRange, setPriceRange] = useState([
        parseInt(price_gte, 10) || minPrice,
        parseInt(price_lte, 10) || maxPrice
    ]);

    // --- Effect cập nhật thanh trượt giá khi bộ lọc giá thay đổi từ bên ngoài ---
    useEffect(() => {
        const numGte = parseInt(price_gte, 10);
        const numLte = parseInt(price_lte, 10);
        const currentRangeMin = priceRange[0]; // Giữ nguyên kiểu number
        const currentRangeMax = priceRange[1];

        if ((!isNaN(numGte) && numGte !== currentRangeMin) || (!isNaN(numLte) && numLte !== currentRangeMax)) {
            console.log(`FilterSortPanel: Updating priceRange state from props [${numGte || minPrice}, ${numLte || maxPrice}]`);
            setPriceRange([
                !isNaN(numGte) ? numGte : minPrice,
                !isNaN(numLte) ? numLte : maxPrice
            ]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [price_gte, price_lte, minPrice, maxPrice]);

    // --- Hàm xử lý thay đổi bộ lọc ---
    const handleSortChange = (e) => {
        onFilterChange({ sort: e.target.value });
    };

    const handleBrandChange = (e) => {
        onFilterChange({ brand: e.target.value });
    };

    // Hàm được gọi khi người dùng thả thanh trượt giá
    const handlePriceChangeFinal = (values) => {
        const currentGte = parseInt(price_gte, 10) || minPrice;
        const currentLte = parseInt(price_lte, 10) || maxPrice;
        if (values[0] !== currentGte || values[1] !== currentLte) {
            onFilterChange({ price_gte: values[0].toString(), price_lte: values[1].toString() });
        }
    };

    // --- Hàm xử lý thay đổi bộ lọc cho các checkbox (Chung) ---
    const handleCheckboxChange = (filterKey, value) => {
        const currentSelected = currentFilters[filterKey] || [];
        let newSelected;
        if (currentSelected.includes(value)) {
            newSelected = currentSelected.filter(item => item !== value);
        } else {
            newSelected = [...currentSelected, value];
        }
        onFilterChange({ [filterKey]: newSelected });
    };

    // --- Hàm tiện ích để toggle mở/đóng section ---
    const toggleSection = (setter) => setter(prev => !prev);

    // --- Tính toán giá trị min/max hợp lệ và bước nhảy cho thanh trượt giá ---
    const validMinPrice = isNaN(parseInt(minPrice.toString(), 10)) ? 0 : parseInt(minPrice.toString(), 10);
    const validMaxPrice = isNaN(parseInt(maxPrice.toString(), 10)) || parseInt(maxPrice.toString(), 10) <= validMinPrice
        ? validMinPrice + 100000
        : parseInt(maxPrice.toString(), 10);
    const step = Math.max(100000, Math.round((validMaxPrice - validMinPrice) / 100));

    // --- Xác định xem có nên hiển thị bộ lọc Laptop không ---
    const isLaptopCategory = currentCategory.toLowerCase() === 'laptop';

    return (
        <aside className={styles.filterPanel}>
            <h3 className={styles.panelTitle}><FiFilter /> Bộ lọc & Sắp xếp</h3>

            {/* --- Bộ lọc Sắp xếp --- */}
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
                        </select>
                    </div>
                )}
            </div>

            {/* --- Bộ lọc Khoảng giá --- */}
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
                                <p className={styles.priceError}>Không đủ dữ liệu để lọc giá.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* --- Bộ lọc Thương hiệu --- */}
            <div className={styles.filterGroup}>
                <button className={styles.groupHeader} onClick={() => toggleSection(setIsBrandOpen)} aria-expanded={isBrandOpen} aria-controls="brand-content">
                    <span>Thương hiệu</span>
                    {isBrandOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {isBrandOpen && (
                    <div id="brand-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio" name="brandFilter" value=""
                                checked={!brand} onChange={handleBrandChange}
                                className={styles.radioInput}
                            />
                            <span className={styles.labelText}>Tất cả</span>
                        </label>
                        {availableBrands.length > 0 ? availableBrands.map((b) => (
                            <label key={b.brandId || b.brandName} className={styles.radioLabel}>
                                <input
                                    type="radio" name="brandFilter" value={b.brandName}
                                    checked={brand === b.brandName} onChange={handleBrandChange}
                                    className={styles.radioInput}
                                />
                                <span className={styles.labelText}>{b.brandName}</span>
                            </label>
                        )) : <p className={styles.noOptions}>Không có thương hiệu</p>}
                    </div>
                )}
            </div>

            {/* --- Bộ lọc CPU --- */}
            {availableCpuOptions.length > 0 && (
                <div className={styles.filterGroup}>
                    <button className={styles.groupHeader} onClick={() => toggleSection(setIsCpuOpen)} aria-expanded={isCpuOpen} aria-controls="cpu-content">
                        <span>Chip xử lý / CPU</span>
                        {isCpuOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {isCpuOpen && (
                        <div id="cpu-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                            {availableCpuOptions.map((cpuValueOption) => (
                                <label key={`cpu-${cpuValueOption}`} className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        value={cpuValueOption}
                                        checked={cpu.includes(cpuValueOption)}
                                        onChange={() => handleCheckboxChange('cpu', cpuValueOption)}
                                        className={styles.checkboxInput}
                                    />
                                    <span className={styles.labelText}>{cpuValueOption}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- Bộ lọc RAM (Dung lượng) --- */}
            <div className={styles.filterGroup}>
                <button className={styles.groupHeader} onClick={() => toggleSection(setIsRamCapacityOpen)} aria-expanded={isRamCapacityOpen} aria-controls="ramCapacity-content">
                    <span>RAM (Dung lượng)</span>
                    {isRamCapacityOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {isRamCapacityOpen && (
                    <div id="ramCapacity-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                        {availableRamCapacityOptions.map((ramCapacityValue) => (
                            <label key={`ramCapacity-${ramCapacityValue}`} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    value={ramCapacityValue}
                                    checked={ramCapacity.includes(ramCapacityValue)}
                                    onChange={() => handleCheckboxChange('ramCapacity', ramCapacityValue)}
                                    className={styles.checkboxInput}
                                />
                                <span className={styles.labelText}>{ramCapacityValue}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* --- Bộ lọc Loại RAM (Chỉ cho Laptop) --- */}
            {isLaptopCategory && availableRamTypes.length > 0 && (
                <div className={styles.filterGroup}>
                    <button className={styles.groupHeader} onClick={() => toggleSection(setIsRamTypeOpen)} aria-expanded={isRamTypeOpen} aria-controls="ramType-content">
                        <span>Loại RAM (Laptop)</span>
                        {isRamTypeOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {isRamTypeOpen && (
                        <div id="ramType-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                            {availableRamTypes.map((ramTypeValue) => (
                                <label key={`ramType-${ramTypeValue}`} className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        value={ramTypeValue}
                                        checked={ramType.includes(ramTypeValue)}
                                        onChange={() => handleCheckboxChange('ramType', ramTypeValue)}
                                        className={styles.checkboxInput}
                                    />
                                    <span className={styles.labelText}>{ramTypeValue}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- Bộ lọc Dung lượng lưu trữ / Ổ cứng --- */}
            {/* Key vẫn là 'storage', chỉ thay đổi label hiển thị */}
            <div className={styles.filterGroup}>
                <button className={styles.groupHeader} onClick={() => toggleSection(setIsStorageOpen)} aria-expanded={isStorageOpen} aria-controls="storage-content">
                    {/* *** THAY ĐỔI NHÃN Ở ĐÂY *** */}
                    <span>
                        {isLaptopCategory ? 'Dung lượng ổ cứng' : 'Dung lượng lưu trữ'}
                    </span>
                    {isStorageOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {isStorageOpen && (
                    <div id="storage-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                        {/* UI options và logic vẫn dùng key 'storage' */}
                        {availableStorageOptions.map((storageValue) => (
                            <label key={`storage-${storageValue}`} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    value={storageValue}
                                    checked={storage.includes(storageValue)}
                                    // Handler vẫn dùng key 'storage'
                                    onChange={() => handleCheckboxChange('storage', storageValue)}
                                    className={styles.checkboxInput}
                                />
                                <span className={styles.labelText}>{storageValue}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

        </aside>
    );
};

export default FilterSortPanel;