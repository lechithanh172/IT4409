import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import hook để lấy thông tin user
import apiService from '../../services/api';        // Import service gọi API
import CartItem from '../../components/CartItem/CartItem'; // Import component hiển thị từng item
import Button from '../../components/Button/Button';         // Import component Button tùy chỉnh
import Spinner from '../../components/Spinner/Spinner';       // Import component Spinner loading
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'; // Import component Modal xác nhận
import styles from './CartPage.module.css';                 // Import CSS Module
import { FaShoppingCart, FaTrash, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'; // Import icons

// --- Hàm tiện ích: Định dạng tiền tệ ---
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount) || amount < 0) return 'N/A'; // Handle non-numbers and negative
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// --- Hàm tiện ích: Lấy giá cuối cùng của Variant (ĐÃ SỬA THEO API MỚI) ---
// Sử dụng giá gốc của sản phẩm và chiết khấu của variant
const getVariantFinalPrice = (variantDetail, mainProductPrice) => {
    console.log(`Calculating price for variant ${variantDetail?.variantId}. Main price: ${mainProductPrice}, Discount: ${variantDetail?.discount}%`);

    // Validate main product price
    if (typeof mainProductPrice !== 'number' || isNaN(mainProductPrice) || mainProductPrice <= 0) {
        console.error(`Invalid mainProductPrice (${mainProductPrice}) for variant ${variantDetail?.variantId}. Returning 0.`);
        return 0; // Or handle as appropriate, maybe throw an error or return null
    }

    // Check if variant has a valid discount percentage
    if (variantDetail && typeof variantDetail.discount === 'number' && variantDetail.discount > 0 && variantDetail.discount < 100) {
        const discountMultiplier = 1 - (variantDetail.discount / 100);
        const finalPrice = mainProductPrice * discountMultiplier;
        console.log(`Applied discount ${variantDetail.discount}%. Final price: ${finalPrice}`);
        return Math.round(finalPrice); // Round to nearest integer (VND has no decimals often)
    } else {
        // If no valid discount, use the main product price
        console.log(`No valid discount found or discount is 0. Using main product price: ${mainProductPrice}`);
        return mainProductPrice;
    }
};
// -------------------------------------------------------------------

