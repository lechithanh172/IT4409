import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./NewCollections.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Item from "../Item/Item"; // Giả sử bạn đã có Item component

const data = [
  {
    "productId": 1,
    "productName": "iPhone 16e 128GB | Chính hãng VN/A",
    "description": "Máy mới 100% , chính hãng Apple Việt Nam.\nCellphoneS hiện là đại lý bán lẻ uỷ quyền iPhone chính hãng VN/A của Apple Việt Nam\niPhone 16e 128GB sử dụng iOS 18\nCáp Sạc USB-C (1m)\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    "price": 16990000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16e-128gb_1__1.png",
    "stockQuantity": 10,
    "category": "Smartphone",
    "brand": "Apple"
  },
  {
    "productId": 2,
    "productName": "iPhone 15 Pro Max 512GB | Chính hãng VN/A",
    "description": "Máy mới 100% , chính hãng Apple Việt Nam.\nCellphoneS hiện là đại lý bán lẻ uỷ quyền iPhone chính hãng VN/A của Apple Việt Nam\nHộp, Sách hướng dẫn, Cây lấy sim, Cáp Type C\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nXem thông tin kích hoạt bảo hành các sản phẩm Apple (tại đây)\nGiá sản phẩm đã bao gồm VAT",
    "price": 40990000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-512gb-titan-nau.jpg",
    "stockQuantity": 13,
    "category": "Smartphone",
    "brand": "Apple"
  },
  {
    "productId": 3,
    "productName": "Samsung Galaxy Z Flip6 12GB 256GB",
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nBảo hành 12 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    "price": 28990000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/f/l/fliip-6-den_4__1.png",
    "stockQuantity": 10,
    "category": "Smartphone",
    "brand": "Samsung"
  },
  {
    "productId": 4,
    "productName": "Samsung Galaxy S25 Ultra 12GB 256GB",
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nĐiện thoại Samsung Galaxy S25 Ultra 5G 12GB 256GB\nBảo hành 12 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    "price": 39990000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_5.png",
    "stockQuantity": 22,
    "category": "Smartphone",
    "brand": "Samsung"
  },
  {
    "productId": 5,
    "productName": "Xiaomi Redmi Note 14 6GB 128GB",
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nRedmi Note 14, Cáp USB Type C, Củ sạc 33W, Dụng cụ lấy SIM, Sách hướng dẫn,...\nBảo hành 18 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    "price": 4990000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-xiaomi-redmi-note-14_1__2.png",
    "stockQuantity": 34,
    "category": "Smartphone",
    "brand": "Xiaomi"
  },
  {
    "productId": 6,
    "productName": "Xiaomi 14 12GB 256GB",
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nMáy, sạc, Cáp USB Type-C, Dụng cụ lấy SIM, Ốp, Hướng dẫn sử dụng nhanh\nBảo hành 24 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    "price": 22990000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/x/i/xiaomi-14-pre-xanh-la_1.png",
    "stockQuantity": 36,
    "category": "Smartphone",
    "brand": "Xiaomi"
  },
  {
    "productId": 7,
    "productName": "TECNO SPARK 30 Pro 8GB 256GB Transformer",
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nMáy, Củ cáp, Cáp sạc, Ốp lưng\nBảo hành 13 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    "price": 5290000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2025-01-10_08-54-30.jpg",
    "stockQuantity": 10,
    "category": "Smartphone",
    "brand": "Tecno"
  },
  {
    "productId": 8,
    "productName": "Tecno Pova 6 8GB 256GB",
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nBảo hành 13 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    "price": 6490000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2024-07-25_11-39-16.jpg",
    "stockQuantity": 15,
    "category": "Smartphone",
    "brand": "Tecno"
  },
  {
    "productId": 9,
    "productName": "Apple MacBook Air M2 2024 8CPU 8GPU 16GB 256GB",
    "description": "Máy mới 100%, đầy đủ phụ kiện từ nhà sản xuất. Sản phẩm có mã SA/A (được Apple Việt Nam phân phối chính thức).\nMáy, Sách HDSD, Cáp sạc USB-C (2 m), Cốc sạc USB-C 30W\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nXem thông tin kích hoạt bảo hành các sản phẩm Apple (tại đây)\nGiá sản phẩm đã bao gồm VAT",
    "price": 24990000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_air_m2_2_1_1_7.png",
    "stockQuantity": 42,
    "category": "Laptop",
    "brand": "Apple"
  }
]


