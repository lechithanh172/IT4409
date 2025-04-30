// AdminProfile.jsx
import React, { useEffect, useState, useCallback } from 'react';
// --- Import các component từ Ant Design ---
import {
    Button, Modal, Input, message, Spin, Card, Form, Space, Typography, Tag,
    Avatar, Row, Col, Divider, Tooltip // Thêm Avatar, Row, Col, Divider, Tooltip
} from 'antd';
// --- Import các icon ---
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, LockOutlined } from '@ant-design/icons'; // Thêm các icon cần thiết
import apiService from '../../../services/api'; // Đảm bảo đường dẫn đúng

const { Text, Title, Paragraph } = Typography; // Thêm Title, Paragraph

// --- Dữ liệu cứng (Hardcoded Data) chính xác ---
const hardcodedAdmin = {
    "userId": 3, "username": "ductran", "password": "$2a$10$...", "email": "tranduct1k29@gmail.com", "firstName": "Rô", "lastName": "Nan Đô", "phoneNumber": "0911919191", "address": "Cầu Giấy", "role": "ADMIN", /* ... các trường khác nếu có ... */
};
// --------------------------

// --- Component con để hiển thị chi tiết Profile (tái sử dụng) ---
// Component này nhận các props để hiển thị label, value và quyết định hiển thị text hay input (cho chế độ sửa)
const ProfileDetailItem = ({ label, value, isEditing, name, rules, inputType = 'input', form }) => (
     <Row gutter={[8, 8]} align="middle" style={{ marginBottom: 12 }}> {/* Row chứa label và value */}
        <Col xs={24} sm={6} style={{ textAlign: 'right', paddingRight: '10px' }}> {/* Cột cho label, căn phải */}
            <Text strong type="secondary">{label}:</Text> {/* Nhãn, màu xám nhẹ */}
        </Col>
        <Col xs={24} sm={18}> {/* Cột cho giá trị hoặc input */}
            {isEditing ? ( // Nếu đang ở chế độ sửa
                // Hiển thị Form.Item để nhập liệu
                <Form.Item name={name} rules={rules} noStyle style={{ marginBottom: 0 }}>
                    {/* Chọn loại input: TextArea cho địa chỉ, Input thường cho các trường khác */}
                    {inputType === 'textarea' ? <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} /> : <Input />}
                </Form.Item>
            ) : ( // Nếu không ở chế độ sửa
                // Hiển thị Text thông thường
                <Text style={{ fontSize: '16px' }}>{value || 'N/A'}</Text> // Hiển thị 'N/A' nếu giá trị rỗng
            )}
        </Col>
    </Row>
);

