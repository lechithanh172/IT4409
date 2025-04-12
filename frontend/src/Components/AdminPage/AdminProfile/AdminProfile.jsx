import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal, Input, message, Spin, Card } from 'antd';
import apiService from '../../../api/api';

const AdminProfile = () => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [updatedAdmin, setUpdatedAdmin] = useState({});
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');

                if (!token) {
                    message.error('Bạn cần phải đăng nhập!');
                    return;
                }

                const response = await apiService.getAdminProfile();
                console.log(response.data.admin);
                setAdmin(response.data.admin);
                setUpdatedAdmin(response.data.admin); // Để sử dụng cho form cập nhật
            } catch (error) {
                console.error(error);
                message.error('Không thể lấy thông tin admin');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            if (!token) {
                message.error('Bạn cần phải đăng nhập!');
                return;
            }

            const response = await apiService.updateAdminProfile(updatedAdmin);
            console.log(response.data.message);
            setAdmin(response.data.admin);
            message.success('Cập nhật thông tin thành công!');
            setIsUpdateModalVisible(false);
        } catch (error) {
            console.error(error);
            message.error('Cập nhật thông tin thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            message.error('Mật khẩu mới và xác nhận không khớp!');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            if (!token) {
                message.error('Bạn cần phải đăng nhập!');
                return;
            }

            const response = await apiService.changeAdminPassword(passwords);

            message.success(response.data.message || 'Đổi mật khẩu thành công!');
            setIsPasswordModalVisible(false);
        } catch (error) {
            console.error(error);
            message.error('Đổi mật khẩu thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const showUpdateModal = () => {
        setIsUpdateModalVisible(true);
    };

    const showPasswordModal = () => {
        setIsPasswordModalVisible(true);
    };

    const handleCancelUpdate = () => {
        setIsUpdateModalVisible(false);
        setUpdatedAdmin(admin); // Reset dữ liệu nếu hủy
    };

    const handleCancelPassword = () => {
        setIsPasswordModalVisible(false);
        setPasswords({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
    };

    const handleChange = (field, value) => {
        setUpdatedAdmin((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            {loading ? (
                <Spin size="large" />
            ) : (
                <Card
                    title={<div style={{ fontWeight: 'bold', fontSize: '24px' }}>Thông tin admin</div>}
                    extra={
                        <>
                            <Button onClick={showUpdateModal} style={{ marginRight: '10px' }}>
                                Cập nhật thông tin
                            </Button>
                            <Button onClick={showPasswordModal}>Đổi mật khẩu</Button>
                        </>
                    }
                    style={{ width: '70%', margin: 'auto', height: '90%' }}
                >
                    <p>
                        <strong>Tên:</strong> {admin?.userName || 'Chưa có thông tin'}
                    </p>
                    <p>
                        <strong>Số điện thoại:</strong> {admin?.phoneNumber || 'Chưa có thông tin'}
                    </p>
                    <p>
                        <strong>Địa chỉ:</strong> {admin?.diaChi || 'Chưa có thông tin'}
                    </p>
                </Card>
            )}

            {/* Modal Cập nhật thông tin */}
            <Modal
                title={
                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>Cập nhật thông tin</div>
                }
                visible={isUpdateModalVisible}
                onOk={handleUpdate}
                onCancel={handleCancelUpdate}
                confirmLoading={loading}
            >
                <div style={{ marginBottom: '10px' }}>
                    <label>Tên: </label>
                    <Input
                        value={updatedAdmin.userName || ''}
                        onChange={(e) => handleChange('userName', e.target.value)}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Số điện thoại: </label>
                    <Input
                        value={updatedAdmin.phoneNumber || ''}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Địa chỉ: </label>
                    <Input value={updatedAdmin.diaChi || ''} onChange={(e) => handleChange('diaChi', e.target.value)} />
                </div>
            </Modal>

            {/* Modal Đổi mật khẩu */}
            <Modal
                title={<div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>Đổi mật khẩu</div>}
                visible={isPasswordModalVisible}
                onOk={handlePasswordChange}
                onCancel={handleCancelPassword}
                confirmLoading={loading}
            >
                <div style={{ marginBottom: '10px' }}>
                    <label>Mật khẩu hiện tại: </label>
                    <Input.Password
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Mật khẩu mới: </label>
                    <Input.Password
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Xác nhận mật khẩu mới: </label>
                    <Input.Password
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default AdminProfile;
