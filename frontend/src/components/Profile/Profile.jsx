// UserProfile.jsx (Renamed from AdminProfile.jsx)
import React, { useEffect, useState } from 'react';
import { Button, Modal, Input, message, Spin, Card, Form, Space, Typography, Tag } from 'antd';
import apiService from '../../services/api'; // Ensure correct path

const { Text } = Typography;

// --- Helper Functions ---
const getProfileTitle = (role) => {
    switch (role?.toUpperCase()) {
        case 'ADMIN':
            return 'Thông tin Admin';
        case 'USER':
            return 'Thông tin Người dùng';
        case 'PRODUCT_MANAGER': // Add other roles as needed
            return 'Thông tin Quản lý Sản phẩm';
        default:
            return 'Thông tin Tài khoản';
    }
};

const getTagColor = (role) => {
    switch (role?.toUpperCase()) {
        case 'ADMIN':
            return 'volcano';
        case 'USER':
            return 'blue';
        case 'PRODUCT_MANAGER':
            return 'green';
        default:
            return 'default';
    }
};

// --- Mock User Data for Simulation (Replace with actual API call) ---
// Simulate different roles based on some condition (e.g., logged-in user ID)
// In a real app, your API would return the correct user data.
const MOCK_USER_DATA = {
    // Example Admin
    // 3: { /* ... same as hardcodedAdmin ... */ },
    // Example User
    101: {
        "userId": 101,
        "username": "userCharlie",
        "password": "...", // Not needed for UI
        "email": "charlie@mail.com",
        "firstName": "Charlie",
        "lastName": "User",
        "phoneNumber": "0987654321",
        "address": "123 User Street",
        "role": "USER",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z",
        "isActive": true,
        "enabled": true,
        "accountNonLocked": true,
        "authorities": [{ "authority": "ROLE_USER" }],
        "accountNonExpired": true,
        "credentialsNonExpired": true
    },
    // Example Product Manager
    201: {
        "userId": 201,
        "username": "pmEve",
        "password": "...", // Not needed for UI
        "email": "eve@corp.com",
        "firstName": "Eve",
        "lastName": "Manager",
        "phoneNumber": "0912345678",
        "address": "456 PM Avenue",
        "role": "PRODUCT_MANAGER",
        "createdAt": "2024-02-20T11:00:00Z",
        "updatedAt": "2024-02-20T11:00:00Z",
        "isActive": true,
        "enabled": true,
        "accountNonLocked": true,
        "authorities": [{ "authority": "ROLE_PRODUCT_MANAGER" }], // Or might have multiple roles
        "accountNonExpired": true,
        "credentialsNonExpired": true,
        "assignedProducts": ["Project X", "Project Y"] // Example role-specific data
    },
    // Using the original Admin data for ID 3
    3: {
        "userId": 3,
        "username": "ductran",
        "password": "$2a$10$8AYGeaxV/BN4XCV5YrRXle2NYgLmuTnmF8snLSga/Z93ulTrXw3kG",
        "email": "tranduct1k29@gmail.com",
        "firstName": "Rô",
        "lastName": "Nan Đô",
        "phoneNumber": "0911919191",
        "address": "Cầu Giấy",
        "role": "ADMIN",
        "createdAt": "2025-04-27T15:58:25.600897",
        "updatedAt": "2025-04-27T15:58:25.600915",
        "isActive": true,
        "enabled": true,
        "accountNonLocked": true,
        "authorities": [{ "authority": "ROLE_ADMIN" }],
        "accountNonExpired": true,
        "credentialsNonExpired": true
    }
};