const CartPage = () => {
  // --- State Quản lý Component ---
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // --- State cho Modal Xác Nhận ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  // --- Hàm Fetch và Làm Giàu Dữ liệu Giỏ Hàng ---
  const fetchAndEnrichCart = useCallback(async () => {
    if (!isAuthenticated) {
      console.log("User not authenticated. Skipping cart fetch.");
      setIsLoading(false); setCartItems([]); return;
    }

    console.log("Starting cart fetch process...");
    setIsLoading(true); setError(null);

    try {
      // 1. Fetch dữ liệu cơ bản từ API giỏ hàng
      console.log("Fetching basic cart items...");
      const baseCartResponse = await apiService.getCartItems();
      console.log("API getCartItems Response:", baseCartResponse);

      if (!baseCartResponse || !Array.isArray(baseCartResponse.data)) {
        console.warn("API getCartItems did not return a valid array:", baseCartResponse?.data);
        setCartItems([]);
        // Keep loading true? Or set false and show error? Setting false for now.
        setIsLoading(false);
        // Don't throw here, maybe the API returns empty array correctly later
        // throw new Error("Dữ liệu giỏ hàng nhận được không hợp lệ.");
        return; // Exit if data is invalid
      }

      const baseCartData = baseCartResponse.data;

      if (baseCartData.length === 0) {
        console.log("Cart is empty based on API response.");
        setCartItems([]); setIsLoading(false); return;
      }

      // 2. Lấy danh sách các productId duy nhất
      const uniqueProductIds = [...new Set(baseCartData.map(item => item.productId))];
      console.log("Fetching details for product IDs:", uniqueProductIds);

      // Gọi API lấy chi tiết từng sản phẩm song song
      const productDetailPromises = uniqueProductIds.map(id =>
        apiService.getProductById(id).catch(err => ({ error: err, productId: id }))
      );
      const productDetailResults = await Promise.allSettled(productDetailPromises);

      // 3. Tạo Map để lưu trữ chi tiết sản phẩm
      const productDetailsMap = new Map();
      productDetailResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value?.data?.productId) {
          productDetailsMap.set(result.value.data.productId, result.value.data);
        } else {
          const failedProductId = result.reason?.productId || result.value?.productId || result.reason?.config?.url?.split('/').pop() || 'unknown';
          console.error(`Failed to fetch details for product ID ${failedProductId}:`, result.reason || result.value?.error);
          // Optionally store error info or handle placeholder creation later
        }
      });
      console.log("Product details map created:", productDetailsMap);

      // 4. Kết hợp dữ liệu giỏ hàng với chi tiết sản phẩm/variant
      const enrichedItems = baseCartData.map(cartItem => {
        const productDetail = productDetailsMap.get(cartItem.productId);

        // Handle case where product detail fetch failed
        if (!productDetail) {
          console.warn(`Product details not found for productId: ${cartItem.productId}. Creating placeholder.`);
          return {
            ...cartItem,
            uniqueId: cartItem.cartItemId || `${cartItem.productId}-${cartItem.variantId || 'unknown'}`,
            name: `Sản phẩm ID ${cartItem.productId}`,
            color: cartItem.variantId ? `Variant ID ${cartItem.variantId}` : 'N/A',
            imageUrl: '/images/placeholder-image.png',
            price: 0, stockQuantity: 0,
            is_selected: cartItem.selected ?? true,
            quantity: Math.max(1, parseInt(cartItem.quantity || 1, 10)),
            error: 'Lỗi tải thông tin sản phẩm'
          };
        }

        // Find the corresponding variant detail
        const variantDetail = productDetail.variants?.find(
          v => v.variantId === cartItem.variantId
        );

        // Handle case where variant detail is missing within the product
        if (!variantDetail) {
          console.warn(`Variant details not found for productId: ${cartItem.productId}, variantId: ${cartItem.variantId}. Creating placeholder.`);
          return {
            ...cartItem,
            uniqueId: cartItem.cartItemId || `${cartItem.productId}-${cartItem.variantId}`,
            name: `${productDetail.productName}`, // Use main product name
            color: `Variant ID ${cartItem.variantId} (Lỗi)`,
            imageUrl: productDetail.variants?.[0]?.imageUrl || '/images/placeholder-image.png', // Try first variant image or placeholder
            price: productDetail.price || 0, // Fallback to main product price (no discount possible)
            stockQuantity: 0,
            is_selected: cartItem.selected ?? true,
            quantity: Math.max(1, parseInt(cartItem.quantity || 1, 10)),
            error: 'Lỗi tải thông tin phiên bản'
          };
        }

        // --- SUCCESS CASE: Create the fully enriched item ---
        // *** CRITICAL: Pass variantDetail and productDetail.price to getVariantFinalPrice ***
        const finalPrice = getVariantFinalPrice(variantDetail, productDetail.price);

        return {
          ...cartItem,
          uniqueId: cartItem.cartItemId || `${cartItem.productId}-${cartItem.variantId}`,
          productId: productDetail.productId,
          variantId: variantDetail.variantId,
          name: productDetail.productName,
          color: variantDetail.color,
          imageUrl: variantDetail.imageUrl || '/images/placeholder-image.png',
          price: finalPrice, // Use the calculated final price
          stockQuantity: parseInt(variantDetail.stockQuantity || 0, 10),
          is_selected: cartItem.selected ?? true,
          quantity: Math.max(1, parseInt(cartItem.quantity || 1, 10)),
          error: null // No error for this item
        };
      });

      console.log("Enriched cart items:", enrichedItems);
      setCartItems(enrichedItems);

    } catch (err) {
      console.error("Error fetching or processing cart:", err);
      // Set a general error message if the process failed
      setError(err.message || "Không thể tải giỏ hàng. Vui lòng thử lại.");
      setCartItems([]); // Clear items on major error
    } finally {
      setIsLoading(false); // Finish loading
      console.log("Cart fetch process finished.");
    }
  }, [isAuthenticated]); // Re-fetch when auth state changes

  // --- useEffect: Initial Fetch ---
  useEffect(() => {
    fetchAndEnrichCart();
  }, [fetchAndEnrichCart]);

  // --- Action Handlers ---

  // 1. Prompt Remove Item
  const promptRemoveItem = (itemUniqueId) => {
    const item = cartItems.find(i => i.uniqueId === itemUniqueId);
    if (item) { setItemToRemove(item); setIsModalOpen(true); }
    else { console.warn("Cannot find item to remove:", itemUniqueId); }
  };

  // 2. Close Modal
  const handleCloseModal = () => { setIsModalOpen(false); setItemToRemove(null); };

  // 3. Confirm and Remove Item
  const handleConfirmRemove = async () => {
    if (!itemToRemove) { console.error("Confirm remove error: No item stored."); handleCloseModal(); return; }
    const { uniqueId, productId, variantId, name, color } = itemToRemove;
    handleCloseModal();
    if (!isAuthenticated || !user?.userId) { alert("Vui lòng đăng nhập."); console.error("Remove item failed: User not auth."); return; }

    setIsUpdating(true);
    const payload = { userId: user.userId, productId, variantId }; // Assuming API uses these for removal
    console.log("Attempting remove with payload:", payload);
    try {
      await apiService.removeCartItem(payload); // Ensure this API exists and works as expected
      console.log(`Successfully removed item ${uniqueId}`);
      setCartItems(prevItems => prevItems.filter(item => item.uniqueId !== uniqueId)); // Update UI
    } catch (err) {
      console.error(`Error removing item ${uniqueId}:`, err);
      alert(`Lỗi xóa "${name} - ${color}". Lỗi: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. Handle Quantity Change
   const handleQuantityChange = async (itemUniqueId, changeAmount) => {
    console.log(`Quantity change for ${itemUniqueId}, amount: ${changeAmount}`);
    if (!isAuthenticated || !user?.userId) { alert("Vui lòng đăng nhập."); return; }

    const currentItemIndex = cartItems.findIndex(item => item.uniqueId === itemUniqueId);
    if (currentItemIndex === -1) { console.error("Cannot find item to update:", itemUniqueId); return; }
    const currentItem = cartItems[currentItemIndex];

    if (currentItem.error) { alert(`Sản phẩm ${currentItem.name} đang lỗi.`); return; }

    const projectedNewQuantity = currentItem.quantity + changeAmount;
    if (projectedNewQuantity < 1) { console.warn("Qty < 1"); return; }
    // Use stockQuantity from the enriched item state
    if (projectedNewQuantity > currentItem.stockQuantity) {
        alert(`Tồn kho tối đa cho "${currentItem.name} - ${currentItem.color}" là ${currentItem.stockQuantity}.`);
        return;
    }


    const originalItems = [...cartItems];
    setCartItems(prevItems => {
        const newItems = [...prevItems];
        newItems[currentItemIndex] = { ...currentItem, quantity: projectedNewQuantity };
        return newItems;
    });
    console.log(`Optimistically updated qty to ${projectedNewQuantity}`);
    setIsUpdating(true);

    const payload = {
        userId: user.userId, productId: currentItem.productId, variantId: currentItem.variantId,
        isSelected: currentItem.is_selected, quantity: changeAmount, // Send the change amount (+1 / -1)
    };
    console.log("Sending qty update payload:", payload);

    try {
        await apiService.updateCartItem(payload);
        console.log(`API qty update success for ${itemUniqueId}.`);
        // No need to re-fetch if optimistic update is trusted
    } catch (err) {
        console.error(`Error updating quantity API for ${itemUniqueId}:`, err);
        alert(`Lỗi cập nhật số lượng "${currentItem.name}". Lỗi: ${err.response?.data?.message || err.message}`);
        setCartItems(originalItems); // Rollback on error
        console.log("Rolled back optimistic qty update.");
    } finally {
        setIsUpdating(false);
    }
  };

  // 5. Toggle Select Item
  const handleToggleSelect = async (itemUniqueId) => {
    console.log(`Toggle select for ${itemUniqueId}`);
    if (!isAuthenticated || !user?.userId) { alert("Vui lòng đăng nhập."); return; }

    const itemToToggleIndex = cartItems.findIndex(item => item.uniqueId === itemUniqueId);
    if (itemToToggleIndex === -1) { console.error("Cannot find item to toggle:", itemUniqueId); return; }
    const itemToToggle = cartItems[itemToToggleIndex];

    if (itemToToggle.error) { alert(`Không thể chọn sản phẩm lỗi: ${itemToToggle.name}`); return; }

    const newSelectedState = !itemToToggle.is_selected;
    console.log(`New selected state: ${newSelectedState}`);

    const originalItems = [...cartItems];
    setCartItems(prevItems => {
        const newItems = [...prevItems];
        newItems[itemToToggleIndex] = { ...itemToToggle, is_selected: newSelectedState };
        return newItems;
    });
    console.log(`Optimistically updated selection to ${newSelectedState}`);
    setIsUpdating(true);

    const payload = {
        userId: user.userId, productId: itemToToggle.productId, variantId: itemToToggle.variantId,
        isSelected: newSelectedState, // Send the NEW state
        quantity: 0, // Send 0 as per backend requirement for selection change only
    };
    console.log("Sending selection update payload:", payload);

    try {
        await apiService.updateCartItem(payload);
        console.log(`API selection update success for ${itemUniqueId}.`);
        // No re-fetch needed
    } catch (err) {
        console.error(`Error updating selection API for ${itemUniqueId}:`, err);
        alert(`Lỗi cập nhật lựa chọn "${itemToToggle.name}". Lỗi: ${err.response?.data?.message || err.message}`);
        setCartItems(originalItems); // Rollback
        console.log("Rolled back optimistic selection update.");
    } finally {
        setIsUpdating(false);
    }
  };

  // 6. Clear Entire Cart
  const handleClearCart = async () => {
    if (!isAuthenticated || !user?.userId) { alert("Vui lòng đăng nhập."); return; }
    const itemsWithoutErrors = cartItems.filter(item => !item.error);
    if (itemsWithoutErrors.length === 0) { alert("Không có sản phẩm hợp lệ để xóa."); return; }

    if (window.confirm("Bạn chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?")) {
      setIsUpdating(true);
      try {
        console.log("Attempting to clear cart...");
        await apiService.clearCart(); // Assumes API uses user token implicitly
        setCartItems([]); // Clear UI
        console.log("Cart cleared successfully.");
      } catch (err) {
        console.error("Error clearing cart:", err);
        alert(`Lỗi xóa giỏ hàng: ${err.response?.data?.message || err.message}`);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // 7. Proceed to Place Order
  const handlePlaceOrder = () => {
    if (!isAuthenticated || !user?.userId) { alert("Vui lòng đăng nhập."); return; }

    const itemsToOrder = cartItems.filter(item => item.is_selected && !item.error);
    if (itemsToOrder.length === 0) { alert("Vui lòng chọn ít nhất một sản phẩm hợp lệ."); return; }

    // Re-calculate total based on the selected items *now*
    const currentSelectedTotal = itemsToOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Check stock just before proceeding
    const outOfStockItems = itemsToOrder.filter(item => item.quantity > item.stockQuantity);
    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => `${item.name} - ${item.color} (Chỉ còn ${item.stockQuantity})`).join('\n - ');
      alert(`Một số sản phẩm không đủ số lượng:\n - ${itemNames}\nVui lòng điều chỉnh.`);
      return;
    }

    try {
        // Prepare data with potentially complex objects, ensure serializability if needed
        const orderData = {
            items: itemsToOrder.map(item => ({ // Map to include necessary fields only
                cartItemId: item.cartItemId, // Keep cartItemId if needed later
                uniqueId: item.uniqueId,
                productId: item.productId,
                variantId: item.variantId,
                name: item.name,
                color: item.color,
                imageUrl: item.imageUrl,
                price: item.price, // The calculated final price
                quantity: item.quantity,
                // Add other fields if PlaceOrder page needs them
            })),
            total: currentSelectedTotal // Send the calculated total
        };
        sessionStorage.setItem('pendingOrderData', JSON.stringify(orderData));
        console.log("Order data saved to sessionStorage:", orderData);
        navigate('/place-order'); // Navigate

    } catch (error) {
        console.error("Error saving order data to sessionStorage:", error);
        alert("Lỗi khi chuẩn bị đặt hàng. Vui lòng thử lại.");
    }
  };

  // --- Memoized Calculations ---
  const validCartItems = useMemo(() => cartItems.filter(item => !item.error), [cartItems]);
  const selectedItems = useMemo(() => validCartItems.filter(item => item.is_selected), [validCartItems]);
  // ** Recalculate selectedTotal based on current selectedItems prices **
  const selectedTotal = useMemo(() =>
      selectedItems.reduce((sum, item) => {
          // Ensure price and quantity are numbers before adding
          const price = typeof item.price === 'number' ? item.price : 0;
          const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
          return sum + (price * quantity);
      }, 0),
      [selectedItems] // Recalculate when selected items change
  );
  const cartItemCount = validCartItems.length;
  const isCartEmpty = cartItemCount === 0;
  const hasSelectedItems = selectedItems.length > 0;

  // --- Render Logic ---

  // 1. Loading State
  if (isLoading) {
    return ( <div className={styles.loadingContainer}><Spinner size="large" /><p>Đang tải giỏ hàng...</p></div> );
  }

  // 2. Not Authenticated State
  if (!isAuthenticated) {
    return ( <div className={styles.cartPageContainer} style={{ textAlign: 'center', padding: '40px 20px' }}><FaShoppingCart size={60} style={{ color: '#ccc', marginBottom: '20px'}} /><h2>Vui lòng đăng nhập</h2><p>Bạn cần đăng nhập để xem giỏ hàng.</p><Link to="/login"><Button variant="primary" className={styles.loginButton}>Đăng nhập</Button></Link></div> );
  }

  // 3. Major Error State (Empty Cart after Error)
  if (error && cartItems.length === 0) {
    return ( <div className={`${styles.cartPageContainer} ${styles.errorContainer}`}><FaExclamationTriangle size={50} /><h2>Đã xảy ra lỗi</h2><p>{error}</p><Button variant="secondary" onClick={fetchAndEnrichCart}>Thử tải lại</Button></div> );
  }

  // 4. Main Cart View
  return (
    <div className={styles.cartPageContainer}>
      <h1 className={styles.pageTitle}>
        <FaShoppingCart /> Giỏ Hàng {cartItemCount > 0 && `(${cartItemCount})`}
      </h1>

      {/* Minor Error Notification */}
      {error && cartItems.length > 0 && ( <div className={styles.generalError}><FaInfoCircle /> {error}</div> )}

      {/* Content: Empty or Table */}
      {isCartEmpty && !isLoading ? (
        <div className={styles.emptyCart}>
          <FaShoppingCart size={80} />
          <h2>Giỏ hàng trống</h2>
          <p>Thêm sản phẩm yêu thích vào giỏ nhé!</p>
          <Link to="/"><Button variant="primary">Bắt đầu mua sắm</Button></Link>
        </div>
      ) : (
        <div className={styles.cartContent}>
          {/* Cart Table */}
          <div className={styles.cartTableWrapper}>
            <table className={styles.cartTable}>
              <thead>
                <tr>
                  <th className={styles.columnSelect}>Chọn</th>
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
                    key={item.uniqueId}
                    item={item}
                    onRemove={() => promptRemoveItem(item.uniqueId)}
                    onQuantityChange={handleQuantityChange}
                    onToggleSelect={handleToggleSelect}
                    isUpdating={isUpdating && (itemToRemove?.uniqueId === item.uniqueId || item.uniqueId === 'updating-qty-or-select')} // Be more specific if needed
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Cart Summary */}
          <div className={styles.cartSummary}>
            <h3 className={styles.summaryTitle}>Tổng cộng</h3>
             <div className={styles.summaryDetails}>
                 <div className={styles.summaryRow}><span>Số loại sản phẩm:</span><span>{cartItemCount}</span></div>
                 <div className={styles.summaryRow}><span>Đã chọn:</span><span>{selectedItems.length} / {cartItemCount}</span></div>
                 <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
                    <span>Tạm tính:</span>
                    {/* Display the correctly calculated selectedTotal */}
                    <span className={styles.totalAmountValue}>{formatCurrency(selectedTotal)}</span>
                 </div>
                 <p className={styles.vatNote}>(Giá đã bao gồm VAT nếu có)</p>
             </div>
             <div className={styles.cartActions}>
              <Button variant="secondary" outline onClick={handleClearCart} disabled={isCartEmpty || isUpdating} className={styles.clearCartButton}> <FaTrash /> Xóa tất cả </Button>
              <Button variant="primary" onClick={handlePlaceOrder} disabled={!hasSelectedItems || isUpdating} className={styles.checkoutButton}> {`Đặt Hàng (${selectedItems.length})`} </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmRemove}
        title="Xác nhận xóa"
        message={`Xóa sản phẩm "${itemToRemove?.name}${itemToRemove?.color ? ` - ${itemToRemove.color}` : ''}" khỏi giỏ hàng?`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default CartPage;