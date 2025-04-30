import React, { useState, useEffect, useCallback } from 'react';
// Import các component cần thiết từ Ant Design
import { Button, Card, Col, Divider, Dropdown, Menu, Modal, Row, Table, Tag, message, Typography, Spin } from 'antd';
// Import các icon cần thiết
import { EditOutlined, ExclamationCircleFilled } from '@ant-design/icons';
// Import service API (ngay cả khi đang dùng dữ liệu cứng/giả lập)
import apiService from '../../../services/api'; // Đảm bảo đường dẫn đúng

// Destructure các component từ Typography và Modal
const { Text, Paragraph, Title } = Typography;
const { confirm } = Modal;

// --- Hàm trợ giúp & Component hiển thị Tag Trạng thái (Sao chép từ AdminOrder.jsx hoặc import từ file dùng chung) ---
const formatCurrency = (value) => {
    // Định dạng số thành tiền tệ Việt Nam
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};
function formatDate(isoString) {
    // Định dạng chuỗi ISO date thành ngày giờ Việt Nam
     if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
         if (isNaN(date.getTime())) return 'Invalid Date'; // Kiểm tra ngày hợp lệ
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    } catch (error) {
         console.error("Lỗi định dạng ngày:", isoString, error);
         return 'Invalid Date';
    }
}
// Định nghĩa chi tiết hiển thị cho từng trạng thái đơn hàng
const STATUS_DETAILS = {
    PENDING: { label: 'Chờ xử lý', color: 'gold' },
    APPROVED: { label: 'Đã duyệt', color: 'lime' },
    REJECTED: { label: 'Bị từ chối', color: 'error' },
    SHIPPING: { label: 'Đang giao', color: 'processing' },
    DELIVERED: { label: 'Đã giao', color: 'success' },
    CANCELLED: { label: 'Đã hủy', color: 'red' },
};
// Component hiển thị Tag trạng thái giao hàng
const DeliveryStatusComponent = ({ deliveryStatus }) => {
    const statusUpper = deliveryStatus?.toUpperCase();
    const details = STATUS_DETAILS[statusUpper] || { label: deliveryStatus || 'N/A', color: 'default' };
    return <Tag color={details.color}>{details.label}</Tag>;
};
// Component hiển thị Tag trạng thái thanh toán
const PaymentStatusComponent = ({ paymentStatus }) => {
    let color;
    let text = paymentStatus || 'N/A';
     switch (paymentStatus?.toUpperCase()) {
        case 'PENDING': color = 'warning'; text = 'Chờ TT'; break;
        case 'COMPLETED': color = 'success'; text = 'Đã TT'; break;
        case 'FAILED': color = 'error'; text = 'Thất bại'; break;
        default: color = 'default';
    }
    return <Tag color={color}>{text}</Tag>;
};

// --- Component Row hiển thị chi tiết (Tái sử dụng) ---
const DetailRow = ({ label, value, isBold = false, spanLabel = 6, spanValue = 18 }) => (
    <Row gutter={[16, 8]} style={{ marginBottom: '8px', alignItems: 'flex-start' }}>
        {/* Cột nhãn */}
        <Col span={spanLabel} style={{ color: '#555', textAlign: 'right', paddingTop: '3px' }}>
            <Text strong={isBold}>{label}:</Text>
        </Col>
        {/* Cột giá trị */}
        <Col span={spanValue}>
            {/* Kiểm tra nếu giá trị là component React (như Tag) thì render trực tiếp */}
            {React.isValidElement(value) ? value : <Text style={{ fontSize: '15px', lineHeight: '1.5' }}>{value || 'N/A'}</Text>}
        </Col>
    </Row>
);

// --- Định nghĩa các bước chuyển trạng thái hợp lệ (Nên giống với AdminOrder) ---
const VALID_STATUS_TRANSITIONS = {
    PENDING: ['APPROVED', 'REJECTED'],
    APPROVED: ['SHIPPING', 'REJECTED'],
    SHIPPING: ['DELIVERED', 'REJECTED'],
    DELIVERED: [], // Không thể thay đổi từ Delivered trong UI này
    REJECTED: [],  // Không thể thay đổi từ Rejected
    CANCELLED: [], // Không thể thay đổi từ Cancelled
};

