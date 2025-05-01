import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Space, Table, message, Input, Image, Tag } from 'antd';
import {
    PlusCircleFilled,
    DeleteFilled,
    ExclamationCircleFilled,
    SearchOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
} from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';
import apiService from '../../../services/api'; // Đảm bảo service có đủ hàm API

const AdminProduct = () => {
    const [refresh, setRefresh] = useState(false);
    const [products, setProducts] = useState([]);
    const [modalChild, setModalChild] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [isConfirmDeleteModalVisible, setIsConfirmDeleteModalVisible] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    // *** State để lưu dữ liệu Category và Brand từ API ***
    const [categoriesList, setCategoriesList] = useState([]);
    const [brandsList, setBrandsList] = useState([]);
    // **************************************************

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // *** Gọi đồng thời 3 API ***
                const [productResponse, categoryResponse, brandResponse] = await Promise.all([
                    apiService.getAllProducts(),
                    apiService.getAllCategories(), // Gọi API lấy categories
                    apiService.getAllBrands()      // Gọi API lấy brands
                ]);

                const rawProducts = productResponse.data || [];
                const rawCategories = categoryResponse.data || []; // Dữ liệu categories từ API
                const rawBrands = brandResponse.data || [];       // Dữ liệu brands từ API

                // *** Lưu trữ danh sách categories và brands vào state ***
                if (Array.isArray(rawCategories)) {
                    console.log("Fetched Categories:", rawCategories); // Debug log
                    setCategoriesList(rawCategories);
                } else {
                     console.error('Dữ liệu categories từ API không hợp lệ:', rawCategories);
                     message.error('Không thể tải danh sách danh mục.');
                     setCategoriesList([]);
                }
                if (Array.isArray(rawBrands)) {
                    console.log("Fetched Brands:", rawBrands); // Debug log
                    setBrandsList(rawBrands);
                } else {
                    console.error('Dữ liệu brands từ API không hợp lệ:', rawBrands);
                     message.error('Không thể tải danh sách thương hiệu.');
                    setBrandsList([]);
                }
                // **********************************************************

                // *** Tạo Map từ dữ liệu API (thực hiện sau khi fetch) ***
                const categoryMap = Array.isArray(rawCategories)
                    ? rawCategories.reduce((map, category) => {
                        // Đảm bảo dùng đúng tên thuộc tính từ API Category
                        map[category.categoryId] = category.categoryName || `Cat ${category.categoryId}`;
                        return map;
                      }, {})
                    : {};

                const brandMap = Array.isArray(rawBrands)
                    ? rawBrands.reduce((map, brand) => {
                        // Đảm bảo dùng đúng tên thuộc tính từ API Brand
                        map[brand.brandId] = { name: brand.brandName || `Brand ${brand.brandId}`, logoUrl: brand.logoUrl };
                        return map;
                      }, {})
                    : {};
                // *********************************************************

                // Xử lý dữ liệu sản phẩm
                if (Array.isArray(rawProducts)) {
                    const processedProducts = rawProducts.map(product => {
                        let parsedSpecs = [];
                         if (product.specifications && typeof product.specifications === 'string') {
                             try {
                                 parsedSpecs = JSON.parse(product.specifications);
                                 if (!Array.isArray(parsedSpecs) || !parsedSpecs.every(s => typeof s === 'object' && s !== null)) parsedSpecs = [];
                             } catch (e) { parsedSpecs = []; }
                         } else if (Array.isArray(product.specifications)) {
                              parsedSpecs = product.specifications;
                          }

                        return {
                            ...product,
                            categoryName: categoryMap[product.categoryId] || `ID: ${product.categoryId}`, // Dùng map từ API
                            brandName: brandMap[product.brandId]?.name || `ID: ${product.brandId}`, // Dùng map từ API
                            totalStock: (product.variants || []).reduce((sum, v) => sum + (v.stockQuantity || 0), 0),
                            specifications: parsedSpecs,
                            variants: product.variants || [],
                        };
                    });
                    setProducts(processedProducts);
                } else {
                    console.error('Dữ liệu sản phẩm không phải mảng:', rawProducts);
                    setProducts([]);
                    message.error('Dữ liệu sản phẩm không hợp lệ.');
                }
            } catch (error) {
                console.error('Lỗi khi fetch dữ liệu:', error);
                message.error('Không thể tải dữ liệu. Vui lòng thử lại.');
                setProducts([]);
                setCategoriesList([]); // Reset khi lỗi
                setBrandsList([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refresh]); // Chỉ chạy lại khi refresh

    const onRefresh = () => setRefresh((prev) => !prev);

    // --- Logic Tìm kiếm (Giữ nguyên) ---
     const handleSearch = (selectedKeys, confirm, dataIndex) => { confirm(); setSearchText(selectedKeys[0]); setSearchedColumn(dataIndex); };
     const handleReset = (clearFilters, confirm) => { clearFilters && clearFilters(); setSearchText(''); confirm(); setSearchedColumn(''); };
     const getColumnSearchProps = (dataIndex, title) => ({ filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => ( <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}> <Input ref={searchInput} placeholder={`Tìm ${title}`} value={selectedKeys[0]} onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])} onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)} style={{ marginBottom: 8, display: 'block' }} /> <Space> <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Tìm</Button> <Button onClick={() => clearFilters && handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>Reset</Button> <Button type="link" size="small" onClick={() => close()}>Đóng</Button> </Space> </div> ), filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />, onFilter: (value, record) => record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '', onFilterDropdownOpenChange: (visible) => { if (visible) { setTimeout(() => searchInput.current?.select(), 100); } }, render: (text) => searchedColumn === dataIndex ? ( <Highlighter highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ''} /> ) : ( text ), });


    // --- Logic Xóa và Modal Xác nhận Xóa (Giữ nguyên) ---
    const deleteProduct = async (productToDelete) => { if (!productToDelete || !productToDelete.productId) { message.error('ID sản phẩm không hợp lệ.'); return; } setLoading(true); try { await apiService.deleteProduct(productToDelete.productId); message.success(`Đã xóa: ${productToDelete.productName}`); onRefresh(); } catch (error) { console.error('Lỗi xóa:', error); message.error(error.response?.data?.message || `Xóa thất bại: ${productToDelete.productName}`); setLoading(false); }};
    const showDeleteConfirmModal = (product) => { setProductToDelete(product); setIsConfirmDeleteModalVisible(true); };
    const handleConfirmDelete = async () => { if (productToDelete) { await deleteProduct(productToDelete); } setIsConfirmDeleteModalVisible(false); setProductToDelete(null); };
    const handleCancelDelete = () => { setIsConfirmDeleteModalVisible(false); setProductToDelete(null); };

    // --- Cấu hình các cột cho bảng ---
    const columns = [
        // ... (Các cột Mã SP, Ảnh, Tên SP, Danh mục, Thương hiệu, Giá, Tổng SL, Giao nhanh, Trạng thái giữ nguyên) ...
        { title: 'Mã SP', dataIndex: 'productId', key: 'productId', width: 80, align: 'center', sorter: (a, b) => a.productId - b.productId, ...getColumnSearchProps('productId', 'mã SP'), },
        { title: 'Ảnh', key: 'image', width: 80, align: 'center', render: (_, record) => { const img = record.variants?.[0]?.imageUrl; return img ? <Image width={40} height={40} src={img} style={{ objectFit: 'contain' }} preview={true}/> : 'N/A';}},
        { title: 'Tên Sản Phẩm', dataIndex: 'productName', key: 'productName', ellipsis: true, sorter: (a, b) => a.productName.localeCompare(b.productName), ...getColumnSearchProps('productName', 'tên'), },
        { title: 'Danh mục', dataIndex: 'categoryName', key: 'categoryName', width: 120, sorter: (a, b) => (a.categoryName || '').localeCompare(b.categoryName || ''), ...getColumnSearchProps('categoryName', 'danh mục'), ellipsis: true, },
        { title: 'Thương hiệu', dataIndex: 'brandName', key: 'brandName', width: 120, sorter: (a, b) => (a.brandName || '').localeCompare(b.brandName || ''), ...getColumnSearchProps('brandName', 'thương hiệu'), ellipsis: true, },
        { title: 'Giá', dataIndex: 'price', key: 'price', width: 120, render: (text) => text ? text.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'N/A', sorter: (a, b) => a.price - b.price, align: 'right', },
        { title: 'Tổng SL', dataIndex: 'totalStock', key: 'totalStock', width: 90, sorter: (a, b) => a.totalStock - b.totalStock, align: 'center', },
        { title: 'Giao nhanh', dataIndex: 'supportRushOrder', key: 'supportRushOrder', width: 100, align: 'center', render: (s) => ( s ? <Tag icon={<CheckCircleOutlined />} color="success">Có</Tag> : <Tag icon={<CloseCircleOutlined />} color="default">Không</Tag>), filters: [{ text: 'Có', value: true }, { text: 'Không', value: false },], onFilter: (v, r) => r.supportRushOrder === v,},
        { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', width: 100, align: 'center', render: (a) => ( a ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng KD</Tag>), filters: [{ text: 'Hoạt động', value: true }, { text: 'Ngừng KD', value: false },], onFilter: (v, r) => r.isActive === v,},
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                     <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            // *** Truyền categoriesList và brandsList lấy từ API xuống ***
                            setModalChild(
                                <EditProduct
                                    product={record}
                                    setModalChild={setModalChild}
                                    handleRefresh={onRefresh}
                                    categoriesList={categoriesList} // Truyền state từ API
                                    brandsList={brandsList}       // Truyền state từ API
                                />
                            );
                            // ***********************************************************
                        }}
                        title="Chỉnh sửa"
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteFilled />}
                        onClick={(e) => { e.stopPropagation(); showDeleteConfirmModal(record); }}
                        title="Xóa"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                 {/* *** Truyền categoriesList và brandsList từ API xuống AddProduct *** */}
                 <Button type="primary" onClick={() => setModalChild(<AddProduct setModalChild={setModalChild} handleRefresh={onRefresh} categoriesList={categoriesList} brandsList={brandsList} />)} icon={<PlusCircleFilled />}> Thêm sản phẩm </Button>
            </Space>

            {/* Modal Add/Edit (Giữ nguyên) */}
            <Modal title={false} centered open={modalChild !== null} onCancel={() => setModalChild(null)} maskClosable={false} footer={null} destroyOnClose={true} width="90vw" style={{ top: 20 }} bodyStyle={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }} > {modalChild} </Modal>

            {/* Modal xác nhận xóa (Giữ nguyên) */}
            <Modal title="Xác nhận xóa sản phẩm" open={isConfirmDeleteModalVisible} onOk={handleConfirmDelete} onCancel={handleCancelDelete} okText="Xóa" cancelText="Hủy" okType="danger" confirmLoading={loading} maskClosable={false} centered> {productToDelete && ( <p>Bạn có chắc chắn muốn xóa <strong>{productToDelete.productName}</strong> (Mã: {productToDelete.productId}) không?</p> )} </Modal>

            <Table
                bordered
                // *** KHÔNG CÓ onRow ***
                columns={columns} dataSource={products} rowKey="productId"
                loading={loading && !isConfirmDeleteModalVisible}
                pagination={{ pageSizeOptions: ['5', '10', '15', '20', '50'], showSizeChanger: true, defaultPageSize: 5, size:"large", showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`, style: { marginTop: '24px' } }}
                size="middle" scroll={{ x: 1300 }}
            />
        </div>
    );
};
export default AdminProduct;