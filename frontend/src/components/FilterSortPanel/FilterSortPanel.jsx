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

// --- Các tùy chọn lọc cố định cho UI checkboxes ---
const availableRamCapacityOptionsUI = ['2GB', '4GB', '6GB', '8GB', '12GB', '16GB', '32GB', '64GB'];
const availableStorageOptionsUI = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];


const FilterSortPanel = ({
    currentFilters,         // Object chứa các bộ lọc hiện tại
    onFilterChange,         // Hàm callback để cập nhật bộ lọc ở component cha
    availableBrands = [],   // Danh sách các thương hiệu có sẵn
    minPrice = 0,           // Giá tối thiểu (từ dữ liệu fetched ở ProductListPage)
    maxPrice = 50000000,    // Giá tối đa (từ dữ liệu fetched ở ProductListPage)
    currentCategory = '',      // Category hiện tại
    availableCpuOptions = [],  // Danh sách TÙY CHỌN LỌC CPU (đã được chuẩn hóa từ dữ liệu fetched)
}) => {
    // --- State quản lý trạng thái mở/đóng của các section ---
    const [isSortOpen, setIsSortOpen] = useState(true);
    const [isPriceOpen, setIsPriceOpen] = useState(true);
    const [isBrandOpen, setIsBrandOpen] = useState(true);
    const [isMemoryOpen, setIsMemoryOpen] = useState(true);
    const [isStorageOpen, setIsStorageOpen] = useState(true);
    const [isCpuOpen, setIsCpuOpen] = useState(true);

    // --- Trích xuất các giá trị lọc hiện tại từ props ---
    const {
        sort = '',
        // API key is brandName, URL param is brandName, internal state can use brandName for consistency
        brandName = '',
        price_gte = minPrice.toString(),
        price_lte = maxPrice.toString(),
        // API key and URL param is memory, internal state uses memory
        memory = [], // Filter key cho dung lượng RAM (API: 'memory')
        // API key and URL param is storage, internal state uses storage
        storage = [],       // Filter key cho lưu trữ/ổ cứng (API: 'storage')
        // API key and URL param is cpu, internal state uses cpu
        cpu = [],           // Filter key cho CPU (API: 'cpu')
    } = currentFilters;


    // --- FIX START: Calculate valid min/max price BEFORE state and effect ---
    // Calculate valid min/max price for the slider based on props minPrice/maxPrice
    const validMinPrice = isNaN(parseInt(minPrice.toString(), 10)) ? 0 : parseInt(minPrice.toString(), 10);
    const validMaxPrice = isNaN(parseInt(maxPrice.toString(), 10)) || parseInt(maxPrice.toString(), 10) <= validMinPrice
        ? validMinPrice > 0 ? validMinPrice + 100000 : 100000 // Ensure max > min, default to 100k if min is 0
        : parseInt(maxPrice.toString(), 10);
    const step = Math.max(100000, Math.round((validMaxPrice - validMinPrice) / 100)); // Dynamic step, min 100k
    // --- FIX END ---

    // --- State quản lý giá trị của thanh trượt giá ---
    // Initialize priceRange state using parsed values from props,
    // falling back to the NOW DECLARED validMinPrice/validMaxPrice if parsing fails
    const [priceRange, setPriceRange] = useState([
        parseInt(price_gte, 10) || validMinPrice,
        parseInt(price_lte, 10) || validMaxPrice
    ]);

    // --- Effect cập nhật thanh trượt giá khi bộ lọc giá thay đổi từ bên ngoài ---
    useEffect(() => {
        // Parse props price_gte and price_lte, using validMinPrice/validMaxPrice as fallbacks
        const newMin = parseInt(price_gte, 10) || validMinPrice;
        const newMax = parseInt(price_lte, 10) || validMaxPrice;

        // Ensure newMin is not greater than newMax and within overall bounds (optional, but robust)
        const validatedNewMin = Math.max(validMinPrice, Math.min(newMin, validMaxPrice));
        const validatedNewMax = Math.max(validMinPrice, Math.min(newMax, validMaxPrice));

        // Update priceRange state only if the validated prop values are different
        // from the current internal state values.
        if (validatedNewMin !== priceRange[0] || validatedNewMax !== priceRange[1]) {
            console.log(`FilterSortPanel: Updating priceRange state from props [${validatedNewMin}, ${validatedNewMax}]`);
            setPriceRange([validatedNewMin, validatedNewMax]);
        }
    // Dependency array: Depend on price_gte, price_lte props and the calculated bounds
    // The bounds (validMinPrice, validMaxPrice) are now declared *before* the effect, so this is safe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [price_gte, price_lte, validMinPrice, validMaxPrice]);


    // --- Hàm xử lý thay đổi bộ lọc ---
    const handleSortChange = (e) => {
        onFilterChange({ sort: e.target.value });
    };

    const handleBrandChange = (e) => {
        // Send the brand name to the API filter using the key 'brandName'
        onFilterChange({ brandName: e.target.value });
    };

    // Hàm được gọi khi người dùng thả thanh trượt giá
    // Price filtering is handled client-side, so we update price_gte and price_lte URL params
    const handlePriceChangeFinal = (values) => {
         // Only trigger change if the final values are different from the current filter values (parsed from props)
         // Use validMinPrice/validMaxPrice as fallbacks for comparison
         const currentGte = parseInt(price_gte, 10) || validMinPrice;
         const currentLte = parseInt(price_lte, 10) || validMaxPrice;

        if (values[0] !== currentGte || values[1] !== currentLte) {
            console.log(`FilterSortPanel: onFinalChange triggered with [${values[0]}, ${values[1]}]`);
            // Pass price_gte and price_lte with the same keys used in ProductListPage's state/URL
            onFilterChange({ price_gte: values[0].toString(), price_lte: values[1].toString() });
        } else {
             console.log(`FilterSortPanel: onFinalChange - no change detected [${values[0]}, ${values[1]}]`);
        }
    };

    // --- Hàm xử lý thay đổi bộ lọc cho các checkbox (Chung) ---
    // filterKey will be 'cpu', 'storage', or 'memory'
    const handleCheckboxChange = (filterKey, value) => {
        // Access the current selected array using the filterKey
        const currentSelected = currentFilters[filterKey] || [];
        let newSelected;
        if (currentSelected.includes(value)) {
            newSelected = currentSelected.filter(item => item !== value);
        } else {
            newSelected = [...currentSelected, value];
        }
        // Pass the updated array for the specific filterKey back to the parent
        onFilterChange({ [filterKey]: newSelected });
    };

    // --- Hàm tiện ích để toggle mở/đóng section ---
    const toggleSection = (setter) => setter(prev => !prev);


    // --- Render ---
    return (
        <aside className={styles.filterPanel}>
            <h3 className={styles.panelTitle}><FiFilter /> Bộ lọc & Sắp xếp</h3>

            {/* --- Bộ lọc Sắp xếp (Client-side) --- */}
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

            {/* --- Bộ lọc Khoảng giá (Client-side) --- */}
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
                            {/* Only render the slider if the range is valid */}
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

            {/* --- Bộ lọc Thương hiệu (API: brandName) --- */}
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
                                // Check against currentFilters.brandName
                                checked={!brandName} // Use brandName prop
                                onChange={handleBrandChange}
                                className={styles.radioInput}
                            />
                            <span className={styles.labelText}>Tất cả</span>
                        </label>
                        {availableBrands.length > 0 ? availableBrands.map((b) => (
                            <label key={b.brandId || b.brandName} className={styles.radioLabel}>
                                <input
                                    type="radio" name="brandFilter" value={b.brandName}
                                    // Check against currentFilters.brandName
                                    checked={brandName === b.brandName} // Use brandName prop
                                    onChange={handleBrandChange}
                                    className={styles.radioInput}
                                />
                                <span className={styles.labelText}>{b.brandName}</span>
                            </label>
                        )) : <p className={styles.noOptions}>Không có thương hiệu</p>}
                    </div>
                )}
            </div>

            {/* --- Bộ lọc CPU (API: cpu) --- */}
            {/* Only show if there are options available (derived from fetched products) */}
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
                                        // Check against currentFilters.cpu array
                                        checked={(cpu || []).includes(cpuValueOption)} // Use cpu prop
                                        // Call handler with key 'cpu'
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

            {/* --- Bộ lọc RAM (Dung lượng) (API: memory) --- */}
            <div className={styles.filterGroup}>
                <button className={styles.groupHeader} onClick={() => toggleSection(setIsMemoryOpen)} aria-expanded={isMemoryOpen} aria-controls="memory-content">
                    <span>RAM (Dung lượng)</span>
                    {isMemoryOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {isMemoryOpen && (
                    <div id="memory-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                        {/* Using the predefined UI options list */}
                        {availableRamCapacityOptionsUI.map((memoryValueOption) => (
                            <label key={`memory-${memoryValueOption}`} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    value={memoryValueOption}
                                    // Check against currentFilters.memory array
                                    checked={(memory || []).includes(memoryValueOption)} // Use memory prop
                                    // Call handler with key 'memory'
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
                    {/* Label update remains */}
                    <span>
                        {currentCategory.toLowerCase() === 'laptop' ? 'Dung lượng ổ cứng' : 'Dung lượng lưu trữ'}
                    </span>
                    {isStorageOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {isStorageOpen && (
                    <div id="storage-content" className={`${styles.groupContent} ${styles.scrollableList}`}>
                        {/* Using the predefined UI options list */}
                        {availableStorageOptionsUI.map((storageValueOption) => (
                            <label key={`storage-${storageValueOption}`} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    value={storageValueOption}
                                    // Check against currentFilters.storage array
                                    checked={(storage || []).includes(storageValueOption)} // Use storage prop
                                    // Call handler with key 'storage'
                                    onChange={() => handleCheckboxChange('storage', storageValueOption)}
                                    className={styles.checkboxInput}
                                />
                                <span className={styles.labelText}>{storageValueOption}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Add refreshRate filter group here if needed */}

        </aside>
    );
};

export default FilterSortPanel;