// AdminCategories.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Space, Table, message, Input, Image } from 'antd'; // Thêm Image
import { PlusCircleFilled, DeleteFilled, ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import AddCategory from './AddCategory';
import EditCategory from './EditCategory'; // Import EditCategory để mở modal sửa
import apiService from '../../../services/api';
// import { width } from '@fortawesome/free-solid-svg-icons/fa0'; // Bỏ import không dùng
const { confirm } = Modal; // Lấy confirm trực tiếp

// Dữ liệu cứng (key không có ngoặc kép, đã có imageUrl)
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
  { categoryId: 13, name: "bàn phím", description: "Keyboards", imageUrl: null }, // Ví dụ category không có ảnh
  { categoryId: 14, name: "chuột", description: "Mice", imageUrl: null },
  { categoryId: 16, name: "tv", description: "Televisions", imageUrl: null }
];


const AdminCategories = () => {
    const [refresh, setRefresh] = useState(false);
    const [categories, setCategories] = useState([]);
    const [modalChild, setModalChild] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // --- Gọi API (comment) ---
                // const response = await apiService.getAllCategories();
                // const rawData = response.data || []; // Kiểm tra cấu trúc trả về

                // --- Dùng dữ liệu cứng ---
                const rawData = allCategory;

                if (Array.isArray(rawData)) {
                    setCategories(rawData);
                } else {
                    console.error('Dữ liệu category không phải mảng:', rawData);
                    setCategories([]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                // message.error('Không thể lấy dữ liệu danh mục');
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refresh]);

    const onRefresh = () => setRefresh((prev) => !prev);
    const handleSearch = (selectedKeys, confirm, dataIndex) => { /* ... */ };
    const handleReset = (clearFilters, confirm, dataIndex) => { /* ... */ };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input ref={searchInput} placeholder={`Tìm ${dataIndex}`} value={selectedKeys[0]} onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])} onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)} style={{ marginBottom: 8, display: 'block' }} />
                <Space> <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Tìm</Button> <Button onClick={() => handleReset(clearFilters, confirm, dataIndex)} size="small" style={{ width: 90 }}>Reset</Button> <Button type="link" size="small" onClick={() => close()}>Đóng</Button> </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
        onFilter: (value, record) => record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
        onFilterDropdownVisibleChange: (visible) => { if (visible) { setTimeout(() => searchInput.current?.select(), 100); } },
        render: (text) => searchedColumn === dataIndex ? ( <Highlighter highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ''} /> ) : ( text ),
    });

    // Hàm xóa category
    const deleteCategory = async (categoryToDelete) => {
        try {
            console.log('Deleting Category:', categoryToDelete);
             // --- Gọi API (comment) ---
            // await apiService.deleteCategory(categoryToDelete.categoryId);

            // --- Xử lý state (dữ liệu cứng) ---
            const updatedCategories = categories.filter((cat) => cat.categoryId !== categoryToDelete.categoryId);
            setCategories(updatedCategories);
            message.success(`Đã xóa danh mục: ${categoryToDelete.name}`);
        } catch (error) {
            console.error('Lỗi khi xóa danh mục:', error);
            const errorMessage = error.response?.data?.message || error.message || `Xóa danh mục thất bại: ${categoryToDelete.name}`;
            message.error(errorMessage);
        }
    };

    // Hàm xác nhận xóa
    const showDeleteConfirm = (category) => { // Đổi tên tham số
        confirm({
            title: `Xác nhận xóa danh mục ${category.name}?`, // Sửa title
            icon: <ExclamationCircleFilled />,
            content: `Mã danh mục: ${category.categoryId}`, // Sửa content
            okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
            onOk() { deleteCategory(category); }, // Gọi hàm deleteCategory
            onCancel() {},
        });
    };

    // --- Cập nhật Columns ---
    const columns = [
        {
            title: 'Mã',
            dataIndex: 'categoryId',
            key: 'categoryId',
            width: 80, // Giảm chiều rộng nếu cần
            sorter: (a, b) => a.categoryId - b.categoryId,
            ...getColumnSearchProps('categoryId'),
        },
        // --- Thêm cột Ảnh ---
        {
            title: 'Ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 100, // Đặt chiều rộng phù hợp
            align: 'center', // Căn giữa ảnh
            render: (imageUrl) => imageUrl ? (
                <Image
                    width={60} // Kích thước ảnh trong ô
                    src={imageUrl}
                    style={{ objectFit: 'contain' }} // Đảm bảo ảnh hiển thị đẹp
                    preview={true} // Cho phép xem trước ảnh lớn khi click (tùy chọn)
                />
            ) : (
                <span style={{ color: '#bfbfbf' }}>N/A</span> // Hiển thị nếu không có ảnh
            ),
        },
        // --- Kết thúc thêm cột Ảnh ---
        {
            title: 'Tên Danh mục',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            sorter: (a, b) => a.name.localeCompare(b.name), // Sửa lại logic sort
            ...getColumnSearchProps('name'), // Sửa lại dataIndex cho search
        },
        // Bỏ cột số lượng sản phẩm vì không có trong data gốc
        // {
        //     title: 'Số lượng sản phẩm',
        //     dataIndex: 'totalProducts', // Cần xử lý dữ liệu này
        //     key: 'totalProducts',
        //     sorter: (a, b) => a.totalProducts - b.totalProducts, // Giả sử là số
        //     ellipsis: true,
        // },
        {
            title: 'Hành động',
            key: 'action', // Thêm key
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Space size="middle"> {/* Dùng Space để có khoảng cách nếu thêm nút Sửa */}
                    <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteFilled />}
                        onClick={(e) => {
                            e.stopPropagation(); // Ngăn click vào hàng
                            showDeleteConfirm(record); // Gọi hàm xóa
                        }}
                    />
                    {/* Có thể thêm nút sửa ở đây nếu cần */}
                    {/* <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); setModalChild(<EditCategory category={record} ... />) }}>Sửa</Button> */}
                </Space>
            ),
        },
    ];
    // --- Kết thúc Cập nhật Columns ---

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    onClick={() => setModalChild(<AddCategory setModalChild={setModalChild} handleRefresh={onRefresh} />)}
                    icon={<PlusCircleFilled />}
                >
                    Thêm Danh Mục
                </Button>
            </Space>

            <Modal
                title={false} centered open={modalChild !== null}
                onCancel={() => setModalChild(null)} maskClosable={false}
                footer={null} destroyOnClose={true} width="auto"
            >
                {modalChild}
            </Modal>
            <Table
                onRow={(record) => ({
                    onClick: () => { setModalChild( <EditCategory category={record} setModalChild={setModalChild} handleRefresh={onRefresh} /> ); },
                    onMouseEnter: (event) => { event.currentTarget.style.cursor = 'pointer'; },
                    onMouseLeave: (event) => { event.currentTarget.style.cursor = 'default'; },
                })}
                columns={columns}
                dataSource={categories}
                rowKey="categoryId" // Sử dụng categoryId làm key
                loading = {loading}
                pagination={{ pageSizeOptions: ['5', '10', '15'], showSizeChanger: true, defaultPageSize: 5, style: { marginTop: '20px' } }}
                size="small" // Cho bảng gọn hơn
            />
        </div>
    );
};
export default AdminCategories;