// src/pages/VNPayReturn/VNPayReturn.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styles from './VNPayReturn.module.css'; // Create this CSS module
import apiService from '../../services/api'; // Ensure correct path
import Spinner from '../../components/Spinner/Spinner'; // Ensure correct path
import Button from '../../components/Button/Button'; // Ensure correct path
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

// Helper Function to format VNPAY Date (YYYYMMDDHHmmss)
const formatVnpayDate = (vnpDateString) => {
    if (!vnpDateString || vnpDateString.length !== 14) { return 'N/A'; }
    try {
        const year = vnpDateString.substring(0, 4);
        const month = vnpDateString.substring(4, 6);
        const day = vnpDateString.substring(6, 8);
        const hour = vnpDateString.substring(8, 10);
        const minute = vnpDateString.substring(10, 12);
        const second = vnpDateString.substring(12, 14);
        const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
        if (isNaN(date.getTime())) return 'Ngày không hợp lệ';
        return date.toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch (e) { console.error("Error formatting VNPAY date:", e); return 'N/A'; }
};

// Helper Function to format Currency
const formatCurrency = (amount) => {
    const actualAmount = Number(amount) / 100;
    if (typeof actualAmount !== 'number' || isNaN(actualAmount)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(actualAmount);
};

// Helper Function to calculate total (same as in PlaceOrder)
const calculateTotalFromItems = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        return sum + (price * quantity);
    }, 0);
};


