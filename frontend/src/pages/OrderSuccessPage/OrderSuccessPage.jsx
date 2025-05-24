// src/pages/OrderSuccessPage/OrderSuccessPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './OrderSuccessPage.module.css'; // Create this CSS module
import apiService from '../../services/api'; // Ensure correct path
import Spinner from '../../components/Spinner/Spinner'; // Ensure correct path
import Button from '../../components/Button/Button'; // Ensure correct path
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

// Helper Function to format Currency
const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Helper Function to calculate total (Subtotal + Shipping + VAT)
const calculateGrandTotal = (items, shippingFee) => {
    const subtotal = items.reduce((sum, item) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        return sum + (price * quantity);
    }, 0);
    const vat = subtotal * 0.10; // Assuming 10% VAT on subtotal
    const fee = typeof shippingFee === 'number' ? shippingFee : 0;
    return subtotal + fee + vat;
};

const OrderSuccessPage = () => {
    useEffect(() => {
        document.title = "Đặt hàng thành công | HustShop";
    }, []);

    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [attemptedCreation, setAttemptedCreation] = useState(false); // Guard to prevent multiple calls

    const processOrderCreation = useCallback(async () => {
        // Only process if not already attempted and user is authenticated
        if (attemptedCreation || !isAuthenticated || !user?.userId) {
             if (!isAuthenticated || !user?.userId) {
                 console.warn("User not authenticated or userId missing. Cannot process COD order.");
                 setError("Vui lòng đăng nhập để hoàn tất đơn hàng.");
             } else {
                 console.warn("processOrderCreation called but already attempted or missing user info, skipping.");
             }
             setIsLoading(false);
             return;
        }

        setAttemptedCreation(true); // Mark as attempted
        setIsLoading(true);
        setError(null);

        console.log("Attempting to process COD order creation...");

        // --- Retrieve Saved Order Data from localStorage ---
        const savedDataString = localStorage.getItem('savedShippingInfo');

        // If no saved data, we cannot create the order
        if (!savedDataString) {
            console.error("No saved order data found in localStorage for COD order creation!");
            setError("Không tìm thấy thông tin đơn hàng đã lưu. Vui lòng đặt lại.");
            setIsLoading(false);
            // Clear potential stale data and redirect
            localStorage.removeItem('savedShippingInfo');
            localStorage.removeItem('pendingOrderData');
            // Optionally redirect back to cart or home after a delay
             setTimeout(() => navigate('/cart', { replace: true }), 3000);
            return;
        }

        let savedData;
        try {
            savedData = JSON.parse(savedDataString);
            // Basic validation of critical fields
            if (!savedData || typeof savedData !== 'object' || !Array.isArray(savedData.orderItems) || savedData.orderItems.length === 0 || typeof savedData.shippingFee !== 'number' || !savedData.provinceName || !savedData.districtFullName || !savedData.wardFullName || !savedData.detailedAddress || !savedData.phone || !savedData.email || !savedData.shippingMethod) {
                throw new Error("Dữ liệu đơn hàng lưu trữ không đầy đủ hoặc không hợp lệ.");
            }
            console.log("Retrieved and validated saved order data from localStorage for COD.");

        } catch (e) {
            console.error("Fatal Error parsing/validating saved data from localStorage for COD:", e);
            setError("Lỗi đọc dữ liệu đơn hàng đã lưu. Vui lòng đặt lại.");
            setIsLoading(false);
            // Clear bad data and redirect
            localStorage.removeItem('savedShippingInfo');
            localStorage.removeItem('pendingOrderData');
             setTimeout(() => navigate('/cart', { replace: true }), 3000);
            return;
        }

        // --- Prepare Data for createOrder API ---
        // For COD, we typically send the Grand Total to the backend
        const savedSubtotal = calculateGrandTotal(savedData.orderItems, 0); // Calculate subtotal first
        const expectedGrandTotal = calculateGrandTotal(savedData.orderItems, savedData.shippingFee); // Calculate Grand Total

        const fullAddressForFinalOrder = `${savedData.detailedAddress}, ${savedData.wardFullName}, ${savedData.districtFullName}, ${savedData.provinceName}`;

        // --- Construct the payload for the backend API ---
        const finalOrderData = {
            shippingAddress: fullAddressForFinalOrder,
            paymentMethod: "CASH", // Payment method used
            deliveryMethod: savedData.shippingMethod,
            note: savedData.notes || '',
            items: savedData.orderItems.map(item => ({ // Map items to required structure
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity
            })),

            // --- Fields required by your backend API ---
            // Use the raw shipping fee value
            shippingFee: savedData.shippingFee,
            userId: user.userId, // Include user ID from auth context
             // Send the Grand Total for COD
            totalAmount: Math.round(expectedGrandTotal), // Sending rounded grand total for COD

            // No VNPAY specific fields needed for COD
        };

        console.log("Calling /order/create API with payload for COD:", finalOrderData);

        // --- Call createOrder API ---
        try {
            const response = await apiService.createOrder(finalOrderData);
            console.log("Backend Create Order Response (COD):", response);

            // Validate backend response
            if(response && response.data && response.data.orderId !== undefined){
               setCreatedOrder(response.data);
               setIsLoading(false);
               console.log("Order successfully created (COD). Order ID:", response.data.orderId);
               // Clear localStorage ONLY on successful backend order creation
               localStorage.removeItem('savedShippingInfo');
               localStorage.removeItem('pendingOrderData');
               console.log("Cleared saved localStorage data after COD success.");
            } else {
                console.error("Backend /order/create response missing expected data:", response?.data);
                throw new Error("Phản hồi tạo đơn hàng từ máy chủ không hợp lệ.");
            }
        } catch (createOrderError) {
            console.error("Error calling /order/create API for COD:", createOrderError.response?.data || createOrderError.message);
            // Set error message
            const backendErrorMessage = createOrderError.response?.data?.message || createOrderError.message;
            setError(`Đặt hàng không thành công (${backendErrorMessage}). Vui lòng thử lại.`);
            setIsLoading(false);
            // DO NOT clear localStorage here if backend failed - keep it for support/retry logic if needed
            // localStorage.removeItem('savedShippingInfo');
            // localStorage.removeItem('pendingOrderData');
        }
    }, [attemptedCreation, isAuthenticated, user?.userId, navigate, apiService, calculateGrandTotal]); // Added calculateGrandTotal

    // Effect to trigger the processing logic
    useEffect(() => {
        // Trigger processing only once on mount and if user is authenticated/loaded
        if (!attemptedCreation && isAuthenticated && user?.userId) {
            processOrderCreation();
        } else if (!isAuthenticated || !user?.userId) {
            // If auth missing on mount and not already attempted, show error
            if (!attemptedCreation) {
                 setIsLoading(false);
                 setError("Vui lòng đăng nhập để hoàn tất đơn hàng.");
            }
        }
         // If already attempted, just ensure loading is off on re-renders
         if(attemptedCreation && isLoading && (error || createdOrder)){
              setIsLoading(false);
         }


    }, [processOrderCreation, attemptedCreation, isAuthenticated, user?.userId, isLoading, error, createdOrder]);


    // --- Render Logic ---
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className={styles.loadingContainer}>
                    <Spinner size="large" />
                    <p>Đang xử lý đơn hàng của bạn...</p>
                </div>
            );
        }

        // SUCCESS State
        if (createdOrder && createdOrder.orderId !== undefined) {
            // Recalculate grand total for display from the data *if* needed,
            // or rely on backend returning it in `createdOrder`.
            // Assuming backend might return relevant details, but if not,
            // we could reload `savedShippingInfo` to calculate.
            // For simplicity here, display basic success info + Order ID.
            // If you need detailed summary, retrieve savedDataString again here.

            return (
                <div className={`${styles.resultContainer} ${styles.success}`}>
                    <FaCheckCircle size={50} className={styles.icon} />
                    <h2>Đặt hàng thành công!</h2>
                    <p>Cảm ơn bạn đã mua hàng. Đơn hàng COD của bạn đã được tạo.</p>
                    <p>Mã đơn hàng của bạn: <strong>{createdOrder.orderId}</strong></p>
                    {/* Optionally display total or other details if returned by API */}
                    {/* createdOrder.totalAmount might be available from API response */}
                     {createdOrder.totalAmount !== undefined && (
                         <p>Tổng tiền (ước tính): <strong>{formatCurrency(createdOrder.totalAmount)}</strong></p>
                     )}

                    <div className={styles.actions}>
                        <Link to="/"><Button variant="primary">Về trang chủ</Button></Link>
                         <Link to={`/profile/orders`}><Button variant="secondary">Xem chi tiết đơn hàng</Button></Link>
                    </div>
                </div>
            );
        }

        // FAILED State
        if (error) {
            return (
                <div className={`${styles.resultContainer} ${styles.failed}`}>
                    <FaTimesCircle size={50} className={styles.icon} />
                    <h2>Đặt hàng không thành công</h2>
                    <p className={styles.errorMessage}>{error}</p>
                     <p>Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ nếu vấn đề tái diễn.</p>
                    <div className={styles.actions}>
                        <Link to="/cart"><Button variant="secondary">Quay lại giỏ hàng</Button></Link>
                        <Link to="/"><Button variant="primary">Về trang chủ</Button></Link>
                    </div>
                </div>
            );
        }

         // Fallback state (e.g., redirect without data, or other unexpected scenarios)
         return (
              <div className={`${styles.resultContainer} ${styles.warning}`}>
                  <FaExclamationTriangle size={50} className={styles.icon} />
                  <h2>Trạng thái đơn hàng không xác định</h2>
                  <p>Không thể xác định trạng thái đơn hàng cuối cùng. Vui lòng kiểm tra lại lịch sử đơn hàng của bạn.</p>
                   <div className={styles.actions}>
                       <Link to="/profile/orders"><Button variant="secondary">Kiểm tra đơn hàng</Button></Link>
                       <Link to="/"><Button variant="primary">Về trang chủ</Button></Link>
                   </div>
              </div>
         );
    };

    return (
        <div className={styles.orderSuccessPageContainer}>
            {renderContent()}
        </div>
    );
};

export default OrderSuccessPage;