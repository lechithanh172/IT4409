import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiService from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import Spinner from '../../components/Spinner/Spinner';
import FilterSortPanel from '../../components/FilterSortPanel/FilterSortPanel';
import Pagination from '../../components/Pagination/Pagination';
import styles from './ProductListPage.module.css';
import { FiFilter, FiChevronRight, FiX } from 'react-icons/fi';
import Button from '../../components/Button/Button';

const PRODUCTS_PER_PAGE = 12; // Số sản phẩm trên mỗi trang

const ProductListPage = () => {
  // Hooks
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [allProducts, setAllProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [overallMinPrice, setOverallMinPrice] = useState(0);
  const [overallMaxPrice, setOverallMaxPrice] = useState(100000000);

  // Đọc tham số từ URL
  const category = searchParams.get('category') || '';
  const searchTerm = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSort = searchParams.get('sort') || '';
  const currentBrand = searchParams.get('brand') || ''; // Đọc brand từ URL
  const currentMinPrice = searchParams.get('price_gte') || overallMinPrice.toString();
  const currentMaxPrice = searchParams.get('price_lte') || overallMaxPrice.toString();

  // useEffect: Fetch dữ liệu sản phẩm và brands khi category, searchTerm, hoặc currentBrand thay đổi
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setAllProducts([]);
      // Chỉ fetch brand nếu chưa có
      if (brands.length === 0) setBrands([]);

      try {
        console.log(`[ProductListPage] useEffect trigger: category=${category}, searchTerm=${searchTerm}, brand=${currentBrand}`);

        let productPromise;
        // Ưu tiên tìm kiếm trước
        if (searchTerm) {
          console.log(`[ProductListPage] Fetching search results for: ${searchTerm}`);
          productPromise = apiService.searchProducts(searchTerm);
        }
        // Tiếp theo, kiểm tra category trên URL
        else if (category) {
          console.log(`[ProductListPage] Fetching products for category: ${category}`);
          productPromise = apiService.getProductsByCategory(category);
        }
        // *** KHÔNG CÓ category và searchTerm: Sẽ gọi getAllProducts ***
        else {
          console.log("[ProductListPage] Fetching all products (no category/search)...");
          productPromise = apiService.getAllProducts();
        }

        // Fetch brands (chỉ fetch nếu chưa có dữ liệu brands)
        const brandPromise = brands.length === 0 ? apiService.getAllBrands() : Promise.resolve({ data: brands });

        // Gọi API song song
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
          }
        } else {
          setAllProducts([]);
          if (productRes.status === 'rejected') setError(productRes.reason?.message || "Lỗi tải sản phẩm.");
        }

         // Xử lý brands
         if (brandRes.status === 'fulfilled' && brandRes.value?.data && Array.isArray(brandRes.value.data) && brands.length === 0) {
            setBrands([...brandRes.value.data].sort((a, b) => (a.brandName || '').localeCompare(b.brandName || '')));
         } else if (brandRes.status === 'rejected' && brands.length === 0) {
             console.error("Lỗi fetch Brands:", brandRes.reason);
         }

      } catch {
        setError("Lỗi hệ thống khi tải dữ liệu.");
        setAllProducts([]); // Đảm bảo reset state khi lỗi
        setBrands([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, searchTerm]); // Chỉ fetch lại product khi category/search thay đổi


  // --- Lọc và Sắp xếp phía Client ---
  const filteredAndSortedProducts = useMemo(() => {
    let tempProducts = [...allProducts];
    const numMinPrice = parseInt(currentMinPrice, 10);
    const numMaxPrice = parseInt(currentMaxPrice, 10);

    // 1. Lọc theo Brand (CHỈ LỌC KHI currentBrand có giá trị)
    if (currentBrand) {
      console.log(`[ProductListPage] Filtering by brand: ${currentBrand}`);
      tempProducts = tempProducts.filter(p => (p.brandName || '').toLowerCase() === currentBrand.toLowerCase());
    }

    // 2. Lọc theo Giá (chỉ lọc nếu giá trị khác min/max tổng thể)
    const isPriceFilterActive = !isNaN(numMinPrice) && !isNaN(numMaxPrice) && (numMinPrice > overallMinPrice || numMaxPrice < overallMaxPrice);
    if (isPriceFilterActive) {
      console.log(`[ProductListPage] Filtering by price: >= ${numMinPrice} AND <= ${numMaxPrice}`);
        tempProducts = tempProducts.filter(p => {
             const priceToFilter = p.finalPrice; // Dùng giá đại diện đã tính
             return priceToFilter !== null && priceToFilter >= numMinPrice && priceToFilter <= numMaxPrice;
        });
    }

    // 3. Sắp xếp
    console.log(`[ProductListPage] Sorting by: ${currentSort || 'default'}`);
    switch (currentSort) {
        case 'name_asc': tempProducts.sort((a, b) => (a.productName || '').localeCompare(b.productName || '')); break;
        case 'name_desc': tempProducts.sort((a, b) => (b.productName || '').localeCompare(a.productName || '')); break;
        case 'price_asc': tempProducts.sort((a, b) => (a.finalPrice ?? Infinity) - (b.finalPrice ?? Infinity)); break;
        case 'price_desc': tempProducts.sort((a, b) => (b.finalPrice ?? -Infinity) - (a.finalPrice ?? -Infinity)); break;
        default: break; // Giữ nguyên thứ tự fetch
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
      Object.entries(newFilters).forEach(([key, value]) => {
         // Xóa param giá nếu nó trùng với min/max tổng thể
         if (key === 'price_gte' && Number(value) === overallMinPrice) {
            updatedParams.delete(key);
        } else if (key === 'price_lte' && Number(value) === overallMaxPrice) {
             updatedParams.delete(key);
        }
        // Xử lý các filter khác
        else if (value !== undefined && value !== null && value !== '') {
            updatedParams.set(key, String(value));
        } else {
            updatedParams.delete(key);
        }
      });
      updatedParams.set('page', '1'); // Reset về trang 1
      return updatedParams;
    }, { replace: true });
    setIsMobileFilterOpen(false);
  }, [setSearchParams, overallMinPrice, overallMaxPrice]); // Thêm dependency

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
        }
        // Không cần kiểm tra < 1 vì validatedCurrentPage đã xử lý
   }, [currentPage, totalPages, handlePageChange]);


  // --- Render ---
  const pageTitle = searchTerm ? `Tìm kiếm: "${searchTerm}"` : (category ? `${category}` : "Tất Cả Sản Phẩm");

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>{pageTitle}</h1>
      <div className={styles.breadcrumbs}>
         <Link to="/">Trang chủ</Link> <span>›</span>
         <Link to="/products">Sản phẩm</Link>
         {category && <span>› {category}</span>}
         {searchTerm && <span>› Tìm kiếm</span>}
      </div>

      {/* Nút mở filter trên mobile */}
      <button className={styles.mobileFilterButton} onClick={() => setIsMobileFilterOpen(true)}>
          <FiFilter /> Lọc & Sắp xếp ({filteredAndSortedProducts.length})
      </button>

      {/* Container chính: Filter Panel và Product List */}
      <div className={styles.contentWrapper}>
          {/* Filter Panel Container */}
          <div className={`${styles.filterPanelContainer} ${isMobileFilterOpen ? styles.mobileFilterOpen : ''}`}>
          <button className={styles.closeMobileFilter} onClick={() => setIsMobileFilterOpen(false)}>
                        <FiX/>
                        {/* <span>Đóng</span> Bỏ text nếu chỉ cần icon */}
                    </button>
             <FilterSortPanel
                currentFilters={{
                    sort: currentSort,
                    brand: currentBrand,
                    price_gte: currentMinPrice,
                    price_lte: currentMaxPrice
                }}
                onFilterChange={handleFilterChange}
                availableBrands={brands} // Truyền brands đã fetch
                minPrice={overallMinPrice} // Truyền min/max đã tính
                maxPrice={overallMaxPrice}
             />
          </div>
          {isMobileFilterOpen && <div className={styles.mobileFilterOverlay} onClick={() => setIsMobileFilterOpen(false)}></div>}

          {/* Main Content */}
          <div className={styles.mainProductArea}>
            {/* Hiển thị Loading */}
            {isLoading ? (
                <div className={styles.loadingContainer}><Spinner size="large" /></div>
            ) : error ? ( // Hiển thị Lỗi
                <p className={`${styles.error} ${styles.fetchError}`}>{error}</p>
            ) : filteredAndSortedProducts.length > 0 ? ( // Hiển thị sản phẩm
                <>
                    <div className={styles.listHeader}>
                        <span>Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredAndSortedProducts.length)} trên tổng số {filteredAndSortedProducts.length} sản phẩm</span>
                    </div>
                    <div className={styles.productListGrid}>
                        {currentProducts.map((product) => (
                        <ProductCard key={product.productId || product.id} product={product} />
                        ))}
                    </div>
                    {/* Phân trang chỉ hiển thị khi có nhiều hơn 1 trang */}
                     {totalPages > 1 && (
                        <Pagination
                            currentPage={validatedCurrentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                     )}
                </>
            ) : ( // Hiển thị khi không có kết quả
                <p className={styles.noResults}>
                    Không tìm thấy sản phẩm nào phù hợp.
                </p>
            )}
          </div>
      </div>
    </div>
  );
};

export default ProductListPage;