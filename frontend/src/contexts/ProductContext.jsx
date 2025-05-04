import React, { createContext, useState, useEffect, useContext } from 'react';
// import { fetchProducts } from '../services/productAPI'; // Giả sử có hàm fetch

// Dữ liệu giả lập ban đầu
const mockProducts = [
  { id: 1, name: 'iPhone 15 Pro', price: 1000, category: 'Smartphone', image: '/path/to/iphone.jpg' },
  { id: 2, name: 'MacBook Air M3', price: 1200, category: 'Laptop', image: '/path/to/macbook.jpg' },
  { id: 3, name: 'Samsung Galaxy S24', price: 900, category: 'Smartphone', image: '/path/to/samsung.jpg' },
  // Thêm sản phẩm khác...
];


// 1. Tạo Context
const ProductContext = createContext();

// 2. Tạo Provider Component
export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching data
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Thay thế bằng lời gọi API thật
        // const data = await fetchProducts();
        // setProducts(data);

        // --- Sử dụng dữ liệu giả lập ---
        await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập độ trễ mạng
        setProducts(mockProducts);
        // --- Kết thúc dữ liệu giả lập ---

      } catch (err) {
        setError('Failed to fetch products.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []); // Chạy 1 lần khi component mount

  // Hàm lấy sản phẩm theo ID (ví dụ)
  const getProductById = (id) => {
    // Chuyển id sang number nếu cần
    const productId = parseInt(id, 10);
    return products.find(product => product.id === productId);
  }


  const value = {
    products,
    loading,
    error,
    getProductById, // Cung cấp hàm này qua context
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

// 3. Tạo Custom Hook để sử dụng Context (tiện lợi hơn)
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};