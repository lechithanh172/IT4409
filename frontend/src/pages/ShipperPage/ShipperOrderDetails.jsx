import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Image, Tag, Spin, Alert, Divider } from 'antd';
import apiService from '../../services/api'; // Make sure the path is correct

const { Text, Title } = Typography;

// Define STATUS_DETAILS outside the component if it's static
const STATUS_DETAILS = {
    PENDING: { label: "Chờ xử lý", color: "gold" },
    SHIPPING: { label: "Đang giao", color: "processing" },
    APPROVED: { label: "Đã phê duyệt", color: "gold" }, // Added APPROVED status as seen in original
    DELIVERED: { label: "Đã giao", color: "success" },
    FAILED_DELIVERY: { label: "Giao thất bại", color: "error" },
    REJECTED: { label: "Bị từ chối", color: "error" },
};

// Define utility functions outside the component if they don't use component state/props
const formatCurrency = (amount) => {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount); // Also try parsing if it might be a string number
    if (isNaN(numAmount) || numAmount === null) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numAmount);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Check if the date is valid after parsing
        if (isNaN(date.getTime())) {
             console.warn("Invalid date string received:", dateString);
            return 'Ngày không hợp lệ';
        }
        return date.toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); // Added seconds for more precision if needed
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'N/A';
    }
};

