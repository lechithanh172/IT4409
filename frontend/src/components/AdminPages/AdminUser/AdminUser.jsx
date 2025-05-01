import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button, Modal, Space, Table, message, Input, Tag, Tabs } from 'antd';
import { DeleteFilled, EditOutlined, ExclamationCircleFilled, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import apiService from '../../../services/api';
import EditUser from './EditUser';

const { confirm } = Modal;
const { TabPane } = Tabs;

const ROLES = ['ADMIN', 'PRODUCT_MANAGER', 'CUSTOMER'];

const AdminUser = () => {
    // --- State được khởi tạo là object rỗng ---
    const [usersData, setUsersData] = useState({});
    const [loadingStates, setLoadingStates] = useState({});
    const [activeRole, setActiveRole] = useState(ROLES[0]); // Mặc định chọn role đầu tiên

    const [modalChild, setModalChild] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    // --- HÀM LẤY DỮ LIỆU USER THEO ROLE (Đã cập nhật logic) ---
    const fetchUsers = useCallback(async (roleToFetch, forceRefresh = false) => {
        // 1. Kiểm tra nếu đang loading role này thì bỏ qua
        if (loadingStates[roleToFetch]) {
            console.log(`Đang loading ${roleToFetch}, bỏ qua fetch.`);
            return;
        }

        // 2. Kiểm tra điều kiện fetch: Bắt buộc refresh HOẶC dữ liệu chưa tồn tại (undefined)
        if (forceRefresh || usersData[roleToFetch] === undefined) {
            console.log(`Bắt đầu fetch dữ liệu cho role: ${roleToFetch}. Lý do: ${forceRefresh ? 'Force Refresh' : 'Chưa có dữ liệu'}`);
            setLoadingStates(prev => ({ ...prev, [roleToFetch]: true }));
            try {
                const response = await apiService.getUsersByRole(roleToFetch);
                const fetchedUsers = response.data;

                if (Array.isArray(fetchedUsers)) {
                    // Gán dữ liệu (kể cả mảng rỗng) vào state
                    setUsersData(prev => ({ ...prev, [roleToFetch]: fetchedUsers }));
                    if (fetchedUsers.length > 0) {
                        message.success(`Đã tải xong dữ liệu cho ${roleToFetch}.`);
                    } else {
                        // Có thể hiển thị thông báo nhẹ nhàng hơn nếu cần
                        console.log(`Không có dữ liệu người dùng nào cho vai trò ${roleToFetch}.`);
                        // message.info(`Không tìm thấy người dùng cho vai trò ${roleToFetch}.`);
                    }
                } else {
                    console.error(`Dữ liệu trả về cho role ${roleToFetch} không phải là mảng:`, fetchedUsers);
                    message.error(`Lỗi định dạng dữ liệu nhận được cho role ${roleToFetch}.`);
                    // Gán mảng rỗng khi có lỗi định dạng để tránh undefined
                    setUsersData(prev => ({ ...prev, [roleToFetch]: [] }));
                }

            } catch (error) {
                console.error(`Lỗi khi fetch dữ liệu cho role ${roleToFetch}:`, error);
                const errorMessage = error.response?.data?.message || error.message || `Không thể tải dữ liệu cho ${roleToFetch}`;
                message.error(errorMessage);
                // Gán mảng rỗng khi có lỗi fetch để tránh undefined
                setUsersData(prev => ({ ...prev, [roleToFetch]: [] }));
            } finally {
                setLoadingStates(prev => ({ ...prev, [roleToFetch]: false }));
            }
        } else {
            console.log(`Dữ liệu cho ${roleToFetch} đã tồn tại, bỏ qua fetch.`);
        }
    // Giữ dependencies vì hàm cần đọc state hiện tại
    }, [usersData, loadingStates]);

    // useEffect để fetch dữ liệu khi component mount và khi activeRole thay đổi
    useEffect(() => {
        // Kiểm tra để đảm bảo fetchUsers không phải là undefined (mặc dù không nên)
        if (fetchUsers) {
            fetchUsers(activeRole);
        }
    }, [activeRole, fetchUsers]); // fetchUsers thay đổi khi usersData hoặc loadingStates thay đổi

    // Hàm Refresh (Giữ nguyên, chỉ cần gọi fetchUsers với forceRefresh = true)
    const handleRefresh = () => {
        console.log(`Yêu cầu làm mới dữ liệu cho role: ${activeRole}`);
        fetchUsers(activeRole, true);
        setSearchText('');
        setSearchedColumn('');
    };

    // Hàm thay đổi Tab (Giữ nguyên)
    const onTabChange = (key) => {
        console.log(`Chuyển sang tab: ${key}`);
        setActiveRole(key);
        setSearchText('');
        setSearchedColumn('');
        // fetchUsers sẽ tự động được gọi bởi useEffect nếu dữ liệu chưa có
    };

    // Các hàm Search (Giữ nguyên)
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters, confirm) => {
        clearFilters && clearFilters();
        setSearchText('');
        setSearchedColumn('');
        confirm();
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
                    <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90 }} > Tìm </Button>
                    <Button onClick={() => clearFilters && handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }} > Reset </Button>
                    <Button type="link" size="small" onClick={() => close()} > Đóng </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
        onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) { setTimeout(() => searchInput.current?.select(), 100); }
        },
        render: (text) => searchedColumn === dataIndex ? ( <Highlighter highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ''} /> ) : ( text ),
    });

    // Hàm Xóa User (Cập nhật state theo activeRole)
     const deleteUser = async (userToDelete) => {
        const userIdToDelete = userToDelete.userId;
        const usernameToDelete = userToDelete.username;
        if (!userIdToDelete) {
            message.error('Không tìm thấy thông tin định danh (userId) để xóa.');
            return;
        }
        setLoadingStates(prev => ({ ...prev, [activeRole]: true })); // Chỉ set loading cho tab hiện tại
        try {
            await apiService.deleteUser(userIdToDelete);
            // Cập nhật state usersData cho role hiện tại
            setUsersData(prev => {
                 const currentRoleUsers = prev[activeRole] || []; // Lấy danh sách hiện tại hoặc mảng rỗng
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

    // Hàm Xác nhận Xóa (Giữ nguyên)
    const showDeleteConfirm = (user) => {
        confirm({ /* ... confirm options ... */ onOk() { deleteUser(user); } });
    };

    // Hàm Mở Modal Sửa (Giữ nguyên)
    const handleEditUser = (user) => {
        setModalChild( <EditUser userData={user} setModalChild={setModalChild} handleRefresh={handleRefresh} /> );
    };

    // Định nghĩa cột bảng (Giữ nguyên)
    const columns = [
        { title: 'STT', key: 'stt', align: 'center', width: '5%', render: (_, record, index) => index + 1, },
        { title: 'Username', dataIndex: 'username', key: 'username', width: '15%', ellipsis: true, ...getColumnSearchProps('username'), },
        { title: 'Email', dataIndex: 'email', key: 'email', width: '20%', ellipsis: true, ...getColumnSearchProps('email'), },
        { title: 'Họ Tên', key: 'fullName', width: '15%', ellipsis: true, render: (_, record) => `${record.firstName || ''} ${record.lastName || ''}`.trim(), sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`), },
        { title: 'SĐT', dataIndex: 'phoneNumber', key: 'phoneNumber', width: '12%', ellipsis: true, ...getColumnSearchProps('phoneNumber'), },
        { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true, ...getColumnSearchProps('address'), },
        { title: 'Role', dataIndex: 'role', key: 'role', width: '10%', align: 'center', render: (role) => { let color = 'default'; if (role === 'ADMIN') color = 'volcano'; else if (role === 'PRODUCT_MANAGER') color = 'geekblue'; else if (role === 'CUSTOMER') color = 'green'; return <Tag color={color}>{role}</Tag>; }, },
        { title: 'Hành động', key: 'actions', align: 'center', width: '10%', render: (_, record) => ( <Space size="small"> <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEditUser(record); }} title="Sửa thông tin" /> <Button type="text" danger icon={<DeleteFilled />} onClick={(e) => { e.stopPropagation(); showDeleteConfirm(record); }} title="Xóa người dùng" /> </Space> ), },
    ];

    // --- Lấy dataSource và loading cho tab hiện tại (Xử lý undefined) ---
    const currentDataSource = usersData[activeRole] || []; // Mặc định là mảng rỗng nếu chưa có dữ liệu
    const currentLoading = loadingStates[activeRole] || false; // Mặc định là false

    return (
        <div>
            <Tabs activeKey={activeRole} onChange={onTabChange} tabBarExtraContent={
                 <Button icon={<SyncOutlined />} onClick={handleRefresh} loading={currentLoading}> Làm mới </Button>
            }>
                {ROLES.map(role => (
                    // --- Xử lý undefined khi hiển thị count trên tab ---
                    <TabPane tab={`${role} (${usersData[role]?.length ?? 0})`} key={role}>
                        <Table
                            columns={columns}
                            loading={currentLoading}
                            // --- dataSource giờ đã an toàn vì currentDataSource là mảng ---
                            dataSource={currentDataSource.map((user) => ({ ...user, key: user.userId }))}
                            pagination={{
                                pageSizeOptions: ['5', '10', '15', '20'],
                                showSizeChanger: true,
                                defaultPageSize: 10,
                                size: "large",
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

            <Modal open={modalChild !== null} onCancel={() => setModalChild(null)} footer={null} destroyOnClose={true} width={700} centered>
                {modalChild}
            </Modal>
        </div>
    );
};
export default AdminUser;