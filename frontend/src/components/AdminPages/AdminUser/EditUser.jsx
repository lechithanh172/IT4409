import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, message, Select, Descriptions, Typography, Spin, Divider, Alert, Tag } from 'antd';
import apiService from '../../../services/api';

const { Title } = Typography;
const { Option } = Select;

const ROLES = ['CUSTOMER', 'ADMIN', 'PRODUCT_MANAGER'];

const EditUser = ({ userData, setModalChild, handleRefresh }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    // **** Sử dụng useWatch để theo dõi giá trị trường 'role' ****
    const selectedRole = Form.useWatch('role', form);

    useEffect(() => {
        if (userData) {
            form.setFieldsValue({ role: userData.role });
        } else {
            form.resetFields(['role']);
        }
    }, [userData, form]);

    const onFinish = async (values) => {
        if (!userData || !userData.userId) {
            message.error("Không có thông tin người dùng (thiếu userId) để cập nhật vai trò.");
            return;
        }
        const originalRole = userData.role;
        const newRole = values.role;

        if (newRole && newRole !== originalRole) {
            setSubmitting(true);
            const roleData = { userId: userData.userId, role: newRole };
            console.log('Dữ liệu gửi cho setUserRole:', roleData);

            try {
                // **** Giả sử bạn có hàm này trong apiService ****
                // await apiService.setUserRole(roleData);
                // **** Thay thế bằng API thật ****
                console.log("(Giả lập) Gọi API setUserRole thành công");
                await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập độ trễ mạng

                message.success(`Đã cập nhật vai trò cho người dùng "${userData.username}" thành "${newRole}" thành công!`);
                handleRefresh();
                setModalChild(null);
            } catch (error) {
                console.error("Lỗi khi cập nhật vai trò người dùng:", error);
                const errorMessage = error.response?.data?.message || error.message || "Cập nhật vai trò thất bại.";
                message.error(errorMessage);
            } finally {
                setSubmitting(false);
            }
        } else {
             message.info('Vai trò không thay đổi.');
             setModalChild(null);
        }
    };

    if (!userData) {
        return ( <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}> <Spin tip="Đang tải thông tin người dùng..." /> </div> );
    }

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} >
            <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}> Chỉnh sửa vai trò người dùng </Title>
            <Descriptions bordered size="small" column={1} style={{ marginBottom: 24 }}>
                 <Descriptions.Item label="ID Người dùng">{userData.userId}</Descriptions.Item>
                 <Descriptions.Item label="Username">{userData.username || 'N/A'}</Descriptions.Item>
                 <Descriptions.Item label="Email">{userData.email || 'N/A'}</Descriptions.Item>
                 <Descriptions.Item label="Họ tên"> {`${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'N/A'} </Descriptions.Item>
                 <Descriptions.Item label="Số điện thoại">{userData.phoneNumber || 'N/A'}</Descriptions.Item>
                 <Descriptions.Item label="Vai trò hiện tại"> <Tag color={userData.role === 'ADMIN' ? 'red' : userData.role === 'PRODUCT_MANAGER' ? 'blue' : 'green'}> {userData.role || 'N/A'} </Tag> </Descriptions.Item>
            </Descriptions>
            <Divider>Thay đổi vai trò</Divider>
            <Form.Item
                 label={<span style={{ fontWeight: 'bold' }}>Chọn vai trò mới</span>}
                 name="role"
                 rules={[{ required: true, message: 'Vui lòng chọn vai trò mới!' }]}
                 initialValue={userData.role}
            >
                <Select placeholder="Chọn vai trò mới" loading={submitting} disabled={submitting} >
                    {ROLES.map(role => ( <Option key={role} value={role}> {role} </Option> ))}
                </Select>
            </Form.Item>

            {/* **** Hiển thị Alert dựa trên selectedRole **** */}
            {selectedRole === 'ADMIN' && userData.role !== 'ADMIN' && (
                 <Alert
                    message="Cảnh báo"
                    description="Bạn đang gán quyền ADMIN cao nhất cho người dùng này. Hãy chắc chắn về hành động của bạn."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                 />
            )}

            <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
                <Space>
                    <Button onClick={() => setModalChild(null)} disabled={submitting}> Hủy </Button>
                    <Button type="primary" htmlType="submit" loading={submitting} >
                        {submitting ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default EditUser;