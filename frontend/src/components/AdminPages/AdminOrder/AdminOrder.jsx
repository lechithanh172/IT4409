import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Button,
  Modal,
  Space,
  Table,
  message,
  Input,
  Tag,
  Select,
  Dropdown,
  Menu,
  Typography,
  Spin,
  Tooltip,
  Card,
  Row,
  Col,
  Statistic,
  Image,
  Divider,
  Alert,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  DollarOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import OrderDetails from "./OrderDetails";
import apiService from "../../../services/api";

const { Text } = Typography;

const STATUS_DETAILS = {
  PENDING: { label: "Chờ xử lý", color: "gold" },
  APPROVED: { label: "Đã duyệt", color: "blue" },
  REJECTED: { label: "Bị từ chối", color: "error" },
  SHIPPING: { label: "Đang giao", color: "processing" },
  DELIVERED: { label: "Đã giao", color: "success" },
  FAILED_DELIVERY: { label: "Giao thất bại", color: "error" },
};

const OrderStatusTag = ({ status }) => {
  const statusUpper = status?.toUpperCase();
  const details = STATUS_DETAILS[statusUpper] || {
    label: status || "N/A",
    color: "default",
  };
  return <Tag color={details.color}>{details.label}</Tag>;
};

const VALID_STATUS_TRANSITIONS = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["SHIPPING"],
  REJECTED: [],
  SHIPPING: ["DELIVERED", "FAILED_DELIVERY"],
  DELIVERED: [],
  FAILED_DELIVERY: ["SHIPPING"],
};

function formatDate(isoString) {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "N/A";
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
    return "Invalid Date";
  }
}