function formatPrice(price) {
  return price.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
  });
}

function NewCollections() {
  const [mobileProducts, setMobileProducts] = useState([]);
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const elementRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);

  useEffect(() => {
    // Gọi API để lấy sản phẩm Mobile
    // axios
    //   .get(`https://e-commerce-group9-2024-1.onrender.com/product/popular/Mobile`)
    //   .then((res) => setMobileProducts(res.data));
    setMobileProducts(data);
    const handleOffset = () => {
      const element = elementRef.current;
      let containerWidth;

      if (window.innerWidth > 1200) {
        setOffset(index * 230);
        setMaxIndex(mobileProducts.length - 5);
      } else if (window.innerWidth > 990) {
        setOffset(index * (width / 4 + 2.5));
        setMaxIndex(mobileProducts.length - 4);
      } else if (window.innerWidth > 717) {
        setOffset(index * (width / 3 + 3.33333));
        setMaxIndex(mobileProducts.length - 3);
      } else {
        setOffset(index * (width / 2 + 5));
        setMaxIndex(mobileProducts.length - 2);
      }

      if (element) {
        containerWidth = element.offsetWidth;
        setWidth(containerWidth);
      }
    };

    handleOffset();

    window.addEventListener("resize", handleOffset);

    return () => window.removeEventListener("resize", handleOffset);
  }, [index, width, mobileProducts.length]);

  useEffect(() => {
    if (index < -maxIndex) {
      if (window.innerWidth > 1200) {
        setIndex(
          mobileProducts.length > 5 ? -(mobileProducts.length - 5) : 0
        );
      } else if (window.innerWidth > 990) {
        setIndex(
          mobileProducts.length > 4 ? -(mobileProducts.length - 4) : 0
        );
      } else if (window.innerWidth > 717) {
        setIndex(
          mobileProducts.length > 3 ? -(mobileProducts.length - 3) : 0
        );
      } else {
        setIndex(
          mobileProducts.length > 2 ? -(mobileProducts.length - 2) : 0
        );
      }
    }
  }, [maxIndex, index, mobileProducts.length]);

  useEffect(() => {
    const handleAutoSlide = () => {
      if (index <= -maxIndex) {
        setIndex(0); // Reset về đầu
      } else {
        setIndex((prev) => prev - 1); // Chuyển sang slide tiếp theo
      }
    };

    const timer = setTimeout(handleAutoSlide, 3000); // Tự động chạy sau 3 giây

    return () => clearTimeout(timer); // Xóa timer khi component unmount hoặc index thay đổi
  }, [index, maxIndex]);

  return (
    <>
      {mobileProducts.length > 0 && (
        <div className="newcollections">
          <div className="product-list-title">
            <h2>SẢN PHẨM MỚI VỀ</h2>
          </div>
          <div className="product-list">
            <div className="product-list-swiper">
              <div className="swiper-container">
                <div
                  ref={elementRef}
                  className="swiper-wrapper"
                  style={{
                    transform: `translateX(${offset}px)`,
                    transitionDuration: "300ms",
                  }}
                >
                  {mobileProducts.map((product, index) => {
                    return (
                      <div key={index} className="swiper-slide">
                        <Item
                          id={product.productId}
                          name={product.productName}
                          image={product.imageUrl}
                          new_price={formatPrice(product.price)}
                          old_price={formatPrice(product.price)}
                        />
                      </div>
                    );
                  })}
                </div>
                <div
                  onClick={() => setIndex((prev) => prev + 1)}
                  className="swiper-button-prev"
                  style={index === 0 ? { display: "none" } : {}}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </div>
                <div
                  onClick={() => setIndex((prev) => prev - 1)}
                  className="swiper-button-next"
                  style={index <= -maxIndex ? { display: "none" } : {}}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NewCollections;
