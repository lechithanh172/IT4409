import React, { useState, useMemo } from 'react'; // Thêm useState, useMemo
import { Link, useNavigate } from 'react-router-dom';
// Bỏ: import { useCart } from '../../contexts/CartContext';
import CartItem from '../../components/CartItem/CartItem';
import Button from '../../components/Button/Button';
import styles from './CartPage.module.css';
import { FaShoppingCart, FaTrash } from 'react-icons/fa';

// --- DỮ LIỆU MẪU ---
const initialCartItems = [
  {
    productId: 3,
    variantId: 109,
    uniqueId: '3-109', // Tạo key duy nhất
    name: 'Dell XPS 13 Siêu Mỏng Nhẹ',
    variantName: 'Bạc Ánh Kim (Silver)',
    price: 24000000, // Giả sử giá đã tính discount
    image: 'https://via.placeholder.com/150/E3E4E6/8A8A8D?text=XPS+Silver',
    quantity: 1,
    is_selected: true,
    stockQuantity: 10 // Thêm tồn kho để test disable nút +
  },
  {
    productId: 1,
    variantId: 101, // Giả sử iPhone
    uniqueId: '1-101',
    name: 'iPhone 15 Pro 256GB',
    variantName: 'Titan Tự Nhiên',
    price: 28990000,
    image: 'https://via.placeholder.com/150/BDB6AD/444444?text=iPhone+15+Pro',
    quantity: 2,
    is_selected: true,
    stockQuantity: 5
  },
   {
    productId: 3, // Sản phẩm giống cái đầu nhưng khác màu
    variantId: 111,
    uniqueId: '3-111',
    name: 'Dell XPS 13 Siêu Mỏng Nhẹ',
    variantName: 'Vàng Hồng (Rose Gold)',
    price: 24500000,
    image: 'https://via.placeholder.com/150/E4CFC0/6A4C4C?text=XPS+RoseGold',
    quantity: 1,
    is_selected: false, // Mặc định không chọn
    stockQuantity: 8
  },
   {
    productId: 2, // Macbook
    variantId: 201,
    uniqueId: '2-201',
    name: 'MacBook Air 13 inch M3',
    variantName: 'Xám (Space Gray)',
    price: 27990000,
    image: 'https://via.placeholder.com/150/8A8A8D/FFFFFF?text=MBA+M3+Gray',
    quantity: 1,
    is_selected: true,
    stockQuantity: 15
  },
];
// --- KẾT THÚC DỮ LIỆU MẪU ---

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const CartPage = () => {
  // State cục bộ thay thế CartContext
  const [cartItems, setCartItems] = useState(initialCartItems);
  const navigate = useNavigate();

  // --- Các hàm xử lý (Mock thay thế context) ---
  const handleRemoveItem = (itemKey) => {
    setCartItems(prevItems => prevItems.filter(item => (item.uniqueId || `${item.productId}-${item.variantId}`) !== itemKey));
    console.log(`Đã xóa item với key: ${itemKey}`);
  };

  const handleQuantityChange = (itemKey, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        (item.uniqueId || `${item.productId}-${item.variantId}`) === itemKey
          ? { ...item, quantity: Math.max(1, newQuantity) } // Đảm bảo số lượng >= 1
          : item
      )
    );
    console.log(`Đã cập nhật số lượng cho key ${itemKey} thành: ${newQuantity}`);
  };

  const handleToggleSelect = (itemKey) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        (item.uniqueId || `${item.productId}-${item.variantId}`) === itemKey
          ? { ...item, is_selected: !(item.is_selected ?? true) } // Toggle trạng thái
          : item
      )
    );
     console.log(`Đã toggle select cho key ${itemKey}`);
  };

  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?")) {
      setCartItems([]);
      console.log("Đã xóa hết giỏ hàng");
    }
  };

  const handlePlaceOrder = () => {
    const itemsToOrder = cartItems.filter(item => item.is_selected);
    if (itemsToOrder.length === 0) {
        alert("Vui lòng chọn ít nhất một sản phẩm để đặt hàng.");
        return;
    }
    console.log("Đặt hàng với các sản phẩm:", itemsToOrder);
    alert(`Đặt hàng thành công ${itemsToOrder.length} sản phẩm! (Chức năng Demo)`);
    // Xóa các sản phẩm đã đặt khỏi giỏ hàng (ví dụ)
    setCartItems(prevItems => prevItems.filter(item => !item.is_selected));
    // navigate('/checkout'); // Hoặc chuyển đến trang checkout
  };


  // --- Tính toán các giá trị tổng hợp (dùng useMemo để tối ưu) ---
  const selectedItems = useMemo(() =>
      cartItems.filter(item => item.is_selected ?? true), // Mặc định là chọn nếu chưa có
      [cartItems]
  );

  const selectedTotal = useMemo(() =>
      selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      [selectedItems]
  );

  const cartItemCount = cartItems.length; // Tổng số loại sản phẩm (dòng)
  const isCartEmpty = cartItemCount === 0;
  const hasSelectedItems = selectedItems.length > 0;

  return (
    <div className={styles.cartPageContainer}>
      <h1 className={styles.pageTitle}>
        <FaShoppingCart /> Giỏ Hàng Của Bạn
      </h1>

      {isCartEmpty ? (
        <div className={styles.emptyCart}>
          {/* <img src="/images/empty-cart.svg" alt="Giỏ hàng trống" className={styles.emptyCartImage} /> */}
          <FaShoppingCart size={80} style={{ color: '#ccc', marginBottom: '20px'}} />
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Hãy khám phá thêm các sản phẩm tuyệt vời của chúng tôi!</p>
          <Link to="/products">
            <Button variant="primary">Tiếp tục mua sắm</Button>
          </Link>
        </div>
      ) : (
        <div className={styles.cartContent}>
          <div className={styles.cartTableWrapper}>
            <table className={styles.cartTable}>
              <thead>
                <tr>
                  <th className={styles.columnSelect}></th>
                  <th className={styles.columnProduct}>Sản phẩm</th>
                  <th className={styles.columnQuantity}>Số lượng</th>
                  <th className={`${styles.columnPrice} ${styles.alignRight}`}>Đơn giá</th>
                  <th className={`${styles.columnTotal} ${styles.alignRight}`}>Thành tiền</th>
                  <th className={styles.columnActions}>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <CartItem
                    // Key phải là duy nhất cho mỗi dòng
                    key={item.uniqueId || `${item.productId}-${item.variantId}`}
                    item={item}
                    onRemove={handleRemoveItem}
                    onQuantityChange={handleQuantityChange}
                    onToggleSelect={handleToggleSelect}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.cartSummary}>
             <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                    <span>Tổng số loại sản phẩm:</span>
                    <span>{cartItemCount}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
                    <span>Tổng tiền (sản phẩm đã chọn):</span>
                    <span className={styles.totalAmountValue}>{formatCurrency(selectedTotal)}</span>
                </div>
             </div>

            <div className={styles.cartActions}>
              <Button
                variant="danger"
                onClick={handleClearCart}
                disabled={isCartEmpty}
                className={styles.clearCartButton}
              >
                <FaTrash /> Làm sạch giỏ hàng
              </Button>
              <Button
                variant="primary"
                onClick={handlePlaceOrder}
                disabled={!hasSelectedItems}
                className={styles.checkoutButton}
              >
                Đặt Hàng ({selectedItems.length} sản phẩm)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;