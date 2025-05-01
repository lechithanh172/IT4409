import React, { useEffect } from 'react';
import { Form, Input, Button, Space, message, Select } from 'antd';
import apiService from '../../../services/api';

const ROLES = ['CUSTOMER', 'ADMIN', 'PRODUCT_MANAGER'];

const EditUser = ({ userData, setModalChild, handleRefresh }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (userData) {
            form.setFieldsValue({
                firstName: userData.firstName,
                lastName: userData.lastName,
                phoneNumber: userData.phoneNumber,
                address: userData.address,
                role: userData.role,
            });
        }
    }, [userData, form]);

    const onFinish = async (values) => {
        if (!userData || !userData.userId) {
            message.error("Không có thông tin người dùng (thiếu userId) để cập nhật.");
            return;
        }

        const originalRole = userData.role;
        const newRole = values.role;

        let updateInfoSuccess = false;
        let setRoleSuccess = false;
        let updateInfoCalled = false;
        let setRoleCalled = false;

        // Chuẩn bị dữ liệu cập nhật thông tin cơ bản
        const basicInfoData = {
            firstName: values.firstName,
            lastName: values.lastName,
            phoneNumber: values.phoneNumber,
            address: values.address,
        };
        updateInfoCalled = true; // Luôn gọi API cập nhật thông tin cơ bản
        console.log('Dữ liệu gửi cho updateUserInfo:', basicInfoData);

        // Kiểm tra và chuẩn bị dữ liệu cập nhật Role
        if (newRole && newRole !== originalRole) {
            setRoleCalled = true;
            console.log('Dữ liệu gửi cho setUserRole:', { userId: userData.userId, role: newRole });
        } else {
             console.log('Vai trò không thay đổi.');
        }

        // Thực hiện các cuộc gọi API
        try {
            const apiCalls = [];

            if (updateInfoCalled) {
                 apiCalls.push(apiService.updateUserInfo(basicInfoData));
            }
            if (setRoleCalled) {
                 const roleData = { userId: userData.userId, role: newRole };
                 apiCalls.push(apiService.setUserRole(roleData));
            }

            if (apiCalls.length > 0) {
                 console.log(`Chuẩn bị thực hiện ${apiCalls.length} cuộc gọi API.`);
                 const results = await Promise.all(apiCalls);
                 console.log('Kết quả API calls:', results);

                 // Đánh dấu thành công dựa trên việc không có lỗi nào được throw
                 updateInfoSuccess = updateInfoCalled;
                 setRoleSuccess = setRoleCalled;

                 message.success(`Cập nhật thông tin cho ${userData.username} (ID: ${userData.userId}) thành công!`);
                 handleRefresh();
                 setModalChild(null);
            } else {
                 message.info('Không có thay đổi nào cần cập nhật.');
                 setModalChild(null);
            }

        } catch (error) {
            console.error("Lỗi khi cập nhật người dùng:", error);
            // Cố gắng xác định lỗi từ API nào nếu có thể (phụ thuộc vào cách Promise.all báo lỗi)
            const errorMessage = error.response?.data?.message || error.message || "Cập nhật thông tin thất bại.";
            message.error(errorMessage);
            // Không đóng modal khi có lỗi để người dùng có thể sửa lại
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
        >
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                Chỉnh sửa thông tin: {userData?.username} (ID: {userData?.userId})
            </h2>

            <Form.Item label="Họ" name="firstName" rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Tên" name="lastName" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Số điện thoại" name="phoneNumber" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
                <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Vai trò (Role)" name="role" rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}>
                <Select placeholder="Chọn vai trò cho người dùng">
                    {ROLES.map(role => ( <Select.Option key={role} value={role}>{role}</Select.Option> ))}
                </Select>
            </Form.Item>
            <Form.Item label="Username (Không thể sửa)">
                <Input value={userData?.username} disabled />
            </Form.Item>
            <Form.Item label="Email (Không thể sửa)">
                <Input value={userData?.email} disabled />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right', marginTop: '20px' }}>
                <Space>
                    <Button onClick={() => setModalChild(null)}>Hủy</Button>
                    <Button type="primary" htmlType="submit"> Cập nhật </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default EditUser;