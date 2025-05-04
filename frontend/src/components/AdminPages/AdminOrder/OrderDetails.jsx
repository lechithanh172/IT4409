import { EditOutlined, ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Dropdown, Menu, Modal, Row, Table, Tag, message } from 'antd';

import React, { useState, useEffect } from 'react';
import apiService from '../../../services/api';


const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value);
};

const DeliveryStatusComponent = ({ deliveryStatus }) => {
    let statusColor;

    switch (deliveryStatus) {
        case 'Processing':
            statusColor = 'orange';
            break;
        case 'Shipped':
            statusColor = 'blue';
            break;
        case 'Delivered':
            statusColor = 'green';
            break;
        case 'Cancelled':
            statusColor = 'red';
            break;
        default:
            statusColor = 'gray';
    }

    return <Tag color={statusColor}>{deliveryStatus}</Tag>;
};

const PaymentStatusComponent = ({ paymentStatus }) => {
    let statusColor;
    switch (paymentStatus) {
        case 'Pending':
            statusColor = 'orange';
            break;
        case 'Completed':
            statusColor = 'green';
            break;
        case 'Failed':
            statusColor = 'red';
            break;
        default:
            statusColor = 'gray';
    }
    return <Tag color={statusColor}>{paymentStatus}</Tag>;
};

function formatDate(isoString) {
    // Chuyển đổi chuỗi ISO 8601 thành đối tượng Date
    const date = new Date(isoString);

    // Lấy các thành phần của ngày và giờ theo giờ địa phương
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() trả về giá trị từ 0 đến 11
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Định dạng thành chuỗi theo định dạng DD/MM/YYYY HH:MM:SS
    return `${hours}:${minutes}:${seconds}  ${day}/${month}/${year} `;
}

const Row2 = ({ label, value }) => (
    <Row gutter={[16, 16]}>
        <Col span={1}></Col>
        <Col span={5} style={{ fontSize: 16, color: '#929292' }}>
            {label}:
        </Col>
        <Col span={18} style={{ fontSize: 18 }}>
            {value}
        </Col>
    </Row>
);

const Row1 = ({ label, value }) => (
    <Row gutter={[16, 16]}>
        <Col span={6} style={{ fontSize: 16, fontWeight: 'bold' }}>
            {label}:
        </Col>
        <Col span={18} style={{ fontSize: 18 }}>
            {value}
        </Col>
    </Row>
);

