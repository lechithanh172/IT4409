import React, { createContext, useState, useEffect, useContext } from 'react';



const mockProducts = [
  { id: 1, name: 'iPhone 15 Pro', price: 1000, category: 'Smartphone', image: '/path/to/iphone.jpg' },
  { id: 2, name: 'MacBook Air M3', price: 1200, category: 'Laptop', image: '/path/to/macbook.jpg' },
  { id: 3, name: 'Samsung Galaxy S24', price: 900, category: 'Smartphone', image: '/path/to/samsung.jpg' },

];



const ProductContext = createContext();


export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {





        await new Promise(resolve => setTimeout(resolve, 500));
        setProducts(mockProducts);


      } catch (err) {
        setError('Failed to fetch products.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);


  const getProductById = (id) => {

    const productId = parseInt(id, 10);
    return products.find(product => product.id === productId);
  }


  const value = {
    products,
    loading,
    error,
    getProductById,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};


export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};