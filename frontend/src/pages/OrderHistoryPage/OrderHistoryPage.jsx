// src/pages/OrderHistoryPage/OrderHistoryPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './OrderHistoryPage.module.css'; // We'll create this CSS module
import apiService from '../../services/api'; // Ensure correct path
import { useAuth } from '../../contexts/AuthContext'; // Ensure correct path
import Spinner from '../../components/Spinner/Spinner'; // Ensure correct path
import Button from '../../components/Button/Button'; // Ensure correct path
import { FaBoxOpen, FaInfoCircle, FaChevronDown, FaChevronUp, FaShoppingCart } from 'react-icons/fa';

// --- Helper Functions ---
const formatCurrency = (amount) => {
    // Use a default of 0 if amount is null or not a number
    const numAmount = typeof amount === 'number' ? amount : 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numAmount);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Check if date is valid after parsing
        if (isNaN(date.getTime())) {
            return 'Ngày không hợp lệ';
        }
        return date.toLocaleString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'N/A';
    }
};

// Function to get readable status
const getOrderStatusText = (status) => {
    switch (status) {
        case 'PENDING': return 'Chờ xác nhận';
        case 'PROCESSING': return 'Đang xử lý';
        case 'SHIPPED': return 'Đang giao hàng';
        case 'DELIVERED': return 'Đã giao';
        case 'COMPLETED': return 'Hoàn thành';
        case 'CANCELLED': return 'Đã hủy';
        case 'FAILED': return 'Thất bại';
        default: return status || 'Không xác định';
    }
};

// Function to get CSS class based on status
const getStatusClass = (status) => {
    switch (status) {
        case 'PENDING': return styles.statusPending;
        case 'PROCESSING': return styles.statusProcessing;
        case 'SHIPPED': return styles.statusShipped;
        case 'DELIVERED':
        case 'COMPLETED': return styles.statusCompleted;
        case 'CANCELLED':
        case 'FAILED': return styles.statusCancelled;
        default: return styles.statusUnknown;
    }
};

