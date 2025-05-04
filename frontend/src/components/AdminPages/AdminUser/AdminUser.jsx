import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Button, Modal, Space, Table, message, Input } from 'antd';
import { DeleteFilled, ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import apiService from '../../../services/api';

const AdminUser = () => {
    const [users, setUsers] = useState(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken'); // Lấy token từ localStorage

                if (!token) {
                    message.error('Bạn cần phải đăng nhập!');
                    return; // Nếu không có token, dừng lại và không gọi API
                }

                const response = await apiService.getAllUsers();
                const usersData = response.data.users;
                setUsers(usersData);
            } catch (error) {
                console.error(error);
                message.error('Không thể lấy dữ liệu người dùng');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    const deleteUser = async (record) => {
        try {
            await apiService.deleteUser(record._id);

            const updatedUsers = users.filter((user) => user._id !== record._id);
            setUsers(updatedUsers);

            message.success(`Đã xóa user: ${record._id}`);
        } catch (error) {
            console.error(error);
            message.error(`Xóa user thất bại: ${record._id}`);
        }
    };

    const { confirm } = Modal;
    const showDeleteConfirm = (user) => {
        confirm({
            title: `Xác nhận xóa user ${user._id}!`,
            icon: <ExclamationCircleFilled />,
            content: `User name: ${user.userName}`,
            onOk() {
                deleteUser(user);
            },
            onCancel() {},
        });
    };
    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            render: (text) => text,
            width: '5%', // Chỉnh độ rộng của cột STT
        },
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            ellipsis: true,
            sorter: (a, b) => a._id - b._id,
            sortDirections: ['descend', 'ascend'],
            width: '15%', // Chỉnh độ rộng của cột ID
            ...getColumnSearchProps('_id'),
        },
        {
            title: 'User name',
            dataIndex: 'userName',
            key: 'userName',
            ellipsis: true,
            width: '20%', // Chỉnh độ rộng của cột User name
            ...getColumnSearchProps('userName'),
        },
        {
            title: 'Phone number',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            ellipsis: true,
            width: '20%', // Chỉnh độ rộng của cột Phone number
            ...getColumnSearchProps('phoneNumber'),
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'diaChi',
            key: 'diaChi',
            ellipsis: true,
            width: '30%', // Chỉnh độ rộng của cột Địa chỉ
            ...getColumnSearchProps('diaChi'),
        },
        {
            title: 'Actions', // Cột này để chứa các hành động
            key: 'actions',
            width: '10%', // Chỉnh độ rộng của cột Actions
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
            <Table
                columns={columns}
                loading={loading}
                dataSource={users ? users.map((user, index) => ({ ...user, key: user._id, stt: index + 1 })) : []}
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
export default AdminUser;
