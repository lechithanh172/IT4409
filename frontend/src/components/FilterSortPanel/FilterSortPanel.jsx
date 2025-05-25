import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './FilterSortPanel.module.css';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Range, getTrackBackground } from 'react-range';



const formatCurrency = (amount, hideSymbol = false) => {
    
    if (typeof amount !== 'number' || isNaN(amount) || amount === null) return '';
    const options = {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    };
    if (hideSymbol) options.style = 'decimal';
    
    try {
        let formatted = new Intl.NumberFormat('vi-VN', options).format(amount);
        if (hideSymbol) formatted = formatted.replace(/\s?₫/, ''); 
        return formatted;
    } catch (e) {
        console.error("Lỗi định dạng tiền tệ:", amount, e);
        return amount.toString(); 
    }
};




const CPU_OPTIONS_NESTED = {
    
    LAPTOP: { 
        'Apple Silicon': ['Apple M1', 'Apple M1 Pro', 'Apple M1 Max', 'Apple M2', 'Apple M2 Pro', 'Apple M2 Max', 'Apple M3', 'Apple M3 Pro', 'Apple M3 Max'],
        'Intel': ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'Intel Core Ultra 5', 'Intel Core Ultra 7', 'Intel Core Ultra 9'],
        'AMD': ['AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9'],
    },
    
    
};


