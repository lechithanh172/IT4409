import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './ShipperPage.module.css';
import apiService from '../../services/api'; // Assuming apiService is correctly configured
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/Spinner/Spinner'; // Assuming Spinner component exists
import { FaTruck, FaBox, FaExclamationTriangle, FaFilter, FaEye, FaEdit, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { Modal, Button, Tooltip, message, Typography, Table, Image, Tag, Card, Row, Col, Divider, Spin, Alert } from 'antd';
import ShipperOrderDetails from './ShipperOrderDetails'; // Assuming ShipperOrderDetails component exists

const { Text, Paragraph, Title } = Typography;

// --- Helper Functions & Constants ---
const STATUS_DETAILS = {
    PENDING: { label: "Chờ xử lý", color: "gold" },
    APPROVED: { label: "Đã duyệt", color: "blue" },
    REJECTED: { label: "Bị từ chối", color: "error" },
    SHIPPING: { label: "Đang giao", color: "processing" },
    DELIVERED: { label: "Đã giao", color: "success" },
    FAILED_DELIVERY: { label: "Giao thất bại", color: "error" },
    PROCESSING: { label: "Đang xử lý", color: "blue" },
    CANCELLED: { label: "Đã hủy", color: "default" },
};

const formatCurrency = (amount) => {
    const numAmount = typeof amount === 'number' ? amount : (typeof amount === 'string' ? parseFloat(amount) : 0);
    if (isNaN(numAmount)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numAmount);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
             const [year, month, day] = dateString.split('-').map(Number);
             if (year && month && day) {
                const fallbackDate = new Date(year, month - 1, day);
                 if (!isNaN(fallbackDate.getTime())) {
                     return fallbackDate.toLocaleDateString('vi-VN');
                 }
             }
             return 'Ngày không hợp lệ';
        }
        return date.toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) { console.error("Error formatting date:", e, "Input:", dateString); return 'N/A'; }
};

// --- Component Starts ---

