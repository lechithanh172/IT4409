import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import axios from 'axios';
import Item from '../Item/Item';
import './ListItems.css';

const data = [
  {
    "productId": 1,
    "productName": "iPhone 16e 128GB | Chính hãng VN/A",
    "description": "Máy mới 100% , chính hãng Apple Việt Nam.\nCellphoneS hiện là đại lý bán lẻ uỷ quyền iPhone chính hãng VN/A của Apple Việt Nam\niPhone 16e 128GB sử dụng iOS 18\nCáp Sạc USB-C (1m)\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    "price": 16990000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16e-128gb_1__1.png",
    "stockQuantity": 10,
    "categoryId": 1,
    "brandId": 1
  },
  {
    "productId": 2,
    "productName": "iPhone 15 Pro Max 512GB | Chính hãng VN/A",
    "description": "Máy mới 100% , chính hãng Apple Việt Nam.\nCellphoneS hiện là đại lý bán lẻ uỷ quyền iPhone chính hãng VN/A của Apple Việt Nam\nHộp, Sách hướng dẫn, Cây lấy sim, Cáp Type C\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nXem thông tin kích hoạt bảo hành các sản phẩm Apple (tại đây)\nGiá sản phẩm đã bao gồm VAT",
    "price": 40990000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-512gb-titan-nau.jpg",
    "stockQuantity": 13,
    "categoryId": 1,
    "brandId": 1
  },
  {
    "productId": 3,
    "productName": "Samsung Galaxy Z Flip6 12GB 256GB",
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nBảo hành 12 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    "price": 28990000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/f/l/fliip-6-den_4__1.png",
    "stockQuantity": 10,
    "categoryId": 1,
    "brandId": 2
  },
  {
    "productId": 4,
    "productName": "Samsung Galaxy S25 Ultra 12GB 256GB",
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nĐiện thoại Samsung Galaxy S25 Ultra 5G 12GB 256GB\nBảo hành 12 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    "price": 39990000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_5.png",
    "stockQuantity": 22,
    "categoryId": 1,
    "brandId": 2
  },
  {
    "productId": 5,
    "productName": "Xiaomi Redmi Note 14 6GB 128GB",
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nRedmi Note 14, Cáp USB Type C, Củ sạc 33W, Dụng cụ lấy SIM, Sách hướng dẫn,...\nBảo hành 18 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    "price": 4990000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-xiaomi-redmi-note-14_1__2.png",
    "stockQuantity": 34,
    "categoryId": 1,
    "brandId": 10
  },
  {
    "productId": 6,
    "productName": "Xiaomi 14 12GB 256GB",
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nMáy, sạc, Cáp USB Type-C, Dụng cụ lấy SIM, Ốp, Hướng dẫn sử dụng nhanh\nBảo hành 24 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    "price": 22990000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/x/i/xiaomi-14-pre-xanh-la_1.png",
    "stockQuantity": 36,
    "categoryId": 1,
    "brandId": 10
  },
  {
    "productId": 7,
    "productName": "TECNO SPARK 30 Pro 8GB 256GB Transformer",
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nMáy, Củ cáp, Cáp sạc, Ốp lưng\nBảo hành 13 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    "price": 5290000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2025-01-10_08-54-30.jpg",
    "stockQuantity": 10,
    "categoryId": 1,
    "brandId": 6
  },
  {
    "productId": 8,
    "productName": "Tecno Pova 6 8GB 256GB",
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nBảo hành 13 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
    "price": 6490000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2024-07-25_11-39-16.jpg",
    "stockQuantity": 15,
    "categoryId": 1,
    "brandId": 6
  },
  {
    "productId": 9,
    "productName": "Apple MacBook Air M2 2024 8CPU 8GPU 16GB 256GB",
    "description": "Máy mới 100%, đầy đủ phụ kiện từ nhà sản xuất. Sản phẩm có mã SA/A (được Apple Việt Nam phân phối chính thức).\nMáy, Sách HDSD, Cáp sạc USB-C (2 m), Cốc sạc USB-C 30W\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nXem thông tin kích hoạt bảo hành các sản phẩm Apple (tại đây)\nGiá sản phẩm đã bao gồm VAT",
    "price": 24990000,
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_air_m2_2_1_1_7.png",
    "stockQuantity": 42,
    "categoryId": 2,
    "brandId": 1
  }
]

function formatPrice(price) {
  return price.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
  });
}

function ListItems() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Gọi API để lấy danh sách sản phẩm
        // axios
        //     .get('https://e-commerce-group9-2024-1.onrender.com/product/popular/Mobile') // Sửa URL API cho phù hợp với dữ liệu của bạn
        //     .then((res) => {
        //         setProducts(res.data); // Lưu sản phẩm vào state
        //     })
        //     .catch((err) => {
        //         console.error('Lỗi tải sản phẩm:', err);
        //     });
        setProducts(data)
    }, []);

    return (
        <div className="block-products-filter">
            <div className="all-product-list">
              <h2>TẤT CẢ SẢN PHẨM</h2>
          </div>
            {products.length > 0 ? (
                products.map((product) => (
                    <Item
                        key={product.productId} // Sử dụng `product.id` làm key cho mỗi phần tử
                        id={product.productId}
                        name={product.productName}
                        image={product.imageUrl}
                        new_price={formatPrice(product.price)}
                        old_price={formatPrice(product.price)}
                    />
                ))
            ) : (
                <p>Không có sản phẩm nào.</p> // Thông báo nếu không có sản phẩm
            )}
        </div>
    );
}

export default ListItems;