// AdminProduct.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Space, Table, message, Input, Image, Tag } from 'antd'; // Thêm Tag
import { PlusCircleFilled, DeleteFilled, ExclamationCircleFilled, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'; // Thêm icon cho supportRushOrder
import Highlighter from 'react-highlight-words';
import AddProduct from './AddProduct'; // Component thêm sản phẩm
import EditProduct from './EditProduct'; // Component sửa sản phẩm
import apiService from '../../../services/api'; // Service gọi API (giả định)
const { confirm } = Modal; // Lấy hàm confirm từ Modal Antd

// --- Dữ liệu cứng Category (Nên fetch từ API) ---
const allCategory = [
    { "categoryId": 1, "name": "Laptop" }, { "categoryId": 2, "name": "Tablet" }, { "categoryId": 3, "name": "Smartphone" },
    { "categoryId": 4, "name": "Accessory" }, { "categoryId": 5, "name": "Monitor" }, { "categoryId": 6, "name": "Printer" },
    { "categoryId": 7, "name": "Router" }, { "categoryId": 8, "name": "Speaker" }, { "categoryId": 9, "name": "Camera" },
    { "categoryId": 10, "name": "Smartwatch" }, { "categoryId": 13, "name": "bàn phím" }, { "categoryId": 14, "name": "chuột" }, { "categoryId": 16, "name": "tv" },
];

// --- Dữ liệu cứng Brand (Nên fetch từ API) ---
const allBrand = [
    { "brandId": 1, "name": "Apple", "logoUrl": "..." }, { "brandId": 2, "name": "Samsung", "logoUrl": "..." },
    { "brandId": 3, "name": "Dell", "logoUrl": "..." }, { "brandId": 4, "name": "HP", "logoUrl": "..." },
    { "brandId": 5, "name": "Lenovo", "logoUrl": "..." }, { "brandId": 6, "name": "Asus", "logoUrl": "..." },
    { "brandId": 7, "name": "MSI", "logoUrl": "..." }, { "brandId": 8, "name": "Acer", "logoUrl": "..." },
    { "brandId": 9, "name": "Xiaomi", "logoUrl": "..." }, { "brandId": 10, "name": "Sony", "logoUrl": "..." },
    { "brandId": 11, "name": "Tecno", "logoUrl": "..." }, { "brandId": 12, "name": "Macbook", "logoUrl": "..." },
    //... các brand khác
];

// --- Dữ liệu sản phẩm cứng (Nên fetch từ API) ---
// Thêm trường `specifications` và `supportRushOrder` vào dữ liệu mẫu
const productDataHardcoded = [
    {
      "productId": 1, "productName": "iPhone 16e 128GB | Chính hãng VN/A", "description": "...", "weight": 1, "price": 16990000,
      "supportRushOrder": true, // Thêm trường này
      "brandId": 1, "categoryId": 3,
      "specifications": [ // Thêm trường này
          { "group": "Màn hình", "title": "Kích thước", "content": "6.1 inch" },
          { "group": "Hiệu năng", "title": "Chip", "content": "Apple A18" }
      ],
      "variants": [ {"color": "Trắng", "imageUrl": "...", "stockQuantity": 10, "discount": 10 }, {"color": "Đen", "imageUrl": "...", "stockQuantity": 29, "discount": 8 } ]
    },
    {
      "productId": 2, "productName": "iPhone 15 Pro Max 512GB | Chính hãng VN/A", "description": "...", "weight": 1, "price": 40990000,
      "supportRushOrder": true,
      "brandId": 1, "categoryId": 3,
      "specifications": [
          { "group": "Thiết kế", "title": "Chất liệu", "content": "Titan chuẩn hàng không" },
          { "group": "Màn hình", "title": "Tần số quét", "content": "120Hz ProMotion" }
      ],
      "variants": [ {"color": "Titan Tự Nhiên", "imageUrl": "...", "stockQuantity": 20, "discount": 8 }, {"color": "Titan Đen", "imageUrl": "...", "stockQuantity": 13, "discount": 9 }, {"color": "Titan Xanh", "imageUrl": "...", "stockQuantity": 30, "discount": 10 } ]
    },
    {
        "productId": 3, "productName": "Samsung Galaxy Z Flip6 12GB 256GB", "description": "...", "weight": 1, "price": 28990000,
        "supportRushOrder": false, // Ví dụ sản phẩm không hỗ trợ
        "brandId": 2, "categoryId": 3,
        "specifications": [], // Có thể rỗng
        "variants": [ {"color": "Đen", "imageUrl": "...", "stockQuantity": 10, "discount": 10 }, {"color": "Xám", "imageUrl": "...", "stockQuantity": 15, "discount": 8 }, {"color": "Vàng", "imageUrl": "...", "stockQuantity": 30, "discount": 12 }, {"color": "Xanh dương", "imageUrl": "...", "stockQuantity": 20, "discount": 13 } ]
    },
    // Thêm các sản phẩm khác với `supportRushOrder` và `specifications`
];

// --- Tạo lookup maps để dễ dàng lấy tên Category và Brand từ ID ---
const categoryMap = allCategory.reduce((map, category) => { map[category.categoryId] = category.name; return map; }, {});
const brandMap = allBrand.reduce((map, brand) => { map[brand.brandId] = { name: brand.name, logoUrl: brand.logoUrl }; return map; }, {});

// Component chính quản lý danh sách sản phẩm
const AdminProduct = () => {
    const [refresh, setRefresh] = useState(false); // State để trigger fetch lại dữ liệu
    const [products, setProducts] = useState([]); // State lưu danh sách sản phẩm đã xử lý
    const [modalChild, setModalChild] = useState(null); // State chứa nội dung của Modal (AddProduct hoặc EditProduct)
    const [loading, setLoading] = useState(false); // State quản lý trạng thái loading của bảng
    const [searchText, setSearchText] = useState(''); // State lưu nội dung tìm kiếm
    const [searchedColumn, setSearchedColumn] = useState(''); // State lưu cột đang được tìm kiếm
    const searchInput = useRef(null); // Ref để truy cập Input tìm kiếm

    // useEffect để fetch dữ liệu sản phẩm khi component mount hoặc khi `refresh` thay đổi
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Bắt đầu loading
            try {
                // --- Gọi API để lấy danh sách sản phẩm ---
                // TODO: Thay thế bằng gọi API thật
                // const response = await apiService.getAllProducts();
                // const rawData = response.data || [];

                // --- Sử dụng dữ liệu cứng ---
                const rawData = productDataHardcoded;

                // Xử lý dữ liệu thô từ API (hoặc dữ liệu cứng)
                if (Array.isArray(rawData)) {
                    const processedProducts = rawData.map(product => ({
                        ...product, // Giữ lại tất cả các trường gốc
                        // Thêm các trường đã xử lý để hiển thị trong bảng
                        categoryName: categoryMap[product.categoryId] || `ID: ${product.categoryId}`, // Lấy tên category từ map
                        brandName: brandMap[product.brandId]?.name || `ID: ${product.brandId}`, // Lấy tên brand từ map
                        // Tính tổng số lượng tồn kho của tất cả biến thể
                        totalStock: (product.variants || []).reduce((sum, v) => sum + (v.stockQuantity || 0), 0),
                        // Giữ lại specifications và supportRushOrder để truyền vào EditProduct
                        specifications: product.specifications || [],
                        supportRushOrder: product.supportRushOrder || false,
                    }));
                    setProducts(processedProducts); // Cập nhật state danh sách sản phẩm
                } else {
                    console.error('Dữ liệu sản phẩm nhận được không phải là mảng:', rawData);
                    setProducts([]); // Đặt thành mảng rỗng nếu dữ liệu không hợp lệ
                    message.error('Dữ liệu sản phẩm không hợp lệ.');
                }
            } catch (error) {
                console.error('Lỗi khi fetch hoặc xử lý sản phẩm:', error);
                // TODO: Bật lại message lỗi khi dùng API thật
                // message.error('Không thể lấy dữ liệu sản phẩm. Vui lòng thử lại.');
                setProducts([]); // Đặt thành mảng rỗng khi có lỗi
            } finally {
                setLoading(false); // Kết thúc loading
            }
        };
        fetchData();
    }, [refresh]); // Chạy lại effect khi `refresh` thay đổi

    // Hàm để trigger fetch lại dữ liệu (được gọi từ Add/Edit component)
    const onRefresh = () => setRefresh((prev) => !prev);

    // --- Cấu hình chức năng tìm kiếm cho cột trong bảng ---
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm(); // Xác nhận bộ lọc
        setSearchText(selectedKeys[0]); // Lưu nội dung tìm kiếm
        setSearchedColumn(dataIndex); // Lưu cột đang tìm kiếm
    };

     const handleReset = (clearFilters, confirm) => {
        clearFilters && clearFilters(); // Xóa bộ lọc
        setSearchText(''); // Reset nội dung tìm kiếm
        confirm({ closeDropdown: false }); // Xác nhận lại (để đóng dropdown nếu cần)
        setSearchedColumn(''); // Reset cột đang tìm kiếm
    };

    // Hàm trả về cấu hình filter cho một cột cụ thể
    const getColumnSearchProps = (dataIndex, title) => ({
        // Nội dung dropdown filter
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
             <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}> {/* Ngăn sự kiện bàn phím lan ra bảng */}
                <Input
                    ref={searchInput} // Gán ref để có thể focus vào input
                    placeholder={`Tìm theo ${title}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])} // Cập nhật giá trị tìm kiếm
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)} // Tìm kiếm khi nhấn Enter
                    style={{ marginBottom: 8, display: 'block' }}
                />
                 <Space> {/* Các nút chức năng */}
                    <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Tìm</Button>
                    <Button onClick={() => clearFilters && handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>Reset</Button>
                    <Button type="link" size="small" onClick={() => close()}>Đóng</Button>
                 </Space>
            </div>
        ),
        // Icon hiển thị trên header cột
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />, // Đổi màu icon nếu đang lọc
        // Logic lọc dữ liệu trên client-side
        onFilter: (value, record) =>
            record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
         // Xử lý khi dropdown filter mở/đóng
         onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100); // Tự động focus và chọn text trong input khi mở
            }
        },
        // Render nội dung ô, highlight text nếu đang tìm kiếm trên cột này
        render: (text) =>
             searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text // Hiển thị text bình thường
            ),
    });
    // --- Kết thúc cấu hình tìm kiếm ---

    // --- Hàm xóa sản phẩm ---
    const deleteProduct = async (productToDelete) => {
        // Kiểm tra thông tin sản phẩm cần xóa
        if (!productToDelete || !productToDelete.productId) {
            message.error('Không tìm thấy ID sản phẩm để xóa.');
            return;
        }
        setLoading(true); // Bắt đầu loading
        try {
            // --- Gọi API để xóa sản phẩm ---
            // TODO: Thay thế bằng gọi API thật
            // await apiService.deleteProduct(productToDelete.productId);

            // --- Xử lý state (khi dùng dữ liệu cứng hoặc sau khi API thành công) ---
            // const updatedProducts = products.filter(
            //     (product) => product.productId !== productToDelete.productId
            // );
            // setProducts(updatedProducts); // Cập nhật lại state
            // message.success(`Đã xóa sản phẩm: ${productToDelete.productName}`);

             // ---- Giả lập thành công ----
             message.success(`(Giả lập) Đã xóa sản phẩm: ${productToDelete.productName}`);
             onRefresh(); // Gọi refresh để fetch lại data (nếu API thật sự xóa) hoặc để mô phỏng việc xóa
             // ---- Kết thúc Giả lập ----

        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                `Xóa sản phẩm "${productToDelete.productName}" thất bại.`;
            message.error(errorMessage);
        } finally {
            setLoading(false); // Kết thúc loading
        }
    };

    // --- Hàm hiển thị modal xác nhận xóa ---
    const showDeleteConfirm = (product) => {
        confirm({
            title: `Bạn có chắc chắn muốn xóa sản phẩm "${product.productName}"?`,
            icon: <ExclamationCircleFilled />,
            content: `Mã sản phẩm: ${product.productId}. Thao tác này không thể hoàn tác!`,
            okText: 'Xóa',
            okType: 'danger', // Màu đỏ cho nút OK
            cancelText: 'Hủy',
            onOk() {
                deleteProduct(product); // Gọi hàm xóa nếu người dùng đồng ý
            },
            onCancel() {
                // console.log('Hủy xóa');
            },
        });
    };

    // --- Cấu hình các cột cho bảng ---
    const columns = [
        { title: 'Mã SP', dataIndex: 'productId', key: 'productId', width: 80, align: 'center', sorter: (a, b) => a.productId - b.productId, ...getColumnSearchProps('productId', 'mã SP'), },
        {
            title: 'Ảnh', key: 'image', width: 80, align: 'center',
            render: (_, record) => {
                // Lấy ảnh của biến thể đầu tiên (hoặc ảnh mặc định nếu không có)
                const firstVariantImage = record.variants?.[0]?.imageUrl;
                return firstVariantImage ? <Image width={40} height={40} src={firstVariantImage} style={{ objectFit: 'contain' }} fallback="/placeholder-image.png" /> : 'N/A';
            }
        },
        { title: 'Tên Sản Phẩm', dataIndex: 'productName', key: 'productName', ellipsis: true, sorter: (a, b) => a.productName.localeCompare(b.productName), ...getColumnSearchProps('productName', 'tên'), },
        { title: 'Danh mục', dataIndex: 'categoryName', key: 'categoryName', width: 120, sorter: (a, b) => (a.categoryName || '').localeCompare(b.categoryName || ''), ...getColumnSearchProps('categoryName', 'danh mục'), ellipsis: true, },
        { title: 'Thương hiệu', dataIndex: 'brandName', key: 'brandName', width: 120, sorter: (a, b) => (a.brandName || '').localeCompare(b.brandName || ''), ...getColumnSearchProps('brandName', 'thương hiệu'), ellipsis: true, },
        { title: 'Giá', dataIndex: 'price', key: 'price', width: 120, render: (text) => text ? text.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'N/A', sorter: (a, b) => a.price - b.price, align: 'right', },
        { title: 'Tổng SL', dataIndex: 'totalStock', key: 'totalStock', width: 90, sorter: (a, b) => a.totalStock - b.totalStock, align: 'center', }, // totalStock đã tính sẵn
        {
            title: 'Giao nhanh', dataIndex: 'supportRushOrder', key: 'supportRushOrder', width: 100, align: 'center',
            render: (support) => ( // Render icon dựa trên giá trị boolean
                support
                    ? <Tag icon={<CheckCircleOutlined />} color="success">Có</Tag>
                    : <Tag icon={<CloseCircleOutlined />} color="default">Không</Tag>
            ),
            // Thêm bộ lọc cho cột này
            filters: [
                { text: 'Có hỗ trợ', value: true },
                { text: 'Không hỗ trợ', value: false },
            ],
            onFilter: (value, record) => record.supportRushOrder === value,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Space size="small"> {/* Giảm khoảng cách giữa các nút */}
                     {/* Nút chỉnh sửa - sẽ mở modal EditProduct */}
                     {/* <Button
                        type="text"
                        icon={<EditFilled style={{ color: '#1890ff' }} />} // Icon sửa (màu xanh)
                        onClick={(e) => {
                            e.stopPropagation(); // Ngăn sự kiện click của hàng
                            setModalChild(<EditProduct product={record} setModalChild={setModalChild} handleRefresh={onRefresh} />);
                        }}
                        title="Chỉnh sửa"
                    /> */}
                    {/* Nút xóa */}
                    <Button
                        type="text"
                        danger // Màu đỏ cho nút xóa
                        icon={<DeleteFilled />}
                        onClick={(e) => {
                            e.stopPropagation(); // Ngăn sự kiện click của hàng
                            showDeleteConfirm(record); // Gọi hàm hiển thị xác nhận xóa
                        }}
                        title="Xóa"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Nút thêm sản phẩm mới */}
            <Space style={{ marginBottom: 16 }}>
                 <Button type="primary" onClick={() => setModalChild(<AddProduct setModalChild={setModalChild} handleRefresh={onRefresh} />)} icon={<PlusCircleFilled />}> Thêm sản phẩm </Button>
            </Space>

            {/* Modal để hiển thị form AddProduct hoặc EditProduct */}
            <Modal
                // title={modalChild?.type === AddProduct ? "Thêm Sản Phẩm Mới" : "Chỉnh Sửa Sản Phẩm"} // Tiêu đề động (hơi phức tạp)
                title={false} // Bỏ tiêu đề mặc định của Modal, dùng tiêu đề trong component con
                centered // Căn giữa modal theo chiều dọc
                open={modalChild !== null} // Hiển thị modal nếu modalChild có nội dung
                onCancel={() => setModalChild(null)} // Đóng modal khi nhấn nút X hoặc click ngoài
                maskClosable={false} // Không cho đóng modal khi click vào vùng overlay
                footer={null} // Bỏ footer mặc định (đã có nút trong form con)
                destroyOnClose={true} // Hủy component con khi đóng modal để reset state
                width="auto" // Chiều rộng tự động theo nội dung con
             >
                 {modalChild} {/* Render nội dung modal (AddProduct hoặc EditProduct) */}
             </Modal>

            {/* Bảng hiển thị danh sách sản phẩm */}
            <Table
                bordered // Hiển thị đường viền cho bảng và các ô
                // Sự kiện khi click vào một hàng -> Mở modal EditProduct
                onRow={(record) => ({
                    onClick: () => { setModalChild( <EditProduct product={record} setModalChild={setModalChild} handleRefresh={onRefresh} /> ); },
                    // Thay đổi con trỏ chuột khi hover vào hàng
                    onMouseEnter: (event) => { event.currentTarget.style.cursor = 'pointer'; },
                    onMouseLeave: (event) => { event.currentTarget.style.cursor = 'default'; },
                 })}
                columns={columns} // Cấu hình các cột
                dataSource={products} // Dữ liệu sản phẩm
                rowKey="productId" // Key duy nhất cho mỗi hàng
                loading={loading} // Hiển thị trạng thái loading
                pagination={{ // Cấu hình phân trang
                    pageSizeOptions: ['5', '10', '15', '20'], // Tùy chọn số lượng item/trang
                    size: 'default', // Kích thước phân trang
                    showSizeChanger: true, // Cho phép thay đổi số lượng item/trang
                    defaultPageSize: 5, // Số lượng item/trang mặc định
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`, // Hiển thị tổng số item
                    style: { marginTop: '24px' } // Thêm khoảng cách trên phân trang
                }}
                size="middle" // Kích thước tổng thể của bảng (padding trong ô)
                scroll={{ x: 1200 }} // Cho phép scroll ngang nếu tổng chiều rộng cột vượt quá 1200px
            />
        </div>
    );
};
export default AdminProduct;