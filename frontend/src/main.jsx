import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';
import { ProductProvider } from './contexts/ProductContext';
import { AuthProvider } from './contexts/AuthContext'; 
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* AuthProvider bên trong BrowserRouter */}
        <ProductProvider>
            <App /> {/* App được bọc bởi tất cả các Provider */}
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);