// --- Component Definition ---
const UserProfile = () => {
    // Renamed state: admin -> user
    const [user, setUser] = useState(null); // Start with null, fetch data
    const [loading, setLoading] = useState(true); // Start loading true for initial fetch
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingForgotEmail, setLoadingForgotEmail] = useState(false);
    const [loadingResetPassword, setLoadingResetPassword] = useState(false);

    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);

    const [forgotPasswordStep, setForgotPasswordStep] = useState('email');
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

    const [updateForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [forgotPasswordForm] = Form.useForm();
    const [resetPasswordForm] = Form.useForm();

    // --- Fetch User Data on Mount ---
    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            try {
                // *** REPLACE WITH YOUR ACTUAL API CALL ***
                // Example: Get the user ID from context, local storage, or props
                // const currentUserId = authContext.userId; // Or similar
                const currentUserId = 201; // Simulate fetching Admin's profile for now
                console.log(`Fetching profile for user ID: ${currentUserId}`);

                // --- SIMULATION START ---
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 500));
                const userData = MOCK_USER_DATA[currentUserId]; // Get data from mock object
                if (!userData) {
                    throw new Error(`User with ID ${currentUserId} not found.`);
                }
                // --- SIMULATION END ---

                // *** UNCOMMENT AND USE YOUR ACTUAL API SERVICE ***
                // const userData = await apiService.getCurrentUserProfile(); // Assumes endpoint gets logged-in user's profile
                // Or: const userData = await apiService.getUserProfileById(currentUserId);

                console.log("Fetched user data:", userData);
                setUser(userData); // Set the fetched user data
            } catch (error) {
                console.error("Lỗi tải thông tin tài khoản:", error);
                message.error(error.message || 'Không thể tải thông tin tài khoản.');
                setUser(null); // Ensure user state is null on error
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []); // Empty dependency array means run once on mount

    // --- useEffect for Update Modal (Uses 'user' state now) ---
    useEffect(() => {
        if (user && isUpdateModalVisible) {
            updateForm.setFieldsValue({
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                address: user.address,
                // Add any other fields common to all update forms
            });
        }
    }, [user, isUpdateModalVisible, updateForm]);

    // --- handleUpdate (Uses 'user' state, API assumed generic) ---
    const handleUpdate = async (values) => {
        console.log('Updating profile with values:', values);
        setLoadingUpdate(true);
        try {
            const updatePayload = {
                firstName: values.firstName,
                lastName: values.lastName,
                phoneNumber: values.phoneNumber,
                address: values.address,
                // The backend should identify the user from the session/token
            };
            console.log("Payload for update:", updatePayload);

            // *** UNCOMMENT WHEN USING REAL API ***
            // Assume apiService.updateUserInfo works for the logged-in user
            // await apiService.updateUserInfo(updatePayload);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

            // Update local state
            const updatedData = { ...user, ...values };
            setUser(updatedData);
            message.success('Cập nhật thông tin thành công!');
            setIsUpdateModalVisible(false);
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            message.error(error.response?.data?.message || 'Cập nhật thông tin thất bại!');
        } finally {
            setLoadingUpdate(false);
        }
    };

    // --- handlePasswordChange (Uses 'user' state, API assumed generic) ---
    const handlePasswordChange = async (values) => {
        console.log('Changing password with values:', values);
        if (values.newPassword !== values.confirmPassword) {
            message.error('Mật khẩu mới và xác nhận không khớp!');
            return;
        }
        setLoadingPassword(true);
        try {
            // Payload uses email from the CURRENT user state
            const payload = {
                email: user.email, // Use email from the current user profile state
                oldPassword: values.currentPassword,
                newPassword: values.newPassword,
            };
            console.log("Payload for change password:", payload);

            // *** UNCOMMENT WHEN USING REAL API ***
            // Assume apiService.changePassword works for the logged-in user
            // await apiService.changePassword(payload);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

            message.success('Đổi mật khẩu thành công!');
            setIsPasswordModalVisible(false);
            passwordForm.resetFields();
        } catch (error) {
            console.error("Lỗi đổi mật khẩu:", error);
            message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại!');
        } finally {
            setLoadingPassword(false);
        }
    };

    // --- Forgot Password Step 1: Submit Email (No changes needed, conceptually generic) ---
    const handleForgotPasswordEmailSubmit = async (values) => {
        const email = values.forgotEmail;
        console.log('Forgot password request for email:', email);
        setLoadingForgotEmail(true);
        try {
            // *** UNCOMMENT WHEN USING REAL API ***
            // Assume apiService.forgetPassword works for any valid email
            // await apiService.forgetPassword(email);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

            setForgotPasswordEmail(email);
            setForgotPasswordStep('reset');
            forgotPasswordForm.resetFields();
            message.success(`Yêu cầu đặt lại mật khẩu đã được gửi tới ${email}. Vui lòng kiểm tra email hoặc nhập mật khẩu mới bên dưới.`);

        } catch (error) {
            console.error("Lỗi quên mật khẩu (step 1):", error);
            message.error(error.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
        } finally {
            setLoadingForgotEmail(false);
        }
    };

    // --- Forgot Password Step 2: Reset Password (No changes needed, conceptually generic) ---
    const handleResetPasswordSubmit = async (values) => {
        console.log('Resetting password for email:', forgotPasswordEmail);
        console.log('New password values:', values);
        if (values.newPassword !== values.confirmPassword) {
            message.error('Mật khẩu mới và xác nhận không khớp!');
            return;
        }
        setLoadingResetPassword(true);
        try {
            // *** Check your API: Might need a token received via email ***
            const payload = {
                // token: values.token, // Add Form.Item for token if needed
                email: forgotPasswordEmail,
                newPassword: values.newPassword,
            };
            console.log("Payload for reset password:", payload);

            // *** UNCOMMENT WHEN USING REAL API ***
            // Assume apiService.resetPassword works with email/token/newPassword
            // await apiService.resetPassword(payload);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

            message.success('Đặt lại mật khẩu thành công!');
            handleCancelForgotPassword(); // Close modal

        } catch (error) {
            console.error("Lỗi đặt lại mật khẩu (step 2):", error);
            message.error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại.');
        } finally {
            setLoadingResetPassword(false);
        }
    };

    // --- Hàm mở/đóng modals (No changes needed) ---
    const showUpdateModal = () => setIsUpdateModalVisible(true);
    const showPasswordModal = () => setIsPasswordModalVisible(true);
    const showForgotPasswordModal = () => {
        setForgotPasswordStep('email');
        setForgotPasswordEmail('');
        forgotPasswordForm.resetFields();
        resetPasswordForm.resetFields();
        setIsForgotPasswordModalVisible(true);
    };
    const handleCancelUpdate = () => setIsUpdateModalVisible(false);
    const handleCancelPassword = () => {
        setIsPasswordModalVisible(false);
        passwordForm.resetFields();
    };
    const handleCancelForgotPassword = () => {
        setIsForgotPasswordModalVisible(false);
        setForgotPasswordStep('email');
        setForgotPasswordEmail('');
        forgotPasswordForm.resetFields();
        resetPasswordForm.resetFields();
    };


    // --- RENDER ---
    // Handle Loading State
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}><Spin size="large" /></div>;
    }
    // Handle Error State (Data failed to load)
    if (!user) {
        return <div style={{ padding: '20px', textAlign: 'center' }}><Text type="danger">Không thể tải thông tin tài khoản.</Text></div>;
    }

    // Render Profile when data is loaded
    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
            <Card
                // Dynamic Title using helper function
                title={<div style={{ fontWeight: 'bold', fontSize: '20px' }}>{getProfileTitle(user.role)}</div>}
                bordered={false}
                style={{ width: '100%', maxWidth: '800px', margin: 'auto' }}
                extra={
                    <Space>
                        <Button onClick={showUpdateModal}>Cập nhật thông tin</Button>
                        <Button type="primary" onClick={showPasswordModal}>Đổi mật khẩu</Button>
                    </Space>
                }
            >
                {/* Displaying data from the 'user' state object */}
                {/* Use optional chaining (?.) in case some fields might be missing */}
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Họ tên:</strong> {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}</p>
                <p><strong>Số điện thoại:</strong> {user.phoneNumber || 'N/A'}</p>
                <p><strong>Địa chỉ:</strong> {user.address || 'N/A'}</p>
                <p>
                    <strong>Role:</strong>{' '}
                    {user.role ? <Tag color={getTagColor(user.role)}>{user.role}</Tag> : 'N/A'}
                </p>


                {/* Add more conditional fields for other roles if needed */}

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Button type="link" onClick={showForgotPasswordModal}>Quên mật khẩu?</Button>
                </div>
            </Card>

            {/* --- Modal Cập nhật thông tin (Form fields assumed common) --- */}
            <Modal title="Cập nhật thông tin" open={isUpdateModalVisible} onCancel={handleCancelUpdate} footer={null} destroyOnClose centered>
                <Spin spinning={loadingUpdate}>
                    <Form form={updateForm} layout="vertical" onFinish={handleUpdate} >
                        {/* Form Items use names matching user properties */}
                        <Form.Item label="Họ" name="firstName" rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}><Input /></Form.Item>
                        <Form.Item label="Tên" name="lastName" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}><Input /></Form.Item>
                        <Form.Item label="Số điện thoại" name="phoneNumber" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}><Input /></Form.Item>
                        <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}><Input.TextArea rows={3} /></Form.Item>
                        {/* Add other common editable fields here if needed */}
                        <Form.Item style={{ textAlign: 'right' }}>
                            <Space>
                                <Button onClick={handleCancelUpdate}>Hủy</Button>
                                <Button type="primary" htmlType="submit" loading={loadingUpdate}>Lưu thay đổi</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>

            {/* --- Modal Đổi mật khẩu (Remains the same) --- */}
            <Modal title="Đổi mật khẩu" open={isPasswordModalVisible} onCancel={handleCancelPassword} footer={null} destroyOnClose centered>
                <Spin spinning={loadingPassword}>
                    <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange} >
                        <Form.Item label="Mật khẩu hiện tại" name="currentPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}><Input.Password /></Form.Item>
                        <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }, { min: 6, message: 'Mật khẩu cần ít nhất 6 ký tự!' }]} hasFeedback><Input.Password /></Form.Item>
                        <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword" dependencies={['newPassword']} hasFeedback rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) { return Promise.resolve(); } return Promise.reject(new Error('Mật khẩu xác nhận không khớp!')); }, })]}><Input.Password /></Form.Item>
                        <Form.Item style={{ textAlign: 'right' }}>
                            <Space>
                                <Button onClick={handleCancelPassword}>Hủy</Button>
                                <Button type="primary" htmlType="submit" loading={loadingPassword}>Đổi mật khẩu</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>

            {/* --- Modal Quên mật khẩu (Remains the same) --- */}
            <Modal
                title={forgotPasswordStep === 'email' ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
                open={isForgotPasswordModalVisible}
                onCancel={handleCancelForgotPassword}
                footer={null}
                destroyOnClose
                centered
            >
                {/* Step 1: Enter Email */}
                {forgotPasswordStep === 'email' && (
                    <Spin spinning={loadingForgotEmail}>
                        <p>Nhập địa chỉ email của bạn để nhận hướng dẫn đặt lại mật khẩu.</p>
                        <Form form={forgotPasswordForm} layout="vertical" onFinish={handleForgotPasswordEmailSubmit} >
                            <Form.Item label="Email" name="forgotEmail" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}><Input placeholder="Nhập email đã đăng ký" /></Form.Item>
                            <Form.Item style={{ textAlign: 'right' }}>
                                <Space>
                                    <Button onClick={handleCancelForgotPassword}>Hủy</Button>
                                    <Button type="primary" htmlType="submit" loading={loadingForgotEmail}>Gửi yêu cầu</Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Spin>
                )}

                {/* Step 2: Enter New Password */}
                {forgotPasswordStep === 'reset' && (
                    <Spin spinning={loadingResetPassword}>
                        <p>Nhập mật khẩu mới cho tài khoản: <strong>{forgotPasswordEmail}</strong></p>
                        {/* Add Token field here if your API requires it */}
                        <Form form={resetPasswordForm} layout="vertical" onFinish={handleResetPasswordSubmit}>
                            <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }, { min: 6, message: 'Mật khẩu cần ít nhất 6 ký tự!' }]} hasFeedback><Input.Password /></Form.Item>
                            <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword" dependencies={['newPassword']} hasFeedback rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) { return Promise.resolve(); } return Promise.reject(new Error('Mật khẩu xác nhận không khớp!')); }, })]}><Input.Password /></Form.Item>
                            <Form.Item style={{ textAlign: 'right' }}>
                                <Space>
                                    <Button onClick={handleCancelForgotPassword}>Hủy</Button>
                                    <Button type="primary" htmlType="submit" loading={loadingResetPassword}>Đặt lại mật khẩu</Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Spin>
                )}
            </Modal>
        </div>
    );
};

export default UserProfile; 