const DetailRow = ({ label, value }) => (
    <Row style={{ marginBottom: '8px' }}>
        <Col span={8}>
            <Text type="secondary">{label}:</Text>
        </Col>
        <Col span={16}>
            {/* Render value directly, handling potential react nodes like Tags */}
            <Text>{value}</Text>
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
    // Initialize customerInfo with a default structure to avoid accessing null/undefined properties later
    const [customerInfo, setCustomerInfo] = useState({ fullName: 'Đang tải...', phoneNumber: 'Đang tải...' });

    useEffect(() => {
        const fetchOrderDetails = async () => {
            setLoading(true);
            setError(null); // Clear previous errors
            setOrderData(null); // Clear previous data
            setOrderItems([]); // Clear previous items
            setCustomerInfo({ fullName: 'Đang tải...', phoneNumber: 'Đang tải...' }); // Reset customer info state

            try {
                // --- Fetch Order Data ---
                const orderResponse = await apiService.getOrderById(orderId);
                if (!orderResponse?.data) {
                    // Handle case where order is not found or API returns no data
                    setError(`Không tìm thấy đơn hàng với ID ${orderId}`);
                    setLoading(false);
                    return; // Stop execution if no order data
                }
                const order = orderResponse.data;
                setOrderData(order);

                // --- Fetch Order Items ---
                const itemsResponse = await apiService.getOrderItems(orderId);
                if (itemsResponse?.data) {
                    const itemsWithDefaults = itemsResponse.data.map(item => ({
                        ...item,
                        imageUrl: item.imageUrl || '/placeholder.png' // Ensure default image if none provided
                    }));
                    setOrderItems(itemsWithDefaults);
                } else {
                    console.warn("Could not fetch order items for order ID:", orderId);
                    setOrderItems([]); // Ensure items is always an array
                }

                // --- Fetch Customer Info ---
                // Perform user fetch *after* order data is received, as it depends on order.userId
                let foundUser = null;
                try {
                    const customerResponse = await apiService.getUsersByRole("CUSTOMER");
                    const customerList = customerResponse?.data;

                    if (!Array.isArray(customerList)) {
                        console.warn("API getUsersByRole did not return an array:", customerResponse);
                        setCustomerInfo({ fullName: "Lỗi dữ liệu người dùng (danh sách)", phoneNumber: "N/A" });
                    } else if (!order.userId) { // Check if order data actually has userId
                         console.warn("Order data does not contain userId:", order);
                         setCustomerInfo({ fullName: "Thông tin người dùng không khả dụng (thiếu ID)", phoneNumber: "N/A" });
                    } else {
                        console.log("Customer list fetched:", customerList); // Log the fetched list
                        console.log("Order userId to find:", order.userId); // Log the ID we're looking for
                        console.log("Type of order.userId:", typeof order.userId); // Log type

                        // FIX: Add type coercion (e.g., convert to string) for robust comparison
                        // This is the most common fix for find failures with IDs from different sources
                        const targetUserId = String(order.userId);
                        foundUser = customerList.find((user) => {
                             console.log(`Comparing list user ID '${user.userId}' (type ${typeof user.userId}) with target '${targetUserId}' (type ${typeof targetUserId})`);
                             return String(user.userId) === targetUserId;
                        });

                        console.log("Found user after search:", foundUser); // Log the result of find

                        // Set customer info state using the found user or a detailed fallback
                        setCustomerInfo(foundUser || {
                            fullName: `Không tìm thấy người dùng (ID: ${order.userId})`,
                            phoneNumber: 'N/A',
                            // You might want to include username if DetailRow used it, but it doesn't
                            // username: `ID: ${order.userId}`
                        });
                    }
                } catch (userFetchError) {
                     console.error("Error fetching customer list:", userFetchError);
                     setCustomerInfo({ fullName: "Lỗi khi tải thông tin người dùng", phoneNumber: "N/A" });
                }


            } catch (err) {
                console.error('Error fetching order details or items:', err);
                // Set a general error message if any major fetch fails
                setError('Không thể tải thông tin chi tiết đơn hàng');
                setOrderData(null); // Ensure orderData is null on error
                setOrderItems([]); // Ensure items is empty on error
                setCustomerInfo({ fullName: "Không tải được thông tin người dùng", phoneNumber: "N/A" }); // Set fallback on general error
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        } else {
            // Handle case where orderId prop is not provided
            setLoading(false);
            setError("Không có mã đơn hàng được cung cấp.");
        }
    }, [orderId, apiService]); // Depend on orderId and apiService (if it could change)

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Image
                        src={record.imageUrl} // Use record.imageUrl directly now
                        alt={text}
                        width={50}
                        height={50}
                        style={{ objectFit: 'cover' }}
                        preview={false}
                        fallback="/placeholder.png" // Add Ant Design fallback prop
                    />
                    <div>
                        <div>{text}</div>
                        {record.attributes?.color && <Text type="secondary">Màu: {record.attributes.color}</Text>}
                         {/* Add size/other attributes if they exist in record.attributes */}
                        {record.attributes?.size && <Text type="secondary" style={{marginLeft: '4px'}}>Size: {record.attributes.size}</Text>}
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

    // Render logic based on state (loading, error, data)
    if (loading) {
        return (
            <Card bordered={false} style={{ textAlign: 'center', padding: '20px' }}>
                 <Spin size="large" tip="Đang tải..." />
            </Card>
        );
    }

    if (error) {
        return (
             <Card bordered={false}>
                <Alert
                    message="Lỗi tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                />
             </Card>
        );
    }

    // orderData is guaranteed to be not null here because of the check in the effect
    // but orderItems might be empty if the second API call failed or returned no items
    // customerInfo is guaranteed to have fullName and phoneNumber properties due to initialization/fallbacks


    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Calculate VAT and Grand Total based on orderData if available, fallback if not
    const vatRate = orderData?.vatRate || 0.10; // Use vatRate from orderData if provided, default to 10%
    const vatAmount = totalAmount * vatRate;
    const shippingFee = orderData?.shippingFee || 0; // Use shippingFee from orderData if provided, default to 0
    const grandTotal = totalAmount + vatAmount + shippingFee;


    return (
        <Card bordered={false}>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Title level={5}>Thông tin đơn hàng</Title>
                    <DetailRow label="Mã đơn hàng" value={`#${orderData.orderId}`} />
                    <DetailRow label="Ngày đặt" value={formatDate(orderData.createdAt)} />
                    <DetailRow label="Trạng thái" value={
                        <Tag color={STATUS_DETAILS[orderData.status]?.color}>
                            {STATUS_DETAILS[orderData.status]?.label || orderData.status || 'Không rõ'}
                        </Tag>
                    } />
                    {/* Use the customerInfo state which is guaranteed to have fields */}
                    <DetailRow label="Tên khách hàng" value={customerInfo.fullName || 'N/A'} /> {/* Add fallback for property */}
                    <DetailRow label="Số điện thoại" value={customerInfo.phoneNumber || 'N/A'} /> {/* Add fallback for property */}
                    <DetailRow label="Địa chỉ giao hàng" value={orderData.shippingAddress || 'N/A'} />
                    <DetailRow label="Ghi chú" value={orderData.note || 'Không có'} />
                </Col>
            </Row>

            <Divider />

            <Title level={5}>Danh sách sản phẩm</Title>
             {orderItems.length === 0 ? (
                <Alert message="Không có sản phẩm nào trong đơn hàng này." type="info" showIcon />
            ) : (
                 <Table
                    columns={columns}
                    dataSource={orderItems}
                    rowKey="id" // Use a unique key if available, 'id' is common for items
                    pagination={false}
                    summary={() => (
                        <>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={3} style={{ textAlign: 'right' }}>
                                    <Text strong>Tổng tiền hàng:</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="right">
                                    <Text strong>{formatCurrency(totalAmount)}</Text>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>

                             {/* Only show VAT if rate is > 0 */}
                            {vatRate > 0 && (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={3} style={{ textAlign: 'right' }}>
                                        <Text strong>Thuế VAT ({vatRate * 100}%):</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right">
                                        <Text strong>{formatCurrency(vatAmount)}</Text>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            )}


                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={3} style={{ textAlign: 'right' }}>
                                    <Text strong>Phí vận chuyển:</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="right">
                                    <Text strong>{formatCurrency(shippingFee)}</Text>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>

                            <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                                <Table.Summary.Cell index={0} colSpan={3} style={{ textAlign: 'right' }}>
                                    <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="right">
                                    <Text strong style={{ fontSize: '16px', color: '#d32f2f' }}>
                                        {formatCurrency(grandTotal)}
                                    </Text>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </>
                    )}
                />
            )}

        </Card>
    );
};

export default ShipperOrderDetails;