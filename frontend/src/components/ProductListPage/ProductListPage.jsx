import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiService from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import Spinner from '../../components/Spinner/Spinner';
import FilterSortPanel from '../../components/FilterSortPanel/FilterSortPanel';
import Pagination from '../../components/Pagination/Pagination';
import styles from './ProductListPage.module.css';
import { FiFilter, FiChevronRight, FiX } from 'react-icons/fi';

const PRODUCTS_PER_PAGE = 12;


const ProductListPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();


    const [allProducts, setAllProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);


    const [overallMinPrice, setOverallMinPrice] = useState(0);
    const [overallMaxPrice, setOverallMaxPrice] = useState(100000000);


     const initialOverallPriceRange = useRef({ min: 0, max: 100000000 });



    const category = searchParams.get('category') || '';
    const searchTerm = searchParams.get('q') || '';
    const currentSort = searchParams.get('sort') || '';

    const currentBrandName = searchParams.get('brand') || '';



    const currentMinPriceStr = searchParams.get('price_gte') || '';
    const currentMaxPriceStr = searchParams.get('price_lte') || '';



    const cpuParam = searchParams.get('cpu') || '';
    const storageParam = searchParams.get('storage') || '';
    const memoryParam = searchParams.get('memory') || '';
    const refreshRateParam = searchParams.get('refreshRate') || '';


    const currentCpu = useMemo(() => cpuParam ? cpuParam.split(',').map(item => item.trim()).filter(item => item !== '') : [], [cpuParam]);
    const currentStorage = useMemo(() => storageParam ? storageParam.split(',').map(item => item.trim()).filter(item => item !== '') : [], [storageParam]);
    const currentMemory = useMemo(() => memoryParam ? memoryParam.split(',').map(item => item.trim()).filter(item => item !== '') : [], [memoryParam]);
    const currentRefreshRate = useMemo(() => refreshRateParam ? refreshRateParam.split(',').map(item => item.trim()).filter(item => item !== '') : [], [refreshRateParam]);


    useEffect(() => {
        const fetchProducts = async () => {
            console.log(`[ProductListPage] Fetch products effect triggered with params: category="${category}", brand="${currentBrandName}", cpu=[${currentCpu.join(', ')}], storage=[${currentStorage.join(', ')}], memory=[${currentMemory.join(', ')}], refreshRate=[${currentRefreshRate.join(', ')}]...`);
            setIsLoading(true);
            setError(null);
            setAllProducts([]);

            try {
                let productRes;
                let fetchedProducts = [];
                let minP = Infinity;
                let maxP = 0;



                console.log(currentBrandName);
                console.log(category);
                if (currentBrandName && !category) {


                    console.log(`[ProductListPage] Brand filter "${currentBrandName}" active (from 'brand' param) AND NO category. Calling API getProductsbyBrandName.`);
                    productRes = await apiService.getProductsbyBrandName(currentBrandName);


                } else if (category && (currentBrandName || currentCpu.length > 0 || currentStorage.length > 0 || currentMemory.length > 0 || currentRefreshRate.length > 0)) {


                    console.log("[ProductListPage] Category or other API filters active (brand, category, specs...). Calling API filter endpoint.");
                    const apiFilters = {
                        type: category || undefined,

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

                    console.log("[ProductListPage] No API filters active. Calling API getAllProducts endpoint.");
                    productRes = await apiService.getAllProducts();
                }



                if (productRes?.data && Array.isArray(productRes.data)) {
                    console.log(`[ProductListPage] Received ${productRes.data.length} products from API.`);
                    fetchedProducts = productRes.data;

                    const processedProducts = fetchedProducts.map(p => {
                         let productFinalPrice = p.price ?? null;
                         let productBasePrice = p.price ?? null;
                         let parsedSpecs = null;


                         if (p.specifications && typeof p.specifications === 'string') {
                             try { parsedSpecs = JSON.parse(p.specifications); if (!Array.isArray(parsedSpecs)) parsedSpecs = null; } catch (e) { parsedSpecs = null; console.error("Error parsing specifications:", p.specifications, e); }
                         } else if (Array.isArray(p.specifications)) {

                             parsedSpecs = p.specifications;
                         }



                         if (p.variants && Array.isArray(p.variants) && p.variants.length > 0 && typeof p.price === 'number' && p.price !== null) {
                             let lowestVariantPrice = Infinity;
                             p.variants.forEach(v => {
                                 const discountPercentage = Number(v.discount) || 0;
                                 const discountMultiplier = (100 - discountPercentage) / 100;

                                 const finalPrice = Math.max(0, Math.round(p.price * discountMultiplier));
                                 lowestVariantPrice = Math.min(lowestVariantPrice, finalPrice);
                             });
                             productFinalPrice = lowestVariantPrice !== Infinity ? lowestVariantPrice : (p.price ?? null);
                         } else {

                             productFinalPrice = p.price ?? null;
                         }


                        if (typeof productFinalPrice === 'number' && productFinalPrice !== null) { minP = Math.min(minP, productFinalPrice); maxP = Math.max(maxP, productFinalPrice); }
                        return { ...p, finalPrice: productFinalPrice, basePrice: productBasePrice, parsedSpecifications: parsedSpecs };
                    });

                    setAllProducts(processedProducts);



                    if (processedProducts.length > 0) {
                        const calculatedMin = minP === Infinity ? 0 : minP;
                        const calculatedMax = maxP === 0 ? 100000000 : maxP;
                         console.log(`[ProductListPage] Overall price range calculated from fetched results: [${calculatedMin} - ${calculatedMax}]`);





                         if (initialOverallPriceRange.current.min === 0 && initialOverallPriceRange.current.max === 100000000) {
                              if (calculatedMin < calculatedMax) {
                                 initialOverallPriceRange.current = { min: calculatedMin, max: calculatedMax };
                                 console.log(`[ProductListPage] Stored initial overall price range: [${initialOverallPriceRange.current.min} - ${initialOverallPriceRange.current.max}]`);
                             }
                         }


                         setOverallMinPrice(calculatedMin);
                         setOverallMaxPrice(calculatedMax);

                    } else {

                        setOverallMinPrice(0); setOverallMaxPrice(100000000);

                        console.log("[ProductListPage] No products fetched, resetting overall price range for current display.");
                    }


                } else {
                    setAllProducts([]);
                    setOverallMinPrice(0); setOverallMaxPrice(100000000);

                    console.warn("Product fetch/filter response data was not valid or empty:", productRes);

                }

            } catch (err) {
                 console.error("System error during API fetch/filter:", err);
                 const errorMessage = err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tải sản phẩm.";
                 setError(errorMessage);
                 setAllProducts([]);
                 setOverallMinPrice(0); setOverallMaxPrice(100000000);

            } finally {
                setIsLoading(false);
                console.log("[ProductListPage] Product API fetch/filter finished.");

                 setIsMobileFilterOpen(false);
            }
        };

        fetchProducts();



    }, [category, currentBrandName, currentCpu, currentStorage, currentMemory, currentRefreshRate]);



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



    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoryRes = await apiService.getAllCategories();
                if(categoryRes.data && Array.isArray(categoryRes.data)) {

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



    const finalFilteredAndSortedProducts = useMemo(() => {
        console.log("[ProductListPage] Applying client-side filters (price) and sorting...");
        let tempProducts = [...allProducts];

        const numMinPrice = parseInt(currentMinPriceStr, 10);
        const numMaxPrice = parseInt(currentMaxPriceStr, 10);



        const filterMinPrice = !isNaN(numMinPrice) && currentMinPriceStr !== '' ? numMinPrice : overallMinPrice;
        const filterMaxPrice = !isNaN(numMaxPrice) && currentMaxPriceStr !== '' ? numMaxPrice : overallMaxPrice;




        const isPriceFilterMeaningful = overallMinPrice < overallMaxPrice;

        const isPriceFilterActive = isPriceFilterMeaningful && (filterMinPrice > overallMinPrice || filterMaxPrice < overallMaxPrice);


        if (isPriceFilterActive) {

             const effectiveMinPrice = Math.min(filterMinPrice, filterMaxPrice);
             const effectiveMaxPrice = Math.max(filterMinPrice, filterMaxPrice);

             console.log(`  Applying Client-side Price filter (>=${effectiveMinPrice}, <=${effectiveMaxPrice})`);

            tempProducts = tempProducts.filter(p => {
                const priceToFilter = p.finalPrice;

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
        overallMinPrice, overallMaxPrice
    ]);



    const totalItems = finalFilteredAndSortedProducts.length;
    const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);

    const validatedCurrentPage = useMemo(() => {
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));


        const maxPage = totalPages > 0 ? totalPages : 1;
        const validated = Math.min(page, maxPage);


        return validated;
    }, [searchParams, totalPages]);


    const startIndex = (validatedCurrentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const currentProducts = finalFilteredAndSortedProducts.slice(startIndex, endIndex);




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



    const handleFilterChange = useCallback((newFilters) => {
        console.log("[ProductListPage] handleFilterChange received:", newFilters);
        setSearchParams(prevParams => {
            const updatedParams = new URLSearchParams(prevParams.toString());
            const arrayFilterKeys = ['cpu', 'storage', 'memory', 'refreshRate'];
            const priceFilterKeys = ['price_gte', 'price_lte'];

            const singleValueFilterKeys = ['sort', 'brand', 'category'];

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



                     if (String(value).trim() !== '' && !isNaN(numValue)) {
                         updatedParams.set(key, String(numValue));
                         console.log(`  URL Param SET (Price Filter: ${key}): ${String(numValue)}`);
                     } else {

                         updatedParams.delete(key);
                         console.log(`  URL Param DELETE (Empty/Invalid Price Filter: ${key})`);
                     }
                 }
            });


            updatedParams.set('page', '1');
            console.log("  New URL Params String (after filter change):", updatedParams.toString());
            return updatedParams;
        }, { replace: true });
        setIsMobileFilterOpen(false);
    }, [setSearchParams]);




     useEffect(() => {
         const currentPageFromParams = parseInt(searchParams.get('page') || '1', 10);



         if (!isLoading && currentPageFromParams !== validatedCurrentPage && validatedCurrentPage >= 1) {
             console.warn(`[ProductListPage] URL page ${currentPageFromParams} is invalid (validated=${validatedCurrentPage}, totalPages=${totalPages}). Adjusting URL.`);
             handlePageChange(validatedCurrentPage);
         }


     }, [isLoading, searchParams, validatedCurrentPage, totalPages, handlePageChange]);




    let pageTitle = "Tất Cả Sản Phẩm";
    if (searchTerm) {
        pageTitle = `Kết quả tìm kiếm: "${searchTerm}"`;
    } else if (currentBrandName && category) {


        pageTitle = `Sản phẩm ${currentBrandName} (${category})`;

    } else if (currentBrandName) {
        pageTitle = `Sản phẩm ${currentBrandName}`;
    } else if (category) {
        pageTitle = `${category}`;
    }

    useEffect(() => {
            document.title = pageTitle;
        }, []);
    




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
                                brand: currentBrandName,
                                price_gte: currentMinPriceStr,
                                price_lte: currentMaxPriceStr,
                                cpu: currentCpu,
                                storage: currentStorage,
                                memory: currentMemory,
                                refreshRate: currentRefreshRate,
                            }}
                            onFilterChange={handleFilterChange}
                            availableBrands={brands}
                            availableCategories={availableCategories}

                            minPrice={initialOverallPriceRange.current.min}
                            maxPrice={initialOverallPriceRange.current.max}
                            currentCategory={category}
                            isLoading={isLoading}
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
                                {/* Adjust count display based on client-side filtering results */}
                                <span>Hiển thị {startIndex + 1} - {Math.min(endIndex, totalItems)} trên tổng số {totalItems} sản phẩm</span>
                            </div>
                            <div className={styles.productListGrid}>
                                {currentProducts.map((product) => (

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