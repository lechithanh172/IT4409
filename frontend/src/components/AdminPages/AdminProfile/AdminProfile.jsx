// AdminProfile.jsx
import React, { useEffect, useState } from 'react';
import { Button, Modal, Input, message, Spin, Card, Form, Space, Typography, Tag } from 'antd';
import apiService from '../../../services/api'; // Ensure correct path

const { Text } = Typography;

// --- CORRECT HARDCODED DATA ---
const hardcodedAdmin = {
    "userId": 3, // From your latest data
    "username": "ductran", // From your latest data
    "password": "$2a$10$8AYGeaxV/BN4XCV5YrRXle2NYgLmuTnmF8snLSga/Z93ulTrXw3kG", // Included, but not used in UI
    "email": "tranduct1k29@gmail.com", // From your latest data
    "firstName": "Rô", // From your latest data
    "lastName": "Nan Đô", // From your latest data
    "phoneNumber": "0911919191", // From your latest data
    "address": "Cầu Giấy", // From your latest data
    "role": "ADMIN", // From your latest data
    "createdAt": "2025-04-27T15:58:25.600897", // Included, but not used in UI
    "updatedAt": "2025-04-27T15:58:25.600915", // Included, but not used in UI
    "isActive": true, // Included, but not used in UI
    "enabled": true, // Included, but not used in UI
    "accountNonLocked": true, // Included, but not used in UI
    "authorities": [ // Included, but not used directly in UI (role field is used)
        {
            "authority": "ROLE_ADMIN"
        }
    ],
    "accountNonExpired": true, // Included, but not used in UI
    "credentialsNonExpired": true // Included, but not used in UI
};
// --------------------------