// --- OrderHistoryPage Component ---
const OrderHistoryPage = () => {
    const { user, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // State to track expanded orders and their items/loading status
    const [expandedOrderDetails, setExpandedOrderDetails] = useState({}); // { orderId: { items: [], isLoading: false, error: null } }

    // Fetch Order History
    const fetchOrderHistory = useCallback(async () => {
        if (!isAuthenticated || !user?.username) {
            console.log("User not authenticated or username missing.");
            setIsLoading(false);
            setOrders([]); // Ensure orders are cleared if not logged in
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            console.log(`Fetching order history for user: ${user.username}`);
            const response = await apiService.getOrderHistory(user.username);
            console.log("Order History API Response:", response);
            if (response && Array.isArray(response.data)) {
                // Sort orders by creation date, newest first
                const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedOrders);
            } else {
                console.warn("Invalid data structure received for order history:", response?.data);
                setOrders([]); // Set empty if data is invalid
            }
        } catch (err) {
            console.error("Error fetching order history:", err);
            setError(err.response?.data?.message || err.message || "Không thể tải lịch sử đơn hàng.");
            setOrders([]); // Clear orders on error
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user?.username]);

    // Initial fetch on component mount or when user changes
    useEffect(() => {
        fetchOrderHistory();
    }, [fetchOrderHistory]);

    // Fetch items for a specific order when expanded
    const fetchOrderItems = useCallback(async (orderId) => {
        // Check if items are already fetched or being fetched
        if (!orderId || expandedOrderDetails[orderId]?.items || expandedOrderDetails[orderId]?.isLoading) {
            return;
        }

        console.log(`Fetching items for orderId: ${orderId}`);
        // Set loading state for this specific order
        setExpandedOrderDetails(prev => ({
            ...prev,
            [orderId]: { ...prev[orderId], isLoading: true, error: null }
        }));

        try {
            const response = await apiService.getOrderItems(orderId);
            console.log(`Items API Response for order ${orderId}:`, response);
            if (response && Array.isArray(response.data)) {
                setExpandedOrderDetails(prev => ({
                    ...prev,
                    [orderId]: { items: response.data, isLoading: false, error: null }
                }));
            } else {
                console.warn(`Invalid data structure for items of order ${orderId}:`, response?.data);
                throw new Error("Dữ liệu sản phẩm không hợp lệ.");
            }
        } catch (err) {
            console.error(`Error fetching items for order ${orderId}:`, err);
            setExpandedOrderDetails(prev => ({
                ...prev,
                [orderId]: { ...prev[orderId], isLoading: false, error: err.response?.data?.message || err.message || "Lỗi tải sản phẩm." }
            }));
        }
    }, [expandedOrderDetails]); // Dependency on the state to avoid infinite loops

    // Toggle order expansion and fetch items if needed
    const toggleOrderExpansion = (orderId) => {
        const isCurrentlyExpanded = !!expandedOrderDetails[orderId]; // Check if the key exists

        if (isCurrentlyExpanded) {
            // Collapse: Remove the order details from the state
            setExpandedOrderDetails(prev => {
                const newState = { ...prev };
                delete newState[orderId]; // Remove the key to collapse
                return newState;
            });
        } else {
            // Expand: Add entry (will set loading) and trigger fetch
            setExpandedOrderDetails(prev => ({
                ...prev,
                [orderId]: { items: null, isLoading: true, error: null } // Initial state before fetch
            }));
            fetchOrderItems(orderId); // Fetch items for the newly expanded order
        }
    };

    // --- Render Logic ---
    if (isLoading) {
        return <div className={styles.loadingContainer}><Spinner size="large" /><p>Đang tải lịch sử đơn hàng...</p></div>;
    }

    if (!isAuthenticated) {
        return (
            <div className={styles.container} style={{ textAlign: 'center' }}>
                <h2>Vui lòng đăng nhập</h2>
                <p>Bạn cần đăng nhập để xem lịch sử đơn hàng.</p>
                <Link to="/login"><Button variant="primary">Đăng nhập</Button></Link>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${styles.container} ${styles.errorContainer}`}>
                <FaExclamationTriangle size={40} />
                <h2>Đã xảy ra lỗi</h2>
                <p>{error}</p>
                <Button variant="secondary" onClick={fetchOrderHistory}>Thử lại</Button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className={styles.container} style={{ textAlign: 'center' }}>
                 <FaShoppingCart size={50} style={{ color: '#ccc', marginBottom: '15px'}}/>
                 <h2>Chưa có đơn hàng nào</h2>
                 <p>Bạn chưa thực hiện đơn hàng nào. Hãy bắt đầu mua sắm!</p>
                 <Link to="/"><Button variant="primary">Bắt đầu mua sắm</Button></Link>
            </div>
        );
    }

    // --- Main Order History List ---
    return (
        <div className={styles.container}>
            <h1><FaBoxOpen /> Lịch sử đơn hàng</h1>
            <div className={styles.orderList}>
                {orders.map(order => {
                    const isExpanded = !!expandedOrderDetails[order.orderId];
                    const details = expandedOrderDetails[order.orderId];
                    return (
                        <div key={order.orderId} className={styles.orderCard}>
                            <div className={styles.orderHeader} onClick={() => toggleOrderExpansion(order.orderId)}>
                                <div className={styles.headerInfo}>
                                    <span className={styles.orderId}>Mã ĐH: #{order.orderId}</span>
                                    <span className={styles.orderDate}>Ngày đặt: {formatDate(order.createdAt)}</span>
                                    <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                                        {getOrderStatusText(order.status)}
                                    </span>
                                </div>
                                <div className={styles.headerTotal}>
                                    <span>Tổng cộng: {formatCurrency(order.totalAmount)}</span>
                                    <span className={styles.toggleIcon}>
                                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                    </span>
                                </div>
                            </div>

                            {/* Collapsible Content */}
                            {isExpanded && (
                                <div className={styles.orderDetails}>
                                    <div className={styles.orderMeta}>
                                        <p><strong>Địa chỉ giao hàng:</strong> {order.shippingAddress}</p>
                                        <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod === 'VNPAY' ? 'VNPAY' : 'Thanh toán khi nhận hàng (COD)'}</p>
                                        <p><strong>Phương thức vận chuyển:</strong> {order.deliveryMethod === 'EXPRESS' ? 'Giao hàng nhanh' : 'Giao hàng tiêu chuẩn'}</p>
                                        {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>}
                                        {/* Display Shipping Fee if available */}
                                        {order.shippingFee !== null && typeof order.shippingFee === 'number' && (
                                            <p><strong>Phí vận chuyển:</strong> {formatCurrency(order.shippingFee)}</p>
                                        )}
                                    </div>

                                    <h4 className={styles.itemsTitle}>Sản phẩm trong đơn hàng:</h4>
                                    {details?.isLoading && <div className={styles.itemsLoading}><Spinner size="small" /> Đang tải sản phẩm...</div>}
                                    {details?.error && <div className={styles.itemsError}><FaInfoCircle /> {details.error}</div>}
                                    {details?.items && details.items.length > 0 && (
                                        <div className={styles.itemsList}>
                                            {details.items.map(item => (
                                                <div key={`${item.productId}-${item.variantId}`} className={styles.orderItem}>
                                                    <img
                                                        src={item.imageUrl || '/images/placeholder-image.png'}
                                                        alt={item.productName}
                                                        className={styles.itemImage}
                                                        onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder-image.png'; }}
                                                    />
                                                    <div className={styles.itemInfo}>
                                                        <span className={styles.itemName}>{item.productName}</span>
                                                        {item.color && <span className={styles.itemColor}>Màu: {item.color}</span>}
                                                        {/* Consider parsing specifications if needed:
                                                            try { const specs = JSON.parse(item.specifications || '[]'); // display specs } catch(e){}
                                                        */}
                                                    </div>
                                                    <div className={styles.itemQuantity}>x {item.quantity}</div>
                                                    <div className={styles.itemPrice}>{formatCurrency(item.price)}</div> {/* Price per item */}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {details?.items && details.items.length === 0 && !details.isLoading && (
                                         <p>Không tìm thấy sản phẩm cho đơn hàng này.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderHistoryPage;