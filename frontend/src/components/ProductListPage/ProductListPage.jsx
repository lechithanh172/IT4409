import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiService from '../../services/api'; // Đảm bảo đường dẫn đúng
import ProductCard from '../../components/ProductCard/ProductCard'; // Đảm bảo đường dẫn đúng
import Spinner from '../../components/Spinner/Spinner'; // Đảm bảo đường dẫn đúng
import FilterSortPanel from '../../components/FilterSortPanel/FilterSortPanel'; // Đảm bảo đường dẫn đúng
import Pagination from '../../components/Pagination/Pagination'; // Đảm bảo đường dẫn đúng
import styles from './ProductListPage.module.css'; // Đảm bảo đường dẫn đúng
import { FiFilter, FiChevronRight, FiX } from 'react-icons/fi';

const PRODUCTS_PER_PAGE = 12; // Số sản phẩm trên mỗi trang

// --- Helpers ---

// Tìm giá trị spec theo title (không phân biệt hoa thường)
const findSpecValue = (specs, titleToFind) => {
    if (!Array.isArray(specs)) return null;
    const lowerCaseTitle = titleToFind.toLowerCase();
    const foundSpec = specs.find(spec => spec.title?.toLowerCase() === lowerCaseTitle);
    // Return the exact content string from the spec
    return foundSpec?.content || null;
};

// Định nghĩa các từ khóa và ánh xạ cho bộ lọc CPU (để hiển thị tùy chọn trong UI)
// These options are derived from the *filtered* products received from the API
const CPU_KEYWORDS = {
    SMARTPHONE: [
        { keywords: ['bionic', 'apple a'], filterOption: 'Apple Bionic' },
        { keywords: ['exynos'], filterOption: 'Samsung Exynos' },
        { keywords: ['snapdragon', 'qualcomm'], filterOption: 'Qualcomm Snapdragon' },
        { keywords: ['mediatek', 'dimensity', 'helio'], filterOption: 'MediaTek' },
        { keywords: ['kirin'], filterOption: 'Huawei Kirin' }
    ],
    LAPTOP: [
        { keywords: ['apple m', 'apple silicon'], filterOption: 'Apple Silicon' },
        { keywords: ['intel', 'core i'], filterOption: 'Intel' },
        { keywords: ['amd', 'ryzen'], filterOption: 'AMD' }
    ]
};

// Hàm trích xuất các tùy chọn lọc động (CPU) từ danh sách sản phẩm
// This function now operates on the *filtered* product list returned by the API.
// The CPU options shown will only be those present *within the current filter results*.
const getAvailableFilterOptions = (products, category) => {
    const cpuOptions = new Set();
    const isLaptop = category.toLowerCase() === 'laptop';
    const categoryKey = isLaptop ? 'LAPTOP' : 'SMARTPHONE';
    const relevantCpuMappings = CPU_KEYWORDS[categoryKey] || [];

    products.forEach(p => {
        const specs = p.parsedSpecifications;
        if (!specs) return;

        // Trích xuất CPU Option (based on product spec content matching keywords)
        // Note: We are deriving the filter option name (e.g., "Intel") from the
        // detailed product spec string to populate the UI filter list.
        const cpuValue = findSpecValue(specs, 'Chip xử lý'); // !!! Đảm bảo title này đúng !!!
        if (cpuValue) {
            const lowerCpuValue = cpuValue.toLowerCase();
            const matchedMapping = relevantCpuMappings.find(mapping =>
                mapping.keywords.some(keyword => lowerCpuValue.includes(keyword))
            );
            if (matchedMapping) {
                cpuOptions.add(matchedMapping.filterOption);
            }
        }
    });

    return {
        availableCpuOptions: [...cpuOptions].sort(),
    };
};