const OrderDetails = ({ order, handleRefresh }) => {
    const [orderStatus, setOrderStatus] = useState(order.orderStatus);
    const { userId } = order;
    const user = userId;
    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productName',
            key: 'name',
            render: (_, record) => record.productId.name,
        },
        {
            title: 'Mẫu',
            dataIndex: 'Mẫu',
            key: 'mau',
            render: (_, record) => record.variant.color,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (_, record) => {
                // Tính tổng số lượng từ tất cả các biến thể (variant)
                const totalQuantity = record.variant?.quantity || 0;
                return totalQuantity;
            },
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            render: (_, record) => {
                // Tính đơn giá sau khi trừ đi sale của mẫu
                const sale = record.variant?.sale || 0;
                const discountedPrice = record.productId.price - record.productId.price * (sale / 100);
                return formatCurrency(discountedPrice);
            },
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            render: (_, record) => {
                // Tính đơn giá sau khi trừ đi sale của mẫu
                const sale = record.variant?.sale || 0;
                const discountedPrice = record.productId.price - record.productId.price * (sale / 100);
                const total = discountedPrice * record.variant.quantity;
                return formatCurrency(total);
            },
        },
    ];

    const menu = (
        <Menu>
            <Menu.Item onClick={() => showConfirm('Processing')}>Đang xử lý</Menu.Item>
            <Menu.Item onClick={() => showConfirm('Shipped')}>Đã gửi</Menu.Item>
            <Menu.Item onClick={() => showConfirm('Delivered')}>Đã giao</Menu.Item>
        </Menu>
    );

    // Hàm để thay đổi trạng thái giao hàng
    const handleChangeDeliveryStatus = async (orderId, status) => {
        try {
            const response = await apiService.updateOrderAdmin(orderId, status);

            if (response.status === 200) {
                message.success('Trạng thái đơn hàng đã được cập nhật');
                console.log('Order status updated:', response.data.order);

                // Cập nhật trạng thái trong state nếu cần
                setOrderStatus(status);
                handleRefresh(); // Làm mới dữ liệu
            } else {
                // Xử lý trường hợp API không trả về status 200
                console.error('Error updating order status:', response.data?.message || 'Lỗi không xác định');
                message.error(response.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
            }
        } catch (error) {
            // Xử lý lỗi kết nối hoặc lỗi không xác định
            console.error('Error:', error);
            message.error('Lỗi kết nối hoặc xử lý yêu cầu');
        }
    };

    // Hàm mở Modal xác nhận thay đổi trạng thái
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newStatus, setNewStatus] = useState(null);

    const showConfirm = (status) => {
        setNewStatus(status);
        setIsModalVisible(true);
    };

    const handleOk = () => {
        handleChangeDeliveryStatus(order._id, newStatus);
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        setOrderStatus(order.orderStatus);
    }, [order.orderStatus]);

    return (
        <>
            <h2>Đơn hàng</h2>
            <div style={{ width: '70vw', padding: '10px 20px' }}>
                <Row1 label="Mã" value={order._id} />
                <Row1 label="Ngày đặt" value={formatDate(order.createdAt)} />
                <Row1 label="Hình thức thanh toán" value={order.paymentMethod} />

                <Row1 label="Người mua" value="" />
                <Row2 label="Tên" value={user.userName} />
                <Row2 label="Số điện thoại" value={user.phoneNumber} />
                <Row2 label="Địa chỉ" value={user.diaChi} />

                <Row1 label="Sản phẩm" />
                <Table
                    dataSource={order.items}
                    columns={columns}
                    size="large"
                    style={{ width: '100%' }}
                    pagination={false}
                    summary={(pageData) => {
                        let sum = 0;

                        // Tính tổng tiền cho từng sản phẩm trong pageData
                        pageData.forEach(({ productId, variant, quantity }) => {
                            const sale = variant?.sale || 0;
                            const discountedPrice = productId.price - productId.price * (sale / 100);
                            const totalProduct = discountedPrice * quantity;

                            sum += totalProduct; // Cộng tổng tiền của sản phẩm vào tổng tiền đơn hàng
                        });
                        return (
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                                <Table.Summary.Cell index={1}></Table.Summary.Cell>
                                <Table.Summary.Cell index={2}></Table.Summary.Cell>
                                <Table.Summary.Cell index={3}></Table.Summary.Cell>
                                <Table.Summary.Cell index={4} align="right">
                                    Tổng tiền hàng:
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={5} align="right">
                                    {formatCurrency(sum)}
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        );
                    }}
                />
                <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                    <Col span={6} style={{ fontSize: 16, fontWeight: 'bold' }}>
                        Tình trạng giao hàng:
                    </Col>
                    <Col span={6} style={{ fontSize: 18 }}>
                        <DeliveryStatusComponent deliveryStatus={orderStatus} />
                    </Col>
                    <Col span={12} style={{ fontSize: 18 }}>
                        <Dropdown overlay={menu}>
                            <Button icon={<EditOutlined />}>Thay đổi trạng thái</Button>
                        </Dropdown>
                    </Col>
                </Row>
                <Row gutter={[16, 16]} style={{ marginTop: 20, marginBottom: 20 }}>
                    <Col span={6} style={{ fontSize: 16, fontWeight: 'bold' }}>
                        Trạng thái:
                    </Col>
                    <Col span={16} style={{ fontSize: 18 }}>
                        <PaymentStatusComponent paymentStatus={order.paymentStatus} />
                    </Col>
                </Row>
            </div>
            <Modal
                title="Xác nhận thay đổi trạng thái"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                icon={<ExclamationCircleFilled />}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <p>Bạn có chắc chắn muốn thay đổi trạng thái giao hàng thành "{newStatus}"?</p>
            </Modal>
        </>
    );
};

export default OrderDetails;
