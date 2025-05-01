// AdminProduct.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Space, Table, message, Input, Image, Tag } from 'antd'; // Thêm Tag
import { PlusCircleFilled, DeleteFilled, ExclamationCircleFilled, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'; // Thêm icon cho supportRushOrder
import Highlighter from 'react-highlight-words';
import AddProduct from './AddProduct'; // Component thêm sản phẩm
import EditProduct from './EditProduct'; // Component sửa sản phẩm
import apiService from '../../../services/api'; // Service gọi API (giả định)
const { confirm } = Modal; // Lấy hàm confirm từ Modal Antd

// --- Dữ liệu cứng Category ---
const allCategory = [
    { "categoryId": 1, "name": "Laptop", "description": "Portable personal computers", "image": "https://hanoicomputercdn.com/media/product/89677_laptop_lenovo_ideapad_slim_5_14irh10_83k0000avn_i5_13420h_24gb_ram_512gb_ssd_14_wuxga_win11_xam_0005_layer_2.jpg" },
    { "categoryId": 2, "name": "Tablet", "description": "Touchscreen mobile devices", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtSLFI5VEetrtdyPEDnn55_2OTomtzGFwzSQ&s" },
    { "categoryId": 3, "name": "Smartphone", "description": "Mobile phones", "image": "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-256gb.png" },
    { "categoryId": 4, "name": "Accessory", "description": "Computer accessories", "image": "https://i5.walmartimages.com/seo/Wireless-Charger-Magnetic-Fast-Charging-Stand-Compatible-iPhone-16-15-14-13-12-11-Pro-Max-Plus-XS-XR-X-8-Apple-Watch-9-8-7-6-5-4-3-2-SE-AirPods-3-2-P_66f5dc9c-ca3c-4097-8e8b-39ccfa66b6a0.b5cb13def4077c44bc9e6ffa883a35ee.jpeg?odnHeight=320&odnWidth=320&odnBg=FFFFFF" },
    { "categoryId": 5, "name": "Monitor", "description": "Display devices", "image": "https://www.lg.com/content/dam/channel/wcms/vn/images/man-hinh-may-tinh/24mr400-b_atvq_eavh_vn_c/gallery/small03.jpg" },
    { "categoryId": 6, "name": "Printer", "description": "Printing machines", "image": "https://cdn2.cellphones.com.vn/x/media/catalog/product/t//t_i_xu_ng_52__1_4.png" },
    { "categoryId": 7, "name": "Router", "description": "Network routers", "image": "https://owlgaming.vn/wp-content/uploads/2024/06/Thiet-bi-phat-Wifi-6-Router-ASUS-TUF-Gaming-AX6000-1.jpg" },
    { "categoryId": 8, "name": "Speaker", "description": "Audio output devices", "image": "https://product.hstatic.net/1000187560/product/loa-bluetooth-havit-sk832bt_2__459d04d6a66e4ff38bfa4f528e3cb2d5_large.png" },
    { "categoryId": 9, "name": "Camera", "description": "Photography and video", "image": "https://www.bachkhoashop.com/wp-content/uploads/2022/12/gth788_1.webp" },
    { "categoryId": 10, "name": "Smartwatch", "description": "Wearable smart devices", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx-zhXJ2eJ5OxH7xxs0MnPpu5eNikP79VGbYQG_AEqHw57ezRC8BNLqqokP4n0KhtWCPo&usqp=CAU" }
    ]
    // --- Dữ liệu cứng Brand ---
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
    { "brandId": 10, "name": "Sony", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/f/r/frame_87.png" },
    { "brandId": 11, "name": "Tecno", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_69_1_.png" },
    { "brandId": 12, "name": "Macbook", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/macbook.png" },
    { "brandId": 13, "name": "AirPods", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/b/r/brand-icon-airpods.png" },
    { "brandId": 14, "name": "Bose", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/b/r/brand-icon-bose.png" },
    { "brandId": 15, "name": "Logitech", "logoUrl": "https://cellphones.com.vn/media/icons/brands/brand-248.svg" },
    { "brandId": 16, "name": "SanDisk", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/a/b/abcde_24_.png" },
    { "brandId": 17, "name": "LG", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_84_1_.png" },
    { "brandId": 18, "name": "TCL", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/t/i/tivi-logo-cate.png" }
    ]
    // --- Dữ liệu sản phẩm cứng ---
    const productDataHardcoded = [
    {
    "productId": 1,
    "productName": "iPhone 16e 128GB | Chính hãng VN/A",
    "description": "iPhone 16e được trang bị chip xử lý Apple A18 mạnh mẽ, mang đến khả năng xử lý mượt mà mọi tác vụ hàng ngày, từ công việc đến giải trí.",
    "weight": 1,
    "price": 16990000,
    "supportRushOrder": true,
    "brandId": 1,
    "categoryId": 3,
    "variants": [
    {
    "color": "Trắng",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16e-128gb_1__1.png",
    "stockQuantity": 10,
    "discount": 10
    },
    {
    "color": "Đen",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16e-128gb_1_1.png",
    "stockQuantity": 29,
    "discount": 8
    }
    ]
    },
    {
    "productId": 2,
    "productName": "iPhone 15 Pro Max 512GB | Chính hãng VN/A",
    "description": "Thiết kế khung viền từ titan chuẩn hàng không vũ trụ - Cực nhẹ, bền cùng viền cạnh mỏng cầm nắm thoải mái",
    "weight": 1,
    "price": 40990000,
    "supportRushOrder": true,
    "brandId": 1,
    "categoryId": 3,
    "variants": [
    {
    "color": "Titan Tự Nhiên",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-512gb-titan-nau.jpg",
    "stockQuantity": 20,
    "discount": 8
    },
    {
    "color": "Titan Đen",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-512gb-titan-den.jpg",
    "stockQuantity": 13,
    "discount": 9
    },
    {
    "color": "Titan Xanh",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-512gb-titan-xanh.jpg",
    "stockQuantity": 30,
    "discount": 10
    }
    ]
    },
    {
    "productId": 3,
    "productName": "Samsung Galaxy Z Flip6 12GB 256GB",
    "description": "Chip Snapdragon 8 Gen 3 8 nhân mang đến hiệu năng mạnh mẽ, cho phép bạn xử lý các tác vụ hàng ngày một cách mượt mà.",
    "weight": 1,
    "price": 28990000,
    "supportRushOrder": true,
    "brandId": 2,
    "categoryId": 3,
    "variants": [
    {
    "color": "Đen",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/f/l/fliip-6-den_4__1.png",
    "stockQuantity": 10,
    "discount": 10
    },
    {
    "color": "Xám",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/f/l/flip-den.jpg",
    "stockQuantity": 15,
    "discount": 8
    },
    {
    "color": "Vàng",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/f/l/flip-vang.jpg",
    "stockQuantity": 30,
    "discount": 12
    },
    {
    "color": "Xanh dương",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/f/l/flip-xanh.jpg",
    "stockQuantity": 20,
    "discount": 13
    }
    ]
    },
    {
    "productId": 4,
    "productName": "Samsung Galaxy S25 Ultra 12GB 256GB",
    "description": "Chuẩn IP68 trên Samsung S25 Ultra 5G – Chống nước, chống bụi, thiết kế cao cấp, sang trọng.",
    "weight": 1,
    "price": 39990000,
    "supportRushOrder": true,
    "brandId": 2,
    "categoryId": 3,
    "variants": [
    {
    "color": "Trắng",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_5.png",
    "stockQuantity": 22,
    "discount": 12
    },
    {
    "color": "Xanh dương",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_2__6.png",
    "stockQuantity": 12,
    "discount": 10
    },
    {
    "color": "Đen",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_3__6.png",
    "stockQuantity": 26,
    "discount": 14
    },
    {
    "color": "Xám",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_1__6.png",
    "stockQuantity": 22,
    "discount": 15
    }
    ]
    },
    {
    "productId": 5,
    "productName": "Xiaomi Redmi Note 14 6GB 128GB",
    "description": "Redmi Note 14 5G sở hữu camera AI 108MP kết hợp với zoom trong cảm biến 3x, cho ra những bức ảnh sắc nét, chi tiết dù chụp chủ thể ở xa hay cận cảnh phức tạp.",
    "weight": 1,
    "price": 4990000,
    "supportRushOrder": true,
    "brandId": 9,
    "categoryId": 3,
    "variants": [
    {
    "color": "Xanh lá",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-xiaomi-redmi-note-14_1__2.png",
    "stockQuantity": 34,
    "discount": 12
    },
    {
    "color": "Đen",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-xiaomi-redmi-note-14_1.png",
    "stockQuantity": 26,
    "discount": 10
    },
    {
    "color": "Tím",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-xiaomi-redmi-note-14.1.png",
    "stockQuantity": 30,
    "discount": 15
    }
    ]
    },
    {
    "productId": 6,
    "productName": "Xiaomi 14 12GB 256GB",
    "description": "Mạnh mẽ cân mọi tác vụ, đa nhiệm cực đỉnh - Chip Snapdragon 8 Gen 3 (4nm) mượt mà đi kèm RAM 12GB",
    "weight": 1,
    "price": 22990000,
    "supportRushOrder": true,
    "brandId": 9,
    "categoryId": 3,
    "variants": [
    {
    "color": "Xanh",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/x/i/xiaomi-14-pre-xanh-la_1.png",
    "stockQuantity": 36,
    "discount": 9
    },
    {
    "color": "Trắng",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/x/i/xiaomi-14-pre-trang_1.png",
    "stockQuantity": 32,
    "discount": 10
    },
    {
    "color": "Đen",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/x/i/xiaomi-14-pre-den_1.png",
    "stockQuantity": 25,
    "discount": 9
    }
    ]
    },
    {
    "productId": 7,
    "productName": "TECNO SPARK 30 Pro 8GB 256GB Transformer",
    "description": "Với chip MediaTek Helio G100, Tecno Spark 30 Pro được thiết kế để mang lại hiệu năng vượt trội, đáp ứng mọi nhu cầu sử dụng hàng ngày của bạn.",
    "weight": 1,
    "price": 5290000,
    "supportRushOrder": true,
    "brandId": 11,
    "categoryId": 3,
    "variants": [
    {
    "color": "Đen",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2025-01-10_08-54-30.jpg",
    "stockQuantity": 10,
    "discount": 6
    },
    {
    "color": "Đỏ",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2025-01-10_08-54-33.jpg",
    "stockQuantity": 5,
    "discount": 4
    }
    ]
    },
    {
    "productId": 8,
    "productName": "Tecno Pova 6 8GB 256GB",
    "description": "Màn hình 6.78 inch cho không gian rộng rãi để xem phim, chơi game và đọc sách.",
    "weight": 1,
    "price": 6490000,
    "supportRushOrder": true,
    "brandId": 11,
    "categoryId": 3,
    "variants": [
    {
    "color": "Xám",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2024-07-25_11-39-16.jpg",
    "stockQuantity": 15,
    "discount": 10
    },
    {
    "color": "Xanh lá",
    "imageUrl": "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2024-07-25_11-40-46.jpg",
    "stockQuantity": 15,
    "discount": 12
    }
    ]
    }
    ]

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