import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiService from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import Spinner from '../../components/Spinner/Spinner';
import FilterSortPanel from '../../components/FilterSortPanel/FilterSortPanel';
import Pagination from '../../components/Pagination/Pagination';
import styles from './SearchProductListPage.module.css';
import { FiFilter, FiChevronRight, FiX, FiSearch } from 'react-icons/fi';
import Button from '../../components/Button/Button';

const PRODUCTS_PER_PAGE = 12; // Số sản phẩm trên mỗi trang

const SearchProductListPage = () => {
  // Hooks
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [allProducts, setAllProducts] = useState([]); // Lưu trữ kết quả tìm kiếm gốc
  const [brands, setBrands] = useState([]);           // Lưu trữ danh sách brand để lọc
  const [isLoading, setIsLoading] = useState(true);   // Trạng thái loading
  const [error, setError] = useState(null);           // Trạng thái lỗi fetch
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false); // Trạng thái mở filter mobile
  // State lưu trữ min/max price tổng thể (khởi tạo với giá trị mặc định)
  const [overallMinPrice, setOverallMinPrice] = useState(0);
  const [overallMaxPrice, setOverallMaxPrice] = useState(100000000);

  // Đọc các tham số từ URL, cung cấp giá trị mặc định
  const searchTerm = searchParams.get('q') || ''; // Lấy từ khóa tìm kiếm 'q'
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSort = searchParams.get('sort') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentMinPrice = searchParams.get('price_gte') || overallMinPrice.toString();
  const currentMaxPrice = searchParams.get('price_lte') || overallMaxPrice.toString();

  // useEffect: Fetch dữ liệu tìm kiếm và brands khi searchTerm thay đổi
  useEffect(() => {
    // Chỉ fetch khi có searchTerm
    if (!searchTerm) {
      setAllProducts([]);
      setIsLoading(false);
      // Có thể hiển thị thông báo yêu cầu nhập từ khóa ở phần render
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setAllProducts([]);
      if (brands.length === 0) setBrands([]); // Chỉ reset brands nếu chưa fetch

      try {
        console.log(`[SearchPage] Fetching search results for: ${searchTerm}`);
        const productPromise = apiService.searchProducts(searchTerm);
        const brandPromise = brands.length === 0 ? apiService.getAllBrands() : Promise.resolve({ data: brands });

        const [productRes, brandRes] = await Promise.allSettled([productPromise, brandPromise]);

        // Xử lý products và tính min/max price
        let minP = Infinity;
        let maxP = 0;
        let processedProducts = [];

        if (productRes.status === 'fulfilled' && productRes.value?.data && Array.isArray(productRes.value.data)) {
            const fetchedProducts = productRes.value.data;
            processedProducts = fetchedProducts.map(p => {
                let productFinalPrice = p.price ?? null;
                let productBasePrice = p.price ?? null;
                if (p.variants && Array.isArray(p.variants) && typeof p.price === 'number') {
                     let lowestVariantPrice = Infinity;
                     const variantsWithPrice = p.variants.map(v => {
                         const discountMultiplier = (100 - (v.discount || 0)) / 100;
                         const finalPrice = Math.round(p.price * discountMultiplier);
                         lowestVariantPrice = Math.min(lowestVariantPrice, finalPrice);
                         return { ...v, finalPrice: finalPrice, basePrice: p.price };
                     });
                     productFinalPrice = lowestVariantPrice !== Infinity ? lowestVariantPrice : p.price ?? null;
                     return { ...p, variants: variantsWithPrice, finalPrice: productFinalPrice, basePrice: productBasePrice };
                }
                if (productFinalPrice !== null) {
                    minP = Math.min(minP, productFinalPrice);
                    maxP = Math.max(maxP, productFinalPrice);
                }
                 return { ...p, finalPrice: productFinalPrice, basePrice: productBasePrice };
           });
          setAllProducts(processedProducts);
          // Cập nhật min/max tổng thể
          if (processedProducts.length > 0) {
              setOverallMinPrice(minP === Infinity ? 0 : minP);
              setOverallMaxPrice(maxP === 0 ? 100000000 : maxP);
          } else {
              setOverallMinPrice(0);
              setOverallMaxPrice(100000000);
              // Nếu không có kết quả, cũng có thể coi là một dạng 'lỗi' hoặc thông báo
              setError(`Không tìm thấy sản phẩm nào với từ khóa "${searchTerm}".`);
          }
        } else {
          setAllProducts([]);
          if (productRes.status === 'rejected') {
              setError(productRes.reason?.message || `Lỗi khi tìm kiếm "${searchTerm}".`);
          } else {
               setError(`Không tìm thấy sản phẩm nào cho từ khóa "${searchTerm}".`);
          }
        }

         // Xử lý brands
         if (brandRes.status === 'fulfilled' && brandRes.value?.data && Array.isArray(brandRes.value.data) && brands.length === 0) {
            setBrands([...brandRes.value.data].sort((a, b) => (a.brandName || '').localeCompare(b.brandName || '')));
         } else if (brandRes.status === 'rejected' && brands.length === 0) {
             console.error("Lỗi fetch Brands:", brandRes.reason);
         }

      } catch (err) {
        console.error("Lỗi hệ thống khi tải dữ liệu SearchPage:", err);
        setError("Lỗi hệ thống khi tải dữ liệu tìm kiếm.");
        setAllProducts([]);
        setBrands([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]); // Fetch lại khi searchTerm thay đổi

  // --- Lọc và Sắp xếp phía Client ---
  const filteredAndSortedProducts = useMemo(() => {
    let tempProducts = [...allProducts];
    const numMinPrice = parseInt(currentMinPrice, 10);
    const numMaxPrice = parseInt(currentMaxPrice, 10);

    // 1. Lọc theo Brand
    if (currentBrand) {
      tempProducts = tempProducts.filter(p => (p.brandName || '').toLowerCase() === currentBrand.toLowerCase());
    }

    // 2. Lọc theo Giá
    const isPriceFilterActive = !isNaN(numMinPrice) && !isNaN(numMaxPrice) && (numMinPrice > overallMinPrice || numMaxPrice < overallMaxPrice);
    if (isPriceFilterActive) {
        tempProducts = tempProducts.filter(p => {
             const priceToFilter = p.finalPrice;
             return priceToFilter !== null && priceToFilter >= numMinPrice && priceToFilter <= numMaxPrice;
        });
    }

    // 3. Sắp xếp
    switch (currentSort) {
        case 'name_asc': tempProducts.sort((a, b) => (a.productName || '').localeCompare(b.productName || '')); break;
        case 'name_desc': tempProducts.sort((a, b) => (b.productName || '').localeCompare(a.productName || '')); break;
        case 'price_asc': tempProducts.sort((a, b) => (a.finalPrice ?? Infinity) - (b.finalPrice ?? Infinity)); break;
        case 'price_desc': tempProducts.sort((a, b) => (b.finalPrice ?? -Infinity) - (a.finalPrice ?? -Infinity)); break;
        default: break;
    }
    return tempProducts;
  }, [allProducts, currentSort, currentBrand, currentMinPrice, currentMaxPrice, overallMinPrice, overallMaxPrice]);

  // --- Phân trang ---
  const totalPages = Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE);
  const validatedCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const startIndex = (validatedCurrentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  // --- Handler cập nhật URL cho Filter/Sort/Price ---
  const handleFilterChange = useCallback((newFilters) => {
    setSearchParams(prevParams => {
      const updatedParams = new URLSearchParams(prevParams.toString());
      if (searchTerm) {
          updatedParams.set('q', searchTerm);
      } else {
          updatedParams.delete('q');
      }
      Object.entries(newFilters).forEach(([key, value]) => {
         if (key === 'price_gte' && Number(value) === overallMinPrice) {
            updatedParams.delete(key);
        } else if (key === 'price_lte' && Number(value) === overallMaxPrice) {
             updatedParams.delete(key);
        } else if (value !== undefined && value !== null && value !== '') {
            updatedParams.set(key, String(value));
        } else {
            updatedParams.delete(key);
        }
      });
      updatedParams.set('page', '1');
      return updatedParams;
    }, { replace: true });
    setIsMobileFilterOpen(false);
  }, [setSearchParams, searchTerm, overallMinPrice, overallMaxPrice]);

  // --- Handler phân trang ---
   const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
             setSearchParams(prevParams => {
                 prevParams.set('page', newPage.toString());
                 return prevParams;
             }, { replace: true });
             window.scrollTo({ top: 0, behavior: 'smooth' });
        }
   }, [totalPages, setSearchParams]);

   // --- useEffect kiểm tra trang không hợp lệ ---
   useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            handlePageChange(totalPages);
        } else if (currentPage < 1 && filteredAndSortedProducts.length > 0) {
             handlePageChange(1);
        }
   }, [currentPage, totalPages, handlePageChange, filteredAndSortedProducts.length]);


  // --- Render ---
  const pageTitle = `Kết quả tìm kiếm cho "${searchTerm}"`;

  // Nội dung render khi chưa nhập từ khóa
  const renderPrompt = () => (
      <div className={styles.promptContainer}>
          <FiSearch size={50} style={{color: '#ccc', marginBottom: '15px'}}/>
          <h2>Tìm kiếm sản phẩm</h2>
          <p>Vui lòng nhập từ khóa vào ô tìm kiếm phía trên.</p>
          <Link to="/">
              <Button variant='secondary'>Quay về trang chủ</Button>
          </Link>
      </div>
  );

  return (
    <div className={styles.pageContainer}>
      {/* Chỉ hiển thị tiêu đề và breadcrumbs nếu có từ khóa tìm kiếm */}
      {searchTerm && (
        <>
          <h1 className={styles.pageTitle}><FiSearch /> {pageTitle}</h1>
          <div className={styles.breadcrumbs}>
             <Link to="/">Trang chủ</Link> <span>›</span>
             <span>Tìm kiếm</span>
             <span>› "{searchTerm}"</span>
          </div>
        </>
      )}

      {/* Chỉ hiển thị nút filter và nội dung nếu có từ khóa */}
      {searchTerm ? (
        <>
          <button className={styles.mobileFilterButton} onClick={() => setIsMobileFilterOpen(true)}>
              <FiFilter /> Lọc & Sắp xếp ({filteredAndSortedProducts.length})
          </button>

          <div className={styles.contentWrapper}>
              <div className={`${styles.filterPanelContainer} ${isMobileFilterOpen ? styles.mobileFilterOpen : ''}`}>
                 <FilterSortPanel
                    currentFilters={{ sort: currentSort, brand: currentBrand, price_gte: currentMinPrice, price_lte: currentMaxPrice }}
                    onFilterChange={handleFilterChange}
                    availableBrands={brands}
                    minPrice={overallMinPrice}
                    maxPrice={overallMaxPrice}
                 />
                 <button className={styles.closeMobileFilter} onClick={() => setIsMobileFilterOpen(false)}>
                     <FiX/> Đóng
                 </button>
              </div>
              {isMobileFilterOpen && <div className={styles.mobileFilterOverlay} onClick={() => setIsMobileFilterOpen(false)}></div>}

              <div className={styles.mainProductArea}>
                {isLoading ? ( <div className={styles.loadingContainer}><Spinner size="large" /></div> )
                 : error ? ( <p className={`${styles.error} ${styles.fetchError}`}>{error}</p> )
                 : filteredAndSortedProducts.length > 0 ? (
                    <>
                        <div className={styles.listHeader}>
                            <span>Tìm thấy {filteredAndSortedProducts.length} sản phẩm. Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredAndSortedProducts.length)}.</span>
                        </div>
                        <div className={styles.productListGrid}>
                            {currentProducts.map((product) => (
                            <ProductCard key={product.productId || product.id} product={product} />
                            ))}
                        </div>
                         {totalPages > 1 && ( <Pagination currentPage={validatedCurrentPage} totalPages={totalPages} onPageChange={handlePageChange}/> )}
                    </>
                ) : (
                    <p className={styles.noResults}>Không tìm thấy sản phẩm nào với từ khóa "{searchTerm}".</p>
                )}
              </div>
          </div>
        </>
      ) : (
        // Hiển thị thông báo yêu cầu nhập từ khóa nếu searchTerm rỗng
        renderPrompt()
      )}
    </div>
  );
};

export default SearchProductListPage;