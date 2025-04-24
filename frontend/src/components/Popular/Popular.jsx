import React, { useEffect, useRef, useState } from "react";
import "./Popular.css";
import ProductCard from "../ProductCard/ProductCard.jsx";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import apiService from "../../services/api.js"

const data = [
  {
    productId: 1,
    productName: "iPhone 16e 128GB | Chính hãng VN/A",
    description: "Máy mới 100% , chính hãng Apple Việt Nam.\nCellphoneS hiện là đại lý bán lẻ uỷ quyền iPhone chính hãng VN/A của Apple Việt Nam\niPhone 16e 128GB sử dụng iOS 18\nCáp Sạc USB-C (1m)\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    price: 16990000,
    imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16e-128gb_1__1.png",
    stockQuantity: 10,
    categoryId: 3,
    brandId: 1
  },
  {
    productId: 2,
    productName: "iPhone 15 Pro Max 512GB | Chính hãng VN/A",
    description: "Máy mới 100% , chính hãng Apple Việt Nam.\nCellphoneS hiện là đại lý bán lẻ uỷ quyền iPhone chính hãng VN/A của Apple Việt Nam\nHộp, Sách hướng dẫn, Cây lấy sim, Cáp Type C\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nXem thông tin kích hoạt bảo hành các sản phẩm Apple (tại đây)\nGiá sản phẩm đã bao gồm VAT",
    price: 40990000,
    imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-512gb-titan-nau.jpg",
    stockQuantity: 13,
    categoryId: 3,
    brandId: 1
  },
  {
    productId: 3,
    productName: "Samsung Galaxy Z Flip6 12GB 256GB",
    description: "Mới, đầy đủ phụ kiện từ nhà sản xuất\nBảo hành 12 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    price: 28990000,
    imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/f/l/fliip-6-den_4__1.png",
    stockQuantity: 10,
    categoryId: 3,
    brandId: 2
  },
  {
    productId: 4,
    productName: "Samsung Galaxy S25 Ultra 12GB 256GB",
    description: "Mới, đầy đủ phụ kiện từ nhà sản xuất\nĐiện thoại Samsung Galaxy S25 Ultra 5G 12GB 256GB\nBảo hành 12 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    price: 39990000,
    imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_5.png",
    stockQuantity: 22,
    categoryId: 3,
    brandId: 2
  },
  {
    productId: 5,
    productName: "Xiaomi Redmi Note 14 6GB 128GB",
    description: "Mới, đầy đủ phụ kiện từ nhà sản xuất\nRedmi Note 14, Cáp USB Type C, Củ sạc 33W, Dụng cụ lấy SIM, Sách hướng dẫn,...\nBảo hành 18 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    price: 4990000,
    imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-xiaomi-redmi-note-14_1__2.png",
    stockQuantity: 34,
    categoryId: 3,
    brandId: 9
  },
  {
    productId: 6,
    productName: "Xiaomi 14 12GB 256GB",
    description: "Mới, đầy đủ phụ kiện từ nhà sản xuất\nMáy, sạc, Cáp USB Type-C, Dụng cụ lấy SIM, Ốp, Hướng dẫn sử dụng nhanh\nBảo hành 24 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    price: 22990000,
    imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/x/i/xiaomi-14-pre-xanh-la_1.png",
    stockQuantity: 36,
    categoryId: 3,
    brandId: 9
  },
  {
    productId: 7,
    productName: "TECNO SPARK 30 Pro 8GB 256GB Transformer",
    description: "Mới, đầy đủ phụ kiện từ nhà sản xuất\nMáy, Củ cáp, Cáp sạc, Ốp lưng\nBảo hành 13 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    price: 5290000,
    imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2025-01-10_08-54-30.jpg",
    stockQuantity: 10,
    categoryId: 3,
    brandId: 10
  },
  {
    productId: 8,
    productName: "Tecno Pova 6 8GB 256GB",
    description: "Mới, đầy đủ phụ kiện từ nhà sản xuất\nBảo hành 13 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    price: 6490000,
    imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2024-07-25_11-39-16.jpg",
    stockQuantity: 15,
    categoryId: 3,
    brandId: 10
  },
  {
    productId: 9,
    productName: "Apple MacBook Air M2 2024 8CPU 8GPU 16GB 256GB",
    description: "Máy mới 100%, đầy đủ phụ kiện từ nhà sản xuất. Sản phẩm có mã SA/A (được Apple Việt Nam phân phối chính thức).\nMáy, Sách HDSD, Cáp sạc USB-C (2 m), Cốc sạc USB-C 30W\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nXem thông tin kích hoạt bảo hành các sản phẩm Apple (tại đây)\nGiá sản phẩm đã bao gồm VAT",
    price: 24990000,
    imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_air_m2_2_1_1_7.png",
    stockQuantity: 42,
    categoryId: 1,
    brandId: 1
  }
];

