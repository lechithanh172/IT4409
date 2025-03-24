import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Item from '../Item/Item';
import './ListItems.css';

function ListItems() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Gọi API để lấy danh sách sản phẩm
        axios
            .get('https://e-commerce-group9-2024-1.onrender.com/product/popular/Mobile') // Sửa URL API cho phù hợp với dữ liệu của bạn
            .then((res) => {
                setProducts(res.data); // Lưu sản phẩm vào state
            })
            .catch((err) => {
                console.error('Lỗi tải sản phẩm:', err);
            });
    }, []);

    return (
        <div className="block-products-filter">
            {/* Hiển thị tất cả sản phẩm */}
            {products.length > 0 ? (
                products.map((product) => (
                    <Item
                        key={product.id} // Sử dụng `product.id` làm key cho mỗi phần tử
                        id={product.id}
                        name={product.name}
                        image={product.images[0].replace(
                            /http:\/\/localhost:4000/g,
                            'https://e-commerce-group9-2024-1.onrender.com'
                        )}
                        new_price={product.new_price}
                        old_price={product.old_price}
                    />
                ))
            ) : (
                <p>Không có sản phẩm nào.</p> // Thông báo nếu không có sản phẩm
            )}
        </div>
    );
}

export default ListItems;