const AdminProfile = () => {
    // Initialize state with the CORRECT hardcoded data
    const [admin, setAdmin] = useState(hardcodedAdmin);
    const [loading, setLoading] = useState(false); // For initial data fetch (if any)
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingForgotEmail, setLoadingForgotEmail] = useState(false); // Step 1 loading
    const [loadingResetPassword, setLoadingResetPassword] = useState(false); // Step 2 loading

    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);

    const [forgotPasswordStep, setForgotPasswordStep] = useState('email');
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

    const [updateForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [forgotPasswordForm] = Form.useForm(); // Step 1 form
    const [resetPasswordForm] = Form.useForm(); // Step 2 form

    // --- useEffect for Update Modal ---
    useEffect(() => {
        if (admin && isUpdateModalVisible) {
             updateForm.setFieldsValue({
                 firstName: admin.firstName,
                 lastName: admin.lastName,
                 phoneNumber: admin.phoneNumber,
                 address: admin.address,
             });
        }
    }, [admin, isUpdateModalVisible, updateForm]);

    // --- handleUpdate (WITH API CALL) ---
     const handleUpdate = async (values) => {
        console.log('Updating with values:', values);
        setLoadingUpdate(true);
        try {
            // Prepare payload based on API spec (firstName, lastName, phoneNumber, address)
            const updatePayload = {
                firstName: values.firstName,
                lastName: values.lastName,
                phoneNumber: values.phoneNumber,
                address: values.address,
                // Note: API doesn't specify needing userId/username here,
                // backend might get it from the authenticated session.
            };
            console.log("Payload for update:", updatePayload);

            // *** UNCOMMENT WHEN USING REAL API ***
            // await apiService.updateUserInfo(updatePayload);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

            // Update local state on successful API call (or simulation)
            const updatedData = { ...admin, ...values };
            setAdmin(updatedData);
            message.success('Cập nhật thông tin thành công!'); // Remove (Giả lập) when using real API
            setIsUpdateModalVisible(false);
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            message.error(error.response?.data?.message || 'Cập nhật thông tin thất bại!');
        } finally {
            setLoadingUpdate(false);
        }
    };


    // --- handlePasswordChange (WITH API CALL) ---
    const handlePasswordChange = async (values) => {
        console.log('Changing password with values:', values);
        if (values.newPassword !== values.confirmPassword) {
             message.error('Mật khẩu mới và xác nhận không khớp!');
             return;
        }
        setLoadingPassword(true);
        try {
             // Prepare payload based on API spec (email, oldPassword, newPassword)
             const payload = {
                 email: admin.email, // Use email from the current admin profile state
                 oldPassword: values.currentPassword,
                 newPassword: values.newPassword,
             };
             console.log("Payload for change password:", payload);

            // *** UNCOMMENT WHEN USING REAL API ***
            // await apiService.changePassword(payload);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

            message.success('Đổi mật khẩu thành công!'); // Remove (Giả lập) when using real API
            setIsPasswordModalVisible(false);
            passwordForm.resetFields();
        } catch (error) {
             console.error("Lỗi đổi mật khẩu:", error);
             // Display specific backend error message if available
            message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại!');
        } finally {
            setLoadingPassword(false);
        }
    };

    // --- Forgot Password Step 1: Submit Email (WITH API CALL) ---
    const handleForgotPasswordEmailSubmit = async (values) => {
        const email = values.forgotEmail;
        console.log('Forgot password request for email:', email);
        setLoadingForgotEmail(true);
        try {
            // *** UNCOMMENT WHEN USING REAL API ***
            // await apiService.forgetPassword(email);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

            // On success, move to the next step
            setForgotPasswordEmail(email);
            setForgotPasswordStep('reset');
            forgotPasswordForm.resetFields();
            // Inform user based on actual API behavior (e.g., check email)
            message.success(`Yêu cầu đặt lại mật khẩu đã được gửi tới ${email}. Vui lòng kiểm tra email hoặc nhập mật khẩu mới bên dưới.`); // Adjust message

        } catch (error) {
            console.error("Lỗi quên mật khẩu (step 1):", error);
            message.error(error.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
        } finally {
            setLoadingForgotEmail(false);
        }
    };

    // --- Forgot Password Step 2: Reset Password (WITH API CALL) ---
    const handleResetPasswordSubmit = async (values) => {
         console.log('Resetting password for email:', forgotPasswordEmail);
         console.log('New password values:', values);
        if (values.newPassword !== values.confirmPassword) {
             message.error('Mật khẩu mới và xác nhận không khớp!');
             return;
        }
        setLoadingResetPassword(true);
        try {
            // Prepare payload based on API spec
            // *** IMPORTANT: Check if your API requires a 'token' received via email ***
            const payload = {
                // token: values.token, // Uncomment and add Form.Item for token if needed
                email: forgotPasswordEmail, // Send the email we stored
                newPassword: values.newPassword,
            };
             console.log("Payload for reset password:", payload);

            // *** UNCOMMENT WHEN USING REAL API ***
            // await apiService.resetPassword(payload);
             await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

            message.success('Đặt lại mật khẩu thành công!'); // Remove (Giả lập) when using real API
            handleCancelForgotPassword(); // Close modal and reset state

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
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
    }
    if (!admin) {
         return <div style={{ padding: '20px', textAlign: 'center' }}><Text type="danger">Không thể tải thông tin Admin.</Text></div>;
    }

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
            <Card
                 title={<div style={{ fontWeight: 'bold', fontSize: '20px' }}>Thông tin Admin</div>}
                 bordered={false}
                 style={{ width: '100%', maxWidth: '800px', margin: 'auto' }}
                 extra={
                     <Space>
                         <Button onClick={showUpdateModal}>Cập nhật thông tin</Button>
                         <Button type="primary" onClick={showPasswordModal}>Đổi mật khẩu</Button>
                     </Space>
                 }
            >
                {/* Displaying data from the 'admin' state object */}
                <p><strong>Username:</strong> {admin.username}</p>
                <p><strong>Email:</strong> {admin.email}</p>
                <p><strong>Họ tên:</strong> {`${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'N/A'}</p>
                <p><strong>Số điện thoại:</strong> {admin.phoneNumber || 'N/A'}</p>
                <p><strong>Địa chỉ:</strong> {admin.address || 'N/A'}</p>
                <p><strong>Role:</strong> {admin.role ? <Tag color="volcano">{admin.role}</Tag> : 'N/A'}</p>
                <div style={{ marginTop: '20px', textAlign:'center' }}>
                     <Button type="link" onClick={showForgotPasswordModal}>Quên mật khẩu?</Button>
                </div>
            </Card>

            {/* --- Modal Cập nhật thông tin --- */}
            <Modal title="Cập nhật thông tin" open={isUpdateModalVisible} onCancel={handleCancelUpdate} footer={null} destroyOnClose centered>
                <Spin spinning={loadingUpdate}>
                    <Form form={updateForm} layout="vertical" onFinish={handleUpdate} >
                         {/* Form Items use names matching admin properties */}
                         <Form.Item label="Họ" name="firstName" rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}><Input /></Form.Item>
                         <Form.Item label="Tên" name="lastName" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}><Input /></Form.Item>
                         <Form.Item label="Số điện thoại" name="phoneNumber" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}><Input /></Form.Item>
                         <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}><Input.TextArea rows={3} /></Form.Item>
                         <Form.Item style={{ textAlign: 'right' }}>
                            <Space>
                                <Button onClick={handleCancelUpdate}>Hủy</Button>
                                <Button type="primary" htmlType="submit" loading={loadingUpdate}>Lưu thay đổi</Button>
                            </Space>
                         </Form.Item>
                    </Form>
                </Spin>
            </Modal>

            {/* --- Modal Đổi mật khẩu --- */}
            <Modal title="Đổi mật khẩu" open={isPasswordModalVisible} onCancel={handleCancelPassword} footer={null} destroyOnClose centered>
                 <Spin spinning={loadingPassword}>
                    <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange} >
                         <Form.Item label="Mật khẩu hiện tại" name="currentPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}><Input.Password /></Form.Item>
                         <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' },{ min: 6, message: 'Mật khẩu cần ít nhất 6 ký tự!' }]} hasFeedback><Input.Password /></Form.Item>
                         <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword" dependencies={['newPassword']} hasFeedback rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) { return Promise.resolve(); } return Promise.reject(new Error('Mật khẩu xác nhận không khớp!')); },})]}><Input.Password /></Form.Item>
                         <Form.Item style={{ textAlign: 'right' }}>
                             <Space>
                                 <Button onClick={handleCancelPassword}>Hủy</Button>
                                 <Button type="primary" htmlType="submit" loading={loadingPassword}>Đổi mật khẩu</Button>
                             </Space>
                         </Form.Item>
                    </Form>
                 </Spin>
            </Modal>

             {/* --- Modal Quên mật khẩu (Two Steps) --- */}
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
                              <Form.Item label="Email" name="forgotEmail" rules={[{ required: true, message: 'Vui lòng nhập email!' },{ type: 'email', message: 'Email không hợp lệ!'}]}><Input placeholder="Nhập email đã đăng ký" /></Form.Item>
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
                        {/* *** ADD TOKEN FIELD HERE IF NEEDED BY YOUR API *** */}
                        {/* Example:
                        <Form.Item
                            label="Mã xác nhận (từ Email)"
                            name="token"
                            rules={[{ required: true, message: 'Vui lòng nhập mã xác nhận!' }]}
                        >
                            <Input />
                        </Form.Item>
                        */}
                        <Form form={resetPasswordForm} layout="vertical" onFinish={handleResetPasswordSubmit}>
                            <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' },{ min: 6, message: 'Mật khẩu cần ít nhất 6 ký tự!' }]} hasFeedback><Input.Password /></Form.Item>
                            <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword" dependencies={['newPassword']} hasFeedback rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) { return Promise.resolve(); } return Promise.reject(new Error('Mật khẩu xác nhận không khớp!')); },})]}><Input.Password /></Form.Item>
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

export default AdminProfile;