// AdminCategories.jsx
import React, { useEffect, useRef, useState } from 'react';
// --- Import các component từ Ant Design ---
import { Button, Modal, Space, Table, message, Input, Image } from 'antd';
// --- Import các icon ---
import { PlusCircleFilled, DeleteFilled, ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons';
// --- Import các component/module khác ---
import Highlighter from 'react-highlight-words'; // Component để highlight text tìm kiếm
import AddCategory from './AddCategory';      // Component để thêm danh mục
import EditCategory from './EditCategory';    // Component để sửa danh mục
import apiService from '../../../services/api'; // Đảm bảo import service

// Destructure confirm từ Modal để dùng trực tiếp
const { confirm } = Modal;

// --- Dữ liệu cứng (Hardcoded Data) ---
// Dữ liệu mẫu dùng khi chưa kết nối API
const allCategory = [
  { categoryId: 1, name: "Laptop", description: "Portable personal computers", imageUrl: "https://hanoicomputercdn.com/media/product/89677_laptop_lenovo_ideapad_slim_5_14irh10_83k0000avn_i5_13420h_24gb_ram_512gb_ssd_14_wuxga_win11_xam_0005_layer_2.jpg" },
  { categoryId: 2, name: "Tablet", description: "Touchscreen mobile devices", imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtSLFI5VEetrtdyPEDnn55_2OTomtzGFwzSQ&s" },
  { categoryId: 3, name: "Smartphone", description: "Mobile phones", imageUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-256gb.png" },
  { categoryId: 4, name: "Accessory", description: "Computer accessories", imageUrl: "https://i5.walmartimages.com/seo/Wireless-Charger-Magnetic-Fast-Charging-Stand-Compatible-iPhone-16-15-14-13-12-11-Pro-Max-Plus-XS-XR-X-8-Apple-Watch-9-8-7-6-5-4-3-2-SE-AirPods-3-2-P_66f5dc9c-ca3c-4097-8e8b-39ccfa66b6a0.b5cb13def4077c44bc9e6ffa883a35ee.jpeg?odnHeight=320&odnWidth=320&odnBg=FFFFFF" },
  { categoryId: 5, name: "Monitor", description: "Display devices", imageUrl: "https://www.lg.com/content/dam/channel/wcms/vn/images/man-hinh-may-tinh/24mr400-b_atvq_eavh_vn_c/gallery/small03.jpg" },
  { categoryId: 6, name: "Printer", description: "Printing machines", imageUrl: "https://cdn2.cellphones.com.vn/x/media/catalog/product/t/_/t_i_xu_ng_52__1_4.png" },
  { categoryId: 7, name: "Router", description: "Network routers", imageUrl: "https://owlgaming.vn/wp-content/uploads/2024/06/Thiet-bi-phat-Wifi-6-Router-ASUS-TUF-Gaming-AX6000-1.jpg" },
  { categoryId: 8, name: "Speaker", description: "Audio output devices", imageUrl: "https://product.hstatic.net/1000187560/product/loa-bluetooth-havit-sk832bt_2__459d04d6a66e4ff38bfa4f528e3cb2d5_large.png" },
  { categoryId: 9, name: "Camera", description: "Photography and video", imageUrl: "https://www.bachkhoashop.com/wp-content/uploads/2022/12/gth788_1_.webp" },
  { categoryId: 10, name: "Smartwatch", description: "Wearable smart devices", imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx-zhXJ2eJ5OxH7xxs0MnPpu5eNikP79VGbYQG_AEqHw57ezRC8BNLqqokP4n0KhtWCPo&usqp=CAU" },
  { categoryId: 13, name: "bàn phím", description: "Keyboards", imageUrl: null },
  { categoryId: 14, name: "chuột", description: "Mice", imageUrl: null },
  { categoryId: 16, name: "tv", description: "Televisions", imageUrl: null }
];

// --- API Giả định (Commented out) ---
// apiService = {
//   ...
//   deleteCategory: (categoryId) => apiInstance.delete("/category/delete", { params: { categoryId } }),
//   getAllCategories: () => apiInstance.get("/categories"),
//   ...
// }

// --- Component Chính ---
const AdminCategories = () => {
    // --- State Hooks ---
    const [refresh, setRefresh] = useState(false);            // State trigger làm mới
    const [categories, setCategories] = useState([]);         // State lưu danh sách danh mục
    const [modalChild, setModalChild] = useState(null);       // State chứa component con cho Modal (Add/Edit)
    const [loading, setLoading] = useState(false);            // State loading bảng
    const [searchText, setSearchText] = useState('');         // State text tìm kiếm
    const [searchedColumn, setSearchedColumn] = useState(''); // State cột đang tìm kiếm
    const searchInput = useRef(null);                         // Ref input tìm kiếm

    // --- useEffect để tải dữ liệu ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Bắt đầu loading
            try {
                // --- Phần gọi API thật (Đang comment) ---
                // const response = await apiService.getAllCategories();
                // const rawData = response.data || [];

                // --- Sử dụng dữ liệu cứng ---
                const rawData = allCategory;

                // Kiểm tra dữ liệu có phải mảng không
                if (Array.isArray(rawData)) {
                    setCategories(rawData); // Cập nhật state
                } else {
                    console.error('Dữ liệu category không phải mảng:', rawData);
                    setCategories([]); // Set mảng rỗng nếu lỗi
                }
            } catch (error) { // Xử lý lỗi API
                console.error('Lỗi khi tải danh mục:', error);
                // message.error('Không thể lấy dữ liệu danh mục'); // Tạm ẩn nếu dùng data cứng
                setCategories([]);
            } finally {
                setLoading(false); // Kết thúc loading
            }
        };
        fetchData(); // Gọi hàm tải dữ liệu
    }, [refresh]); // Chạy lại khi `refresh` thay đổi

    // --- Hàm làm mới dữ liệu ---
    const onRefresh = () => setRefresh((prev) => !prev);

    // --- Logic Tìm kiếm trong cột ---
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm(); // Xác nhận filter
        setSearchText(selectedKeys[0]); // Lưu text
        setSearchedColumn(dataIndex); // Lưu cột
    };
    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters && clearFilters(); // Xóa filter của Ant Table
        setSearchText('');             // Reset text
        confirm({ closeDropdown: false }); // Xác nhận, giữ dropdown mở
        setSearchedColumn('');         // Reset cột
    };
    // Hàm cấu hình tìm kiếm cho cột
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => ( // Giao diện dropdown filter
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input ref={searchInput} placeholder={`Tìm ${dataIndex === 'categoryId' ? 'mã' : 'tên'}`} value={selectedKeys[0]} onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])} onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)} style={{ marginBottom: 8, display: 'block' }} />
                <Space> <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Tìm</Button> <Button onClick={() => clearFilters && handleReset(clearFilters, confirm, dataIndex)} size="small" style={{ width: 90 }}>Reset</Button> <Button type="link" size="small" onClick={() => close()}>Đóng</Button> </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />, // Icon trên header cột
        onFilter: (value, record) => record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '', // Hàm lọc client-side
        onFilterDropdownOpenChange: (visible) => { if (visible) { setTimeout(() => searchInput.current?.select(), 100); } }, // Focus input khi mở
        render: (text) => searchedColumn === dataIndex ? ( <Highlighter highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ''} /> ) : ( text ), // Highlight text tìm kiếm
    });

    // --- HÀM XÓA CATEGORY (Giả lập) ---
    const deleteCategory = async (categoryToDelete) => {
        if (!categoryToDelete || !categoryToDelete.categoryId) { message.error('Không tìm thấy ID danh mục để xóa.'); return; } // Kiểm tra ID
        setLoading(true); // Bật loading
        try {
            // --- Gọi API thật (Đang comment) ---
            // await apiService.deleteCategory(categoryToDelete.categoryId);

            // --- Xử lý state cục bộ (Giả lập) ---
            console.log('Giả lập xóa Category ID:', categoryToDelete.categoryId);
            const updatedCategories = categories.filter((cat) => cat.categoryId !== categoryToDelete.categoryId); // Lọc bỏ item đã xóa
            setCategories(updatedCategories); // Cập nhật state
            message.success(`(Giả lập) Đã xóa danh mục: ${categoryToDelete.name}`); // Thông báo thành công (giả lập)

        } catch (error) { // Xử lý lỗi API
            console.error('Lỗi khi xóa danh mục:', error);
            const errorMessage = error.response?.data?.message || error.message || `Xóa danh mục thất bại: ${categoryToDelete.name}`;
            message.error(errorMessage);
        } finally { setLoading(false); } // Tắt loading
    };

    // --- HÀM XÁC NHẬN XÓA ---
    const showDeleteConfirm = (category) => {
        confirm({
            title: `Xác nhận xóa danh mục ${category.name}?`, // Tiêu đề
            icon: <ExclamationCircleFilled />, // Icon
            content: `Mã danh mục: ${category.categoryId}. Thao tác này không thể hoàn tác!`, // Nội dung
            okText: 'Xóa', okType: 'danger', cancelText: 'Hủy', // Text và kiểu nút
            onOk() { deleteCategory(category); }, // Gọi hàm xóa khi nhấn OK
            onCancel() {}, // Hàm khi nhấn Cancel
        });
    };

    // --- Định nghĩa Cột cho Bảng ---
    const columns = [
        {
            title: 'Mã', dataIndex: 'categoryId', key: 'categoryId', align: 'center', width: 100,
            sorter: (a, b) => a.categoryId - b.categoryId, // Sắp xếp theo Mã
            ...getColumnSearchProps('categoryId'), // Tìm kiếm theo Mã
        },
        {
            title: 'Ảnh', dataIndex: 'imageUrl', key: 'imageUrl', width: 120, align: 'center', // Giảm chiều rộng cột ảnh
            render: (imageUrl, record) => imageUrl ? ( // Render ảnh
                <Image width={80} height={80} src={imageUrl} alt={record.name} style={{ objectFit: 'contain' }} preview={false} /> // Cho phép xem trước
            ) : ( // Hiển thị N/A nếu không có ảnh
                <span style={{ color: '#bfbfbf' }}>N/A</span>
            ),
        },
        {
            title: 'Tên Danh mục', dataIndex: 'name', key: 'name', ellipsis: true, // Thêm ellipsis
            sorter: (a, b) => a.name.localeCompare(b.name), // Sắp xếp theo Tên
            ...getColumnSearchProps('name'), // Tìm kiếm theo Tên
        },
        { // Thêm cột Mô tả
            title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true,
        },
        {
            title: 'Hành động', key: 'action', width: 120, align: 'center', fixed: 'right', // Cố định cột Hành động
            render: (_, record) => ( // Render nút Xóa và Sửa (nếu có)
                <Space size="middle">
                     {/* Nút Sửa (chưa có logic mở modal sửa trong code gốc này) */}
                     {/* <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); setModalChild(<EditCategory category={record} setModalChild={setModalChild} handleRefresh={onRefresh} />); }} /> */}
                     {/* Nút Xóa */}
                    <Button type="text" size="large" danger icon={<DeleteFilled />}
                        onClick={(e) => {
                            e.stopPropagation(); // Ngăn click vào hàng
                            showDeleteConfirm(record); // Hiển thị xác nhận xóa
                        }}
                        aria-label={`Xóa danh mục ${record.name}`} // Thêm aria-label
                    />
                </Space>
            ),
        },
    ];

    // --- Render JSX ---
    return (
        // Bọc div giới hạn chiều rộng (tùy chọn)
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Nút Thêm Danh Mục */}
            <Space style={{ marginBottom: 16 }}>
                <Button type="primary"
                    onClick={() => setModalChild(<AddCategory setModalChild={setModalChild} handleRefresh={onRefresh} />)} // Mở modal AddCategory
                    icon={<PlusCircleFilled />} // Icon nút
                >
                    Thêm Danh Mục
                </Button>
            </Space>

            {/* Modal dùng chung */}
            <Modal
                title={false} // Tạm ẩn title chung, component con sẽ có title riêng
                centered // Căn giữa modal
                open={modalChild !== null} // Hiển thị khi modalChild có nội dung
                onCancel={() => setModalChild(null)} // Đóng modal
                maskClosable={false} // Không cho đóng khi click ra ngoài
                footer={null} // Footer trong component con
                destroyOnClose={true} // Hủy state con khi đóng
                width="auto" // Tự động điều chỉnh chiều rộng hoặc set cố định (vd: 600)
            >
                {modalChild} {/* Render component AddCategory hoặc EditCategory */}
            </Modal>

            {/* Bảng hiển thị */}
            <Table
                bordered // Thêm viền
                // Sự kiện khi click vào một hàng -> mở modal EditCategory
                onRow={(record) => ({
                    onClick: () => { setModalChild( <EditCategory category={record} setModalChild={setModalChild} handleRefresh={onRefresh} /> ); },
                    onMouseEnter: (event) => { event.currentTarget.style.cursor = 'pointer'; }, // Đổi con trỏ khi hover
                    onMouseLeave: (event) => { event.currentTarget.style.cursor = 'default'; },
                })}
                columns={columns} // Các cột
                dataSource={categories} // Dữ liệu
                rowKey="categoryId" // Key của mỗi hàng
                loading={loading} // Trạng thái loading
                pagination={{ // Cấu hình phân trang
                    pageSizeOptions: ['5', '10', '15'], // Tùy chọn số item/trang
                    showSizeChanger: true, // Hiển thị dropdown chọn kích thước trang
                    defaultPageSize: 5, // Kích thước trang mặc định
                    style: { marginTop: '24px' } // Khoảng cách trên
                 }}
                size="middle" // Kích thước bảng
                scroll={{ x: 800 }} // Thêm cuộn ngang nếu cần
            />
        </div>
    );
};
export default AdminCategories;