// AdminProduct.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Space, Table, message, Input, Image } from 'antd';
import { PlusCircleFilled, DeleteFilled, ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';
import apiService from '../../../services/api';
const { confirm } = Modal;

// --- Dữ liệu cứng Category ---
const allCategory = [
  { categoryId: 1, name: "Laptop", description: "Portable personal computers" },
  { categoryId: 2, name: "Tablet", description: "Touchscreen mobile devices" },
  { categoryId: 3, name: "Smartphone", description: "Mobile phones" },
  { categoryId: 4, name: "Accessory", description: "Computer accessories" },
  { categoryId: 5, name: "Monitor", description: "Display devices" },
  { categoryId: 6, name: "Printer", description: "Printing machines" },
  { categoryId: 7, name: "Router", description: "Network routers" },
  { categoryId: 8, name: "Speaker", description: "Audio output devices" },
  { categoryId: 9, name: "Camera", description: "Photography and video" },
  { categoryId: 10, name: "Smartwatch", description: "Wearable smart devices" },
  { categoryId: 13, name: "bàn phím", description: "Keyboards" },
  { categoryId: 14, name: "chuột", description: "Mice" },
  { categoryId: 16, name: "tv", description: "Televisions" }
];

// --- Dữ liệu cứng Brand ---
const allBrand = [
  { brandId: 1, name: "Apple", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_59.png" },
  { brandId: 2, name: "Samsung", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_60.png" },
  { brandId: 3, name: "Dell", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Dell.png" },
  { brandId: 4, name: "HP", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/HP.png" },
  { brandId: 5, name: "Lenovo", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Lenovo.png" },
  { brandId: 6, name: "Asus", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Asus.png" },
  { brandId: 7, name: "MSI", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/MSI.png" },
  { brandId: 8, name: "Acer", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/acer.png" },
  { brandId: 9, name: "Xiaomi", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_61.png" },
  { brandId: 10, name: "Sony", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/f/r/frame_87.png" },
  { brandId: 11, name: "Tecno", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_69_1_.png" },
  { brandId: 12, name: "Macbook", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/macbook.png" },
  { brandId: 13, name: "AirPods", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/b/r/brand-icon-airpods.png" },
  { brandId: 14, name: "Bose", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/b/r/brand-icon-bose.png" },
  { brandId: 15, name: "Logitech", logoUrl: "https://cellphones.com.vn/media/icons/brands/brand-248.svg" },
  { brandId: 16, name: "SanDisk", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/a/b/abcde_24_.png" },
  { brandId: 17, name: "LG", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_84_1_.png" },
  { brandId: 18, name: "TCL", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/t/i/tivi-logo-cate.png" }
];

// --- Dữ liệu sản phẩm cứng (Hoàn chỉnh hơn, key không có ngoặc kép) ---
const productDataHardcoded = [
    { productId: 1, productName: "iPhone 16e 128GB | Chính hãng VN/A", description: "iPhone 16e được trang bị chip xử lý Apple A18 mạnh mẽ, mang đến khả năng xử lý mượt mà mọi tác vụ hàng ngày, từ công việc đến giải trí.", specifications: "Chip: A18\nRAM: 8GB\nMàn hình: 6.1 inch OLED", weight: 0.18, price: 16990000, supportRushOrder: true, brandId: 1, categoryId: 3, variants: [ { variantId: 11, color: "Trắng", imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16e-128gb_1__1.png", stockQuantity: 10, discount: 10 }, { variantId: 12, color: "Đen", imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16e-128gb_1_1.png", stockQuantity: 29, discount: 8 } ] },
    { productId: 2, productName: "iPhone 15 Pro Max 512GB | Chính hãng VN/A", description: "Thiết kế khung viền từ titan chuẩn hàng không vũ trụ - Cực nhẹ, bền cùng viền cạnh mỏng cầm nắm thoải mái", specifications: "Chip: A17 Pro\nRAM: 8GB\nDisplay: 6.7 inch Super Retina XDR\nCamera: 48MP Chính", weight: 0.22, price: 40990000, supportRushOrder: true, brandId: 1, categoryId: 3, variants: [ { variantId: 21, color: "Titan Tự Nhiên", imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-512gb-titan-nau.jpg", stockQuantity: 20, discount: 8 }, { variantId: 22, color: "Titan Đen", imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-512gb-titan-den.jpg", stockQuantity: 13, discount: 9 }, { variantId: 23, color: "Titan Xanh", imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-512gb-titan-xanh.jpg", stockQuantity: 30, discount: 10 } ] },
    { productId: 9, productName: "Apple MacBook Air M2 2024 8CPU 8GPU 16GB 256GB", description: "Thiết kế sang trọng, lịch lãm - siêu mỏng 11.3mm, chỉ 1.24kg", specifications: "Chip: M2\nRAM: 16GB\nSSD: 256GB\nMàn hình: 13.6 inch Liquid Retina", weight: 1.24, price: 24990000, supportRushOrder: true, brandId: 12, categoryId: 1, variants: [ { variantId: 91, color: "Bạc", imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_air_m2_2_1_1_7.png", stockQuantity: 42, discount: 12 }, { variantId: 92, color: "Đen", imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_air_m2_1_1_1_8.png", stockQuantity: 26, discount: 10 }, { variantId: 93, color: "Vàng", imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_air_m2_3_1_1_6.png", stockQuantity: 24, discount: 9 } ] },
    // ... (Thêm đầy đủ dữ liệu cho các sản phẩm còn lại)
];
// --- Kết thúc dữ liệu sản phẩm ---


// --- Tạo lookup maps ---
const categoryMap = allCategory.reduce((map, category) => { map[category.categoryId] = category.name; return map; }, {});
const brandMap = allBrand.reduce((map, brand) => { map[brand.brandId] = { name: brand.name, logoUrl: brand.logoUrl }; return map; }, {});
// --- Kết thúc maps ---

const AdminProduct = () => {
    const [refresh, setRefresh] = useState(false);
    const [products, setProducts] = useState([]);
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
                // const response = await apiService.getAllProducts(); // Đảm bảo hàm này tồn tại và đúng
                // const rawData = response.data || []; // Kiểm tra cấu trúc response

                // --- Dùng dữ liệu cứng ---
                const rawData = productDataHardcoded;

                if (Array.isArray(rawData)) {
                    const processedProducts = rawData.map(product => ({
                        ...product, // Giữ lại tất cả các trường gốc (bao gồm specifications, weight, supportRushOrder...)
                        categoryName: categoryMap[product.categoryId] || `ID: ${product.categoryId}`,
                        brandName: brandMap[product.brandId]?.name || `ID: ${product.brandId}`,
                    }));
                    setProducts(processedProducts);
                } else {
                    console.error('Dữ liệu sản phẩm không phải mảng:', rawData);
                    setProducts([]);
                }
            } catch (error) {
                console.error('Error fetching or processing products:', error);
                // message.error('Không thể lấy dữ liệu sản phẩm');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refresh]);

    const onRefresh = () => setRefresh((prev) => !prev);
    const handleSearch = (selectedKeys, confirm, dataIndex) => { /* ... */ };
    const handleReset = (clearFilters, confirm, dataIndex) => { /* ... */ };
    const getColumnSearchProps = (dataIndex) => ({ /* ... Giữ nguyên, nhớ sửa onFilterDropdownVisibleChange ... */
        onFilterDropdownVisibleChange: (visible) => { if (visible) { setTimeout(() => searchInput.current?.select(), 100); } },
     });
    const deleteProduct = async (productToDelete) => { /* ... Giữ nguyên, dùng productId ... */ };
    const getTotalStock = (product) => { /* ... Giữ nguyên ... */ };
    const showDeleteConfirm = (product) => { /* ... Giữ nguyên, dùng productId ... */ };

    const columns = [
        { title: 'Mã SP', dataIndex: 'productId', key: 'productId', width: 80, sorter: (a, b) => a.productId - b.productId, ...getColumnSearchProps('productId'), },
        { title: 'Tên Sản Phẩm', dataIndex: 'productName', key: 'productName', ellipsis: true, sorter: (a, b) => a.productName.localeCompare(b.productName), ...getColumnSearchProps('productName'), },
        { title: 'Danh mục', dataIndex: 'categoryName', key: 'categoryName', width: 150, sorter: (a, b) => (a.categoryName || '').localeCompare(b.categoryName || ''), ...getColumnSearchProps('categoryName'), ellipsis: true, },
        { title: 'Thương hiệu', dataIndex: 'brandName', key: 'brandName', width: 150, sorter: (a, b) => (a.brandName || '').localeCompare(b.brandName || ''), ...getColumnSearchProps('brandName'), ellipsis: true, },
        { title: 'Giá', dataIndex: 'price', key: 'price', width: 150, render: (text) => text ? text.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'N/A', sorter: (a, b) => a.price - b.price, align: 'right', },
        { title: 'Tổng SL', key: 'totalStock', width: 100, render: (_, record) => getTotalStock(record), sorter: (a, b) => getTotalStock(a) - getTotalStock(b), align: 'center', },
        { title: 'Hành động', key: 'action', width: 100, align: 'center', render: (_, record) => ( <Space size="middle"> <Button type="text" size="small" danger icon={<DeleteFilled />} onClick={(e) => { e.stopPropagation(); showDeleteConfirm(record); }} /> </Space> ), },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}> <Button type="primary" onClick={() => setModalChild(<AddProduct setModalChild={setModalChild} handleRefresh={onRefresh} />)} icon={<PlusCircleFilled />}> Thêm sản phẩm </Button> </Space>
            <Modal title={false} centered open={modalChild !== null} onCancel={() => setModalChild(null)} maskClosable={false} footer={null} destroyOnClose={true} width="auto"> {modalChild} </Modal>
            <Table
                onRow={(record) => ({ onClick: () => { setModalChild( <EditProduct product={record} setModalChild={setModalChild} handleRefresh={onRefresh} /> ); }, onMouseEnter: (event) => { event.currentTarget.style.cursor = 'pointer'; }, onMouseLeave: (event) => { event.currentTarget.style.cursor = 'default'; }, })}
                columns={columns} dataSource={products} rowKey="productId" loading={loading}
                pagination={{ pageSizeOptions: ['5', '10', '15'], showSizeChanger: true, defaultPageSize: 5, style: { marginTop: '20px' } }}
                size="small"
            />
        </div>
    );
};
export default AdminProduct;