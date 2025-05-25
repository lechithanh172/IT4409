import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  Image,
  Menu,
  Modal,
  Row,
  Table,
  Tag,
  message,
  Typography,
  Spin,
  Alert,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import apiService from "../../../services/api";

const { Text, Paragraph, Title } = Typography;


const formatCurrency = (value) => {
  if (typeof value !== "number" || isNaN(value)) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

function formatDate(isoString) {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false,
    });
  } catch  {
    return "Invalid Date";
  }
}

const STATUS_DETAILS = {
  PENDING: { label: "Chờ xử lý", color: "gold" },
  APPROVED: { label: "Đã duyệt", color: "blue" },
  REJECTED: { label: "Bị từ chối", color: "error" },
  SHIPPING: { label: "Đang giao", color: "processing" },
  DELIVERED: { label: "Đã giao", color: "success" },
  FAILED_DELIVERY: { label: "Giao thất bại", color: "error" },
};

const DeliveryStatusComponent = ({ deliveryStatus }) => {
  const statusUpper = deliveryStatus?.toUpperCase();
  const details = STATUS_DETAILS[statusUpper] || {
    label: deliveryStatus || "N/A",
    color: "default",
  };
  return <Tag color={details.color}>{details.label}</Tag>;
};

const DetailRow = ({
  label,
  value,
  isBold = false,
  spanLabel = 6,
  spanValue = 18,
}) => (
  <Row
    gutter={[16, 8]}
    style={{ marginBottom: "8px", alignItems: "flex-start" }}
  >
    <Col span={spanLabel} style={{ color: "#555", textAlign: "right" }}>
      <Text strong={isBold}>{label}:</Text>
    </Col>
    <Col span={spanValue}>
      {React.isValidElement(value) ? (
        value
      ) : (
        <Text style={{ fontSize: "15px", lineHeight: "1.5" }}>
          {value || "N/A"}
        </Text>
      )}
    </Col>
  </Row>
);

const VALID_STATUS_TRANSITIONS = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["SHIPPING"],
  REJECTED: [],
  SHIPPING: ["DELIVERED", "FAILED_DELIVERY"],
  DELIVERED: [],
  FAILED_DELIVERY: ["SHIPPING"],
};



