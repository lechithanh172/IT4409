import React, { useEffect } from 'react';
import { Form, Input, Button, Space, message, Select } from 'antd';
import apiService from '../../../services/api'; // Assuming apiService is correctly configured

const ROLES = ['CUSTOMER', 'ADMIN', 'PRODUCT_MANAGER'];

const EditUser = ({ userData, setModalChild, handleRefresh }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        // Only set the role field value when userData is available
        if (userData) {
            form.setFieldsValue({
                role: userData.role,
            });
        }
    }, [userData, form]);

    const onFinish = async (values) => {
        if (!userData || !userData.userId) {
            message.error("Không có thông tin người dùng (thiếu userId) để cập nhật vai trò.");
            return;
        }

        const originalRole = userData.role;
        const newRole = values.role;

        // Check if the role has actually changed
        if (newRole && newRole !== originalRole) {
            const roleData = { userId: userData.userId, role: newRole };
            console.log('Dữ liệu gửi cho setUserRole:', roleData);
            try {
                await apiService.setUserRole(roleData); // Use the provided API function
                message.success(`Đã cập nhật vai trò cho ${userData.username} (ID: ${userData.userId}) thành công!`);
                handleRefresh(); // Refresh the user list in AdminUser
                setModalChild(null); // Close the modal
            } catch (error) {
                console.error("Lỗi khi cập nhật vai trò người dùng:", error);
                const errorMessage = error.response?.data?.message || error.message || "Cập nhật vai trò thất bại.";
                message.error(errorMessage);
                // Keep the modal open on error
            }
        } else {
             message.info('Vai trò không thay đổi, không cần cập nhật.');
             setModalChild(null); // Close the modal as no action was needed
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ role: userData?.role }} // Set initial value for role directly
        >
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                Thay đổi vai trò: {userData?.username} (ID: {userData?.userId})
            </h2>

            {/* Display user info as disabled fields */}
            <Form.Item label="Username">
                <Input value={userData?.username} disabled />
            </Form.Item>
             <Form.Item label="Email">
                <Input value={userData?.email} disabled />
            </Form.Item>
            <Form.Item label="Họ">
                <Input value={userData?.firstName} disabled />
            </Form.Item>
            <Form.Item label="Tên">
                <Input value={userData?.lastName} disabled />
            </Form.Item>
            <Form.Item label="Số điện thoại">
                <Input value={userData?.phoneNumber} disabled />
            </Form.Item>
            <Form.Item label="Địa chỉ">
                <Input.TextArea value={userData?.address} rows={2} disabled />
            </Form.Item>

            {/* Role Selection - The only editable field */}
            <Form.Item label="Vai trò (Role)" name="role" rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}>
                <Select placeholder="Chọn vai trò mới cho người dùng">
                    {ROLES.map(role => (
                        <Select.Option key={role} value={role}>
                            {role}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item style={{ textAlign: 'right', marginTop: '20px' }}>
                <Space>
                    <Button onClick={() => setModalChild(null)}>Hủy</Button>
                    <Button type="primary" htmlType="submit"> Cập nhật vai trò </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default EditUser;