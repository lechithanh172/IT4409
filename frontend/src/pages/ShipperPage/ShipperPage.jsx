import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom'; // Link might not be needed in this specific component based on current usage, but keeping it if it was in original context
import styles from './ShipperPage.module.css';
import apiService from '../../services/api'; // Assuming apiService is correctly configured
import { useAuth } from '../../contexts/AuthContext'; 
import Spinner from '../../components/Spinner/Spinner'; // Assuming Spinner component exists
import { FaTruck, FaBox, FaExclamationTriangle, FaFilter, FaEye, FaEdit, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa'; // Added FaSpinner for loading icons
import { Modal, Button, Tooltip, message, Typography, Table, Image, Tag, Card, Row, Col, Divider, Spin, Alert } from 'antd'; // Importing Ant Design components
import ShipperOrderDetails from './ShipperOrderDetails'; // Assuming ShipperOrderDetails component exists

const { Text, Paragraph, Title } = Typography;

// --- Helper Functions & Constants (Keep these as they were or refine as needed) ---
const STATUS_DETAILS = {
    PENDING: { label: "Chờ xử lý", color: "gold" }, // Could be initial status before shipper actions
    APPROVED: { label: "Đã duyệt", color: "blue" }, // Approved by shipper/admin?
    REJECTED: { label: "Bị từ chối", color: "error" }, // Rejected by shipper/admin?
    SHIPPING: { label: "Đang giao", color: "processing" },
    DELIVERED: { label: "Đã giao", color: "success" },
    FAILED_DELIVERY: { label: "Giao thất bại", color: "error" },
    // Add other potential statuses from backend if any
    PROCESSING: { label: "Đang xử lý", color: "blue" }, // Common e-commerce status
    CANCELLED: { label: "Đã hủy", color: "default" }, // Common e-commerce status
};

// This mapping seems more relevant for an Admin/Seller, 
// Shipper usually only transitions from ASSIGNED (implicitly) -> SHIPPING -> DELIVERED/FAILED_DELIVERY
// or maybe PENDING -> APPROVED/REJECTED if they have initial review power.
// The provided code uses PENDING, APPROVED, REJECTED, SHIPPING, DELIVERED, FAILED_DELIVERY
// Let's keep the logic simple based on the provided action buttons:
// PENDING -> APPROVED, REJECTED (assuming shipper can do this)
// APPROVED -> SHIPPING
// SHIPPING -> DELIVERED, FAILED_DELIVERY
// FAILED_DELIVERY -> SHIPPING (retry)
const VALID_SHIPPER_STATUS_TRANSITIONS = {
     // If Shipper can approve/reject PENDING orders assigned to them (uncommon flow, but based on code)
    PENDING: ["APPROVED", "REJECTED"], 
    APPROVED: ["SHIPPING"],
    REJECTED: [], // Cannot transition from REJECTED
    SHIPPING: ["DELIVERED", "FAILED_DELIVERY"],
    DELIVERED: [], // Cannot transition from DELIVERED
    FAILED_DELIVERY: ["SHIPPING"], // Can retry
};


const formatCurrency = (amount) => {
    const numAmount = typeof amount === 'number' ? amount : (typeof amount === 'string' ? parseFloat(amount) : 0);
    if (isNaN(numAmount)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numAmount);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        // Attempt to parse ISO string or similar
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) {
             console.warn(`Invalid date string received: ${dateString}`);
             // Fallback attempt if it's just a date like YYYY-MM-DD
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

// These getOrderStatusText and getStatusClass seem custom and might overlap with STATUS_DETAILS
// Let's primarily use STATUS_DETAILS for consistency, but keep getStatusClass if styles are defined this way.
const getOrderStatusText = (status) => {
     return STATUS_DETAILS[status]?.label || status || 'Không xác định';
};

const getStatusClass = (status) => {
    switch (status) {
        case 'PENDING': return styles.statusPending;
        case 'APPROVED': return styles.statusApproved; // Added based on STATUS_DETAILS
        case 'REJECTED': return styles.statusRejected; // Added based on STATUS_DETAILS
        case 'PROCESSING': return styles.statusProcessing;
        case 'SHIPPING': return styles.statusShipping; // Changed from Shipped
        case 'DELIVERED': return styles.statusDelivered; // Changed from Completed
        case 'COMPLETED': return styles.statusCompleted; // If this status exists
        case 'CANCELLED': return styles.statusCancelled;
        case 'FAILED_DELIVERY': return styles.statusFailed; // Changed from Failed
        default: return styles.statusUnknown;
    }
};
// --- End Helper Functions ---


const ShipperPage = () => {
    useEffect(() => {
            document.title = "Shipper | HustShop";
        }, []);
    const { user } = useAuth(); // Get the current logged-in user
    const [activeTab, setActiveTab] = useState('available');
    const [allOrders, setAllOrders] = useState([]); // State to hold *all* orders (unassigned + assigned)
    const [isLoading, setIsLoading] = useState(true); // Initial loading state
    const [error, setError] = useState(null);

    // State for modals
    const [detailsModalContent, setDetailsModalContent] = useState({
        visible: false,
        orderId: null,
    });
    const [confirmModalState, setConfirmModalState] = useState({
        visible: false,
        record: null, // The order object being acted upon
        targetStatus: null,
        isLoading: false, // Loading state for the modal action
    });
    const [acceptOrderModal, setAcceptOrderModal] = useState({
        visible: false,
        orderId: null, // The ID of the order to accept
        isLoading: false, // Loading state for the accept action
    });

    // Fetch both unassigned and assigned orders
    const loadData = useCallback(async () => {
        if (!user || !user.userId) {
             // If user is not available, maybe show an error or redirect
             console.error("User or user ID not available for fetching orders.");
             setError("Thông tin người dùng không có sẵn.");
             setIsLoading(false);
             return;
        }

        setIsLoading(true);
        setError(null);
        try {
            console.log('Fetching unassigned orders...');
            const unassignedResponse = await apiService.getUnassignedOrders();
            const unassignedOrders = unassignedResponse.data || [];
            console.log('Unassigned orders response:', unassignedOrders);

            console.log(`Fetching assigned orders for shipper ${user.userId}...`);
            const assignedResponse = await apiService.getShipperOrders(user.userId);
            const assignedOrders = assignedResponse.data || [];
            console.log('Assigned orders response:', assignedOrders);

            // Combine both lists
            // Ensure no duplicates if an order might appear in both lists temporarily (shouldn't happen if API is correct)
            // A Set could be used, but simple concat assumes distinct lists from API
            const combinedOrders = [...unassignedOrders, ...assignedOrders];

            setAllOrders(combinedOrders);

        } catch (err) {
            console.error("Error loading data:", err.response ? err.response.data : err.message);
            setError("Có lỗi xảy ra khi tải dữ liệu đơn hàng. Vui lòng thử lại.");
             // Clear orders on error
            setAllOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [user]); // Depend on user to refetch if user changes (unlikely but safe)

    // Load data on component mount and when the user object is ready
    useEffect(() => {
        if (user && user.userId) {
            loadData();
        } else if (!user) {
             // Handle case where user is null (not authenticated)
             setIsLoading(false);
             setError("Bạn cần đăng nhập để xem trang này.");
        }
    }, [user, loadData]); // Depend on user and loadData

    // Filter orders based on the active tab
    const filteredOrders = useMemo(() => {
        // Ensure user is available before filtering assigned orders
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

        // Optional: Sort orders (e.g., by date descending)
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
                // Call API to assign the order to the current shipper
                await apiService.assignOrder(orderId, user.userId);
                message.success(`Đã nhận đơn hàng #${orderId} thành công.`);
                setAcceptOrderModal({
                    visible: false,
                    orderId: null,
                    isLoading: false,
                });
                // Refetch data to update both lists
                await loadData();
                // Automatically switch to the 'assigned' tab after accepting
                setActiveTab('assigned');
            } catch (err) {
                console.error("Error accepting order:", err.response ? err.response.data : err.message);
                message.error("Không thể nhận đơn hàng này. Vui lòng thử lại.");
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

    // Function to perform the status update API call
    const performStatusUpdate = async (orderId, newStatus) => {
        try {
            // Assuming apiService.applyOrderStatus takes { orderId, status }
            await apiService.applyOrderStatus({
                orderId: orderId,
                status: newStatus
            });
            message.success(`Cập nhật trạng thái đơn hàng #${orderId} thành công.`);
            // Refetch data to ensure lists are updated
            await loadData();
        } catch (err) {
            console.error("Error updating order status:", err.response ? err.response.data : err.message);
            message.error("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.");
            throw err; // Re-throw to allow modal handler to catch and manage loading state
        }
    };

    const showStatusChangeConfirm = (record, targetStatus) => {
        // Optional: Add checks here if the transition is valid according to VALID_SHIPPER_STATUS_TRANSITIONS
        // const allowedTransitions = VALID_SHIPPER_STATUS_TRANSITIONS[record.status] || [];
        // if (!allowedTransitions.includes(targetStatus)) {
        //     message.warning(`Không thể chuyển trạng thái từ "${getStatusText(record.status)}" sang "${getStatusText(targetStatus)}".`);
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
                await performStatusUpdate(record.orderId, targetStatus);
                // Close modal and reset state on success
                setConfirmModalState({
                    visible: false,
                    record: null,
                    targetStatus: null,
                    isLoading: false,
                });
            } catch {
                // Error message is shown in performStatusUpdate
                // Just ensure modal loading state is reset
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

    // --- Render Logic ---

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" indicator={<FaSpinner className="fa-spin" style={{ fontSize: 50 }} />} />
                <p>Đang tải dữ liệu đơn hàng...</p>
            </div>
        );
    }

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

    if (!user || !user.userId) {
        // Should ideally be handled by route protection, but as a fallback
         return (
             <div className={styles.errorContainer}>
                 <FaExclamationTriangle size={40} color="#ff4d4f" />
                 <h2>Truy cập bị từ chối</h2>
                 <p>Bạn cần đăng nhập với vai trò Shipper để xem trang này.</p>
             </div>
         );
    }


    return (
        <div className={styles.container}>
            <Title level={2}><FaTruck /> Quản lý đơn hàng giao nhận</Title>

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

            <div className={styles.tableContainer}>
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
                                        {/* Using Ant Design Tag for status appearance */}
                                        <Tag color={STATUS_DETAILS[order.status]?.color || 'default'}>
                                             {STATUS_DETAILS[order.status]?.label || order.status}
                                        </Tag>
                                        {/* <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span> */}
                                    </td>
                                    <td>{formatCurrency(order.totalAmount)}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            {activeTab === 'available' && (
                                                <Tooltip title="Nhận đơn hàng này">
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        onClick={() => showAcceptOrderConfirm(order.orderId)}
                                                        icon={<FaCheck />}
                                                    >
                                                        Nhận đơn
                                                    </Button>
                                                </Tooltip>
                                            )}

                                            {activeTab === 'assigned' && (
                                                <>
                                                    {/* Conditional status update buttons based on current status */}
                                                    {order.status === 'PENDING' && ( // Assuming shipper can approve/reject PENDING
                                                        <>
                                                            <Tooltip title="Duyệt đơn hàng">
                                                                <Button
                                                                    type="primary"
                                                                    size="small"
                                                                    onClick={() => showStatusChangeConfirm(order, 'APPROVED')}
                                                                    icon={<FaCheck />}
                                                                    style={{ backgroundColor: 'green', borderColor: 'green' }} // Custom style for approve
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
                                                                >
                                                                    Đã giao
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip title="Báo cáo giao hàng thất bại">
                                                                 <Button
                                                                     type="danger"
                                                                     size="small"
                                                                     onClick={() => showStatusChangeConfirm(order, 'FAILED_DELIVERY')}
                                                                     style={{ backgroundColor: 'yellow', borderColor: 'yellow' }}
                                                                     icon={<FaExclamationTriangle />
                                                                        
                                                                     }
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
                                                             >
                                                                 Giao lại
                                                             </Button>
                                                         </Tooltip>
                                                     )}
                                                    {/* Add other status buttons if needed, e.g., for CANCELLED, COMPLETED */}
                                                </>
                                            )}

                                            {/* View Details Button (available in both tabs) */}
                                            <Tooltip title="Xem chi tiết đơn hàng">
                                                <Button
                                                    size="small"
                                                    onClick={() => setDetailsModalContent({
                                                        visible: true,
                                                        orderId: order.orderId
                                                    })}
                                                    icon={<FaEye />}
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
                        {activeTab === 'available' && !isLoading && !error && (
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
                confirmLoading={acceptOrderModal.isLoading}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                {acceptOrderModal.orderId && (
                    <div>
                        <p>Bạn có chắc muốn nhận đơn hàng <strong>#{acceptOrderModal.orderId}</strong>?</p>
                        <p>Sau khi nhận đơn, bạn sẽ phải chịu trách nhiệm giao hàng cho khách.</p>
                         {acceptOrderModal.isLoading && <p><Spin size="small" /> Đang xử lý...</p>}
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
                 okText="Xác nhận"
                 cancelText="Hủy"
            >
                {confirmModalState.record && confirmModalState.targetStatus && (
                    <div>
                        <p>Đơn hàng: <strong>#{confirmModalState.record.orderId}</strong></p>
                        <p>Trạng thái hiện tại: <Tag color={STATUS_DETAILS[confirmModalState.record.status]?.color || 'default'}>{STATUS_DETAILS[confirmModalState.record.status]?.label || confirmModalState.record.status}</Tag></p>
                        <p>Chuyển thành: <Tag color={STATUS_DETAILS[confirmModalState.targetStatus]?.color || 'default'}>{STATUS_DETAILS[confirmModalState.targetStatus]?.label || confirmModalState.targetStatus}</Tag></p>
                        <p>Bạn có chắc muốn thực hiện thay đổi này?</p>
                         {confirmModalState.isLoading && <p><Spin size="small" /> Đang xử lý...</p>}
                    </div>
                )}
            </Modal>

            {/* Modal chi tiết đơn hàng */}
            <Modal
                title={`Chi tiết đơn hàng #${detailsModalContent.orderId || ''}`}
                open={detailsModalContent.visible}
                onCancel={() => setDetailsModalContent({ visible: false, orderId: null })}
                footer={null} // No footer needed for details
                width="80%"
                style={{ top: 20 }} // Position slightly down from the top
                bodyStyle={{
                    maxHeight: 'calc(100vh - 200px)', // Limit height for scrollability
                    overflowY: 'auto', // Enable vertical scroll
                    padding: '16px'
                }}
                destroyOnClose // Destroy component on close to ensure fresh data if opened again
            >
                {/* Only render ShipperOrderDetails if the modal is visible and orderId is set */}
                {detailsModalContent.visible && detailsModalContent.orderId && (
                    <ShipperOrderDetails
                        orderId={detailsModalContent.orderId}
                        // Pass a prop to indicate it's in a modal if needed by ShipperOrderDetails
                        isInModal={true}
                        // Optionally pass the order object itself if ShipperOrderDetails can use it to avoid re-fetching
                        // Although refetching in the details component is often simpler
                        // orderData={filteredOrders.find(o => o.orderId === detailsModalContent.orderId)}
                    />
                )}
            </Modal>
        </div>
    );
};


export default ShipperPage;