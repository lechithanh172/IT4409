import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Image, Tag, Spin, Alert, Divider } from 'antd';
import apiService from '../../services/api';

const { Text, Title } = Typography;

const STATUS_DETAILS = {
    PENDING: { label: "Chờ xử lý", color: "gold" },
    SHIPPING: { label: "Đang giao", color: "processing" },
    DELIVERED: { label: "Đã giao", color: "success" },
    FAILED_DELIVERY: { label: "Giao thất bại", color: "error" },
    REJECTED: { label: "Bị từ chối", color: "error" },
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

const DetailRow = ({ label, value }) => (
    <Row style={{ marginBottom: '8px' }}>
        <Col span={8}>
            <Text type="secondary">{label}:</Text>
        </Col>
        <Col span={16}>
            <Text>{value || 'N/A'}</Text>
        </Col>
    </Row>
);

const ShipperOrderDetails = ({ orderId }) => {
    
    useEffect(() => {
            document.title = "Shipper | HustShop";
        }, []);
    const [orderData, setOrderData] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const [orderResponse, itemsResponse] = await Promise.all([
                    apiService.getOrderById(orderId),
                    apiService.getOrderItems(orderId)
                ]);

                if (orderResponse?.data) {
                    setOrderData(orderResponse.data);
                }

                if (itemsResponse?.data) {
                    setOrderItems(itemsResponse.data);
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError('Không thể tải thông tin đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Image
                        src={record.imageUrl || '/placeholder.png'}
                        alt={text}
                        width={50}  
                        height={50}
                        style={{ objectFit: 'cover' }}
                        preview={false}
                    />
                    <div>
                        <div>{text}</div>
                        {record.color && <Text type="secondary">Màu: {record.color}</Text>}
                    </div>
                </div>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            width: 100,
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            align: 'right',
            width: 150,
            render: (price) => formatCurrency(price),
        },
        {
            title: 'Thành tiền',
            key: 'total',
            align: 'right',
            width: 150,
            render: (_, record) => formatCurrency(record.price * record.quantity),
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Lỗi"
                description={error}
                type="error"
                showIcon
            />
        );
    }

    if (!orderData) {
        return (
            <Alert
                message="Không tìm thấy thông tin đơn hàng"
                type="warning"
                showIcon
            />
        );
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <Card bordered={false}>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Title level={5}>Thông tin đơn hàng</Title>
                    <DetailRow label="Mã đơn hàng" value={`#${orderData.orderId}`} />
                    <DetailRow label="Ngày đặt" value={formatDate(orderData.createdAt)} />
                    <DetailRow label="Trạng thái" value={
                        <Tag color={STATUS_DETAILS[orderData.status]?.color}>
                            {STATUS_DETAILS[orderData.status]?.label || orderData.status}
                        </Tag>
                    } />
                    <DetailRow label="Địa chỉ giao hàng" value={orderData.shippingAddress} />
                    <DetailRow label="Ghi chú" value={orderData.note || 'Không có'} />
                </Col>
            </Row>

            <Divider />

            <Title level={5}>Danh sách sản phẩm</Title>
            <Table
                columns={columns}
                dataSource={orderItems}
                rowKey="id"
                pagination={false}
                summary={() => (
                    <>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3}>
                                <Text strong>Tổng tiền hàng:</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">
                                <Text strong>{formatCurrency(totalAmount)}</Text>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3}>
                                <Text strong>Phí vận chuyển:</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">
                                <Text strong>{formatCurrency(orderData.shippingFee || 0)}</Text>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                            <Table.Summary.Cell index={0} colSpan={3}>
                                <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">
                                <Text strong style={{ fontSize: '16px', color: '#d32f2f' }}>
                                    {formatCurrency(totalAmount + (orderData.shippingFee || 0))}
                                </Text>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    </>
                )}
            />
        </Card>
    );
};

export default ShipperOrderDetails;
