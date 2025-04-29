// EditUser.jsx
import React, { useEffect } from 'react';
import { Form, Input, Button, Space, message } from 'antd'; // Removed Select as it wasn't used for editable fields
import apiService from '../../../services/api'; // Ensure correct path

const EditUser = ({ userData, setModalChild, handleRefresh }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (userData) {
            // Fields match the hardcoded data keys
            form.setFieldsValue({
                firstName: userData.firstName,
                lastName: userData.lastName,
                phoneNumber: userData.phoneNumber,
                address: userData.address,
            });
        }
    }, [userData, form]);

    const onFinish = async (values) => {
        // Use userId for identification
        if (!userData || !userData.userId) {
            message.error("Không có thông tin user (thiếu userId) để cập nhật.");
            return;
        }
        console.log('Form values for update:', values);
        try {
            // --- Prepare data for API ---
            const updateData = {
                // Editable fields from the form
                firstName: values.firstName,
                lastName: values.lastName,
                phoneNumber: values.phoneNumber,
                address: values.address,
                // *** IMPORTANT: Include userId if API requires it to identify the user ***
                // Most PUT /user/update APIs need the ID either in the URL or body.
                // Assuming it's needed in the body here:
                userId: userData.userId,
                 // username: userData.username // Include username only if API specifically requires it for update
            };
            console.log('Data to send to API (simulated):', updateData);

            // --- Simulate API Call ---
            // await apiService.updateUserInfo(updateData); // Uncomment when using real API

            message.success(`(Giả lập) Cập nhật thông tin cho ${userData.username} (ID: ${userData.userId}) thành công!`);

            // --- Refresh list and close modal ---
            handleRefresh();
            setModalChild(null);

        } catch (error) {
            console.error("Lỗi cập nhật user:", error);
            message.error(error.response?.data?.message || "Cập nhật thông tin thất bại.");
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            // No need for initialValues here as useEffect handles it
        >
            {/* Display username from userData */}
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                Chỉnh sửa thông tin: {userData?.username} (ID: {userData?.userId})
            </h2>

            {/* Form items match the keys in hardcoded data and useEffect */}
            <Form.Item
                label="Họ"
                name="firstName"
                rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Tên"
                name="lastName"
                rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
            >
                <Input.TextArea rows={3} />
            </Form.Item>

            {/* Display non-editable fields from userData */}
            <Form.Item label="Username (Không thể sửa)">
                <Input value={userData?.username} disabled />
            </Form.Item>
             <Form.Item label="Email (Không thể sửa)">
                <Input value={userData?.email} disabled />
            </Form.Item>
             <Form.Item label="Role (Không thể sửa)">
                <Input value={userData?.role} disabled /> {/* Correctly accesses role */}
            </Form.Item>


            <Form.Item style={{ textAlign: 'right', marginTop: '20px' }}>
                <Space>
                    <Button onClick={() => setModalChild(null)}>Hủy</Button>
                    <Button type="primary" htmlType="submit">
                        Cập nhật
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default EditUser;