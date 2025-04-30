// AdminBrands.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Space, Table, message, Input, Image } from 'antd'; // Thêm Image nếu muốn hiển thị logo trong bảng
import { PlusCircleFilled, DeleteFilled, ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import AddBrand from './AddBrand';
import EditBrand from './EditBrand';
import apiService from '../../../services/api';
// import { width } from '@fortawesome/free-solid-svg-icons/fa0'; // Import không dùng
// import EditCategory from './EditBrand'; // Import sai, đã có EditBrand ở trên
const { confirm } = Modal; // Lấy confirm trực tiếp từ Modal

// Dữ liệu cứng allBrand (đã cung cấp ở prompt)
const allBrand = [
    { "brandId": 1, "name": "Apple", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_59.png" },
    { "brandId": 2, "name": "Samsung", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_60.png" },
    { "brandId": 3, "name": "Dell", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Dell.png" },
    { "brandId": 4, "name": "HP", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/HP.png" },
    { "brandId": 5, "name": "Lenovo", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Lenovo.png" },
    { "brandId": 6, "name": "Asus", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Asus.png" },
    { "brandId": 7, "name": "MSI", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/MSI.png" },
    { "brandId": 8, "name": "Acer", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/acer.png" },
    { "brandId": 9, "name": "Xiaomi", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_61.png" },
    { "brandId": 10, "name": "Sony", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/b/r/brand-icon-sony_2.png" }
];

const AdminBrands = () => {
    const [refresh, setRefresh] = useState(false);
    const [brands, setBrands] = useState([]);
    const [modalChild, setModalChild] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Nếu dùng API:
                // const response = await apiService.getAllBrands(); // Sửa tên hàm
                // const rawData = response.data || []; // Giả sử API trả về mảng trực tiếp

                // Dùng dữ liệu cứng:
                const rawData = allBrand;

                if (Array.isArray(rawData)) {
                    setBrands(rawData);
                } else {
                    console.error('Dữ liệu không phải mảng:', rawData);
                    setBrands([]);
                }
            } catch (error) {
                console.error('Error fetching brands:', error);
                message.error('Không thể lấy dữ liệu thương hiệu.'); // Sửa text
                setBrands([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refresh]);

    const onRefresh = () => {
        setRefresh((prev) => !prev);
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters && clearFilters();
        confirm(); // Xác nhận để cập nhật trạng thái lọc
        setSearchText('');
        setSearchedColumn(dataIndex); // Reset cột đã tìm kiếm
      };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
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
                        onClick={() => handleReset(clearFilters, confirm, dataIndex)}
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
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    // Sửa hàm xóa
    const deleteBrand = async (brandToDelete) => {
        try {
            // Gọi đúng API deleteBrand với brandId
            await apiService.deleteBrand(brandToDelete.brandId);
            // Cập nhật state bằng cách lọc ra brand đã xóa dựa trên brandId
            const updatedBrands = brands.filter((brand) => brand.brandId !== brandToDelete.brandId);
            setBrands(updatedBrands);
            // Sửa thông báo
            message.success(`Đã xóa thương hiệu: ${brandToDelete.name}`);
        } catch (error) {
            console.error('Lỗi khi xóa thương hiệu:', error);
             // Sửa thông báo lỗi
            const errorMessage = error.response?.data?.message || error.message || `Xóa thương hiệu thất bại: ${brandToDelete.name}`;
            message.error(errorMessage);
        }
    };

    // Sửa hàm xác nhận xóa
    const showDeleteConfirm = (brand) => { // Đổi tên tham số thành brand
        confirm({
            // Sửa title và content
            title: `Xác nhận xóa thương hiệu ${brand.name}!`,
            icon: <ExclamationCircleFilled />,
            content: `Mã thương hiệu: ${brand.brandId}`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                // Gọi hàm deleteBrand đã sửa
                deleteBrand(brand);
            },
            onCancel() {},
        });
    };

    const columns = [
        {
            title: 'Mã',
            dataIndex: 'brandId', // Đúng dataIndex
            key: 'brandId',      // Đúng key
            width: 150,
            align: 'center',
            sorter: (a, b) => a.brandId - b.brandId, // Sắp xếp số
            sortDirections: ['descend', 'ascend'],
            ...getColumnSearchProps('brandId'), // Tìm kiếm theo brandId
        },
        { // Thêm cột Logo (tùy chọn)
            title: 'Logo',
            dataIndex: 'logoUrl',
            key: 'logoUrl',
            align: 'center',
            width: 300,
            render: (logoUrl) => logoUrl ? <Image width={100} src={logoUrl} preview={false} style={{objectFit:'contain'}} /> : null,
        },
        {
            title: 'Tên Thương Hiệu',
            dataIndex: 'name', // Đúng dataIndex
            key: 'name',       // Đúng key
            ellipsis: true,
            sorter: (a, b) => a.name.localeCompare(b.name), // Sắp xếp theo tên
            sortDirections: ['descend', 'ascend'],
            ...getColumnSearchProps('name'), // Tìm kiếm theo tên
        },
        {
            title: 'Hành động',
            key: 'action', // Thêm key cho cột action
            width: 100,
            align: 'center', // Căn giữa nút xóa
            render: (_, record) => (
                <Button
                    // style={{ transform: 'scale(1.5,1.5)', textAlign: 'center' }} // Có thể bỏ scale
                    type="text"
                    size="large"
                    danger
                    icon={<DeleteFilled />}
                    onClick={(e) => {
                        e.stopPropagation(); // Ngăn sự kiện click của hàng
                        // Gọi hàm xác nhận xóa đã sửa
                        showDeleteConfirm(record);
                    }}
                />
            ),
        },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    onClick={() =>
                        setModalChild(<AddBrand setModalChild={setModalChild} handleRefresh={onRefresh} />)
                    }
                    icon={<PlusCircleFilled />} // Di chuyển icon vào trong Button prop
                >
                    {/* Sửa text nút */}
                    Thêm Thương Hiệu
                </Button>
            </Space>

            <Modal
                title={false} // Không cần title nếu modal tự có title
                centered
                open={modalChild !== null}
                onCancel={() => setModalChild(null)}
                maskClosable={false}
                footer={null}
                destroyOnClose={true}
                width="auto" // Hoặc đặt kích thước cố định như 700
            >
                {modalChild}
            </Modal>
            <Table
                bordered // Thêm viền
                onRow={(record, rowIndex) => {
                    return {
                        onClick: () => {
                            // Mở modal EditBrand và truyền brand object
                            setModalChild(
                                <EditBrand brand={record} setModalChild={setModalChild} handleRefresh={onRefresh} />
                            );
                        },
                        onMouseEnter: (event) => {
                            event.currentTarget.style.cursor = 'pointer';
                        },
                        onMouseLeave: (event) => {
                            event.currentTarget.style.cursor = 'default';
                        },
                    };
                }}
                columns={columns}
                dataSource={brands}
                rowKey="brandId" // Sử dụng brandId làm key
                loading = {loading}
                pagination={{
                    pageSizeOptions: ['5', '10', '15'],
                    showSizeChanger: true,
                    defaultPageSize: 5,
                    size: 'default',
                    style: { marginTop: '20px' }, // Đổi thành marginTop
                }}
            />
        </div>
    );
};
export default AdminBrands;