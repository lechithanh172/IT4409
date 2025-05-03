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
  // Trả về 'N/A' nếu giá không hợp lệ hoặc là 0
  if (typeof amount !== 'number' || isNaN(amount)) return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// --- Hàm tiện ích: Lấy giá cuối cùng của Variant ---
// (Bạn cần điều chỉnh hàm này dựa trên cấu trúc API thực tế của bạn)
const getVariantFinalPrice = (variant, mainProductPrice) => {
    // Ưu tiên 1: Giá cuối cùng (nếu có)
    if (typeof variant?.finalPrice === 'number') { return variant.finalPrice; }
    // Ưu tiên 2: Giá riêng của variant (nếu có)
    if (typeof variant?.price === 'number') { return variant.price; }
    // Ưu tiên 3: Tính từ giá gốc và discount
    if (typeof variant?.basePrice === 'number' && typeof variant?.discount === 'number' && variant.discount > 0) {
        return variant.basePrice * (1 - variant.discount / 100);
    }
    // Ưu tiên 4: Giá gốc của variant (nếu không có discount)
    if (typeof variant?.basePrice === 'number') { return variant.basePrice; }
    // Fallback: Giá của sản phẩm chính (ít chính xác nhất)
    console.warn(`Variant ${variant?.variantId} missing price, falling back to main price: ${mainProductPrice}`);
    return mainProductPrice ?? 0; // Đảm bảo trả về số
};
// -------------------------------------------------------------------

