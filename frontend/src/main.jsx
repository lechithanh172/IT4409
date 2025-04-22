import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProductProvider> 
        <CartProvider> 
          <App />
        </CartProvider>
      </ProductProvider>
    </BrowserRouter>
  </React.StrictMode>
);