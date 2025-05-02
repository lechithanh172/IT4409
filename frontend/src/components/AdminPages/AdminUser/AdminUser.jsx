import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button, Modal, Space, Table, message, Input, Tag, Tabs } from 'antd';
import { DeleteFilled, EditOutlined, ExclamationCircleFilled, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import apiService from '../../../services/api'; // Assuming apiService is correctly configured
import EditUser from './EditUser'; // Import the updated EditUser

const { confirm } = Modal;
const { TabPane } = Tabs;

const ROLES = ['ADMIN', 'PRODUCT_MANAGER', 'CUSTOMER'];

const AdminUser = () => {
    const [usersData, setUsersData] = useState({});
    const [loadingStates, setLoadingStates] = useState({});
    const [activeRole, setActiveRole] = useState(ROLES[0]);
    const [modalChild, setModalChild] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const fetchUsers = useCallback(async (roleToFetch, forceRefresh = false) => {
        if (loadingStates[roleToFetch]) {
            return;
        }
        if (forceRefresh || usersData[roleToFetch] === undefined) {
            console.log(`Bắt đầu fetch dữ liệu cho role: ${roleToFetch}. Lý do: ${forceRefresh ? 'Force Refresh' : 'Chưa có dữ liệu'}`);
            setLoadingStates(prev => ({ ...prev, [roleToFetch]: true }));
            try {
                const response = await apiService.getUsersByRole(roleToFetch);
                const fetchedUsers = response.data;

                if (Array.isArray(fetchedUsers)) {
                    setUsersData(prev => ({ ...prev, [roleToFetch]: fetchedUsers }));
                    if (fetchedUsers.length > 0 && forceRefresh) { // Only show success on explicit refresh with data
                         message.success(`Đã tải xong dữ liệu cho ${roleToFetch}.`);
                    } else if (fetchedUsers.length === 0) {
                         console.log(`Không có dữ liệu người dùng nào cho vai trò ${roleToFetch}.`);
                    }
                } else {
                    console.error(`Dữ liệu trả về cho role ${roleToFetch} không phải là mảng:`, fetchedUsers);
                    message.error(`Lỗi định dạng dữ liệu nhận được cho role ${roleToFetch}.`);
                    setUsersData(prev => ({ ...prev, [roleToFetch]: [] }));
                }
            } catch (error) {
                console.error(`Lỗi khi fetch dữ liệu cho role ${roleToFetch}:`, error);
                const errorMessage = error.response?.data?.message || error.message || `Không thể tải dữ liệu cho ${roleToFetch}`;
                message.error(errorMessage);
                setUsersData(prev => ({ ...prev, [roleToFetch]: [] }));
            } finally {
                setLoadingStates(prev => ({ ...prev, [roleToFetch]: false }));
            }
        } else {
            console.log(`Dữ liệu cho ${roleToFetch} đã tồn tại, bỏ qua fetch.`);
        }
    }, [usersData, loadingStates]); // Keep dependencies

    useEffect(() => {
        if (fetchUsers) {
            fetchUsers(activeRole);
        }
    }, [activeRole, fetchUsers]);

    const handleRefresh = useCallback(() => { // Use useCallback here as well if passed down
        console.log(`Yêu cầu làm mới dữ liệu cho role: ${activeRole}`);
        fetchUsers(activeRole, true);
        setSearchText('');
        setSearchedColumn('');
    }, [activeRole, fetchUsers]); // Add fetchUsers dependency

    const onTabChange = (key) => {
        setActiveRole(key);
        setSearchText('');
        setSearchedColumn('');
    };

    // --- Search Functions (Keep as is) ---
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters, confirm) => {
        clearFilters && clearFilters();
        setSearchText('');
        setSearchedColumn('');
        confirm(); // Confirm the reset action
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
                    <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Tìm</Button>
                    <Button onClick={() => clearFilters && handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>Reset</Button>
                    <Button type="link" size="small" onClick={() => close()}>Đóng</Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
        onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) { setTimeout(() => searchInput.current?.select(), 100); }
        },
        render: (text) => searchedColumn === dataIndex ? (<Highlighter highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ''} />) : (text),
    });
    // --- End Search Functions ---

    // --- Hàm Xóa User (Sử dụng API mới) ---
     const deleteUser = async (userToDelete) => {
        const userIdToDelete = userToDelete.userId;
        const usernameToDelete = userToDelete.username;
        if (!userIdToDelete) {
            message.error('Không tìm thấy thông tin định danh (userId) để xóa.');
            return;
        }

        console.log(`Chuẩn bị xóa userId: ${userIdToDelete}`);
        setLoadingStates(prev => ({ ...prev, [activeRole]: true }));
        try {
            // *** Call the deleteUser function expecting only the userId ***
            // *** Assuming apiService.deleteUser handles sending it as a query param ***
            await apiService.deleteUser(userIdToDelete);

            // Update state for the current role
            setUsersData(prev => {
                 const currentRoleUsers = prev[activeRole] || [];
                 const updatedUsers = currentRoleUsers.filter((user) => user.userId !== userIdToDelete);
                 return { ...prev, [activeRole]: updatedUsers };
            });
            message.success(`Đã xóa người dùng: ${usernameToDelete} (ID: ${userIdToDelete}) thành công.`);
        } catch (error) {
            console.error('Lỗi khi xóa user:', error);
            const errorMessage = error.response?.data?.message || error.message || `Xóa người dùng ${usernameToDelete} thất bại`;
            message.error(errorMessage);
        } finally {
             setLoadingStates(prev => ({ ...prev, [activeRole]: false }));
        }
    };

    // Hàm Xác nhận Xóa
    const showDeleteConfirm = (user) => {
        confirm({
            title: `Bạn có chắc muốn xóa người dùng "${user.username}" (ID: ${user.userId})?`,
            icon: <ExclamationCircleFilled />,
            content: 'Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            centered: true,
            onOk() {
                deleteUser(user); // Call deleteUser on confirmation
            },
            onCancel() {
                console.log('Hủy xóa người dùng');
            },
        });
    };

    // --- Hàm Mở Modal Sửa (Giờ sẽ mở modal chỉ để sửa Role) ---
    const handleEditUser = (user) => {
        // Pass handleRefresh down to EditUser so it can trigger a list refresh after role update
        setModalChild( <EditUser userData={user} setModalChild={setModalChild} handleRefresh={handleRefresh} /> );
    };

    // Định nghĩa cột bảng
    const columns = [
        { title: 'STT', key: 'stt', align: 'center', width: '5%', render: (_, record, index) => index + 1, },
        { title: 'Username', dataIndex: 'username', key: 'username', width: '15%', ellipsis: true, ...getColumnSearchProps('username'), },
        { title: 'Email', dataIndex: 'email', key: 'email', width: '20%', ellipsis: true, ...getColumnSearchProps('email'), },
        { title: 'Họ Tên', key: 'fullName', width: '15%', ellipsis: true, render: (_, record) => `${record.firstName || ''} ${record.lastName || ''}`.trim(), sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`), },
        { title: 'SĐT', dataIndex: 'phoneNumber', key: 'phoneNumber', width: '12%', ellipsis: true, ...getColumnSearchProps('phoneNumber'), },
        { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true, ...getColumnSearchProps('address'), },
        { title: 'Role', dataIndex: 'role', key: 'role', width: '10%', align: 'center', render: (role) => { let color = 'default'; if (role === 'ADMIN') color = 'volcano'; else if (role === 'PRODUCT_MANAGER') color = 'geekblue'; else if (role === 'CUSTOMER') color = 'green'; return <Tag color={color}>{role}</Tag>; }, },
        {
            title: 'Hành động',
            key: 'actions',
            align: 'center',
            width: '10%',
            render: (_, record) => (
                <Space size="small">
                    {/* Edit button now opens the simplified Role change modal */}
                    <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEditUser(record); }} title="Thay đổi vai trò" />
                    <Button type="text" danger icon={<DeleteFilled />} onClick={(e) => { e.stopPropagation(); showDeleteConfirm(record); }} title="Xóa người dùng" />
                </Space>
            ),
        },
    ];

    const currentDataSource = usersData[activeRole] || [];
    const currentLoading = loadingStates[activeRole] || false;

    return (
        <div>
            <Tabs activeKey={activeRole} onChange={onTabChange} tabBarExtraContent={
                 <Button icon={<SyncOutlined />} onClick={handleRefresh} loading={currentLoading}> Làm mới </Button>
            }>
                {ROLES.map(role => (
                    <TabPane tab={`${role} (${usersData[role]?.length ?? 0})`} key={role}>
                        <Table
                            columns={columns}
                            loading={currentLoading}
                            dataSource={currentDataSource.map((user) => ({ ...user, key: user.userId }))} // Ensure key is userId
                            pagination={{
                                pageSizeOptions: ['5', '10', '15', '20'],
                                showSizeChanger: true,
                                defaultPageSize: 10,
                                // size: "large", // Optional: consider default size
                                style: { marginTop: '24px' },
                                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
                            }}
                            bordered
                            size="middle"
                            scroll={{ x: 'max-content' }}
                        />
                    </TabPane>
                ))}
            </Tabs>

            <Modal open={modalChild !== null} onCancel={() => setModalChild(null)} footer={null} destroyOnClose={true} width={600} /* Adjusted width maybe */ centered>
                {modalChild}
            </Modal>
        </div>
    );
};

export default AdminUser;