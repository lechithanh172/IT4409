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

// Tìm giá trị spec theo title (không phân biệt hoa thường)
const findSpecValue = (specs, titleToFind) => {
    if (!Array.isArray(specs)) return null;
    const lowerCaseTitle = titleToFind.toLowerCase();
    const foundSpec = specs.find(spec => spec.title?.toLowerCase() === lowerCaseTitle);
    return foundSpec?.content || null;
};

// --- Loại bỏ các hằng số CPU_KEYWORDS khỏi đây ---
// Chúng sẽ được định nghĩa hoặc import trong FilterSortPanel nếu cần cho UI tĩnh


// --- Loại bỏ hàm getAvailableFilterOptions vì chúng ta dùng danh sách tĩnh ---
// const getAvailableFilterOptions = (products, category) => { ... };


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
    const currentBrandName = searchParams.get('brandName') || '';

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
    // currentCpu sẽ chứa các chuỗi đơn giản như "Intel", "Apple", "AMD"
    const currentCpu = useMemo(() => cpuParam ? cpuParam.split(',').map(item => item.trim()).filter(item => item !== '') : [], [cpuParam]);
    const currentStorage = useMemo(() => storageParam ? storageParam.split(',').map(item => item.trim()).filter(item => item !== '') : [], [storageParam]);
    const currentMemory = useMemo(() => memoryParam ? memoryParam.split(',').map(item => item.trim()).filter(item => item !== '') : [], [memoryParam]);
    const currentRefreshRate = useMemo(() => refreshRateParam ? refreshRateParam.split(',').map(item => item.trim()).filter(item => item !== '') : [], [refreshRateParam]);


    // --- useEffect: Fetch Products (based on filters) ---
    useEffect(() => {
        const fetchProducts = async () => {
            console.log(`[ProductListPage] Fetch products effect triggered with params: category="${category}", brandName="${currentBrandName}", cpu=[${currentCpu.join(',')}]...`);
            setIsLoading(true);
            setError(null);
            setAllProducts([]); // Clear previous results immediately

            try {
                let productRes;
                let fetchedProducts = [];
                let minP = Infinity;
                let maxP = 0;

                // Quyết định gọi API filter hay getAllProducts
                // Nếu có bất kỳ bộ lọc API nào (bao gồm cả category), gọi API filter
                if (category || currentBrandName || currentCpu.length > 0 || currentStorage.length > 0 || currentMemory.length > 0 || currentRefreshRate.length > 0) {
                    const apiFilters = {
                        type: category || undefined,
                        brandName: currentBrandName || undefined,
                        cpu: currentCpu.length > 0 ? currentCpu : undefined, // Vẫn gửi mảng các giá trị CPU được chọn (vd: ["Intel", "Apple"])
                        storage: currentStorage.length > 0 ? currentStorage : undefined,
                        memory: currentMemory.length > 0 ? currentMemory : undefined,
                        refreshRate: currentRefreshRate.length > 0 ? currentRefreshRate : undefined,
                    };
                    Object.keys(apiFilters).forEach(key => apiFilters[key] === undefined && delete apiFilters[key]);

                    console.log(`[ProductListPage] Calling API filter endpoint with body:`, apiFilters);
                    productRes = await apiService.filterProducts(apiFilters);

                } else {
                    // Nếu không có bất kỳ bộ lọc API nào, gọi API lấy tất cả sản phẩm
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

                         if (p.specifications && typeof p.specifications === 'string') {
                             try { parsedSpecs = JSON.parse(p.specifications); if (!Array.isArray(parsedSpecs)) parsedSpecs = null; } catch (e) { parsedSpecs = null; }
                         }

                         if (p.variants && Array.isArray(p.variants) && p.variants.length > 0 && typeof p.price === 'number' && p.price !== null) {
                             let lowestVariantPrice = Infinity;
                             p.variants.forEach(v => { const discountPercentage = Number(v.discount) || 0; const discountMultiplier = (100 - discountPercentage) / 100; const finalPrice = Math.round(p.price * discountMultiplier); lowestVariantPrice = Math.min(lowestVariantPrice, finalPrice); });
                             productFinalPrice = lowestVariantPrice !== Infinity ? lowestVariantPrice : (p.price ?? null);
                         } else {
                             productFinalPrice = p.price ?? null;
                         }

                        if (typeof productFinalPrice === 'number' && productFinalPrice !== null) { minP = Math.min(minP, productFinalPrice); maxP = Math.max(maxP, productFinalPrice); }
                        return { ...p, finalPrice: productFinalPrice, basePrice: productBasePrice, parsedSpecifications: parsedSpecs };
                    });

                    setAllProducts(processedProducts);

                    // Update overall price range based on the processed products
                    const calculatedMin = minP === Infinity ? 0 : minP;
                    const calculatedMax = maxP === 0 ? 100000000 : maxP;
                    setOverallMinPrice(calculatedMin);
                    setOverallMaxPrice(calculatedMax);
                    console.log(`[ProductListPage] Overall price range calculated from fetched results: [${calculatedMin} - ${calculatedMax}]`);

                    if (initialOverallPriceRange.current.min === 0 && initialOverallPriceRange.current.max === 100000000 && processedProducts.length > 0) {
                        initialOverallPriceRange.current = { min: calculatedMin, max: calculatedMax };
                        console.log(`[ProductListPage] Stored initial overall price range: [${initialOverallPriceRange.current.min} - ${initialOverallPriceRange.current.max}]`);
                    }

                } else {
                    setAllProducts([]);
                    setOverallMinPrice(0); setOverallMaxPrice(100000000);
                    initialOverallPriceRange.current = { min: 0, max: 100000000 };
                    console.warn("Product fetch/filter response data was not valid:", productRes);
                    setError("Không nhận được dữ liệu sản phẩm hợp lệ từ API.");
                }

            } catch (err) {
                 console.error("System error during API fetch/filter:", err);
                 const errorMessage = err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tải sản phẩm.";
                 setError(errorMessage);
                 setAllProducts([]);
                 setOverallMinPrice(0); setOverallMaxPrice(100000000);
                 initialOverallPriceRange.current = { min: 0, max: 100000000 };
            } finally {
                setIsLoading(false);
                console.log("[ProductListPage] Product API fetch/filter finished.");
            }
        };

        fetchProducts();

        // Dependencies: Rerun this effect whenever the API filter parameters change
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
    }, []);


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
    }, []);


    // --- Loại bỏ hàm getAvailableFilterOptions và memo availableFilterOptions ---
    // const availableFilterOptions = useMemo(() => { ... });


    // --- Client-side Filtering (Price) and Sorting ---
    const finalFilteredAndSortedProducts = useMemo(() => {
        console.log("[ProductListPage] Applying client-side filters (price) and sorting...");
        let tempProducts = [...allProducts];

        const numMinPrice = parseInt(currentMinPriceStr, 10);
        const numMaxPrice = parseInt(currentMaxPriceStr, 10);

        const filterMinPrice = !isNaN(numMinPrice) && currentMinPriceStr !== '' ? numMinPrice : overallMinPrice;
        const filterMaxPrice = !isNaN(numMaxPrice) && currentMaxPriceStr !== '' ? numMaxPrice : overallMaxPrice;

        const isPriceFilterActive = currentMinPriceStr !== '' || currentMaxPriceStr !== '' || filterMinPrice !== overallMinPrice || filterMaxPrice !== overallMaxPrice;

        if (isPriceFilterActive) {
             console.log(`  Applying Client-side Price filter (>=${filterMinPrice}, <=${filterMaxPrice})`);
             const effectiveMaxPrice = Math.max(filterMinPrice, filterMaxPrice);

            tempProducts = tempProducts.filter(p => {
                const priceToFilter = p.finalPrice;
                return typeof priceToFilter === 'number' && priceToFilter !== null &&
                       priceToFilter >= filterMinPrice &&
                       priceToFilter <= effectiveMaxPrice;
            });
             console.log(`  After Client-side Price filter:`, tempProducts.length);
        } else {
             console.log("  No client-side price filter active or filter matches overall range.");
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
        overallMinPrice, overallMaxPrice
    ]);


    // --- Phân trang (Client-side) ---
    const totalItems = finalFilteredAndSortedProducts.length;
    const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);

    const validatedCurrentPage = useMemo(() => {
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const validated = Math.min(page, totalPages || 1);
        return validated;
    }, [searchParams, totalPages]);

    const startIndex = (validatedCurrentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const currentProducts = finalFilteredAndSortedProducts.slice(startIndex, endIndex);

    // --- Handler Cập nhật URL ---
    const handleFilterChange = useCallback((newFilters) => {
        console.log("[ProductListPage] handleFilterChange received:", newFilters);
        setSearchParams(prevParams => {
            const updatedParams = new URLSearchParams(prevParams.toString());
            const arrayFilterKeys = ['cpu', 'storage', 'memory', 'refreshRate'];
            const priceFilterKeys = ['price_gte', 'price_lte'];
            const singleValueFilterKeys = ['sort', 'brandName', 'category'];

            Object.entries(newFilters).forEach(([key, value]) => {
                if (singleValueFilterKeys.includes(key)) {
                     if (value !== undefined && value !== null && String(value).trim() !== '') {
                        updatedParams.set(key, String(value));
                         console.log(`  URL Param SET (Single Value: ${key}): ${String(value)}`);
                     } else {
                        updatedParams.delete(key);
                         console.log(`  URL Param DELETE (Empty Single Value: ${key})`);
                     }
                }
                else if (arrayFilterKeys.includes(key)) {
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
                     const initialMin = initialOverallPriceRange.current.min;
                     const initialMax = initialOverallPriceRange.current.max;

                     if (key === 'price_gte' && !isNaN(numValue)) {
                          if (numValue > initialMin || (initialMin === 0 && numValue > 0)) {
                             updatedParams.set(key, String(numValue));
                             console.log(`  URL Param SET (Price GTE): ${key} = ${String(numValue)}`);
                          } else { updatedParams.delete(key); console.log(`  URL Param DELETE (Price GTE Default/Invalid)`); }
                     } else if (key === 'price_lte' && !isNaN(numValue)) {
                         if (numValue < initialMax || (initialMax === 100000000 && numValue < 100000000)) {
                              updatedParams.set(key, String(numValue));
                              console.log(`  URL Param SET (Price LTE): ${key} = ${String(numValue)}`);
                          } else { updatedParams.delete(key); console.log(`  URL Param DELETE (Price LTE Default/Invalid)`); }
                     }
                 }
            });

            updatedParams.set('page', '1');
            console.log("  New URL Params String (after filter change):", updatedParams.toString());
            return updatedParams;
        }, { replace: true });
        setIsMobileFilterOpen(false);
    }, [setSearchParams, initialOverallPriceRange]);


    // --- Handler Chuyển trang (Client-side) ---
    const handlePageChange = useCallback((newPage) => {
        console.log(`[ProductListPage] handlePageChange trying to navigate to page: ${newPage}. Total pages: ${totalPages}`);
        if (newPage >= 1 && newPage <= totalPages) {
            setSearchParams(prevParams => {
                 const updatedParams = new URLSearchParams(prevParams.toString());
                 updatedParams.set('page', newPage.toString());
                 console.log("  New URL Params (page change):", updatedParams.toString());
                 return updatedParams;
            }, { replace: true });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
             console.warn(`  Page change blocked: newPage ${newPage} is out of the valid range [1-${totalPages}]`);
        }
    }, [totalPages, setSearchParams]);

     // --- useEffect: Adjust page if current page is out of bounds ---
     useEffect(() => {
         const currentPageFromParams = parseInt(searchParams.get('page') || '1', 10);
         if (!isLoading && currentPageFromParams !== validatedCurrentPage) {
             console.warn(`[ProductListPage] URL page ${currentPageFromParams} is invalid (validated=${validatedCurrentPage}, totalPages=${totalPages}). Adjusting URL.`);
             handlePageChange(validatedCurrentPage);
         }
     }, [isLoading, searchParams, validatedCurrentPage, totalPages, handlePageChange]);


    // --- Render ---
    const pageTitle = searchTerm ? `Kết quả tìm kiếm: "${searchTerm}"` : (category ? `${category}` : "Tất Cả Sản Phẩm");
    // Show filter panel if loading, or if there are options to display (brands, categories, dynamic options like price/sort always shown)
    // We don't rely on availableCpuOptions length here anymore for showing the panel
    const showFilterPanel = isLoading || brands.length > 0 || availableCategories.length > 0 || true; // Always show if Price/Sort are permanent filters


    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            <div className={styles.breadcrumbs}>
                <Link to="/">Trang chủ</Link> <FiChevronRight size={14} className={styles.breadcrumbSeparator}/>
                <Link to="/products">Sản phẩm</Link>
                {category && <><FiChevronRight size={14} className={styles.breadcrumbSeparator}/> <span>{category}</span></>}
                {searchTerm && <><FiChevronRight size={14} className={styles.breadcrumbSeparator}/> <span>Tìm kiếm</span></>}
            </div>

             {/* Mobile Filter Button */}
            { showFilterPanel && (
                <button
                    className={styles.mobileFilterButton}
                    onClick={() => setIsMobileFilterOpen(true)}
                    aria-label="Mở bộ lọc và sắp xếp"
                    disabled={isLoading}
                >
                    <FiFilter /> Lọc & Sắp xếp {isLoading ? '(Đang tải...)' : (finalFilteredAndSortedProducts.length > 0 ? `(${finalFilteredAndSortedProducts.length})` : '')}
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
                                brandName: currentBrandName,
                                price_gte: currentMinPriceStr,
                                price_lte: currentMaxPriceStr,
                                cpu: currentCpu, // Pass mảng giá trị CPU được chọn
                                storage: currentStorage,
                                memory: currentMemory,
                                refreshRate: currentRefreshRate,
                            }}
                            onFilterChange={handleFilterChange}
                            availableBrands={brands}
                            availableCategories={availableCategories}
                            minPrice={overallMinPrice}
                            maxPrice={overallMaxPrice}
                            currentCategory={category} // Pass current category for CPU options logic in FilterSortPanel
                            isLoading={isLoading} // Pass isLoading
                        />
                    </div>
                 )}
                {/* Overlay for mobile filter */}
                {isMobileFilterOpen && <div className={styles.mobileFilterOverlay} onClick={() => setIsMobileFilterOpen(false)}></div>}


                <div className={styles.mainProductArea}>
                    {isLoading && allProducts.length === 0 && !error ? (
                        <div className={styles.loadingContainer}><Spinner size="large" /></div>
                    ) : error ? (
                        <p className={`${styles.error} ${styles.fetchError}`}>{error}</p>
                    ) : finalFilteredAndSortedProducts.length > 0 ? (
                        <>
                            <div className={styles.listHeader}>
                                <span>Hiển thị {startIndex + 1} - {Math.min(endIndex, totalItems)} trên tổng số {totalItems} sản phẩm</span>
                            </div>
                            <div className={styles.productListGrid}>
                                {currentProducts.map((product) => (
                                    <ProductCard key={product.productId || product.id} product={product} />
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={validatedCurrentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    ) : (
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