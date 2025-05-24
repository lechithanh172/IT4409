import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiService from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import Spinner from '../../components/Spinner/Spinner';
import FilterSortPanel from '../../components/FilterSortPanel/FilterSortPanel';
import Pagination from '../../components/Pagination/Pagination';
import styles from './ProductListPage.module.css';
import { FiFilter, FiChevronRight, FiX } from 'react-icons/fi';

const PRODUCTS_PER_PAGE = 12; // Số sản phẩm trên mỗi trang

// --- Helpers ---

// Tìm giá trị spec theo title (không phân biệt hoa thường) - Giữ lại nếu cần cho xử lý spec sau này
const findSpecValue = (specs, titleToFind) => {
    if (!Array.isArray(specs)) return null;
    const lowerCaseTitle = titleToFind.toLowerCase();
    const foundSpec = specs.find(spec => spec.title?.toLowerCase() === lowerCaseTitle);
    return foundSpec?.content || null;
};


// --- Component Chính ---
const ProductListPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [allProducts, setAllProducts] = useState([]); // Danh sách sản phẩm từ API (đã lọc theo API)
    const [brands, setBrands] = useState([]); // Danh sách brands (fetched once)
    const [availableCategories, setAvailableCategories] = useState([]); // Danh sách Category (fetched once)
    const [isLoading, setIsLoading] = useState(true); // Loading state cho việc fetch sản phẩm
    const [error, setError] = useState(null); // Error state cho việc fetch sản phẩm
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // overallMinPrice và overallMaxPrice sẽ tính toán dựa trên danh sách `allProducts` được fetch từ API
    const [overallMinPrice, setOverallMinPrice] = useState(0);
    const [overallMaxPrice, setOverallMaxPrice] = useState(100000000);

    // Ref để giữ giá trị min/max price ban đầu khi trang load
     const initialOverallPriceRange = useRef({ min: 0, max: 100000000 });


    // --- Đọc và chuẩn hóa tham số từ URL ---
    const category = searchParams.get('category') || '';
    const searchTerm = searchParams.get('q') || '';
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const currentSort = searchParams.get('sort') || '';
    // LẤY BRAND NAME TỪ URL PARAM 'brand' THEO YÊU CẦU MỚI
    const currentBrandName = searchParams.get('brand') || '';


    // Price filter values (client-side filtering)
    const currentMinPriceStr = searchParams.get('price_gte') || '';
    const currentMaxPriceStr = searchParams.get('price_lte') || '';

    // API filter parameters from URL (comma-separated strings for arrays)
    // These keys MUST match the API body field names
    const cpuParam = searchParams.get('cpu') || '';
    const storageParam = searchParams.get('storage') || '';
    const memoryParam = searchParams.get('memory') || '';
    const refreshRateParam = searchParams.get('refreshRate') || '';

    // Convert comma-separated URL strings to arrays using useMemo
    const currentCpu = useMemo(() => cpuParam ? cpuParam.split(',').map(item => item.trim()).filter(item => item !== '') : [], [cpuParam]);
    const currentStorage = useMemo(() => storageParam ? storageParam.split(',').map(item => item.trim()).filter(item => item !== '') : [], [storageParam]);
    const currentMemory = useMemo(() => memoryParam ? memoryParam.split(',').map(item => item.trim()).filter(item => item !== '') : [], [memoryParam]);
    const currentRefreshRate = useMemo(() => refreshRateParam ? refreshRateParam.split(',').map(item => item.trim()).filter(item => item !== '') : [], [refreshRateParam]);

    // --- useEffect: Fetch Products (based on filters) ---
    useEffect(() => {
        const fetchProducts = async () => {
            console.log(`[ProductListPage] Fetch products effect triggered with params: category="${category}", brand="${currentBrandName}", cpu=[${currentCpu.join(', ')}], storage=[${currentStorage.join(', ')}], memory=[${currentMemory.join(', ')}], refreshRate=[${currentRefreshRate.join(', ')}]...`);
            setIsLoading(true);
            setError(null);
            setAllProducts([]); // Clear previous results immediately

            try {
                let productRes;
                let fetchedProducts = [];
                let minP = Infinity;
                let maxP = 0;

                // Quyết định gọi API filter hay getAllProducts
                // Logic mới:
                console.log(currentBrandName);
                console.log(category);
                if (currentBrandName && !category) {
                    // Ưu tiên search theo BrandName nếu có (lấy từ param 'brand')
                    // Chỉ gọi API Brand nếu KHÔNG có Category được chọn cùng
                    console.log(`[ProductListPage] Brand filter "${currentBrandName}" active (from 'brand' param) AND NO category. Calling API getProductsbyBrandName.`);
                    productRes = await apiService.getProductsbyBrandName(currentBrandName);


                } else if (category && (currentBrandName || currentCpu.length > 0 || currentStorage.length > 0 || currentMemory.length > 0 || currentRefreshRate.length > 0)) {
                    // Nếu có Category HOẶC có Brand HOẶC có các bộ lọc spec khác
                    // Gọi API filter endpoint
                    console.log("[ProductListPage] Category or other API filters active (brand, category, specs...). Calling API filter endpoint.");
                    const apiFilters = {
                        type: category || undefined, // Bao gồm category nếu có
                         // Bao gồm brandName nếu có (API filter endpoint có thể hỗ trợ)
                        brandName: currentBrandName || undefined,
                        cpu: currentCpu.length > 0 ? currentCpu : undefined,
                        storage: currentStorage.length > 0 ? currentStorage : undefined,
                        memory: currentMemory.length > 0 ? currentMemory : undefined,
                        refreshRate: currentRefreshRate.length > 0 ? currentRefreshRate : undefined,
                    }
                    Object.keys(apiFilters).forEach(key => apiFilters[key] === undefined && delete apiFilters[key]);

                    console.log(`[ProductListPage] Calling API filter endpoint with body:`, apiFilters);
                    productRes = await apiService.filterProducts(apiFilters);

                }
                 else if (category && (!currentBrandName && currentCpu.length == 0 && currentStorage.length ==0 && currentMemory.length== 0 && currentRefreshRate.length == 0)) {
                    
                    productRes = await apiService.getProductsByCategory(category);

                }
                else if (!category && !currentBrandName) {
                    // Nếu không có bất kỳ bộ lọc API nào (brand, category, specs), gọi getAllProducts
                    console.log("[ProductListPage] No API filters active. Calling API getAllProducts endpoint.");
                    productRes = await apiService.getAllProducts();
                }


                // --- Process fetched Products ---
                if (productRes?.data && Array.isArray(productRes.data)) {
                    console.log(`[ProductListPage] Received ${productRes.data.length} products from API.`);
                    fetchedProducts = productRes.data;

                    const processedProducts = fetchedProducts.map(p => {
                         let productFinalPrice = p.price ?? null;
                         let productBasePrice = p.price ?? null;
                         let parsedSpecs = null;

                         // Try parsing specifications if it's a string
                         if (p.specifications && typeof p.specifications === 'string') {
                             try { parsedSpecs = JSON.parse(p.specifications); if (!Array.isArray(parsedSpecs)) parsedSpecs = null; } catch (e) { parsedSpecs = null; console.error("Error parsing specifications:", p.specifications, e); }
                         } else if (Array.isArray(p.specifications)) {
                             // If it's already an array, use it directly
                             parsedSpecs = p.specifications;
                         }


                         // Calculate final price considering variants and discount
                         if (p.variants && Array.isArray(p.variants) && p.variants.length > 0 && typeof p.price === 'number' && p.price !== null) {
                             let lowestVariantPrice = Infinity;
                             p.variants.forEach(v => {
                                 const discountPercentage = Number(v.discount) || 0;
                                 const discountMultiplier = (100 - discountPercentage) / 100;
                                 // Ensure final price is non-negative
                                 const finalPrice = Math.max(0, Math.round(p.price * discountMultiplier));
                                 lowestVariantPrice = Math.min(lowestVariantPrice, finalPrice);
                             });
                             productFinalPrice = lowestVariantPrice !== Infinity ? lowestVariantPrice : (p.price ?? null);
                         } else {
                             // If no variants or price is null/not number, use base price
                             productFinalPrice = p.price ?? null;
                         }

                        // Update min/max price based on finalPrice of processed products
                        if (typeof productFinalPrice === 'number' && productFinalPrice !== null) { minP = Math.min(minP, productFinalPrice); maxP = Math.max(maxP, productFinalPrice); }
                        return { ...p, finalPrice: productFinalPrice, basePrice: productBasePrice, parsedSpecifications: parsedSpecs };
                    });

                    setAllProducts(processedProducts);

                    // Update overall price range based on the processed products
                    // Only update if there are products
                    if (processedProducts.length > 0) {
                        const calculatedMin = minP === Infinity ? 0 : minP;
                        const calculatedMax = maxP === 0 ? 100000000 : maxP;
                         console.log(`[ProductListPage] Overall price range calculated from fetched results: [${calculatedMin} - ${calculatedMax}]`);

                         // Store initial range only if it hasn't been set (first successful fetch with products)
                         // Use overallMinPrice === 0 && overallMaxPrice === 100000000 check on *state* instead of ref
                         // as ref might not be updated yet if this runs multiple times quickly.
                         // Or simpler: use the ref to store the *very first* range calculated.
                         if (initialOverallPriceRange.current.min === 0 && initialOverallPriceRange.current.max === 100000000) {
                              if (calculatedMin < calculatedMax) { // Only store if the range is valid
                                 initialOverallPriceRange.current = { min: calculatedMin, max: calculatedMax };
                                 console.log(`[ProductListPage] Stored initial overall price range: [${initialOverallPriceRange.current.min} - ${initialOverallPriceRange.current.max}]`);
                             }
                         }


                         setOverallMinPrice(calculatedMin);
                         setOverallMaxPrice(calculatedMax);

                    } else {
                        // If no products are returned, reset range to default
                        setOverallMinPrice(0); setOverallMaxPrice(100000000);
                        // Don't reset initialOverallPriceRange here, keep the very first loaded range for slider bounds reference
                        console.log("[ProductListPage] No products fetched, resetting overall price range for current display.");
                    }


                } else {
                    setAllProducts([]);
                    setOverallMinPrice(0); setOverallMaxPrice(100000000);
                     // Don't reset initialOverallPriceRange here
                    console.warn("Product fetch/filter response data was not valid or empty:", productRes);
                    // setError("Không nhận được dữ liệu sản phẩm hợp lệ từ API hoặc không có sản phẩm."); // Có thể bỏ lỗi này nếu không có sản phẩm là trường hợp hợp lệ khi lọc
                }

            } catch (err) {
                 console.error("System error during API fetch/filter:", err);
                 const errorMessage = err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tải sản phẩm.";
                 setError(errorMessage);
                 setAllProducts([]); // Clear products on error
                 setOverallMinPrice(0); setOverallMaxPrice(100000000); // Reset range on error
                 // Don't reset initialOverallPriceRange here
            } finally {
                setIsLoading(false);
                console.log("[ProductListPage] Product API fetch/filter finished.");
                // Close mobile filter panel after loading (optional, based on UX)
                 setIsMobileFilterOpen(false);
            }
        };

        fetchProducts();

        // Dependencies: Rerun this effect whenever the API filter parameters change
        // Make sure to include all URL parameters that affect the API call logic
    }, [category, currentBrandName, currentCpu, currentStorage, currentMemory, currentRefreshRate]);


    // --- useEffect: Fetch Brands (once on mount) ---
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const brandRes = await apiService.getAllBrands();
                if(brandRes.data && Array.isArray(brandRes.data)) {
                    setBrands([...brandRes.data].sort((a, b) => (a.brandName || '').localeCompare(b.brandName || '')));
                    console.log(`[ProductListPage] Fetched ${brandRes.data.length} brands.`);
                } else {
                    console.warn("Brands fetch response data was not an array:", brandRes);
                    setBrands([]);
                }
            } catch (brandErr) {
                console.error("Brands fetch failed:", brandErr);
                setBrands([]);
            }
        };
        console.log("[ProductListPage] Fetch brands effect triggered.");
        fetchBrands();
    }, []); // Empty dependency array means run once on mount


    // --- useEffect: Fetch Categories (once on mount) ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoryRes = await apiService.getAllCategories();
                if(categoryRes.data && Array.isArray(categoryRes.data)) {
                     // Assuming category objects have a 'categoryName' field
                    setAvailableCategories([...categoryRes.data].sort((a, b) => (a.categoryName || '').localeCompare(b.categoryName || '')));
                    console.log(`[ProductListPage] Fetched ${categoryRes.data.length} categories.`);
                } else {
                    console.warn("Categories fetch response data was not an array:", categoryRes);
                    setAvailableCategories([]);
                }
            } catch (categoryErr) {
                console.error("Categories fetch failed:", categoryErr);
                setAvailableCategories([]);
            }
        };
        console.log("[ProductListPage] Fetch categories effect triggered.");
        fetchCategories();
    }, []); // Empty dependency array means run once on mount


    // --- Client-side Filtering (Price) and Sorting ---
    const finalFilteredAndSortedProducts = useMemo(() => {
        console.log("[ProductListPage] Applying client-side filters (price) and sorting...");
        let tempProducts = [...allProducts];

        const numMinPrice = parseInt(currentMinPriceStr, 10);
        const numMaxPrice = parseInt(currentMaxPriceStr, 10);

        // Use parsed values if they exist and are valid, otherwise use the *current* overall range
        // This ensures that if price params are missing/invalid, the full fetched range is shown
        const filterMinPrice = !isNaN(numMinPrice) && currentMinPriceStr !== '' ? numMinPrice : overallMinPrice;
        const filterMaxPrice = !isNaN(numMaxPrice) && currentMaxPriceStr !== '' ? numMaxPrice : overallMaxPrice;

        // Determine if the price filter is effectively narrowing the results compared to the overall range
        // It's active if the min is greater than overallMinPrice OR the max is less than overallMaxPrice
        // Also consider the case where overallMinPrice >= overallMaxPrice (no valid range in fetched data)
        const isPriceFilterMeaningful = overallMinPrice < overallMaxPrice; // Can only filter meaningfully if there's a range

        const isPriceFilterActive = isPriceFilterMeaningful && (filterMinPrice > overallMinPrice || filterMaxPrice < overallMaxPrice);


        if (isPriceFilterActive) {
             // Ensure effectiveMaxPrice is not less than filterMinPrice (handle reversed range input)
             const effectiveMinPrice = Math.min(filterMinPrice, filterMaxPrice);
             const effectiveMaxPrice = Math.max(filterMinPrice, filterMaxPrice);

             console.log(`  Applying Client-side Price filter (>=${effectiveMinPrice}, <=${effectiveMaxPrice})`);

            tempProducts = tempProducts.filter(p => {
                const priceToFilter = p.finalPrice;
                // Only filter products that have a valid number price
                return typeof priceToFilter === 'number' && priceToFilter !== null &&
                       priceToFilter >= effectiveMinPrice &&
                       priceToFilter <= effectiveMaxPrice;
            });
             console.log(`  After Client-side Price filter:`, tempProducts.length);
        } else {
             console.log(`  No meaningful client-side price filter active (filter range matches overall range or overall range invalid). Overall range: [${overallMinPrice} - ${overallMaxPrice}]`);
        }


        if (currentSort) {
             console.log(`  Client-side Sorting by: ${currentSort}`);
            switch (currentSort) {
                case 'price_asc': tempProducts.sort((a, b) => (a.finalPrice ?? Infinity) - (b.finalPrice ?? Infinity)); break;
                case 'price_desc': tempProducts.sort((a, b) => (b.finalPrice ?? -Infinity) - (a.finalPrice ?? -Infinity)); break;
                 case 'name_asc': tempProducts.sort((a, b) => (a.productName || '').localeCompare(b.productName || '')); break;
                 case 'name_desc': tempProducts.sort((a, b) => (b.productName || '').localeCompare(a.productName || '')); break;
                default: console.warn(`  Unknown sort option: ${currentSort}`);
            }
        } else {
            console.log("  No client-side sorting applied.");
        }

        return tempProducts;
    }, [
        allProducts, currentSort, currentMinPriceStr, currentMaxPriceStr,
        overallMinPrice, overallMaxPrice // Dependencies for price range
    ]);


    // --- Phân trang (Client-side) ---
    const totalItems = finalFilteredAndSortedProducts.length;
    const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);

    const validatedCurrentPage = useMemo(() => {
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        // Ensure validated page is within bounds based on current totalPages
        // Use totalPages calculated from finalFilteredAndSortedProducts
        const maxPage = totalPages > 0 ? totalPages : 1; // Ensure maxPage is at least 1
        const validated = Math.min(page, maxPage);
         // If the validated page is 0 (which can happen if totalItems is 0 and page is 1),
         // force it to 1, but this should be handled by Math.max(1, ...) already.
        return validated;
    }, [searchParams, totalPages]); // Depend on searchParams and totalPages (derived from filtered/sorted list)


    const startIndex = (validatedCurrentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const currentProducts = finalFilteredAndSortedProducts.slice(startIndex, endIndex);


    // --- Handler Chuyển trang (Client-side) ---
    // setSearchParams is stable, removed from dependencies
    const handlePageChange = useCallback((newPage) => {
        console.log(`[ProductListPage] handlePageChange trying to navigate to page: ${newPage}. Total pages: ${totalPages}`);
        // Ensure newPage is within the valid range before updating URL
        if (newPage >= 1 && newPage <= totalPages) {
            setSearchParams(prevParams => {
                 const updatedParams = new URLSearchParams(prevParams.toString());
                 updatedParams.set('page', newPage.toString());
                 console.log("  New URL Params (page change):", updatedParams.toString());
                 return updatedParams;
            }, { replace: true }); // Use replace: true for pagination
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
             console.warn(`  Page change blocked: newPage ${newPage} is out of the valid range [1-${totalPages}]`);
        }
    }, [totalPages, setSearchParams]); // Keep totalPages, setSearchParams is stable so not strictly needed, but including doesn't hurt


    // --- Handler Cập nhật URL ---
    const handleFilterChange = useCallback((newFilters) => {
        console.log("[ProductListPage] handleFilterChange received:", newFilters);
        setSearchParams(prevParams => {
            const updatedParams = new URLSearchParams(prevParams.toString());
            const arrayFilterKeys = ['cpu', 'storage', 'memory', 'refreshRate'];
            const priceFilterKeys = ['price_gte', 'price_lte'];
            // CẬP NHẬT singleValueFilterKeys ĐỂ BAO GỒM 'brand' THAY VÌ 'brandName'
            const singleValueFilterKeys = ['sort', 'brand', 'category'];

            Object.entries(newFilters).forEach(([key, value]) => {
                if (singleValueFilterKeys.includes(key)) {
                     // Set param if value is not empty/null/undefined, otherwise delete
                     // Key here will be 'brand' if the change came from the brand filter
                     if (value !== undefined && value !== null && String(value).trim() !== '') {
                        updatedParams.set(key, String(value));
                         console.log(`  URL Param SET (Single Value: ${key}): ${String(value)}`);
                     } else {
                        updatedParams.delete(key);
                         console.log(`  URL Param DELETE (Empty Single Value: ${key})`);
                     }
                }
                else if (arrayFilterKeys.includes(key)) {
                    // For array filters, convert array to comma-separated string
                    const valueArray = Array.isArray(value) ? value.map(item => String(item).trim()).filter(item => item !== '') : (value ? String(value).split(',').map(item => item.trim()).filter(item => item !== '') : []);
                    if (valueArray.length > 0) {
                        updatedParams.set(key, valueArray.join(','));
                         console.log(`  URL Param SET (Array Filter: ${key}): ${valueArray.join(',')}`);
                    } else {
                        updatedParams.delete(key);
                         console.log(`  URL Param DELETE (Empty Array Filter: ${key})`);
                    }
                }
                 else if (priceFilterKeys.includes(key)) {
                     const numValue = parseInt(String(value), 10);

                     // Chỉ thêm param giá vào URL nếu giá trị hợp lệ (không phải rỗng/NaN sau parse)
                     // Việc kiểm tra so với min/max overall đã được xử lý ở FilterSortPanel trước khi gọi onFinalChange
                     if (String(value).trim() !== '' && !isNaN(numValue)) {
                         updatedParams.set(key, String(numValue));
                         console.log(`  URL Param SET (Price Filter: ${key}): ${String(numValue)}`);
                     } else {
                         // Xóa param nếu giá trị rỗng hoặc không hợp lệ
                         updatedParams.delete(key);
                         console.log(`  URL Param DELETE (Empty/Invalid Price Filter: ${key})`);
                     }
                 }
            });

            // Always reset page to 1 when any filter changes
            updatedParams.set('page', '1');
            console.log("  New URL Params String (after filter change):", updatedParams.toString());
            return updatedParams;
        }, { replace: true }); // Use replace: true to avoid piling up history entries
        setIsMobileFilterOpen(false); // Close mobile filter panel on filter change
    }, [setSearchParams]); // Depend only on setSearchParams, as it's stable


     // --- useEffect: Adjust page if current page is out of bounds ---
     // This effect ensures the 'page' URL parameter is always valid for the current number of products
     useEffect(() => {
         const currentPageFromParams = parseInt(searchParams.get('page') || '1', 10);
         // Only adjust if not loading and the current page from params is different from the validated page
         // Also ensure validatedCurrentPage is valid (> 0).
         // Pass handlePageChange into dependency array because it's called inside the effect.
         if (!isLoading && currentPageFromParams !== validatedCurrentPage && validatedCurrentPage >= 1) {
             console.warn(`[ProductListPage] URL page ${currentPageFromParams} is invalid (validated=${validatedCurrentPage}, totalPages=${totalPages}). Adjusting URL.`);
             handlePageChange(validatedCurrentPage); // Calls handlePageChange which updates the URL
         }
         // Add dependencies that might cause the validated page to change (totalPages, isLoading, searchParams).
         // Include handlePageChange because it's called inside the effect.
     }, [isLoading, searchParams, validatedCurrentPage, totalPages, handlePageChange]);


    // --- Render ---
    // Hiển thị tiêu đề trang dựa trên các bộ lọc
    let pageTitle = "Tất Cả Sản Phẩm";
    if (searchTerm) {
        pageTitle = `Kết quả tìm kiếm: "${searchTerm}"`;
    } else if (currentBrandName && category) {
        // --- LOGIC HIỂN THỊ TIÊU ĐỀ ĐÃ CHỈNH SỬA ---
        // Thay đổi định dạng khi có cả Brand và Category
        pageTitle = `Sản phẩm ${currentBrandName} (${category})`; // Ví dụ: "Sản phẩm HP (Laptop)"
        // ----------------------------------------
    } else if (currentBrandName) {
        pageTitle = `Sản phẩm ${currentBrandName}`; // Ví dụ: "Sản phẩm HP"
    } else if (category) {
        pageTitle = `${category}`; // Ví dụ: "Laptop"
    }
     // Nếu không có bộ lọc chính (search, brand, category) thì dùng mặc định "Tất Cả Sản Phẩm"
    useEffect(() => {
            document.title = pageTitle;
        }, []);
    

    // Determine if the filter panel should be shown. Show if loading, or if there's any data (brands, categories, or products for price range).
    // Price/Sort sections are always intended to be shown if there's product data to sort/price filter.
    // Use initialOverallPriceRange for price filter section visibility check
    const showFilterPanel = isLoading || brands.length > 0 || availableCategories.length > 0 || (initialOverallPriceRange.current.min < initialOverallPriceRange.current.max);


    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            <div className={styles.breadcrumbs}>
                <Link to="/">Trang chủ</Link> <FiChevronRight size={14} className={styles.breadcrumbSeparator}/>
                <Link to="/products">Sản phẩm</Link>
                {/* Thêm breadcrumbs cho category và brand */}
                {category && !currentBrandName && <><FiChevronRight size={14} className={styles.breadcrumbSeparator}/> <span>{category}</span></>}
                 {currentBrandName && !category && <><FiChevronRight size={14} className={styles.breadcrumbSeparator}/> <span>{currentBrandName}</span></>}
                 {currentBrandName && category && <><FiChevronRight size={14} className={styles.breadcrumbSeparator}/> <Link to={`/products?category=${encodeURIComponent(category)}`}>{category}</Link> <FiChevronRight size={14} className={styles.breadcrumbSeparator}/> <span>{currentBrandName}</span></>}
                {searchTerm && <><FiChevronRight size={14} className={styles.breadcrumbSeparator}/> <span>Tìm kiếm</span></>}
            </div>

             {/* Mobile Filter Button */}
            { showFilterPanel && (
                <button
                    className={styles.mobileFilterButton}
                    onClick={() => setIsMobileFilterOpen(true)}
                    aria-label="Mở bộ lọc và sắp xếp"
                    // Disable button if currently loading and there's no data yet
                    disabled={isLoading && allProducts.length === 0}
                >
                    <FiFilter /> Lọc & Sắp xếp {isLoading ? '(Đang tải...)' : (allProducts.length > 0 ? `(${finalFilteredAndSortedProducts.length} / ${allProducts.length})` : '')}
                </button>
            )}

            <div className={styles.contentWrapper}>
                 {/* Filter Panel */}
                { showFilterPanel && (
                    <div className={`${styles.filterPanelContainer} ${isMobileFilterOpen ? styles.mobileFilterOpen : ''}`}>
                        <button className={styles.closeMobileFilter} onClick={() => setIsMobileFilterOpen(false)} aria-label="Đóng bộ lọc">
                            <FiX/>
                        </button>
                        <FilterSortPanel
                            currentFilters={{
                                category: category,
                                sort: currentSort,
                                brand: currentBrandName, // TRUYỀN currentBrandName VỚI KEY 'brand'
                                price_gte: currentMinPriceStr, // Pass current price filter strings from URL
                                price_lte: currentMaxPriceStr, // Pass current price filter strings from URL
                                cpu: currentCpu, // Pass mảng giá trị CPU được chọn
                                storage: currentStorage,
                                memory: currentMemory,
                                refreshRate: currentRefreshRate,
                            }}
                            onFilterChange={handleFilterChange}
                            availableBrands={brands}
                            availableCategories={availableCategories}
                            // Truyền khoảng giá TỔNG THỂ BAN ĐẦU cho FilterSortPanel để bounds của slider ổn định
                            minPrice={initialOverallPriceRange.current.min}
                            maxPrice={initialOverallPriceRange.current.max}
                            currentCategory={category} // Pass current category for CPU options logic in FilterSortPanel
                            isLoading={isLoading} // Pass isLoading
                        />
                    </div>
                 )}
                {/* Overlay for mobile filter */}
                {isMobileFilterOpen && <div className={styles.mobileFilterOverlay} onClick={() => setIsMobileFilterOpen(false)}></div>}


                <div className={styles.mainProductArea}>
                    {isLoading && allProducts.length === 0 && !error ? (
                        // Show large spinner if initial load is happening and no products yet
                        <div className={styles.loadingContainer}><Spinner size="large" /></div>
                    ) : error ? (
                        // Show error message if fetch failed
                        <p className={`${styles.error} ${styles.fetchError}`}>{error}</p>
                    ) : finalFilteredAndSortedProducts.length > 0 ? (
                        // Show product list if there are filtered/sorted products
                        <>
                            <div className={styles.listHeader}>
                                {/* Adjust count display based on client-side filtering results */}
                                <span>Hiển thị {startIndex + 1} - {Math.min(endIndex, totalItems)} trên tổng số {totalItems} sản phẩm</span>
                            </div>
                            <div className={styles.productListGrid}>
                                {currentProducts.map((product) => (
                                    // Use a stable and unique key
                                    <ProductCard key={product.productId || product.id} product={product} />
                                ))}
                            </div>
                            {/* Show pagination only if there's more than one page */}
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={validatedCurrentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    ) : (
                        // Show no results message if fetch is done, no error, and filtered list is empty
                        !isLoading && !error && (
                            <p className={styles.noResults}>
                                Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn. Vui lòng thử điều chỉnh bộ lọc.
                            </p>
                        )
                    )}
                    {/* Optional: Show a small spinner while client-side filtering/sorting if needed */}
                    {/* {isLoading && allProducts.length > 0 && <Spinner size="small" />} */}
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;