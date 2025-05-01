// AdminProfile.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    Button, Modal, Input, notification, Spin, Card, Form, Space, Typography, Tag, // <--- Thay message bằng notification
    Avatar, Row, Col, Divider, Tooltip
} from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, LockOutlined } from '@ant-design/icons';
// --- Đảm bảo đường dẫn này chính xác trong dự án của bạn ---
import apiService from '../../../services/api';

const { Text, Title } = Typography;

// --- Component con để hiển thị chi tiết Profile ---
const ProfileDetailItem = ({ label, value, isEditing, name, rules, inputType = 'input' }) => (
    <Row key={name || label} gutter={[8, 8]} align="middle" style={{ marginBottom: 12 }}>
        <Col xs={24} sm={6} style={{ textAlign: 'right', paddingRight: '10px' }}>
            <Text strong type="secondary">{label}:</Text>
        </Col>
        <Col xs={24} sm={18}>
            {isEditing ? (
                <Form.Item name={name} rules={rules} noStyle style={{ marginBottom: 0 }}>
                    {inputType === 'textarea' ? <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} /> : <Input />}
                </Form.Item>
            ) : (
                <Text style={{ fontSize: '16px' }}>{value || 'N/A'}</Text>
            )}
        </Col>
    </Row>
);

// --- Component Chính AdminProfile ---
const AdminProfile = () => {
    // --- State ---
    const [admin, setAdmin] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingForgotEmail, setLoadingForgotEmail] = useState(false);
    const [loadingResetPassword, setLoadingResetPassword] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState('email');
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

    // --- Forms ---
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [forgotPasswordForm] = Form.useForm();
    const [resetPasswordForm] = Form.useForm();

    // --- Hàm Helper cho Notification ---
    const showErrorNotification = (error, defaultMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.') => {
        let errorTitle = "Lỗi";
        let errorDescription = defaultMessage;

        if (error.response) {
            errorDescription = error.response.data?.message
                            || error.response.data?.error
                            || error.response.data?.detail
                            || `Lỗi ${error.response.status}: ${error.response.statusText}`;

            // Xử lý các mã lỗi hoặc message cụ thể
            if (error.response.status === 401) errorTitle = "Lỗi xác thực";
            if (error.response.data?.message?.toLowerCase().includes('email not found')) errorDescription = "Email không tồn tại trong hệ thống.";
            if (error.response.data?.message?.toLowerCase().includes('password incorrect')) errorDescription = "Mật khẩu hiện tại không đúng.";
            if (error.response.data?.message?.toLowerCase().includes('otp')) errorDescription = "Mã OTP không hợp lệ hoặc đã hết hạn.";
            // Thêm các trường hợp khác nếu cần

        } else if (error.request) {
            errorTitle = "Lỗi mạng";
            errorDescription = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.';
        } else {
            // Nếu lỗi không có response hay request, thường là lỗi logic client hoặc lỗi setup
            errorTitle = "Lỗi hệ thống";
            errorDescription = error.message || defaultMessage; // Hiển thị message của đối tượng Error nếu có
        }

        notification.error({
            message: errorTitle,
            description: errorDescription,
            placement: 'topRight'
        });
        // console.error("Chi tiết lỗi:", error); // Có thể bật lại để debug
    };

    const showSuccessNotification = (description, title = "Thành công") => {
        notification.success({
            message: title,
            description: description,
            placement: 'topRight'
        });
    };
    // --- Kết thúc Hàm Helper ---

    // --- Hàm Fetch dữ liệu Admin ---
    const fetchAdminData = useCallback(async () => {
        setLoading(true);
        const targetUsername = 'tranducthpt1';
        try {
            const response = await apiService.getUserInfo(targetUsername);
            if (response && response.data) {
                setAdmin(response.data);
            } else {
                throw new Error("API trả về dữ liệu không hợp lệ.");
            }
        } catch (error) {
            // Sử dụng notification thay vì message
            showErrorNotification(error, 'Không thể tải thông tin cá nhân.');
            setAdmin(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // --- useEffect: Fetch dữ liệu khi component mount ---
    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    // --- useEffect: Đồng bộ dữ liệu vào Form khi sửa ---
    useEffect(() => {
        if (isEditing && admin) {
            profileForm.setFieldsValue({
                firstName: admin.firstName,
                lastName: admin.lastName,
                phoneNumber: admin.phoneNumber,
                address: admin.address,
            });
        }
        if (!isEditing) {
            profileForm.resetFields();
        }
    }, [isEditing, admin, profileForm]);

    // --- Hàm bật/tắt chế độ Sửa ---
    const toggleEdit = () => {
        if (!admin) return;
        setIsEditing(!isEditing);
    };

    // --- Hàm xử lý Submit Form Cập nhật Profile ---
    const handleProfileUpdateFinish = async (values) => {
        if (!admin) return;
        setLoadingUpdate(true);
        try {
            const updatePayload = { /* ... */ };
            await apiService.updateUserInfo(updatePayload);
            const updatedData = { ...admin, ...values };
            setAdmin(updatedData);
            // Sử dụng notification thay vì message
            showSuccessNotification('Thông tin cá nhân đã được cập nhật thành công!');
            setIsEditing(false);
        } catch (error) {
             // Sử dụng notification thay vì message
            showErrorNotification(error, 'Cập nhật thông tin thất bại!');
        } finally {
            setLoadingUpdate(false);
        }
    };

    // --- Hàm xử lý Đổi Mật Khẩu ---
    const handlePasswordChange = async (values) => {
        if (!admin || !admin.email) {
            // Sử dụng notification thay vì message
            notification.error({ message: 'Lỗi', description: 'Email người dùng không tồn tại.' });
            return;
        }
        // Form validation xử lý khớp mật khẩu, không cần message ở đây

        setLoadingPassword(true);
        try {
            const payload = {
                email: admin.email,
                oldPassword: values.currentPassword,
                newPassword: values.newPassword
            };
            await apiService.changePassword(payload);
            // Sử dụng notification thay vì message
            showSuccessNotification('Đổi mật khẩu thành công!');
            setIsPasswordModalVisible(false);
        } catch (error) {
             // Sử dụng notification thay vì message
            showErrorNotification(error, 'Đổi mật khẩu thất bại!'); // Hàm helper đã xử lý lỗi mật khẩu sai
        } finally {
            setLoadingPassword(false);
        }
    };

    // --- Hàm xử lý Quên Mật Khẩu - Bước 1: Gửi Email ---
    const handleForgotPasswordEmailSubmit = async (values) => {
        const email = values.forgotEmail;
        setLoadingForgotEmail(true);
        try {
            await apiService.forgetPassword(email);
            setForgotPasswordEmail(email);
            setForgotPasswordStep('reset');
             // Sử dụng notification thay vì message
            showSuccessNotification(`Yêu cầu đặt lại mật khẩu đã được gửi tới ${email}. Vui lòng kiểm tra email.`);
        } catch (error) {
            // Sử dụng notification thay vì message
            // Logic phân tích lỗi đã được chuyển vào showErrorNotification
            showErrorNotification(error, 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
        } finally {
            setLoadingForgotEmail(false);
        }
    };

    // --- Hàm xử lý Quên Mật Khẩu - Bước 2: Reset Password ---
    const handleResetPasswordSubmit = async (values) => {
        if (!forgotPasswordEmail) {
             // Sử dụng notification thay vì message
             notification.error({ message: 'Lỗi', description: 'Không xác định được email để đặt lại mật khẩu.' });
             return;
        }
        // Form validation xử lý khớp mật khẩu, không cần message ở đây

        setLoadingResetPassword(true);
        try {
            const payload = {
                email: forgotPasswordEmail,
                otp: values.otp,
                newPassword: values.newPassword
            };
            await apiService.resetPassword(payload);
            // Sử dụng notification thay vì message
            showSuccessNotification('Đặt lại mật khẩu thành công!');
            handleCancelForgotPassword();
        } catch (error) {
             // Sử dụng notification thay vì message
             showErrorNotification(error, 'Đặt lại mật khẩu thất bại!'); // Hàm helper đã xử lý lỗi OTP
        } finally {
            setLoadingResetPassword(false);
        }
    };


    // --- Hàm Mở/Đóng Modals ---
    const showPasswordModal = () => {
        if (admin) {
            setIsPasswordModalVisible(true);
        } else {
             // Sử dụng notification thay vì message
            notification.warning({
                message: 'Thông tin chưa sẵn sàng',
                description: 'Không thể mở đổi mật khẩu khi chưa tải được thông tin người dùng.'
            });
        }
    };
    const handleCancelPassword = () => {
        setIsPasswordModalVisible(false);
    };

    const showForgotPasswordModal = () => {
        setForgotPasswordStep('email');
        setForgotPasswordEmail('');
        setIsForgotPasswordModalVisible(true);
    };
    const handleCancelForgotPassword = () => {
        setIsForgotPasswordModalVisible(false);
    };


    // --- Phần Render Giao Diện ---

// 1. Loading ban đầu
if (loading) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 160px)' }}>
            <Spin size="large" tip="Đang tải thông tin cá nhân..." />
        </div>
    );
}

// 2. Lỗi không tải được dữ liệu ban đầu
if (!admin) {
    return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
            <Card>
                <Title level={4} type="danger">Không thể tải thông tin người dùng.</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>Vui lòng kiểm tra lại kết nối hoặc liên hệ quản trị viên.</Text>
                <Button type="primary" onClick={fetchAdminData} loading={loading}>Thử lại</Button>
            </Card>
        </div>
    );
}

// 3. Giao diện chính
return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 160px)' }}>
        <Card
             bordered={false}
             style={{ width: '100%', maxWidth: '900px', margin: 'auto' }}
             title={
                 <Space align="center">
                     <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} src={admin.avatarUrl /* Nếu có trường avatar */} />
                     <div style={{ marginLeft: '15px' }}>
                         <Title level={4} style={{ marginBottom: 4 }}>{`${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.username}</Title>
                         {admin.role && <Tag color={admin.role === 'ADMIN' ? 'volcano' : 'geekblue'}>{admin.role}</Tag>}
                     </div>
                 </Space>
             }
             extra={
                <Space>
                   {isEditing ? (
                       <>
                           <Tooltip title="Hủy bỏ">
                               <Button icon={<CloseOutlined />} onClick={toggleEdit} shape="circle" disabled={loadingUpdate}/>
                           </Tooltip>
                           <Tooltip title="Lưu">
                               {/* Trigger form submit */}
                               <Button type="primary" icon={<SaveOutlined />} onClick={() => profileForm.submit()} loading={loadingUpdate} shape="circle"/>
                           </Tooltip>
                       </>
                   ) : (
                        <Tooltip title="Chỉnh sửa thông tin">
                            <Button icon={<EditOutlined />} onClick={toggleEdit} shape="circle" />
                        </Tooltip>
                   )}
                   <Tooltip title="Đổi mật khẩu">
                        <Button icon={<LockOutlined />} onClick={showPasswordModal} shape="circle" type="dashed" />
                   </Tooltip>
                </Space>
            }
        >
            {/* Form sửa inline */}
            <Form form={profileForm} layout="vertical" onFinish={handleProfileUpdateFinish} disabled={loadingUpdate || !isEditing /* Disable cả form khi không edit */}>
                 <Title level={5}>Thông tin cơ bản</Title>
                 <Divider style={{ marginTop: 0, marginBottom: 20 }}/>
                 <Row gutter={24}>
                    {/* Username và Email không cho sửa */}
                    <Col xs={24} md={12}>
                        <ProfileDetailItem label="Username" value={admin.username} isEditing={false}/>
                        <ProfileDetailItem label="Email" value={admin.email} isEditing={false} />
                    </Col>
                    {/* Họ và Tên cho sửa */}
                    <Col xs={24} md={12}>
                         <ProfileDetailItem label="Họ" value={admin.firstName} isEditing={isEditing} name="firstName" rules={[{ required: true, message: 'Vui lòng nhập họ!' }]} />
                         <ProfileDetailItem label="Tên" value={admin.lastName} isEditing={isEditing} name="lastName" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]} />
                    </Col>
                 </Row>

                 <Title level={5} style={{ marginTop: 20}}>Thông tin liên hệ</Title>
                 <Divider style={{ marginTop: 0, marginBottom: 20 }}/>
                 <Row gutter={24}>
                    <Col xs={24} md={12}>
                         <ProfileDetailItem label="Số điện thoại" value={admin.phoneNumber} isEditing={isEditing} name="phoneNumber" rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]} />
                    </Col>
                     <Col xs={24} md={12}>
                         <ProfileDetailItem label="Địa chỉ" value={admin.address} isEditing={isEditing} name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]} inputType="textarea" />
                    </Col>
                 </Row>
                 {/* Nút submit ẩn của form inline, được trigger bởi nút Save ở header */}
                 {/* Không cần nút ẩn này vì đã trigger bằng profileForm.submit() */}
                 {/* <Form.Item style={{ display: 'none' }}> <Button type="primary" htmlType="submit">Submit</Button> </Form.Item> */}
            </Form>

            {/* Link Quên mật khẩu */}
            <div style={{ marginTop: '30px', textAlign:'center' }}>
                 <Button type="link" onClick={showForgotPasswordModal}>
                     Quên mật khẩu?
                 </Button>
            </div>
        </Card>

        {/* --- Modal Đổi mật khẩu --- */}
        <Modal
            title="Đổi mật khẩu"
            open={isPasswordModalVisible}
            onCancel={handleCancelPassword}
            footer={null} // Tự custom footer trong Form.Item
            destroyOnClose // Quan trọng: Reset form state khi đóng
            centered
            maskClosable={!loadingPassword} // Không cho đóng khi đang loading
            keyboard={!loadingPassword}
        >
             <Spin spinning={loadingPassword} tip="Đang xử lý...">
                <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange} style={{marginTop: 20}}>
                     <Form.Item label="Mật khẩu hiện tại" name="currentPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}>
                        <Input.Password visibilityToggle/>
                     </Form.Item>
                     <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu cần ít nhất 6 ký tự!' }
                        ]}
                        hasFeedback // Hiển thị icon valid/invalid
                     >
                        <Input.Password visibilityToggle/>
                     </Form.Item>
                     <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        dependencies={['newPassword']} // Phụ thuộc field 'newPassword'
                        hasFeedback
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                            // Custom validator function
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve(); // Hợp lệ
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!')); // Báo lỗi
                                },
                            })
                        ]}
                     >
                        <Input.Password visibilityToggle/>
                     </Form.Item>
                     <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
                        <Space>
                            <Button onClick={handleCancelPassword} disabled={loadingPassword}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={loadingPassword}>Đổi mật khẩu</Button>
                        </Space>
                     </Form.Item>
                </Form>
             </Spin>
        </Modal>

         {/* --- Modal Quên mật khẩu (2 bước) --- */}
        <Modal
            title={forgotPasswordStep === 'email' ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
            open={isForgotPasswordModalVisible}
            onCancel={handleCancelForgotPassword}
            footer={null} // Tự custom footer
            destroyOnClose // Quan trọng: Reset form state khi đóng
            centered
            maskClosable={!(loadingForgotEmail || loadingResetPassword)} // Không cho đóng khi đang loading
            keyboard={!(loadingForgotEmail || loadingResetPassword)}
        >
            {/* --- Nội dung Bước 1: Nhập Email --- */}
            {forgotPasswordStep === 'email' && (
                 <Spin spinning={loadingForgotEmail} tip="Đang gửi yêu cầu...">
                     <p style={{ marginBottom: 16, marginTop: 8 }}>Nhập địa chỉ email của bạn để nhận hướng dẫn đặt lại mật khẩu.</p>
                    <Form form={forgotPasswordForm} layout="vertical" onFinish={handleForgotPasswordEmailSubmit}>
                          <Form.Item
                            label="Email"
                            name="forgotEmail"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Định dạng email không hợp lệ!' }
                            ]}
                          >
                            <Input placeholder="Nhập email đã đăng ký" />
                          </Form.Item>
                         <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
                            <Space>
                                <Button onClick={handleCancelForgotPassword} disabled={loadingForgotEmail}>Hủy</Button>
                                <Button type="primary" htmlType="submit" loading={loadingForgotEmail}>Gửi yêu cầu</Button>
                            </Space>
                         </Form.Item>
                    </Form>
                 </Spin>
            )}

            {/* --- Nội dung Bước 2: Nhập OTP và Mật khẩu mới --- */}
            {forgotPasswordStep === 'reset' && (
                 <Spin spinning={loadingResetPassword} tip="Đang đặt lại mật khẩu...">
                    <p style={{ marginBottom: 16, marginTop: 8 }}>Một mã OTP đã được gửi đến email <strong>{forgotPasswordEmail}</strong>. Vui lòng nhập mã OTP và mật khẩu mới.</p>
                    <Form form={resetPasswordForm} layout="vertical" onFinish={handleResetPasswordSubmit}>
                        <Form.Item
                            label="Mã OTP (6 chữ số)"
                            name="otp"
                            rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}
                        >
                            <Input placeholder="Nhập mã OTP bạn nhận được" maxLength={6}/>
                        </Form.Item>
                        <Form.Item
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                { min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }
                            ]}
                            hasFeedback
                        >
                            <Input.Password visibilityToggle/>
                        </Form.Item>
                        <Form.Item
                            label="Xác nhận mật khẩu mới"
                            name="confirmPassword"
                            dependencies={['newPassword']}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                })
                            ]}
                        >
                            <Input.Password visibilityToggle/>
                        </Form.Item>
                        <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
                            <Space>
                                <Button onClick={handleCancelForgotPassword} disabled={loadingResetPassword}>Hủy</Button>
                                <Button type="primary" htmlType="submit" loading={loadingResetPassword}> Đặt lại mật khẩu </Button>
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