const CartPage = () => {
  // --- State Quản lý Component ---
  const [cartItems, setCartItems] = useState([]); // Mảng chứa các item trong giỏ (đã được làm giàu thông tin)
  const [isLoading, setIsLoading] = useState(true); // Trạng thái loading chính (khi fetch toàn bộ giỏ hàng)
  const [error, setError] = useState(null);       // Lưu trữ thông báo lỗi (nếu có)
  const [isUpdating, setIsUpdating] = useState(false); // Trạng thái loading cho các hành động (update, remove,...)
  const { user, isAuthenticated } = useAuth();   // Lấy thông tin user và trạng thái đăng nhập
  const navigate = useNavigate();                   // Hook để điều hướng trang

  // --- State cho Modal Xác Nhận ---
  const [isModalOpen, setIsModalOpen] = useState(false);     // Trạng thái đóng/mở modal
  const [itemToRemove, setItemToRemove] = useState(null); // Lưu trữ thông tin item chuẩn bị xóa

  // --- Hàm Fetch và Làm Giàu Dữ liệu Giỏ Hàng ---
  const fetchAndEnrichCart = useCallback(async () => {
    // Chỉ fetch nếu đã đăng nhập
    if (!isAuthenticated) {
      console.log("User not authenticated. Skipping cart fetch.");
      setIsLoading(false); // Hoàn thành loading (vì không fetch)
      setCartItems([]);    // Đảm bảo giỏ hàng trống
      return;
    }

    console.log("Starting cart fetch process...");
    setIsLoading(true); // Bắt đầu loading chính
    setError(null);     // Xóa lỗi cũ

    try {
      // 1. Fetch dữ liệu cơ bản từ API giỏ hàng
      console.log("Fetching basic cart items...");
      const baseCartResponse = await apiService.getCartItems();
      console.log("API getCartItems Response:", baseCartResponse);

      // Kiểm tra response có hợp lệ không
      if (!baseCartResponse || !Array.isArray(baseCartResponse.data)) {
        console.warn("API getCartItems did not return a valid array:", baseCartResponse?.data);
        setCartItems([]); // Đặt giỏ hàng rỗng nếu response không hợp lệ
        throw new Error("Dữ liệu giỏ hàng nhận được không hợp lệ."); // Ném lỗi để hiển thị
      }

      const baseCartData = baseCartResponse.data;

      // Nếu giỏ hàng rỗng, không cần làm gì thêm
      if (baseCartData.length === 0) {
        console.log("Cart is empty.");
        setCartItems([]);
        setIsLoading(false); // Kết thúc loading
        return;
      }

      // 2. Lấy danh sách các productId duy nhất để fetch thông tin chi tiết
      const uniqueProductIds = [...new Set(baseCartData.map(item => item.productId))];
      console.log("Fetching details for product IDs:", uniqueProductIds);

      // Gọi API lấy chi tiết từng sản phẩm song song
      const productDetailPromises = uniqueProductIds.map(id =>
        apiService.getProductById(id).catch(err => ({ error: err, productId: id })) // Bắt lỗi riêng lẻ
      );
      // Chờ tất cả các promise hoàn thành (dù thành công hay thất bại)
      const productDetailResults = await Promise.allSettled(productDetailPromises);

      // 3. Tạo Map để lưu trữ chi tiết sản phẩm đã fetch được (lookup nhanh)
      const productDetailsMap = new Map();
      productDetailResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value?.data?.productId) {
          // Lưu trữ nếu thành công và có dữ liệu hợp lệ
          productDetailsMap.set(result.value.data.productId, result.value.data);
        } else {
          // Log lỗi nếu fetch chi tiết sản phẩm thất bại
          const failedProductId = result.reason?.productId || result.value?.productId || result.reason?.config?.url?.split('/').pop() || 'unknown';
          console.error(`Failed to fetch details for product ID ${failedProductId}:`, result.reason || result.value?.error);
        }
      });
      console.log("Product details map created:", productDetailsMap);

      // 4. Kết hợp dữ liệu cơ bản từ giỏ hàng với chi tiết sản phẩm và variant
      const enrichedItems = baseCartData.map(cartItem => {
        const productDetail = productDetailsMap.get(cartItem.productId);

        // Trường hợp không tìm thấy chi tiết sản phẩm (có thể do lỗi fetch)
        if (!productDetail) {
          console.warn(`Product details not found for productId: ${cartItem.productId}. Creating placeholder.`);
          return {
            ...cartItem, // Giữ lại các trường cơ bản nhất
            uniqueId: cartItem.cartItemId || `${cartItem.productId}-${cartItem.variantId}`,
            name: `Sản phẩm ID ${cartItem.productId}`, // Tên mặc định
            color: `Variant ID ${cartItem.variantId}`,
            imageUrl: '/images/placeholder-image.png', // Ảnh mặc định
            price: 0, stockQuantity: 0,
            is_selected: cartItem.selected ?? true,
            quantity: Math.max(1, parseInt(cartItem.quantity || 1, 10)),
            error: 'Lỗi tải thông tin sản phẩm' // Đánh dấu item bị lỗi
          };
        }

        // Tìm chi tiết variant tương ứng trong productDetail
        const variantDetail = productDetail.variants?.find(
          v => v.variantId === cartItem.variantId
        );

        // Trường hợp không tìm thấy chi tiết variant (dữ liệu không nhất quán)
        if (!variantDetail) {
          console.warn(`Variant details not found for productId: ${cartItem.productId}, variantId: ${cartItem.variantId}. Creating placeholder.`);
          return {
            ...cartItem,
            uniqueId: cartItem.cartItemId || `${cartItem.productId}-${cartItem.variantId}`,
            name: `${productDetail.productName}`, // Dùng tên SP chính
            color: `Variant ID ${cartItem.variantId} (Lỗi)`,
            imageUrl: productDetail.imageUrl || '/images/placeholder-image.png', // Ảnh SP chính hoặc mặc định
            price: 0, stockQuantity: 0,
            is_selected: cartItem.selected ?? true,
            quantity: Math.max(1, parseInt(cartItem.quantity || 1, 10)),
            error: 'Lỗi tải thông tin màu sắc/phiên bản' // Đánh dấu lỗi
          };
        }

        // Tạo đối tượng item hoàn chỉnh với đầy đủ thông tin
        return {
          ...cartItem, // Giữ lại các trường gốc như userId nếu cần
          uniqueId: cartItem.cartItemId || `${cartItem.productId}-${cartItem.variantId}`,
          productId: productDetail.productId,
          variantId: variantDetail.variantId,
          name: productDetail.productName,
          color: variantDetail.color,
          imageUrl: variantDetail.imageUrl || '/images/placeholder-image.png', // Ảnh variant hoặc mặc định
          price: getVariantFinalPrice(variantDetail, productDetail.price), // Giá của variant
          stockQuantity: parseInt(variantDetail.stockQuantity || 0, 10), // Số lượng tồn kho
          is_selected: cartItem.selected ?? true, // Trạng thái chọn từ API getCartItems
          quantity: Math.max(1, parseInt(cartItem.quantity || 1, 10)), // Số lượng
          error: null // Không có lỗi
        };
      });

      console.log("Enriched cart items:", enrichedItems);
      setCartItems(enrichedItems); // Cập nhật state với dữ liệu đã làm giàu

    } catch (err) {
      console.error("Lỗi nghiêm trọng khi fetch hoặc xử lý giỏ hàng:", err);
      setError(err.message || "Không thể tải giỏ hàng. Vui lòng thử lại.");
      setCartItems([]); // Xóa giỏ hàng trên UI nếu có lỗi nghiêm trọng
    } finally {
      setIsLoading(false); // Kết thúc loading chính
      console.log("Cart fetch process finished.");
    }
  }, [isAuthenticated]); // Dependency: chạy lại khi trạng thái đăng nhập thay đổi

  // --- useEffect: Gọi fetchAndEnrichCart khi component mount hoặc dependency thay đổi ---
  useEffect(() => {
    fetchAndEnrichCart();
  }, [fetchAndEnrichCart]); // Chỉ fetch lại nếu hàm fetchAndEnrichCart thay đổi (ít khi xảy ra)

  // --- Các Hàm Xử Lý Hành Động Trên Giỏ Hàng ---

  // 1. Mở Modal Xác Nhận Xóa
  const promptRemoveItem = (itemUniqueId) => {
    const item = cartItems.find(i => i.uniqueId === itemUniqueId);
    if (item) {
      setItemToRemove(item); // Lưu item vào state để modal hiển thị đúng tên
      setIsModalOpen(true);   // Mở modal
    } else {
      console.warn("Cannot find item to remove with uniqueId:", itemUniqueId);
    }
  };

  // 2. Đóng Modal Xác Nhận
  const handleCloseModal = () => {
    setIsModalOpen(false); // Đóng modal
    setItemToRemove(null); // Reset item đang chuẩn bị xóa
  };

  // 3. Xác Nhận và Thực Hiện Xóa (sau khi click Confirm trên Modal)
  const handleConfirmRemove = async () => {
    if (!itemToRemove) {
        console.error("No item selected for removal confirmation.");
        handleCloseModal(); // Đóng modal nếu có lỗi
        return;
    }

    // Lấy các ID cần thiết từ item đã lưu
    const { uniqueId, productId, variantId, name, color } = itemToRemove;

    // Đóng modal trước
    handleCloseModal();

    // Kiểm tra đăng nhập và user ID
    if (!isAuthenticated || !user?.userId) {
      alert("Vui lòng đăng nhập để xóa sản phẩm.");
      console.error("Remove item failed: User not authenticated or userId missing.");
      return;
    }

    setIsUpdating(true); // Bật trạng thái đang cập nhật

    // Chuẩn bị payload theo yêu cầu API xóa
    const payload = {
      userId: user.userId,
      productId: productId,
      variantId: variantId,
    };
    console.log("Attempting to remove item after confirmation with payload:", payload);

    try {
      // Gọi API xóa (đảm bảo apiService.removeCartItem dùng POST và gửi body)
      await apiService.removeCartItem(payload);
      console.log(`Successfully removed item ${uniqueId}`);

      // Cập nhật state ở client ngay sau khi API thành công
      // Cách 1: Lọc bỏ item đã xóa khỏi state hiện tại (nhanh hơn)
      setCartItems(prevItems => prevItems.filter(item => item.uniqueId !== uniqueId));

      // Cách 2: Fetch lại toàn bộ giỏ hàng (chắc chắn đồng bộ 100%)
      // await fetchAndEnrichCart();

    } catch (err) {
      // Xử lý lỗi từ API
      console.error(`Lỗi xóa item ${uniqueId}:`, err);
      alert(`Đã xảy ra lỗi khi xóa sản phẩm "${name} - ${color}". Phản hồi: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUpdating(false); // Tắt trạng thái đang cập nhật
    }
  };

  // 4. Thay Đổi Số Lượng Sản Phẩm (Đã sửa lỗi bằng cách re-fetch)
   // --- Xử lý thay đổi số lượng (Đã sửa theo logic backend mới) ---
    // *** THAY ĐỔI CHỮ KÝ HÀM: nhận changeAmount (+1 hoặc -1) ***
    const handleQuantityChange = async (itemUniqueId, changeAmount) => {
      console.log(`[CartPage] handleQuantityChange called for ${itemUniqueId} with changeAmount: ${changeAmount}`);

      // Kiểm tra đăng nhập
      if (!isAuthenticated || !user?.userId) { alert("Vui lòng đăng nhập."); return; }

      // Tìm item hiện tại trong state
      const currentItemIndex = cartItems.findIndex(item => item.uniqueId === itemUniqueId);
      if (currentItemIndex === -1) { console.error("Cannot find item to update quantity:", itemUniqueId); return; }
      const currentItem = cartItems[currentItemIndex];

      // Kiểm tra item có lỗi không
      if (currentItem.error) { alert(`Sản phẩm ${currentItem.name} đang lỗi.`); return; }

      // Tính toán số lượng mới (dự kiến sau khi thay đổi)
      const projectedNewQuantity = currentItem.quantity + changeAmount;

      // Kiểm tra số lượng tối thiểu và tối đa
      if (projectedNewQuantity < 1) { console.warn("Cannot decrease below 1"); return; }
      if (projectedNewQuantity > currentItem.stockQuantity) { alert(`Tồn kho tối đa là ${currentItem.stockQuantity}.`); return; }

      // *** QUAY LẠI DÙNG OPTIMISTIC UPDATE ***
      // Cập nhật state ngay lập tức để UI phản hồi nhanh
      const originalItems = [...cartItems]; // Lưu state cũ để rollback nếu lỗi
      setCartItems(prevItems => {
          const newItems = [...prevItems];
          newItems[currentItemIndex] = { ...currentItem, quantity: projectedNewQuantity };
          return newItems;
      });
      console.log(`[CartPage] Optimistically updated quantity to ${projectedNewQuantity}`);

      setIsUpdating(true); // Bật loading

      // Chuẩn bị payload: gửi changeAmount cho backend
      const payload = {
          userId: user.userId,
          productId: currentItem.productId,
          variantId: currentItem.variantId,
          isSelected: currentItem.is_selected,
          quantity: changeAmount, // *** Gửi +1 hoặc -1 ***
      };
      console.log("[CartPage] Payload sent to API:", JSON.stringify(payload, null, 2));

      try {
          // Gọi API update
          await apiService.updateCartItem(payload);
          console.log(`[CartPage] API update successful for ${itemUniqueId}. Backend handled the change.`);
          // KHÔNG cần fetch lại nếu tin tưởng backend và optimistic update thành công
          // await fetchAndEnrichCart();

      } catch (err) {
          // Xử lý lỗi API
          console.error(`[CartPage] Error updating quantity for ${itemUniqueId}:`, err);
          alert(`Lỗi cập nhật số lượng "${currentItem.name}". Phản hồi: ${err.response?.data?.message || err.message}`);
          // *** Rollback lại state cũ nếu API thất bại ***
          setCartItems(originalItems);
          console.log("[CartPage] Rolled back optimistic update due to API error.");
      } finally {
          setIsUpdating(false); // Tắt loading
      }
  };

  // 5. Thay Đổi Trạng Thái Chọn Sản Phẩm
  const handleToggleSelect = async (itemUniqueId) => {
    console.log(`[CartPage] handleToggleSelect called for ${itemUniqueId}`);

    // Kiểm tra đăng nhập
    if (!isAuthenticated || !user?.userId) {
      alert("Vui lòng đăng nhập để chọn sản phẩm.");
      return;
    }

    // Tìm item cần toggle
    const itemToToggleIndex = cartItems.findIndex(item => item.uniqueId === itemUniqueId);
    if (itemToToggleIndex === -1) {
      console.error("Cannot find item to toggle selection:", itemUniqueId);
      return;
    }
    const itemToToggle = cartItems[itemToToggleIndex];

    // Không cho toggle item bị lỗi
    if (itemToToggle.error) {
      alert(`Không thể chọn sản phẩm đang bị lỗi: ${itemToToggle.name}`);
      return;
    }

    // Xác định trạng thái chọn mới
    const newSelectedState = !itemToToggle.is_selected;
    console.log(`[CartPage] New selected state for ${itemUniqueId} will be: ${newSelectedState}`);

    // Optimistic Update cho UI (Để checkbox phản hồi ngay lập tức)
    const originalItems = [...cartItems];
    setCartItems(prevItems => {
        const newItems = [...prevItems];
        newItems[itemToToggleIndex] = { ...itemToToggle, is_selected: newSelectedState };
        return newItems;
    });
    console.log(`[CartPage] Optimistically updated is_selected to ${newSelectedState}`);


    setIsUpdating(true); // Bật loading

    // Chuẩn bị payload theo yêu cầu API update
    const payload = {
      userId: user.userId,
      productId: itemToToggle.productId,
      variantId: itemToToggle.variantId,
      isSelected: newSelectedState,           // *** Gửi trạng thái chọn MỚI ***
      quantity: 0,       // *** Gửi số lượng HIỆN TẠI *** (API yêu cầu)
    };
    console.log("[CartPage] Payload sent to update selection:", JSON.stringify(payload, null, 2));

    try {
      // Gọi API update
      await apiService.updateCartItem(payload);
      console.log(`[CartPage] API update selection successful for item ${itemUniqueId}.`);
      // Không cần fetch lại vì đã dùng optimistic update và tin API thành công

    } catch (err) {
      // Xử lý lỗi API
      console.error(`[CartPage] Error updating selection state for ${itemUniqueId}:`, err);
      alert(`Không thể cập nhật lựa chọn cho "${itemToToggle.name}". Phản hồi: ${err.response?.data?.message || err.message}`);
      // *** Rollback lại state cũ nếu API thất bại ***
      setCartItems(originalItems);
      console.log("[CartPage] Rolled back optimistic update for selection.");
    } finally {
       setIsUpdating(false); // Tắt loading
    }
  };

  // 6. Xóa Toàn Bộ Giỏ Hàng
  const handleClearCart = async () => {
    // Kiểm tra đăng nhập
    if (!isAuthenticated || !user?.userId) {
      alert("Vui lòng đăng nhập để thực hiện thao tác này.");
      return;
    }

    // Chỉ xóa nếu có item hợp lệ
    const itemsWithoutErrors = cartItems.filter(item => !item.error);
    if (itemsWithoutErrors.length === 0) {
      alert("Không có sản phẩm hợp lệ trong giỏ hàng để xóa.");
      return;
    }

    // Xác nhận lại với người dùng
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng không?")) {
      setIsUpdating(true); // Bật loading
      try {
        console.log("Attempting to clear cart...");
        // Gọi API xóa hết (giả định API này hoạt động với token user)
        await apiService.clearCart();
        setCartItems([]); // Xóa hết item trên state client
        console.log("Successfully cleared cart.");
      } catch (err) {
        console.error("Lỗi xóa hết giỏ hàng:", err);
        alert(`Không thể xóa giỏ hàng. Lỗi: ${err.response?.data?.message || err.message}`);
      } finally {
        setIsUpdating(false); // Tắt loading
      }
    }
  };

  // 7. Tiến Hành Đặt Hàng
  const handlePlaceOrder = () => { // Không cần async nữa nếu chỉ lưu và điều hướng
    // Kiểm tra đăng nhập
    if (!isAuthenticated || !user?.userId) {
      alert("Vui lòng đăng nhập để đặt hàng.");
      return;
    }

    // Lấy danh sách item hợp lệ và đã được chọn
    const itemsToOrder = cartItems.filter(item => item.is_selected && !item.error);
    if (itemsToOrder.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm hợp lệ để đặt hàng.");
      return;
    }

    // Kiểm tra tồn kho trước khi đặt (giữ nguyên)
    const outOfStockItems = itemsToOrder.filter(item => item.quantity > item.stockQuantity);
    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => `${item.name} - ${item.color} (Chỉ còn ${item.stockQuantity})`).join('\n - ');
      alert(`Một số sản phẩm đã chọn không đủ số lượng tồn kho:\n - ${itemNames}\nVui lòng điều chỉnh lại số lượng.`);
      return;
    }

    // Tính tổng tiền của các sản phẩm được chọn (có thể lấy từ state đã tính toán)
    // const selectedTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0); // Hoặc dùng state selectedTotal

    // *** LƯU DỮ LIỆU VÀO sessionStorage ***
    try {
        const orderData = {
            items: itemsToOrder, // Lưu mảng các sản phẩm đã chọn
            total: selectedTotal // Lưu tổng tiền đã tính
        };
        sessionStorage.setItem('pendingOrderData', JSON.stringify(orderData));
        console.log("Order data saved to sessionStorage:", orderData);

        // *** ĐIỀU HƯỚNG ĐẾN TRANG ĐẶT HÀNG ***
        navigate('/place-order');

    } catch (error) {
        console.error("Error saving order data to sessionStorage:", error);
        alert("Đã xảy ra lỗi khi chuẩn bị đặt hàng. Vui lòng thử lại.");
    }

    // // Bỏ phần gọi API createOrder ở đây, sẽ chuyển sang trang PlaceOrder
    // console.log("Attempting to create order with data:", orderData);
    // setIsUpdating(true); // Bật loading
    // try {
    //   // Gọi API tạo đơn hàng
    //   const response = await apiService.createOrder(orderData);
    //   console.log("API Create Order Response:", response);
    //   alert(`Đặt hàng thành công! Mã đơn hàng của bạn là: ${response.data?.orderId || 'N/A'}`);
    //   // Sau khi đặt hàng thành công, fetch lại giỏ hàng để xóa các item đã đặt
    //   await fetchAndEnrichCart();
    //   // Chuyển hướng đến trang cảm ơn hoặc lịch sử đơn hàng
    //   navigate('/order-success'); // Thay đổi đường dẫn nếu cần
    // } catch (err) {
    //   // Xử lý lỗi đặt hàng
    //   console.error("Lỗi đặt hàng:", err);
    //   alert(err.response?.data?.message || err.message || "Đặt hàng không thành công. Vui lòng thử lại.");
    // } finally {
    //   setIsUpdating(false); // Tắt loading
    // }
  };

  // --- Tính Toán Các Giá Trị Tổng Hợp (Dùng useMemo để tối ưu) ---
  // Lọc ra các item hợp lệ (không bị lỗi)
  const validCartItems = useMemo(() => cartItems.filter(item => !item.error), [cartItems]);
  // Lọc ra các item đã được chọn từ danh sách hợp lệ
  const selectedItems = useMemo(() => validCartItems.filter(item => item.is_selected), [validCartItems]);
  // Tính tổng tiền của các item đã chọn
  const selectedTotal = useMemo(() =>
      selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0), // Đảm bảo item.price là số
      [selectedItems]
  );
  // Đếm số lượng loại sản phẩm hợp lệ trong giỏ
  const cartItemCount = validCartItems.length;
  // Kiểm tra giỏ hàng có rỗng không (dựa trên số item hợp lệ)
  const isCartEmpty = cartItemCount === 0;
  // Kiểm tra có item nào được chọn không
  const hasSelectedItems = selectedItems.length > 0;

  // --- Render Giao Diện ---

  // 1. Trạng thái Loading chính
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" />
        <p>Đang tải giỏ hàng của bạn...</p>
      </div>
    );
  }

  // 2. Trạng thái chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div className={styles.cartPageContainer} style={{ textAlign: 'center', padding: '40px 20px' }}>
        <FaShoppingCart size={60} style={{ color: '#ccc', marginBottom: '20px'}} />
        <h2>Vui lòng đăng nhập</h2>
        <p>Bạn cần đăng nhập để xem giỏ hàng và tiếp tục mua sắm.</p>
        <Link to="/login">
          <Button variant="primary" className={styles.loginButton}>Đăng nhập ngay</Button> {/* Thêm class nếu cần style riêng */}
        </Link>
      </div>
    );
  }

  // 3. Trạng thái lỗi nghiêm trọng (không load được giỏ hàng)
  if (error && cartItems.length === 0) {
    return (
      <div className={`${styles.cartPageContainer} ${styles.errorContainer}`}>
         <FaExclamationTriangle size={50} />
         <h2>Rất tiếc, đã xảy ra lỗi</h2>
         <p>{error}</p>
         <Button variant="secondary" onClick={fetchAndEnrichCart}>Thử tải lại trang</Button>
      </div>
    );
  }

  // 4. Giao diện chính của trang giỏ hàng
  return (
    <div className={styles.cartPageContainer}>
      {/* Tiêu đề trang */}
      <h1 className={styles.pageTitle}>
        <FaShoppingCart /> Giỏ Hàng Của Bạn {cartItemCount > 0 && `(${cartItemCount})`}
      </h1>

      {/* Hiển thị lỗi nhỏ nếu có (ví dụ: lỗi fetch 1 sản phẩm) */}
      {error && cartItems.length > 0 && (
          <div className={styles.generalError}>
             <FaInfoCircle /> {error} - Một số thông tin sản phẩm có thể chưa được cập nhật.
          </div>
      )}

      

      {/* Nội dung chính: Giỏ hàng trống hoặc bảng sản phẩm */}
      {isCartEmpty && !isLoading ? (
         // Giao diện khi giỏ hàng trống
        <div className={styles.emptyCart}>
          <FaShoppingCart size={80} />
          <h2>Giỏ hàng của bạn hiện đang trống</h2>
          <p>Hãy bắt đầu khám phá và thêm những sản phẩm yêu thích vào giỏ nhé!</p>
          <Link to="/"> {/* Link về trang chủ hoặc trang sản phẩm */}
            <Button variant="primary">Bắt đầu mua sắm</Button>
          </Link>
        </div>
      ) : (
         // Giao diện khi có sản phẩm
        <div className={styles.cartContent}>
          {/* Bảng danh sách sản phẩm */}
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
                {/* Lặp qua danh sách cartItems để render từng CartItem */}
                {cartItems.map((item) => (
                  <CartItem
                    key={item.uniqueId} // Key duy nhất cho mỗi hàng
                    item={item}         // Truyền toàn bộ dữ liệu item đã làm giàu
                    // Truyền các hàm xử lý hành động, trỏ đến hàm mở modal cho nút xóa
                    onRemove={() => promptRemoveItem(item.uniqueId)}
                    onQuantityChange={handleQuantityChange}
                    onToggleSelect={handleToggleSelect}
                    isUpdating={isUpdating} // Truyền trạng thái đang cập nhật
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Phần tóm tắt và thanh toán */}
          <div className={styles.cartSummary}>
            <h3 className={styles.summaryTitle}>Tổng cộng</h3>
             <div className={styles.summaryDetails}>
                 {/* Hiển thị thông tin tổng hợp */}
                 <div className={styles.summaryRow}>
                    <span>Số loại sản phẩm:</span>
                    <span>{cartItemCount}</span>
                 </div>
                 <div className={styles.summaryRow}>
                    <span>Số sản phẩm đã chọn:</span>
                    <span>{selectedItems.length} / {cartItemCount}</span>
                 </div>
                 <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
                    <span>Tổng tiền tạm tính:</span>
                    <span className={styles.totalAmountValue}>{formatCurrency(selectedTotal)}</span>
                 </div>
                 <p className={styles.vatNote}>(Giá đã bao gồm VAT nếu có)</p>
             </div>

             {/* Các nút hành động */}
            <div className={styles.cartActions}>
              {/* Nút Xóa Hết */}
              <Button
                variant="secondary" // Đổi thành secondary cho phù hợp style mới
                outline // Giữ outline nếu muốn
                onClick={handleClearCart}
                disabled={isCartEmpty || isUpdating} // Disable khi giỏ trống hoặc đang xử lý
                className={styles.clearCartButton}
              >
                <FaTrash /> Xóa tất cả
              </Button>
              {/* Nút Đặt Hàng */}
              <Button
                variant="primary"
                onClick={handlePlaceOrder}
                // Disable khi không có item nào được chọn hoặc đang xử lý
                disabled={!hasSelectedItems || isUpdating}
                className={styles.checkoutButton}
              >
                 {/* Hiển thị Spinner hoặc text tùy trạng thái */}
                 {`Đặt Hàng (${selectedItems.length})`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Render Modal Xác Nhận (luôn render nhưng chỉ hiển thị khi isOpen={true}) */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}        // Hàm xử lý khi bấm nút Hủy hoặc click ra ngoài
        onConfirm={handleConfirmRemove}   // Hàm xử lý khi bấm nút Xác nhận
        title="Xác nhận thao tác"         // Tiêu đề modal
        // Thông điệp hiển thị tên sản phẩm và màu sắc (nếu có)
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${itemToRemove?.name}${itemToRemove?.color ? ` - ${itemToRemove.color}` : ''}" khỏi giỏ hàng không?`}
        confirmText="Xóa sản phẩm"        // Text nút xác nhận
        cancelText="Không xóa"            // Text nút hủy
      />
    </div>
  );
};

export default CartPage; // Xuất component để sử dụng