const formatCurrency = (value) => {
  if (typeof value !== "number" || isNaN(value)) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const AdminOrder = () => {
  const [processedOrders, setProcessedOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [detailsModalContent, setDetailsModalContent] = useState({
    visible: false,
    orderId: null,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingAction, setLoadingAction] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const [confirmModalState, setConfirmModalState] = useState({
    visible: false,
    record: null,
    targetStatus: null,
    isLoading: false,
  });

  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [yearlyRevenue, setYearlyRevenue] = useState(0);

  const [shipperModalState, setShipperModalState] = useState({
    visible: false,
    orderId: null,
    targetStatus: null,
    shipperId: null,
    shipperList: [],
    loading: false
  });

  const fetchData = useCallback(
    async (showSuccessMessage = false) => {
      setLoading(true);
      if (!loadingAction) {
        setProcessedOrders([]);
        setDisplayedOrders([]);
      }
      try {
        const [orderResponse, userResponse] = await Promise.all([
          apiService.getAllOrders(),
          apiService.getUsersByRole("CUSTOMER"),
        ]);
        const fetchedOrders = orderResponse?.data || [];
        const fetchedUsers = userResponse?.data || [];

        if (!Array.isArray(fetchedOrders))
          throw new Error("Dữ liệu đơn hàng trả về không hợp lệ.");

        const userMap = new Map(
          fetchedUsers.map((user) => [user.userId, user])
        );

        const finalProcessedData = fetchedOrders.map((order) => {
          const itemsAmount = order.totalAmount ?? 0;
          const shippingFee = order.shippingFee ?? 0;
          const calculatedGrandTotal = itemsAmount + shippingFee;

          return {
            key: order.orderId,
            orderId: order.orderId,
            userId: order.userId,
            userName: userMap.get(order.userId)?.username || "N/A",
            formattedCreatedAt: formatDate(order.createdAt),
            paymentMethod: order.paymentMethod || "N/A",
            status: order.status?.toUpperCase() || "PENDING",
            totalAmount: calculatedGrandTotal,
          };
        });

        setProcessedOrders(finalProcessedData);

        const ordersToDisplay =
          statusFilter === "all"
            ? finalProcessedData
            : finalProcessedData.filter(
                (o) => o.status.toLowerCase() === statusFilter.toLowerCase()
              );
        setDisplayedOrders(ordersToDisplay);

        if (showSuccessMessage) {
          message.success(
            `Tải lại danh sách ${finalProcessedData.length} đơn hàng thành công.`
          );
        }
      } catch (error) {
        message.error(
          `Lỗi tải dữ liệu: ${error.message || "Lỗi không xác định"}`
        );
        setProcessedOrders([]);
        setDisplayedOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, loadingAction]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!loading) {
      const ordersToDisplay =
        statusFilter === "all"
          ? processedOrders
          : processedOrders.filter(
              (order) =>
                order.status.toLowerCase() === statusFilter.toLowerCase()
            );
      setDisplayedOrders(ordersToDisplay);
    }
  }, [statusFilter, processedOrders, loading]);

  const onRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const handleApplyStatus = useCallback(
    async (orderId, currentStatus, newStatus) => {
      if (loadingAction === orderId) {
        return;
      }

      if (!orderId || !currentStatus || !newStatus) {
        return;
      }

      const currentStatusUpper = currentStatus?.toUpperCase();
      const validTransitions = VALID_STATUS_TRANSITIONS[currentStatusUpper] || [];

      if (!validTransitions.includes(newStatus)) {
        const warningMsg = `Không thể chuyển từ trạng thái '${
          STATUS_DETAILS[currentStatusUpper]?.label || currentStatus
        }' sang '${STATUS_DETAILS[newStatus]?.label || newStatus}'.`;
        message.warning(warningMsg);
        return;
      }

      setLoadingAction(orderId);
      setConfirmModalState((prev) => ({ ...prev, isLoading: true }));

      const originalProcessedOrders = [...processedOrders];

      const updatedProcessedOrders = processedOrders.map((order) =>
        order.orderId === orderId ? { ...order, status: newStatus } : order
      );
      setProcessedOrders(updatedProcessedOrders);

      const updatedDisplayedOrders = updatedProcessedOrders.filter(
        (o) =>
          statusFilter === "all" ||
          o.status.toLowerCase() === statusFilter.toLowerCase()
      );
      setDisplayedOrders(updatedDisplayedOrders);

      try {
        await apiService.applyOrderStatus({
          orderId: orderId,
          status: newStatus
        });

        message.success(
          `Đơn hàng #${orderId}: Trạng thái cập nhật thành công thành ${
            STATUS_DETAILS[newStatus]?.label || newStatus
          }.`
        );
        setConfirmModalState({
          visible: false,
          record: null,
          targetStatus: null,
          isLoading: false,
        });
        onRefresh();
      } catch (error) {
        if (error.response) {
          message.error(
            `Lỗi API (${error.response.status}): ${
              error.response.data?.message || "Không thể cập nhật."
            }`
          );
        } else if (error.request) {
          message.error("Không nhận được phản hồi từ máy chủ.");
        } else {
          message.error(`Lỗi: ${error.message}`);
        }

        setProcessedOrders(originalProcessedOrders);
        const revertedDisplayedOrders = originalProcessedOrders.filter(
          (o) =>
            statusFilter === "all" ||
            o.status.toLowerCase() === statusFilter.toLowerCase()
        );
        setDisplayedOrders(revertedDisplayedOrders);

        setConfirmModalState((prev) => ({ ...prev, isLoading: false }));
      } finally {
        setLoadingAction(null);
      }
    },
    [processedOrders, loadingAction, statusFilter]
  );

  const fetchShippers = async () => {
    try {
      const response = await apiService.getUsersByRole('SHIPPER');
      if (response?.data) {
        setShipperModalState(prev => ({
          ...prev,
          shipperList: response.data.map(shipper => ({
            value: shipper.userId,
            label: `${shipper.username} - ${shipper.phoneNumber || 'Chưa có số điện thoại'}`
          }))
        }));
      }
    } catch (error) {
      message.error('Không thể tải danh sách shipper');
    }
  };

  const showStatusChangeConfirm = useCallback((record, targetStatus) => {
    if (!record || !record.orderId || !record.status || !targetStatus) {
      message.error("Lỗi: Thiếu thông tin để hiển thị xác nhận.");
      return;
    }

    const fullRecord = processedOrders.find(o => o.orderId === record.orderId) || record;
    
    if (targetStatus === 'SHIPPING') {
      setShipperModalState({
        visible: true,
        orderId: fullRecord.orderId,
        targetStatus: targetStatus,
        shipperId: null,
        shipperList: [],
        loading: false
      });
      fetchShippers();
    } else {
      setConfirmModalState({
        visible: true,
        record: fullRecord,
        targetStatus: targetStatus,
        isLoading: false,
      });
    }
  }, [processedOrders]);

  const handleShipperModalOk = async () => {
    const { orderId, targetStatus, shipperId } = shipperModalState;
    if (!shipperId) {
      message.warning('Vui lòng chọn shipper');
      return;
    }

    setShipperModalState(prev => ({ ...prev, loading: true }));
    try {
      // Đầu tiên gán shipper cho đơn hàng
      await apiService.assignOrder(orderId, shipperId);
      // Sau đó cập nhật trạng thái
      await apiService.applyOrderStatus({
        orderId: orderId,
        status: targetStatus
      });

      message.success('Đã gán shipper và cập nhật trạng thái đơn hàng thành công');
      setShipperModalState({
        visible: false,
        orderId: null,
        targetStatus: null,
        shipperId: null,
        shipperList: [],
        loading: false
      });
      onRefresh();
    } catch (error) {
      message.error('Không thể cập nhật đơn hàng');
    } finally {
      setShipperModalState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleShipperModalCancel = () => {
    setShipperModalState({
      visible: false,
      orderId: null,
      targetStatus: null,
      shipperId: null,
      shipperList: [],
      loading: false
    });
  };

  const handleConfirmModalOk = useCallback(() => {
    const { record, targetStatus } = confirmModalState;
    if (record && targetStatus) {
      handleApplyStatus(record.orderId, record.status, targetStatus);
    } else {
      message.error("Lỗi: Không tìm thấy thông tin đơn hàng để xác nhận.");
      setConfirmModalState({
        visible: false,
        record: null,
        targetStatus: null,
        isLoading: false,
      });
    }
  }, [confirmModalState, handleApplyStatus]);

  const handleConfirmModalCancel = useCallback(() => {
    setConfirmModalState({
      visible: false,
      record: null,
      targetStatus: null,
      isLoading: false,
    });
  }, []);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText("");
    confirm();
    setSearchedColumn("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Tìm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters, confirm)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
        const recordValue = record[dataIndex];
        if (recordValue === null || typeof recordValue === 'undefined') {
            return false;
        }
        return recordValue.toString().toLowerCase().includes(value.toLowerCase());
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    ...Object.entries(STATUS_DETAILS).map(([key, { label }]) => ({
      value: key.toLowerCase(),
      label,
    })),
  ];

  const columns = [
    {
      title: "Mã ĐH",
      dataIndex: "orderId",
      key: "orderId",
      width: 80,
      fixed: "left",
      align: "center",
      sorter: (a, b) => a.orderId - b.orderId,
      ...getColumnSearchProps("orderId"),
    },
    {
      title: "Người dùng",
      dataIndex: "userName",
      key: "userName",
      width: 150,
      ellipsis: true,
      ...getColumnSearchProps("userName"),
    },
    {
      title: "Ngày đặt",
      dataIndex: "formattedCreatedAt",
      key: "formattedCreatedAt",
      width: 160,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 140,
      align: "right",
      render: formatCurrency,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "PT Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 120,
      filters: [
        { text: "Tiền mặt (CASH)", value: "CASH" },
        { text: "VNPAY", value: "VNPAY" },
      ],
      onFilter: (value, record) =>
        record.paymentMethod?.toUpperCase() === value.toUpperCase(),
    },
    {
      title: "Trạng thái ĐH",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => <OrderStatusTag status={status} />,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const currentRecord = processedOrders.find(o => o.key === record.key) || record;
        const currentStatusUpper = currentRecord.status;
        const isLoadingThisRow = loadingAction === currentRecord.orderId;

        if (currentStatusUpper === "DELIVERED" || currentStatusUpper === "REJECTED") {
          return (
            <Tooltip title="Xem chi tiết đơn hàng">
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailsModalContent({
                    visible: true,
                    orderId: currentRecord.orderId,
                  });
                }}
                disabled={!!loadingAction && loadingAction !== currentRecord.orderId}
              />
            </Tooltip>
          );
        }

        const possibleNextStatuses =
          VALID_STATUS_TRANSITIONS[currentStatusUpper] || [];
        if (possibleNextStatuses.length === 0) {
             return (
                <Tooltip title="Xem chi tiết đơn hàng">
                 <Button
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={(e) => {
                    e.stopPropagation();
                    setDetailsModalContent({
                        visible: true,
                        orderId: currentRecord.orderId,
                    });
                    }}
                    disabled={!!loadingAction && loadingAction !== currentRecord.orderId}
                 />
                </Tooltip>
            );
        }

        const menuItems = possibleNextStatuses.map((targetStatusKey) => ({
          key: targetStatusKey,
          label: `Chuyển sang "${
            STATUS_DETAILS[targetStatusKey]?.label || targetStatusKey
          }"`,
          danger: ["REJECTED", "FAILED_DELIVERY"].includes(targetStatusKey),
          onClick: (e) => {
            e.domEvent.stopPropagation();
            showStatusChangeConfirm(currentRecord, targetStatusKey);
          },
        }));

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Tooltip title="Thay đổi trạng thái">
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={(e) => e.stopPropagation()}
                loading={isLoadingThisRow}
                disabled={!!loadingAction && loadingAction !== currentRecord.orderId}
              />
            </Tooltip>
          </Dropdown>
        );
      },
    },
  ];

  const calculateRevenue = useCallback((orders) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthlyTotal = orders.reduce((sum, order) => {
      const [time, date] = order.formattedCreatedAt.split(' ');
      const [day, month, year] = date.split('/');
      const orderDate = new Date(year, month - 1, day);
      const orderMonth = orderDate.getMonth() + 1;
      
      if (orderMonth === currentMonth && orderDate.getFullYear() === currentYear) {
        return sum + (order.totalAmount || 0);
      }
      return sum;
    }, 0);

    const yearlyTotal = orders.reduce((sum, order) => {
      const [time, date] = order.formattedCreatedAt.split(' ');
      const [day, month, year] = date.split('/');
      const orderDate = new Date(year, month - 1, day);
      if (orderDate.getFullYear() === currentYear) {
        return sum + (order.totalAmount || 0);
      }
      return sum;
    }, 0);

    setMonthlyRevenue(monthlyTotal);
    setYearlyRevenue(yearlyTotal);
  }, []);

  useEffect(() => {
    if (processedOrders.length > 0) {
      calculateRevenue(processedOrders);
    }
  }, [processedOrders, calculateRevenue]);

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card bordered={false} style={{ background: '#f0f5ff' }}>
            <Statistic
              title={
                <Space>
                  <CalendarOutlined />
                  <span>Doanh thu tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</span>
                </Space>
              }
              value={monthlyRevenue}
              precision={0}
              valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false} style={{ background: '#f6ffed' }}>
            <Statistic
              title={
                <Space>
                  <CalendarOutlined />
                  <span>Doanh thu năm {new Date().getFullYear()}</span>
                </Space>
              }
              value={yearlyRevenue}
              precision={0}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <Select
          value={statusFilter}
          style={{ width: 200 }}
          onChange={(value) => setStatusFilter(value)}
          options={statusOptions}
          disabled={!!loadingAction}
        />
        <Button
          onClick={onRefresh}
          loading={loading && !loadingAction}
          disabled={!!loadingAction}
        >
          {loading && !loadingAction ? "Đang tải..." : "Tải Lại DS"}
        </Button>
      </Space>

      <Modal
        title={`Chi Tiết Đơn Hàng #${detailsModalContent.orderId || ""}`}
        open={detailsModalContent.visible}
        onCancel={() => setDetailsModalContent({ visible: false, orderId: null })}
        maskClosable={true}
        footer={null}
        destroyOnClose={true}
        width="80vw"
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        {detailsModalContent.visible && detailsModalContent.orderId ? (
          <OrderDetails
            orderId={detailsModalContent.orderId}
            handleRefreshParent={onRefresh}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        )}
      </Modal>

      <Modal
        title="Xác nhận thay đổi trạng thái?"
        open={confirmModalState.visible}
        onOk={handleConfirmModalOk}
        onCancel={handleConfirmModalCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={confirmModalState.isLoading}
        maskClosable={false}
      >
        {confirmModalState.record && confirmModalState.targetStatus ? (
          <div>
            <p>
              Đơn hàng: <Text strong>#{confirmModalState.record.orderId}</Text>
            </p>
            <p>
              Trạng thái hiện tại:{" "}
              <Text strong>
                <OrderStatusTag status={confirmModalState.record.status} />
              </Text>
            </p>
            <p>
              Chuyển thành:{" "}
              <Text strong>
                <OrderStatusTag status={confirmModalState.targetStatus} />
              </Text>
            </p>
            <p>Bạn có chắc muốn thực hiện thay đổi này?</p>
          </div>
        ) : (
          <p>Đang tải thông tin xác nhận...</p>
        )}
      </Modal>

      <Modal
        title="Chọn shipper giao hàng"
        open={shipperModalState.visible}
        onOk={handleShipperModalOk}
        onCancel={handleShipperModalCancel}
        confirmLoading={shipperModalState.loading}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div style={{ marginBottom: 16 }}>
          <p>Vui lòng chọn shipper để giao đơn hàng #{shipperModalState.orderId}</p>
          <Select
            style={{ width: '100%' }}
            placeholder="Chọn shipper"
            options={shipperModalState.shipperList}
            value={shipperModalState.shipperId}
            onChange={(value) => setShipperModalState(prev => ({ ...prev, shipperId: value }))}
            loading={shipperModalState.loading}
          />
        </div>
      </Modal>

      <Table
        columns={columns}
        dataSource={displayedOrders}
        rowKey="key"
        loading={loading || !!loadingAction}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          size: "large",
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} trên ${total} mục`,
        }}
        scroll={{ x: 1150 }}
        bordered
        size="middle"
        onRow={(record) => ({
          onClick: (event) => {
            const fullRecord = processedOrders.find(o => o.key === record.key) || record;
            const targetTagName = event.target.tagName.toLowerCase();
            const isActionClick = event.target.closest('.ant-btn, .ant-dropdown-trigger, .ant-dropdown-menu-item');

            if (!isActionClick && loadingAction !== fullRecord.orderId) {
              setDetailsModalContent({
                visible: true,
                orderId: fullRecord.orderId,
              });
            }
          },
          style: {
            cursor:
              loadingAction && loadingAction !== record.orderId
                ? "not-allowed"
                : "pointer",
          },
        })}
        rowClassName={(record) => (loadingAction === record.orderId ? "table-row-action-loading" : "")}
      />
    </div>
  );
};

export default AdminOrder;