// --- Component Chính ---
const ProductListPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    // allProducts will now hold the list of products returned by the API filter endpoint
    const [allProducts, setAllProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    // overallMinPrice and overallMaxPrice will be calculated from the products returned by the API
    const [overallMinPrice, setOverallMinPrice] = useState(0);
    const [overallMaxPrice, setOverallMaxPrice] = useState(100000000);

    // --- Đọc và chuẩn hóa tham số từ URL ---
    // These parameters represent the *current filter state* as reflected in the URL
    const category = searchParams.get('category') || ''; // Maps to API 'type'
    const searchTerm = searchParams.get('q') || ''; // Search term (NOT used in provided API filter body)
    const currentPage = parseInt(searchParams.get('page') || '1', 10); // Client-side pagination
    const currentSort = searchParams.get('sort') || ''; // Client-side sorting
    // Use 'brandName' to align with API key and URL param
    const currentBrandName = searchParams.get('brandName') || ''; // Maps to API 'brandName'
    // Keep price params for client-side filtering
    const currentMinPriceStr = searchParams.get('price_gte') || overallMinPrice.toString();
    const currentMaxPriceStr = searchParams.get('price_lte') || overallMaxPrice.toString();

    // Read filters from URL using the API key names (cpu, storage, memory)
    // These are expected to be comma-separated strings in the URL for multi-select
    const cpuParam = searchParams.get('cpu') || '';
    const storageParam = searchParams.get('storage') || '';
    const memoryParam = searchParams.get('memory') || ''; // Use 'memory' instead of 'ramCapacity'

    // Convert comma-separated URL strings to arrays using useMemo
    const currentCpu = useMemo(() => cpuParam ? cpuParam.split(',') : [], [cpuParam]);
    const currentStorage = useMemo(() => storageParam ? storageParam.split(',') : [], [storageParam]);
    const currentMemory = useMemo(() => memoryParam ? memoryParam.split(',') : [], [memoryParam]); // Use 'memory'


    // --- useEffect: Fetch Filtered Data from API when relevant filters change ---
    useEffect(() => {
        const fetchFilteredProducts = async () => {
            setIsLoading(true);
            setError(null);
            setAllProducts([]); // Clear previous results immediately

            // Construct the filter object to send to the API based on URL params
            // Note: searchTerm is NOT included as per the provided API doc body fields.
            const apiFilters = {
                type: category, // Map URL category to API 'type'
                brandName: currentBrandName, // Map URL brandName to API 'brandName'
                cpu: currentCpu.length > 0 ? currentCpu : undefined, // Send array if not empty
                storage: currentStorage.length > 0 ? currentStorage : undefined, // Send array if not empty
                memory: currentMemory.length > 0 ? currentMemory : undefined, // Send array if not empty (RAM Capacity)
                // refreshRate: ... (if you add the filter later and it's in URL)
            };

            // Remove keys with undefined values before sending
             Object.keys(apiFilters).forEach(key =>
                apiFilters[key] === undefined && delete apiFilters[key]
             );
            // Also remove empty strings if the API prefers no key over empty string
            // Example: if (!apiFilters.type) delete apiFilters.type;

            try {
                 console.log(`[11ProductListPage] Calling API filter endpoint with body:`, apiFilters);
                // Call the new filter API endpoint with the constructed body
                const productRes = await apiService.filterProducts(apiFilters);

                let minP = Infinity;
                let maxP = 0;
                let processedProducts = [];

                if (productRes.data && Array.isArray(productRes.data)) {
                    console.log(`[ProductListPage] Received ${productRes.data.length} filtered products from API.`);
                    const fetchedProducts = productRes.data;

                    // Process fetched products: calculate final price and parse specs
                    processedProducts = fetchedProducts.map(p => {
                        let productFinalPrice = p.price ?? null;
                        let productBasePrice = p.price ?? null;
                        let parsedSpecs = null;

                        if (p.specifications && typeof p.specifications === 'string') {
                            try {
                                parsedSpecs = JSON.parse(p.specifications);
                                if (!Array.isArray(parsedSpecs)) parsedSpecs = null;
                            } catch (e) {
                                console.warn(`Failed to parse specs for product ${p.productId}:`, e);
                                parsedSpecs = null;
                            }
                        }

                         // Recalculate final price based on variants for client-side price filter/sort
                         if (p.variants && Array.isArray(p.variants) && p.variants.length > 0 && typeof p.price === 'number') {
                             let lowestVariantPrice = Infinity;
                             p.variants.forEach(v => {
                                 const discountMultiplier = (100 - (Number(v.discount) || 0)) / 100;
                                 const finalPrice = Math.round(p.price * discountMultiplier);
                                 lowestVariantPrice = Math.min(lowestVariantPrice, finalPrice);
                             });
                             productFinalPrice = lowestVariantPrice !== Infinity ? lowestVariantPrice : (p.price ?? null);
                         } else {
                             // If no variants or base price is null, final price is null
                             productFinalPrice = p.price ?? null;
                         }

                        // Calculate min/max price *from the filtered list*
                        if (typeof productFinalPrice === 'number' && productFinalPrice !== null) {
                            minP = Math.min(minP, productFinalPrice);
                            maxP = Math.max(maxP, productFinalPrice);
                        }
                        return {
                           ...p,
                           finalPrice: productFinalPrice, // This will be used for client-side price filtering and sorting
                           basePrice: productBasePrice,
                           parsedSpecifications: parsedSpecs
                        };
                    });
                    setAllProducts(processedProducts); // Store the filtered list received from API

                    // Update overall price range based on the processed (filtered by API) products
                    if (processedProducts.length > 0) {
                        setOverallMinPrice(minP === Infinity ? 0 : minP);
                        setOverallMaxPrice(maxP === 0 ? 100000000 : maxP); // Default max if all prices were 0? Unlikely.
                        console.log(`[ProductListPage] Overall price range calculated from API results: [${minP === Infinity ? 0 : minP} - ${maxP === 0 ? 100000000 : maxP}]`);
                    } else {
                        // Reset price range if no products are found by the API filter
                        setOverallMinPrice(0); setOverallMaxPrice(100000000);
                         console.log("[ProductListPage] No products found by API filter, resetting overall price range.");
                    }

                } else {
                    // Handle case where API returns non-array data or empty response
                    setAllProducts([]); // No valid data received
                    setOverallMinPrice(0); setOverallMaxPrice(100000000);
                     console.warn("Product filter response data was not an array:", productRes);
                     setError("Không nhận được dữ liệu sản phẩm hợp lệ từ bộ lọc.");
                }

                // Fetch brands only once or if brands state is empty
                 if (brands.length === 0) {
                     try {
                         const brandRes = await apiService.getAllBrands();
                         if(brandRes.data && Array.isArray(brandRes.data)) {
                             setBrands([...brandRes.data].sort((a, b) => (a.brandName || '').localeCompare(b.brandName || '')));
                              console.log(`[ProductListPage] Fetched ${brandRes.data.length} brands.`);
                         } else {
                             console.warn("Brands fetch response data was not an array:", brandRes);
                         }
                     } catch (brandErr) {
                         console.error("Brands fetch failed:", brandErr);
                     }
                 }


            } catch (err) {
                 console.error("System error during API filter fetch:", err);
                 // Use a more user-friendly message based on the error
                 const errorMessage = err.response?.data?.message || err.message || "Đã xảy ra lỗi khi lọc sản phẩm.";
                 setError(errorMessage);
                 setAllProducts([]); // Clear products on error
                 setOverallMinPrice(0); setOverallMaxPrice(100000000);
            } finally {
                setIsLoading(false);
                console.log("[ProductListPage] API filter fetch finished.");
            }
        };

        // Debounce or throttle might be added here for performance if filter changes are very frequent (e.g., live price slider)
        // but for checkbox/radio/select changes, immediate fetch is usually fine.
        fetchFilteredProducts();

    // Dependency array: Rerun effect whenever the URL parameters that are sent to the API change.
    // Use the string params (cpuParam, storageParam, memoryParam) because useMemo updates
    // currentCpu etc. only when the string param changes. This avoids unnecessary array comparisons.
    // Include overallMinPrice/overallMaxPrice if you want the fetch to re-run when the
    // overall price range changes *after* a fetch, which is unlikely needed for the fetch itself,
    // but might be needed for the price range calculation in the effect IF it depended on them.
    }, [category, currentBrandName, cpuParam, storageParam, memoryParam /*, refreshRateParam */]); // Add refreshRateParam if used


    // --- Trích xuất các tùy chọn lọc động (CPU) ---
    // This now runs on the `allProducts` state (the list returned by the API filter)
    const availableFilterOptions = useMemo(() => {
        console.log("[ProductListPage] Calculating available dynamic filter options from the API results...");
        const options = getAvailableFilterOptions(allProducts, category);
        console.log("[ProductListPage] Available CPU Options (from API results):", options.availableCpuOptions);
        return options;
    }, [allProducts, category]); // Depends on the API results and category


    // --- Client-side Filtering (Price) and Sorting ---
    // This memo filters the `allProducts` list (already filtered by API) by price and then sorts it.
    const finalFilteredAndSortedProducts = useMemo(() => {
        console.log("[ProductListPage] Applying client-side filters (price) and sorting...");
        let tempProducts = [...allProducts]; // Start with the list from the API

        // Parse current price filter values from URL, using overall range as fallback
        const numMinPrice = parseInt(currentMinPriceStr, 10) || overallMinPrice;
        const numMaxPrice = parseInt(currentMaxPriceStr, 10) || overallMaxPrice;

        // 1. Client-side Price Filter (using the finalPrice calculated based on variants)
        // Only apply this filter if the current range is different from the overall range
        const isPriceFilterActive = numMinPrice !== overallMinPrice || numMaxPrice !== overallMaxPrice;

        if (isPriceFilterActive) {
             console.log(`  Applying Client-side Price filter (>=${numMinPrice}, <=${numMaxPrice})`);
            tempProducts = tempProducts.filter(p => {
                const priceToFilter = p.finalPrice; // Use finalPrice
                 // Ensure priceToFilter is a number before comparison
                return typeof priceToFilter === 'number' && priceToFilter !== null &&
                       priceToFilter >= numMinPrice &&
                       priceToFilter <= numMaxPrice;
            });
             console.log(`  After Client-side Price filter:`, tempProducts.length);
        } else {
             console.log("  No client-side price filter active.");
        }


        // 2. Client-side Sorting
        if (currentSort) {
             console.log(`  Client-side Sorting by: ${currentSort}`);
            switch (currentSort) {
                // Sort based on finalPrice. Handle null/undefined prices by placing them at the end (Infinity or -Infinity)
                case 'price_asc': tempProducts.sort((a, b) => (a.finalPrice ?? Infinity) - (b.finalPrice ?? Infinity)); break;
                case 'price_desc': tempProducts.sort((a, b) => (b.finalPrice ?? -Infinity) - (a.finalPrice ?? -Infinity)); break;
                // Add other client-side sort options here if needed
                default: console.warn(`  Unknown sort option: ${currentSort}`);
            }
        } else {
            console.log("  No client-side sorting applied.");
        }

        console.log("  Final list count after client-side processing:", tempProducts.length);
        return tempProducts;
    }, [
        allProducts, currentSort, currentMinPriceStr, currentMaxPriceStr,
        overallMinPrice, overallMaxPrice // Depend on these for price logic
    ]);


    // --- Phân trang (Client-side) ---
    const totalItems = finalFilteredAndSortedProducts.length;
    const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);
    // Ensure currentPage is valid within the new totalPages
    // Recalculate validatedCurrentPage whenever totalPages or currentPage changes
    const validatedCurrentPage = useMemo(() => {
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        return Math.min(page, totalPages || 1);
    }, [searchParams, totalPages]);


    const startIndex = (validatedCurrentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const currentProducts = finalFilteredAndSortedProducts.slice(startIndex, endIndex);

    // --- Handler Cập nhật URL ---
    const handleFilterChange = useCallback((newFilters) => {
        console.log("[ProductListPage] handleFilterChange received:", newFilters);
        setSearchParams(prevParams => {
            const updatedParams = new URLSearchParams(prevParams.toString());
            // Filter keys that accept arrays (CPU, Storage, Memory)
            // Use the API key names here for URL params: 'cpu', 'storage', 'memory'
            const arrayFilterKeys = ['cpu', 'storage', 'memory'];
            // Filter keys that are handled by client-side Price filtering
            const priceFilterKeys = ['price_gte', 'price_lte'];
            // Other single value keys handled here are sort and brandName
            const singleValueFilterKeys = ['sort', 'brandName'];

            Object.entries(newFilters).forEach(([key, value]) => {
                if (arrayFilterKeys.includes(key)) {
                    // Ensure value is treated as an array
                    const valueArray = Array.isArray(value) ? value : (value ? String(value).split(',') : []);
                    if (valueArray.length > 0) {
                        // Store array filters as comma-separated string in URL
                        updatedParams.set(key, valueArray.join(','));
                        console.log(`  URL Param SET (Array Filter: ${key}): ${valueArray.join(',')}`);
                    } else {
                        updatedParams.delete(key); // Remove param if array is empty
                        console.log(`  URL Param DELETE (Empty Array Filter: ${key})`);
                    }
                }
                 else if (priceFilterKeys.includes(key)) {
                     const numValue = parseInt(String(value), 10);
                     // Only set price params if they are different from the calculated overall range
                     if (key === 'price_gte' && !isNaN(numValue) && numValue > overallMinPrice) {
                          updatedParams.set(key, String(numValue));
                          console.log(`  URL Param SET (Price GTE): ${key} = ${String(numValue)}`);
                     } else if (key === 'price_lte' && !isNaN(numValue) && numValue < overallMaxPrice) {
                          updatedParams.set(key, String(numValue));
                          console.log(`  URL Param SET (Price LTE): ${key} = ${String(numValue)}`);
                     } else {
                         // If value is default or invalid, delete the param
                         updatedParams.delete(key);
                         console.log(`  URL Param DELETE (Price Filter Default/Invalid: ${key})`);
                     }
                 }
                else if (singleValueFilterKeys.includes(key)) {
                     if (value !== undefined && value !== null && String(value).trim() !== '') {
                        updatedParams.set(key, String(value));
                         console.log(`  URL Param SET (Single Value: ${key}): ${String(value)}`);
                     } else {
                        updatedParams.delete(key);
                         console.log(`  URL Param DELETE (Empty Single Value: ${key})`);
                     }
                }
                // Ignore other potential keys not handled by this function (like 'category' or 'q')
                // 'category' should ideally be part of the route path, not a filter param.
                // 'q' is for search, not part of the filter API body based on doc.
            });

            // Always reset to page 1 when filters change
            updatedParams.set('page', '1');
            console.log("  New URL Params String (after filter change):", updatedParams.toString());
            return updatedParams;
        }, { replace: true }); // Use replace to avoid excessive history entries
        setIsMobileFilterOpen(false); // Close mobile filter panel
    }, [setSearchParams, overallMinPrice, overallMaxPrice]); // Depend on these for price default logic

    // --- Handler Chuyển trang (Client-side) ---
    // totalPages is derived from the client-side filtered/sorted list length
    const handlePageChange = useCallback((newPage) => {
        console.log(`[ProductListPage] handlePageChange trying to navigate to page: ${newPage}`);
        // Check against totalPages of the *client-side* filtered/sorted list
        if (newPage >= 1 && newPage <= totalPages) {
            setSearchParams(prevParams => {
                 const updatedParams = new URLSearchParams(prevParams.toString());
                 updatedParams.set('page', newPage.toString());
                 console.log("  New URL Params (page change):", updatedParams.toString());
                 return updatedParams;
            }, { replace: true }); // Use replace
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
        } else {
             console.warn(`  Page change blocked: newPage ${newPage} is out of the valid range [1-${totalPages}]`);
        }
    }, [totalPages, setSearchParams]); // Depend on totalPages and setSearchParams

     // --- useEffect: Adjust page if current page is out of bounds after filter/sort ---
     // This effect uses validatedCurrentPage derived from useMemo
     useEffect(() => {
         // If the current page param in the URL doesn't match the validated page (meaning it was out of bounds),
         // update the URL to the validated page.
         const currentPageFromParams = parseInt(searchParams.get('page') || '1', 10);
         if (!isLoading && currentPageFromParams !== validatedCurrentPage) {
             console.warn(`[ProductListPage] URL page ${currentPageFromParams} is invalid (validated=${validatedCurrentPage}, totalPages=${totalPages}). Adjusting URL.`);
             handlePageChange(validatedCurrentPage);
         }
     }, [isLoading, searchParams, validatedCurrentPage, totalPages, handlePageChange]); // Depend on searchParams, validatedCurrentPage


    // --- Render ---
    // Adjust page title based on category or search term
     // Note: searchTerm isn't used in the filter API call body, so the results
     // won't be filtered by 'q' unless the API is updated or you add client-side search filtering.
     // The title still reflects the 'q' parameter for user context.
    const pageTitle = searchTerm ? `Kết quả tìm kiếm: "${searchTerm}"` : (category ? `${category}` : "Tất Cả Sản Phẩm");
    const showFilterPanel = brands.length > 0 || availableFilterOptions.availableCpuOptions.length > 0 || true; // Always show if you want price/sort


    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            <div className={styles.breadcrumbs}>
                <Link to="/">Trang chủ</Link> <FiChevronRight size={14} className={styles.breadcrumbSeparator}/>
                <Link to="/products">Sản phẩm</Link>
                {category && <><FiChevronRight size={14} className={styles.breadcrumbSeparator}/> <span>{category}</span></>}
                {searchTerm && <><FiChevronRight size={14} className={styles.breadcrumbSeparator}/> <span>Tìm kiếm</span></>}
            </div>

             {/* Mobile Filter Button - Only show if filters are available or loading */}
            { (isLoading || showFilterPanel) && (
                <button
                    className={styles.mobileFilterButton}
                    onClick={() => setIsMobileFilterOpen(true)}
                    aria-label="Mở bộ lọc và sắp xếp"
                    disabled={isLoading} // Disable button while loading
                >
                    <FiFilter /> Lọc & Sắp xếp ({isLoading ? '...' : finalFilteredAndSortedProducts.length})
                </button>
            )}


            <div className={styles.contentWrapper}>
                 {/* Filter Panel - Conditionally render if options available or loading */}
                { (isLoading || showFilterPanel) && (
                    <div className={`${styles.filterPanelContainer} ${isMobileFilterOpen ? styles.mobileFilterOpen : ''}`}>
                        <button className={styles.closeMobileFilter} onClick={() => setIsMobileFilterOpen(false)} aria-label="Đóng bộ lọc">
                            <FiX/>
                        </button>
                        {/* Pass current filter state from URL params to FilterSortPanel */}
                        <FilterSortPanel
                            currentFilters={{
                                sort: currentSort,
                                brandName: currentBrandName,
                                price_gte: currentMinPriceStr,
                                price_lte: currentMaxPriceStr,
                                cpu: currentCpu, // Pass arrays derived from URL params
                                storage: currentStorage,
                                memory: currentMemory, // Use 'memory' key
                            }}
                            onFilterChange={handleFilterChange}
                            availableBrands={brands} // Pass fetched brands
                            // Pass calculated min/max price range from the API results
                            minPrice={overallMinPrice}
                            maxPrice={overallMaxPrice}
                            currentCategory={category}
                            // Pass derived CPU options from the API results
                            availableCpuOptions={availableFilterOptions.availableCpuOptions}
                        />
                    </div>
                 )}
                {/* Overlay for mobile filter */}
                {isMobileFilterOpen && <div className={styles.mobileFilterOverlay} onClick={() => setIsMobileFilterOpen(false)}></div>}


                <div className={styles.mainProductArea}>
                    {/* Show spinner, error, or product list */}
                    {isLoading && allProducts.length === 0 && !error ? (
                         // Only show large spinner on initial load or when products list is empty
                        <div className={styles.loadingContainer}><Spinner size="large" /></div>
                    ) : error ? (
                        <p className={`${styles.error} ${styles.fetchError}`}>{error}</p>
                    ) : finalFilteredAndSortedProducts.length > 0 ? (
                        <>
                            <div className={styles.listHeader}>
                                <span>Hiển thị {startIndex + 1} - {Math.min(endIndex, totalItems)} trên tổng số {totalItems} sản phẩm</span>
                                {/* Optional: Add a small spinner next to the count while client-side processing */}
                                {isLoading && allProducts.length > 0 && <Spinner size="small" />}
                            </div>
                            <div className={styles.productListGrid}>
                                {currentProducts.map((product) => (
                                    // Use product.productId if available, fallback to product.id
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
                        // Show no results message only if not loading and no error, and list is empty
                        !isLoading && !error && (
                            <p className={styles.noResults}>
                                Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn. Vui lòng thử điều chỉnh bộ lọc.
                            </p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;