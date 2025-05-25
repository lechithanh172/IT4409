
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { Link } from 'react-router-dom';


import styles from './OrderHistoryPage.module.css';


import apiService from '../../services/api';


import { useAuth } from '../../contexts/AuthContext';


import Spinner from '../../components/Spinner/Spinner';
import Button from '../../components/Button/Button';


import {
    FaBoxOpen,
    FaInfoCircle,
    FaChevronDown,
    FaChevronUp,
    FaShoppingCart,
    FaSearch,
    FaTimes,
    FaExclamationTriangle,
    FaTruck
} from 'react-icons/fa';


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
    } catch (e) {

        console.error("Error formatting date:", e);
        return 'N/A';
    }
};


const getOrderStatusText = (status) => {
    switch (status) {
        case 'PENDING': return 'Chờ xác nhận';
        case 'PROCESSING': return 'Đang xử lý';
        case 'SHIPPING': return 'Đang giao hàng';
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
        case 'SHIPPING': return styles.statusShipped;
        case 'DELIVERED':
        case 'COMPLETED': return styles.statusCompleted;
        case 'CANCELLED':
        case 'FAILED': return styles.statusCancelled;
        default: return styles.statusUnknown;
    }
};

const OrderHistoryPage = () => {

    useEffect(() => {
        document.title = "Lịch sử đơn hàng | HustShop";
    }, []);


    const { user, isAuthenticated } = useAuth();


    const [orders, setOrders] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const [error, setError] = useState(null);


    const [expandedOrderDetails, setExpandedOrderDetails] = useState({});

    const [searchTerm, setSearchTerm] = useState('');



    const fetchOrderHistory = useCallback(async () => {

        if (!isAuthenticated || !user?.username) {
            console.log("User not authenticated or username missing. Skipping order history fetch.");
            setIsLoading(false);
            setOrders([]);
            return;
        }

        setIsLoading(true);
        setError(null);

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
             console.log(`Skipping fetch items for ${orderId}: already loading/loaded or invalid orderId.`);
             return;
        }
        console.log(`Fetching items for orderId: ${orderId}`);


        setExpandedOrderDetails(prev => ({
             ...prev,
             [orderId]: {
                  ...prev[orderId],
                  isLoading: true,
                  error: null
             }
        }));

        try {

            const response = await apiService.getOrderItems(orderId);
            console.log(`Items API Response for order ${orderId}:`, response);


            if (response && Array.isArray(response.data)) {

                setExpandedOrderDetails(prev => ({
                    ...prev,
                    [orderId]: { ...prev[orderId], items: response.data, isLoading: false, error: null }
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
    }, [expandedOrderDetails]);


     const fetchShipperInfo = useCallback(async (orderId) => {

         if (!orderId || expandedOrderDetails[orderId]?.shipperInfo || expandedOrderDetails[orderId]?.shipperLoading) {
              console.log(`Skipping fetch shipper for ${orderId}: already loading/loaded or invalid orderId.`);
              return;
         }
         console.log(`Fetching shipper info for orderId: ${orderId}`);


         setExpandedOrderDetails(prev => ({
             ...prev,
             [orderId]: {
                  ...prev[orderId],
                  shipperLoading: true,
                  shipperError: null
             }
         }));

         try {

             const response = await apiService.getShipperDeliveryOrder(orderId);
             console.log(`Shipper Info API Response for order ${orderId}:`, response);


             if (response?.data) {

                 setExpandedOrderDetails(prev => ({
                     ...prev,
                     [orderId]: { ...prev[orderId], shipperInfo: response.data, shipperLoading: false, shipperError: null }
                 }));
             } else {

                 console.warn(`No shipper data received for order ${orderId}:`, response?.data);
                  setExpandedOrderDetails(prev => ({
                     ...prev,
                     [orderId]: { ...prev[orderId], shipperInfo: null, shipperLoading: false, shipperError: "Không có thông tin người giao hàng." }
                 }));
             }
         } catch (err) {

             console.error(`Error fetching shipper info for order ${orderId}:`, err);

             setExpandedOrderDetails(prev => ({
                 ...prev,
                 [orderId]: { ...prev[orderId], shipperInfo: null, shipperLoading: false, shipperError: err.response?.data?.message || err.message || "Lỗi tải thông tin người giao hàng." }
             }));
         }
     }, [expandedOrderDetails]);


    const toggleOrderExpansion = (orderId) => {

        const isCurrentlyExpanded = !!expandedOrderDetails[orderId];

        const order = orders.find(o => o.orderId === orderId);

        if (isCurrentlyExpanded) {

            setExpandedOrderDetails(prev => {
                const newState = { ...prev };
                delete newState[orderId];
                return newState;
            });
        } else {




            const newStateForOrder = {
                 items: null,
                 isLoading: true,
                 error: null,
                 shipperInfo: null,
                 shipperLoading: order?.shipperId ? true : false,
                 shipperError: null
            };


            setExpandedOrderDetails(prev => ({ ...prev, [orderId]: newStateForOrder }));


            fetchOrderItems(orderId);


            if (order?.shipperId) {
                fetchShipperInfo(orderId);
            }
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
        return (
            <div className={styles.loadingContainer}>
                <Spinner size="large" />
                <p>Đang tải lịch sử đơn hàng...</p>
            </div>
        );
    }


    if (!isAuthenticated) {
        return (
            <div className={styles.container} style={{ textAlign: 'center', marginTop: '50px' }}>
                <FaShoppingCart size={50} style={{ color: '#ccc', marginBottom: '15px'}}/>
                <h2>Vui lòng đăng nhập</h2>
                <p>Bạn cần đăng nhập để xem lịch sử đơn hàng.</p>
                {/* Provide a link to the login page */}
                <Link to="/login"><Button variant="primary">Đăng nhập</Button></Link>
            </div>
        );
    }


    if (error) {
        return (
            <div className={`${styles.container} ${styles.errorContainer}`} style={{ textAlign: 'center', marginTop: '50px' }}>
                <FaExclamationTriangle size={40} style={{ color: '#dc3545' }}/>
                <h2>Đã xảy ra lỗi</h2>
                <p>{error}</p>
                {/* Provide a button to retry fetching the order history */}
                <Button variant="secondary" onClick={fetchOrderHistory}>Thử lại</Button>
            </div>
        );
    }


    return (
        <div className={styles.container}>
            <h1><FaBoxOpen /> Lịch sử đặt hàng</h1>

            {/* Show the search bar only if there are any orders fetched */}
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
                        {/* Show the clear button only if the search term is not empty */}
                        {searchTerm && (
                            <button onClick={clearSearch} className={styles.clearSearchButton} aria-label="Xóa tìm kiếm">
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* --- Conditional Rendering for Order List or Messages --- */}
            {orders.length === 0 ? (

                <div className={styles.noResults} style={{ textAlign: 'center', marginTop: '40px' }}>
                    <FaShoppingCart size={50} style={{ color: '#ccc', marginBottom: '15px'}}/>
                    <h2>Chưa có đơn hàng nào</h2>
                    <p>Lịch sử mua hàng của bạn đang trống.</p>
                    {/* Link to homepage to encourage shopping */}
                    <Link to="/"><Button variant="primary">Bắt đầu mua sắm</Button></Link>
                </div>
            ) : filteredOrders.length === 0 ? (

                 <div className={styles.noResults} style={{ textAlign: 'center', marginTop: '20px' }}>
                     <p>Không tìm thấy đơn hàng nào khớp với mã "{searchTerm}".</p>
                 </div>
            ) : (

                <div className={styles.tableContainer}>
                    <table className={styles.orderTable}>
                        <thead>
                            <tr>
                                <th className={styles.colExpand}></th> {/* Column for the expand icon */}
                                <th className={styles.colId}>Mã ĐH</th>
                                <th className={styles.colDate}>Ngày đặt</th>
                                <th className={styles.colStatus}>Trạng thái</th>
                                <th className={styles.colPayment}>Thanh toán</th>
                                <th className={`${styles.colTotal} ${styles.alignRight}`}>Tổng cộng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Map over the filtered orders to create table rows */}
                            {filteredOrders.map(order => {

                                const isExpanded = !!expandedOrderDetails[order.orderId];

                                const details = expandedOrderDetails[order.orderId] || {};

                                return (

                                    <React.Fragment key={order.orderId}>
                                        {/* Order Header Row - This row displays summary info and is clickable */}
                                        <tr
                                            className={`${styles.orderRow} ${isExpanded ? styles.expandedHeader : ''}`}
                                            onClick={() => toggleOrderExpansion(order.orderId)}
                                            title="Nhấn để xem chi tiết"
                                        >
                                            <td className={styles.colExpand}>
                                                <span className={styles.toggleIcon}>
                                                    {/* Render ChevronUp when expanded, ChevronDown when collapsed */}
                                                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                                </span>
                                            </td>
                                            <td className={styles.colId}>#{order.orderId}</td>
                                            <td className={styles.colDate}>{formatDate(order.createdAt)}</td>
                                            <td className={styles.colStatus}>
                                                {/* Display formatted status text with status-specific styling */}
                                                <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                                                    {getOrderStatusText(order.status)}
                                                </span>
                                            </td>
                                            <td className={styles.colPayment}>{order.paymentMethod}</td>
                                            <td className={`${styles.colTotal} ${styles.alignRight}`}>{formatCurrency(order.totalAmount)}</td>
                                        </tr>

                                        {/* Expanded Details Row - Conditionally rendered when isExpanded is true */}
                                        {isExpanded && (
                                            <tr className={styles.expandedRow}>
                                                {/* This single cell spans all columns */}
                                                <td colSpan={6} className={styles.expandedContent}>
                                                    <div className={styles.orderDetails}>
                                                        {/* --- Order Meta Information (Address, Delivery, Notes, Fee) --- */}
                                                        <div className={styles.orderMeta}>
                                                             <p><strong>Địa chỉ giao hàng:</strong> {order.shippingAddress || 'N/A'}</p>
                                                             <p><strong>Vận chuyển:</strong> {order.deliveryMethod === 'EXPRESS' ? 'Nhanh' : 'Tiêu chuẩn'}</p>
                                                             {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>} {/* Only show note if it exists */}
                                                             {/* Only show shipping fee if it's a valid number */}
                                                             {order.shippingFee !== null && typeof order.shippingFee === 'number' && (
                                                                <p><strong>Phí vận chuyển:</strong> {formatCurrency(order.shippingFee)}</p>
                                                             )}
                                                        </div>

                                                        {/* --- Shipper Information Section --- */}
                                                        {/* Only render this entire section if the order has a shipperId assigned */}
                                                        {order.shipperId && (
                                                            <div className={styles.shipperDetails}>
                                                                 <h4 className={styles.shipperTitle}><FaTruck /> Thông tin người giao hàng:</h4>
                                                                 {/* Show spinner while shipper info is loading */}
                                                                 {details?.shipperLoading && <div className={styles.shipperLoading}><Spinner size="small" /> Đang tải thông tin người giao hàng...</div>}
                                                                 {/* Show error message if shipper info fetch failed */}
                                                                 {details?.shipperError && <div className={styles.shipperError}><FaInfoCircle /> {details.shipperError}</div>}

                                                                 {/* Show shipper information if successfully loaded */}
                                                                 {details?.shipperInfo ? (
                                                                    <div className={styles.shipperInfoContent}>
                                                                        <p><strong>Tên:</strong> {details.shipperInfo.fullName || 'Đang cập nhật'}</p>
                                                                        <p><strong>Số điện thoại:</strong> {details.shipperInfo.phoneNumber || 'Đang cập nhật'}</p>
                                                                        {/* Add other shipper details here if available in API response (e.g., vehicle info) */}
                                                                        {/* <p><strong>Phương tiện:</strong> {details.shipperInfo.vehicleType || 'N/A'} ({details.shipperInfo.licensePlate || 'N/A'})</p> */}

                                                                        {/* --- IMPORTANT SECURITY NOTICE --- */}
                                                                        {/* Added warning about payment scams */}
                                                                        <p className={styles.shipperNotice}>
                                                                            <FaExclamationTriangle style={{ color: '#ffc107', marginRight: '8px' }} /> {/* Warning icon with custom color */}
                                                                            <span>{/* Wrap text to allow flex alignment with icon */}
                                                                                <strong>LƯU Ý QUAN TRỌNG:</strong> Hiện nay có tình trạng kẻ gian mạo danh shipper yêu cầu chuyển khoản trước. <strong>HustShop KHÔNG</strong> yêu cầu thanh toán chuyển khoản cho đơn hàng COD. Vui lòng chỉ thanh toán tiền mặt và chỉ nhấc máy đối với số điện thoại của Shipper được cung cấp ở đây.
                                                                            </span>
                                                                        </p>
                                                                        {/* --------------------------------------- */}

                                                                    </div>
                                                                ) : (

                                                                     !details?.shipperLoading && !details?.shipperError && order?.shipperId && <p>Chưa có thông tin chi tiết người giao hàng hoặc không tìm thấy.</p>
                                                                 )}
                                                            </div>
                                                        )}
                                                         {/* --- End Shipper Information Section --- */}


                                                        {/* --- Product Items Section --- */}
                                                        <h4 className={styles.itemsTitle}>Sản phẩm đã đặt:</h4>
                                                        {/* Show spinner while items are loading */}
                                                        {details?.isLoading && <div className={styles.itemsLoading}><Spinner size="small" /> Đang tải sản phẩm...</div>}
                                                        {/* Show error message if item fetch failed */}
                                                        {details?.error && <div className={styles.itemsError}><FaInfoCircle /> {details.error}</div>}

                                                        {/* Render the list of items if items are loaded and the list is not empty */}
                                                        {details?.items && details.items.length > 0 && (
                                                            <div className={styles.itemsList}>
                                                                {/* Map over the items list */}
                                                                {details.items.map(item => (


                                                                    <Link
                                                                        key={`${item.productId}-${item.variantId || 'no-variant'}`}
                                                                        to={`/products/${item.productId}`}
                                                                        className={styles.orderItemLink}
                                                                        title={`Xem chi tiết sản phẩm: ${item.productName || 'Sản phẩm'}`}
                                                                    >
                                                                        {/* This div contains the item's visual representation */}
                                                                        <div className={styles.orderItem}>
                                                                            {/* Item Image - use placeholder on error */}
                                                                            <img
                                                                                src={item.imageUrl || '/images/placeholder-image.png'}
                                                                                alt={item.productName || 'Sản phẩm'}
                                                                                className={styles.itemImage}
                                                                                onError={(e)=>{e.target.src='/images/placeholder-image.png'}}
                                                                            />
                                                                            {/* Item Info (Name, Color, Size) */}
                                                                            <div className={styles.itemInfo}>
                                                                                <span className={styles.itemName}>{item.productName || 'Tên sản phẩm lỗi'}</span>
                                                                                {item.color && <span className={styles.itemColor}>Màu: {item.color}</span>}
                                                                                {item.size && <span className={styles.itemSize}>Size: {item.size}</span>}
                                                                            </div>
                                                                            {/* Item Quantity */}
                                                                            <div className={styles.itemQuantity}>x {item.quantity || '?'}</div>
                                                                            {/* Item Price - Format price if it's a number */}
                                                                            {typeof item.price === 'number' && (
                                                                                <div className={styles.itemPrice}>{formatCurrency(item.price)}</div>
                                                                            )}
                                                                        </div>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {/* Show message if items list is empty after loading */}
                                                        {details?.items && details.items.length === 0 && !details.isLoading && (<p>Không có thông tin sản phẩm cho đơn hàng này.</p>)}
                                                         {/* Show a fallback message if items couldn't be loaded or are null/undefined (and not currently loading/error) */}
                                                         {!details?.items && !details?.isLoading && !details?.error && (<p>Không thể tải chi tiết sản phẩm hoặc không có sản phẩm.</p>)}
                                                        {/* --- End Product Items Section --- */}
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