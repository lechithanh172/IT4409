
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import styles from './VNPayReturn.module.css';
import apiService from '../../services/api';
import Spinner from '../../components/Spinner/Spinner';
import Button from '../../components/Button/Button';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';


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


const formatCurrency = (amount) => {


    const actualAmount = Number(amount) / 100;
    if (typeof actualAmount !== 'number' || isNaN(actualAmount)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(actualAmount);
};


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
    const { user, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('PENDING');
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [createdOrder, setCreatedOrder] = useState(null);

    const [orderCreationAttempted, setOrderCreationAttempted] = useState(false);

    const processVNPayReturn = useCallback(async () => {


        if (orderCreationAttempted || !isAuthenticated || !user?.userId) {
             if (!isAuthenticated || !user?.userId) {
                 console.warn("User not authenticated or userId missing. Cannot process VNPAY return.");
                 setError("Vui lòng đăng nhập để hoàn tất đơn hàng.");
                 setIsLoading(false);
                 setPaymentStatus('FAILED');
             } else {
                 console.warn("processVNPayReturn called but order creation already attempted, skipping.");


                 if(isLoading) setIsLoading(false);
             }
            return;
        }

        setIsLoading(true);
        setError(null);

        setTransactionDetails(null);
        setCreatedOrder(null);

        console.log("Processing VNPAY Return...");


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


        if (vnp_ResponseCode === '00') {
            console.log("VNPAY payment reported as successful (Code 00).");


            const savedDataString = localStorage.getItem('savedShippingInfo');


            if (!savedDataString) {
                console.error("VNPAY success (Code 00), but no saved order data found in localStorage!");
                setError("Lỗi nghiêm trọng: Thanh toán thành công nhưng không tìm thấy thông tin đơn hàng để hoàn tất. Vui lòng liên hệ hỗ trợ.");
                setPaymentStatus('FAILED');
                setIsLoading(false);

                localStorage.removeItem('savedShippingInfo');
                localStorage.removeItem('pendingOrderData');
                return;
            }

            let savedData;
            try {
                savedData = JSON.parse(savedDataString);

                if (!savedData || typeof savedData !== 'object' || !Array.isArray(savedData.orderItems) || savedData.orderItems.length === 0 || typeof savedData.shippingFee !== 'number' || !savedData.provinceName || !savedData.districtFullName || !savedData.wardFullName || !savedData.detailedAddress || !savedData.phone || !savedData.email || !savedData.shippingMethod) {
                    throw new Error("Dữ liệu đơn hàng lưu trữ không đầy đủ hoặc không hợp lệ.");
                }
                console.log("Retrieved and validated saved order data from localStorage.");

            } catch (e) {
                console.error("Fatal Error parsing/validating saved data after VNPAY success from localStorage:", e);
                setError("Lỗi đọc dữ liệu đơn hàng đã lưu. Liên hệ hỗ trợ với Mã GD VNPAY.");
                setPaymentStatus('FAILED'); setIsLoading(false);

                localStorage.removeItem('savedShippingInfo');
                localStorage.removeItem('pendingOrderData');
                return;
            }


            setPaymentStatus('PROCESSING_ORDER');

            setOrderCreationAttempted(true);
            console.log("Order creation attempt flag set to true.");


            const savedSubtotal = calculateTotalFromItems(savedData.orderItems);




            const vnpAmountValue = Number(vnp_Amount) / 100;








            console.log(`Saved Subtotal: ${savedSubtotal}, Saved Shipping Fee: ${savedData.shippingFee}, VNPAY Amount: ${vnpAmountValue}`);


            const fullAddressForFinalOrder = `${savedData.detailedAddress}, ${savedData.wardFullName}, ${savedData.districtFullName}, ${savedData.provinceName}`;


            const finalOrderData = {
                shippingAddress: fullAddressForFinalOrder,
                paymentMethod: "VNPAY",
                deliveryMethod: savedData.shippingMethod,
                note: savedData.notes || '',
                items: savedData.orderItems.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity
                })),



                shippingFee: savedData.shippingFee,
                userId: user.userId,

                totalAmount: vnpAmountValue - savedData.shippingFee,


                vnpTransactionNo: vnp_TransactionNo,
                vnpTxnRef: vnp_TxnRef,
                vnpPayDate: vnp_PayDate,
                vnpAmount: vnpAmountValue,

                vnpBankCode: vnp_BankCode,
                vnpCardType: vnp_CardType,
                vnpOrderInfo: vnp_OrderInfo,

            };

            console.log("Calling /order/create API with payload:", finalOrderData);


            try {
                const response = await apiService.createOrder(finalOrderData);
                console.log("Backend Create Order Response:", response);


                if(response && response.data && response.data.orderId !== undefined){
                   setCreatedOrder(response.data);
                   setPaymentStatus('SUCCESS');
                   console.log("Order successfully created. Order ID:", response.data.orderId);

                   localStorage.removeItem('savedShippingInfo');
                   localStorage.removeItem('pendingOrderData');
                   console.log("Cleared saved localStorage data.");
                } else {
                    console.error("Backend /order/create response missing expected data:", response?.data);
                    throw new Error("Phản hồi tạo đơn hàng từ máy chủ không hợp lệ.");
                }
            } catch (createOrderError) {
                console.error("Error calling /order/create API:", createOrderError.response?.data || createOrderError.message);

                const backendErrorMessage = createOrderError.response?.data?.message || createOrderError.message;
                setError(`Thanh toán VNPAY thành công, nhưng lỗi khi tạo đơn hàng (${backendErrorMessage}). Vui lòng liên hệ hỗ trợ với Mã GD VNPAY: ${vnp_TransactionNo}`);
                setPaymentStatus('FAILED');



            }
        } else {

            console.warn(`VNPAY payment failed or cancelled. Response Code: ${vnp_ResponseCode}`);
            let failureReason = `Mã lỗi VNPAY: ${vnp_ResponseCode}`;

            if (vnp_ResponseCode === '24') failureReason = "Giao dịch bị hủy bởi người dùng.";
            else if (vnp_ResponseCode === '01') failureReason = "Ngân hàng từ chối cấp tín dụng.";
            else if (vnp_ResponseCode === '07') failureReason = "Trừ tiền thành công. Giao dịch bị nghi ngờ gian lận.";
            else if (vnp_ResponseCode === '09') failureReason = "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.";
            else if (vnp_ResponseCode === '10') failureReason = "Giao dịch không thành công do: Khách hàng xác thực sai mật khẩu giao dịch quá số lần cho phép.";
            else if (vnp_ResponseCode === '11') failureReason = "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.";
            else if (vnp_ResponseCode === '12') failureReason = "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.";
            else if (vnp_ResponseCode === '13') failureReason = "Giao dịch không thành công do: Sai số tiền thanh toán. Vui lòng nhập lại số tiền.";


            setError(`Thanh toán qua VNPAY không thành công. ${failureReason}`);
            setPaymentStatus('FAILED');

            localStorage.removeItem('savedShippingInfo');
            localStorage.removeItem('pendingOrderData');
            console.log("Cleared saved localStorage data due to failed VNPAY transaction.");
        }
        setIsLoading(false);
    }, [location.search, orderCreationAttempted, isAuthenticated, user?.userId, calculateTotalFromItems, apiService]);


    useEffect(() => {

        if (!orderCreationAttempted && isAuthenticated && user?.userId) {
            processVNPayReturn();
        } else if (!isAuthenticated || !user?.userId) {

             if (isLoading) setIsLoading(false);
             if (!error) setError("Vui lòng đăng nhập để hoàn tất đơn hàng.");
             if (paymentStatus === 'PENDING') setPaymentStatus('FAILED');
        } else {

            if(isLoading) setIsLoading(false);
        }
    }, [processVNPayReturn, orderCreationAttempted, isAuthenticated, user?.userId, isLoading, error, paymentStatus]);



    const renderContent = () => {
        if (isLoading) {
            return (
                <div className={styles.loadingContainer}>
                    <Spinner size="large" />
                    <p>Đang xử lý kết quả thanh toán VNPAY...</p>
                </div>
            );
        }


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
                             <Link to={`/profile/orders`}><Button variant="secondary">Xem chi tiết đơn hàng</Button></Link>
                        ) : (

                             <Link to="/profile/orders"><Button variant="secondary">Xem lịch sử đơn hàng</Button></Link>
                        )}
                    </div>
                </div>
            );
        }


        if (paymentStatus === 'PROCESSING_ORDER') {
             return (
                <div className={styles.loadingContainer}>
                    <Spinner size="large" />
                    <p>Thanh toán VNPAY thành công. Đang tạo đơn hàng trong hệ thống...</p>
                    {/* You could potentially show VNPAY details here already if desired */}
                     {transactionDetails && transactionDetails.vnp_TransactionNo && (
                         <p style={{marginTop: '10px', fontSize: '0.9em'}}>
                              Mã giao dịch VNPAY: <strong>{transactionDetails.vnp_TransactionNo}</strong>
                         </p>
                      )}
                </div>
             );
        }


        if (paymentStatus === 'FAILED') {
            return (
                <div className={`${styles.resultContainer} ${styles.failed}`}>
                    <FaTimesCircle size={50} className={styles.icon} />
                    <h2>Giao dịch không thành công</h2>
                    {error ? (<p className={styles.errorMessage}>{error}</p>) : (<p>Đã xảy ra lỗi trong quá trình thanh toán hoặc tạo đơn hàng.</p>)}
                    {transactionDetails && transactionDetails.vnp_TransactionNo && ( <p>Nếu đã bị trừ tiền, liên hệ hỗ trợ với Mã GD VNPAY: <strong>{transactionDetails.vnp_TransactionNo}</strong></p> )}
                    <div className={styles.actions}>
                        <Link to="/cart"><Button variant="secondary">Quay lại giỏ hàng</Button></Link>
                        <Link to="/"><Button variant="primary">Về trang chủ</Button></Link>
                    </div>
                </div>
            );
        }


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