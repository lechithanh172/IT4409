// AdminCategories.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Space, Table, message, Input, Image } from 'antd';
import { PlusCircleFilled, DeleteFilled, ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import AddCategory from './AddCategory';
import EditCategory from './EditCategory';
import apiService from '../../../services/api'; // Đảm bảo import service

const { confirm } = Modal;

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
  { categoryId: 13, name: "bàn phím", description: "Keyboards", imageUrl: null },
  { categoryId: 14, name: "chuột", description: "Mice", imageUrl: null },
  { categoryId: 16, name: "tv", description: "Televisions", imageUrl: null }
];

// Giả định apiService có hàm deleteCategory như sau:
// apiService = {
//   ...
//   deleteCategory: (categoryId) => apiInstance.delete("/category/delete", { params: { categoryId } }),
//   ...
// }

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
                // --- Gọi API ---
                // const response = await apiService.getAllCategories();
                // const rawData = response.data || [];

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
                // message.error('Không thể lấy dữ liệu danh mục'); // Tạm ẩn nếu dùng data cứng
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refresh]);

    const onRefresh = () => setRefresh((prev) => !prev);

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters && clearFilters();
        setSearchText('');
        confirm({ closeDropdown: false });
        setSearchedColumn('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input ref={searchInput} placeholder={`Tìm ${dataIndex === 'categoryId' ? 'mã' : 'tên'}`} value={selectedKeys[0]} onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])} onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)} style={{ marginBottom: 8, display: 'block' }} />
                <Space> <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Tìm</Button> <Button onClick={() => clearFilters && handleReset(clearFilters, confirm, dataIndex)} size="small" style={{ width: 90 }}>Reset</Button> <Button type="link" size="small" onClick={() => close()}>Đóng</Button> </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
        onFilter: (value, record) => record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
        onFilterDropdownOpenChange: (visible) => { if (visible) { setTimeout(() => searchInput.current?.select(), 100); } },
        render: (text) => searchedColumn === dataIndex ? ( <Highlighter highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ''} /> ) : ( text ),
    });

    // --- HÀM XÓA CATEGORY (ĐÃ IMPLEMENT) ---
    const deleteCategory = async (categoryToDelete) => {
        if (!categoryToDelete || !categoryToDelete.categoryId) {
             message.error('Không tìm thấy ID danh mục để xóa.');
             return;
        }
        setLoading(true);
        try {
            // --- Gọi API ---
            // await apiService.deleteCategory(categoryToDelete.categoryId); // BỎ COMMENT KHI KẾT NỐI API THẬT

            // --- Xử lý state (dữ liệu cứng / giả lập) ---
            console.log('Simulating delete for Category ID:', categoryToDelete.categoryId); // Log giả lập
            const updatedCategories = categories.filter((cat) => cat.categoryId !== categoryToDelete.categoryId);
            setCategories(updatedCategories);
            message.success(`(Giả lập) Đã xóa danh mục: ${categoryToDelete.name}`);
             // Nếu dùng API thật thì bỏ '(Giả lập)' và comment dòng console.log trên

        } catch (error) {
            console.error('Lỗi khi xóa danh mục:', error);
            const errorMessage = error.response?.data?.message || error.message || `Xóa danh mục thất bại: ${categoryToDelete.name}`;
            message.error(errorMessage);
        } finally {
             setLoading(false);
        }
    };

    // --- HÀM XÁC NHẬN XÓA (ĐÃ IMPLEMENT) ---
    const showDeleteConfirm = (category) => {
        confirm({
            title: `Xác nhận xóa danh mục ${category.name}?`,
            icon: <ExclamationCircleFilled />,
            content: `Mã danh mục: ${category.categoryId}. Thao tác này không thể hoàn tác!`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                deleteCategory(category); // Gọi hàm xóa đã implement
            },
            onCancel() {},
        });
    };

    const columns = [
        {
            title: 'Mã',
            dataIndex: 'categoryId',
            key: 'categoryId',
            align: 'center',
            width: 80, // Giảm lại chút
            sorter: (a, b) => a.categoryId - b.categoryId,
            ...getColumnSearchProps('categoryId'),
        },
        {
            title: 'Ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 120, // Giảm lại chút
            align: 'center',
            render: (imageUrl) => imageUrl ? (
                <Image
                    width={60}
                    src={imageUrl}
                    style={{ objectFit: 'contain', maxHeight: '40px' }}
                    preview={true}
                />
            ) : (
                <span style={{ color: '#bfbfbf' }}>N/A</span>
            ),
        },
        {
            title: 'Tên Danh mục',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            sorter: (a, b) => a.name.localeCompare(b.name),
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100, // Giảm lại
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        size="large" // Hoặc middle
                        danger
                        icon={<DeleteFilled />}
                        onClick={(e) => {
                            e.stopPropagation();
                            showDeleteConfirm(record); // Gọi hàm xác nhận xóa
                        }}
                    />
                </Space>
            ),
        },
    ];

    return (
        // Bọc div giới hạn chiều rộng
        <div style={{ maxWidth: '900px', margin: '20px auto' }}>
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
                bordered // Thêm viền
                onRow={(record) => ({
                    onClick: () => { setModalChild( <EditCategory category={record} setModalChild={setModalChild} handleRefresh={onRefresh} /> ); },
                    onMouseEnter: (event) => { event.currentTarget.style.cursor = 'pointer'; },
                    onMouseLeave: (event) => { event.currentTarget.style.cursor = 'default'; },
                })}
                columns={columns}
                dataSource={categories}
                rowKey="categoryId"
                loading = {loading}
                pagination={{
                    pageSizeOptions: ['5', '10', '15'],
                    size: 'default',
                    showSizeChanger: true,
                    defaultPageSize: 5,
                    style: { marginTop: '24px' } // Tăng khoảng cách, bỏ margin thừa
                 }}
                size="middle" // Đổi thành middle
            />
        </div>
    );
};
export default AdminCategories;