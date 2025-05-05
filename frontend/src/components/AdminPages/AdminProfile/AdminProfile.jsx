import React, { useEffect, useState, useCallback } from 'react';
import {
    Button, Modal, Input, notification, Spin, Card, Form, Space, Typography, Tag, 
    Avatar, Row, Col, Divider, Tooltip
} from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, LockOutlined } from '@ant-design/icons';
import apiService from '../../../services/api';

const { Text, Title } = Typography;

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

const AdminProfile = () => {
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

    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [forgotPasswordForm] = Form.useForm();
    const [resetPasswordForm] = Form.useForm();

    const showErrorNotification = (error, defaultMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.') => {
        let errorTitle = "Lỗi";
        let errorDescription = defaultMessage;

        if (error.response) {
            errorDescription = error.response.data?.message
                            || error.response.data?.error
                            || error.response.data?.detail
                            || `Lỗi ${error.response.status}: ${error.response.statusText}`;

            if (error.response.status === 400) errorTitle = "Dữ liệu không hợp lệ";
            if (error.response.status === 401) errorTitle = "Lỗi xác thực";
            if (error.response.status === 403) errorTitle = "Không có quyền";
            if (error.response.status === 404) errorTitle = "Không tìm thấy";
            if (error.response.status >= 500) errorTitle = "Lỗi máy chủ";

            if (error.response.data?.message?.toLowerCase().includes('email not found')) {
                errorDescription = "Email bạn nhập không tồn tại trong hệ thống.";
                errorTitle = "Không tìm thấy Email";
            }
            if (error.response.data?.message?.toLowerCase().includes('password incorrect')) {
                errorDescription = "Mật khẩu hiện tại bạn nhập không chính xác.";
                errorTitle = "Sai mật khẩu";
            }
            if (error.response.data?.message?.toLowerCase().includes('otp') || error.response.data?.error?.toLowerCase().includes('otp')) {
                 errorDescription = "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.";
                 errorTitle = "Lỗi OTP";
            }
        } else if (error.request) {
            errorTitle = "Lỗi mạng";
            errorDescription = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.';
        } else {
            errorTitle = "Lỗi xử lý";
            errorDescription = error.message || defaultMessage;
        }

        notification.error({
            message: errorTitle,
            description: errorDescription,
            placement: 'topRight',
            duration: 4.5
        });
    };

    const showSuccessNotification = (description, title = "Thành công") => {
        notification.success({
            message: title,
            description: description,
            placement: 'topRight',
            duration: 3
        });
    };

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
            showErrorNotification(error, 'Không thể tải thông tin cá nhân.');
            setAdmin(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

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

    const toggleEdit = () => {
        if (!admin) return;
        setIsEditing(!isEditing);
    };

    const handleProfileUpdateFinish = async (values) => {
        if (!admin) return;
        setLoadingUpdate(true);
        try {
            const updatePayload = {
                firstName: values.firstName,
                lastName: values.lastName,
                phoneNumber: values.phoneNumber,
                address: values.address,
            };
            await apiService.updateUserInfo(updatePayload);

            const updatedData = { ...admin, ...values };
            setAdmin(updatedData);
            showSuccessNotification('Thông tin cá nhân đã được cập nhật thành công!');
            setIsEditing(false);
        } catch (error) {
            showErrorNotification(error, 'Cập nhật thông tin thất bại!');
        } finally {
            setLoadingUpdate(false);
        }
    };

    const handlePasswordChange = async (values) => {
        if (!admin || !admin.email) {
            notification.error({ message: 'Lỗi dữ liệu', description: 'Không tìm thấy thông tin email người dùng để thực hiện đổi mật khẩu.' });
            return;
        }

        setLoadingPassword(true);
        try {
            const payload = {
                email: admin.email,
                oldPassword: values.currentPassword,
                newPassword: values.newPassword
            };
            await apiService.changePassword(payload);
            showSuccessNotification('Đổi mật khẩu thành công!');
            setIsPasswordModalVisible(false);
        } catch (error) {
            showErrorNotification(error, 'Đổi mật khẩu thất bại!');
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleForgotPasswordEmailSubmit = async (values) => {
        const email = values.forgotEmail;
        setLoadingForgotEmail(true);
        try {
            await apiService.forgetPassword(email);
            setForgotPasswordEmail(email);
            setForgotPasswordStep('reset');
            showSuccessNotification(`Yêu cầu đặt lại mật khẩu đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư đến (và cả spam) để nhận mã OTP.`);
        } catch (error) {
            showErrorNotification(error, 'Gửi yêu cầu thất bại. Vui lòng kiểm tra lại email và thử lại.');
        } finally {
            setLoadingForgotEmail(false);
        }
    };

    const handleResetPasswordSubmit = async (values) => {
        if (!forgotPasswordEmail) {
            notification.error({ message: 'Lỗi', description: 'Không xác định được email để đặt lại mật khẩu. Vui lòng thử lại từ bước trước.' });
            return;
        }

        setLoadingResetPassword(true);
        try {
            const payload = {
                email: forgotPasswordEmail,
                otp: values.otp,
                newPassword: values.newPassword
            };
            await apiService.resetPassword(payload);
            showSuccessNotification('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
            handleCancelForgotPassword();
        } catch (error) {
            showErrorNotification(error, 'Đặt lại mật khẩu thất bại!');
        } finally {
            setLoadingResetPassword(false);
        }
    };

    const showPasswordModal = () => {
        if (admin) {
            setIsPasswordModalVisible(true);
        } else {
            notification.warning({
                message: 'Thông tin chưa sẵn sàng',
                description: 'Không thể mở chức năng đổi mật khẩu khi chưa tải được thông tin người dùng.'
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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 160px)' }}>
                <Spin size="large" tip="Đang tải thông tin cá nhân..." />
            </div>
        );
    }

    if (!admin) {
        return (
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 160px)' }}>
                <Card style={{ textAlign: 'center', maxWidth: 400 }}>
                    <Title level={4} type="danger" style={{ marginBottom: 8 }}>Tải thông tin thất bại</Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>Không thể tải thông tin người dùng. Vui lòng kiểm tra lại kết nối hoặc thử lại sau.</Text>
                    <Button type="primary" onClick={fetchAdminData} loading={loading}>Thử lại</Button>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 160px)' }}>
            <Card
                bordered={false}
                style={{ width: '100%', maxWidth: '900px', margin: 'auto', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                title={
                    <Space align="center" size="middle">
                        <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} src={admin.avatarUrl} />
                        <div>
                            <Title level={4} style={{ marginBottom: 4 }}>
                               {`${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.username}
                            </Title>
                            {admin.role && <Tag color={admin.role === 'ADMIN' ? 'volcano' : 'geekblue'}>{admin.role}</Tag>}
                        </div>
                    </Space>
                }
                extra={
                    <Space>
                        {isEditing ? (
                            <>
                                <Tooltip title="Hủy bỏ thay đổi">
                                    <Button icon={<CloseOutlined />} onClick={toggleEdit} shape="circle" disabled={loadingUpdate} />
                                </Tooltip>
                                <Tooltip title="Lưu thay đổi">
                                    <Button type="primary" icon={<SaveOutlined />} onClick={() => profileForm.submit()} loading={loadingUpdate} shape="circle" />
                                </Tooltip>
                            </>
                        ) : (
                            <Tooltip title="Chỉnh sửa thông tin cá nhân">
                                <Button icon={<EditOutlined />} onClick={toggleEdit} shape="circle" />
                            </Tooltip>
                        )}
                        <Tooltip title="Đổi mật khẩu">
                            <Button icon={<LockOutlined />} onClick={showPasswordModal} shape="circle" type="dashed" />
                        </Tooltip>
                    </Space>
                }
            >
                <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleProfileUpdateFinish}
                    disabled={loadingUpdate || !isEditing}
                >
                    <Title level={5} style={{ color: '#0050b3' }}>Thông tin cơ bản</Title>
                    <Divider style={{ marginTop: 0, marginBottom: 20 }}/>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <ProfileDetailItem label="Username" value={admin.username} isEditing={false} />
                            <ProfileDetailItem label="Email" value={admin.email} isEditing={false} />
                        </Col>
                        <Col xs={24} md={12}>
                            <ProfileDetailItem label="Họ" value={admin.firstName} isEditing={isEditing} name="firstName" rules={[{ required: true, message: 'Vui lòng nhập họ!' }]} />
                            <ProfileDetailItem label="Tên" value={admin.lastName} isEditing={isEditing} name="lastName" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]} />
                        </Col>
                    </Row>

                    <Title level={5} style={{ marginTop: 20, color: '#0050b3' }}>Thông tin liên hệ</Title>
                    <Divider style={{ marginTop: 0, marginBottom: 20 }}/>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <ProfileDetailItem label="Số điện thoại" value={admin.phoneNumber} isEditing={isEditing} name="phoneNumber" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]} />
                        </Col>
                        <Col xs={24} md={12}>
                            <ProfileDetailItem label="Địa chỉ" value={admin.address} isEditing={isEditing} name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]} inputType="textarea" />
                        </Col>
                    </Row>
                </Form>

                <div style={{ marginTop: '30px', textAlign:'center' }}>
                    <Button type="link" onClick={showForgotPasswordModal}>
                        Quên mật khẩu?
                    </Button>
                </div>
            </Card>

            <Modal
                title="Đổi mật khẩu"
                open={isPasswordModalVisible}
                onCancel={handleCancelPassword}
                footer={null}
                destroyOnClose
                centered
                maskClosable={!loadingPassword}
                keyboard={!loadingPassword}
            >
                <Spin spinning={loadingPassword} tip="Đang xử lý...">
                    <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange} style={{ marginTop: 20 }}>
                        <Form.Item label="Mật khẩu hiện tại" name="currentPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}>
                            <Input.Password visibilityToggle placeholder="Nhập mật khẩu đang dùng" />
                        </Form.Item>
                        <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }, { min: 6, message: 'Mật khẩu cần ít nhất 6 ký tự!' }]} hasFeedback>
                            <Input.Password visibilityToggle placeholder="Ít nhất 6 ký tự" />
                        </Form.Item>
                        <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword" dependencies={['newPassword']} hasFeedback rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) { return Promise.resolve(); } return Promise.reject(new Error('Mật khẩu xác nhận không khớp!')); } })]}>
                            <Input.Password visibilityToggle placeholder="Nhập lại mật khẩu mới" />
                        </Form.Item>
                        <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
                            <Space>
                                <Button onClick={handleCancelPassword} disabled={loadingPassword}>Hủy</Button>
                                <Button type="primary" htmlType="submit" loading={loadingPassword}>Đổi mật khẩu</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>

            <Modal
                title={forgotPasswordStep === 'email' ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
                open={isForgotPasswordModalVisible}
                onCancel={handleCancelForgotPassword}
                footer={null}
                destroyOnClose
                centered
                maskClosable={!(loadingForgotEmail || loadingResetPassword)}
                keyboard={!(loadingForgotEmail || loadingResetPassword)}
            >
                {forgotPasswordStep === 'email' && (
                    <Spin spinning={loadingForgotEmail} tip="Đang gửi yêu cầu...">
                        <p style={{ marginBottom: 16, marginTop: 8 }}>Nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi một mã OTP để bạn đặt lại mật khẩu.</p>
                        <Form form={forgotPasswordForm} layout="vertical" onFinish={handleForgotPasswordEmailSubmit}>
                            <Form.Item label="Email" name="forgotEmail" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Định dạng email không hợp lệ!' }]}>
                                <Input placeholder="Nhập email đã đăng ký" />
                            </Form.Item>
                            <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
                                <Space>
                                    <Button onClick={handleCancelForgotPassword} disabled={loadingForgotEmail}>Hủy</Button>
                                    <Button type="primary" htmlType="submit" loading={loadingForgotEmail}>Gửi yêu cầu</Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Spin>
                )}
                {forgotPasswordStep === 'reset' && (
                    <Spin spinning={loadingResetPassword} tip="Đang đặt lại mật khẩu...">
                        <p style={{ marginBottom: 16, marginTop: 8 }}>Một mã OTP đã được gửi đến email <strong>{forgotPasswordEmail}</strong>. Vui lòng nhập mã OTP và mật khẩu mới.</p>
                        <Form form={resetPasswordForm} layout="vertical" onFinish={handleResetPasswordSubmit}>
                            <Form.Item label="Mã OTP (6 chữ số)" name="otp" rules={[{ required: true, message: 'Vui lòng nhập mã OTP bạn nhận được qua email!' }]}>
                                <Input placeholder="Nhập mã OTP" maxLength={6} />
                            </Form.Item>
                            <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }, { min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }]} hasFeedback>
                                <Input.Password visibilityToggle placeholder="Ít nhất 6 ký tự" />
                            </Form.Item>
                            <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword" dependencies={['newPassword']} hasFeedback rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) { return Promise.resolve(); } return Promise.reject(new Error('Mật khẩu xác nhận không khớp!')); } })]}>
                                <Input.Password visibilityToggle placeholder="Nhập lại mật khẩu mới" />
                            </Form.Item>
                            <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
                                <Space>
                                    <Button onClick={handleCancelForgotPassword} disabled={loadingResetPassword}>Hủy</Button>
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