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
    return foundSpec?.content || null;
};

// Định nghĩa các từ khóa và ánh xạ cho bộ lọc CPU
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

// Hàm kiểm tra xem CPU của sản phẩm có khớp với các filter đã chọn không
const checkCpuMatch = (productCpuValue, selectedCpuFilters, category) => {
    if (!productCpuValue || selectedCpuFilters.length === 0) return false;
    const lowerProductCpu = productCpuValue.toLowerCase();
    const categoryKey = category.toLowerCase() === 'laptop' ? 'LAPTOP' : 'SMARTPHONE';
    const relevantMappings = CPU_KEYWORDS[categoryKey] || [];

    return selectedCpuFilters.some(selectedFilter => {
        const mapping = relevantMappings.find(m => m.filterOption === selectedFilter);
        if (!mapping) return false;
        return mapping.keywords.some(keyword => lowerProductCpu.includes(keyword));
    });
};

// Hàm trích xuất các tùy chọn lọc động (CPU, RAM Type) từ danh sách sản phẩm
const getAvailableFilterOptions = (products, category) => {
    const cpuOptions = new Set();
    const ramTypes = new Set();
    const isLaptop = category.toLowerCase() === 'laptop';
    const categoryKey = isLaptop ? 'LAPTOP' : 'SMARTPHONE';
    const relevantCpuMappings = CPU_KEYWORDS[categoryKey] || [];

    products.forEach(p => {
        const specs = p.parsedSpecifications;
        if (!specs) return;

        // Trích xuất CPU Option
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

        // Trích xuất RAM Type (chỉ cho Laptop)
        if (isLaptop) {
            const ramValue = findSpecValue(specs, 'RAM'); // !!! Đảm bảo title này đúng !!!
            if (ramValue) {
                const upperRamValue = ramValue.toUpperCase();
                if (upperRamValue.includes('DDR5')) ramTypes.add('DDR5');
                else if (upperRamValue.includes('DDR4')) ramTypes.add('DDR4');
                else if (upperRamValue.includes('DDR3')) ramTypes.add('DDR3');
            }
        }
    });

    return {
        availableCpuOptions: [...cpuOptions].sort(),
        availableRamTypes: [...ramTypes].sort((a, b) => {
            const order = { 'DDR5': 3, 'DDR4': 2, 'DDR3': 1 };
            return (order[b] || 0) - (order[a] || 0);
        })
    };
};


