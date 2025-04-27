import React, { useState, useEffect, useMemo } from 'react'; // Thêm useEffect
import { Link, useNavigate } from 'react-router-dom';
// import { useCart } from '../../contexts/CartContext'; // Có thể dùng context nếu cần state global
import apiService from '../../services/api'; // *** IMPORT API SERVICE ***
import CartItem from '../../components/CartItem/CartItem';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner'; // Import Spinner
import styles from './CartPage.module.css';
import { FaShoppingCart, FaTrash, FaExclamationTriangle } from 'react-icons/fa'; // Thêm icon lỗi

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const CartPage = () => {
  // State quản lý giỏ hàng, loading và lỗi
  const [cartItems, setCartItems] = useState([]); // Khởi tạo mảng rỗng
  const [isLoading, setIsLoading] = useState(true); // Loading ban đầu
  const [error, setError] = useState(null);       // State lỗi
  const navigate = useNavigate();

  // --- Fetch dữ liệu giỏ hàng khi component mount ---
  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching cart items...");
        const response = await apiService.getCartItems();
        console.log("API Cart Response:", response);

        if (response && Array.isArray(response.data)) {
          // *** XỬ LÝ DỮ LIỆU TRẢ VỀ TỪ API ***
          const processedItems = response.data.map(item => ({
            ...item,
            // Đảm bảo có key duy nhất (ví dụ: dùng cartItemId nếu có, nếu không thì kết hợp)
            uniqueId: item.cartItemId || `${item.productId}-${item.variantId}`,
            // Đảm bảo có is_selected (mặc định là true nếu API không trả về)
            is_selected: item.is_selected ?? true,
            // Đảm bảo quantity là số và >= 1
            quantity: Math.max(1, parseInt(item.quantity || 1, 10)),
            // Lấy giá chính xác (price có thể là giá gốc hoặc giá đã giảm tùy API)
            price: parseFloat(item.price || 0),
             // Thêm các trường khác nếu cần (stockQuantity...)
             // stockQuantity: parseInt(item.stockQuantity || 0, 10)
          }));
          console.log("Processed cart items:", processedItems);
          setCartItems(processedItems);
        } else {
          console.warn("API getCartItems did not return a valid array:", response?.data);
          setCartItems([]); // Đặt thành mảng rỗng nếu dữ liệu không hợp lệ
        }
      } catch (err) {
        console.error("Lỗi fetch giỏ hàng:", err);
        setError(err.message || "Không thể tải giỏ hàng. Vui lòng thử lại.");
        setCartItems([]); // Đặt thành mảng rỗng khi có lỗi
      } finally {
        setIsLoading(false); // Kết thúc loading
      }
    };

    fetchCart();
  }, []); // Chỉ chạy 1 lần khi mount

  // --- Các hàm xử lý (Gọi API thay vì chỉ set state) ---

  const handleRemoveItem = async (itemKey, cartItemId) => { // Nhận thêm cartItemId nếu có
    // Tìm item cần xóa để hiển thị thông báo (tùy chọn)
    const itemToRemove = cartItems.find(item => (item.uniqueId || `${item.productId}-${item.variantId}`) === itemKey);
    if (!itemToRemove) return;

    // Xác nhận trước khi xóa
    if (!window.confirm(`Bạn có chắc muốn xóa "${itemToRemove.name}" khỏi giỏ hàng?`)) {
        return;
    }

    try {
      console.log(`Attempting to remove item with key: ${itemKey}`);
      // *** GỌI API XÓA ITEM ***
      // Cách 1: Nếu API xóa theo cartItemId
      // await apiService.removeCartItem(cartItemId || itemToRemove.cartItemId); // Cần có cartItemId
      // Cách 2: Nếu API xóa theo productId và variantId (gửi trong body)
      await apiService.removeCartItem({ productId: itemToRemove.productId, variantId: itemToRemove.variantId });

      // Cập nhật state sau khi API thành công
      setCartItems(prevItems => prevItems.filter(item => (item.uniqueId || `${item.productId}-${item.variantId}`) !== itemKey));
      console.log(`Đã xóa item với key: ${itemKey}`);
    } catch (err) {
      console.error(`Lỗi xóa item ${itemKey}:`, err);
      alert("Đã xảy ra lỗi khi xóa sản phẩm. Vui lòng thử lại."); // Thông báo lỗi
    }
  };

  const handleQuantityChange = async (itemKey, newQuantity, cartItemId) => {
    if (newQuantity < 1) return; // Không cho phép số lượng < 1

    const currentItem = cartItems.find(item => (item.uniqueId || `${item.productId}-${item.variantId}`) === itemKey);
    if (!currentItem) return;

    // Cập nhật state ngay lập tức để UI phản hồi nhanh (Optimistic Update)
    const oldItems = [...cartItems]; // Lưu lại state cũ để rollback nếu lỗi
    setCartItems(prevItems =>
      prevItems.map(item =>
        (item.uniqueId || `${item.productId}-${item.variantId}`) === itemKey
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    try {
      console.log(`Attempting to update quantity for key ${itemKey} to: ${newQuantity}`);
      // *** GỌI API CẬP NHẬT SỐ LƯỢNG ***
      // Dữ liệu gửi đi tùy thuộc vào yêu cầu của API
      // Ví dụ 1: Gửi cartItemId và quantity
      // await apiService.updateCartItem({ cartItemId: cartItemId || currentItem.cartItemId, quantity: newQuantity });
      // Ví dụ 2: Gửi productId, variantId, quantity
       await apiService.updateCartItem({ productId: currentItem.productId, variantId: currentItem.variantId, quantity: newQuantity });

      console.log(`Đã cập nhật số lượng thành công cho key ${itemKey}`);
      // Không cần làm gì thêm vì state đã được cập nhật trước đó

    } catch (err) {
      console.error(`Lỗi cập nhật số lượng cho ${itemKey}:`, err);
      alert("Không thể cập nhật số lượng sản phẩm. Vui lòng thử lại.");
      // Rollback state nếu API lỗi
      setCartItems(oldItems);
    }
  };

  // Toggle select không cần gọi API (thường là trạng thái phía client)
  const handleToggleSelect = (itemKey) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        (item.uniqueId || `${item.productId}-${item.variantId}`) === itemKey
          ? { ...item, is_selected: !(item.is_selected ?? true) }
          : item
      )
    );
     console.log(`Đã toggle select cho key ${itemKey}`);
  };

  const handleClearCart = async () => {
    if (window.confirm("Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?")) {
      try {
        console.log("Attempting to clear cart...");
        // *** GỌI API XÓA HẾT GIỎ HÀNG ***
        await apiService.clearCart();
        setCartItems([]); // Cập nhật state sau khi API thành công
        console.log("Đã xóa hết giỏ hàng");
      } catch (err) {
         console.error("Lỗi xóa hết giỏ hàng:", err);
         alert("Không thể xóa giỏ hàng. Vui lòng thử lại.");
      }
    }
  };

  // Logic đặt hàng giữ nguyên (chỉ cần gửi selectedItems)
  const handlePlaceOrder = async () => {
    const itemsToOrder = cartItems.filter(item => item.is_selected);
    if (itemsToOrder.length === 0) {
        alert("Vui lòng chọn ít nhất một sản phẩm để đặt hàng.");
        return;
    }

    // Tạo dữ liệu gửi đi cho API createOrder (tùy thuộc yêu cầu backend)
    // Ví dụ: Chỉ gửi ID và số lượng của các item được chọn
    const orderData = {
        // customerInfo: { ... }, // Thông tin khách hàng nếu cần
        items: itemsToOrder.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price // Gửi giá tại thời điểm đặt hàng
        })),
        // paymentMethod: "COD", // Ví dụ
        // shippingAddress: "...", // Ví dụ
        // totalAmount: selectedTotal // Gửi tổng tiền tính ở client hoặc để backend tính lại
    };

    console.log("Attempting to create order with data:", orderData);
    // Hiển thị loading trên nút hoặc toàn trang nếu cần
    // setIsLoading(true);
    try {
        // *** GỌI API TẠO ĐƠN HÀNG ***
        const response = await apiService.createOrder(orderData);
        console.log("API Create Order Response:", response);

        alert(`Đặt hàng thành công! Mã đơn hàng: ${response.data?.orderId || 'N/A'}`); // Hiển thị mã đơn hàng nếu có

        // Xóa các sản phẩm đã đặt khỏi giỏ hàng client-side
        setCartItems(prevItems => prevItems.filter(item => !item.is_selected));

        // Chuyển hướng đến trang cảm ơn hoặc lịch sử đơn hàng
        navigate('/order-success'); // Ví dụ

    } catch (err) {
        console.error("Lỗi đặt hàng:", err);
        alert(err.response?.data?.message || err.message || "Đặt hàng không thành công. Vui lòng thử lại.");
    } finally {
         // setIsLoading(false);
    }
  };

  // --- Tính toán các giá trị tổng hợp (giữ nguyên useMemo) ---
  const selectedItems = useMemo(() =>
      cartItems.filter(item => item.is_selected ?? true),
      [cartItems]
  );
  const selectedTotal = useMemo(() =>
      selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      [selectedItems]
  );
  const cartItemCount = cartItems.length;
  const isCartEmpty = cartItemCount === 0;
  const hasSelectedItems = selectedItems.length > 0;

  // --- Render Loading ---
  if (isLoading) {
     return (
      <div className={styles.cartPageContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spinner size="large" />
      </div>
    );
  }

  // --- Render Error ---
   if (error) {
     return (
       <div className={`${styles.cartPageContainer} ${styles.errorContainer}`}>
          <FaExclamationTriangle size={40} style={{ color: '#ef4444', marginBottom: '15px'}} />
          <h2>Đã xảy ra lỗi</h2>
          <p>{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>Tải lại trang</Button>
       </div>
     );
  }

  // --- Render Nội dung chính ---
  return (
    <div className={styles.cartPageContainer}>
      <h1 className={styles.pageTitle}>
        <FaShoppingCart /> Giỏ Hàng Của Bạn {cartItemCount > 0 && `(${cartItemCount})`}
      </h1>

      {isCartEmpty ? (
        <div className={styles.emptyCart}>
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
                    key={item.uniqueId || `${item.productId}-${item.variantId}`} // Sử dụng key duy nhất
                    item={item}
                    // Truyền ID duy nhất hoặc cả productId và variantId vào hàm xử lý
                    onRemove={() => handleRemoveItem(item.uniqueId || `${item.productId}-${item.variantId}`, item.cartItemId)}
                    onQuantityChange={(newQuantity) => handleQuantityChange(item.uniqueId || `${item.productId}-${item.variantId}`, newQuantity, item.cartItemId)}
                    onToggleSelect={() => handleToggleSelect(item.uniqueId || `${item.productId}-${item.variantId}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.cartSummary}>
             <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                    <span>Số loại sản phẩm:</span>
                    <span>{cartItemCount}</span>
                </div>
                 <div className={styles.summaryRow}>
                    <span>Số sản phẩm đã chọn:</span>
                    <span>{selectedItems.length}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
                    <span>Tổng tiền (tạm tính):</span>
                    <span className={styles.totalAmountValue}>{formatCurrency(selectedTotal)}</span>
                </div>
             </div>

            <div className={styles.cartActions}>
              <Button
                variant="danger"
                onClick={handleClearCart}
                disabled={isCartEmpty} // Disable nếu giỏ hàng trống
                className={styles.clearCartButton}
              >
                <FaTrash /> Xóa hết
              </Button>
              <Button
                variant="primary"
                onClick={handlePlaceOrder}
                disabled={!hasSelectedItems || isLoading} // Disable nếu không có SP chọn hoặc đang loading
                className={styles.checkoutButton}
              >
                {/* Hiển thị loading trên nút nếu cần */}
                {/* {isPlacingOrder ? <Spinner size="small" color="#fff"/> : `Đặt Hàng (${selectedItems.length})`} */}
                 Đặt Hàng ({selectedItems.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;