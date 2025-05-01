// AdminUser.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Space, Table, message, Input, Tag } from 'antd';
import { DeleteFilled, EditOutlined, ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import apiService from '../../../services/api'; // Ensure correct path
import EditUser from './EditUser'; // Ensure correct path

const { confirm } = Modal;

// --- HARDCODED DATA ---
const hardcodedUsers = [
    {
        "userId": 3, // Use this as the key
        "username": "ductran",
        "password": "$2a$10$8AYGeaxV/BN4XCV5YrRXle2NYgLmuTnmF8snLSga/Z93ulTrXw3kG", // Not displayed/used in UI
        "email": "tranduct1k29@gmail.com",
        "firstName": "Rô", // Displayed
        "lastName": "Nan Đô", // Displayed
        "phoneNumber": "0911919191", // Displayed & Editable
        "address": "Cầu Giấy", // Displayed & Editable
        "role": "CUSTOMER", // Displayed as Tag
        "createdAt": "2025-04-27T15:58:25.600897", // Not displayed
        "updatedAt": "2025-04-27T15:58:25.600915", // Not displayed
        "isActive": true, // Not displayed
        "enabled": true, // Not displayed
        "accountNonLocked": true, // Not displayed
        "authorities": [ // Not displayed directly, role is used
            {
                "authority": "ROLE_CUSTOMER"
            }
        ],
        "accountNonExpired": true, // Not displayed
        "credentialsNonExpired": true // Not displayed
    },
    // Add more users here if needed for testing
    {
        "userId": 4,
        "username": "admin_test",
        "password": "some_hash",
        "email": "admin@example.com",
        "firstName": "Admin",
        "lastName": "User",
        "phoneNumber": "0123456789",
        "address": "Main Street 1",
        "role": "ADMIN",
        "createdAt": "2025-04-28T10:00:00.000000",
        "updatedAt": "2025-04-28T10:00:00.000000",
        "isActive": true,
        "enabled": true,
        "accountNonLocked": true,
        "authorities": [{"authority": "ROLE_ADMIN"}],
        "accountNonExpired": true,
        "credentialsNonExpired": true
    }
];
// --------------------

// Giả định apiService exists (Keep this or remove if not using placeholders)
// const apiService = {
//     getAllUsers: async () => ({ data: { users: hardcodedUsers } }), // Mock API call
//     deleteUser: async (userId) => console.log(`Mock delete user with ID: ${userId}`),
//     updateUserInfo: async (data) => console.log('Mock update user:', data),
// };

const AdminUser = () => {
    // Initialize state with the hardcoded data
    const [users, setUsers] = useState(hardcodedUsers);
    const [loading, setLoading] = useState(false); // Keep loading state
    const [modalChild, setModalChild] = useState(null);

    // Comment out useEffect for API fetching
    /*
    useEffect(() => {
        const fetchData = async () => {
            // ... (API fetching logic) ...
        };
        fetchData();
     }, []);
    */
    // Use Effect to show message on initial load (optional)
     useEffect(() => {
        message.info('Đang sử dụng dữ liệu cứng cho Users.');
        // No need to call setUsers here again if initialized directly
     }, []);


    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    // Handle Refresh - Currently just logs, would re-fetch with API
    const handleRefresh = () => {
        console.log("Refresh data triggered (implement fetch logic here)");
        // For hardcoded data, you might reset if you modify it directly, but usually not needed
        // setUsers(hardcodedUsers); // Reset if needed
    };

    // Search functions (Keep as they are, they work on dataIndex)
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters && clearFilters();
        setSearchText('');
        confirm({ closeDropdown: false }); // Keep dropdown open after reset
        setSearchedColumn('');
    };


    const getColumnSearchProps = (dataIndex) => ({
        // ... (search props - no changes needed, uses dataIndex which matches keys)
         filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8, }} onKeyDown={(e) => e.stopPropagation()} >
                <Input
                    ref={searchInput}
                    placeholder={`Tìm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block', }}
                />
                <Space>
                    <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90, }} > Search </Button>
                    <Button onClick={() => clearFilters && handleReset(clearFilters, confirm, dataIndex)} size="small" style={{ width: 90, }} > Reset </Button>
                    <Button type="link" size="small" onClick={() => { close(); }} > close </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (<SearchOutlined style={{ color: filtered ? '#1677ff' : undefined, }} /> ),
        onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0, }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : ( text ),
    });

    // --- HÀM XÓA USER (Updated to use userId) ---
    const deleteUser = async (userToDelete) => {
        // *** Use userId from the hardcoded data ***
        const userIdToDelete = userToDelete.userId;
        const usernameToDelete = userToDelete.username; // Keep for message

        if (!userIdToDelete) { // Check if userId exists
             message.error('Không tìm thấy thông tin định danh (userId) để xóa.');
             return;
        }

        setLoading(true); // Simulate loading
        try {
            // --- Simulate API call (or uncomment actual call) ---
            // await apiService.deleteUser(userIdToDelete); // Use userId for the API

            // --- Update state using userId ---
            const updatedUsers = users.filter((user) => user.userId !== userIdToDelete);
            setUsers(updatedUsers); // Update the local state
            message.success(`(Giả lập) Đã xóa user: ${usernameToDelete} (ID: ${userIdToDelete})`);

        } catch (error) {
            console.error('Lỗi khi xóa user:', error);
            const errorMessage = error.response?.data?.message || error.message || `Xóa user ${usernameToDelete} thất bại`;
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // --- HÀM XÁC NHẬN XÓA (No changes needed, uses user object) ---
    const showDeleteConfirm = (user) => {
        confirm({
            title: `Xác nhận xóa user ${user.username}?`, // Show username is fine
            icon: <ExclamationCircleFilled />,
            content: `UserId: ${user.userId}, Email: ${user.email}. Thao tác này không thể hoàn tác!`, // Show userId for clarity
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                deleteUser(user); // Pass the whole user object
            },
            onCancel() {},
        });
    };

    // --- HÀM MỞ MODAL SỬA (No changes needed) ---
    const handleEditUser = (user) => {
        setModalChild(
            <EditUser
                userData={user}
                setModalChild={setModalChild}
                handleRefresh={handleRefresh}
            />
        )
    };

    // --- ĐỊNH NGHĨA CỘT BẢNG (Verify dataIndex matches hardcoded data keys) ---
    const columns = [
        {
            title: 'STT',
            key: 'stt',
            align: 'center',
            width: '5%',
            render: (_, record, index) => index + 1,
        },
        {
            title: 'Username',
            dataIndex: 'username', // Matches key in hardcoded data
            key: 'username',
            width: '15%',
            ellipsis: true,
            ...getColumnSearchProps('username'),
        },
        {
            title: 'Email',
            dataIndex: 'email', // Matches key in hardcoded data
            key: 'email',
            width: '20%',
            ellipsis: true,
            ...getColumnSearchProps('email'),
        },
        {
            title: 'Họ Tên',
            key: 'fullName',
            width: '15%',
            ellipsis: true,
            // Access firstName and lastName which exist in hardcoded data
            render: (_, record) => `${record.firstName || ''} ${record.lastName || ''}`.trim(),
            sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
        },
        {
            title: 'SĐT',
            dataIndex: 'phoneNumber', // Matches key in hardcoded data
            key: 'phoneNumber',
            width: '12%',
            ellipsis: true,
            ...getColumnSearchProps('phoneNumber'),
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address', // Matches key in hardcoded data
            key: 'address',
            ellipsis: true,
            // width: '20%', // Auto width is fine
            ...getColumnSearchProps('address'),
        },
        {
            title: 'Role',
            dataIndex: 'role', // Matches key in hardcoded data
            key: 'role',
            width: '12%',
            align: 'center',
            filters: [
                { text: 'Admin', value: 'ADMIN' },
                { text: 'Manager', value: 'PRODUCT_MANAGER' }, // Add if needed
                { text: 'Customer', value: 'CUSTOMER' },
            ],
            onFilter: (value, record) => record.role === value,
            render: (role) => { // Logic for Tag based on role string is correct
                let color = 'default';
                if (role === 'ADMIN') color = 'volcano';
                else if (role === 'PRODUCT_MANAGER') color = 'geekblue';
                else if (role === 'CUSTOMER') color = 'green';
                return <Tag color={color}>{role}</Tag>;
            },
        },
        {
            title: 'Hành động',
            key: 'actions',
            align: 'center',
            width: '10%',
            render: (_, record) => ( // Pass the full record (user object)
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={(e) => { e.stopPropagation(); handleEditUser(record); }}
                        title="Sửa thông tin"
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteFilled />}
                        onClick={(e) => { e.stopPropagation(); showDeleteConfirm(record); }}
                        title="Xóa người dùng"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Table
                columns={columns}
                loading={loading}
                // *** IMPORTANT: Use userId as the key ***
                dataSource={users ? users.map((user) => ({ ...user, key: user.userId })) : []}
                pagination={{
                    pageSizeOptions: ['5', '10', '15', '20'],
                    showSizeChanger: true,
                    defaultPageSize: 10,
                    style: { marginTop: '24px' },
                    size: 'large',
                }}
                bordered
                size="middle"
            />

            <Modal
                open={modalChild !== null}
                onCancel={() => setModalChild(null)}
                footer={null}
                destroyOnClose={true}
                width={700}
                centered
            >
                {modalChild}
            </Modal>
        </div>
    );
};
export default AdminUser;