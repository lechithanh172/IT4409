import React, { useEffect, useState } from "react";

import "./ListProduct.css";

function ListProduct() {
  const [allProducts, setAllProducts] = useState([]);

  // Hàm gọi API để lấy sản phẩm
  const fetchInfo = async () => {
    await fetch("https://e-commerce-group9-2024-1.onrender.com/product/popular/Mobile")
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data); // Lưu dữ liệu sản phẩm vào state
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", err);
      });
  };

  // Gọi hàm fetchInfo khi component được mount
  useEffect(() => {
    fetchInfo();
  }, []);

  // Hàm định dạng giá tiền thành định dạng VND
  const formatPrice = (price) => {
    let priceString = price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    return priceString.replace(/\s/g, ""); // Loại bỏ khoảng trắng trong tiền tệ
  };

  return (
    <div className="listproduct">
      <h1 className="title">All Products List</h1>
      <div className="listproduct-format-main">
        <p>Hình ảnh</p>
        <p>Tên sản phẩm</p>
        <p>Giá sản phẩm</p>
        <p>Giá khuyến mãi</p>
        <p>Category</p>
        <p>Thời gian</p>
        <p>Số lượng</p>
        <p>Đã bán</p>
      </div>
      
      <div className="listproduct-allproducts">
        <hr />
        {allProducts.map((product) => {
          return (
            <div key={product.id}>
              <div className="listproduct-format-main listproduct-format">
                {/* Hiển thị hình ảnh sản phẩm */}
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0].replace(/http:\/\/localhost:4000/g, 'https://e-commerce-group9-2024-1.onrender.com')}
                    alt={product.name}
                    className="listproduct-product-icon"
                  />
                ) : (
                  <img
                    src={product.image.replace(/http:\/\/localhost:4000/g, 'https://e-commerce-group9-2024-1.onrender.com')}
                    alt={product.name}
                    className="listproduct-product-icon"
                  />
                )}
                <p>{product.name}</p>
                <p>{formatPrice(product.old_price)}</p>
                <p>{formatPrice(product.new_price)}</p>
                <p>{product.category}</p>
                <p>{new Date(product.date).toLocaleDateString()}</p> {/* Định dạng ngày tháng */}
                <p>{product.total_quantity}</p>
                <p>{product.total_sold}</p>
              </div>
              <hr />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListProduct;
