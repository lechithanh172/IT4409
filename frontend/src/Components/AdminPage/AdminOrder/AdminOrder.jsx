import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Space, Table, message, Input } from 'antd';
import { SearchOutlined, DeleteFilled, ExclamationCircleFilled } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import OrderDetails from './OrderDetails';
import axios from 'axios'; // Import axios for API requests
import apiService from '../../../api/api.js';

// Helper function to format date
function formatDate(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}\n${day}/${month}/${year}`;
}

const AdminOrder = () => {
    const [refresh, setRefresh] = useState(false);
    const [orders, setOrders] = useState([]);
    const [modalChild, setModalChild] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Lấy token từ localStorage hoặc cookie
                const token = localStorage.getItem('authToken');

                if (!token) {
                    message.error('Bạn cần đăng nhập để truy cập dữ liệu!');
                    return;
                }
                // Gửi yêu cầu API với Authorization header
                const response = await apiService.getAllOrders();
                // Map the order data for table display
                const ordersData = response.data.map((order) => ({
                    maDonHang: order._id,
                    userName: order.userId.userName,
                    ngayDat: formatDate(order.createdAt),
                    items: order.items,
                    paymentMethod: order.paymentMethod,
                    paymentStatus: order.paymentStatus,
                    orderStatus: order.orderStatus,
                    totalAmount: order.totalAmount,
                    order: order,
                }));

                setOrders(ordersData);
            } catch (error) {
                console.error(error);
                message.error('Không thể lấy dữ liệu đơn hàng!');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [refresh]);

    const onRefresh = () => {
        setRefresh((prev) => !prev);
    };

    const deleteOrder = async (record) => {
        try {
            await apiService.deleteOrder(record._id);

            const updatedOrders = orders.filter((order) => order.maDonHang !== record.maDonHang);
            setOrders(updatedOrders);
            message.success(`Đã hủy đơn hàng của: ${record.userName}`);
        } catch (error) {
            console.error(error);
            message.error(`Hủy đơn hàng thất bại: Mã ${record.maDonHang}`);
        }
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

    const columns = [
        {
            title: 'Mã',
            dataIndex: 'maDonHang',
            key: 'ma',
            ellipsis: true,
            sorter: (a, b) => a.maDonHang - b.maDonHang,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Tên người dùng',
            dataIndex: 'userName',
            key: 'userName',
            ellipsis: true,
            ...getColumnSearchProps('userName'),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'ngayDat',
            key: 'ngayDat',
            sorter: (a, b) => a.ngayDat.localeCompare(b.ngayDat),
            sortDirections: ['descend', 'ascend'],
            ...getColumnSearchProps('ngayDat'),
        },
        {
            title: 'Hình thức thanh toán',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            ellipsis: true,
            sorter: (a, b) => a.paymentMethod.localeCompare(b.paymentMethod),
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Tình trạng thanh toán',
            dataIndex: 'paymentStatus',
            key: 'tinhTrang',
            ellipsis: true,
            sorter: (a, b) => a.paymentStatus.localeCompare(b.paymentStatus),
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Trạng thái giao hàng',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            ellipsis: true,
            sorter: (a, b) => a.orderStatus.localeCompare(b.orderStatus),
            sortDirections: ['descend', 'ascend'],
        },
    ];

    return (
        <div>
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
                onRow={(record) => ({
                    onClick: () => {
                        setModalChild(<OrderDetails order={record.order} handleRefresh={onRefresh} />);
                    },
                    onMouseEnter: (event) => {
                        event.currentTarget.style.cursor = 'pointer';
                    },
                    onMouseLeave: (event) => {
                        event.currentTarget.style.cursor = 'default';
                    },
                })}
                columns={columns}
                rowKey="_id"
                loading={loading}
                dataSource={orders}
            />
        </div>
    );
};

export default AdminOrder;
