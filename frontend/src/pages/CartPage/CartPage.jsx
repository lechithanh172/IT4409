
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import CartItem from '../../components/CartItem/CartItem';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import styles from './CartPage.module.css';
import { FaShoppingCart, FaTrash, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';


const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount) || amount < 0) return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};


const getVariantFinalPrice = (variantDetail, mainProductPrice) => {

    if (typeof mainProductPrice !== 'number' || isNaN(mainProductPrice) || mainProductPrice <= 0) {
        console.error(`Invalid mainProductPrice (${mainProductPrice}) for variant ${variantDetail?.variantId}. Returning 0.`);
        return 0;
    }
    if (variantDetail && typeof variantDetail.discount === 'number' && variantDetail.discount > 0 && variantDetail.discount < 100) {
        const discountMultiplier = 1 - (variantDetail.discount / 100);
        const finalPrice = mainProductPrice * discountMultiplier;

        return Math.round(finalPrice);
    } else {

        return mainProductPrice;
    }
};


const CartPage = () => {
  useEffect(() => {
          document.title = "Giỏ hàng | HustShop";
      }, []);

  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);


  const fetchAndEnrichCart = useCallback(async () => {

    setCartItems([]);
    setError(null);
    setIsLoading(true);

    if (!isAuthenticated) {
      console.log("User not authenticated. Skipping cart fetch.");
      setIsLoading(false); return;
    }

    console.log("Starting cart fetch process...");

    try {

      console.log("Fetching basic cart items...");
      const baseCartResponse = await apiService.getCartItems();
      console.log("API getCartItems Response:", baseCartResponse);

      if (!baseCartResponse || !Array.isArray(baseCartResponse.data)) {
        console.warn("API getCartItems did not return a valid array:", baseCartResponse?.data);

        setIsLoading(false);


        return;
      }

      const baseCartData = baseCartResponse.data;

      if (baseCartData.length === 0) {
        console.log("Cart is empty based on API response.");
        setCartItems([]); setIsLoading(false); return;
      }


      const uniqueProductIds = [...new Set(baseCartData.map(item => item.productId))];
      if (uniqueProductIds.length === 0) {
        console.warn("Cart data contains items but no valid product IDs.");
        setCartItems([]); setIsLoading(false); return;
      }
      console.log("Fetching details for product IDs:", uniqueProductIds);


      const productDetailPromises = uniqueProductIds.map(id =>
        apiService.getProductById(id).catch(err => {
            console.error(`Error fetching product ID ${id}:`, err);
            return { error: err, productId: id };
        })
      );
      const productDetailResults = await Promise.allSettled(productDetailPromises);


      const productDetailsMap = new Map();
      productDetailResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value?.data?.productId && !result.value.error) {
          productDetailsMap.set(result.value.data.productId, result.value.data);
        } else {
          const failedProductId = result.reason?.productId || result.value?.productId || 'unknown';
          console.error(`Failed to store/fetch details for product ID ${failedProductId}. Reason:`, result.reason || result.value?.error);
        }
      });
      console.log("Product details map created:", productDetailsMap);


      const enrichedItems = baseCartData.map(cartItem => {
        const productDetail = productDetailsMap.get(cartItem.productId);


        if (!productDetail) {
          console.warn(`Product details missing for productId: ${cartItem.productId}. Creating placeholder.`);
          return {
            cartItemId: cartItem.cartItemId,
            productId: cartItem.productId,
            variantId: cartItem.variantId,
            userId: cartItem.userId,
            uniqueId: cartItem.cartItemId || `${cartItem.productId}-${cartItem.variantId || 'err'}`,
            name: `Sản phẩm ID ${cartItem.productId} (Lỗi)`,
            color: cartItem.variantId ? `Variant ID ${cartItem.variantId}` : 'N/A',
            imageUrl: '/images/placeholder-image.png',
            price: 0,
            stockQuantity: 0,
            is_selected: cartItem.selected ?? true,
            quantity: Math.max(1, parseInt(cartItem.quantity || 1, 10)),
            error: 'Lỗi tải thông tin sản phẩm'
          };
        }


        const variantDetail = productDetail.variants?.find(
          v => v.variantId === cartItem.variantId
        );


        if (!variantDetail) {
          console.warn(`Variant details not found for productId: ${cartItem.productId}, variantId: ${cartItem.variantId}. Creating placeholder.`);
          return {
            ...cartItem,
            uniqueId: cartItem.cartItemId || `${cartItem.productId}-${cartItem.variantId}`,
            name: `${productDetail.productName} (Lỗi phiên bản)`,
            color: `Variant ID ${cartItem.variantId} (Lỗi)`,
            imageUrl: productDetail.variants?.[0]?.imageUrl || '/images/placeholder-image.png',
            price: productDetail.price || 0,
            stockQuantity: 0,
            is_selected: cartItem.selected ?? true,
            quantity: Math.max(1, parseInt(cartItem.quantity || 1, 10)),
            error: 'Lỗi tải thông tin phiên bản'
          };
        }


        const finalPrice = getVariantFinalPrice(variantDetail, productDetail.price);

        return {
          ...cartItem,
          uniqueId: cartItem.cartItemId || `${cartItem.productId}-${cartItem.variantId}`,
          productId: productDetail.productId,
          variantId: variantDetail.variantId,
          name: productDetail.productName,
          color: variantDetail.color,
          imageUrl: variantDetail.imageUrl || '/images/placeholder-image.png',
          price: finalPrice,
          stockQuantity: parseInt(variantDetail.stockQuantity || 0, 10),
          is_selected: cartItem.selected ?? true,
          quantity: Math.max(1, parseInt(cartItem.quantity || 1, 10)),
          error: null
        };
      }).filter(item => item);

      console.log("Final enriched cart items:", enrichedItems);
      setCartItems(enrichedItems);

    } catch (err) {
      console.error("Critical error during fetchAndEnrichCart:", err);
      setError(err.message || "Không thể tải giỏ hàng. Vui lòng thử lại.");
      setCartItems([]);
    } finally {
      setIsLoading(false);
      console.log("Cart fetch process finished.");
    }
  }, [isAuthenticated]);


  useEffect(() => { fetchAndEnrichCart(); }, [fetchAndEnrichCart]);




  const promptRemoveItem = (itemUniqueId) => {
    const item = cartItems.find(i => i.uniqueId === itemUniqueId);
    if (item) { setItemToRemove(item); setIsModalOpen(true); }
    else { console.warn("Cannot find item to remove:", itemUniqueId); }
  };


  const handleCloseModal = () => { setIsModalOpen(false); setItemToRemove(null); };


  const handleConfirmRemove = async () => {
    if (!itemToRemove) { console.error("Confirm remove error: No item stored."); handleCloseModal(); return; }
    const { uniqueId, productId, variantId, name, color } = itemToRemove;
    handleCloseModal();
    if (!isAuthenticated || !user?.userId) { alert("Vui lòng đăng nhập."); console.error("Remove item failed: User not auth."); return; }

    setIsUpdating(true);
    const payload = { userId: user.userId, productId, variantId };
    console.log("Attempting remove with payload:", payload);
    try {
      await apiService.removeCartItem(payload);
      console.log(`Successfully removed item ${uniqueId}`);
      setCartItems(prevItems => prevItems.filter(item => item.uniqueId !== uniqueId));
    } catch (err) {
      console.error(`Error removing item ${uniqueId}:`, err);
      alert(`Lỗi xóa "${name} - ${color}". Lỗi: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };


  const handleQuantityChange = async (itemUniqueId, changeAmount) => {
    console.log(`Quantity change for ${itemUniqueId}, amount: ${changeAmount}`);
    if (!isAuthenticated || !user?.userId) { alert("Vui lòng đăng nhập."); return; }

    const currentItemIndex = cartItems.findIndex(item => item.uniqueId === itemUniqueId);
    if (currentItemIndex === -1) { console.error("Cannot find item to update:", itemUniqueId); return; }
    const currentItem = cartItems[currentItemIndex];

    if (currentItem.error) { alert(`Sản phẩm ${currentItem.name} đang lỗi.`); return; }

    const projectedNewQuantity = currentItem.quantity + changeAmount;
    if (projectedNewQuantity < 1) { console.warn("Qty < 1"); return; }
    if (projectedNewQuantity > currentItem.stockQuantity) { alert(`Tồn kho tối đa cho "${currentItem.name} - ${currentItem.color}" là ${currentItem.stockQuantity}.`); return; }

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
        isSelected: currentItem.is_selected, quantity: changeAmount,
    };
    console.log("Sending qty update payload:", payload);

    try {
        await apiService.updateCartItem(payload);
        console.log(`API qty update success for ${itemUniqueId}.`);
    } catch (err) {
        console.error(`Error updating quantity API for ${itemUniqueId}:`, err);
        alert(`Lỗi cập nhật số lượng "${currentItem.name}". Lỗi: ${err.response?.data?.message || err.message}`);
        setCartItems(originalItems);
        console.log("Rolled back optimistic qty update.");
    } finally {
        setIsUpdating(false);
    }
  };


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
        isSelected: newSelectedState,
        quantity: 0,
    };
    console.log("Sending selection update payload:", payload);

    try {
        await apiService.updateCartItem(payload);
        console.log(`API selection update success for ${itemUniqueId}.`);
    } catch (err) {
        console.error(`Error updating selection API for ${itemUniqueId}:`, err);
        alert(`Lỗi cập nhật lựa chọn "${itemToToggle.name}". Lỗi: ${err.response?.data?.message || err.message}`);
        setCartItems(originalItems);
        console.log("Rolled back optimistic selection update.");
    } finally {
        setIsUpdating(false);
    }
  };


  const handleClearCart = async () => {
    if (!isAuthenticated || !user?.userId) { alert("Vui lòng đăng nhập."); return; }
    const itemsWithoutErrors = cartItems.filter(item => !item.error);
    if (itemsWithoutErrors.length === 0) { alert("Không có sản phẩm hợp lệ để xóa."); return; }

    if (window.confirm("Bạn chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?")) {
      setIsUpdating(true);
      try {
        console.log("Attempting to clear cart...");
        await apiService.clearCart();
        setCartItems([]);
        console.log("Cart cleared successfully.");
      } catch (err) {
        console.error("Error clearing cart:", err);
        alert(`Lỗi xóa giỏ hàng: ${err.response?.data?.message || err.message}`);
      } finally {
        setIsUpdating(false);
      }
    }
  };


  const handlePlaceOrder = () => {
    console.log("[handlePlaceOrder] Initiated.");

    if (!isAuthenticated || !user?.userId) {
      alert("Vui lòng đăng nhập để đặt hàng.");
      console.log("[handlePlaceOrder] Blocked: User not authenticated.");
      return;
    }
    console.log("[handlePlaceOrder] User authenticated.");

    const currentCartItems = cartItems;
    console.log("[handlePlaceOrder] Current cart items state:", currentCartItems);

    const itemsToOrder = currentCartItems.filter(item => item.is_selected && !item.error);
    console.log("[handlePlaceOrder] Filtered items to order:", itemsToOrder);

    if (itemsToOrder.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm hợp lệ để đặt hàng.");
      console.log("[handlePlaceOrder] Blocked: No valid items selected.");
      return;
    }
    console.log("[handlePlaceOrder] Items selected. Proceeding to stock check.");


    const outOfStockItems = itemsToOrder.filter(item => {
        const stock = typeof item.stockQuantity === 'number' ? item.stockQuantity : 0;
        const qty = typeof item.quantity === 'number' ? item.quantity : 0;
        return qty > stock;
    });
    console.log("[handlePlaceOrder] Out of stock items:", outOfStockItems);

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => `${item.name} - ${item.color} (Chỉ còn ${item.stockQuantity})`).join('\n - ');
      alert(`Một số sản phẩm không đủ số lượng:\n - ${itemNames}\nVui lòng điều chỉnh.`);
      console.log("[handlePlaceOrder] Blocked: Stock check failed.");
      return;
    }
    console.log("[handlePlaceOrder] Stock check passed.");


    let currentSelectedTotal = 0;
    try {
        currentSelectedTotal = itemsToOrder.reduce((sum, item) => {
            const price = typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0;
            const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0;
             if (price <= 0 && quantity > 0) { console.warn(`[handlePlaceOrder] Item ${item.name} (${item.uniqueId}) has price ${price}, quantity ${quantity}.`); }
            return sum + (price * quantity);
        }, 0);
        console.log("[handlePlaceOrder] Recalculated selected total:", currentSelectedTotal);

        if (isNaN(currentSelectedTotal)) { throw new Error("Lỗi tính toán tổng tiền (NaN)."); }
        if (currentSelectedTotal < 0) { throw new Error("Tổng tiền không hợp lệ (âm)."); }


        const orderDataForStorage = {
            items: itemsToOrder.map(item => ({
                uniqueId: item.uniqueId, productId: item.productId, variantId: item.variantId,
                name: item.name, color: item.color, imageUrl: item.imageUrl,
                price: item.price, quantity: item.quantity,
            })),
            total: currentSelectedTotal
        };

        const orderDataString = JSON.stringify(orderDataForStorage);
        console.log("[handlePlaceOrder] Serialized order data for storage:", orderDataString);



        localStorage.setItem('pendingOrderData', orderDataString);
        console.log("[handlePlaceOrder] Order data saved to localStorage successfully.");








        console.warn("[handlePlaceOrder] Clearing localStorage as requested by user, but this WILL likely cause /place-order to fail.");




        navigate('/place-order');
        console.log("[handlePlaceOrder] Navigating to /place-order");

    } catch (error) {
        console.error("[handlePlaceOrder] Error during final preparation:", error);
        alert(`Đã xảy ra lỗi khi chuẩn bị đặt hàng: ${error.message}. Vui lòng thử lại.`);

        localStorage.removeItem('pendingOrderData');
        localStorage.removeItem('savedShippingInfo');
    }
  };


  const validCartItems = useMemo(() => cartItems.filter(item => !item.error), [cartItems]);
  const selectedItems = useMemo(() => validCartItems.filter(item => item.is_selected), [validCartItems]);
  const selectedTotal = useMemo(() =>
      selectedItems.reduce((sum, item) => {
          const price = typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0;
          const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0;
          return sum + (price * quantity);
      }, 0),
      [selectedItems]
  );
  const cartItemCount = validCartItems.length;
  const isCartEmpty = cartItemCount === 0;
  const hasSelectedItems = selectedItems.length > 0;




  if (isLoading) {
    return ( <div className={styles.loadingContainer}><Spinner size="large" /><p>Đang tải giỏ hàng...</p></div> );
  }


  if (!isAuthenticated) {
    return ( <div className={styles.cartPageContainer} style={{ textAlign: 'center', padding: '40px 20px' }}><FaShoppingCart size={60} style={{ color: '#ccc', marginBottom: '20px'}} /><h2>Vui lòng đăng nhập</h2><p>Bạn cần đăng nhập để xem giỏ hàng.</p><Link to="/login"><Button variant="primary" className={styles.loginButton}>Đăng nhập</Button></Link></div> );
  }


  if (error && cartItems.length === 0) {
    return ( <div className={`${styles.cartPageContainer} ${styles.errorContainer}`}><FaExclamationTriangle size={50} /><h2>Đã xảy ra lỗi</h2><p>{error}</p><Button variant="secondary" onClick={fetchAndEnrichCart}>Thử tải lại</Button></div> );
  }


  return (
    <div className={styles.cartPageContainer}>
      <h1 className={styles.pageTitle}>
        <FaShoppingCart /> Giỏ Hàng {cartItemCount > 0 && `(${cartItemCount})`}
      </h1>

      {/* Minor Error Notification */}
      {error && cartItems.length > 0 && ( <div className={styles.generalError}><FaInfoCircle /> {error} - Một số thông tin sản phẩm có thể chưa được cập nhật.</div> )}

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
                    isUpdating={isUpdating}
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