const Brand = [
  { "brandId": 1, "name": "Apple", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_59.png" },
  { "brandId": 2, "name": "Samsung", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_60.png" },
  { "brandId": 3, "name": "Dell", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Dell.png" },
  { "brandId": 4, "name": "HP", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/HP.png" },
  { "brandId": 5, "name": "Lenovo", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Lenovo.png" },
  { "brandId": 6, "name": "Asus", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Asus.png" },
  { "brandId": 7, "name": "MSI", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/MSI.png" },
  { "brandId": 8, "name": "Acer", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/acer.png" },
  { "brandId": 9, "name": "Xiaomi", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_61.png" },
  { "brandId": 10, "name": "Sony", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/b/r/brand-icon-sony_2.png" }
]

const Category = [
  { "categoryId": 1, "name": "Laptop", "description": "Portable personal computers" },
  { "categoryId": 2, "name": "Tablet", "description": "Touchscreen mobile devices" },
  { "categoryId": 3, "name": "Smartphone", "description": "Mobile phones" },
  { "categoryId": 4, "name": "Accessory", "description": "Computer accessories" },
  { "categoryId": 5, "name": "Monitor", "description": "Display devices" },
  { "categoryId": 6, "name": "Printer", "description": "Printing machines" },
  { "categoryId": 7, "name": "Router", "description": "Network routers" },
  { "categoryId": 8, "name": "Speaker", "description": "Audio output devices" },
  { "categoryId": 9, "name": "Camera", "description": "Photography and video" },
  { "categoryId": 10, "name": "Smartwatch", "description": "Wearable smart devices" }
]

const categoryMap = {
  Smartphone: 3,
  Laptop: 1,
  Tablet: 2,
  Accessory: 4,
  Monitor: 5,
  Printer: 6,
  Router: 7,
  Speaker: 8,
  Camera: 9,
  Smartwatch: 10,
};

function formatPrice(price) {
  return price.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
  });
}
function Popular({ category }) {
  const [popularProducts, setPopularProducts] = useState([]);
  const [title, setTitle] = useState("");
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const elementRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  // const [dataProduct, setDataProducts] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await apiService.getProductsByCategory(category);
        // console.log(response.data);
        
        const products = data; // Sử dụng dữ liệu mẫu nếu không có phản hồi từ API
        console.log(products);
        
        const categoryId = categoryMap[category];
        const filteredProducts = products.filter(
          (product) => product.categoryId === categoryId
        );
        setPopularProducts(filteredProducts);

        // setDataProducts(products);

        switch (categoryId) {
          case 1:
            setTitle("LAPTOP");
            break;
          case 2:
            setTitle("MÁY TÍNH BẢNG");
            break;
          case 3:
            setTitle("ĐIỆN THOẠI");
            break;
          case 4:
            setTitle("PHỤ KIỆN MÁY TÍNH");
            break;
          case 5:
            setTitle("MÀN HÌNH");
            break;
          case 6:
            setTitle("MÁY IN");
            break;
          case 7:
            setTitle("THIẾT BỊ MẠNG");
            break;
          case 8:
            setTitle("LOA ÂM THANH");
            break;
          case 9:
            setTitle("MÁY ẢNH & CAMERA");
            break;
          case 10:
            setTitle("ĐỒNG HỒ THÔNG MINH");
            break;
          default:
            setTitle("TẤT CẢ SẢN PHẨM");
            break;
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchData();
  }, [category]);


  useEffect(() => {
    const handleOffset = () => {
      const element = elementRef.current;
      let containerWidth;

      if (window.innerWidth > 1200) {
        setOffset(index * 230);
        setMaxIndex(popularProducts.length - 5);
      } else if (window.innerWidth > 990) {
        setOffset(index * (width / 4 + 2.5));
        setMaxIndex(popularProducts.length - 4);
      } else if (window.innerWidth > 717) {
        setOffset(index * (width / 3 + 3.33333));
        setMaxIndex(popularProducts.length - 3);
      } else {
        setOffset(index * (width / 2 + 5));
        setMaxIndex(popularProducts.length - 2);
      }

      if (element) {
        containerWidth = element.offsetWidth;
        setWidth(containerWidth);
      }
    };

    handleOffset();

    window.addEventListener("resize", handleOffset);

    return () => window.removeEventListener("resize", handleOffset);
  }, [index, width, popularProducts.length]);

  useEffect(() => {
    if (index < -maxIndex) {
      if (window.innerWidth > 1200) {
        setIndex(
          popularProducts.length > 5 ? -(popularProducts.length - 5) : 0
        );
      } else if (window.innerWidth > 990) {
        setIndex(
          popularProducts.length > 4 ? -(popularProducts.length - 4) : 0
        );
      } else if (window.innerWidth > 717) {
        setIndex(
          popularProducts.length > 3 ? -(popularProducts.length - 3) : 0
        );
      } else {
        setIndex(
          popularProducts.length > 2 ? -(popularProducts.length - 2) : 0
        );
      }
    }
  }, [maxIndex, index]);

  return (
    <>
      {popularProducts.length > 0 && (
        <div className="popular">
          <div className="product-list-title">
            <Link to={`/product/category=${category}`} className="title">
              <h2>{title} NỔI BẬT</h2>
            </Link>
          </div>
          <div className="product-list">
            <div className="product-list-swiper">
              <div className="swiper-container">
                <div
                  ref={elementRef}
                  className="swiper-wrapper-popular"
                  style={{
                    transform: `translateX(${offset}px)`,
                    transitionDuration: "300ms",
                  }}
                >
                  {popularProducts.map((product, index) => {
                    return (
                      <div key={product.productId} className="swiper-slproductIde">
                        <ProductCard
                          key={product.productId}
                          product={product}
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

export default Popular;