// --- Component Chính AdminProfile ---
const AdminProfile = () => {
    // --- Khai báo State ---
    const [admin, setAdmin] = useState(hardcodedAdmin); // State lưu thông tin admin, khởi tạo với dữ liệu cứng
    const [isEditing, setIsEditing] = useState(false); // State quản lý chế độ sửa inline
    const [loading, setLoading] = useState(false); // State loading chung (nếu cần fetch dữ liệu ban đầu)
    const [loadingUpdate, setLoadingUpdate] = useState(false); // State loading khi cập nhật thông tin profile
    const [loadingPassword, setLoadingPassword] = useState(false); // State loading khi đổi mật khẩu
    const [loadingForgotEmail, setLoadingForgotEmail] = useState(false); // State loading cho bước 1 quên mật khẩu
    const [loadingResetPassword, setLoadingResetPassword] = useState(false); // State loading cho bước 2 quên mật khẩu

    // State quản lý hiển thị các Modal
    // const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false); // Không cần modal riêng cho cập nhật info nữa
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false); // Hiển thị modal đổi mật khẩu
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false); // Hiển thị modal quên mật khẩu

    // State cho quy trình Quên Mật Khẩu
    const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // Bước hiện tại ('email' hoặc 'reset')
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState(''); // Lưu email đã nhập ở bước 1

    // Khởi tạo các Form Instance của Ant Design
    const [profileForm] = Form.useForm(); // Form cho sửa thông tin inline
    const [passwordForm] = Form.useForm(); // Form đổi mật khẩu
    const [forgotPasswordForm] = Form.useForm(); // Form bước 1 quên mật khẩu
    const [resetPasswordForm] = Form.useForm(); // Form bước 2 quên mật khẩu

    // --- useEffect để đồng bộ Form với State khi bật chế độ Edit ---
    useEffect(() => {
        // Chỉ chạy khi isEditing là true và có dữ liệu admin
        if (isEditing && admin) {
             // Đặt giá trị cho các trường trong form dựa trên state admin hiện tại
             profileForm.setFieldsValue({
                 firstName: admin.firstName,
                 lastName: admin.lastName,
                 phoneNumber: admin.phoneNumber,
                 address: admin.address,
             });
        }
    }, [isEditing, admin, profileForm]); // Dependency: chạy lại khi isEditing, admin, hoặc profileForm thay đổi

    // --- Hàm bật/tắt chế độ Sửa Inline ---
    const toggleEdit = () => {
        if (isEditing) { // Nếu đang tắt chế độ sửa
            profileForm.resetFields(); // Reset các thay đổi chưa lưu trong form
        }
        setIsEditing(!isEditing); // Đảo ngược trạng thái isEditing
    };

    // --- Hàm xử lý Submit Form Cập nhật Profile (Inline) ---
     const handleProfileUpdateFinish = async (values) => {
        console.log('Đang cập nhật profile với giá trị inline:', values);
        setLoadingUpdate(true); // Bật loading
        try {
            // Chuẩn bị dữ liệu gửi đi theo yêu cầu API (firstName, lastName, phoneNumber, address)
            const updatePayload = { ...values };
            console.log("Payload để cập nhật:", updatePayload);

            // --- Phần gọi API thật (Đang comment) ---
            // await apiService.updateUserInfo(updatePayload);
            // Giả lập độ trễ mạng
            await new Promise(resolve => setTimeout(resolve, 500));

            // Cập nhật state cục bộ sau khi gọi API thành công (hoặc giả lập thành công)
            const updatedData = { ...admin, ...values }; // Merge dữ liệu mới vào state admin
            setAdmin(updatedData);
            message.success('Thông tin cá nhân đã được cập nhật!'); // Thông báo thành công
            setIsEditing(false); // Tắt chế độ sửa sau khi thành công

        } catch (error) { // Xử lý lỗi
            console.error("Lỗi cập nhật profile:", error);
            message.error(error.response?.data?.message || 'Cập nhật thông tin thất bại!'); // Hiển thị lỗi
        } finally {
            setLoadingUpdate(false); // Tắt loading
        }
    };

    // --- Hàm xử lý Đổi Mật Khẩu (Giữ nguyên logic) ---
    const handlePasswordChange = async (values) => {
        console.log('Đang đổi mật khẩu với giá trị:', values);
        if (values.newPassword !== values.confirmPassword) { message.error('Mật khẩu mới và xác nhận không khớp!'); return; }
        setLoadingPassword(true);
        try {
            const payload = { email: admin.email, oldPassword: values.currentPassword, newPassword: values.newPassword };
            console.log("Payload đổi mật khẩu:", payload);
            // --- Gọi API Thật (Đang comment) ---
            // await apiService.changePassword(payload);
            await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập
            message.success('Đổi mật khẩu thành công!');
            setIsPasswordModalVisible(false);
            passwordForm.resetFields();
        } catch (error) { console.error("Lỗi đổi mật khẩu:", error); message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại!');
        } finally { setLoadingPassword(false); }
    };

    // --- Hàm xử lý Quên Mật Khẩu - Bước 1: Gửi Email (Giữ nguyên logic) ---
    const handleForgotPasswordEmailSubmit = async (values) => {
        const email = values.forgotEmail;
        console.log('Yêu cầu quên mật khẩu cho email:', email);
        setLoadingForgotEmail(true);
        try {
            // --- Gọi API Thật (Đang comment) ---
            // await apiService.forgetPassword(email);
            await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập
            setForgotPasswordEmail(email); // Lưu email
            setForgotPasswordStep('reset'); // Chuyển sang bước reset
            forgotPasswordForm.resetFields(); // Xóa form email
            message.success(`Yêu cầu đặt lại mật khẩu đã được gửi tới ${email}. Vui lòng kiểm tra email hoặc nhập mật khẩu mới bên dưới.`);
        } catch (error) { console.error("Lỗi quên mật khẩu (bước 1):", error); message.error(error.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
        } finally { setLoadingForgotEmail(false); }
    };

    // --- Hàm xử lý Quên Mật Khẩu - Bước 2: Đặt lại Mật khẩu (Giữ nguyên logic) ---
    const handleResetPasswordSubmit = async (values) => {
         console.log('Đang đặt lại mật khẩu cho email:', forgotPasswordEmail);
         console.log('Giá trị mật khẩu mới:', values);
        if (values.newPassword !== values.confirmPassword) { message.error('Mật khẩu mới và xác nhận không khớp!'); return; }
        setLoadingResetPassword(true);
        try {
            // **** QUAN TRỌNG: Kiểm tra API của bạn có cần 'token' không ****
            const payload = { /* token: values.token, */ email: forgotPasswordEmail, newPassword: values.newPassword };
             console.log("Payload đặt lại mật khẩu:", payload);
            // --- Gọi API Thật (Đang comment) ---
            // await apiService.resetPassword(payload);
             await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập
            message.success('Đặt lại mật khẩu thành công!');
            handleCancelForgotPassword(); // Đóng modal và reset
        } catch (error) { console.error("Lỗi đặt lại mật khẩu (bước 2):", error); message.error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại.');
        } finally { setLoadingResetPassword(false); }
    };


    // --- Hàm Mở/Đóng Modals ---
    const showPasswordModal = () => setIsPasswordModalVisible(true);
    const showForgotPasswordModal = () => {
        // Reset trạng thái của quy trình quên mật khẩu trước khi mở
        setForgotPasswordStep('email');
        setForgotPasswordEmail('');
        forgotPasswordForm.resetFields();
        resetPasswordForm.resetFields();
        setIsForgotPasswordModalVisible(true);
    };
    // const handleCancelUpdate = () => setIsUpdateModalVisible(false); // Không cần nữa
    const handleCancelPassword = () => { // Xử lý đóng modal đổi mật khẩu
        setIsPasswordModalVisible(false);
        passwordForm.resetFields(); // Reset form khi đóng
    };
    const handleCancelForgotPassword = () => { // Xử lý đóng modal quên mật khẩu (ở cả 2 bước)
        setIsForgotPasswordModalVisible(false);
        // Reset lại state của quy trình quên mật khẩu
        setForgotPasswordStep('email');
        setForgotPasswordEmail('');
        forgotPasswordForm.resetFields();
        resetPasswordForm.resetFields();
    };


    // --- Phần Render Giao Diện ---
    if (loading) { /* ... hiển thị spinner loading ... */ } // Nếu đang fetch dữ liệu ban đầu
    if (!admin) { /* ... hiển thị thông báo lỗi ... */ } // Nếu không có dữ liệu admin

    return (
        // Container chính của trang profile
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 160px)' }}>
            {/* Card chứa thông tin và các nút hành động */}
            <Card
                 bordered={false} // Không có viền
                 style={{ width: '100%', maxWidth: '900px', margin: 'auto' }} // Giới hạn chiều rộng, căn giữa
                 // --- Phần Header của Card ---
                 title={ // Hiển thị Avatar, Tên và Role
                     <Space align="center"> {/* Căn các item theo chiều dọc */}
                         <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} /> {/* Avatar người dùng */}
                         <div style={{ marginLeft: '15px', marginBottom: 10 }}>
                             {/* Tên Admin (Họ + Tên hoặc Username) */}
                             <Title level={4} style={{ marginBottom: 0 }}>{`${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.username}</Title>
                             {/* Role Admin */}
                             <Text type="secondary">{admin.role ? <Tag color="volcano">{admin.role}</Tag> : 'N/A'}</Text>
                         </div>
                     </Space>
                 }
                 extra={ // Các nút hành động ở góc trên phải Card
                     <Space>
                        {isEditing ? ( // Nếu đang ở chế độ sửa
                            <>
                                {/* Nút Hủy bỏ thay đổi */}
                                <Tooltip title="Hủy bỏ thay đổi">
                                     <Button icon={<CloseOutlined />} onClick={toggleEdit} shape="circle" disabled={loadingUpdate}/>
                                </Tooltip>
                                 {/* Nút Lưu thay đổi */}
                                 <Tooltip title="Lưu thay đổi">
                                     <Button type="primary" icon={<SaveOutlined />} onClick={() => profileForm.submit()} loading={loadingUpdate} shape="circle"/>
                                 </Tooltip>
                            </>
                        ) : ( // Nếu đang ở chế độ xem
                             /* Nút bật chế độ Sửa */
                             <Tooltip title="Chỉnh sửa thông tin">
                                 <Button icon={<EditOutlined />} onClick={toggleEdit} shape="circle"/>
                             </Tooltip>
                        )}
                        {/* Nút mở Modal Đổi mật khẩu */}
                        <Tooltip title="Đổi mật khẩu">
                             <Button icon={<LockOutlined />} onClick={showPasswordModal} shape="circle" type="dashed"/>
                        </Tooltip>
                     </Space>
                 }
            >
                {/* --- Form cho phép Sửa Inline --- */}
                {/* Form này luôn tồn tại nhưng các Input chỉ hiện khi isEditing=true */}
                <Form form={profileForm} layout="vertical" onFinish={handleProfileUpdateFinish} disabled={loadingUpdate}>
                     {/* --- Phần Thông tin cơ bản --- */}
                     <Title level={5}>Thông tin cơ bản</Title>
                     <Divider style={{ marginTop: 0, marginBottom: 20 }}/>
                     <Row gutter={24}> {/* Chia layout thành 2 cột */}
                        <Col xs={24} md={12}> {/* Cột trái */}
                            {/* Username và Email thường không cho sửa */}
                            <ProfileDetailItem label="Username" value={admin.username} isEditing={false}/>
                            <ProfileDetailItem label="Email" value={admin.email} isEditing={false} />
                        </Col>
                        <Col xs={24} md={12}> {/* Cột phải */}
                             {/* Họ - hiển thị Input khi isEditing=true */}
                             <ProfileDetailItem label="Họ" value={admin.firstName} isEditing={isEditing} name="firstName" rules={[{ required: true, message: 'Vui lòng nhập họ!' }]} form={profileForm} />
                             {/* Tên - hiển thị Input khi isEditing=true */}
                             <ProfileDetailItem label="Tên" value={admin.lastName} isEditing={isEditing} name="lastName" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]} form={profileForm} />
                        </Col>
                     </Row>

                     {/* --- Phần Thông tin liên hệ --- */}
                     <Title level={5} style={{ marginTop: 20}}>Thông tin liên hệ</Title>
                     <Divider style={{ marginTop: 0, marginBottom: 20 }}/>
                     <Row gutter={24}>
                        <Col xs={24} md={12}>
                             {/* Số điện thoại - hiển thị Input khi isEditing=true */}
                             <ProfileDetailItem label="Số điện thoại" value={admin.phoneNumber} isEditing={isEditing} name="phoneNumber" rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]} form={profileForm} />
                        </Col>
                         <Col xs={24} md={12}>
                             {/* Địa chỉ - hiển thị TextArea khi isEditing=true */}
                             <ProfileDetailItem label="Địa chỉ" value={admin.address} isEditing={isEditing} name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]} inputType="textarea" form={profileForm} />
                        </Col>
                     </Row>
                     {/* Nút Submit ẩn, Form được submit bằng nút SaveOutlined ở header */}
                     <Form.Item style={{ display: 'none' }}> <Button type="primary" htmlType="submit">Submit</Button> </Form.Item>
                </Form>

                {/* --- Liên kết Quên mật khẩu --- */}
                <div style={{ marginTop: '30px', textAlign:'center' }}>
                     <Button type="link" onClick={showForgotPasswordModal}>Quên mật khẩu?</Button>
                </div>
            </Card>

            {/* --- Modal Đổi mật khẩu (Giữ nguyên cấu trúc) --- */}
            <Modal title="Đổi mật khẩu" open={isPasswordModalVisible} onCancel={handleCancelPassword} footer={null} destroyOnClose centered>
                 <Spin spinning={loadingPassword}>
                    <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange}>
                         {/* Các trường nhập mật khẩu */}
                         <Form.Item label="Mật khẩu hiện tại" name="currentPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}><Input.Password /></Form.Item>
                         <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' },{ min: 6, message: 'Mật khẩu cần ít nhất 6 ký tự!' }]} hasFeedback><Input.Password /></Form.Item>
                         <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword" dependencies={['newPassword']} hasFeedback rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) { return Promise.resolve(); } return Promise.reject(new Error('Mật khẩu xác nhận không khớp!')); },})]}><Input.Password /></Form.Item>
                         {/* Nút Hủy và Đổi mật khẩu */}
                         <Form.Item style={{ textAlign: 'right' }}>
                             <Space> <Button onClick={handleCancelPassword}>Hủy</Button> <Button type="primary" htmlType="submit" loading={loadingPassword}>Đổi mật khẩu</Button> </Space>
                         </Form.Item>
                    </Form>
                 </Spin>
            </Modal>

             {/* --- Modal Quên mật khẩu (2 bước - Giữ nguyên cấu trúc) --- */}
            <Modal title={forgotPasswordStep === 'email' ? "Quên mật khẩu" : "Đặt lại mật khẩu"} open={isForgotPasswordModalVisible} onCancel={handleCancelForgotPassword} footer={null} destroyOnClose centered>
                {/* --- Bước 1: Nhập Email --- */}
                {forgotPasswordStep === 'email' && (
                     <Spin spinning={loadingForgotEmail}>
                         <p>Nhập địa chỉ email của bạn để nhận hướng dẫn đặt lại mật khẩu.</p>
                        <Form form={forgotPasswordForm} layout="vertical" onFinish={handleForgotPasswordEmailSubmit}>
                              <Form.Item label="Email" name="forgotEmail" rules={[{ required: true, message: 'Vui lòng nhập email!' },{ type: 'email', message: 'Email không hợp lệ!'}]}><Input placeholder="Nhập email đã đăng ký" /></Form.Item>
                             <Form.Item style={{ textAlign: 'right' }}> <Space> <Button onClick={handleCancelForgotPassword}>Hủy</Button> <Button type="primary" htmlType="submit" loading={loadingForgotEmail}>Gửi yêu cầu</Button> </Space> </Form.Item>
                        </Form>
                     </Spin>
                )}
                {/* --- Bước 2: Nhập Mật khẩu mới --- */}
                {forgotPasswordStep === 'reset' && (
                     <Spin spinning={loadingResetPassword}>
                        <p>Nhập mật khẩu mới cho tài khoản: <strong>{forgotPasswordEmail}</strong></p>
                        {/* --- Tùy chọn: Trường nhập Token --- */}
                        {/* <Form.Item label="Mã xác nhận (từ Email)" name="token" rules={[{ required: true, message: 'Vui lòng nhập mã xác nhận!' }]}><Input /></Form.Item> */}
                        <Form form={resetPasswordForm} layout="vertical" onFinish={handleResetPasswordSubmit}>
                            <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' },{ min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }]} hasFeedback><Input.Password /></Form.Item>
                            <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword" dependencies={['newPassword']} hasFeedback rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) { return Promise.resolve(); } return Promise.reject(new Error('Mật khẩu xác nhận không khớp!')); },})]}><Input.Password /></Form.Item>
                             <Form.Item style={{ textAlign: 'right' }}> <Space> <Button onClick={handleCancelForgotPassword}>Hủy</Button> <Button type="primary" htmlType="submit" loading={loadingResetPassword}>Đặt lại mật khẩu</Button> </Space> </Form.Item>
                        </Form>
                     </Spin>
                )}
            </Modal>
        </div>
    );
};

export default AdminProfile;