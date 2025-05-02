// AdminProfile.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    Button, Modal, Input, notification, Spin, Card, Form, Space, Typography, Tag, // <--- Sử dụng notification
    Avatar, Row, Col, Divider, Tooltip
} from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, LockOutlined } from '@ant-design/icons';
// --- Đảm bảo đường dẫn này chính xác trong dự án của bạn ---
import apiService from '../../../services/api'; // <<<--- Đường dẫn tới file gọi API

const { Text, Title } = Typography;

// --- Component con để hiển thị chi tiết Profile ---
// Giúp code gọn gàng hơn, tái sử dụng cấu trúc Row/Col/Form.Item
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
                <Text style={{ fontSize: '16px' }}>{value || 'N/A'}</Text> // Hiển thị N/A nếu giá trị rỗng
            )}
        </Col>
    </Row>
);

// --- Component Chính AdminProfile ---
const AdminProfile = () => {
    // --- State ---
    const [admin, setAdmin] = useState(null); // Thông tin admin
    const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa
    const [loading, setLoading] = useState(true); // Loading fetch dữ liệu ban đầu
    const [loadingUpdate, setLoadingUpdate] = useState(false); // Loading cập nhật profile
    const [loadingPassword, setLoadingPassword] = useState(false); // Loading đổi mật khẩu
    const [loadingForgotEmail, setLoadingForgotEmail] = useState(false); // Loading gửi email quên MK
    const [loadingResetPassword, setLoadingResetPassword] = useState(false); // Loading đặt lại MK bằng OTP
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false); // Hiển thị modal đổi MK
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false); // Hiển thị modal quên MK
    const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // Bước hiện tại của quên MK ('email' hoặc 'reset')
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState(''); // Email đã nhập ở bước quên MK

    // --- Forms ---
    const [profileForm] = Form.useForm(); // Form sửa profile inline
    const [passwordForm] = Form.useForm(); // Form đổi mật khẩu
    const [forgotPasswordForm] = Form.useForm(); // Form quên MK - bước email
    const [resetPasswordForm] = Form.useForm(); // Form quên MK - bước reset

    // --- Hàm Helper cho Notification ---
    // Hàm này giúp chuẩn hóa việc hiển thị lỗi từ API hoặc các lỗi khác
    const showErrorNotification = (error, defaultMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.') => {
        let errorTitle = "Lỗi";
        let errorDescription = defaultMessage;

        // Ưu tiên phân tích lỗi từ response của API
        if (error.response) {
            // Thử lấy message lỗi từ các key phổ biến trong response data
            errorDescription = error.response.data?.message
                            || error.response.data?.error
                            || error.response.data?.detail
                            // Nếu không có, dùng status text từ response
                            || `Lỗi ${error.response.status}: ${error.response.statusText}`;

            // Đặt tiêu đề và mô tả cụ thể hơn dựa trên status code hoặc nội dung message
            if (error.response.status === 400) errorTitle = "Dữ liệu không hợp lệ";
            if (error.response.status === 401) errorTitle = "Lỗi xác thực";
            if (error.response.status === 403) errorTitle = "Không có quyền";
            if (error.response.status === 404) errorTitle = "Không tìm thấy";
            if (error.response.status >= 500) errorTitle = "Lỗi máy chủ";

            // Ghi đè mô tả với thông báo thân thiện hơn nếu nhận diện được lỗi cụ thể
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
            // --> Có thể thêm các điều kiện 'else if' khác để xử lý message lỗi cụ thể từ backend

        } else if (error.request) {
            // Lỗi xảy ra khi request đã gửi đi nhưng không nhận được phản hồi (thường là lỗi mạng)
            errorTitle = "Lỗi mạng";
            errorDescription = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.';
        } else {
            // Lỗi xảy ra trước khi request được gửi (vd: lỗi cấu hình, lỗi logic JS)
            errorTitle = "Lỗi xử lý";
            errorDescription = error.message || defaultMessage; // Lấy message từ đối tượng Error nếu có
        }

        // Hiển thị notification lỗi
        notification.error({
            message: errorTitle,
            description: errorDescription,
            placement: 'topRight', // Vị trí hiển thị
            duration: 4.5 // Thời gian hiển thị (giây), mặc định là 4.5
        });
        // console.error("Chi tiết lỗi (để debug):", error); // Bật lại nếu cần xem log chi tiết
    };

    // Hàm helper hiển thị notification thành công
    const showSuccessNotification = (description, title = "Thành công") => {
        notification.success({
            message: title,
            description: description,
            placement: 'topRight',
            duration: 3 // Thông báo thành công có thể hiển thị ngắn hơn
        });
    };
    // --- Kết thúc Hàm Helper ---

    // --- Hàm Fetch dữ liệu Admin ---
    const fetchAdminData = useCallback(async () => {
        setLoading(true);
        const targetUsername = 'tranducthpt1'; // Hoặc lấy username từ context/state khác
        try {
            const response = await apiService.getUserInfo(targetUsername);
            if (response && response.data) {
                setAdmin(response.data);
                // Thường không cần báo thành công khi chỉ load dữ liệu
            } else {
                // Tạo lỗi để catch xử lý và báo lỗi UI
                throw new Error("API trả về dữ liệu không hợp lệ.");
            }
        } catch (error) {
            // Gọi hàm hiển thị lỗi chung
            showErrorNotification(error, 'Không thể tải thông tin cá nhân.');
            setAdmin(null); // Đặt lại admin để component hiển thị trạng thái lỗi
        } finally {
            setLoading(false); // Luôn tắt loading dù thành công hay thất bại
        }
    }, []); // Dependency rỗng vì hàm không phụ thuộc props/state bên ngoài

    // --- useEffect: Fetch dữ liệu khi component được mount lần đầu ---
    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]); // Chạy fetchAdminData khi component mount

    // --- useEffect: Đồng bộ dữ liệu vào Form khi bật/tắt chế độ sửa hoặc admin thay đổi ---
    useEffect(() => {
        if (isEditing && admin) {
            // Nếu đang sửa và có dữ liệu admin -> đổ dữ liệu vào form
            profileForm.setFieldsValue({
                firstName: admin.firstName,
                lastName: admin.lastName,
                phoneNumber: admin.phoneNumber,
                address: admin.address,
            });
        }
        if (!isEditing) {
            // Nếu tắt chế độ sửa -> reset form để xóa các thay đổi chưa lưu hoặc lỗi validation cũ
            profileForm.resetFields();
        }
    }, [isEditing, admin, profileForm]); // Chạy lại khi các giá trị này thay đổi

    // --- Hàm bật/tắt chế độ Sửa ---
    const toggleEdit = () => {
        if (!admin) return; // Không làm gì nếu chưa có dữ liệu admin
        setIsEditing(!isEditing); // Đảo ngược trạng thái isEditing
    };

    // --- Hàm xử lý Submit Form Cập nhật Profile ---
    const handleProfileUpdateFinish = async (values) => {
        if (!admin) return; // Kiểm tra lại admin data
        setLoadingUpdate(true); // Bật loading
        try {
            // Tạo payload chỉ chứa các trường được phép cập nhật
            const updatePayload = {
                firstName: values.firstName,
                lastName: values.lastName,
                phoneNumber: values.phoneNumber,
                address: values.address,
            };
            // console.log("Updating profile with payload:", updatePayload); // Debug payload
            await apiService.updateUserInfo(updatePayload); // Gọi API cập nhật

            // Cập nhật state cục bộ để UI phản ánh thay đổi ngay lập tức
            const updatedData = { ...admin, ...values };
            setAdmin(updatedData);
            // Gọi hàm hiển thị thành công
            showSuccessNotification('Thông tin cá nhân đã được cập nhật thành công!');
            setIsEditing(false); // Tắt chế độ sửa sau khi thành công
        } catch (error) {
             // Gọi hàm hiển thị lỗi chung
            showErrorNotification(error, 'Cập nhật thông tin thất bại!');
        } finally {
            setLoadingUpdate(false); // Tắt loading
        }
    };

    // --- Hàm xử lý Đổi Mật Khẩu ---
    const handlePasswordChange = async (values) => {
        // Kiểm tra các điều kiện cơ bản trước khi gọi API
        if (!admin || !admin.email) {
            notification.error({ message: 'Lỗi dữ liệu', description: 'Không tìm thấy thông tin email người dùng để thực hiện đổi mật khẩu.' });
            return;
        }
        // Form validation của Ant Design đã kiểm tra khớp mật khẩu (`dependencies` và `validator`)
        // nên không cần kiểm tra lại `values.newPassword !== values.confirmPassword` ở đây

        setLoadingPassword(true);
        try {
            const payload = {
                email: admin.email, // Lấy email từ state admin
                oldPassword: values.currentPassword,
                newPassword: values.newPassword
            };
            // console.log("Changing password with payload:", payload); // Debug payload
            await apiService.changePassword(payload); // Gọi API đổi mật khẩu

            // Gọi hàm hiển thị thành công
            showSuccessNotification('Đổi mật khẩu thành công!');
            setIsPasswordModalVisible(false); // Đóng modal sau khi thành công
            // passwordForm.resetFields(); // Không cần thiết vì Modal có `destroyOnClose`
        } catch (error) {
             // Gọi hàm hiển thị lỗi chung (hàm này đã bao gồm logic xử lý lỗi sai mật khẩu)
            showErrorNotification(error, 'Đổi mật khẩu thất bại!');
        } finally {
            setLoadingPassword(false);
        }
    };

    // --- Hàm xử lý Quên Mật Khẩu - Bước 1: Gửi Email ---
    const handleForgotPasswordEmailSubmit = async (values) => {
        const email = values.forgotEmail; // Lấy email từ form
        setLoadingForgotEmail(true);
        try {
            // console.log("Requesting password reset for email:", email); // Debug email
            await apiService.forgetPassword(email); // Gọi API yêu cầu OTP

            setForgotPasswordEmail(email); // Lưu lại email đã gửi thành công
            setForgotPasswordStep('reset'); // Chuyển sang bước nhập OTP/MK mới
             // Gọi hàm hiển thị thành công
            showSuccessNotification(`Yêu cầu đặt lại mật khẩu đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư đến (và cả spam) để nhận mã OTP.`);
            // forgotPasswordForm.resetFields(); // Không cần thiết vì Modal có `destroyOnClose`
        } catch (error) {
            // Gọi hàm hiển thị lỗi chung (hàm này đã bao gồm logic xử lý email không tồn tại)
            showErrorNotification(error, 'Gửi yêu cầu thất bại. Vui lòng kiểm tra lại email và thử lại.');
        } finally {
            setLoadingForgotEmail(false);
        }
    };

    // --- Hàm xử lý Quên Mật Khẩu - Bước 2: Reset Password bằng OTP ---
    const handleResetPasswordSubmit = async (values) => {
        if (!forgotPasswordEmail) {
             // Lỗi logic nếu không có email (dù ít khi xảy ra)
             notification.error({ message: 'Lỗi', description: 'Không xác định được email để đặt lại mật khẩu. Vui lòng thử lại từ bước trước.' });
             return;
        }
        // Form validation của Ant Design đã kiểm tra khớp mật khẩu mới

        setLoadingResetPassword(true);
        try {
            const payload = {
                email: forgotPasswordEmail, // Email đã lưu từ bước 1
                otp: values.otp,            // OTP từ form
                newPassword: values.newPassword // Mật khẩu mới từ form
            };
            // console.log("Resetting password with payload:", payload); // Debug payload
            await apiService.resetPassword(payload); // Gọi API đặt lại mật khẩu

            // Gọi hàm hiển thị thành công
            showSuccessNotification('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
            handleCancelForgotPassword(); // Đóng modal quên mật khẩu sau khi thành công
            // resetPasswordForm.resetFields(); // Không cần thiết vì Modal có `destroyOnClose`
        } catch (error) {
             // Gọi hàm hiển thị lỗi chung (hàm này đã bao gồm logic xử lý lỗi OTP sai/hết hạn)
             showErrorNotification(error, 'Đặt lại mật khẩu thất bại!');
        } finally {
            setLoadingResetPassword(false);
        }
    };


    // --- Hàm Mở/Đóng Modals ---
    const showPasswordModal = () => {
        if (admin) { // Chỉ mở modal nếu đã có thông tin admin
            setIsPasswordModalVisible(true);
            // Form sẽ tự reset khi modal mở do có `destroyOnClose`
        } else {
             // Thông báo nếu chưa có dữ liệu admin
            notification.warning({
                message: 'Thông tin chưa sẵn sàng',
                description: 'Không thể mở chức năng đổi mật khẩu khi chưa tải được thông tin người dùng.'
            });
        }
    };
    const handleCancelPassword = () => {
        // Chỉ cần đóng modal, `destroyOnClose` sẽ lo việc reset form
        setIsPasswordModalVisible(false);
    };

    const showForgotPasswordModal = () => {
        setForgotPasswordStep('email'); // Luôn bắt đầu ở bước nhập email
        setForgotPasswordEmail('');     // Xóa email cũ đã lưu (nếu có)
        setIsForgotPasswordModalVisible(true); // Mở modal
         // Form sẽ tự reset khi modal mở do có `destroyOnClose`
    };
    const handleCancelForgotPassword = () => {
        // Chỉ cần đóng modal
        setIsForgotPasswordModalVisible(false);
    };


    // --- Phần Render Giao Diện ---

    // 1. Hiển thị trạng thái Loading ban đầu
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 160px)' }}>
                <Spin size="large" tip="Đang tải thông tin cá nhân..." />
            </div>
        );
    }

    // 2. Hiển thị trạng thái Lỗi khi không fetch được dữ liệu ban đầu
    // `admin` sẽ là null nếu fetch lỗi (do `setAdmin(null)` trong catch của fetchAdminData)
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

    // 3. Giao diện chính khi đã có dữ liệu `admin`
    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 160px)' }}>
            {/* Card hiển thị thông tin profile */}
            <Card
                 bordered={false}
                 style={{ width: '100%', maxWidth: '900px', margin: 'auto', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                 title={
                     <Space align="center" size="middle">
                         {/* Avatar người dùng */}
                         <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} src={admin.avatarUrl /* Thay bằng trường avatar thực tế nếu có */} />
                         {/* Tên và Role */}
                         <div>
                             <Title level={4} style={{ marginBottom: 4 }}>
                                {`${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.username} {/* Hiển thị tên đầy đủ, fallback về username */}
                             </Title>
                             {admin.role && <Tag color={admin.role === 'ADMIN' ? 'volcano' : 'geekblue'}>{admin.role}</Tag>}
                         </div>
                     </Space>
                 }
                 extra={ // Các nút action ở góc trên bên phải Card
                    <Space>
                       {isEditing ? ( // Hiển thị nút Hủy/Lưu khi đang sửa
                           <>
                               <Tooltip title="Hủy bỏ thay đổi">
                                   <Button icon={<CloseOutlined />} onClick={toggleEdit} shape="circle" disabled={loadingUpdate}/>
                               </Tooltip>
                               <Tooltip title="Lưu thay đổi">
                                   {/* Nút Lưu sẽ trigger submit của form profileForm */}
                                   <Button type="primary" icon={<SaveOutlined />} onClick={() => profileForm.submit()} loading={loadingUpdate} shape="circle"/>
                               </Tooltip>
                           </>
                       ) : ( // Hiển thị nút Sửa khi đang xem
                            <Tooltip title="Chỉnh sửa thông tin cá nhân">
                                <Button icon={<EditOutlined />} onClick={toggleEdit} shape="circle" />
                            </Tooltip>
                       )}
                       {/* Nút Đổi mật khẩu luôn hiển thị */}
                       <Tooltip title="Đổi mật khẩu">
                            <Button icon={<LockOutlined />} onClick={showPasswordModal} shape="circle" type="dashed" />
                       </Tooltip>
                    </Space>
                }
            >
                {/* Form chứa các thông tin có thể sửa inline */}
                <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleProfileUpdateFinish}
                    // Disable toàn bộ form khi đang loading update hoặc không ở chế độ sửa
                    disabled={loadingUpdate || !isEditing}
                >
                     <Title level={5} style={{ color: '#0050b3' }}>Thông tin cơ bản</Title>
                     <Divider style={{ marginTop: 0, marginBottom: 20 }}/>
                     <Row gutter={24}>
                        {/* Cột hiển thị Username và Email (không cho sửa) */}
                        <Col xs={24} md={12}>
                            <ProfileDetailItem label="Username" value={admin.username} isEditing={false}/>
                            <ProfileDetailItem label="Email" value={admin.email} isEditing={false} />
                        </Col>
                        {/* Cột cho phép sửa Họ và Tên */}
                        <Col xs={24} md={12}>
                             <ProfileDetailItem label="Họ" value={admin.firstName} isEditing={isEditing} name="firstName" rules={[{ required: true, message: 'Vui lòng nhập họ!' }]} />
                             <ProfileDetailItem label="Tên" value={admin.lastName} isEditing={isEditing} name="lastName" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]} />
                        </Col>
                     </Row>

                     <Title level={5} style={{ marginTop: 20, color: '#0050b3' }}>Thông tin liên hệ</Title>
                     <Divider style={{ marginTop: 0, marginBottom: 20 }}/>
                     <Row gutter={24}>
                        {/* Cột cho phép sửa Số điện thoại */}
                        <Col xs={24} md={12}>
                             <ProfileDetailItem label="Số điện thoại" value={admin.phoneNumber} isEditing={isEditing} name="phoneNumber" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]} />
                        </Col>
                        {/* Cột cho phép sửa Địa chỉ */}
                         <Col xs={24} md={12}>
                             <ProfileDetailItem label="Địa chỉ" value={admin.address} isEditing={isEditing} name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]} inputType="textarea" />
                        </Col>
                     </Row>
                     {/* Không cần nút submit ẩn vì đã trigger bằng onClick ở nút Lưu */}
                </Form>

                {/* Link để mở Modal Quên mật khẩu */}
                <div style={{ marginTop: '30px', textAlign:'center' }}>
                     <Button type="link" onClick={showForgotPasswordModal}>
                         Quên mật khẩu?
                     </Button>
                </div>
            </Card>

            {/* --- Modal Đổi mật khẩu --- */}
            <Modal
                title="Đổi mật khẩu"
                open={isPasswordModalVisible} // Trạng thái hiển thị
                onCancel={handleCancelPassword} // Hàm xử lý khi bấm nút X hoặc click ngoài modal
                footer={null} // Tắt footer mặc định, tự custom footer trong Form
                destroyOnClose // Quan trọng: Hủy và reset state của Modal và Form bên trong khi đóng
                centered // Hiển thị modal ở giữa màn hình
                maskClosable={!loadingPassword} // Không cho đóng khi click ngoài nếu đang loading
                keyboard={!loadingPassword} // Không cho đóng bằng Esc nếu đang loading
            >
                 <Spin spinning={loadingPassword} tip="Đang xử lý...">
                    {/* Form đổi mật khẩu */}
                    <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange} style={{marginTop: 20}}>
                         {/* Mật khẩu hiện tại */}
                         <Form.Item
                            label="Mật khẩu hiện tại"
                            name="currentPassword"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                         >
                            <Input.Password visibilityToggle placeholder="Nhập mật khẩu đang dùng"/>
                         </Form.Item>
                         {/* Mật khẩu mới */}
                         <Form.Item
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                { min: 6, message: 'Mật khẩu cần ít nhất 6 ký tự!' }
                                // Có thể thêm rule phức tạp hơn (chữ hoa, số, ký tự đặc biệt) nếu cần
                            ]}
                            hasFeedback // Hiển thị icon check xanh/đỏ khi validate
                         >
                            <Input.Password visibilityToggle placeholder="Ít nhất 6 ký tự"/>
                         </Form.Item>
                         {/* Xác nhận mật khẩu mới */}
                         <Form.Item
                            label="Xác nhận mật khẩu mới"
                            name="confirmPassword"
                            dependencies={['newPassword']} // Field này phụ thuộc vào 'newPassword'
                            hasFeedback
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                                // Validator tùy chỉnh để kiểm tra khớp mật khẩu
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve(); // OK nếu rỗng hoặc khớp
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!')); // Báo lỗi
                                    },
                                })
                            ]}
                         >
                            <Input.Password visibilityToggle placeholder="Nhập lại mật khẩu mới"/>
                         </Form.Item>
                         {/* Nút Hủy và Đổi mật khẩu */}
                         <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
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
                // Tiêu đề thay đổi theo bước
                title={forgotPasswordStep === 'email' ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
                open={isForgotPasswordModalVisible}
                onCancel={handleCancelForgotPassword}
                footer={null} // Tự custom footer
                destroyOnClose // Reset state khi đóng
                centered
                // Không cho đóng khi đang loading ở bất kỳ bước nào
                maskClosable={!(loadingForgotEmail || loadingResetPassword)}
                keyboard={!(loadingForgotEmail || loadingResetPassword)}
            >
                {/* --- Nội dung Bước 1: Nhập Email --- */}
                {forgotPasswordStep === 'email' && (
                     <Spin spinning={loadingForgotEmail} tip="Đang gửi yêu cầu...">
                         <p style={{ marginBottom: 16, marginTop: 8 }}>Nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi một mã OTP để bạn đặt lại mật khẩu.</p>
                        {/* Form nhập email */}
                        <Form form={forgotPasswordForm} layout="vertical" onFinish={handleForgotPasswordEmailSubmit}>
                              <Form.Item
                                label="Email"
                                name="forgotEmail"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Định dạng email không hợp lệ!' } // Rule kiểm tra định dạng email
                                ]}
                              >
                                <Input placeholder="Nhập email đã đăng ký" />
                              </Form.Item>
                             {/* Nút Hủy và Gửi yêu cầu */}
                             <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
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
                        {/* Form nhập OTP và mật khẩu mới */}
                        <Form form={resetPasswordForm} layout="vertical" onFinish={handleResetPasswordSubmit}>
                            {/* Mã OTP */}
                            <Form.Item
                                label="Mã OTP (6 chữ số)"
                                name="otp"
                                rules={[{ required: true, message: 'Vui lòng nhập mã OTP bạn nhận được qua email!' }]}
                            >
                                <Input placeholder="Nhập mã OTP" maxLength={6}/>
                            </Form.Item>
                            {/* Mật khẩu mới */}
                            <Form.Item
                                label="Mật khẩu mới"
                                name="newPassword"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                    { min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }
                                ]}
                                hasFeedback
                            >
                                <Input.Password visibilityToggle placeholder="Ít nhất 6 ký tự"/>
                            </Form.Item>
                            {/* Xác nhận mật khẩu mới */}
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
                                <Input.Password visibilityToggle placeholder="Nhập lại mật khẩu mới"/>
                            </Form.Item>
                            {/* Nút Hủy và Đặt lại mật khẩu */}
                            <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
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