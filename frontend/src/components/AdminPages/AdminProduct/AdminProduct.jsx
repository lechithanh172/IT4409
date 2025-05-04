import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Space, Table, message, Input } from 'antd';
import { PlusCircleFilled, DeleteFilled, ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import AddProduct from './AddProduct';
import ProductDetails from './ProductDetails';
import apiService from '../../../services/api';


const AdminProduct = () => {
    const [refresh, setRefresh] = useState(false);
    const [products, setProducts] = useState([]);
    const [modalChild, setModalChild] = useState(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await apiService.getAllProducts();
                const rawData = response.data.products || [];
                if (Array.isArray(rawData)) {
                    setProducts(rawData); // Cập nhật state sản phẩm
                } else {
                    console.error('Dữ liệu không phải mảng:', rawData);
                    setProducts([]); // Trả về mảng rỗng nếu dữ liệu không hợp lệ
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                message.error('Không thể lấy dữ liệu sản phẩm');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refresh]);
    const onRefresh = () => {
        setRefresh((prev) => !prev);
    };

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters && clearFilters();
                            confirm();
                            setSearchText('');
                            setSearchedColumn(dataIndex);
                        }}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const deleteProduct = async (record) => {
        try {
            console.log('Record:', record);
            await apiService.deleteProduct(record._id);
            const updatedProducts = products.filter((product) => product._id !== record._id);
            setProducts(updatedProducts);
            message.success(`Đã xóa sản phẩm: ${record.name}`);
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            message.error(`Xóa sản phẩm thất bại: ${record.name}`);
        }
    };

    const getSoLuong = (Variants) => {
        if (Array.isArray(Variants.variants)) {
            // Tính tổng số lượng của tất cả các variant
            return Variants.variants.reduce((acc, variant) => acc + variant.quantity, 0);
        }
    };

    const { confirm } = Modal;
    const showDeleteConfirm = (product) => {
        confirm({
            title: `Xác nhận xóa sản phẩm ${product.name}!`,
            icon: <ExclamationCircleFilled />,
            content: `Mã sản phẩm: ${product._id}`,
            onOk() {
                deleteProduct(product);
            },
            onCancel() {},
        });
    };

    const columns = [
        {
            title: 'Mã',
            dataIndex: '_id',
            key: 'MaHangHoa',
            ellipsis: true,
            sorter: (a, b) => a._id.localeCompare(b._id),
            sortDirections: ['descend', 'ascend'],
            ...getColumnSearchProps('_id'),
        },
        {
            title: 'Loại',
            dataIndex: 'category',
            key: 'LoaiHangHoa',
            ellipsis: true,
            sorter: (a, b) => a.category.localeCompare(b.category),
            sortDirections: ['descend', 'ascend'],
            ...getColumnSearchProps('category'),
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'TenHangHoa',
            ellipsis: true,
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortDirections: ['descend', 'ascend'],
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'Gia',
            render: (text) => text.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
            ellipsis: true,
            sorter: (a, b) => a.price - b.price,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Số lượng',
            key: 'soLuong',
            render: (record) => getSoLuong(record),
            ellipsis: true,
            sorter: (a, b) => getSoLuong(b) - getSoLuong(a),
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            sorter: (a, b) => a.rating - b.rating,
            sortDirections: ['descend', 'ascend'],
            ellipsis: true,
        },
        {
            title: 'Action',
            width: 76,
            render: (_, record) => (
                <Button
                    style={{ transform: 'scale(1.5,1.5)' }}
                    type="text"
                    size="small"
                    shape="circle"
                    danger
                    icon={<DeleteFilled />}
                    onClick={(e) => {
                        e.stopPropagation();
                        showDeleteConfirm(record);
                    }}
                />
            ),
        },
    ];
    return (
        <div>
            <Space
                style={{
                    marginBottom: 16,
                }}
            >
                <Button
                    type="primary"
                    onClick={() =>
                        setModalChild(<AddProduct setModalChild={setModalChild} handleRefresh={onRefresh} />)
                    }
                >
                    <PlusCircleFilled />
                    Thêm sản phẩm
                </Button>
            </Space>

            <Modal
                title={false}
                centered
                open={modalChild !== null}
                onCancel={() => setModalChild(null)}
                maskClosable={false}
                footer={null}
                destroyOnClose={true}
                width="auto"
            >
                {modalChild}
            </Modal>
            <Table
                onRow={(record, rowIndex) => {
                    return {
                        onClick: () => {
                            setModalChild(
                                <ProductDetails
                                    products={record}
                                    setModalChild={setModalChild}
                                    handleRefresh={onRefresh}
                                />,
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
                dataSource={products}
                rowKey="_id"
                loading = {loading}
                pagination={{
                    pageSizeOptions: ['5', '10', '15'],
                    showSizeChanger: true,
                    defaultPageSize: 5,
                    style: { marginBottom: '20px' },
                }}
            />
        </div>
    );
};
export default AdminProduct;
