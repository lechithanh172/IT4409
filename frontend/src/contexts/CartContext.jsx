import React, { createContext, useContext, useReducer, useEffect } from 'react';

// 1. Tạo Context
const CartContext = createContext();

// 2. Định nghĩa Actions cho Reducer (tùy chọn, nhưng tốt cho logic phức tạp)
const CartActionTypes = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART', // Để load từ localStorage chẳng hạn
};

// 3. Tạo Reducer function (quản lý logic state giỏ hàng)
const cartReducer = (state, action) => {
  switch (action.type) {
    case CartActionTypes.LOAD_CART:
        return action.payload; // State được load từ bên ngoài (localStorage)
    case CartActionTypes.ADD_ITEM: {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      let updatedItems;
      if (existingItemIndex > -1) {
        // Sản phẩm đã có, tăng số lượng
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + (action.payload.quantity || 1),
        };
      } else {
        // Sản phẩm mới, thêm vào giỏ
        updatedItems = [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }];
      }
       const newState = { ...state, items: updatedItems };
       localStorage.setItem('cart', JSON.stringify(newState)); // Lưu vào localStorage
       return newState;
    }
    case CartActionTypes.REMOVE_ITEM: {
      const updatedItems = state.items.filter((item) => item.id !== action.payload.id);
      const newState = { ...state, items: updatedItems };
      localStorage.setItem('cart', JSON.stringify(newState));
      return newState;
    }
    case CartActionTypes.UPDATE_QUANTITY: {
       const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(1, action.payload.quantity) } // Đảm bảo số lượng >= 1
          : item
      );
       const newState = { ...state, items: updatedItems };
       localStorage.setItem('cart', JSON.stringify(newState));
       return newState;
    }
    case CartActionTypes.CLEAR_CART: {
      const newState = { ...state, items: [] };
      localStorage.removeItem('cart'); // Xóa khỏi localStorage
      return newState;
    }
    default:
      return state;
  }
};

// 4. Tạo Provider Component
export const CartProvider = ({ children }) => {
  const initialCartState = { items: [] };

  // Sử dụng useReducer thay vì useState cho logic phức tạp hơn
  const [cartState, dispatch] = useReducer(cartReducer, initialCartState);

   // Load giỏ hàng từ localStorage khi component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
         // Dispatch action để cập nhật state từ localStorage
         dispatch({ type: CartActionTypes.LOAD_CART, payload: parsedCart });
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        localStorage.removeItem('cart'); // Xóa nếu dữ liệu bị lỗi
      }
    }
  }, []); // Chạy 1 lần


  // Helper functions để dispatch actions (dễ sử dụng hơn)
  const addItemToCart = (product, quantity = 1) => {
    dispatch({ type: CartActionTypes.ADD_ITEM, payload: { ...product, quantity } });
  };

  const removeItemFromCart = (productId) => {
    dispatch({ type: CartActionTypes.REMOVE_ITEM, payload: { id: productId } });
  };

  const updateItemQuantity = (productId, quantity) => {
    dispatch({ type: CartActionTypes.UPDATE_QUANTITY, payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: CartActionTypes.CLEAR_CART });
  };

  // Tính toán tổng số lượng và tổng tiền
  const cartItemCount = cartState.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);


  const value = {
    cartItems: cartState.items,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    clearCart,
    cartItemCount,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 5. Tạo Custom Hook để sử dụng Context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};