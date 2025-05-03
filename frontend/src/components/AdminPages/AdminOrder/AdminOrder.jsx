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
} from "antd";
import {
  SearchOutlined,
  ExclamationCircleFilled,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import OrderDetails from "./OrderDetails"; // Component chi tiết đơn hàng
import apiService from "../../../services/api"; // Service gọi API

const { Text } = Typography;

// --- Hàm tiện ích ---
const STATUS_DETAILS = {
  PENDING: { label: "Chờ xử lý", color: "gold" },
  APPROVED: { label: "Đã duyệt", color: "lime" },
  REJECTED: { label: "Bị từ chối", color: "error" },
  SHIPPING: { label: "Đang giao", color: "processing" },
  DELIVERED: { label: "Đã giao", color: "success" },
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
  APPROVED: ["SHIPPING", "REJECTED"],
  SHIPPING: ["DELIVERED", "REJECTED"],
  DELIVERED: [],
  REJECTED: ["PENDING", "APPROVED"],
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
    /* console.error("Lỗi định dạng ngày:", isoString, error); */ return "Invalid Date";
  }
}
const formatCurrency = (value) => {
  if (typeof value !== "number" || isNaN(value)) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// --- Component Chính: Quản lý Đơn hàng ---
const AdminOrder = () => {
  // --- State của Component ---
  const [processedOrders, setProcessedOrders] = useState([]); // Danh sách đơn hàng đã xử lý (kết hợp user) để tìm kiếm/filter
  const [displayedOrders, setDisplayedOrders] = useState([]); // Danh sách đơn hàng hiển thị trên bảng (sau khi filter)
  const [detailsModalContent, setDetailsModalContent] = useState({
    visible: false,
    orderId: null,
  }); // State cho modal xem chi tiết đơn hàng
  const [loading, setLoading] = useState(true); // State loading chính (tải dữ liệu ban đầu)
  const [statusFilter, setStatusFilter] = useState("all"); // State bộ lọc trạng thái
  const [loadingAction, setLoadingAction] = useState(null); // State loading cho một hành động cụ thể (vd: cập nhật trạng thái), lưu orderId đang xử lý
  const [searchText, setSearchText] = useState(""); // State cho text tìm kiếm trong cột
  const [searchedColumn, setSearchedColumn] = useState(""); // State cho cột đang được tìm kiếm
  const searchInput = useRef(null); // Ref cho input tìm kiếm

  // --- State MỚI cho Modal Xác nhận Thay đổi Trạng thái ---
  const [confirmModalState, setConfirmModalState] = useState({
    visible: false, // Trạng thái hiển thị modal
    record: null, // Dữ liệu của dòng (đơn hàng) cần xác nhận
    targetStatus: null, // Trạng thái mới muốn chuyển đến (VD: 'SHIPPING')
    isLoading: false, // Trạng thái loading cho nút "Xác nhận" trong modal này
  });
  // ------------------------------------------------------

  // --- Hàm tải dữ liệu đơn hàng và người dùng ---
  const fetchData = useCallback(
    async (showSuccessMessage = false) => {
      setLoading(true); // Bắt đầu loading chính
      // Chỉ reset danh sách nếu không phải đang refresh sau 1 action (để tránh bảng trống tạm thời)
      if (!loadingAction) {
        setProcessedOrders([]);
        setDisplayedOrders([]);
      }
      try {
        // Gọi API lấy đơn hàng và user đồng thời
        const [orderResponse, userResponse] = await Promise.all([
          apiService.getAllOrders(),
          apiService.getUsersByRole("CUSTOMER"),
        ]);
        const fetchedOrders = orderResponse?.data || [];
        const fetchedUsers = userResponse?.data || [];

        // Kiểm tra dữ liệu trả về cơ bản
        if (!Array.isArray(fetchedOrders))
          throw new Error("Dữ liệu đơn hàng trả về không hợp lệ.");
        // if (!Array.isArray(fetchedUsers)) // Bỏ warning nếu không có user cũng được

        // Tạo Map để tra cứu user nhanh theo userId
        const userMap = new Map(
          fetchedUsers.map((user) => [user.userId, user])
        );

        // Xử lý dữ liệu đơn hàng: kết hợp tên user, định dạng ngày, chuẩn hóa trạng thái (UPPERCASE)
        const finalProcessedData = fetchedOrders.map((order) => ({
          key: order.orderId, // Key cho Table Antd
          orderId: order.orderId,
          userId: order.userId,
          userName: userMap.get(order.userId)?.username || "N/A", // Lấy username từ Map
          formattedCreatedAt: formatDate(order.createdAt),
          paymentMethod: order.paymentMethod || "N/A",
          status: order.status?.toUpperCase() || "PENDING", // Luôn lưu trữ trạng thái dạng UPPERCASE trong state
          totalAmount: order.totalAmount ?? 0,
        }));

        setProcessedOrders(finalProcessedData); // Lưu danh sách đã xử lý

        // Áp dụng bộ lọc ban đầu sau khi tải xong
        const ordersToDisplay =
          statusFilter === "all"
            ? finalProcessedData
            : finalProcessedData.filter(
                (o) => o.status.toLowerCase() === statusFilter.toLowerCase()
              );
        setDisplayedOrders(ordersToDisplay); // Cập nhật danh sách hiển thị

        // Hiển thị thông báo thành công nếu được yêu cầu (thường là khi nhấn nút Refresh)
        if (showSuccessMessage) {
          message.success(
            `Tải lại danh sách ${finalProcessedData.length} đơn hàng thành công.`
          );
        }
      } catch (error) {
        // console.error("LOG: Error fetching data:", error);
        message.error(
          `Lỗi tải dữ liệu: ${error.message || "Lỗi không xác định"}`
        );
        setProcessedOrders([]); // Xóa dữ liệu nếu lỗi
        setDisplayedOrders([]);
      } finally {
        setLoading(false); // Kết thúc loading chính
      }
      // Phụ thuộc vào bộ lọc và trạng thái action (có thể cần xem lại nếu `loadingAction` gây fetch lại không mong muốn)
    },
    [statusFilter, loadingAction]
  );

  // Tải dữ liệu lần đầu khi component được mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Áp dụng bộ lọc phía client mỗi khi bộ lọc hoặc danh sách gốc thay đổi
  useEffect(() => {
    if (!loading) {
      // Chỉ filter khi không còn loading ban đầu
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

  // --- Hàm xử lý khi nhấn nút Refresh ---
  const onRefresh = useCallback(() => {
    fetchData(true); // Gọi fetchData và yêu cầu hiển thị thông báo thành công
  }, [fetchData]);

  // --- Hàm xử lý chính: Cập nhật trạng thái đơn hàng (gọi API) ---
  const handleApplyStatus = useCallback(
    async (orderId, currentStatus, newStatus) => {
      // newStatus nhận vào ở đây là UPPERCASE

      // Ngăn chặn nếu action cho order này đang chạy
      if (loadingAction === orderId) {
        return;
      }
      // Kiểm tra tham số đầu vào cơ bản
      if (!orderId || !currentStatus || !newStatus) {
        return;
      }

      const currentStatusUpper = currentStatus?.toUpperCase(); // Đảm bảo current cũng là UPPERCASE
      const validTransitions =
        VALID_STATUS_TRANSITIONS[currentStatusUpper] || [];

      // Kiểm tra tính hợp lệ của việc chuyển trạng thái
      if (!validTransitions.includes(newStatus)) {
        const warningMsg = `Không thể chuyển từ trạng thái '${
          STATUS_DETAILS[currentStatusUpper]?.label || currentStatus
        }' sang '${STATUS_DETAILS[newStatus]?.label || newStatus}'.`;
        message.warning(warningMsg);
        return;
      }

      // Bắt đầu xử lý: Đặt loading cho dòng và modal xác nhận
      setLoadingAction(orderId); // Loading cho icon trên dòng của bảng
      setConfirmModalState((prev) => ({ ...prev, isLoading: true })); // Loading cho nút OK trong modal xác nhận
      const originalProcessedOrders = [...processedOrders]; // Sao lưu trạng thái hiện tại để có thể revert nếu lỗi

      // --- Cập nhật giao diện tạm thời (Optimistic Update) ---
      // Giả định thành công và cập nhật state ngay lập tức để UI phản hồi nhanh
      const updateOrderInState = (orders) =>
        orders.map(
          (order) =>
            order.orderId === orderId ? { ...order, status: newStatus } : order // Cập nhật trạng thái (UPPERCASE)
        );
      setProcessedOrders(updateOrderInState); // Cập nhật danh sách gốc
      // Cập nhật danh sách hiển thị dựa trên danh sách gốc *đã cập nhật* và bộ lọc hiện tại
      const updatedDisplayedOrders = updateOrderInState(
        originalProcessedOrders
      ).filter(
        (o) =>
          statusFilter === "all" ||
          o.status.toLowerCase() === statusFilter.toLowerCase()
      );
      setDisplayedOrders(updatedDisplayedOrders);
      // --- Kết thúc Optimistic Update ---

      try {
        // Chuẩn bị payload gửi đi API (API yêu cầu status dạng lowercase)
        const payload = { orderId: orderId, status: newStatus.toLowerCase() };

        // Kiểm tra service API trước khi gọi (đề phòng lỗi import)
        if (!apiService || typeof apiService.updateOrderStatus !== "function") {
          throw new Error(
            "apiService hoặc apiService.updateOrderStatus không tồn tại!"
          );
        }
        // --- Gọi API ---
        await apiService.updateOrderStatus(payload);
        // ---------------

        // Xử lý khi API thành công
        message.success(
          `Đơn hàng #${orderId}: Trạng thái cập nhật thành công thành ${
            STATUS_DETAILS[newStatus]?.label || newStatus
          }.`
        );
        // Đóng modal xác nhận lại
        setConfirmModalState({
          visible: false,
          record: null,
          targetStatus: null,
          isLoading: false,
        });
      } catch (error) {
        // Xử lý khi API thất bại
        // console.error(`LOG: <<< API CALL FAILED or Error during process <<<`, error);
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

        // --- Hoàn tác lại trạng thái (Revert State) ---
        // Trả lại state về trạng thái trước khi thực hiện optimistic update
        setProcessedOrders(originalProcessedOrders);
        const revertedDisplayedOrders = originalProcessedOrders.filter(
          (o) =>
            statusFilter === "all" ||
            o.status.toLowerCase() === statusFilter.toLowerCase()
        );
        setDisplayedOrders(revertedDisplayedOrders);
        // --- Kết thúc Revert State ---

        // Giữ modal xác nhận mở nhưng tắt loading của nút OK để người dùng biết lỗi
        setConfirmModalState((prev) => ({ ...prev, isLoading: false }));
      } finally {
        // Luôn luôn reset loading của dòng trên bảng khi kết thúc (dù thành công hay thất bại)
        setLoadingAction(null);
      }
    },
    [processedOrders, loadingAction, statusFilter /*, fetchData */]
  ); // Dependencies

  // --- Hàm kích hoạt hiển thị Modal Xác nhận ---
  // Hàm này chỉ đơn giản là set state để mở modal và lưu dữ liệu cần thiết
  const showStatusChangeConfirm = useCallback((record, targetStatus) => {
    // targetStatus nhận vào là UPPERCASE
    if (!record || !record.orderId || !record.status || !targetStatus) {
      message.error("Lỗi: Thiếu thông tin để hiển thị xác nhận.");
      return;
    }
    // Cập nhật state của modal xác nhận
    setConfirmModalState({
      visible: true, // Hiển thị modal
      record: record, // Lưu lại thông tin dòng được chọn
      targetStatus: targetStatus, // Lưu lại trạng thái mới muốn chuyển
      isLoading: false, // Reset trạng thái loading của nút OK
    });
  }, []); // Không cần dependencies vì chỉ set state

  // --- Hàm xử lý khi nhấn nút "Xác nhận" (OK) trên Modal Xác nhận MỚI ---
  const handleConfirmModalOk = useCallback(() => {
    const { record, targetStatus } = confirmModalState; // Lấy dữ liệu từ state của modal
    if (record && targetStatus) {
      // Gọi hàm xử lý chính để thực hiện việc cập nhật và gọi API
      handleApplyStatus(record.orderId, record.status, targetStatus);
      // Việc quản lý loading và đóng modal đã được chuyển vào trong handleApplyStatus
    } else {
      message.error("Lỗi: Không tìm thấy thông tin đơn hàng để xác nhận.");
      // Đóng modal nếu dữ liệu bị lỗi
      setConfirmModalState({
        visible: false,
        record: null,
        targetStatus: null,
        isLoading: false,
      });
    }
  }, [confirmModalState, handleApplyStatus]); // Phụ thuộc state modal và hàm xử lý chính

  // --- Hàm xử lý khi nhấn nút "Hủy" hoặc đóng Modal Xác nhận MỚI ---
  const handleConfirmModalCancel = useCallback(() => {
    // Chỉ cần ẩn modal và xóa dữ liệu tạm
    setConfirmModalState({
      visible: false,
      record: null,
      targetStatus: null,
      isLoading: false,
    });
  }, []); // Không cần dependencies

  // --- Logic Tìm kiếm trong cột (Giữ nguyên) ---
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
        {" "}
        <Input
          ref={searchInput}
          placeholder={`Tìm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />{" "}
        <Space>
          {" "}
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            {" "}
            Tìm{" "}
          </Button>{" "}
          <Button
            onClick={() => clearFilters && handleReset(clearFilters, confirm)}
            size="small"
            style={{ width: 90 }}
          >
            {" "}
            Reset{" "}
          </Button>{" "}
          <Button type="link" size="small" onClick={() => close()}>
            {" "}
            Đóng{" "}
          </Button>{" "}
        </Space>{" "}
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
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

  // --- Các lựa chọn cho Bộ lọc Trạng thái (Giữ nguyên) ---
  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    ...Object.entries(STATUS_DETAILS).map(([key, { label }]) => ({
      value: key.toLowerCase(),
      label,
    })),
  ];

  // --- Định nghĩa các cột cho Bảng (Table) ---
  const columns = [
    // Các cột Mã ĐH, Người dùng, Ngày đặt, Tổng tiền, PT Thanh toán, Trạng thái ĐH (Giữ nguyên)
    {
      title: "Mã ĐH",
      dataIndex: "orderId",
      key: "orderId",
      width: 80,
      fixed: "left",
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
      width: 160 /* Sorter if needed */,
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
    }, // status đã là UPPERCASE
    // --- Cột Hành động ---
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        // record là dữ liệu của dòng hiện tại
        const currentStatusUpper = record.status; // status trong record đã là UPPERCASE
        const isLoadingThisRow = loadingAction === record.orderId; // Kiểm tra xem dòng này có đang loading không

        // Trường hợp 1: Đơn hàng đã giao (DELIVERED) -> Hiển thị nút xem chi tiết
        if (currentStatusUpper === "DELIVERED") {
          return (
            <Tooltip title="Xem chi tiết đơn hàng">
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện click của cả hàng
                  // Mở modal xem chi tiết (sử dụng state detailsModalContent)
                  setDetailsModalContent({
                    visible: true,
                    orderId: record.orderId,
                  });
                }}
                aria-label={`Xem chi tiết đơn ${record.orderId}`}
                // Vô hiệu hóa nếu có action khác đang chạy (dù không phải dòng này)
                disabled={!!loadingAction && loadingAction !== record.orderId}
              />
            </Tooltip>
          );
        }

        // Trường hợp 2: Các trạng thái khác -> Hiển thị nút sửa trạng thái (Dropdown)
        const possibleNextStatuses =
          VALID_STATUS_TRANSITIONS[currentStatusUpper] || []; // Lấy các trạng thái kế tiếp hợp lệ
        // Nếu không có trạng thái kế tiếp nào -> Hiển thị dấu gạch ngang
        if (possibleNextStatuses.length === 0) {
          return <Text type="secondary">-</Text>;
        }

        // Tạo các mục menu cho Dropdown
        const menuItems = possibleNextStatuses.map((targetStatusKey) => ({
          // targetStatusKey là UPPERCASE
          key: targetStatusKey,
          label: `Chuyển sang "${
            STATUS_DETAILS[targetStatusKey]?.label || targetStatusKey
          }"`, // Text hiển thị
          danger: ["REJECTED"].includes(targetStatusKey), // Đánh dấu đỏ nếu là "Từ chối"
          onClick: (e) => {
            e.domEvent.stopPropagation(); // Ngăn sự kiện click của cả hàng
            // Gọi hàm để mở Modal Xác nhận MỚI
            showStatusChangeConfirm(record, targetStatusKey);
          },
        }));

        // Trả về component Dropdown chứa các menu item
        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            // Vô hiệu hóa nếu dòng này hoặc bất kỳ action nào khác đang chạy
            disabled={isLoadingThisRow || !!loadingAction}
          >
            <Tooltip title="Thay đổi trạng thái">
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click của cả hàng
                loading={isLoadingThisRow} // Hiển thị loading chỉ cho nút này
                aria-label={`Đổi trạng thái đơn ${record.orderId}`}
                disabled={!!loadingAction} // Vô hiệu hóa nếu có action đang chạy
              />
            </Tooltip>
          </Dropdown>
        );
      },
    },
  ];

  // --- Render Giao diện ---
  return (
    <div>
      {/* Thanh Filter và Nút Refresh */}
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Select
          value={statusFilter}
          style={{ width: 200 }}
          onChange={(value) => setStatusFilter(value)} // Cập nhật state filter khi thay đổi
          options={statusOptions} // Danh sách trạng thái
          aria-label="Lọc đơn hàng theo trạng thái"
          disabled={!!loadingAction} // Vô hiệu hóa khi có action đang chạy
        />
        <Button
          onClick={onRefresh} // Gọi hàm refresh khi nhấn
          loading={loading && !loadingAction} // Loading khi đang tải dữ liệu ban đầu
          disabled={!!loadingAction} // Vô hiệu hóa khi có action đang chạy
        >
          {loading && !loadingAction ? "Đang tải..." : "Tải Lại DS"}
        </Button>
      </Space>

      {/* Modal Xem Chi tiết Đơn hàng */}
      <Modal
        title={`Chi Tiết Đơn Hàng #${detailsModalContent.orderId || ""}`}
        open={detailsModalContent.visible}
        onCancel={() =>
          setDetailsModalContent({ visible: false, orderId: null })
        } // Đóng modal
        maskClosable={true}
        footer={null}
        destroyOnClose={true}
        width="80vw"
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        {/* Render component OrderDetails chỉ khi modal hiển thị và có orderId */}
        {detailsModalContent.visible && detailsModalContent.orderId ? (
          <OrderDetails
            orderId={detailsModalContent.orderId}
            handleRefreshParent={onRefresh}
          />
        ) : (
          // Hiển thị Spin nếu chưa có dữ liệu
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        )}
      </Modal>

      {/* --- Modal Xác nhận Thay đổi Trạng thái MỚI --- */}
      <Modal
        title="Xác nhận thay đổi trạng thái?" // Tiêu đề modal
        open={confirmModalState.visible} // Trạng thái hiển thị từ state
        onOk={handleConfirmModalOk} // Hàm xử lý khi nhấn OK
        onCancel={handleConfirmModalCancel} // Hàm xử lý khi nhấn Cancel/Close
        okText="Xác nhận" // Text nút OK
        cancelText="Hủy" // Text nút Cancel
        confirmLoading={confirmModalState.isLoading} // Trạng thái loading của nút OK từ state
        maskClosable={false} // Không cho đóng khi click bên ngoài
        // style={{ zIndex: 1050 }} // Có thể thêm zIndex nếu cần để đảm bảo modal nổi lên trên
      >
        {/* Nội dung bên trong modal, hiển thị thông tin từ state */}
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
          // Nội dung dự phòng nếu state bị lỗi
          <p>Đang tải thông tin xác nhận...</p>
        )}
      </Modal>
      {/* --- Kết thúc Modal Xác nhận MỚI --- */}

      {/* Bảng Hiển thị Danh sách Đơn hàng */}
      <Table
        columns={columns} // Cấu hình cột
        dataSource={displayedOrders} // Dữ liệu hiển thị (đã filter)
        rowKey="key" // Key của mỗi dòng (đã gán là orderId)
        loading={loading || !!loadingAction} // Loading khi tải dữ liệu hoặc có action đang chạy
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          size: "large",
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} trên ${total} mục`,
        }} // Cấu hình phân trang
        scroll={{ x: 1150 }} // Cho phép cuộn ngang nếu nội dung dài
        bordered // Hiển thị đường viền
        size="middle" // Kích thước bảng
        // Xử lý sự kiện click trên mỗi hàng
        onRow={(record) => ({
          onClick: (event) => {
            // Kiểm tra xem có phải click vào nút action trong cột cuối không
            const targetTagName = event.target.tagName.toLowerCase();
            const isActionClick =
              event.target.closest(".ant-table-cell-fix-right") &&
              (targetTagName === "button" ||
                targetTagName === "span" ||
                targetTagName === "svg" ||
                targetTagName === "li" ||
                event.target.closest(".ant-dropdown-menu-item"));

            // Nếu không phải click vào action VÀ không có action nào khác đang chạy -> Mở modal chi tiết
            if (!isActionClick && loadingAction !== record.orderId) {
              setDetailsModalContent({
                visible: true,
                orderId: record.orderId,
              });
            }
            // Các trường hợp khác (click vào action hoặc đang có action chạy) thì không làm gì (đã có xử lý riêng)
          },
          // Đổi con trỏ chuột để biểu thị trạng thái
          style: {
            cursor:
              loadingAction && loadingAction !== record.orderId
                ? "not-allowed"
                : "pointer",
          },
        })}
        // Thêm class CSS khi có action đang chạy (nếu cần style đặc biệt)
        rowClassName={() => (loadingAction ? "table-row-action-loading" : "")}
      />
    </div>
  );
};

export default AdminOrder;