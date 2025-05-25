import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  UserOutlined,
} from "@ant-design/icons";

import Highlighter from "react-highlight-words";

import OrderDetails from "./OrderDetails"; 
import apiService from "../../../services/api";

const { Text } = Typography;
const { Option } = Select;

const STATUS_DETAILS = {
  PENDING: { label: "Chờ xử lý", color: "gold" }, 
  APPROVED: { label: "Đã duyệt", color: "blue" },
  REJECTED: { label: "Bị từ chối", color: "error" },
  SHIPPING: { label: "Đang giao", color: "processing" }, 
  DELIVERED: { label: "Đã giao", color: "success" }, 
  COMPLETED: { label: "Hoàn thành", color: "success" }, 
  FAILED_DELIVERY: { label: "Giao thất bại", color: "volcano" },
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
  DELIVERED: ["COMPLETED"],
  COMPLETED: [], 
  FAILED_DELIVERY: ["SHIPPING", "REJECTED"],
};

function formatDate(isoString) {
  if (!isoString) return "N/A";
  try {
    var date = new Date(isoString);
    if (isNaN(date.getTime())) {
       const parts = isoString.split(' ');
       if(parts.length === 2) {
           const [timePart, datePart] = parts;
           const [day, month, year] = datePart.split('/').map(Number);
           const [hour, minute, second] = timePart.split(':').map(Number);

           const customDate = new Date(year, month - 1, day, hour, minute, second);
           if (!isNaN(customDate.getTime())) {
               date = customDate;
           } else {
                return "Invalid Date Format"; 
           }
       } else {
            return "Invalid Date Format"; 
       }
    }
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false,
    });
  } catch (e) {
      console.error("Error formatting date:", e); 
      return "Error Formatting Date";
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
    loading: false,
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
         if (!Array.isArray(fetchedUsers))
             console.warn("Dữ liệu người dùng trả về không hợp lệ.");


        const userMap = new Map(
          fetchedUsers.map((user) => [user.userId, user])
        );



        const finalProcessedData = fetchedOrders.map((order) => {




          return {
            key: order.orderId,
            orderId: order.orderId,
            userId: order.userId,
            userName: userMap.get(order.userId)?.username || "N/A",
             shipperId: order.shipperId,


             shipperName: order.shipperId ? 'Shipper đã nhận đơn' : 'Chưa có',
            formattedCreatedAt: formatDate(order.createdAt),
            paymentMethod: order.paymentMethod || "N/A",
            status: order.status?.toUpperCase() || "PENDING",
            totalAmount: order.totalAmount ?? 0,
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

        console.error("Error fetching data:", error);
        message.error(
          `Lỗi tải dữ liệu: ${error.message || "Lỗi không xác định"}`
        );
        setProcessedOrders([]);
        setDisplayedOrders([]);
      } finally {
        setLoading(false);
         setLoadingAction(null);
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


  const calculateRevenue = useCallback((orders) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthlyTotal = 0;
    let yearlyTotal = 0;


    orders.forEach(order => {

        if (order.status === 'DELIVERED' || order.status === 'COMPLETED') {


            let orderDate;
            try {
                 orderDate = new Date(order.formattedCreatedAt);
                if (isNaN(orderDate.getTime())) {

                    const parts = order.formattedCreatedAt.split(' ');
                    if(parts.length === 2) {
                        const datePart = parts[1];
                        const [day, month, year] = datePart.split('/').map(Number);

                        orderDate = new Date(year, month - 1, day);
                    }
                 }


                if (!isNaN(orderDate.getTime())) {
                    const orderMonth = orderDate.getMonth();
                    const orderYear = orderDate.getFullYear();
                    const amount = order.totalAmount || 0;


                    if (orderMonth === currentMonth && orderYear === currentYear) {
                        monthlyTotal += amount;
                    }

                    if (orderYear === currentYear) {
                        yearlyTotal += amount;
                    }
                } else {

                    console.warn("Could not parse date for revenue calculation for order:", order.orderId, order.formattedCreatedAt);
                }
            } catch (e) {
                 console.error("Error processing date for revenue calculation:", order.orderId, order.formattedCreatedAt, e);
            }
        }
    });


    setMonthlyRevenue(monthlyTotal);
    setYearlyRevenue(yearlyTotal);
  }, []);


  useEffect(() => {
    if (processedOrders.length > 0) {
      calculateRevenue(processedOrders);
    } else {

        setMonthlyRevenue(0);
        setYearlyRevenue(0);
    }
  }, [processedOrders, calculateRevenue]);



  const handleApplyStatus = useCallback(
    async (orderId, currentStatus, newStatus, extraData = {}) => {

      if (loadingAction === orderId) {
        return;
      }


      if (!orderId || !currentStatus || !newStatus) {
         message.error("Thông tin trạng thái hoặc đơn hàng không đầy đủ.");
         return;
      }

      const currentStatusUpper = currentStatus?.toUpperCase();
      const newStatusUpper = newStatus?.toUpperCase();


      const validTransitions = VALID_STATUS_TRANSITIONS[currentStatusUpper] || [];

      if (!validTransitions.includes(newStatusUpper)) {
        const warningMsg = `Không thể chuyển từ trạng thái '${
          STATUS_DETAILS[currentStatusUpper]?.label || currentStatus
        }' sang '${STATUS_DETAILS[newStatusUpper]?.label || newStatus}'.`;
        message.warning(warningMsg);

         setConfirmModalState(prev => ({ ...prev, isLoading: false }));
         setShipperModalState(prev => ({...prev, loading: false}));
        return;
      }

      setLoadingAction(orderId);


      const originalProcessedOrders = [...processedOrders];
      const updatedProcessedOrders = processedOrders.map((order) => {
           if (order.orderId === orderId) {
               const updatedOrder = { ...order, status: newStatusUpper, ...extraData };

               if (newStatusUpper === 'SHIPPING' && extraData.shipperId) {

                   const selectedShipper = shipperModalState.shipperList.find(s => s.value === extraData.shipperId);
                    updatedOrder.shipperName = selectedShipper ? selectedShipper.label : 'Đã gán shipper';
               } 
               return updatedOrder;
           }
           return order;
      });
      setProcessedOrders(updatedProcessedOrders);

      try {

        await apiService.applyOrderStatus({
          orderId: orderId,
          status: newStatusUpper,
           ...extraData
        });


        message.success(
          `Đơn hàng #${orderId}: Trạng thái cập nhật thành công thành ${
            STATUS_DETAILS[newStatusUpper]?.label || newStatus
          }.`
        );


         onRefresh();

      } catch (error) {

        console.error(`Error applying status ${newStatus} to order ${orderId}:`, error);
        if (error.response) {
          message.error(
            `Lỗi API (${error.response.status}): ${
              error.response.data?.message || "Không thể cập nhật trạng thái."
            }`
          );
        } else if (error.request) {
          message.error("Không nhận được phản hồi từ máy chủ khi cập nhật trạng thái.");
        } else {
          message.error(`Lỗi cập nhật trạng thái: ${error.message}`);
        }


        setProcessedOrders(originalProcessedOrders);

      } finally {
        setLoadingAction(null);

        setConfirmModalState(prev => ({ ...prev, visible: false, record: null, targetStatus: null, isLoading: false }));
         setShipperModalState(prev => ({ ...prev, visible: false, orderId: null, targetStatus: null, shipperId: null, loading: false }));
      }
    },
    [processedOrders, loadingAction, onRefresh, shipperModalState.shipperList]
  );




  const fetchShipperListForModal = useCallback(async () => {
     setShipperModalState(prev => ({...prev, loading: true, shipperList: []}));
     try {

         const response = await apiService.getUsersByRole('SHIPPER');
         if (response?.data && Array.isArray(response.data)) {
             setShipperModalState(prev => ({
                 ...prev,
                 shipperList: response.data.map(shipper => ({
                     value: shipper.userId,
                     label: `${shipper.fullName || shipper.username}${shipper.phoneNumber ? ` - ${shipper.phoneNumber}` : ''}`
                 })).filter(shipper => shipper.value != null && shipper.value !== ''),
                 loading: false,
             }));
         } else {
              console.warn("Invalid data structure received for shippers:", response?.data);
             message.warning('Không có dữ liệu shipper hợp lệ.');
             setShipperModalState(prev => ({...prev, shipperList: [], loading: false}));
         }
     } catch (error) {
         console.error("Error fetching shippers for modal:", error);
         message.error('Không thể tải danh sách người giao hàng.');
         setShipperModalState(prev => ({...prev, shipperList: [], loading: false}));
     }
  }, []);




  const showStatusChangeConfirm = useCallback((record, targetStatus) => {

    if (!record || !record.orderId || !record.status || !targetStatus) {
      message.error("Lỗi: Thiếu thông tin để hiển thị xác nhận.");
      return;
    }


    const fullRecord = processedOrders.find(o => o.orderId === record.orderId) || record;
    const targetStatusUpper = targetStatus.toUpperCase();




    if (targetStatusUpper === 'SHIPPING') {
      setShipperModalState({
        visible: true,
        orderId: fullRecord.orderId,
        targetStatus: targetStatusUpper,
        shipperId: fullRecord.shipperId,
        shipperList: [],
        loading: true
      });

      fetchShipperListForModal();
    } else {

      setConfirmModalState({
        visible: true,
        record: fullRecord,
        targetStatus: targetStatusUpper,
        isLoading: false,
      });
    }
  }, [processedOrders, fetchShipperListForModal]);


  const handleConfirmModalOk = useCallback(() => {
    const { record, targetStatus } = confirmModalState;
    if (record && targetStatus) {
       setConfirmModalState(prev => ({ ...prev, isLoading: true }));

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


  const handleShipperModalOk = useCallback(() => {
      const { orderId, targetStatus, shipperId, loading: shipperListLoading } = shipperModalState;


      if (shipperListLoading) return;


      if (targetStatus === 'SHIPPING' && !shipperId) {
          message.warning("Vui lòng chọn người giao hàng.");
          return;
      }

       const order = processedOrders.find(o => o.orderId === orderId);
       if (!order) {
           message.error("Không tìm thấy thông tin đơn hàng.");

            setShipperModalState(prev => ({ ...prev, visible: false, orderId: null, targetStatus: null, shipperId: null, loading: false }));
           return;
       }


       setShipperModalState(prev => ({ ...prev, loading: true }));


      handleApplyStatus(orderId, order.status, targetStatus, { shipperId: shipperId });

  }, [shipperModalState, processedOrders, handleApplyStatus]);


  const handleShipperModalCancel = useCallback(() => {
    setShipperModalState({
      visible: false,
      orderId: null,
      targetStatus: null,
      shipperId: null,
      shipperList: [],
      loading: false,
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
     setSearchedColumn("");
    confirm();
  };



  const getColumnSearchProps = useCallback((dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}> {/* Prevent modal close on keydown */}
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
  }, [searchText, searchedColumn]));


  const statusOptions = useMemo(() => [
    { value: "all", label: "Tất cả trạng thái" },

    ...Object.entries(STATUS_DETAILS).map(([key, { label }]) => ({
      value: key.toLowerCase(),
      label,
    })),
  ], []);



  const columns = useMemo(() => [
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
        title: "Người giao hàng",
        dataIndex: "shipperName",
        key: "shipperName",
        width: 150,
        ellipsis: true,
        render: (text) => text || 'Chưa gán',
        ...getColumnSearchProps("shipperName"),
     },
    {
      title: "Ngày đặt",
      dataIndex: "formattedCreatedAt",
      key: "formattedCreatedAt",
      width: 160,
       sorter: (a, b) => {
           try {
               const dateA = new Date(a.formattedCreatedAt);
               const dateB = new Date(b.formattedCreatedAt);
               return dateA.getTime() - dateB.getTime();
           } catch {
               return 0;
           }
       },
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

      filters: Object.entries(STATUS_DETAILS).map(([key, { label }]) => ({
           text: label,
           value: key.toUpperCase(),
      })),

      onFilter: (value, record) => record.status === value,
      filterMultiple: true,
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

        const isAnyOtherRowLoading = !!loadingAction && loadingAction !== currentRecord.orderId;


        const possibleNextStatuses =
          VALID_STATUS_TRANSITIONS[currentStatusUpper] || [];


        const showStatusChangeDropdown = currentStatusUpper === 'PENDING';




        const menuItems = possibleNextStatuses

           .map((targetStatusKey) => ({
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
          <Space size="small">
              {/* Button to view order details */}
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

                    disabled={!!loadingAction}
                 />
              </Tooltip>

               {/* Status Change Dropdown - Only show if allowed by Requirement 1 */}
               {/* This dropdown is primarily for PENDING state transitions (APPROVED, REJECTED)
                   or potentially APPROVED state transitions (like SHIPPING) if implemented here */}
               {showStatusChangeDropdown && (
                  <Tooltip title="Thay đổi trạng thái">
                     <Dropdown

                        menu={{ items: menuItems }}

                        trigger={["click"]}

                        disabled={isLoadingThisRow || isAnyOtherRowLoading || menuItems.length === 0}
                     >
                       {/* Button that triggers the dropdown */}
                       <Button
                         icon={<EditOutlined />}
                         size="small"

                         onClick={(e) => e.stopPropagation()}

                         loading={isLoadingThisRow}

                         disabled={isLoadingThisRow || isAnyOtherRowLoading}
                       />
                     </Dropdown>
                  </Tooltip>
               )}
          </Space>
        );
      },
    },
  ], [processedOrders, loadingAction, getColumnSearchProps, showStatusChangeConfirm]);



  return (
    <div>
        {/* --- Dashboard Revenue Cards --- */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}> {/* Responsive column width */}
          <Card bordered={false} style={{ background: '#f0f5ff' }}> {/* Custom background color */}
            <Statistic
              title={
                <Space>
                  <CalendarOutlined /> {/* Icon */}
                  <span>Doanh thu tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</span> {/* Display current month/year */}
                </Space>
              }
              value={monthlyRevenue}
              precision={0}
              valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}> {/* Responsive column width */}
          <Card bordered={false} style={{ background: '#f6ffed' }}> {/* Custom background color */}
            <Statistic
              title={
                <Space>
                  <CalendarOutlined /> {/* Icon */}
                  <span>Doanh thu năm {new Date().getFullYear()}</span> {/* Display current year */}
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

        {/* --- Filter and Refresh Controls --- */}
      <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", flexWrap: 'wrap' }}> {/* Use flexbox for layout, allow wrapping */}
        {/* Status filter dropdown */}
        <Select
          value={statusFilter}
          style={{ width: 200 }}
          onChange={(value) => setStatusFilter(value)}
          options={statusOptions}
          disabled={loading}
        />
         {/* Global search input could go here if needed, but column search is implemented */}
        {/* Button to refresh data */}
        <Button
          onClick={onRefresh}
          loading={loading && !loadingAction}
          disabled={!!loadingAction}
        >
          {loading && !loadingAction ? "Đang tải..." : "Tải Lại DS"} {/* Button text */}
        </Button>
      </Space>

      {/* --- Order Details Modal --- */}
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
        {/* Render OrderDetails component only when modal is visible and orderId is set */}
        {detailsModalContent.visible && detailsModalContent.orderId && (
          <OrderDetails
            orderId={detailsModalContent.orderId}
            handleRefreshParent={onRefresh}
          />
        )}
         {/* Fallback loading spinner if modal is visible but orderId is missing */}
        {!detailsModalContent.orderId && detailsModalContent.visible && (
             <div style={{ textAlign: "center", padding: "50px" }}>
               <Spin size="large" />
               <p>Đang tải chi tiết đơn hàng...</p>
             </div>
         )}
      </Modal>

      {/* --- Standard Status Confirmation Modal (for non-SHIPPING changes or changes NOT handled by shipper modal) --- */}
      <Modal
        title="Xác nhận thay đổi trạng thái?"
        open={confirmModalState.visible}
        onOk={handleConfirmModalOk}
        onCancel={handleConfirmModalCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={confirmModalState.isLoading}
        maskClosable={false}
         destroyOnClose={true}
      >
        {/* Display confirmation message if record and target status are available */}
        {confirmModalState.record && confirmModalState.targetStatus ? (
          <div>
             <p>
              Bạn có chắc chắn muốn chuyển trạng thái của Đơn hàng{" "}
              <Text strong>#{confirmModalState.record.orderId}</Text> từ{" "}
              <Text strong>
                <OrderStatusTag status={confirmModalState.record.status} /> {/* Display current status */}
              </Text>{" "}
              sang{" "}
              <Text strong>
                <OrderStatusTag status={confirmModalState.targetStatus} /> {/* Display target status */}
              </Text>
              ?
            </p>
          </div>
        ) : (

          <p>Đang tải thông tin xác nhận...</p>
        )}
      </Modal>

        {/* --- Shipper Assignment Modal (for SHIPPING status) --- */}
        <Modal
            title="Chọn Người Giao Hàng"
            open={shipperModalState.visible}
            onOk={handleShipperModalOk}
            onCancel={handleShipperModalCancel}
            okText="Xác nhận"
            cancelText="Hủy"
            confirmLoading={shipperModalState.loading && shipperModalState.targetStatus === 'SHIPPING'}
            maskClosable={!shipperModalState.loading}
            destroyOnClose={true}
        >
            {/* Display message/content based on state */}
            {shipperModalState.loading && shipperModalState.shipperList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin />
                    <p>Đang tải danh sách người giao hàng...</p>
                </div>
            ) : shipperModalState.targetStatus === 'SHIPPING' && shipperModalState.orderId ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                     <Alert
                         message="Xác nhận gán người giao hàng"
                         description={`Chọn người giao hàng cho Đơn hàng #${shipperModalState.orderId} để chuyển trạng thái sang "${STATUS_DETAILS['SHIPPING'].label}".`}
                         type="info"
                         showIcon

                     />
                     <Text strong>Chọn Người Giao Hàng:</Text>
                     <Select
                         showSearch
                         placeholder="Tìm và chọn người giao hàng"
                         optionFilterProp="children"
                         filterOption={(input, option) =>
                             (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                         }
                         value={shipperModalState.shipperId}
                         onChange={(value) => setShipperModalState(prev => ({...prev, shipperId: value}))}
                         style={{ width: '100%' }}
                         loading={shipperModalState.loading && shipperModalState.shipperList.length === 0}
                         disabled={shipperModalState.loading && shipperModalState.shipperList.length === 0}
                     >
                         {/* Map shipperList to Select Options */}
                         {shipperModalState.shipperList.map(shipper => (
                             <Option key={shipper.value} value={shipper.value} label={shipper.label}>
                                 <Space>
                                     <UserOutlined /> {/* Icon */}
                                     {shipper.label} {/* Display shipper label */}
                                 </Space>
                             </Option>
                         ))}
                     </Select>
                     {/* Optional: Show message if no shippers found after loading */}
                      {shipperModalState.shipperList.length === 0 && !shipperModalState.loading && (
                           <Alert message="Không tìm thấy người giao hàng nào khả dụng." type="warning" showIcon />
                      )}
                </Space>
            ) : (

                <p>Lỗi hiển thị thông tin người giao hàng.</p>
            )}
        </Modal>


      {/* --- Main Order Table --- */}
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
        scroll={{ x: 1200 }}
        bordered
        size="middle"

        onRow={(record) => ({
          onClick: (event) => {

             const currentRecord = processedOrders.find(o => o.key === record.key) || record;


            const isInteractiveElement = event.target.closest('button, a, input, select, .ant-dropdown-trigger, .ant-dropdown-menu-item, .ant-select-selector');


            if (!isInteractiveElement && loadingAction !== currentRecord.orderId) {

              setDetailsModalContent({
                visible: true,
                orderId: currentRecord.orderId,
              });
            }
          },

          style: {

            cursor:
              loadingAction === record.orderId
                ? "progress"
                : (loadingAction ? "not-allowed" : "pointer"),
          },
        })}

        rowClassName={(record) => (loadingAction === record.orderId ? "table-row-action-loading" : "")}
      />
    </div>
  );
};

export default AdminOrder;