const OrderDetails = ({ orderId, handleRefreshParent }) => {
  const [orderData, setOrderData] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [shipperInfo, setShipperInfo] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(true);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [loadingShipperInfo, setLoadingShipperInfo] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [currentOrderStatus, setCurrentOrderStatus] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [newStatusToConfirm, setNewStatusToConfirm] = useState(null);
  const [loadingStatusUpdate, setLoadingStatusUpdate] = useState(false);


   const fetchCustomerInfo = useCallback(async (userId) => {
      setLoadingUserInfo(true);
      setCustomerInfo(null);
      try {

        const customerResponse = await apiService.getUsersByRole("CUSTOMER");
        const customerList = customerResponse?.data;
        if (!Array.isArray(customerList)) {
          setCustomerInfo({ username: "Lỗi dữ liệu user" });
          return;
        }
        const foundUser = customerList.find((user) => user.userId === userId);
        setCustomerInfo(foundUser || { username: `User ID ${userId} không tìm thấy` });
      } catch (error) {
        console.error("Lỗi tải thông tin customer:", error);
        setCustomerInfo({ username: "Lỗi tải user" });
      } finally {
        setLoadingUserInfo(false);
      }
    }, []);



   const fetchShipperInfo = useCallback(async (shipperId) => {
        setLoadingShipperInfo(true);
        setShipperInfo(null);
        try {


            const shipperResponse = await apiService.getUsersByRole("SHIPPER");

            if (shipperResponse && shipperResponse.data) {
                const shipperList = shipperResponse?.data;
                const foundShipper = shipperList.find((user) => user.userId === shipperId);
                 setShipperInfo(foundShipper);
            } else {

                 console.warn(`Shipper with ID ${shipperId} not found.`);
                 setShipperInfo({ username: `Shipper ID ${shipperId} không tìm thấy` });
            }
        } catch (error) {
            console.error(`Lỗi tải thông tin shipper ID ${shipperId}:`, error);
            setShipperInfo({ username: "Lỗi tải shipper" });
        } finally {
            setLoadingShipperInfo(false);
        }
   }, []);


  useEffect(() => {
    if (!orderId) {
      setFetchError("ID đơn hàng không hợp lệ.");
      setLoadingOrderDetails(false);
      setLoadingItems(false);
      setLoadingUserInfo(false);
      setLoadingShipperInfo(false);
      return;
    }

    const fetchOrderAndItems = async () => {
      setLoadingOrderDetails(true);
      setLoadingItems(true);
      setLoadingUserInfo(true);
      setLoadingShipperInfo(true);

      setFetchError(null);
      setOrderData(null);
      setCustomerInfo(null);
      setShipperInfo(null);
      setCurrentOrderStatus(null);
      setOrderItems([]);

      try {
        const orderResponse = await apiService.getOrderById(orderId);

        if (orderResponse && orderResponse.data) {
          const fetchedOrder = orderResponse.data;
          setOrderData(fetchedOrder);

          setCurrentOrderStatus(fetchedOrder.status?.toUpperCase() || "PENDING");


          if (fetchedOrder.userId) {
            fetchCustomerInfo(fetchedOrder.userId);
          } else {
            setCustomerInfo({ username: "Khách vãng lai (không có ID)" });
            setLoadingUserInfo(false);
          }


           if (fetchedOrder.shipperId) {
              fetchShipperInfo(fetchedOrder.shipperId);
           } else {
               setShipperInfo({ username: "(Chưa có shipper)" });
               setLoadingShipperInfo(false);
           }

        } else {
          throw new Error("Không nhận được dữ liệu đơn hàng hợp lệ.");
        }


        const itemsResponse = await apiService.getOrderItems(orderId);
        if (itemsResponse && Array.isArray(itemsResponse.data)) {
            setOrderItems(itemsResponse.data);
        } else {
            console.warn("API sản phẩm không trả về mảng dữ liệu:", itemsResponse);
            setOrderItems([]);
        }

      } catch (error) {
        console.error("Lỗi khi tải chi tiết đơn hàng, sản phẩm, user hoặc shipper:", error);
        const errorMsg = error.response?.data?.message || error.message || "Không thể tải dữ liệu.";
        setFetchError(errorMsg);
        setOrderData(null);
        setOrderItems([]);
        setCustomerInfo(null);
        setShipperInfo(null);
      } finally {

        setLoadingOrderDetails(false);
        setLoadingItems(false);

         if (!orderData?.userId) setLoadingUserInfo(false);
         if (!orderData?.shipperId) setLoadingShipperInfo(false);

      }
    };

    fetchOrderAndItems();




  }, [orderId, fetchCustomerInfo, fetchShipperInfo]);

  const itemsColumns = [
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 80,
      align: 'center',
      render: (url, record) => (
          <Image
              src={url || '/placeholder.png'}
              alt={record.productName || "Sản phẩm"}
              width={50}
              style={{ objectFit: 'contain' }}
              preview={!!url}
           />
      ),
    },
    {
      title: "Tên sản phẩm",
      key: "productInfo",
      render: (_, record) => (
        <div>
          <Text strong>{record.productName || "N/A"}</Text>
          {/* Check for variant details if they exist */}
          {(record.color || record.size) && (
              <div style={{ fontSize: '12px', color: '#888' }}>
                  {record.color && `Màu: ${record.color}`}
                  {record.color && record.size && ', '} {/* Add separator if both exist */}
                  {record.size && `Size: ${record.size}`}
              </div>
          )}
          {record.variantId && <div style={{ fontSize: '12px', color: '#888' }}>SKU/Variant ID: {record.variantId}</div>}
        </div>
      ),
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 60,
      render: (qty) => <Text>{qty ?? 0}</Text>,
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: "right",
      width: 130,
      render: (price) => <Text>{formatCurrency(price)}</Text>,
    },
    {
      title: "Thành tiền",
      key: "lineTotal",
      align: "right",
      width: 140,
      render: (_, record) => {
        const lineTotal = (record.price ?? 0) * (record.quantity ?? 0);
        return <Text strong>{formatCurrency(lineTotal)}</Text>;
      },
    },
  ];


   const handleApplyStatusInModal = useCallback(
    async (orderIdToUpdate, currentStatus, newStatus) => {
      const currentStatusUpper = currentStatus?.toUpperCase();
      const newStatusUpper = newStatus.toUpperCase();
      const validTransitions = VALID_STATUS_TRANSITIONS[currentStatusUpper] || [];
      if (!validTransitions.includes(newStatusUpper)) {
        message.warning(
          `Không thể chuyển từ trạng thái '${STATUS_DETAILS[currentStatusUpper]?.label || currentStatus}' sang '${STATUS_DETAILS[newStatusUpper]?.label || newStatus}'.`
        );
        return;
      }

      setLoadingStatusUpdate(true);
      setIsStatusModalVisible(false);

      try {
        const updatePayload = {
          orderId: orderIdToUpdate,
          status: newStatus.toUpperCase()
        };

        if (newStatusUpper === 'DELIVERED') {
            updatePayload.deliveredAt = new Date().toISOString();
        }

        await apiService.applyOrderStatus(updatePayload);


        setCurrentOrderStatus(newStatusUpper);

        setOrderData(prev => prev ? {
             ...prev,
             status: newStatusUpper,
             deliveredAt: newStatusUpper === 'DELIVERED' ? new Date().toISOString() : prev?.deliveredAt
            } : null);


        message.success(
          `Đơn hàng #${orderIdToUpdate} đã cập nhật trạng thái thành ${
            STATUS_DETAILS[newStatusUpper]?.label || newStatus
          }.`
        );


        if (handleRefreshParent) {
          handleRefreshParent();
        }
      } catch (error) {
        message.error(
          error.response?.data?.message ||
            `Cập nhật trạng thái cho đơn hàng #${orderIdToUpdate} thất bại!`
        );
      } finally {
        setLoadingStatusUpdate(false);
        setNewStatusToConfirm(null);
      }
    },
    [handleRefreshParent]
  );


  const showStatusConfirm = (status) => {
    setNewStatusToConfirm(status);
    setIsStatusModalVisible(true);
  };

  const handleStatusOk = () => {
    if (orderData && newStatusToConfirm && currentOrderStatus !== null) {
      handleApplyStatusInModal(
        orderData.orderId,
        currentOrderStatus,
        newStatusToConfirm
      );
    } else {
         console.warn("Attempted status update without orderData, newStatusToConfirm, or valid currentStatus.");
         message.error("Không thể cập nhật trạng thái. Vui lòng tải lại trang.");
         handleStatusCancel();
    }
  };

  const handleStatusCancel = () => {
    setIsStatusModalVisible(false);
    setNewStatusToConfirm(null);
  };





  const isInitialLoading = loadingOrderDetails || loadingItems;

  if (isInitialLoading) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <Spin size="large" tip="Đang tải chi tiết đơn hàng..." />
      </div>
    );
  }
  if (fetchError) {
    return (
      <Card>
        <Alert message="Lỗi" description={fetchError} type="error" showIcon />
      </Card>
    );
  }
  if (!orderData) {
    return (
      <Card>
        <Paragraph>Không có dữ liệu đơn hàng hoặc sản phẩm.</Paragraph>
      </Card>
    );
  }

  const itemsTotal = orderItems.reduce((sum, item) => {
    const price = item.price ?? 0;
    const quantity = item.quantity ?? 0;
    return sum + (price * quantity);
  }, 0);
  const shippingFee = orderData.shippingFee ?? 0;
  const calculatedGrandTotal = itemsTotal + shippingFee;

  const currentStatusUpperForCheck = currentOrderStatus?.toUpperCase();
  const possibleNextStatuses =
    VALID_STATUS_TRANSITIONS[currentStatusUpperForCheck] || [];
  const canChangeStatusManually = currentOrderStatus === "PENDING";


  const statusMenu = (
    <Menu>
      {possibleNextStatuses.map((statusKey) => (
        <Menu.Item
          key={statusKey}
          danger={["REJECTED", "FAILED_DELIVERY"].includes(statusKey)}
          onClick={() => showStatusConfirm(statusKey)}
        >
          Chuyển sang "{STATUS_DETAILS[statusKey]?.label || statusKey}"
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <>
      <Card title={false} bordered={false} style={{ padding: 0 }}>
        <Row gutter={[32, 24]}>
           <Col xs={24} lg={12}>
             <Title level={5} style={{ marginBottom: 15, borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
               Thông tin đơn hàng
             </Title>
             <DetailRow label="Mã ĐH" value={orderData.orderId} />
             <DetailRow label="Ngày đặt" value={formatDate(orderData.createdAt)} />
             <DetailRow label="Phương thức TT" value={orderData.paymentMethod} />
             <DetailRow label="Trạng thái ĐH" value={<DeliveryStatusComponent deliveryStatus={currentOrderStatus} />} />
             {/* Display Delivered At if available */}
              {orderData.deliveredAt && (
                  <DetailRow label="Ngày giao" value={formatDate(orderData.deliveredAt)} />
              )}
             <DetailRow label="Phí vận chuyển" value={formatCurrency(shippingFee)} />
             <DetailRow label="Ghi chú KH" value={orderData.note || "(Không có)"} />

             {/* Shipper Info - NEW */}
             <Divider style={{ margin: "15px 0 10px 0" }} />
             <Title level={5} style={{ marginBottom: 15, borderBottom: "1px solid #f0f0f0", paddingBottom: 8, fontSize: '16px' }}>
               Thông tin Shipper
             </Title>
             {loadingShipperInfo ? ( <Spin size="small" /> )
              : shipperInfo ? (
               <>
                 <DetailRow label="Tên Shipper" value={shipperInfo.username} />
                 <DetailRow label="Email Shipper" value={shipperInfo.email || "N/A"} />
                 {/* Add other shipper details if needed, like phone */}
                 {/* <DetailRow label="SĐT Shipper" value={shipperInfo.phoneNumber || "N/A"} /> */}
               </>
             ) : (
               <Paragraph type="secondary">Không tải được thông tin shipper.</Paragraph>
             )}
             {/* End Shipper Info */}

             {canChangeStatusManually && (
              <Row gutter={[16, 8]} style={{ marginTop: 20, alignItems: "center" }}> {/* Increased margin */}
                <Col span={6} style={{ color: "#555", textAlign: "right" }}>
                  <Text strong>Hành động:</Text>
                </Col>
                <Col span={18}>
                  <Dropdown overlay={statusMenu} trigger={["click"]} disabled={loadingStatusUpdate}>
                    <Button size="small" icon={<EditOutlined />} loading={loadingStatusUpdate}>
                      Đổi trạng thái
                    </Button>
                  </Dropdown>
                </Col>
              </Row>
             )}
           </Col>

           <Col xs={24} lg={12}>
             <Title level={5} style={{ marginBottom: 15, borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
               Thông tin khách hàng
             </Title>
             {loadingUserInfo ? ( <Spin size="small" /> )
              : customerInfo ? (
               <>
                 <DetailRow label="Tên KH" value={customerInfo.username} />
                 <DetailRow label="Email" value={customerInfo.email || "N/A"} />
                 <DetailRow label="Điện thoại" value={customerInfo.phoneNumber || "N/A"} />
                 <DetailRow label="Địa chỉ GH" value={orderData.shippingAddress || customerInfo.address || "(Không có)"} /> {/* Prefer shippingAddress from order */}
               </>
             ) : (
               <Paragraph type="secondary">Không tải được thông tin người dùng.</Paragraph>
             )}
           </Col>
        </Row>

        <Divider style={{ margin: "24px 0" }} />

        <Title level={5} style={{ marginBottom: 15 }}>
          Sản phẩm trong đơn ({orderItems.length})
        </Title>
         {/* Check if orderItems is empty before rendering table */}
         {orderItems.length > 0 ? (
            <Table
                dataSource={orderItems}
                columns={itemsColumns}
                rowKey={(item) => `${item.productId}-${item.variantId || 'no-variant'}`}
                pagination={false}
                bordered
                size="small"
                scroll={{ x: "max-content" }}
                summary={() => (
                <>
                    <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4} align="right">
                            <Text strong>Tổng tiền hàng:</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                            <Text strong>{formatCurrency(itemsTotal)}</Text>
                        </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4} align="right">
                            <Text strong>Phí vận chuyển:</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                            <Text strong>{formatCurrency(shippingFee)}</Text>
                        </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                        <Table.Summary.Cell index={0} colSpan={4} align="right">
                            <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                            <Text strong style={{ fontSize: '16px', color: '#d32f2f' }}>
                                {formatCurrency(calculatedGrandTotal)}
                            </Text>
                        </Table.Summary.Cell>
                    </Table.Summary.Row>
                </>
                )}
            />
         ) : (
            <Paragraph type="secondary">Không có sản phẩm nào trong đơn hàng này.</Paragraph>
         )}
      </Card>

      <Modal
        title="Xác nhận thay đổi trạng thái"
        open={isStatusModalVisible}
        onOk={handleStatusOk}
        onCancel={handleStatusCancel}
        confirmLoading={loadingStatusUpdate}
        okText="Xác nhận"
        cancelText="Hủy"
        destroyOnClose
        maskClosable={!loadingStatusUpdate}
        closable={!loadingStatusUpdate}
      >
        {newStatusToConfirm && orderData && (
            <Paragraph>
                Bạn có chắc chắn muốn đổi trạng thái đơn hàng <Text strong>#{orderData.orderId}</Text> từ <DeliveryStatusComponent deliveryStatus={currentOrderStatus} /> thành <DeliveryStatusComponent deliveryStatus={newStatusToConfirm} /> không?
            </Paragraph>
        )}
      </Modal>
    </>
  );
};

export default OrderDetails;