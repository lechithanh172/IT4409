
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './OrderHistoryPage.module.css';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext'; 
import Spinner from '../../components/Spinner/Spinner'; 
import Button from '../../components/Button/Button';
import { FaBoxOpen, FaInfoCircle, FaChevronDown, FaChevronUp, FaShoppingCart, FaSearch, FaTimes, FaExclamationTriangle } from 'react-icons/fa'; 

const formatCurrency = (amount) => {
    const numAmount = typeof amount === 'number' ? amount : 0;
    if (isNaN(numAmount)) return 'N/A'; 
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numAmount);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Ngày không hợp lệ';
        return date.toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) { console.error("Error formatting date:", e); return 'N/A'; }
};

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

const getStatusClass = (status) => {
    switch (status) {
        case 'PENDING': return styles.statusPending;
        case 'PROCESSING': return styles.statusProcessing;
        case 'SHIPPED': return styles.statusShipped;
        case 'DELIVERED': case 'COMPLETED': return styles.statusCompleted;
        case 'CANCELLED': case 'FAILED': return styles.statusCancelled;
        default: return styles.statusUnknown;
    }
};

const OrderHistoryPage = () => {
    useEffect(() => {
            document.title = "Danh sách đơn hàng | HustShop";
        }, []);
    const { user, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrderDetails, setExpandedOrderDetails] = useState({}); 
    const [searchTerm, setSearchTerm] = useState(''); 

    const fetchOrderHistory = useCallback(async () => {
        if (!isAuthenticated || !user?.username) {
            console.log("User not authenticated or username missing.");
            setIsLoading(false);
            setOrders([]);
            return;
        }
        setIsLoading(true); setError(null);
        try {
            console.log(`Fetching order history for user: ${user.username}`);
            const response = await apiService.getOrderHistory(user.username);
            console.log("Order History API Response:", response);
            if (response && Array.isArray(response.data)) {
                const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedOrders);
            } else {
                console.warn("Invalid data structure received for order history:", response?.data);
                setOrders([]);
            }
        } catch (err) {
            console.error("Error fetching order history:", err);
            setError(err.response?.data?.message || err.message || "Không thể tải lịch sử đơn hàng.");
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user?.username]);

    useEffect(() => {
        fetchOrderHistory();
    }, [fetchOrderHistory]);

    const fetchOrderItems = useCallback(async (orderId) => {
        if (!orderId || expandedOrderDetails[orderId]?.items || expandedOrderDetails[orderId]?.isLoading) {
            return;
        }
        console.log(`Fetching items for orderId: ${orderId}`);
        setExpandedOrderDetails(prev => ({ ...prev, [orderId]: { ...prev[orderId], isLoading: true, error: null } }));
        try {
            const response = await apiService.getOrderItems(orderId);
            console.log(`Items API Response for order ${orderId}:`, response);
            if (response && Array.isArray(response.data)) {
                setExpandedOrderDetails(prev => ({ ...prev, [orderId]: { items: response.data, isLoading: false, error: null } }));
            } else {
                console.warn(`Invalid data structure for items of order ${orderId}:`, response?.data);
                throw new Error("Dữ liệu sản phẩm không hợp lệ.");
            }
        } catch (err) {
            console.error(`Error fetching items for order ${orderId}:`, err);
            setExpandedOrderDetails(prev => ({ ...prev, [orderId]: { ...prev[orderId], isLoading: false, error: err.response?.data?.message || err.message || "Lỗi tải sản phẩm." } }));
        }
    }, [expandedOrderDetails]); 
    const toggleOrderExpansion = (orderId) => {
        const isCurrentlyExpanded = !!expandedOrderDetails[orderId];
        if (isCurrentlyExpanded) {
            setExpandedOrderDetails(prev => { const newState = { ...prev }; delete newState[orderId]; return newState; });
        } else {
            setExpandedOrderDetails(prev => ({ ...prev, [orderId]: { items: null, isLoading: true, error: null } }));
            fetchOrderItems(orderId);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const filteredOrders = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) {
            return orders; 
        }
        return orders.filter(order =>
            order.orderId.toString().includes(term) 
        );
    }, [orders, searchTerm]);

    if (isLoading) {
        return <div className={styles.loadingContainer}><Spinner size="large" /><p>Đang tải lịch sử đơn hàng...</p></div>;
    }

    if (!isAuthenticated) {
        return (
            <div className={styles.container} style={{ textAlign: 'center', marginTop: '50px' }}>
                <FaShoppingCart size={50} style={{ color: '#ccc', marginBottom: '15px'}}/>
                <h2>Vui lòng đăng nhập</h2>
                <p>Bạn cần đăng nhập để xem lịch sử đơn hàng.</p>
                <Link to="/login"><Button variant="primary">Đăng nhập</Button></Link>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${styles.container} ${styles.errorContainer}`}>
                <FaExclamationTriangle size={40} style={{ color: '#dc3545' }}/>
                <h2>Đã xảy ra lỗi</h2>
                <p>{error}</p>
                <Button variant="secondary" onClick={fetchOrderHistory}>Thử lại</Button>
            </div>
        );
    }
    return (
        <div className={styles.container}>
            <h1><FaBoxOpen /> Lịch sử đặt hàng</h1>
            {orders.length > 0 && (
                 <div className={styles.searchContainer}>
                    <div className={styles.searchInputWrapper}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="search" 
                            placeholder="Tìm theo Mã đơn hàng..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className={styles.searchInput}
                        />
                        {searchTerm && (
                            <button onClick={clearSearch} className={styles.clearSearchButton} aria-label="Xóa tìm kiếm">
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>
            )}
            {orders.length === 0 ? (
                <div className={styles.noResults} style={{ textAlign: 'center', marginTop: '40px' }}>
                    <FaShoppingCart size={50} style={{ color: '#ccc', marginBottom: '15px'}}/>
                    <h2>Chưa có đơn hàng nào</h2>
                    <p>Lịch sử mua hàng của bạn đang trống.</p>
                    <Link to="/"><Button variant="primary">Bắt đầu mua sắm</Button></Link>
                </div>
            ) : filteredOrders.length === 0 ? (
                 <div className={styles.noResults}>
                     <p>Không tìm thấy đơn hàng nào khớp với mã "{searchTerm}".</p>
                 </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.orderTable}>
                        <thead>
                            <tr>
                                <th className={styles.colExpand}></th> 
                                <th className={styles.colId}>Mã ĐH</th>
                                <th className={styles.colDate}>Ngày đặt</th>
                                <th className={styles.colStatus}>Trạng thái</th>
                                <th className={styles.colPayment}>Thanh toán</th>
                                <th className={`${styles.colTotal} ${styles.alignRight}`}>Tổng cộng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => {
                                const isExpanded = !!expandedOrderDetails[order.orderId];
                                const details = expandedOrderDetails[order.orderId];
                                return (
                                    <React.Fragment key={order.orderId}>
                                        <tr className={`${styles.orderRow} ${isExpanded ? styles.expandedHeader : ''}`} onClick={() => toggleOrderExpansion(order.orderId)} title="Nhấn để xem chi tiết">
                                            <td className={styles.colExpand}>
                                                <span className={styles.toggleIcon}>
                                                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                                </span>
                                            </td>
                                            <td className={styles.colId}>#{order.orderId}</td>
                                            <td className={styles.colDate}>{formatDate(order.createdAt)}</td>
                                            <td className={styles.colStatus}>
                                                <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                                                    {getOrderStatusText(order.status)}
                                                </span>
                                            </td>
                                            <td className={styles.colPayment}>{order.paymentMethod}</td>
                                            <td className={`${styles.colTotal} ${styles.alignRight}`}>{formatCurrency(order.totalAmount)}</td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className={styles.expandedRow}>
                                                <td colSpan={6} className={styles.expandedContent}>
                                                    <div className={styles.orderDetails}>
                                                        <div className={styles.orderMeta}>
                                                             <p><strong>Địa chỉ giao hàng:</strong> {order.shippingAddress || 'N/A'}</p>
                                                             <p><strong>Vận chuyển:</strong> {order.deliveryMethod === 'EXPRESS' ? 'Nhanh' : 'Tiêu chuẩn'}</p>
                                                             {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>}
                                                             {order.shippingFee !== null && typeof order.shippingFee === 'number' && (
                                                                <p><strong>Phí vận chuyển:</strong> {formatCurrency(order.shippingFee)}</p>
                                                             )}
                                                        </div>
                                                        <h4 className={styles.itemsTitle}>Sản phẩm đã đặt:</h4>
                                                        {details?.isLoading && <div className={styles.itemsLoading}><Spinner size="small" /> Đang tải sản phẩm...</div>}
                                                        {details?.error && <div className={styles.itemsError}><FaInfoCircle /> {details.error}</div>}
                                                        {details?.items && details.items.length > 0 && (
                                                            <div className={styles.itemsList}>
                                                                {details.items.map(item => (
                                                                    <div key={`${item.productId}-${item.variantId}`} className={styles.orderItem}>
                                                                        <img src={item.imageUrl || '/images/placeholder-image.png'} alt={item.productName} className={styles.itemImage} onError={(e)=>{e.target.src='/images/placeholder-image.png'}}/>
                                                                        <div className={styles.itemInfo}>
                                                                            <span className={styles.itemName}>{item.productName || 'Tên sản phẩm lỗi'}</span>
                                                                            {item.color && <span className={styles.itemColor}>Màu: {item.color}</span>}
                                                                           </div>
                                                                        <div className={styles.itemQuantity}>x {item.quantity || '?'}</div>
                                                                        {typeof item.price === 'number' && (
                                                                            <div className={styles.itemPrice}>{formatCurrency(item.price)}</div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {details?.items && details.items.length === 0 && !details.isLoading && (<p>Không có thông tin sản phẩm cho đơn hàng này.</p>)}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;