const VNPayReturn = () => {
    useEffect(() => {
            document.title = "Kết quả đặt hàng | HustShop";
        }, []);
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('PENDING'); // PENDING, PROCESSING_ORDER, SUCCESS, FAILED
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [createdOrder, setCreatedOrder] = useState(null);
    // *** ADDED STATE: Guard flag to prevent duplicate order creation attempts ***
    const [orderCreationAttempted, setOrderCreationAttempted] = useState(false);

    const processVNPayReturn = useCallback(async () => {
        // Avoid double processing if already started within this component instance
        // Note: This doesn't prevent issues if the whole component unmounts/remounts quickly,
        // but combined with the check before API call, it adds robustness.
        // if (paymentStatus !== 'PENDING') {
        //     console.log("processVNPayReturn called but status is not PENDING, skipping.");
        //     return;
        // }

        setIsLoading(true);
        setError(null);
        // setPaymentStatus('PENDING'); // Keep initial state until determination
        setTransactionDetails(null);
        setCreatedOrder(null);
        // setOrderCreationAttempted(false); // Reset attempt flag on each process run? Maybe not needed if component fully remounts.

        console.log("Processing VNPAY Return...");

        // --- 1. Parse Query Parameters ---
        const queryParams = new URLSearchParams(location.search);
        const vnp_ResponseCode = queryParams.get('vnp_ResponseCode');
        const vnp_Amount = queryParams.get('vnp_Amount');
        const vnp_PayDate = queryParams.get('vnp_PayDate');
        const vnp_TransactionNo = queryParams.get('vnp_TransactionNo');
        const vnp_TxnRef = queryParams.get('vnp_TxnRef');
        const vnp_BankCode = queryParams.get('vnp_BankCode');
        const vnp_BankTranNo = queryParams.get('vnp_BankTranNo');
        const vnp_CardType = queryParams.get('vnp_CardType');
        const vnp_OrderInfo = queryParams.get('vnp_OrderInfo');

        const details = { vnp_ResponseCode, vnp_Amount, vnp_PayDate, vnp_TransactionNo, vnp_TxnRef, vnp_BankCode, vnp_BankTranNo, vnp_CardType, vnp_OrderInfo };
        setTransactionDetails(details);
        console.log("VNPAY Return Params:", details);

        // --- 2. Check VNPAY Payment Status ---
        if (vnp_ResponseCode === '00') {
            console.log("VNPAY payment reported as successful (Code 00).");

            // --- Retrieve Saved Order Data (Only if order creation hasn't been attempted yet) ---
            // This check is crucial if the effect runs multiple times quickly
            if (orderCreationAttempted) {
                console.warn("Order creation already attempted for this callback instance. Skipping.");
                // Potentially update status if needed, but avoid duplicate API calls
                // You might want to check if createdOrder already exists from the previous attempt
                setIsLoading(false); // Stop loading as we are not proceeding
                return;
            }

            const savedDataString = sessionStorage.getItem('savedShippingInfo');
            // If no saved data, we cannot create the order, even if VNPAY was successful
            if (!savedDataString) {
                console.error("VNPAY success (Code 00), but no saved order data found in SessionStorage!");
                setError("Lỗi nghiêm trọng: Thanh toán thành công nhưng không tìm thấy thông tin đơn hàng để hoàn tất. Vui lòng liên hệ hỗ trợ.");
                setPaymentStatus('FAILED'); // Treat as failure since order cannot be created
                setIsLoading(false);
                return;
            }

            let savedData;
            try {
                savedData = JSON.parse(savedDataString);
                if (!savedData || typeof savedData !== 'object' || !Array.isArray(savedData.orderItems) || savedData.orderItems.length === 0 || typeof savedData.shippingFee !== 'number' || !savedData.provinceName || !savedData.districtFullName || !savedData.wardFullName || !savedData.detailedAddress || !savedData.phone || !savedData.email || !savedData.shippingMethod) {
                    throw new Error("Dữ liệu đơn hàng lưu trữ không đầy đủ hoặc không hợp lệ.");
                }
                console.log("Retrieved and validated saved order data.");

            } catch (e) {
                console.error("Fatal Error parsing/validating saved data after VNPAY success:", e);
                setError("Lỗi đọc dữ liệu đơn hàng đã lưu. Liên hệ hỗ trợ với Mã GD VNPAY.");
                setPaymentStatus('FAILED'); setIsLoading(false); return;
            }

            // --- Set Intermediate Status & Attempt Flag ---
            setPaymentStatus('PROCESSING_ORDER');
            // *** SET GUARD FLAG: Mark that we are now attempting order creation ***
            setOrderCreationAttempted(true);
            console.log("Order creation attempt flag set to true.");


            // --- Prepare Data for createOrder API ---
            const savedSubtotal = calculateTotalFromItems(savedData.orderItems);
            const savedVat = savedSubtotal * 0.10;
            const expectedTotal = savedSubtotal + savedData.shippingFee + savedVat;
            const vnpAmountValue = Number(vnp_Amount) / 100;
            if (Math.round(expectedTotal) !== Math.round(vnpAmountValue)) {
                console.warn(`Amount mismatch! Expected: ${expectedTotal}, VNPAY: ${vnpAmountValue}`);
                // Don't set error here anymore, maybe log it or handle differently if needed
                // setError(`Cảnh báo: Số tiền thanh toán (${formatCurrency(vnp_Amount)}) không khớp.`);
            }
            const fullAddressForFinalOrder = `${savedData.detailedAddress}, ${savedData.wardFullName}, ${savedData.districtFullName}, ${savedData.provinceName}`;
            const finalOrderData = {
                shippingAddress: fullAddressForFinalOrder, paymentMethod: "VNPAY", deliveryMethod: savedData.shippingMethod,
                shippingFee: savedData.shippingFee,
                note: savedData.notes || '', items: savedData.orderItems.map(item => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity })),
                vnpTransactionNo: vnp_TransactionNo, vnpTxnRef: vnp_TxnRef, vnpPayDate: vnp_PayDate, vnpAmount: vnpAmountValue,
            };

            // --- Call createOrder API ---
            try {
                console.log("Calling /order/create API now...");
                const response = await apiService.createOrder(finalOrderData);
                console.log("Backend Create Order Response:", response);

                if(response && response.data && response.data.orderId !== undefined){
                   setCreatedOrder(response.data);
                   setPaymentStatus('SUCCESS');
                   console.log("Order successfully created. Order ID:", response.data.orderId);
                   sessionStorage.removeItem('savedShippingInfo'); // Clear on SUCCESS
                   sessionStorage.removeItem('pendingOrderData');
                   console.log("Cleared saved session data.");
                } else {
                    console.error("Backend /order/create response missing expected data:", response?.data);
                    throw new Error("Phản hồi tạo đơn hàng từ máy chủ không hợp lệ.");
                }
            } catch (createOrderError) {
                console.error("Error calling /order/create API:", createOrderError.response?.data || createOrderError.message);
                setError(`Thanh toán VNPAY thành công, nhưng lỗi khi tạo đơn hàng (${createOrderError.response?.data?.message || createOrderError.message}). Liên hệ hỗ trợ với Mã GD VNPAY: ${vnp_TransactionNo}`);
                setPaymentStatus('FAILED');
                // DO NOT clear session storage here if backend failed
            }
        } else {
            // --- VNPAY Payment Failed ---
            console.warn(`VNPAY payment failed or cancelled. Response Code: ${vnp_ResponseCode}`);
            let failureReason = `Mã lỗi VNPAY: ${vnp_ResponseCode}`;
            if (vnp_ResponseCode === '24') failureReason = "Giao dịch VNPAY bị hủy bởi người dùng.";
            setError(`Thanh toán qua VNPAY không thành công. ${failureReason}`);
            setPaymentStatus('FAILED');
            sessionStorage.removeItem('savedShippingInfo'); // Clear on payment failure
            sessionStorage.removeItem('pendingOrderData');
            console.log("Cleared saved session data due to failed VNPAY transaction.");
        }
        setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, orderCreationAttempted]); // Added orderCreationAttempted dependency

    // Run the processing logic once when the component mounts OR when the attempt flag changes (safety)
    useEffect(() => {
        // Only process if the attempt hasn't been made yet for this mount/instance
        // This check inside useEffect combined with the one inside the callback adds layers of protection
        if (!orderCreationAttempted) {
            processVNPayReturn();
        } else {
            console.log("useEffect triggered, but orderCreationAttempted is true, skipping processVNPayReturn call.");
            // If already attempted, ensure loading is off (might happen on fast re-renders)
            if(isLoading) setIsLoading(false);
        }
    }, [processVNPayReturn, orderCreationAttempted, isLoading]);


    // --- Render Logic ---
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className={styles.loadingContainer}>
                    <Spinner size="large" />
                    <p>Đang xử lý kết quả thanh toán VNPAY...</p>
                </div>
            );
        }

        // SUCCESS State
        if (paymentStatus === 'SUCCESS') {
            return (
                <div className={`${styles.resultContainer} ${styles.success}`}>
                    <FaCheckCircle size={50} className={styles.icon} />
                    <h2>Thanh toán thành công!</h2>
                    <p>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được tạo.</p>
                    {createdOrder && createdOrder.orderId !== undefined && (
                        <p>Mã đơn hàng của bạn: <strong>{createdOrder.orderId}</strong></p>
                    )}
                    {transactionDetails && (
                        <div className={styles.transactionDetails}>
                            <h4>Chi tiết giao dịch VNPAY</h4>
                            <p>Mã giao dịch VNPAY: <strong>{transactionDetails.vnp_TransactionNo || 'N/A'}</strong></p>
                            <p>Số tiền đã thanh toán: <strong>{formatCurrency(transactionDetails.vnp_Amount)}</strong></p>
                            <p>Thời gian thanh toán: <strong>{formatVnpayDate(transactionDetails.vnp_PayDate)}</strong></p>
                            {transactionDetails.vnp_BankCode && <p>Ngân hàng: <strong>{transactionDetails.vnp_BankCode}</strong></p>}
                        </div>
                    )}
                    <div className={styles.actions}>
                        <Link to="/"><Button variant="primary">Về trang chủ</Button></Link>
                        {createdOrder && createdOrder.orderId !== undefined ? (
                             <Link to={`/profile/orders/${createdOrder.orderId}`}><Button variant="secondary">Xem chi tiết đơn hàng</Button></Link>
                        ) : (
                             <Link to="/profile/orders"><Button variant="secondary">Xem lịch sử đơn hàng</Button></Link>
                        )}
                    </div>
                </div>
            );
        }

        // PROCESSING_ORDER State (Intermediate)
        if (paymentStatus === 'PROCESSING_ORDER') {
             return (
                <div className={styles.loadingContainer}>
                    <Spinner size="large" />
                    <p>Thanh toán VNPAY thành công. Đang tạo đơn hàng trong hệ thống...</p>
                    {/* You could potentially show VNPAY details here already if desired */}
                </div>
             );
        }

        // FAILED State (Covers VNPAY failure and backend failure)
        if (paymentStatus === 'FAILED') {
            return (
                <div className={`${styles.resultContainer} ${styles.failed}`}>
                    <FaTimesCircle size={50} className={styles.icon} />
                    <h2>Giao dịch không thành công</h2>
                    {error ? (<p className={styles.errorMessage}>{error}</p>) : (<p>Đã xảy ra lỗi trong quá trình thanh toán hoặc tạo đơn hàng.</p>)}
                    {transactionDetails && transactionDetails.vnp_TransactionNo && ( <p>Nếu đã bị trừ tiền, liên hệ hỗ trợ với Mã GD VNPAY: <strong>{transactionDetails.vnp_TransactionNo}</strong></p> )}
                    <div className={styles.actions}>
                        <Link to="/cart"><Button variant="secondary">Quay lại giỏ hàng</Button></Link> {/* Changed button text */}
                        <Link to="/"><Button variant="primary">Về trang chủ</Button></Link>
                    </div>
                </div>
            );
        }

        // Fallback for PENDING (after initial load) or unexpected states
        return (
             <div className={`${styles.resultContainer} ${styles.failed}`}>
                 <FaExclamationTriangle size={50} className={styles.icon} />
                 <h2>Trạng thái không xác định</h2>
                 <p>Không thể xác định trạng thái thanh toán cuối cùng. Vui lòng kiểm tra lại đơn hàng của bạn hoặc liên hệ bộ phận hỗ trợ.</p>
                  {transactionDetails && transactionDetails.vnp_TransactionNo && (
                     <p>Mã giao dịch VNPAY (nếu có): <strong>{transactionDetails.vnp_TransactionNo}</strong></p>
                  )}
                  <div className={styles.actions}>
                       <Link to="/profile/orders"><Button variant="secondary">Kiểm tra đơn hàng</Button></Link>
                       <Link to="/"><Button variant="primary">Về trang chủ</Button></Link>
                   </div>
             </div>
        );
    };

    return (
        <div className={styles.vnPayReturnPage}>
            {renderContent()}
        </div>
    );
};

export default VNPayReturn;