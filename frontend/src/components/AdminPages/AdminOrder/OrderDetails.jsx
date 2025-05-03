import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
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
import { EditOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import apiService from "../../../services/api"; // Ensure correct path

const { Text, Paragraph, Title } = Typography;
const { confirm } = Modal;

// --- Helper Functions & Status Components (Giữ nguyên) ---
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
  } catch (error) {
    console.error("Lỗi định dạng ngày:", isoString, error);
    return "Invalid Date";
  }
}
const STATUS_DETAILS = {
  PENDING: { label: "Chờ xử lý", color: "gold" },
  APPROVED: { label: "Đã duyệt", color: "lime" },
  REJECTED: { label: "Bị từ chối", color: "error" },
  SHIPPING: { label: "Đang giao", color: "processing" },
  DELIVERED: { label: "Đã giao", color: "success" },
  // CANCELLED: { label: 'Đã hủy', color: 'red' },
};
const DeliveryStatusComponent = ({ deliveryStatus }) => {
  const statusUpper = deliveryStatus?.toUpperCase();
  const details = STATUS_DETAILS[statusUpper] || {
    label: deliveryStatus || "N/A",
    color: "default",
  };
  return <Tag color={details.color}>{details.label}</Tag>;
};
// Giả sử API getOrderById trả về paymentStatus
const PaymentStatusComponent = ({ paymentStatus }) => {
  let color;
  let text = paymentStatus || "N/A";
  switch (paymentStatus?.toUpperCase()) {
    case "PENDING":
      color = "warning";
      text = "Chờ TT";
      break;
    case "COMPLETED":
      color = "success";
      text = "Đã TT";
      break;
    case "PAID":
      color = "success";
      text = "Đã TT";
      break;
    case "FAILED":
      color = "error";
      text = "Thất bại";
      break;
    default:
      color = "default";
  }
  return <Tag color={color}>{text}</Tag>;
};

// --- Detail Row Component (Giữ nguyên) ---
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
  APPROVED: ["SHIPPING", "REJECTED"],
  SHIPPING: ["DELIVERED", "REJECTED"],
  DELIVERED: [],
  REJECTED: ["PENDING", "APPROVED"],
};

