
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './OrderSuccessPage.module.css';
import apiService from '../../services/api';
import Spinner from '../../components/Spinner/Spinner';
import Button from '../../components/Button/Button';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';


const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};


const calculateGrandTotal = (items, shippingFee) => {
    const subtotal = items.reduce((sum, item) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        return sum + (price * quantity);
    }, 0);
    const vat = subtotal * 0.10;
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
    const [attemptedCreation, setAttemptedCreation] = useState(false);

    const processOrderCreation = useCallback(async () => {

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

        setAttemptedCreation(true);
        setIsLoading(true);
        setError(null);

        console.log("Attempting to process COD order creation...");


        const savedDataString = localStorage.getItem('savedShippingInfo');


        if (!savedDataString) {
            console.error("No saved order data found in localStorage for COD order creation!");
            setError("Không tìm thấy thông tin đơn hàng đã lưu. Vui lòng đặt lại.");
            setIsLoading(false);

            localStorage.removeItem('savedShippingInfo');
            localStorage.removeItem('pendingOrderData');

             setTimeout(() => navigate('/cart', { replace: true }), 3000);
            return;
        }

        let savedData;
        try {
            savedData = JSON.parse(savedDataString);

            if (!savedData || typeof savedData !== 'object' || !Array.isArray(savedData.orderItems) || savedData.orderItems.length === 0 || typeof savedData.shippingFee !== 'number' || !savedData.provinceName || !savedData.districtFullName || !savedData.wardFullName || !savedData.detailedAddress || !savedData.phone || !savedData.email || !savedData.shippingMethod) {
                throw new Error("Dữ liệu đơn hàng lưu trữ không đầy đủ hoặc không hợp lệ.");
            }
            console.log("Retrieved and validated saved order data from localStorage for COD.");

        } catch (e) {
            console.error("Fatal Error parsing/validating saved data from localStorage for COD:", e);
            setError("Lỗi đọc dữ liệu đơn hàng đã lưu. Vui lòng đặt lại.");
            setIsLoading(false);

            localStorage.removeItem('savedShippingInfo');
            localStorage.removeItem('pendingOrderData');
             setTimeout(() => navigate('/cart', { replace: true }), 3000);
            return;
        }
        const expectedGrandTotal = calculateGrandTotal(savedData.orderItems, savedData.shippingFee);

        const fullAddressForFinalOrder = `${savedData.detailedAddress}, ${savedData.wardFullName}, ${savedData.districtFullName}, ${savedData.provinceName}`;


        const finalOrderData = {
            shippingAddress: fullAddressForFinalOrder,
            paymentMethod: "CASH",
            deliveryMethod: savedData.shippingMethod,
            note: savedData.notes || '',
            items: savedData.orderItems.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity
            })),



            shippingFee: savedData.shippingFee,
            userId: user.userId,

            totalAmount: Math.round(expectedGrandTotal),


        };

        console.log("Calling /order/create API with payload for COD:", finalOrderData);


        try {
            const response = await apiService.createOrder(finalOrderData);
            console.log("Backend Create Order Response (COD):", response);


            if(response && response.data && response.data.orderId !== undefined){
               setCreatedOrder(response.data);
               setIsLoading(false);
               console.log("Order successfully created (COD). Order ID:", response.data.orderId);

               localStorage.removeItem('savedShippingInfo');
               localStorage.removeItem('pendingOrderData');
               console.log("Cleared saved localStorage data after COD success.");
            } else {
                console.error("Backend /order/create response missing expected data:", response?.data);
                throw new Error("Phản hồi tạo đơn hàng từ máy chủ không hợp lệ.");
            }
        } catch (createOrderError) {
            console.error("Error calling /order/create API for COD:", createOrderError.response?.data || createOrderError.message);

            const backendErrorMessage = createOrderError.response?.data?.message || createOrderError.message;
            setError(`Đặt hàng không thành công (${backendErrorMessage}). Vui lòng thử lại.`);
            setIsLoading(false);



        }
    }, [attemptedCreation, isAuthenticated, user?.userId, navigate, apiService, calculateGrandTotal]);


    useEffect(() => {

        if (!attemptedCreation && isAuthenticated && user?.userId) {
            processOrderCreation();
        } else if (!isAuthenticated || !user?.userId) {

            if (!attemptedCreation) {
                 setIsLoading(false);
                 setError("Vui lòng đăng nhập để hoàn tất đơn hàng.");
            }
        }

         if(attemptedCreation && isLoading && (error || createdOrder)){
              setIsLoading(false);
         }


    }, [processOrderCreation, attemptedCreation, isAuthenticated, user?.userId, isLoading, error, createdOrder]);



        const renderContent = () => {
        if (isLoading) {
            return (

                <div className={styles.loadingContainer}>
                    <Spinner size="large" />
                    <p>Đang xử lý đơn hàng của bạn...</p>
                </div>
            );
        }


        if (createdOrder && createdOrder.orderId !== undefined) {
            return (
                <div className={`${styles.resultContainer} ${styles.success}`}> {/* Apply resultContainer and success classes */}
                    <FaCheckCircle size={50} className={styles.icon} /> {/* Apply icon class */}
                    <h2>Đặt hàng thành công!</h2>
                    <p>Cảm ơn bạn đã mua hàng. Đơn hàng COD của bạn đã được tạo.</p>
                    <p>Mã đơn hàng của bạn: <strong>{createdOrder.orderId}</strong></p>
                    {/* Optionally display total or other details if returned by API */}
                     {createdOrder.totalAmount !== undefined && (
                         <p>Tổng tiền (ước tính): <strong>{formatCurrency(createdOrder.totalAmount)}</strong></p>
                     )}

                    <div className={styles.actions}> {/* Apply actions class */}
                        <Link to="/"><Button variant="primary">Về trang chủ</Button></Link>
                         <Link to={`/profile/orders`}><Button variant="secondary">Xem chi tiết đơn hàng</Button></Link>
                    </div>
                </div>
            );
        }


        if (error) {
            return (
                <div className={`${styles.resultContainer} ${styles.failed}`}> {/* Apply resultContainer and failed classes */}
                    <FaTimesCircle size={50} className={styles.icon} /> {/* Apply icon class */}
                    <h2>Đặt hàng không thành công</h2>
                    <p className={styles.errorMessage}>{error}</p> {/* Apply errorMessage class */}
                     <p>Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ nếu vấn đề tái diễn.</p>
                    <div className={styles.actions}> {/* Apply actions class */}
                        <Link to="/cart"><Button variant="secondary">Quay lại giỏ hàng</Button></Link>
                        <Link to="/"><Button variant="primary">Về trang chủ</Button></Link>
                    </div>
                </div>
            );
        }


         return (
              <div className={`${styles.resultContainer} ${styles.warning}`}> {/* Apply resultContainer and warning classes */}
                  <FaExclamationTriangle size={50} className={styles.icon} /> {/* Apply icon class */}
                  <h2>Trạng thái đơn hàng không xác định</h2>
                  <p>Không thể xác định trạng thái đơn hàng cuối cùng. Vui lòng kiểm tra lại lịch sử đơn hàng của bạn.</p>
                   <div className={styles.actions}> {/* Apply actions class */}
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