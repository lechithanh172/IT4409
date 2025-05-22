import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './ShipperPage.module.css';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext'; 
import Spinner from '../../components/Spinner/Spinner'; 
import { FaTruck, FaBox, FaExclamationTriangle, FaFilter, FaEye, FaEdit } from 'react-icons/fa';
import { Modal, Button, Tooltip, message, Typography, Table, Image, Tag, Card, Row, Col, Divider, Spin, Alert } from 'antd';
import ShipperOrderDetails from './ShipperOrderDetails';

const { Text, Paragraph, Title } = Typography;

const STATUS_DETAILS = {
    PENDING: { label: "Chờ xử lý", color: "gold" },
    SHIPPING: { label: "Đang giao", color: "processing" },
    DELIVERED: { label: "Đã giao", color: "success" },
    FAILED_DELIVERY: { label: "Giao thất bại", color: "error" },
    REJECTED: { label: "Bị từ chối", color: "error" },
};

const VALID_STATUS_TRANSITIONS = {
    PENDING: ["SHIPPING", "REJECTED"],
    SHIPPING: ["DELIVERED", "FAILED_DELIVERY"],
    DELIVERED: [],
    FAILED_DELIVERY: ["SHIPPING"],
    REJECTED: [],
};

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
        case 'SHIPPING': return 'Đang giao hàng';
        case 'DELIVERED': return 'Đã giao';
        case 'COMPLETED': return 'Hoàn thành';
        case 'CANCELLED': return 'Đã hủy';
        case 'FAILED_DELIVERY': return 'Giao hàng thất bại';
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

const ShipperPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('available');
    const [allOrders, setAllOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detailsModalContent, setDetailsModalContent] = useState({
        visible: false,
        orderId: null,
    });
    const [confirmModalState, setConfirmModalState] = useState({
        visible: false,
        record: null,
        targetStatus: null,
        isLoading: false,
    });
    const [acceptOrderModal, setAcceptOrderModal] = useState({
        visible: false,
        orderId: null,
        isLoading: false,
    });
    const [loadingAction, setLoadingAction] = useState(null);

    const fetchOrders = async () => {
        try {
            console.log('Fetching all orders...');
            const response = await apiService.getAllOrders();
            console.log('Orders response:', response);
            let orders = response.data || [];
            setAllOrders(orders);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Không thể tải danh sách đơn hàng");
        }
    };

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await fetchOrders();
        } catch (err) {
            console.error("Error loading data:", err);
            setError("Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredOrders = useMemo(() => {
        let orders = allOrders;
        
        if (activeTab === 'available') {
            orders = orders.filter(order => !order.shipperId);
        } else {
            orders = orders.filter(order => order.shipperId === 1);
        }

        return orders;
    }, [allOrders, activeTab]);

    const showAcceptOrderConfirm = (orderId) => {
        setAcceptOrderModal({
            visible: true,
            orderId,
            isLoading: false,
        });
    };

    const handleAcceptOrderConfirm = async () => {
        const { orderId } = acceptOrderModal;
        if (orderId) {
            setAcceptOrderModal(prev => ({ ...prev, isLoading: true }));
            try {
                await apiService.assignOrder(orderId, 1);
                message.success('Nhận đơn hàng thành công');
                setAcceptOrderModal({
                    visible: false,
                    orderId: null,
                    isLoading: false,
                });
                await loadData();
                // Chuyển sang tab đơn hàng đã nhận
                setActiveTab('assigned');
            } catch (err) {
                console.error("Error accepting order:", err);
                message.error("Không thể nhận đơn hàng này");
                setAcceptOrderModal(prev => ({ ...prev, isLoading: false }));
            }
        }
    };

    const handleAcceptOrderCancel = () => {
        setAcceptOrderModal({
            visible: false,
            orderId: null,
            isLoading: false,
        });
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await apiService.updateOrderStatus(orderId, newStatus);
            message.success('Cập nhật trạng thái đơn hàng thành công');
            await loadData();
        } catch (err) {
            console.error("Error updating order status:", err);
            message.error("Không thể cập nhật trạng thái đơn hàng");
        }
    };

    const showStatusChangeConfirm = (record, targetStatus) => {
        setConfirmModalState({
            visible: true,
            record,
            targetStatus,
            isLoading: false,
        });
    };

    const handleConfirmModalOk = async () => {
        const { record, targetStatus } = confirmModalState;
        if (record && targetStatus) {
            setConfirmModalState(prev => ({ ...prev, isLoading: true }));
            try {
                await handleUpdateStatus(record.orderId, targetStatus);
                setConfirmModalState({
                    visible: false,
                    record: null,
                    targetStatus: null,
                    isLoading: false,
                });
            } catch (error) {
                setConfirmModalState(prev => ({ ...prev, isLoading: false }));
            }
        }
    };

    const handleConfirmModalCancel = () => {
        setConfirmModalState({
            visible: false,
            record: null,
            targetStatus: null,
            isLoading: false,
        });
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Spinner size="large" />
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <FaExclamationTriangle size={40} />
                <h2>Đã xảy ra lỗi</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1>
                <FaTruck /> Quản lý đơn hàng
            </h1>

            <div className={styles.tabContainer}>
                <div 
                    className={`${styles.tab} ${activeTab === 'available' ? styles.active : ''}`}
                    onClick={() => setActiveTab('available')}
                >
                    <FaBox /> Đơn hàng có sẵn
                </div>
                <div 
                    className={`${styles.tab} ${activeTab === 'assigned' ? styles.active : ''}`}
                    onClick={() => setActiveTab('assigned')}
                >
                    <FaTruck /> Đơn hàng đã nhận
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.orderTable}>
                    <thead>
                        <tr>
                            <th>Mã đơn hàng</th>
                            <th>Ngày đặt</th>
                            <th>Địa chỉ giao hàng</th>
                            <th>Trạng thái</th>
                            <th>Tổng tiền</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.orderId}>
                                <td>#{order.orderId}</td>
                                <td>{formatDate(order.createdAt)}</td>
                                <td>{order.shippingAddress}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles[`status${order.status}`]}`}>
                                        {STATUS_DETAILS[order.status]?.label || order.status}
                                    </span>
                                </td>
                                <td>{formatCurrency(order.totalAmount)}</td>
                                <td>
                                    {activeTab === 'available' ? (
                                        <button 
                                            className={`${styles.actionButton} ${styles.acceptButton}`}
                                            onClick={() => showAcceptOrderConfirm(order.orderId)}
                                        >
                                            Nhận đơn
                                        </button>
                                    ) : (
                                        <div className={styles.actionButtons}>
                                            {order.status === 'SHIPPING' && (
                                                <>
                                                    <Tooltip title="Xác nhận đã giao hàng">
                                                        <button 
                                                            className={`${styles.actionButton} ${styles.updateStatusButton}`}
                                                            onClick={() => showStatusChangeConfirm(order, 'DELIVERED')}
                                                        >
                                                            <FaTruck /> Đã giao
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip title="Báo giao hàng thất bại">
                                                        <button 
                                                            className={`${styles.actionButton} ${styles.failButton}`}
                                                            onClick={() => showStatusChangeConfirm(order, 'FAILED_DELIVERY')}
                                                        >
                                                            <FaExclamationTriangle /> Thất bại
                                                        </button>
                                                    </Tooltip>
                                                </>
                                            )}
                                            <Tooltip title="Xem chi tiết đơn hàng">
                                                <button 
                                                    className={`${styles.actionButton} ${styles.viewButton}`}
                                                    onClick={() => setDetailsModalContent({
                                                        visible: true,
                                                        orderId: order.orderId
                                                    })}
                                                >
                                                    <FaEye />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredOrders.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>Không có đơn hàng nào {activeTab === 'available' ? 'có sẵn' : 'đã nhận'}</p>
                    </div>
                )}
            </div>

            {/* Modal xác nhận nhận đơn hàng */}
            <Modal
                title="Xác nhận nhận đơn hàng"
                open={acceptOrderModal.visible}
                onOk={handleAcceptOrderConfirm}
                onCancel={handleAcceptOrderCancel}
                confirmLoading={acceptOrderModal.isLoading}
            >
                {acceptOrderModal.orderId && (
                    <div>
                        <p>Bạn có chắc muốn nhận đơn hàng <strong>#{acceptOrderModal.orderId}</strong>?</p>
                        <p>Sau khi nhận đơn, bạn sẽ phải chịu trách nhiệm giao hàng cho khách.</p>
                    </div>
                )}
            </Modal>

            {/* Modal xác nhận thay đổi trạng thái */}
            <Modal
                title="Xác nhận thay đổi trạng thái"
                open={confirmModalState.visible}
                onOk={handleConfirmModalOk}
                onCancel={handleConfirmModalCancel}
                confirmLoading={confirmModalState.isLoading}
            >
                {confirmModalState.record && confirmModalState.targetStatus && (
                    <div>
                        <p>Đơn hàng: <strong>#{confirmModalState.record.orderId}</strong></p>
                        <p>Trạng thái hiện tại: <strong>{STATUS_DETAILS[confirmModalState.record.status]?.label}</strong></p>
                        <p>Chuyển thành: <strong>{STATUS_DETAILS[confirmModalState.targetStatus]?.label}</strong></p>
                        <p>Bạn có chắc muốn thực hiện thay đổi này?</p>
                    </div>
                )}
            </Modal>

            {/* Modal chi tiết đơn hàng */}
            <Modal
                title={`Chi tiết đơn hàng #${detailsModalContent.orderId || ''}`}
                open={detailsModalContent.visible}
                onCancel={() => setDetailsModalContent({ visible: false, orderId: null })}
                footer={null}
                width="80%"
                style={{ top: 20 }}
                bodyStyle={{ 
                    maxHeight: 'calc(100vh - 200px)', 
                    overflow: 'auto',
                    padding: '16px'
                }}
            >
                {detailsModalContent.visible && detailsModalContent.orderId && (
                    <ShipperOrderDetails 
                        orderId={detailsModalContent.orderId}
                    />
                )}
            </Modal>
        </div>
    );
};

export default ShipperPage;