// --- Component Chính OrderDetails ---
const OrderDetails = ({ order: initialOrder, handleRefresh }) => { // Nhận prop handleRefresh từ AdminOrder

    // --- STATE Cục bộ cho Modal ---
    const [order, setOrder] = useState(initialOrder); // Lưu trữ chi tiết đơn hàng hiện tại (nhận từ prop)
    const [currentOrderStatus, setCurrentOrderStatus] = useState(initialOrder?.orderStatus); // Quản lý trạng thái hiển thị trong modal
    const [isStatusModalVisible, setIsStatusModalVisible] = useState(false); // Hiển thị/ẩn modal xác nhận đổi trạng thái
    const [newStatusToConfirm, setNewStatusToConfirm] = useState(null); // Trạng thái mới đang chờ xác nhận
    const [loadingStatusUpdate, setLoadingStatusUpdate] = useState(false); // Trạng thái loading khi đang gọi API đổi trạng thái
    const [loadingOrderDetails, setLoadingOrderDetails] = useState(false); // State loading (hiện không dùng nhưng giữ lại phòng khi cần fetch lại chi tiết)

    // --- Đồng bộ State khi Prop thay đổi ---
    // Cập nhật state cục bộ nếu prop `initialOrder` từ component cha thay đổi
    useEffect(() => {
        setOrder(initialOrder);
        setCurrentOrderStatus(initialOrder?.orderStatus);
    }, [initialOrder]);

    // Lấy thông tin user từ prop `order` (đã được xử lý ở AdminOrder)
    const user = order?.userId; // Mong đợi object user đầy đủ ở đây

    // --- Định nghĩa cột cho Bảng Sản phẩm ---
    const itemsColumns = [
        {
            title: 'Sản phẩm',
            key: 'product',
            // Render tên sản phẩm từ object productId đã được nhúng
            render: (_, record) => (
                 <Text>{record.productId?.productName || 'Sản phẩm không xác định'}</Text>
            ),
        },
        {
            title: 'Phiên bản',
            key: 'variant',
            // Render màu sắc từ object variantId đã được nhúng
             render: (_, record) => (
                <Text>{record.variantId?.color || 'Phiên bản không xác định'}</Text>
             ),
        },
        {
            title: 'SL', // Số lượng
            dataIndex: 'quantity', // Lấy trực tiếp từ item
            key: 'quantity',
            align: 'center',
            width: 60,
            render: (qty) => <Text>{qty || 0}</Text>, // Hiển thị 0 nếu không có
        },
        {
            title: 'Đơn giá',
            key: 'price',
            align: 'right',
             render: (_, record) => {
                 // Ưu tiên sử dụng giá đã tính toán trước (nếu có)
                 if (typeof record.calculatedPrice === 'number') {
                    return <Text>{formatCurrency(record.calculatedPrice)}</Text>;
                 }
                 // Fallback nếu không có giá tính sẵn
                 return <Text type="secondary">N/A</Text>;
            },
        },
        {
            title: 'Thành tiền',
            key: 'total',
            align: 'right',
             render: (_, record) => {
                 // Ưu tiên sử dụng tổng tiền dòng đã tính toán trước (nếu có)
                 if (typeof record.calculatedTotal === 'number') {
                    return <Text strong>{formatCurrency(record.calculatedTotal)}</Text>;
                 }
                 // Fallback
                return <Text type="secondary">N/A</Text>;
            },
        },
    ];

    // --- Logic Thay đổi Trạng thái (Giả lập API) ---
    const handleApplyStatusInModal = useCallback(async (orderId, currentStatus, newStatus) => {
        if (!orderId || !newStatus) return; // Kiểm tra đầu vào
        const currentStatusUpper = currentStatus?.toUpperCase();
        const newStatusUpper = newStatus?.toUpperCase();
        const validTransitions = VALID_STATUS_TRANSITIONS[currentStatusUpper] || [];
        // Kiểm tra tính hợp lệ của việc chuyển trạng thái
        if (!validTransitions.includes(newStatusUpper)) {
            message.warning(`Không thể chuyển từ trạng thái '${currentStatus}' sang '${newStatus}'.`);
            return;
        }

        setLoadingStatusUpdate(true); // Bắt đầu loading
        try {
            // Gọi API giả lập (đã comment trong apiService)
            await apiService.applyOrderStatus(orderId, newStatus.toLowerCase()); // API có thể cần lowercase

            // Cập nhật state cục bộ ngay lập tức để phản hồi nhanh cho người dùng
            setCurrentOrderStatus(newStatus);
            message.success(`(Giả lập) Đơn hàng #${orderId} đã cập nhật trạng thái thành ${STATUS_DETAILS[newStatusUpper]?.label || newStatus}.`);

            // Gọi hàm handleRefresh được truyền từ AdminOrder để làm mới danh sách chính
            if (handleRefresh) {
                handleRefresh();
            } else {
                console.warn("Hàm handleRefresh không được cung cấp cho OrderDetails");
            }

        } catch (error) { // Xử lý lỗi từ API (nếu không comment)
            console.error(`Lỗi giả lập khi áp dụng trạng thái ${newStatus} cho đơn ${orderId}:`, error);
            message.error(`Cập nhật trạng thái cho đơn hàng #${orderId} thất bại!`);
            // Tùy chọn: Hoàn tác lại state nếu API lỗi
            // setCurrentOrderStatus(currentStatus);
        } finally {
            // Luôn dừng loading và đóng modal xác nhận
            setLoadingStatusUpdate(false);
            setIsStatusModalVisible(false);
            setNewStatusToConfirm(null);
        }
    }, [handleRefresh]); // Phụ thuộc vào hàm handleRefresh từ props

    // --- Logic Modal Xác nhận ---
    // Hiển thị modal xác nhận
    const showStatusConfirm = (status) => {
        setNewStatusToConfirm(status); // Lưu trạng thái mới cần xác nhận
        setIsStatusModalVisible(true); // Mở modal
    };
    // Xử lý khi nhấn OK trên modal xác nhận
    const handleStatusOk = () => {
        // Gọi hàm xử lý thay đổi trạng thái với trạng thái đã lưu
        handleApplyStatusInModal(order?._id, currentOrderStatus, newStatusToConfirm);
    };
    // Xử lý khi nhấn Cancel trên modal xác nhận
    const handleStatusCancel = () => {
        setIsStatusModalVisible(false); // Đóng modal
        setNewStatusToConfirm(null); // Reset trạng thái chờ xác nhận
    };

    // --- Render Fallback/Loading ---
    // Hiển thị loading nếu đang fetch chi tiết (hiện không dùng)
    if (loadingOrderDetails) {
        return <div style={{ padding: '50px', textAlign: 'center' }}><Spin size="large" /></div>;
    }
    // Hiển thị nếu không có dữ liệu order hợp lệ
    if (!order || !order._id) {
        return <Card><Paragraph>Không tìm thấy thông tin đơn hàng hoặc ID không hợp lệ.</Paragraph></Card>;
    }

    // --- Xác định xem có thể thay đổi trạng thái thủ công không ---
    const currentStatusUpperForCheck = currentOrderStatus?.toUpperCase();
    // Lấy danh sách các trạng thái tiếp theo hợp lệ từ VALID_STATUS_TRANSITIONS
    const possibleNextStatuses = VALID_STATUS_TRANSITIONS[currentStatusUpperForCheck] || [];
    // Biến boolean cho biết có hành động thay đổi trạng thái nào khả dụng không
    const canChangeStatusManually = possibleNextStatuses.length > 0;

    // --- Tạo Menu cho Dropdown ---
     const statusMenu = (
        <Menu>
            {/* Lặp qua các trạng thái tiếp theo khả dụng */}
            {possibleNextStatuses.map(status => (
                 <Menu.Item
                    key={status}
                    // Đánh dấu màu đỏ cho các hành động nguy hiểm (REJECTED, CANCELLED)
                    danger={['REJECTED', 'CANCELLED'].includes(status)}
                    // Khi click vào menu item, hiển thị modal xác nhận
                    onClick={() => showStatusConfirm(status)} // Truyền trạng thái (viết hoa) để hiển thị đúng label
                 >
                     {/* Nhãn hiển thị trên menu item */}
                     Chuyển sang "{STATUS_DETAILS[status]?.label || status}"
                 </Menu.Item>
             ))}
        </Menu>
    );

    return (
        // Fragment để chứa Card và Modal
        <>
            {/* Card chứa nội dung chi tiết */}
            <Card title={`Chi tiết đơn hàng #${order._id}`} bordered={false} style={{ padding: 0 }}>
                 {/* Layout Row/Col cho thông tin đơn hàng và khách hàng */}
                 <Row gutter={[32, 24]}>
                     {/* Cột Thông tin đơn hàng */}
                     <Col xs={24} lg={12}>
                         <Title level={5} style={{ marginBottom: 15, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>Thông tin đơn hàng</Title>
                         <DetailRow label="Mã ĐH" value={order._id} />
                         <DetailRow label="Ngày đặt" value={formatDate(order.createdAt)} />
                         <DetailRow label="Phương thức TT" value={order.paymentMethod} />
                         <DetailRow label="Trạng thái TT" value={<PaymentStatusComponent paymentStatus={order.paymentStatus} />} />
                         {/* Hiển thị trạng thái đơn hàng hiện tại (từ state) */}
                         <DetailRow label="Trạng thái ĐH" value={<DeliveryStatusComponent deliveryStatus={currentOrderStatus} />} />
                         <DetailRow label="Ghi chú KH" value={order.note || '(Không có)'} />

                         {/* --- Dropdown thay đổi trạng thái (hiển thị có điều kiện) --- */}
                         {canChangeStatusManually && (
                             <Row gutter={[16, 8]} style={{ marginTop: 10, alignItems: 'center' }}>
                                 <Col span={6} style={{ color: '#555', textAlign: 'right' }}><Text strong>Hành động:</Text></Col>
                                 <Col span={18}>
                                     <Dropdown
                                         overlay={statusMenu} // Menu các lựa chọn
                                         trigger={['click']} // Mở khi click
                                         disabled={loadingStatusUpdate} // Vô hiệu hóa khi đang cập nhật
                                     >
                                         <Button size="small" icon={<EditOutlined />} loading={loadingStatusUpdate}>
                                             Đổi trạng thái
                                         </Button>
                                     </Dropdown>
                                 </Col>
                             </Row>
                         )}
                     </Col>

                     {/* Cột Thông tin khách hàng */}
                     <Col xs={24} lg={12}>
                          <Title level={5} style={{ marginBottom: 15, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>Thông tin khách hàng</Title>
                          {user ? ( // Kiểm tra nếu có thông tin user
                             <>
                                 <DetailRow label="Tên KH" value={user.userName} />
                                 <DetailRow label="Email" value={user.email || 'N/A'} />
                                 <DetailRow label="Điện thoại" value={user.phoneNumber || 'N/A'} />
                                 {/* Ưu tiên hiển thị địa chỉ giao hàng cụ thể của đơn này */}
                                 <DetailRow label="Địa chỉ GH" value={order.shippingAddress || user.address || '(Không có)'} />
                             </>
                          ) : ( // Hiển thị nếu không có thông tin user
                            <Paragraph type="secondary">Không có thông tin người dùng.</Paragraph>
                          )}
                     </Col>
                 </Row>

                 {/* Đường kẻ phân cách */}
                 <Divider style={{ margin: '24px 0' }} />

                 {/* Bảng danh sách sản phẩm */}
                 <Title level={5} style={{ marginBottom: 15 }}>Sản phẩm trong đơn</Title>
                 <Table
                     dataSource={order.items || []} // Dữ liệu là mảng items từ prop order
                     columns={itemsColumns} // Các cột đã định nghĩa
                     // Tạo key duy nhất cho mỗi hàng (quan trọng cho React)
                     rowKey={(item, index) => `${item.productId?.productId || `p-${index}`}-${item.variantId?.variantId || `v-${index}`}`}
                     pagination={false} // Không cần phân trang trong modal chi tiết
                     bordered // Có viền
                     size="middle" // Kích thước vừa phải
                     scroll={{ x: 'max-content' }} // Cho phép cuộn ngang nếu cần
                     // Phần tóm tắt cuối bảng
                     summary={() => (
                         <Table.Summary.Row>
                             <Table.Summary.Cell index={0} colSpan={4} align="right"><Text strong style={{ fontSize: '15px' }}>Tổng cộng:</Text></Table.Summary.Cell>
                             {/* Hiển thị tổng tiền của đơn hàng */}
                             <Table.Summary.Cell index={1} align="right"><Text strong style={{ fontSize: '15px', color: '#d32f2f' }}>{formatCurrency(order.totalAmount)}</Text></Table.Summary.Cell>
                         </Table.Summary.Row>
                     )}
                 />
            </Card>

            {/* --- Modal Xác nhận thay đổi trạng thái --- */}
             <Modal
                title="Xác nhận thay đổi trạng thái"
                open={isStatusModalVisible} // Trạng thái hiển thị modal
                onOk={handleStatusOk} // Hàm xử lý khi nhấn OK
                onCancel={handleStatusCancel} // Hàm xử lý khi nhấn Cancel
                confirmLoading={loadingStatusUpdate} // Hiển thị loading trên nút OK
                okText="Xác nhận"
                cancelText="Hủy"
                destroyOnClose // Hủy state của modal khi đóng
            >
                {/* Nội dung xác nhận */}
                <Paragraph>
                    Bạn có chắc chắn muốn đổi trạng thái đơn hàng này thành "{STATUS_DETAILS[newStatusToConfirm?.toUpperCase()]?.label || newStatusToConfirm}"?
                </Paragraph>
            </Modal>
        </>
    );
};

export default OrderDetails;