// --- Component Chính ---
const ProductListPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [allProducts, setAllProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [overallMinPrice, setOverallMinPrice] = useState(0);
    const [overallMaxPrice, setOverallMaxPrice] = useState(100000000);

    // --- Đọc và chuẩn hóa tham số từ URL ---
    const category = searchParams.get('category') || '';
    const searchTerm = searchParams.get('q') || '';
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const currentSort = searchParams.get('sort') || '';
    const currentBrand = searchParams.get('brand') || '';
    const currentMinPriceStr = searchParams.get('price_gte') || overallMinPrice.toString();
    const currentMaxPriceStr = searchParams.get('price_lte') || overallMaxPrice.toString();
    // Đọc filters dạng mảng (sử dụng key đã thống nhất)
    const ramCapacityParam = searchParams.get('ramCapacity') || '';
    const storageParam = searchParams.get('storage') || ''; // Key URL vẫn là 'storage'
    const cpuParam = searchParams.get('cpu') || '';
    const ramTypeParam = searchParams.get('ramType') || '';

    // Chuyển đổi thành mảng
    const currentRamCapacity = useMemo(() => ramCapacityParam ? ramCapacityParam.split(',') : [], [ramCapacityParam]);
    const currentStorage = useMemo(() => storageParam ? storageParam.split(',') : [], [storageParam]); // State vẫn là currentStorage
    const currentCpu = useMemo(() => cpuParam ? cpuParam.split(',') : [], [cpuParam]);
    const currentRamType = useMemo(() => ramTypeParam ? ramTypeParam.split(',') : [], [ramTypeParam]);


    // --- useEffect: Fetch Data ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            setAllProducts([]);

            try {
                console.log(`[ProductListPage] Fetching data for category: '${category}', search: '${searchTerm}'`);
                let productPromise;
                 if (searchTerm) {
                     console.log(`[ProductListPage] API Call: searchProducts(${searchTerm})`);
                     productPromise = apiService.searchProducts(searchTerm);
                 } else if (category) {
                     console.log(`[ProductListPage] API Call: getProductsByCategory(${category})`);
                     productPromise = apiService.getProductsByCategory(category);
                 } else {
                     console.log("[ProductListPage] API Call: getAllProducts()");
                     productPromise = apiService.getAllProducts();
                 }

                const brandPromise = brands.length === 0 ? apiService.getAllBrands() : Promise.resolve({ data: brands });
                const [productRes, brandRes] = await Promise.allSettled([productPromise, brandPromise]);

                let minP = Infinity;
                let maxP = 0;
                let processedProducts = [];

                if (productRes.status === 'fulfilled' && productRes.value?.data && Array.isArray(productRes.value.data)) {
                    console.log(`[ProductListPage] Received ${productRes.value.data.length} products from API.`);
                    const fetchedProducts = productRes.value.data;
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

                         if (p.variants && Array.isArray(p.variants) && p.variants.length > 0 && typeof p.price === 'number') {
                             let lowestVariantPrice = Infinity;
                             p.variants.forEach(v => {
                                 const discountMultiplier = (100 - (Number(v.discount) || 0)) / 100;
                                 const finalPrice = Math.round(p.price * discountMultiplier);
                                 lowestVariantPrice = Math.min(lowestVariantPrice, finalPrice);
                             });
                             productFinalPrice = lowestVariantPrice !== Infinity ? lowestVariantPrice : (p.price ?? null);
                         }

                        if (productFinalPrice !== null) {
                            minP = Math.min(minP, productFinalPrice);
                            maxP = Math.max(maxP, productFinalPrice);
                        }
                        return {
                           ...p,
                           finalPrice: productFinalPrice,
                           basePrice: productBasePrice,
                           parsedSpecifications: parsedSpecs
                        };
                    });
                    setAllProducts(processedProducts);

                    if (processedProducts.length > 0) {
                        setOverallMinPrice(minP === Infinity ? 0 : minP);
                        setOverallMaxPrice(maxP === 0 ? 100000000 : maxP);
                        console.log(`[ProductListPage] Overall price range calculated: [${minP === Infinity ? 0 : minP} - ${maxP === 0 ? 100000000 : maxP}]`);
                    } else {
                        setOverallMinPrice(0); setOverallMaxPrice(100000000);
                        console.log("[ProductListPage] No products found, resetting price range.");
                    }
                } else {
                    setAllProducts([]);
                    setOverallMinPrice(0); setOverallMaxPrice(100000000);
                    if (productRes.status === 'rejected') {
                         console.error("Product fetch failed:", productRes.reason);
                         setError(productRes.reason?.response?.data?.message || productRes.reason?.message || "Lỗi tải sản phẩm.");
                    } else {
                         console.warn("Product fetch response was not as expected:", productRes.value);
                         setError("Không nhận được dữ liệu sản phẩm hợp lệ.");
                    }
                }

                // Xử lý Brands
                if (brandRes.status === 'fulfilled' && brandRes.value?.data && Array.isArray(brandRes.value.data) && brands.length === 0) {
                    console.log(`[ProductListPage] Received ${brandRes.value.data.length} brands.`);
                    setBrands([...brandRes.value.data].sort((a, b) => (a.brandName || '').localeCompare(b.brandName || '')));
                } else if (brandRes.status === 'rejected' && brands.length === 0) {
                    console.error("Brands fetch failed:", brandRes.reason);
                }

            } catch (err) {
                 console.error("System error during fetch:", err);
                 setError("Đã xảy ra lỗi hệ thống. Vui lòng thử lại.");
                 setAllProducts([]);
                 setBrands([]);
                 setOverallMinPrice(0); setOverallMaxPrice(100000000);
            } finally {
                setIsLoading(false);
                console.log("[ProductListPage] Fetching process finished.");
            }
        };
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, searchTerm]);


    // --- Trích xuất các tùy chọn lọc động ---
    const availableFilterOptions = useMemo(() => {
        console.log("[ProductListPage] Calculating available dynamic filter options...");
        const options = getAvailableFilterOptions(allProducts, category);
        console.log("[ProductListPage] Available CPU Options:", options.availableCpuOptions);
        console.log("[ProductListPage] Available RAM Types:", options.availableRamTypes);
        return options;
    }, [allProducts, category]);


    // --- Lọc và Sắp xếp phía Client ---
    const filteredAndSortedProducts = useMemo(() => {
        console.log("[ProductListPage] Applying filters and sorting on client-side...");
        let tempProducts = [...allProducts];
        const numMinPrice = parseInt(currentMinPriceStr, 10);
        const numMaxPrice = parseInt(currentMaxPriceStr, 10);
        const isLaptopCat = category.toLowerCase() === 'laptop';

        console.log("  Initial product count:", tempProducts.length);
        console.log("  Current Filters:", {
            brand: currentBrand, price_gte: currentMinPriceStr, price_lte: currentMaxPriceStr,
            ramCapacity: currentRamCapacity, storage: currentStorage, cpu: currentCpu, ramType: currentRamType, sort: currentSort
        });

        // 1. Lọc Brand
        if (currentBrand) {
            tempProducts = tempProducts.filter(p => (p.brandName || '').toLowerCase() === currentBrand.toLowerCase());
            console.log(`  After Brand ('${currentBrand}') filter:`, tempProducts.length);
        }

        // 2. Lọc Giá
        const isPriceFilterActive = (!isNaN(numMinPrice) && numMinPrice > overallMinPrice) ||
                                    (!isNaN(numMaxPrice) && numMaxPrice < overallMaxPrice);
        if (isPriceFilterActive) {
            tempProducts = tempProducts.filter(p => {
                const priceToFilter = p.finalPrice;
                return priceToFilter !== null &&
                       (!isNaN(numMinPrice) ? priceToFilter >= numMinPrice : true) &&
                       (!isNaN(numMaxPrice) ? priceToFilter <= numMaxPrice : true);
            });
            console.log(`  After Price (>=${numMinPrice || 'any'}, <=${numMaxPrice || 'any'}) filter:`, tempProducts.length);
        }

        // 3. Lọc CPU
        if (currentCpu.length > 0) {
            tempProducts = tempProducts.filter(p => {
                const productCpuValue = findSpecValue(p.parsedSpecifications, 'Chip xử lý'); // !!! Title phải đúng !!!
                return checkCpuMatch(productCpuValue, currentCpu, category);
            });
            console.log(`  After CPU ('${currentCpu.join(',')}') filter:`, tempProducts.length);
        }

        // 4. Lọc RAM Capacity
        if (currentRamCapacity.length > 0) {
            tempProducts = tempProducts.filter(p => {
                const productRamValue = findSpecValue(p.parsedSpecifications, 'RAM'); // !!! Title phải đúng !!!
                if (!productRamValue) return false;
                return currentRamCapacity.some(capacityOption => productRamValue.startsWith(capacityOption));
            });
            console.log(`  After RAM Capacity ('${currentRamCapacity.join(',')}') filter:`, tempProducts.length);
        }

        // 5. Lọc RAM Type (Chỉ Laptop)
        if (currentRamType.length > 0 && isLaptopCat) {
            tempProducts = tempProducts.filter(p => {
                const productRamValue = findSpecValue(p.parsedSpecifications, 'RAM'); // !!! Title phải đúng !!!
                if (!productRamValue) return false;
                const upperProductRamValue = productRamValue.toUpperCase();
                return currentRamType.some(typeOption => upperProductRamValue.includes(typeOption));
            });
             console.log(`  After RAM Type ('${currentRamType.join(',')}') filter (Laptop only):`, tempProducts.length);
        }

        // 6. Lọc Storage / Ổ cứng
        if (currentStorage.length > 0) {
            tempProducts = tempProducts.filter(p => {
                // *** LOGIC LỌC VẪN DÙNG TITLE GỐC TỪ DATA ***
                const productStorageValue = findSpecValue(p.parsedSpecifications, 'Dung lượng lưu trữ'); // !!! Title này phải đúng với data backend !!!
                return productStorageValue && currentStorage.includes(productStorageValue);
            });
            console.log(`  After Storage ('${currentStorage.join(',')}') filter:`, tempProducts.length);
        }

        // 7. Sắp xếp
        if (currentSort) {
             console.log(`  Sorting by: ${currentSort}`);
            switch (currentSort) {
                case 'price_asc': tempProducts.sort((a, b) => (a.finalPrice ?? Infinity) - (b.finalPrice ?? Infinity)); break;
                case 'price_desc': tempProducts.sort((a, b) => (b.finalPrice ?? -Infinity) - (a.finalPrice ?? -Infinity)); break;
            }
        } else {
            console.log("  No sorting applied.");
        }

        console.log("  Final filtered/sorted product count:", tempProducts.length);
        return tempProducts;
    }, [
        allProducts, category, currentSort, currentBrand, currentMinPriceStr, currentMaxPriceStr,
        currentRamCapacity, currentStorage, currentCpu, currentRamType,
        overallMinPrice, overallMaxPrice
    ]);


    // --- Phân trang ---
    const totalPages = Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE);
    const validatedCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
    const startIndex = (validatedCurrentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

    // --- Handler Cập nhật URL ---
    const handleFilterChange = useCallback((newFilters) => {
        console.log("[ProductListPage] handleFilterChange received:", newFilters);
        setSearchParams(prevParams => {
            const updatedParams = new URLSearchParams(prevParams.toString());
            // Các key filter dạng mảng (đảm bảo key 'storage' vẫn đúng)
            const arrayFilterKeys = ['ramCapacity', 'storage', 'cpu', 'ramType'];

            Object.entries(newFilters).forEach(([key, value]) => {
                if (arrayFilterKeys.includes(key) && Array.isArray(value)) {
                    if (value.length > 0) {
                        updatedParams.set(key, value.join(','));
                        console.log(`  URL Param SET (Array): ${key} = ${value.join(',')}`);
                    } else {
                        updatedParams.delete(key);
                        console.log(`  URL Param DELETE (Empty Array): ${key}`);
                    }
                }
                else if (key === 'price_gte' && String(value) === String(overallMinPrice)) {
                     updatedParams.delete(key);
                     console.log(`  URL Param DELETE (Default Min Price): ${key}`);
                 } else if (key === 'price_lte' && String(value) === String(overallMaxPrice)) {
                     updatedParams.delete(key);
                      console.log(`  URL Param DELETE (Default Max Price): ${key}`);
                 }
                else if (value !== undefined && value !== null && String(value).trim() !== '') {
                    updatedParams.set(key, String(value));
                     console.log(`  URL Param SET: ${key} = ${String(value)}`);
                }
                else {
                    updatedParams.delete(key);
                     console.log(`  URL Param DELETE (Empty/Null/Undefined): ${key}`);
                }
            });

            updatedParams.set('page', '1'); // Reset về trang 1
            console.log("  New URL Params String:", updatedParams.toString());
            return updatedParams;
        }, { replace: true });
        setIsMobileFilterOpen(false);
    }, [setSearchParams, overallMinPrice, overallMaxPrice]);

    // --- Handler Chuyển trang ---
    const handlePageChange = useCallback((newPage) => {
        console.log(`[ProductListPage] handlePageChange trying to navigate to page: ${newPage}`);
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

    // --- useEffect: Kiểm tra trang không hợp lệ ---
    useEffect(() => {
        if (!isLoading && totalPages > 0 && currentPage > totalPages) {
            console.warn(`[ProductListPage] Current page ${currentPage} is invalid (totalPages=${totalPages}). Redirecting to last page: ${totalPages}.`);
            handlePageChange(totalPages);
        }
    }, [isLoading, currentPage, totalPages, handlePageChange]);

    // --- Render ---
    const pageTitle = searchTerm ? `Kết quả tìm kiếm: "${searchTerm}"` : (category ? `${category}` : "Tất Cả Sản Phẩm");

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            <div className={styles.breadcrumbs}>
                <Link to="/">Trang chủ</Link> <FiChevronRight size={14} className={styles.breadcrumbSeparator}/>
                <Link to="/products">Sản phẩm</Link>
                {category && <><FiChevronRight size={14} className={styles.breadcrumbSeparator}/> <span>{category}</span></>}
                {searchTerm && <><FiChevronRight size={14} className={styles.breadcrumbSeparator}/> <span>Tìm kiếm</span></>}
            </div>

            <button
                className={styles.mobileFilterButton}
                onClick={() => setIsMobileFilterOpen(true)}
                aria-label="Mở bộ lọc và sắp xếp"
                disabled={isLoading}
            >
                <FiFilter /> Lọc & Sắp xếp ({isLoading ? '...' : filteredAndSortedProducts.length})
            </button>

            <div className={styles.contentWrapper}>
                <div className={`${styles.filterPanelContainer} ${isMobileFilterOpen ? styles.mobileFilterOpen : ''}`}>
                    <button className={styles.closeMobileFilter} onClick={() => setIsMobileFilterOpen(false)} aria-label="Đóng bộ lọc">
                        <FiX/>
                    </button>
                    <FilterSortPanel
                        currentFilters={{
                            sort: currentSort,
                            brand: currentBrand,
                            price_gte: currentMinPriceStr,
                            price_lte: currentMaxPriceStr,
                            ramCapacity: currentRamCapacity,
                            storage: currentStorage, // Key filter vẫn là 'storage'
                            cpu: currentCpu,
                            ramType: currentRamType
                        }}
                        onFilterChange={handleFilterChange}
                        availableBrands={brands}
                        minPrice={overallMinPrice}
                        maxPrice={overallMaxPrice}
                        currentCategory={category}
                        availableCpuOptions={availableFilterOptions.availableCpuOptions}
                        availableRamTypes={availableFilterOptions.availableRamTypes}
                    />
                </div>
                {isMobileFilterOpen && <div className={styles.mobileFilterOverlay} onClick={() => setIsMobileFilterOpen(false)}></div>}

                <div className={styles.mainProductArea}>
                    {isLoading ? (
                        <div className={styles.loadingContainer}><Spinner size="large" /></div>
                    ) : error ? (
                        <p className={`${styles.error} ${styles.fetchError}`}>{error}</p>
                    ) : filteredAndSortedProducts.length > 0 ? (
                        <>
                            <div className={styles.listHeader}>
                                <span>Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredAndSortedProducts.length)} trên tổng số {filteredAndSortedProducts.length} sản phẩm</span>
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
                        <p className={styles.noResults}>
                            Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn. Vui lòng thử điều chỉnh bộ lọc.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;