const ShipperPage = () => {
    useEffect(() => {
            document.title = "Shipper | HustShop";
        }, []);
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('available');
    const [allOrders, setAllOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Initial loading state
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

    // Function to fetch data - Wrapped in useCallback
    const loadData = useCallback(async () => {
        if (!user || !user.userId) {
             setError("Thông tin người dùng không có sẵn.");
             setIsLoading(false);
             return;
        }

        setIsLoading(true);
        setError(null); // Clear previous errors
        try {
            // Fetch unassigned orders
            const unassignedResponse = await apiService.getUnassignedOrders();
            const unassignedOrders = unassignedResponse.data || [];

            // Fetch orders assigned to the current shipper
            const assignedResponse = await apiService.getShipperOrders(user.userId);
            const assignedOrders = assignedResponse.data || [];

            // Combine and update state
            // Filter out any potential duplicates if an order could appear in both lists
             const combinedOrders = [...unassignedOrders];
             assignedOrders.forEach(assignedOrder => {
                 if (!combinedOrders.some(order => order.orderId === assignedOrder.orderId)) {
                     combinedOrders.push(assignedOrder);
                 }
             });

            setAllOrders(combinedOrders);

        } catch (err) {
            console.error("Error loading data:", err.response ? err.response.data : err.message);
            setError("Có lỗi xảy ra khi tải dữ liệu đơn hàng. Vui lòng thử lại.");
            setAllOrders([]); // Clear orders on error
        } finally {
            setIsLoading(false);
        }
    }, [user]); // Depend on user to refetch if user object changes

    // Initial data load on component mount
    useEffect(() => {
        if (user && user.userId) {
            loadData();
        } else if (!user) {
             setIsLoading(false);
             setError("Bạn cần đăng nhập để xem trang này.");
        }
    }, [user, loadData]); // Depend on user and the memoized loadData


    // Filter orders based on the active tab - Memoized
    const filteredOrders = useMemo(() => {
        if (!user || !user.userId) {
             return [];
        }

        let orders = allOrders;

        if (activeTab === 'available') {
            // Filter orders that have no shipper assigned
            orders = orders.filter(order => !order.shipperId);
        } else { // activeTab === 'assigned'
            // Filter orders assigned to the current shipper
            orders = orders.filter(order => order.shipperId === user.userId);
        }

        // Sort orders (e.g., by creation date descending)
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return orders;
    }, [allOrders, activeTab, user]); // Depend on allOrders, activeTab, and user (for userId)


    // --- Action Handlers ---

    const showAcceptOrderConfirm = (orderId) => {
        setAcceptOrderModal({
            visible: true,
            orderId,
            isLoading: false,
        });
    };

    const handleAcceptOrderConfirm = async () => {
        const { orderId } = acceptOrderModal;
        if (orderId && user && user.userId) {
            setAcceptOrderModal(prev => ({ ...prev, isLoading: true }));
            try {
                // Call API to assign the order
                await apiService.assignOrder(orderId, user.userId);

                // --- REFRESH DATA AFTER SUCCESS ---
                await loadData();
                // ---------------------------------

                message.success(`Đã nhận đơn hàng #${orderId} thành công.`);
                setAcceptOrderModal({
                    visible: false,
                    orderId: null,
                    isLoading: false,
                });
                // Automatically switch to the 'assigned' tab after accepting
                setActiveTab('assigned');

            } catch (err) {
                console.error("Error accepting order:", err.response ? err.response.data : err.message);
                message.error(err.response?.data?.message || "Không thể nhận đơn hàng này. Vui lòng thử lại.");
                setAcceptOrderModal(prev => ({ ...prev, isLoading: false }));
            }
        } else {
             console.error("Attempted to accept order without orderId or user info.");
             message.error("Lỗi hệ thống: Không đủ thông tin để nhận đơn hàng.");
             setAcceptOrderModal({ visible: false, orderId: null, isLoading: false }); // Close modal on info missing
        }
    };

    const handleAcceptOrderCancel = () => {
        setAcceptOrderModal({
            visible: false,
            orderId: null,
            isLoading: false,
        });
    };

    // Function to perform the status update API call and handle refresh
    const performStatusUpdate = async (orderId, newStatus) => {
        try {
            await apiService.applyOrderStatus({
                orderId: orderId,
                status: newStatus
            });

            // --- REFRESH DATA AFTER SUCCESS ---
            await loadData();
            // ---------------------------------

            message.success(`Cập nhật trạng thái đơn hàng #${orderId} thành công.`);

        } catch (err) {
            console.error("Error updating order status:", err.response ? err.response.data : err.message);
            message.error(err.response?.data?.message || "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.");
            throw err; // Re-throw to allow modal handler to catch and manage loading state
        }
    };

    const showStatusChangeConfirm = (record, targetStatus) => {
         // Optional: Add checks if the transition is valid
         // const allowedTransitions = VALID_SHIPPER_STATUS_TRANSITIONS[record.status] || [];
         // if (!allowedTransitions.includes(targetStatus)) {
         //     message.warning(`Không thể chuyển trạng thái từ "${STATUS_DETAILS[record.status]?.label || record.status}" sang "${STATUS_DETAILS[targetStatus]?.label || targetStatus}".`);
         //     return;
         // }

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
                // performStatusUpdate now includes loadData call
                await performStatusUpdate(record.orderId, targetStatus);
                // Close modal and reset state on success
                setConfirmModalState({
                    visible: false,
                    record: null,
                    targetStatus: null,
                    isLoading: false,
                });
            } catch (err) {
                // Error message is shown in performStatusUpdate,
                // just ensure modal loading state is reset
                 console.error("Modal OK catch:", err); // Log error that was re-thrown
                setConfirmModalState(prev => ({ ...prev, isLoading: false }));
            }
        } else {
             console.error("Attempted status update without record or targetStatus.");
             message.error("Lỗi hệ thống: Không đủ thông tin để cập nhật trạng thái.");
             setConfirmModalState({ visible: false, record: null, targetStatus: null, isLoading: false }); // Close modal
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

    // Handler for viewing details
    const handleViewDetails = (orderId) => {
         setDetailsModalContent({
            visible: true,
            orderId: orderId
        });
    };


    // --- Render Logic ---

    // Show a full-page spinner while initial data is loading
    if (isLoading && allOrders.length === 0 && !error) {
         return (
             <div className={styles.loadingContainer}>
                 <Spin size="large" indicator={<FaSpinner className="fa-spin" style={{ fontSize: 50 }} />} />
                 <p>Đang tải dữ liệu đơn hàng...</p>
             </div>
         );
    }

    // Show a global error message if loading failed
    if (error) {
        return (
            <div className={styles.errorContainer}>
                <FaExclamationTriangle size={40} color="#ff4d4f" />
                <h2>Đã xảy ra lỗi</h2>
                <p>{error}</p>
                {/* Provide a way to retry loading */}
                <Button type="primary" onClick={loadData}>
                    <FaSpinner style={{ marginRight: 8 }} /> Thử tải lại
                </Button>
            </div>
        );
    }

     // Handle case where user is not logged in (should ideally be protected by routing)
     if (!user || !user.userId) {
         return (
             <div className={styles.errorContainer}>
                 <FaExclamationTriangle size={40} color="#ff4d4f" />
                 <h2>Truy cập bị từ chối</h2>
                 <p>Bạn cần đăng nhập với vai trò Shipper để xem trang này.</p>
                  {/* Optional: Link to login */}
                  <Link to="/login">Đăng nhập</Link>
             </div>
         );
     }


    return (
        <div className={styles.container}>
            <Title level={2}><FaTruck /> Quản lý đơn hàng giao nhận</Title>

            {/* Tabs */}
            <div className={styles.tabContainer}>
                <div
                    className={`${styles.tab} ${activeTab === 'available' ? styles.active : ''}`}
                    onClick={() => setActiveTab('available')}
                >
                    <FaBox /> Đơn hàng có sẵn ({allOrders.filter(order => !order.shipperId).length})
                </div>
                <div
                    className={`${styles.tab} ${activeTab === 'assigned' ? styles.active : ''}`}
                    onClick={() => setActiveTab('assigned')}
                >
                    <FaTruck /> Đơn hàng đã nhận ({allOrders.filter(order => order.shipperId === user.userId).length})
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableContainer}>
                 {isLoading && allOrders.length > 0 && ( // Show a smaller spinner on table if already have data but refreshing
                     <div className={styles.loadingOverlay}>
                         <Spin size="large" indicator={<FaSpinner className="fa-spin" />} />
                     </div>
                 )}

                 {filteredOrders.length > 0 ? (
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
                                        <Tag color={STATUS_DETAILS[order.status]?.color || 'default'}>
                                             {STATUS_DETAILS[order.status]?.label || order.status}
                                        </Tag>
                                    </td>
                                    <td>{formatCurrency(order.totalAmount)}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            {/* Accept Button (only in 'available' tab) */}
                                            {activeTab === 'available' && (
                                                <Tooltip title="Nhận đơn hàng này">
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        onClick={() => showAcceptOrderConfirm(order.orderId)}
                                                        icon={<FaCheck />}
                                                         // Disable button while modal is loading or global loading happens
                                                        disabled={acceptOrderModal.isLoading || isLoading}
                                                    >
                                                        Nhận đơn
                                                    </Button>
                                                </Tooltip>
                                            )}

                                            {/* Status Change Buttons (only in 'assigned' tab) */}
                                            {activeTab === 'assigned' && (
                                                <>
                                                    {/* Conditional buttons based on current status */}
                                                    {/* Assuming shipper can approve/reject PENDING orders assigned to them */}
                                                    {order.status === 'PENDING' && (
                                                        <>
                                                            <Tooltip title="Duyệt đơn hàng">
                                                                <Button
                                                                    type="primary"
                                                                    size="small"
                                                                    onClick={() => showStatusChangeConfirm(order, 'APPROVED')}
                                                                    icon={<FaCheck />}
                                                                    style={{ backgroundColor: 'green', borderColor: 'green' }}
                                                                     // Disable button while modal is loading or global loading happens
                                                                    disabled={confirmModalState.isLoading || isLoading}
                                                                >
                                                                    Duyệt
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip title="Từ chối đơn hàng">
                                                                <Button
                                                                    type="danger"
                                                                    size="small"
                                                                    onClick={() => showStatusChangeConfirm(order, 'REJECTED')}
                                                                    icon={<FaTimes />}
                                                                     disabled={confirmModalState.isLoading || isLoading}
                                                                >
                                                                    Từ chối
                                                                </Button>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                    {order.status === 'APPROVED' && (
                                                         <Tooltip title="Bắt đầu giao hàng">
                                                             <Button
                                                                 type="primary"
                                                                 size="small"
                                                                 onClick={() => showStatusChangeConfirm(order, 'SHIPPING')}
                                                                 icon={<FaTruck />}
                                                                  disabled={confirmModalState.isLoading || isLoading}
                                                             >
                                                                 Bắt đầu giao
                                                             </Button>
                                                         </Tooltip>
                                                    )}
                                                    {order.status === 'SHIPPING' && (
                                                        <>
                                                            <Tooltip title="Xác nhận đã giao hàng thành công">
                                                                <Button
                                                                    type="primary"
                                                                    size="small"
                                                                    onClick={() => showStatusChangeConfirm(order, 'DELIVERED')}
                                                                    icon={<FaCheck />}
                                                                    style={{ backgroundColor: 'green', borderColor: 'green' }}
                                                                     disabled={confirmModalState.isLoading || isLoading}
                                                                >
                                                                    Đã giao
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip title="Báo cáo giao hàng thất bại">
                                                                 <Button
                                                                     type="danger"
                                                                     size="small"
                                                                     onClick={() => showStatusChangeConfirm(order, 'FAILED_DELIVERY')}
                                                                     style={{ backgroundColor: 'orange', borderColor: 'orange' }} // Changed to orange for failed
                                                                     icon={<FaExclamationTriangle />}
                                                                      disabled={confirmModalState.isLoading || isLoading}
                                                                 >
                                                                     Thất bại
                                                                 </Button>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                     {order.status === 'FAILED_DELIVERY' && (
                                                         <Tooltip title="Thử giao lại đơn hàng này">
                                                             <Button
                                                                 type="primary"
                                                                 size="small"
                                                                 onClick={() => showStatusChangeConfirm(order, 'SHIPPING')}
                                                                 icon={<FaTruck />}
                                                                  disabled={confirmModalState.isLoading || isLoading}
                                                             >
                                                                 Giao lại
                                                             </Button>
                                                         </Tooltip>
                                                     )}
                                                      {/* Buttons for FINAL statuses like DELIVERED, CANCELLED, REJECTED? */}
                                                      {/* Usually no actions needed for final states, but you might add "View Details" only */}
                                                </>
                                            )}

                                            {/* View Details Button (available in both tabs) */}
                                            <Tooltip title="Xem chi tiết đơn hàng">
                                                <Button
                                                    size="small"
                                                    onClick={() => handleViewDetails(order.orderId)} // Use the handler
                                                    icon={<FaEye />}
                                                     // Disable button while modal is loading or global loading happens
                                                    disabled={detailsModalContent.visible || confirmModalState.isLoading || acceptOrderModal.isLoading || isLoading}
                                                >
                                                    Xem
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 ) : (
                    // Empty State Message
                    <div className={styles.emptyState}>
                        <FaBox size={50} color="#ccc"/>
                        <p>Không có đơn hàng nào {activeTab === 'available' ? 'có sẵn' : 'đã nhận'} vào lúc này.</p>
                        {/* Only show suggestion if not loading and no error */}
                        {!isLoading && !error && (
                            <p>Hãy kiểm tra lại sau hoặc liên hệ quản trị viên.</p>
                        )}
                    </div>
                 )}
            </div>

            {/* Modal xác nhận nhận đơn hàng */}
            <Modal
                title="Xác nhận nhận đơn hàng"
                open={acceptOrderModal.visible}
                onOk={handleAcceptOrderConfirm}
                onCancel={handleAcceptOrderCancel}
                confirmLoading={acceptOrderModal.isLoading} // Ant Design uses confirmLoading for button spinner
                okText="Xác nhận"
                cancelText="Hủy"
                 // Disable closing by clicking outside or pressing Esc while loading
                closable={!acceptOrderModal.isLoading}
                maskClosable={!acceptOrderModal.isLoading}
            >
                {acceptOrderModal.orderId && (
                    <div>
                        <p>Bạn có chắc muốn nhận đơn hàng <strong>#{acceptOrderModal.orderId}</strong>?</p>
                        <p>Sau khi nhận đơn, bạn sẽ phải chịu trách nhiệm giao hàng cho khách.</p>
                         {/* Optional: Show text spinner if needed, though confirmLoading handles button */}
                         {/* {acceptOrderModal.isLoading && <p><Spin size="small" /> Đang xử lý...</p>} */}
                    </div>
                )}
            </Modal>

            {/* Modal xác nhận thay đổi trạng thái */}
            <Modal
                title="Xác nhận thay đổi trạng thái"
                open={confirmModalState.visible}
                onOk={handleConfirmModalOk}
                onCancel={handleConfirmModalCancel}
                confirmLoading={confirmModalState.isLoading} // Ant Design uses confirmLoading
                 okText="Xác nhận"
                 cancelText="Hủy"
                 // Disable closing while loading
                 closable={!confirmModalState.isLoading}
                 maskClosable={!confirmModalState.isLoading}
            >
                {confirmModalState.record && confirmModalState.targetStatus && (
                    <div>
                        <p>Đơn hàng: <strong>#{confirmModalState.record.orderId}</strong></p>
                        <p>Trạng thái hiện tại: <Tag color={STATUS_DETAILS[confirmModalState.record.status]?.color || 'default'}>{STATUS_DETAILS[confirmModalState.record.status]?.label || confirmModalState.record.status}</Tag></p>
                        <p>Chuyển thành: <Tag color={STATUS_DETAILS[confirmModalState.targetStatus]?.color || 'default'}>{STATUS_DETAILS[confirmModalState.targetStatus]?.label || confirmModalState.targetStatus}</Tag></p>
                        <p>Bạn có chắc muốn thực hiện thay đổi này?</p>
                         {/* {confirmModalState.isLoading && <p><Spin size="small" /> Đang xử lý...</p>} */}
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
                    overflowY: 'auto',
                    padding: '16px'
                }}
                destroyOnClose
            >
                {detailsModalContent.visible && detailsModalContent.orderId && (
                    <ShipperOrderDetails
                        orderId={detailsModalContent.orderId}
                        isInModal={true}
                    />
                )}
            </Modal>
        </div>
    );
};


export default ShipperPage;