import React, { useEffect, useRef, useState } from "react";
import styles from "./ListItem.module.css";
import ProductCard from "../../Components/ProductCard/ProductCard.jsx"; // Assuming path is correct
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import apiService from "../../services/api.js"; // Import your api service

// Removed the hardcoded 'data' array

function ListItem({ category }) {
  const [popularProducts, setPopularProducts] = useState([]); // State to hold products from API
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state
  const [index, setIndex] = useState(0); // Your original state
  const [offset, setOffset] = useState(0); // Your original state
  const [width, setWidth] = useState(0); // Your original state
  const [maxIndex, setMaxIndex] = useState(0); // Your original state, will be calculated dynamically
  const elementRef = useRef(null); // Your original ref

  // Effect to fetch data and set title
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setPopularProducts([]); // Clear previous products
      setIndex(0); // Reset index when category changes
      setOffset(0); // Reset offset

      if (!category) {
        setError("Category prop is missing.");
        setTitle("LỖI");
        setLoading(false);
        return;
      }

      // --- Set Title based on category (same logic as before) ---
      let displayTitle = category.toUpperCase() + " NỔI BẬT";
      switch (category) {
         case "Laptop": displayTitle = "LAPTOP NỔI BẬT"; break;
         case "Tablet": displayTitle = "MÁY TÍNH BẢNG NỔI BẬT"; break;
         case "Smartphone": displayTitle = "ĐIỆN THOẠI NỔI BẬT"; break;
         case "Accessory": displayTitle = "PHỤ KIỆN MÁY TÍNH NỔI BẬT"; break;
         case "Monitor": displayTitle = "MÀN HÌNH NỔI BẬT"; break;
         case "Printer": displayTitle = "MÁY IN NỔI BẬT"; break;
         case "Router": displayTitle = "THIẾT BỊ MẠNG NỔI BẬT"; break;
         case "Speaker": displayTitle = "LOA ÂM THANH NỔI BẬT"; break;
         case "Camera": displayTitle = "MÁY ẢNH & CAMERA NỔI BẬT"; break;
         case "Smartwatch": displayTitle = "ĐỒNG HỒ THÔNG MINH NỔI BẬT"; break;
         default: break;
      }
      setTitle(displayTitle);
      // --- End Title Setting ---

      // --- API Call ---
      try {
        const response = await apiService.getProductsByCategory(category);
        if (response && Array.isArray(response.data)) {
           setPopularProducts(response.data);
        } else if (response && Array.isArray(response)) {
           setPopularProducts(response);
        } else {
           console.warn(`No products found or unexpected data format for category: ${category}`, response);
           setPopularProducts([]);
        }
      } catch (error) {
        console.error(`Error fetching data for category ${category}:`, error);
        setError(`Could not load products. ${error.message}`);
        setPopularProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  // Effect for slider calculations - **Using your original logic structure**
  useEffect(() => {
    const handleOffset = () => {
      const element = elementRef.current;
      let containerWidth;
      let calculatedMaxIndex = 0; // Initialize calculated max index for this scope

      // --- Your original offset and maxIndex calculation logic ---
      if (window.innerWidth > 1200) {
        setOffset(index * 305); // Your formula
        // Calculate maxIndex based on API data length and 4 visible items
        calculatedMaxIndex = popularProducts.length > 4 ? popularProducts.length - 4 : 0;
      } else if (window.innerWidth > 990) {
        setOffset(index * (width / 3)); // Your formula
         // Calculate maxIndex based on API data length and 4 visible items
        calculatedMaxIndex = popularProducts.length > 4 ? popularProducts.length - 4 : 0;
      } else if (window.innerWidth > 717) {
        setOffset(index * (width / 3 + 3.33333)); // Your formula
         // Calculate maxIndex based on API data length and 3 visible items
        calculatedMaxIndex = popularProducts.length > 3 ? popularProducts.length - 3 : 0;
      } else {
        setOffset(index * (width / 2 + 5)); // Your formula
         // Calculate maxIndex based on API data length and 2 visible items
        calculatedMaxIndex = popularProducts.length > 2 ? popularProducts.length - 2 : 0;
      }
      // --- End of your original logic block ---

      setMaxIndex(calculatedMaxIndex); // Update the state with the dynamically calculated maxIndex

      if (element) {
        containerWidth = element.offsetWidth;
        setWidth(containerWidth); // Keep updating width as before
      }
    };

    // Run calculation only if products have loaded to avoid issues with popularProducts.length
    if (!loading) {
       handleOffset();
    }

    window.addEventListener("resize", handleOffset);
    return () => window.removeEventListener("resize", handleOffset);
    // Depend on index, width, popularProducts.length, and loading status
    // Using popularProducts.length ensures recalculation when data changes
  }, [index, width, popularProducts.length, loading]); // Keep original dependencies + popularProducts.length + loading

  // Effect for index correction - **Using your exact original logic**
  useEffect(() => {
    // Your original index correction logic:
    if (index < -maxIndex && index !== 0) {
      setIndex(0);
    }
    // Add a check to prevent index from going positive (based on your original prev/next handlers)
    if (index > 0) {
        setIndex(0);
    }
  }, [maxIndex, index]); // Keep original dependencies

  // --- Conditional Rendering for Loading/Error ---
  if (loading) {
    return (
      <div className={styles.popular}>
        <div className={styles.popularTitle}>
          <Link to={`/product/category=${category}`} className={styles.title}>
            <h2>{title || `${category.toUpperCase()} NỔI BẬT`}</h2>
          </Link>
        </div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className={styles.popular}>
        <div className={styles.popularTitle}>
          <Link to={`/product/category=${category}`} className={styles.title}>
             <h2>{title}</h2>
          </Link>
        </div>
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  // --- Original Render Logic (when products are available) ---
  return (
    <>
      {/* Render container only if there are products */}
      {popularProducts.length > 0 && (
        <div className={styles.popular}>
          <div className={styles.popularTitle}>
            <Link to={`/product/category=${category}`} className={styles.title}>
              <h2>{title}</h2>
            </Link>
          </div>
          <div className={styles.productList}>
            <div className={styles.productListSwipper}>
              <div className={styles.swiperContainer}>
                <div
                  className={styles.productList}
                  ref={elementRef}
                  style={{
                    transform: `translateX(${offset}px)`, // Uses offset calculated by your logic
                    transitionDuration: "300ms", // Your original transition
                    // Ensure display: flex or similar is handled by your CSS for styles.productList
                  }}
                >
                  {/* Map over fetched popularProducts */}
                  {popularProducts.map((product) => (
                    <div className={styles.listItem} key={product.productId}>
                      <ProductCard
                        product={product} // Pass the product object from API
                      />
                    </div>
                  ))}
                </div>
                {/* Prev Button - Your original logic/style/handler */}
                <div
                  onClick={() => setIndex((prev) => prev + 1)} // Your original handler
                  className={styles.swiperButtonPrev}
                  style={index === 0 ? { display: "none" } : {}} // Your original style condition
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </div>
                {/* Next Button - Your original logic/style/handler */}
                <div
                  onClick={() => setIndex((prev) => prev - 1)} // Your original handler
                  className={styles.swiperButtonNext}
                  // Your original style condition using dynamically calculated maxIndex
                  style={maxIndex === 0 || index <= -maxIndex ? { display: "none" } : {}}
                  // Added maxIndex === 0 check to hide if no scrolling is possible
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Render message if not loading, no error, but no products */}
      {!loading && !error && popularProducts.length === 0 && (
         <div className={styles.popular}>
            <div className={styles.popularTitle}>
              <Link to={`/product/category=${category}`} className={styles.title}>
                 <h2>{title}</h2>
              </Link>
            </div>
            <p>Chưa có sản phẩm nổi bật nào cho danh mục này.</p>
         </div>
      )}
    </>
  );
}

export default ListItem;