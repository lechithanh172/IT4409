// AdminProduct.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Space, Table, message, Input, Image } from 'antd';
import { PlusCircleFilled, DeleteFilled, ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';
import apiService from '../../../services/api'; // Đảm bảo import service
const { confirm } = Modal;

// --- Dữ liệu cứng Category ---
const allCategory = [
    { "categoryId": 1, "name": "Laptop", "description": "Portable personal computers", "image": "https://hanoicomputercdn.com/media/product/89677_laptop_lenovo_ideapad_slim_5_14irh10_83k0000avn_i5_13420h_24gb_ram_512gb_ssd_14_wuxga_win11_xam_0005_layer_2.jpg" },
    { "categoryId": 2, "name": "Tablet", "description": "Touchscreen mobile devices", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtSLFI5VEetrtdyPEDnn55_2OTomtzGFwzSQ&s" },
    { "categoryId": 3, "name": "Smartphone", "description": "Mobile phones", "image": "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-256gb.png" },
    { "categoryId": 4, "name": "Accessory", "description": "Computer accessories", "image": "https://i5.walmartimages.com/seo/Wireless-Charger-Magnetic-Fast-Charging-Stand-Compatible-iPhone-16-15-14-13-12-11-Pro-Max-Plus-XS-XR-X-8-Apple-Watch-9-8-7-6-5-4-3-2-SE-AirPods-3-2-P_66f5dc9c-ca3c-4097-8e8b-39ccfa66b6a0.b5cb13def4077c44bc9e6ffa883a35ee.jpeg?odnHeight=320&odnWidth=320&odnBg=FFFFFF" },
    { "categoryId": 5, "name": "Monitor", "description": "Display devices", "image": "https://www.lg.com/content/dam/channel/wcms/vn/images/man-hinh-may-tinh/24mr400-b_atvq_eavh_vn_c/gallery/small03.jpg" },
    { "categoryId": 6, "name": "Printer", "description": "Printing machines", "image": "https://cdn2.cellphones.com.vn/x/media/catalog/product/t/_/t_i_xu_ng_52__1_4.png" },
    { "categoryId": 7, "name": "Router", "description": "Network routers", "image": "https://owlgaming.vn/wp-content/uploads/2024/06/Thiet-bi-phat-Wifi-6-Router-ASUS-TUF-Gaming-AX6000-1.jpg" },
    { "categoryId": 8, "name": "Speaker", "description": "Audio output devices", "image": "https://product.hstatic.net/1000187560/product/loa-bluetooth-havit-sk832bt_2__459d04d6a66e4ff38bfa4f528e3cb2d5_large.png" },
    { "categoryId": 9, "name": "Camera", "description": "Photography and video", "image": "https://www.bachkhoashop.com/wp-content/uploads/2022/12/gth788_1_.webp" },
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
  
// --- Tạo lookup maps ---
const categoryMap = allCategory.reduce((map, category) => { map[category.categoryId] = category.name; return map; }, {});
const brandMap = allBrand.reduce((map, brand) => { map[brand.brandId] = { name: brand.name, logoUrl: brand.logoUrl }; return map; }, {});

// Giả định apiService có hàm deleteProduct như sau:
// apiService = {
//   ...
//   deleteProduct: (productId) => apiInstance.delete("/product/delete", { params: { productId } }),
//   ...
// }

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
                // --- Gọi API ---
                // const response = await apiService.getAllProducts();
                // const rawData = response.data || [];

                // --- Dùng dữ liệu cứng ---
                const rawData = productDataHardcoded;

                if (Array.isArray(rawData)) {
                    const processedProducts = rawData.map(product => ({
                        ...product,
                        categoryName: categoryMap[product.categoryId] || `ID: ${product.categoryId}`,
                        brandName: brandMap[product.brandId]?.name || `ID: ${product.brandId}`,
                        // Tính tổng stock nếu cần hiển thị hoặc sort
                        totalStock: (product.variants || []).reduce((sum, v) => sum + (v.stockQuantity || 0), 0),
                    }));
                    setProducts(processedProducts);
                } else {
                    console.error('Dữ liệu sản phẩm không phải mảng:', rawData);
                    setProducts([]);
                }
            } catch (error) {
                console.error('Error fetching or processing products:', error);
                // message.error('Không thể lấy dữ liệu sản phẩm'); // Tạm ẩn nếu dùng data cứng
                setProducts([]);
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
                <Input
                    ref={searchInput}
                    placeholder={`Tìm theo ${dataIndex === 'productId' ? 'mã' : dataIndex === 'productName' ? 'tên' : dataIndex === 'categoryName' ? 'danh mục' : 'thương hiệu'}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                 <Space>
                    <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Tìm</Button>
                    <Button onClick={() => clearFilters && handleReset(clearFilters, confirm, dataIndex)} size="small" style={{ width: 90 }}>Reset</Button>
                    <Button type="link" size="small" onClick={() => close()}>Đóng</Button>
                 </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
         onFilterDropdownOpenChange: (visible) => { // Sửa tên prop
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

    // --- HÀM XÓA PRODUCT (ĐÃ IMPLEMENT) ---
    const deleteProduct = async (productToDelete) => {
        if (!productToDelete || !productToDelete.productId) {
            message.error('Không tìm thấy ID sản phẩm để xóa.');
            return;
        }
        setLoading(true);
        try {
            // --- Gọi API ---
            // await apiService.deleteProduct(productToDelete.productId);

            // --- Xử lý state (dữ liệu cứng) ---
            const updatedProducts = products.filter(
                (product) => product.productId !== productToDelete.productId
            );
            setProducts(updatedProducts);
            message.success(`(Giả lập) Đã xóa sản phẩm: ${productToDelete.productName}`);
             // Nếu dùng API thật thì bỏ '(Giả lập)'

        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                `Xóa sản phẩm thất bại: ${productToDelete.productName}`;
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // --- HÀM XÁC NHẬN XÓA (ĐÃ IMPLEMENT) ---
    const showDeleteConfirm = (product) => {
        confirm({
            title: `Xác nhận xóa sản phẩm ${product.productName}?`,
            icon: <ExclamationCircleFilled />,
            content: `Mã sản phẩm: ${product.productId}. Thao tác này không thể hoàn tác!`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                deleteProduct(product); // Gọi hàm xóa đã implement
            },
            onCancel() {},
        });
    };

    // Hàm tính tổng số lượng từ state (nếu không tính sẵn trong useEffect)
    const getTotalStock = (product) => {
        return (product.variants || []).reduce((sum, variant) => sum + (variant.stockQuantity || 0), 0);
    };

    const columns = [
        { title: 'Mã SP', dataIndex: 'productId', key: 'productId', width: 100, align: 'center', sorter: (a, b) => a.productId - b.productId, ...getColumnSearchProps('productId'), },
        { title: 'Tên Sản Phẩm', dataIndex: 'productName', key: 'productName', ellipsis: true, sorter: (a, b) => a.productName.localeCompare(b.productName), ...getColumnSearchProps('productName'), },
        { title: 'Danh mục', dataIndex: 'categoryName', key: 'categoryName', width: 150, sorter: (a, b) => (a.categoryName || '').localeCompare(b.categoryName || ''), ...getColumnSearchProps('categoryName'), ellipsis: true, },
        { title: 'Thương hiệu', dataIndex: 'brandName', key: 'brandName', width: 150, sorter: (a, b) => (a.brandName || '').localeCompare(b.brandName || ''), ...getColumnSearchProps('brandName'), ellipsis: true, },
        { title: 'Giá', dataIndex: 'price', key: 'price', width: 130, render: (text) => text ? text.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'N/A', sorter: (a, b) => a.price - b.price, align: 'right', },
        { title: 'Tổng SL', key: 'totalStock', width: 100, render: (_, record) => getTotalStock(record), sorter: (a, b) => getTotalStock(a) - getTotalStock(b), align: 'center', }, // Sử dụng hàm getTotalStock
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        size="large" // Hoặc 'middle'/'small'
                        danger
                        icon={<DeleteFilled />}
                        onClick={(e) => {
                            e.stopPropagation(); // Ngăn click hàng
                            showDeleteConfirm(record); // Gọi hàm xác nhận xóa
                        }}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                 <Button type="primary" onClick={() => setModalChild(<AddProduct setModalChild={setModalChild} handleRefresh={onRefresh} />)} icon={<PlusCircleFilled />}> Thêm sản phẩm </Button>
            </Space>

            <Modal title={false} centered open={modalChild !== null} onCancel={() => setModalChild(null)} maskClosable={false} footer={null} destroyOnClose={true} width="auto">
                 {modalChild}
             </Modal>

            <Table
                bordered // Thêm viền
                onRow={(record) => ({
                    onClick: () => { setModalChild( <EditProduct product={record} setModalChild={setModalChild} handleRefresh={onRefresh} /> ); },
                    onMouseEnter: (event) => { event.currentTarget.style.cursor = 'pointer'; },
                    onMouseLeave: (event) => { event.currentTarget.style.cursor = 'default'; },
                 })}
                columns={columns}
                dataSource={products}
                rowKey="productId"
                loading={loading}
                pagination={{
                    pageSizeOptions: ['5', '10', '15'],
                    size: 'default',
                    showSizeChanger: true,
                    defaultPageSize: 5,
                    style: { marginTop: '24px' } // Tăng khoảng cách
                }}
                size="middle" // Đổi thành middle
            />
        </div>
    );
};
export default AdminProduct;