const OrderDetails = ({ orderId, handleRefreshParent }) => {
  const [orderData, setOrderData] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(true);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [currentOrderStatus, setCurrentOrderStatus] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [newStatusToConfirm, setNewStatusToConfirm] = useState(null);
  const [loadingStatusUpdate, setLoadingStatusUpdate] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setFetchError("ID đơn hàng không hợp lệ.");
      setLoadingOrderDetails(false);
      return;
    }

    const fetchOrder = async () => {
      setLoadingOrderDetails(true);
      setFetchError(null);
      setOrderData(null);
      setCustomerInfo(null);
      setCurrentOrderStatus(null);

      try {
        const response = await apiService.getOrderById(orderId);
        if (response && response.data) {
          setOrderData(response.data);
          setCurrentOrderStatus(response.data.status || "PENDING");
          if (response.data.userId) {
            fetchUserInfo(response.data.userId);
          } else {
            setCustomerInfo({ username: "Không có ID user" });
          }
        } else {
          throw new Error("Không nhận được dữ liệu đơn hàng hợp lệ.");
        }
      } catch (error) {
        console.error(`Lỗi khi tải chi tiết đơn hàng ${orderId}:`, error);
        setFetchError(
          error.response?.data?.message ||
            error.message ||
            "Không thể tải chi tiết đơn hàng."
        );
      } finally {
        setLoadingOrderDetails(false);
      }
    };

    const fetchUserInfo = async (userId) => {
      setLoadingUserInfo(true);
      setCustomerInfo(null); // Reset thông tin khách hàng cũ
      try {
        // Gọi API lấy tất cả khách hàng
        const customerResponse = await apiService.getUsersByRole("CUSTOMER");
        console.log("Response từ getUsersByRole: ", customerResponse); // Log toàn bộ response để kiểm tra

        // Kiểm tra xem có dữ liệu và có phải là mảng không
        const customerList = customerResponse?.data;
        if (!Array.isArray(customerList)) {
          console.warn("Dữ liệu khách hàng trả về không phải là mảng.");
          setCustomerInfo({ username: "Lỗi dữ liệu user" });
          setLoadingUserInfo(false);
          return; // Dừng lại nếu dữ liệu không đúng
        }

        console.log("Danh sách khách hàng đã fetch:", customerList);

        // *** Tìm kiếm user trong mảng customerList ***
        const foundUser = customerList.find((user) => user.userId === userId);

        console.log(`Đang tìm userId: ${userId}. Tìm thấy:`, foundUser); // Log kết quả tìm kiếm

        // Cập nhật state customerInfo dựa trên kết quả tìm kiếm
        if (foundUser) {
          setCustomerInfo(foundUser); // Tìm thấy -> set thông tin user
        } else {
          // Không tìm thấy user với userId này trong danh sách CUSTOMER
          console.warn(
            `Không tìm thấy thông tin cho người dùng ID: ${userId} trong danh sách CUSTOMER.`
          );
          setCustomerInfo({
            username: `User ID ${userId} không tồn tại hoặc không phải CUSTOMER`,
          }); // Set placeholder
        }
      } catch (error) {
        // Xử lý lỗi nếu gọi API getUsersByRole thất bại
        console.error(
          `Lỗi khi tải danh sách CUSTOMER hoặc tìm user ID ${userId}:`,
          error
        );
        setCustomerInfo({ username: "Lỗi tải user list" }); // Set placeholder lỗi
      } finally {
        setLoadingUserInfo(false); // Luôn tắt loading sau khi hoàn tất hoặc lỗi
      }
    };

    fetchOrder();
  }, [orderId]); // Chỉ fetch lại khi orderId thay đổi

  // --- Items Table Columns ---
  const itemsColumns = [
    {
      title: "Sản phẩm",
      key: "productName", // Giả sử API trả về productName trong item
      dataIndex: "productName", // Giả sử API trả về productName trong item
      render: (text) => <Text>{text || "N/A"}</Text>,
    },
    {
      title: "Phiên bản",
      key: "variantInfo", // Giả sử API trả về variantInfo (ví dụ: màu sắc)
      dataIndex: "variantInfo", // Giả sử API trả về variantInfo
      render: (text) => <Text>{text || "N/A"}</Text>,
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
      title: "Đơn giá", // Giá tại thời điểm đặt hàng
      dataIndex: "price", // Giả sử API trả về price trong item
      key: "price",
      align: "right",
      render: (price) => <Text>{formatCurrency(price)}</Text>,
    },
    {
      title: "Thành tiền",
      key: "total",
      align: "right",
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
      const validTransitions =
        VALID_STATUS_TRANSITIONS[currentStatusUpper] || [];
      if (!validTransitions.includes(newStatusUpper)) {
        message.warning(
          `Không thể chuyển từ trạng thái '${currentStatus}' sang '${newStatus}'.`
        );
        return;
      }

      setLoadingStatusUpdate(true);
      setIsStatusModalVisible(false);

      try {
        const payload = {
          orderId: orderIdToUpdate,
          status: newStatus.toLowerCase(),
        };
        await apiService.updateOrderStatus(payload);

        // Cập nhật state cục bộ
        setCurrentOrderStatus(newStatus); // Dùng newStatus (UPPERCASE từ menu) để cập nhật hiển thị
        message.success(
          `Đơn hàng #${orderIdToUpdate} đã cập nhật trạng thái thành ${
            STATUS_DETAILS[newStatusUpper]?.label || newStatus
          }.`
        );

        // Gọi hàm refresh của component cha
        if (handleRefreshParent) {
          handleRefreshParent();
        }
      } catch (error) {
        console.error(
          `Lỗi khi cập nhật trạng thái ${newStatus} cho đơn ${orderIdToUpdate}:`,
          error
        );
        message.error(
          error.response?.data?.message ||
            `Cập nhật trạng thái cho đơn hàng #${orderIdToUpdate} thất bại!`
        );
        // Không cần revert vì cha sẽ refresh
      } finally {
        setLoadingStatusUpdate(false);
        setNewStatusToConfirm(null);
      }
    },
    [handleRefreshParent]
  );

  const showStatusConfirm = (status) => {
    setNewStatusToConfirm(status); // status là UPPERCASE
    setIsStatusModalVisible(true);
  };
  const handleStatusOk = () => {
    if (orderData && newStatusToConfirm) {
      handleApplyStatusInModal(
        orderData.orderId,
        currentOrderStatus,
        newStatusToConfirm
      );
    }
  };
  const handleStatusCancel = () => {
    setIsStatusModalVisible(false);
    setNewStatusToConfirm(null);
  };

  // --- Render Logic ---
  if (loadingOrderDetails) {
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
        <Paragraph>Không có dữ liệu đơn hàng.</Paragraph>
      </Card>
    );
  }

  const currentStatusUpperForCheck = currentOrderStatus?.toUpperCase();
  const possibleNextStatuses =
    VALID_STATUS_TRANSITIONS[currentStatusUpperForCheck] || [];
  const canChangeStatusManually = possibleNextStatuses.length > 0;

  const statusMenu = (
    <Menu>
      {possibleNextStatuses.map((statusKey) => (
        <Menu.Item
          key={statusKey}
          danger={["REJECTED"].includes(statusKey)}
          onClick={() => showStatusConfirm(statusKey)} // statusKey là UPPERCASE
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
            <Title
              level={5}
              style={{
                marginBottom: 15,
                borderBottom: "1px solid #f0f0f0",
                paddingBottom: 8,
              }}
            >
              Thông tin đơn hàng
            </Title>
            <DetailRow label="Mã ĐH" value={orderData.orderId} />
            <DetailRow
              label="Ngày đặt"
              value={formatDate(orderData.createdAt)}
            />
            <DetailRow label="Phương thức TT" value={orderData.paymentMethod} />
            <DetailRow
              label="Trạng thái ĐH"
              value={
                <DeliveryStatusComponent deliveryStatus={currentOrderStatus} />
              }
            />
            <DetailRow
              label="Phí vận chuyển"
              value={formatCurrency(orderData.shippingFee)}
            />
            <DetailRow
              label="Ghi chú KH"
              value={orderData.note || "(Không có)"}
            />

            {canChangeStatusManually && (
              <Row
                gutter={[16, 8]}
                style={{ marginTop: 10, alignItems: "center" }}
              >
                <Col span={6} style={{ color: "#555", textAlign: "right" }}>
                  <Text strong>Hành động:</Text>
                </Col>
                <Col span={18}>
                  <Dropdown
                    overlay={statusMenu}
                    trigger={["click"]}
                    disabled={loadingStatusUpdate}
                  >
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      loading={loadingStatusUpdate}
                    >
                      Đổi trạng thái
                    </Button>
                  </Dropdown>
                </Col>
              </Row>
            )}
          </Col>

          {/* Cột Thông tin khách hàng */}
          <Col xs={24} lg={12}>
            <Title
              level={5}
              style={{
                marginBottom: 15,
                borderBottom: "1px solid #f0f0f0",
                paddingBottom: 8,
              }}
            >
              Thông tin khách hàng
            </Title>
            {loadingUserInfo ? (
              <Spin size="small" />
            ) : customerInfo ? (
              <>
                <DetailRow label="Tên KH" value={customerInfo.username} />
                <DetailRow label="Email" value={customerInfo.email || "N/A"} />
                <DetailRow
                  label="Điện thoại"
                  value={customerInfo.phoneNumber || "N/A"}
                />
                <DetailRow
                  label="Địa chỉ GH"
                  value={
                    orderData.shippingAddress ||
                    customerInfo.address ||
                    "(Không có)"
                  }
                />
              </>
            ) : (
              <Paragraph type="secondary">
                Không tải được thông tin người dùng.
              </Paragraph>
            )}
          </Col>
        </Row>{" "}
        <Divider style={{ margin: "24px 0" }} />
        {/* Phần bảng sản phẩm và các thành phần khác giữ nguyên */}
        <Title level={5} style={{ marginBottom: 15 }}>
          Sản phẩm trong đơn
        </Title>
        <Table
          dataSource={orderData.items || []}
          columns={itemsColumns}
          rowKey={(item, index) =>
            `${item.productId || `p${index}`}-${item.variantId || `v${index}`}`
          } // Key ví dụ
          pagination={false}
          bordered
          size="middle"
          scroll={{ x: "max-content" }}
          summary={() => (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  <Text strong style={{ fontSize: "15px" }}>
                    Phí vận chuyển:
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text strong style={{ fontSize: "15px" }}>
                    {formatCurrency(orderData.shippingFee)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  <Text strong style={{ fontSize: "16px" }}>
                    Tổng cộng:
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text strong style={{ fontSize: "16px", color: "#d32f2f" }}>
                    {formatCurrency(orderData.totalAmount)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          )}
        />
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
      >
        <Paragraph>
          Bạn có chắc chắn muốn đổi trạng thái đơn hàng này thành "
          {STATUS_DETAILS[newStatusToConfirm?.toUpperCase()]?.label ||
            newStatusToConfirm}
          "?
        </Paragraph>
      </Modal>
    </>
  );
};

export default OrderDetails;
