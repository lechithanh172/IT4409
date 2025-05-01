import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button, Modal, Space, Table, message, Input, Tag, Select, Dropdown, Menu, Typography } from 'antd';
// **** Đảm bảo tất cả các icon cần thiết đã được import ****
import { SearchOutlined, ExclamationCircleFilled, EditOutlined, DeleteFilled } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import OrderDetails from './OrderDetails'; // Đảm bảo đường dẫn đúng
import apiService from '../../../services/api'; // Đảm bảo đường dẫn đúng

const { confirm } = Modal; // **** Đảm bảo confirm được import từ Modal ****
const { Text } = Typography;

// --- Dữ liệu cứng (Hardcoded Data) ---
const mockUsers = {
    1: { _id: 1, userName: "john_doe", email: "john@example.com", phoneNumber: "0912345678", address: "123 Main St, Hanoi" },
    2: { _id: 2, userName: "jane_smith", email: "jane@example.com", phoneNumber: "0987654321", address: "456 Another St, Hanoi" },
    3: { _id: 3, userName: "peter_jones", email: "peter@sample.net", phoneNumber: "0900000111", address: "789 Some Rd, Hanoi" },
};

// THÊM variantId vào mỗi variant để tra cứu
const productDataHardcoded = [
    { productId: 1, productName: "iPhone 16e 128GB | Chính hãng VN/A", price: 16990000, variants: [ { variantId: 1, color: "Trắng", imageUrl: "...", stockQuantity: 10, discount: 10 }, { variantId: 2, color: "Đen", imageUrl: "...", stockQuantity: 29, discount: 8 } ] },
    { productId: 2, productName: "iPhone 15 Pro Max 512GB | Chính hãng VN/A", price: 40990000, variants: [ { variantId: 3, color: "Titan Tự Nhiên", imageUrl: "...", stockQuantity: 20, discount: 8 }, { variantId: 4, color: "Titan Đen", imageUrl: "...", stockQuantity: 13, discount: 9 }, { variantId: 5, color: "Titan Xanh", imageUrl: "...", stockQuantity: 30, discount: 10 } ] },
    { productId: 3, productName: "Samsung Galaxy Z Flip6 12GB 256GB", price: 28990000, variants: [ { variantId: 6, color: "Đen", imageUrl: "...", stockQuantity: 10, discount: 10 }, { variantId: 7, color: "Xám", imageUrl: "...", stockQuantity: 15, discount: 8 }, { variantId: 8, color: "Vàng", imageUrl: "...", stockQuantity: 30, discount: 12 }, { variantId: 9, color: "Xanh dương", imageUrl: "...", stockQuantity: 20, discount: 13 } ] },
    { productId: 4, productName: "Samsung Galaxy S25 Ultra 12GB 256GB", price: 39990000, variants: [ { variantId: 10, color: "Trắng", imageUrl: "...", stockQuantity: 22, discount: 12 }, { variantId: 11, color: "Xanh dương", imageUrl: "...", stockQuantity: 12, discount: 10 }, { variantId: 12, color: "Đen", imageUrl: "...", stockQuantity: 26, discount: 14 }, { variantId: 13, color: "Xám", imageUrl: "...", stockQuantity: 22, discount: 15 } ] },
    { productId: 5, productName: "Xiaomi Redmi Note 14 6GB 128GB", price: 4990000, variants: [ { variantId: 14, color: "Xanh lá", imageUrl: "...", stockQuantity: 34, discount: 12 }, { variantId: 15, color: "Đen", imageUrl: "...", stockQuantity: 26, discount: 10 }, { variantId: 16, color: "Tím", imageUrl: "...", stockQuantity: 30, discount: 15 } ] },
    { productId: 6, productName: "Xiaomi 14 12GB 256GB", price: 22990000, variants: [ { variantId: 17, color: "Xanh", imageUrl: "...", stockQuantity: 36, discount: 9 }, { variantId: 18, color: "Trắng", imageUrl: "...", stockQuantity: 32, discount: 10 }, { variantId: 19, color: "Đen", imageUrl: "...", stockQuantity: 25, discount: 9 } ] },
    { productId: 7, productName: "TECNO SPARK 30 Pro 8GB 256GB Transformer", price: 5290000, variants: [ { variantId: 20, color: "Đen", imageUrl: "...", stockQuantity: 10, discount: 6 }, { variantId: 21, color: "Đỏ", imageUrl: "...", stockQuantity: 5, discount: 4 } ] },
    { productId: 8, productName: "Tecno Pova 6 8GB 256GB", price: 6490000, variants: [ { variantId: 22, color: "Xám", imageUrl: "...", stockQuantity: 15, discount: 10 }, { variantId: 23, color: "Xanh lá", imageUrl: "...", stockQuantity: 15, discount: 12 } ] },
];
const OrdersHardcoded = [
    { _id: 101, userId: 1, createdAt: "2024-08-01T10:00:00Z", shippingAddress: "123 Main St, Hanoi, Vietnam", paymentMethod: "CASH", deliveryMethod: "STANDARD", note: "Please leave the package at the door.", orderStatus: "PENDING", paymentStatus: "PENDING", items: [{ productId: 1, variantId: 1, quantity: 2 }, { productId: 3, variantId: 6, quantity: 1 }] },
    { _id: 102, userId: 2, createdAt: "2024-08-01T11:30:00Z", shippingAddress: "456 Another St, Hanoi, Vietnam", paymentMethod: "VNPAY", deliveryMethod: "EXPRESS", note: "Urgent delivery", orderStatus: "PENDING", paymentStatus: "COMPLETED", items: [{ productId: 2, variantId: 3, quantity: 1 }, { productId: 6, variantId: 17, quantity: 3 }] },
    { _id: 103, userId: 3, createdAt: "2024-08-02T09:15:00Z", shippingAddress: "789 Some Rd, Hanoi, Vietnam", paymentMethod: "CASH", deliveryMethod: "STANDARD", note: "Gift wrap needed", orderStatus: "APPROVED", paymentStatus: "PENDING", items: [{ productId: 4, variantId: 10, quantity: 1 }, { productId: 5, variantId: 15, quantity: 2 }] },
    { _id: 104, userId: 1, createdAt: "2024-08-02T14:00:00Z", shippingAddress: "123 Main St, Hanoi, Vietnam", paymentMethod: "VNPAY", deliveryMethod: "STANDARD", note: "", orderStatus: "SHIPPING", paymentStatus: "COMPLETED", items: [{ productId: 8, variantId: 22, quantity: 1 }] },
    { _id: 105, userId: 2, createdAt: "2024-08-03T08:00:00Z", shippingAddress: "456 Another St, Hanoi, Vietnam", paymentMethod: "CASH", deliveryMethod: "EXPRESS", note: "Call before delivery", orderStatus: "DELIVERED", paymentStatus: "COMPLETED", items: [{ productId: 7, variantId: 20, quantity: 2 }] },
];
// --- Hàm trợ giúp (Helper Functions) ---
function formatDate(isoString) {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'Invalid Date'; // Kiểm tra ngày hợp lệ tốt hơn
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
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
const formatCurrency = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A'; // Kiểm tra có phải số hợp lệ không
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// --- Component hiển thị Tag trạng thái ---
const STATUS_DETAILS = {
    PENDING: { label: 'Chờ xử lý', color: 'gold' },
    APPROVED: { label: 'Đã duyệt', color: 'lime' }, // Dùng 'lime' cho trạng thái đã duyệt
    REJECTED: { label: 'Bị từ chối', color: 'error' },
    SHIPPING: { label: 'Đang giao', color: 'processing' }, // Dùng 'processing' cho đang giao
    DELIVERED: { label: 'Đã giao', color: 'success' },
    CANCELLED: { label: 'Đã hủy', color: 'red' }, // Trạng thái hủy (tùy chọn)
};
const OrderStatusTag = ({ status }) => {
    const statusUpper = status?.toUpperCase();
    const details = STATUS_DETAILS[statusUpper] || { label: status || 'N/A', color: 'default' };
    return <Tag color={details.color}>{details.label}</Tag>;
};
const PaymentStatusTag = ({ status }) => {
    let color;
    let text = status || 'N/A';
     switch (status?.toUpperCase()) {
        case 'PENDING': color = 'warning'; text = 'Chờ TT'; break;
        case 'COMPLETED': color = 'success'; text = 'Đã TT'; break;
        case 'FAILED': color = 'error'; text = 'Thất bại'; break;
        default: color = 'default';
    }
    return <Tag color={color}>{text}</Tag>;
};

// --- Định nghĩa các bước chuyển trạng thái hợp lệ (KEY viết hoa để không phân biệt chữ hoa/thường) ---
// Chỉnh sửa dựa trên quy trình nghiệp vụ chính xác của bạn
const VALID_STATUS_TRANSITIONS = {
    PENDING: ['APPROVED', 'REJECTED'],
    APPROVED: ['SHIPPING', 'REJECTED'], // Có thể giao hàng hoặc từ chối sau khi duyệt
    SHIPPING: ['DELIVERED', 'REJECTED'], // Có thể giao thành công hoặc bị từ chối/hủy trong quá trình vận chuyển (ít phổ biến)
    // Trạng thái cuối - thường không thay đổi từ UI
    DELIVERED: [],
    REJECTED: [],
    CANCELLED: [],
};

// --- Component Chính ---
const AdminOrder = () => {
    const [refreshId, setRefreshId] = useState(0); // Dùng để kích hoạt làm mới dữ liệu
    const [allProcessedOrders, setAllProcessedOrders] = useState([]); // Lưu trữ tất cả đơn hàng đã xử lý
    const [displayedOrders, setDisplayedOrders] = useState([]); // Đơn hàng hiển thị hiện tại dựa trên bộ lọc
    const [modalChild, setModalChild] = useState(null); // Nội dung của Modal (chi tiết đơn hàng)
    const [loading, setLoading] = useState(false); // Trạng thái loading khi xử lý dữ liệu ban đầu
    const [statusFilter, setStatusFilter] = useState('all'); // Bộ lọc trạng thái mặc định
    const [loadingAction, setLoadingAction] = useState(null); // Lưu orderId đang được thực hiện hành động (thay đổi trạng thái hoặc xóa)

    const [searchText, setSearchText] = useState(''); // Text tìm kiếm trong cột
    const [searchedColumn, setSearchedColumn] = useState(''); // Cột đang được tìm kiếm
    const searchInput = useRef(null); // Ref cho input tìm kiếm

    // --- Xử lý dữ liệu cứng ---
    const processData = useCallback(() => {
        setLoading(true);
        console.log("Đang xử lý dữ liệu cứng...");
        try {
            // Sao chép sâu để tránh sửa đổi dữ liệu gốc nếu cần dùng lại
            const ordersToProcess = JSON.parse(JSON.stringify(OrdersHardcoded));

            const processedData = ordersToProcess.map(order => {
                let calculatedTotal = 0;
                // Nhúng thông tin chi tiết sản phẩm/biến thể vào từng item
                const populatedItems = order.items.map(item => {
                    const product = productDataHardcoded.find(p => p.productId === item.productId);
                    // Xử lý trường hợp không tìm thấy sản phẩm
                    if (!product) {
                         console.warn(`Không tìm thấy sản phẩm ID: ${item.productId} trong đơn hàng ${order._id}`);
                         return { ...item, productId: { productId: item.productId, productName: 'Sản phẩm không rõ', price: 0, variants: [] }, variantId: { variantId: item.variantId, color: 'Biến thể không rõ', discount: 0 }, calculatedPrice: 0, calculatedTotal: 0 };
                    }

                    // Tìm biến thể dựa trên variantId
                    const variant = product.variants.find(v => v.variantId === item.variantId);
                    // Xử lý trường hợp không tìm thấy biến thể
                     if (!variant) {
                         console.warn(`Không tìm thấy biến thể ID: ${item.variantId} trong sản phẩm ${product.productId}, đơn hàng ${order._id}`);
                         const firstVariant = product.variants[0] || { variantId: item.variantId, color: 'Biến thể mặc định', discount: 0 }; // Dùng biến thể đầu tiên hoặc mặc định
                         const basePrice = product.price;
                         const discount = firstVariant.discount || 0;
                         const currentPrice = basePrice - basePrice * (discount / 100);
                         const lineTotal = currentPrice * item.quantity;
                         calculatedTotal += lineTotal;
                         return { ...item, productId: product, variantId: firstVariant, calculatedPrice: currentPrice, calculatedTotal: lineTotal };
                    }

                    // Tính toán giá và tổng tiền cho item này
                    const basePrice = product.price;
                    const discount = variant.discount || 0;
                    const currentPrice = basePrice - basePrice * (discount / 100);
                    const lineTotal = currentPrice * item.quantity;
                    calculatedTotal += lineTotal; // Cộng dồn vào tổng đơn hàng

                    return {
                        ...item,
                        productId: product, // Nhúng object sản phẩm đầy đủ
                        variantId: variant, // Nhúng object biến thể đầy đủ
                        calculatedPrice: currentPrice, // Lưu giá đã tính
                        calculatedTotal: lineTotal,   // Lưu tổng tiền đã tính
                    };
                });

                // Gán giá trị mặc định nếu thiếu
                const orderStatus = order.orderStatus || 'PENDING';
                const paymentStatus = order.paymentStatus || 'PENDING';
                const paymentMethod = order.paymentMethod || 'N/A';
                const user = mockUsers[order.userId] || { _id: order.userId, userName: 'Người dùng không rõ' }; // Lấy object user hoặc mặc định

                // Tạo cấu trúc dữ liệu cuối cùng cho hàng trong bảng
                const tableRowData = {
                    key: order._id, // Key cho React Table
                    _id: order._id,
                    userName: user.userName,
                    ngayDat: formatDate(order.createdAt),
                    paymentMethod: paymentMethod,
                    paymentStatus: paymentStatus,
                    orderStatus: orderStatus,
                    totalAmount: calculatedTotal, // Gán tổng tiền đã tính
                    // fullOrderData chứa mọi thứ cần thiết cho modal chi tiết
                    fullOrderData: {
                        ...order, // Các trường gốc của đơn hàng
                        items: populatedItems, // Items đã nhúng thông tin chi tiết
                        userId: user,         // User đã nhúng thông tin chi tiết
                        orderStatus: orderStatus, // Đảm bảo trạng thái đúng
                        paymentStatus: paymentStatus,
                        totalAmount: calculatedTotal, // Bao gồm cả tổng tiền
                    },
                };
                return tableRowData;
            });
            setAllProcessedOrders(processedData); // Lưu tất cả dữ liệu đã xử lý
             // Áp dụng bộ lọc ban đầu sau khi xử lý
             if(statusFilter === 'all') {
                setDisplayedOrders(processedData);
            } else {
                 setDisplayedOrders(processedData.filter(o => o.orderStatus?.toLowerCase() === statusFilter.toLowerCase()));
            }
            console.log("Đơn hàng đã xử lý:", processedData);
            // message.success(`Đã tải ${processedData.length} đơn hàng (dữ liệu giả lập).`); // Thông báo có thể hơi ồn

        } catch (error) {
            console.error("Lỗi xử lý dữ liệu cứng:", error);
            message.error("Lỗi xử lý dữ liệu đơn hàng.");
            setAllProcessedOrders([]);
            setDisplayedOrders([]);
        } finally {
            setLoading(false);
        }
    // }, [statusFilter]); // Bỏ dependency statusFilter để tránh xử lý lại khi chỉ lọc
     }, []); // Chỉ xử lý một lần khi component mount hoặc khi refreshId thay đổi


    // Xử lý dữ liệu lần đầu và khi refreshId thay đổi
    useEffect(() => {
        processData();
    }, [processData, refreshId]);

    // Lọc dữ liệu hiển thị khi bộ lọc hoặc dữ liệu gốc thay đổi
    useEffect(() => {
        if (!loading) { // Chỉ lọc khi không đang xử lý dữ liệu
            if (statusFilter === 'all') {
                setDisplayedOrders(allProcessedOrders);
            } else {
                const filtered = allProcessedOrders.filter(order => order.orderStatus?.toLowerCase() === statusFilter.toLowerCase());
                setDisplayedOrders(filtered);
            }
        }
    }, [statusFilter, allProcessedOrders, loading]);

    // --- Hàm làm mới ---
    const onRefresh = useCallback(() => {
        console.log("Đang làm mới dữ liệu...");
        setRefreshId(prev => prev + 1); // Kích hoạt xử lý lại dữ liệu
        message.info("Đã làm mới dữ liệu đơn hàng giả lập.");
    }, []);


    // --- Hàm áp dụng thay đổi trạng thái (Giả lập) ---
    const handleApplyStatus = useCallback(async (orderId, currentStatus, newStatus) => {
        if (!orderId || !newStatus) return; // Kiểm tra đầu vào
        const currentStatusUpper = currentStatus?.toUpperCase();
        const newStatusUpper = newStatus?.toUpperCase();
        const validTransitions = VALID_STATUS_TRANSITIONS[currentStatusUpper] || [];
        // Kiểm tra xem bước chuyển có hợp lệ không
        if (!validTransitions.includes(newStatusUpper)) {
            message.warning(`Không thể chuyển từ trạng thái '${currentStatus}' sang '${newStatus}'.`);
            return;
        }

        setLoadingAction(orderId); // Bắt đầu loading cho hành động này
        try {
             // Gọi API giả lập (đã comment trong apiService)
             await apiService.applyOrderStatus(orderId, newStatus);

            // Cập nhật trạng thái trong state cục bộ (Optimistic Update)
            setAllProcessedOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId
                    // Tạo object mới với trạng thái đã cập nhật
                    ? { ...order, orderStatus: newStatus, fullOrderData: { ...order.fullOrderData, orderStatus: newStatus } }
                    : order // Giữ nguyên các đơn hàng khác
                )
            );
            // Thông báo thành công (giả lập)
            message.success(`(Giả lập) Đơn hàng #${orderId} đã cập nhật trạng thái thành ${STATUS_DETAILS[newStatusUpper]?.label || newStatus}.`);
            // Không cần gọi onRefresh() vì state đã được cập nhật, useEffect lọc sẽ chạy lại

        } catch (error) { // Xử lý lỗi nếu gọi API thật bị lỗi
             console.error(`Lỗi giả lập khi áp dụng trạng thái ${newStatus} cho đơn ${orderId}:`, error);
             message.error(`Cập nhật trạng thái cho đơn hàng #${orderId} thất bại!`);
             // Tùy chọn: Hoàn tác cập nhật lạc quan nếu API thất bại
             // onRefresh(); // Hoặc làm mới lại toàn bộ danh sách
        } finally {
            setLoadingAction(null); // Kết thúc loading cho hành động này
        }
    }, []); // Không cần dependency onRefresh ở đây


    // --- Modal xác nhận thay đổi trạng thái ---
    const showStatusChangeConfirm = useCallback((record, newStatus) => {
        const currentStatusUpper = record.orderStatus?.toUpperCase();
        const newStatusUpper = newStatus?.toUpperCase();
        const currentLabel = STATUS_DETAILS[currentStatusUpper]?.label || record.orderStatus;
        const newLabel = STATUS_DETAILS[newStatusUpper]?.label || newStatus;
       confirm({
           title: `Xác nhận thay đổi trạng thái?`,
           icon: <ExclamationCircleFilled />,
           content: `Bạn có chắc muốn đổi trạng thái đơn hàng #${record._id} từ "${currentLabel}" thành "${newLabel}"?`,
           okText: 'Xác nhận',
           cancelText: 'Hủy',
           // Khi nhấn OK, gọi hàm xử lý thay đổi trạng thái
           onOk() { handleApplyStatus(record._id, record.orderStatus, newStatus.toLowerCase()); }, // API thường cần lowercase
           onCancel() {},
       });
    }, [handleApplyStatus]); // Phụ thuộc vào hàm handleApplyStatus

    // --- Logic xóa đơn hàng ---
     const handleDeleteOrder = useCallback(async (orderId) => {
        if (!orderId) return;
        setLoadingAction(orderId); // Bắt đầu loading cho hành động xóa
        try {
            await apiService.deleteOrder(orderId); // Gọi API giả lập xóa

            // Xóa đơn hàng khỏi state cục bộ
            setAllProcessedOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
            message.success(`(Giả lập) Đã xóa đơn hàng #${orderId}.`);
            // useEffect lọc sẽ tự động cập nhật displayedOrders

        } catch (error) {
            console.error(`Lỗi giả lập khi xóa đơn hàng ${orderId}:`, error);
            message.error(error?.data?.message || `Xóa đơn hàng #${orderId} thất bại!`);
        } finally {
            setLoadingAction(null); // Kết thúc loading
        }
    }, []); // Không cần dependency

    // --- Modal xác nhận xóa ---
    const showDeleteConfirm = useCallback((record) => {
        confirm({ // Dùng hàm confirm đã import
            title: `Xác nhận xóa đơn hàng #${record._id}?`,
            icon: <ExclamationCircleFilled />,
            content: `Hành động này sẽ xóa vĩnh viễn đơn hàng của ${record.userName}. Bạn chắc chắn muốn xóa?`,
            okText: 'Xóa',
            okType: 'danger', // Nút màu đỏ nguy hiểm
            cancelText: 'Hủy',
            onOk: () => { // Dùng hàm mũi tên ở đây
                handleDeleteOrder(record._id); // Gọi hàm xử lý xóa
            },
            onCancel() {
                console.log('Hủy xóa');
            },
        });
    }, [handleDeleteOrder]); // Phụ thuộc vào hàm handleDeleteOrder

    // --- Logic tìm kiếm (Search) ---
    const handleSearch = (selectedKeys, confirm, dataIndex) => { /* ... Giữ nguyên ... */ };
    const handleReset = (clearFilters, confirm) => { /* ... Giữ nguyên ... */ };
    const getColumnSearchProps = (dataIndex) => ({ /* ... Giữ nguyên ... */ });


     // --- Tùy chọn bộ lọc trạng thái (Status Filter Options) ---
    const statusOptions = [
        { value: 'all', label: 'Tất cả trạng thái' },
        { value: 'pending', label: 'Chờ xử lý' },
        { value: 'approved', label: 'Đã duyệt' },
        { value: 'rejected', label: 'Bị từ chối' },
        { value: 'shipping', label: 'Đang giao' },
        { value: 'delivered', label: 'Đã giao' },
        // { value: 'cancelled', label: 'Đã hủy' }, // Thêm nếu có
    ];

    // --- Định nghĩa các cột cho bảng (Table Columns Definition) ---
    const columns = [
        // Đảm bảo dataIndex khớp với key trong object dữ liệu đã xử lý
        { title: 'Mã ĐH', dataIndex: '_id', key: '_id', width: 80, ellipsis: true, fixed: 'left', ...getColumnSearchProps('_id') },
        { title: 'Người dùng', dataIndex: 'userName', key: 'userName', width: 150, ellipsis: true, ...getColumnSearchProps('userName') },
        { title: 'Ngày đặt', dataIndex: 'ngayDat', key: 'ngayDat', width: 160, sorter: (a, b) => new Date(a.fullOrderData.createdAt).getTime() - new Date(b.fullOrderData.createdAt).getTime() },
        { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', width: 140, align: 'right', render: formatCurrency, sorter: (a, b) => a.totalAmount - b.totalAmount },
        {
            title: 'Thanh toán', dataIndex: 'paymentMethod', key: 'paymentMethod', width: 100,
            filters: [ // Thêm bộ lọc cho cột này
                { text: 'Tiền mặt (CASH)', value: 'CASH' },
                { text: 'VNPAY', value: 'VNPAY' },
                // { text: 'Thẻ (CREDIT_CARD)', value: 'CREDIT_CARD' },
            ],
            onFilter: (value, record) => record.paymentMethod?.toUpperCase() === value.toUpperCase(),
         },
        { title: 'TT Thanh toán', dataIndex: 'paymentStatus', key: 'paymentStatus', width: 110, render: (status) => <PaymentStatusTag status={status} /> },
        { title: 'Trạng thái ĐH', dataIndex: 'orderStatus', key: 'orderStatus', width: 120, render: (status) => <OrderStatusTag status={status} /> },
        {
            title: 'Hành động', key: 'actions', width: 100, align: 'center', fixed: 'right',
            render: (_, record) => {
                const currentStatusUpper = record.orderStatus?.toUpperCase();
                const possibleNextStatuses = VALID_STATUS_TRANSITIONS[currentStatusUpper] || [];
                // Tạo các item cho menu dropdown
                const menuItems = possibleNextStatuses.map(status => ({
                    key: status,
                    label: `"${STATUS_DETAILS[status]?.label || status}"`, // Lấy nhãn tiếng Việt
                    danger: ['REJECTED', 'CANCELLED'].includes(status), // Đánh dấu nguy hiểm cho các hành động từ chối/hủy
                    onClick: (e) => {
                        e.domEvent.stopPropagation(); // Ngăn sự kiện click vào hàng khi click menu item
                        showStatusChangeConfirm(record, status.toLowerCase()); // Gọi xác nhận thay đổi trạng thái
                    }
                }));
                // Kiểm tra xem có nên hiển thị nút xóa không (chỉ khi trạng thái là DELIVERED)
                const showDeleteButton = currentStatusUpper === 'DELIVERED';

                return (
                    <Space size="small">
                        {/* Dropdown thay đổi trạng thái (chỉ hiện khi có bước tiếp theo) */}
                        {possibleNextStatuses.length > 0 && (
                            <Dropdown
                                menu={{ items: menuItems }}
                                trigger={['click']}
                                disabled={loadingAction === record._id} // Vô hiệu hóa khi đang thực hiện hành động khác trên dòng này
                            >
                                <Button
                                    icon={<EditOutlined />}
                                    size="small"
                                    onClick={(e) => e.stopPropagation()} // Ngăn click vào hàng
                                    loading={loadingAction === record._id && !showDeleteButton} // Hiển thị loading nếu đang đổi TT (và không phải đang xóa)
                                    aria-label={`Đổi trạng thái đơn ${record._id}`}
                                />
                            </Dropdown>
                        )}
                        {/* Nút Xóa (chỉ hiện khi trạng thái là DELIVERED) */}
                        {showDeleteButton && (
                             <Button
                                icon={<DeleteFilled />}
                                size="small"
                                danger // Màu đỏ
                                onClick={(e) => {
                                    e.stopPropagation(); // Ngăn click vào hàng
                                    // **** GỌI HÀM XÁC NHẬN XÓA ****
                                    showDeleteConfirm(record);
                                }}
                                loading={loadingAction === record._id} // Hiển thị loading nếu đang xóa dòng này
                                aria-label={`Xóa đơn ${record._id}`}
                            />
                        )}
                        {/* Placeholder nếu không có hành động nào */}
                        {possibleNextStatuses.length === 0 && !showDeleteButton && ( <Text type="secondary">-</Text> )}
                    </Space>
                );
            },
        },
    ];

    // --- Render Giao diện ---
    return (
        <div>
            {/* Khu vực bộ lọc và nút làm mới */}
            <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                 <Select
                    value={statusFilter} // Giá trị hiện tại của bộ lọc
                    style={{ width: 200 }}
                    onChange={(value) => setStatusFilter(value)} // Cập nhật state khi chọn bộ lọc
                    options={statusOptions} // Các tùy chọn trạng thái
                    aria-label="Lọc đơn hàng theo trạng thái"
                />
                 <Button onClick={onRefresh} loading={loading && !loadingAction}> {/* Nút làm mới */}
                     Tải Lại DS
                 </Button>
            </Space>

            {/* Modal hiển thị chi tiết đơn hàng */}
            <Modal
                title="Chi Tiết Đơn Hàng"
                open={modalChild !== null} // Hiện modal khi modalChild có nội dung
                onCancel={() => setModalChild(null)} // Đóng modal khi nhấn nút X hoặc click ngoài
                maskClosable={true} // Cho phép đóng khi click ngoài
                footer={null} // Footer sẽ do component con quản lý (nếu cần)
                destroyOnClose={true} // Hủy component con khi đóng modal
                width="80vw" // Chiều rộng modal
                style={{ top: 20 }} // Cách lề trên
                bodyStyle={{ maxHeight: '85vh', overflowY: 'auto' }} // Cho phép cuộn nội dung modal nếu quá dài
            >
                {modalChild}
            </Modal>

            {/* Bảng hiển thị danh sách đơn hàng */}
            <Table
                columns={columns} // Các cột đã định nghĩa
                dataSource={displayedOrders} // Dữ liệu hiển thị (đã lọc)
                rowKey="key" // Key duy nhất cho mỗi hàng
                loading={loading || !!loadingAction} // Hiển thị loading khi tải dữ liệu hoặc thực hiện hành động
                pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'], size: 'large', showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` }} // Cấu hình phân trang
                scroll={{ x: 1150 }} // Cho phép cuộn ngang nếu bảng quá rộng
                bordered // Hiển thị viền bảng
                size="middle" // Kích thước bảng
                onRow={(record) => ({ // Sự kiện khi click vào một hàng
                    onClick: () => {
                        // Chỉ mở modal chi tiết nếu không có hành động nào đang diễn ra trên hàng đó
                        if (loadingAction !== record._id) {
                            // Truyền dữ liệu đơn hàng đầy đủ đã xử lý vào component OrderDetails
                            setModalChild(<OrderDetails order={record.fullOrderData} handleRefresh={onRefresh} />);
                        }
                    },
                    style: { cursor: loadingAction === record._id ? 'not-allowed' : 'pointer' } // Đổi con trỏ chuột
                })}
            />
        </div>
    );
};

export default AdminOrder;