const availableRamCapacityOptionsUI = ['2GB', '4GB', '6GB', '8GB', '12GB', '16GB', '32GB', '64GB'];
const availableStorageOptionsUI = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];
const availableRefreshRateOptionsUI = ['60Hz', '90Hz', '120Hz', '140Hz', '144Hz', '165Hz', '240Hz', '300Hz', '360Hz']; 


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
    
    const lowerCaseCurrentCategory = currentCategory.toLowerCase();

    
    
    const [isSortOpen, setIsSortOpen] = useState(true);
    const [isPriceOpen, setIsPriceOpen] = useState(true);
    const [isCategoryOpen, setIsCategoryOpen] = useState(true);

    
    const isLaptopOrSmartphone = lowerCaseCurrentCategory === 'laptop' || lowerCaseCurrentCategory === 'smartphone';

    
    
    const [isBrandOpen, setIsBrandOpen] = useState(isLaptopOrSmartphone || isLoading);
    const [isMemoryOpen, setIsMemoryOpen] = useState(isLaptopOrSmartphone || isLoading);
    const [isStorageOpen, setIsStorageOpen] = useState(isLaptopOrSmartphone || isLoading);
    
    const [isCpuOpen, setIsCpuOpen] = useState(lowerCaseCurrentCategory === 'laptop' || isLoading);
    const [isRefreshRateOpen, setIsRefreshRateOpen] = useState(isLaptopOrSmartphone || isLoading);


    
    
    const [openCpuManufacturers, setOpenCpuManufacturers] = useState(new Set());

    
    
    
    const {
        category: currentCategoryFilter = '', 
        sort = '',
        brand = '', 
        price_gte = '',
        price_lte = '',
        memory = [], 
        storage = [], 
        cpu = [], 
        refreshRate = [],
    } = currentFilters || {}; 

    
    const currentBrandName = brand;


    
    
    const { validMinPrice, validMaxPrice, step } = useMemo(() => {
        const min = typeof minPrice === 'number' && !isNaN(minPrice) ? minPrice : 0;
        const max = typeof maxPrice === 'number' && !isNaN(maxPrice) ? maxPrice : 100000000;
        
        const effectiveMax = max <= min ? min + 100000 : max; 
        
        
         const range = effectiveMax - min;
         const calculatedStep = Math.max(10000, range > 0 ? Math.round(range / 100) : 1); 

        return { validMinPrice: min, validMaxPrice: effectiveMax, step: calculatedStep };
    }, [minPrice, maxPrice]); 


    
    
    const [priceRange, setPriceRange] = useState(() => {
        const initialMin = parseInt(price_gte, 10);
        const initialMax = parseInt(price_lte, 10);
        
        let min = !isNaN(initialMin) ? Math.max(validMinPrice, Math.min(initialMin, validMaxPrice)) : validMinPrice;
        let max = !isNaN(initialMax) ? Math.max(validMinPrice, Math.min(initialMax, validMaxPrice)) : validMaxPrice;
        if (min > max) [min, max] = [max, min]; 
        return [min, max];
    });


    
    
    useEffect(() => {
         const initialMin = parseInt(price_gte, 10);
         const initialMax = parseInt(price_lte, 10);

         
         let newMin = !isNaN(initialMin) ? Math.max(validMinPrice, Math.min(initialMin, validMaxPrice)) : validMinPrice;
         let newMax = !isNaN(initialMax) ? Math.max(validMinPrice, Math.min(initialMax, validMaxPrice)) : validMaxPrice;

         
         if (newMin > newMax) {
             [newMin, newMax] = [newMax, newMin]; 
         }

        
        const isCurrentStateMatchingProps = priceRange[0] === newMin && priceRange[1] === newMax;

        if (!isCurrentStateMatchingProps) {
            console.log(`[FilterSortPanel] Cập nhật state priceRange từ props [${newMin}, ${newMax}]. State hiện tại [${priceRange[0]}, ${priceRange[1]}]`);
            setPriceRange([newMin, newMax]);
        }
        
    }, [price_gte, price_lte, validMinPrice, validMaxPrice, priceRange]);


    
    const nestedCpuOptions = useMemo(() => {
        
        
        const optionsForCategory = lowerCaseCurrentCategory === 'laptop' ? CPU_OPTIONS_NESTED['LAPTOP'] : null;

        if (!optionsForCategory) {
             
            return null;
        }

        console.log(`[FilterSortPanel] Category là Laptop (${lowerCaseCurrentCategory}). Tạo danh sách tùy chọn CPU.`);

        
        let manufacturersData = Object.entries(optionsForCategory).map(([manufacturer, models]) => ({
             manufacturer,
             models: models ? [...models].sort() : [] 
         }));

        
        manufacturersData.sort((a, b) => a.manufacturer.localeCompare(b.manufacturer));

        
        return manufacturersData;

    }, [lowerCaseCurrentCategory]); 


    
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


    
     const handleCategoryChange = (e) => {
         const newCategory = e.target.value;
         const lowerCaseNewCategory = newCategory.toLowerCase();
         console.log(`[FilterSortPanel] Thay đổi category: "${currentCategory}" -> "${newCategory}"`);

         const filtersToUpdate = {
             category: newCategory,
             
             
             brand: '', 
             cpu: [], 
             storage: [], 
             memory: [], 
             refreshRate: [], 
             price_gte: '', 
             price_lte: '' 
         };
         

         onFilterChange(filtersToUpdate);

         
         setOpenCpuManufacturers(new Set());

         
         const isNewCategoryLaptopOrSmartphone = lowerCaseNewCategory === 'laptop' || lowerCaseNewCategory === 'smartphone';
         setIsBrandOpen(isNewCategoryLaptopOrSmartphone); 
         setIsMemoryOpen(isNewCategoryLaptopOrSmartphone);
         setIsStorageOpen(isNewCategoryLaptopOrSmartphone);
         setIsCpuOpen(lowerCaseNewCategory === 'laptop'); 
         setIsRefreshRateOpen(isNewCategoryLaptopOrSmartphone);
     };

    const handleSortChange = useCallback((e) => {
        onFilterChange({ sort: e.target.value });
    }, [onFilterChange]);


    const handleBrandChange = useCallback((e) => {
        const newBrandName = e.target.value;
        console.log(`[FilterSortPanel] Thay đổi brand: "${currentBrandName}" -> "${newBrandName}"`);

        const filtersToUpdate = {
            brand: newBrandName, 
            
            
            
            cpu: [],
            storage: [],
            memory: [],
            refreshRate: [],
            price_gte: '', 
            price_lte: '' 
        };
        

        onFilterChange(filtersToUpdate);
    }, [onFilterChange, currentBrandName]); 


    
    const handlePriceChangeFinal = useCallback((values) => {
        console.log(`[FilterSortPanel] onFinalChange triggered with [${values[0]}, ${values[1]}].`);
        
        
        const currentGteUrlValue = currentFilters?.price_gte || '';
        const currentLteUrlValue = currentFilters?.price_lte || '';

        
        const isPriceChanged = String(values[0]) !== currentGteUrlValue || String(values[1]) !== currentLteUrlValue;


        if (isPriceChanged) {
             console.log(`[FilterSortPanel] Giá trị thay đổi. Calling onFilterChange.`);
             
             onFilterChange({ price_gte: values[0].toString(), price_lte: values[1].toString() });
         } else {
             console.log(`[FilterSortPanel] Giá trị không thay đổi so với URL. Không gọi onFilterChange.`);
         }
    }, [currentFilters, onFilterChange]); 


    
    
    
    const handleCheckboxChange = useCallback((filterKey, value) => {
        
        const currentSelected = currentFilters && Array.isArray(currentFilters[filterKey]) ? currentFilters[filterKey] : [];
        let newSelected;
        if (currentSelected.includes(value)) {
            newSelected = currentSelected.filter(item => item !== value);
        } else {
            newSelected = [...currentSelected, value];
        }
        console.log(`[FilterSortPanel] Checkbox changed for "${filterKey}": "${value}". New selected:`, newSelected);
        onFilterChange({ [filterKey]: newSelected }); 
    }, [currentFilters, onFilterChange]); 


    
    const toggleSection = useCallback((setter) => setter(prev => !prev), []);


    
    return (
        <aside className={styles.filterPanel}>
            <h3 className={styles.panelTitle}><FiFilter /> Bộ lọc & Sắp xếp</h3>

             {/* --- Bộ lọc Category (API: type) --- */}
             {/* Luôn hiển thị nếu có danh sách category hoặc đang loading */}
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
                                            onChange={(values) => setPriceRange(values)} 
                                            onFinalChange={handlePriceChangeFinal} 
                                            allowCross={false} 
                                            rtl={false} 
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
                                                                colors: ['var(--color-gray-300, #d1d5db)', 'var(--color-primary, #3498db)', 'var(--color-gray-300, #d1d5db)'], 
                                                                min: validMinPrice,
                                                                max: validMaxPrice
                                                            }),
                                                            
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
                                                    className={styles.rangeThumb} 
                                                    style={{
                                                        ...props.style,
                                                        
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
                                 
                                 
                                 <p className={styles.noOptionsMessage}>Không có dữ liệu giá phù hợp để lọc.</p>
                            )}
                        </div>
                    )}
                </div>
            ) : null /* Không render section nếu không có data giá và không loading */ }


            {/* --- Bộ lọc Thương hiệu (API: brand) - CHỈ HIỂN THỊ KHI CATEGORY LÀ LAPTOP HOẶC SMARTPHONE --- */}
             { isLaptopOrSmartphone && ((availableBrands && availableBrands.length > 0) || isLoading) ? (
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
                                            checked={!currentBrandName} 
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
                                                checked={currentBrandName === b.brandName} 
                                                onChange={handleBrandChange}
                                                className={styles.radioInput}
                                            />
                                            <span className={styles.labelText}>{b.brandName}</span>
                                        </label>
                                    ))}
                                </>
                             ) : (
                                 
                                 
                                 <p className={styles.noOptionsMessage}>Không có thương hiệu</p>
                             )}
                        </div>
                    )}
                </div>
            ) : null /* Không render section nếu không phải Laptop/Smartphone hoặc không có data brand và không loading */ }


            {/* --- Bộ lọc CPU (API: cpu) - CHỈ HIỂN THỊ KHI CATEGORY LÀ LAPTOP --- */}
            { /* Kiểm tra nestedCpuOptions. useMemo này sẽ trả về null nếu category không phải Laptop */ }
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
                                        className={styles.groupHeader} 
                                        onClick={() => toggleManufacturerSection(manufacturer)}
                                        aria-expanded={openCpuManufacturers.has(manufacturer)}
                                        aria-controls={`cpu-${manufacturer.replace(/\s+/g, '-')}-content`} 
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
                                                        value={specificModel} 
                                                        checked={(cpu || []).includes(specificModel)} 
                                                        onChange={() => handleCheckboxChange('cpu', specificModel)} 
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
            ) : isLoading && lowerCaseCurrentCategory === 'laptop' ? (
                 
                 <div className={styles.filterGroup}> {/* Có thể hiển thị tiêu đề và spinner */}
                     <button className={styles.groupHeader} aria-expanded={isCpuOpen} onClick={() => toggleSection(setIsCpuOpen)} aria-controls="cpu-content">
                        <span>Chip xử lý / CPU</span>
                         {/* Giả định styles.loadingIndicator tồn tại */}
                          {isLoading ? <span className={styles.loadingIndicator}>...</span> : isCpuOpen ? <FiChevronUp /> : <FiChevronDown />}
                     </button>
                      {isCpuOpen && ( 
                         <div id="cpu-content" className={styles.groupContent}>
                              {/* Giả định styles.loadingMessage tồn tại */}
                             <p className={styles.loadingMessage}>Đang tải tùy chọn CPU...</p>
                         </div>
                      )}
                 </div>
             ) : null /* Không hiển thị section nếu không phải Laptop hoặc không có tùy chọn CPU */ }


            {/* --- Bộ lọc RAM (Dung lượng) (API: memory) --- */}
            {/* Chỉ hiển thị nếu category là Laptop HOẶC Smartphone VÀ có các tùy chọn tĩnh (hoặc data động) */}
            { isLaptopOrSmartphone && availableRamCapacityOptionsUI && availableRamCapacityOptionsUI.length > 0 ? (
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
            ) : null /* Hoặc hiển thị loading/no options nếu dùng data động và isLaptopOrSmartphone */ }


            {/* --- Bộ lọc Dung lượng lưu trữ / Ổ cứng (API: storage) --- */}
            {/* Chỉ hiển thị nếu category là Laptop HOẶC Smartphone VÀ có các tùy chọn tĩnh (hoặc data động) */}
             { isLaptopOrSmartphone && availableStorageOptionsUI && availableStorageOptionsUI.length > 0 ? (
                <div className={styles.filterGroup}>
                    <button className={styles.groupHeader} onClick={() => toggleSection(setIsStorageOpen)} aria-expanded={isStorageOpen} aria-controls="storage-content">
                        <span>
                            {/* Có thể đổi tên hiển thị dựa trên category, ví dụ: "Ổ cứng (SSD/HDD)" cho Laptop */}
                            {lowerCaseCurrentCategory === 'laptop' ? 'Ổ cứng (SSD/HDD)' : 'Dung lượng lưu trữ'}
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
            ) : null /* Hoặc hiển thị loading/no options nếu dùng data động và isLaptopOrSmartphone */ }

             {/* --- Bộ lọc Tốc độ làm mới (Refresh Rate) (API: refreshRate) --- */}
             {/* Chỉ hiển thị nếu category là Laptop HOẶC Smartphone VÀ có các tùy chọn tĩnh (hoặc data động) */}
             { isLaptopOrSmartphone && availableRefreshRateOptionsUI && availableRefreshRateOptionsUI.length > 0 ? (
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
             ) : null /* Hoặc hiển thị loading/no options nếu dùng data động và isLaptopOrSmartphone */ }


        </aside>
    );
};

export default FilterSortPanel;