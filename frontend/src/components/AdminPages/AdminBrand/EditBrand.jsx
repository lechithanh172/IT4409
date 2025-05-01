import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Row, Col, message, Image } from 'antd';
import apiService from '../../../services/api'; // Đảm bảo đường dẫn đúng

const EditBrand = ({ brand, setModalChild, handleRefresh }) => {
    const [form] = Form.useForm();
    // State cho ảnh xem trước, dùng logoUrl
    const [brandImage, setBrandImage] = useState(brand?.logoUrl || null);

    useEffect(() => {
        // Cập nhật ảnh xem trước và giá trị form khi prop 'brand' thay đổi
        setBrandImage(brand?.logoUrl || null);
        form.setFieldsValue({
            brandName: brand?.brandName || '', // Sử dụng brand.name
            logoUrl: brand?.logoUrl || '', // Sử dụng brand.logoUrl
            // Không có description cho Brand theo API
        });
    }, [brand, form]);


    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
    };

    const onFinish = async (values) => {
        // Kiểm tra thông tin brand đầu vào
        if (!brand || !brand.brandId) {
            message.error('Không tìm thấy thông tin thương hiệu để cập nhật.');
            return;
        }

        // Dữ liệu gửi đi khớp với API updateBrand
        const data = {
            brandId: brand.brandId, // Lấy brandId từ prop
            brandName: values.brandName || '',
            logoUrl: values.logoUrl || '', // Sử dụng logoUrl
        };

        console.log('Sending update data to API:', data);

        // Kiểm tra thay đổi (so sánh với prop 'brand')
        if (data.brandName === brand.brandName &&
            data.logoUrl === brand.logoUrl) {
            message.info('Không có thay đổi nào để cập nhật.');
            setModalChild(null);
            return;
        }

        try {
            // Gọi đúng API updateBrand
            await apiService.updateBrand(data);
            // Sửa thông báo
            message.success('Thương hiệu được cập nhật thành công!');
            handleRefresh();
            setModalChild(null);
        } catch (e) {
             // Sửa thông báo lỗi
             const errorMessage = e.response?.data?.message || e.message || 'Đã xảy ra lỗi khi cập nhật thương hiệu';
             console.error("Update Brand Error:", e.response || e);
             message.error(errorMessage);
        }
    };

    // Cập nhật ảnh xem trước
    const handleImageUrlChange = (e) => {
        setBrandImage(e.target.value);
    };

    // Xử lý nếu không có prop 'brand'
    if (!brand) {
        return <div>Không có dữ liệu thương hiệu để chỉnh sửa.</div>;
    }

    return (
        <div style={{ width: 650, margin: 'auto' }}>
            {/* Sửa tiêu đề */}
            <h2 style={{ marginTop: 0, marginBottom: 20, textAlign: 'center', fontSize: '24px' }}>
                Chỉnh Sửa Thương Hiệu
            </h2>

            <Form
                form={form}
                // Sửa tên form
                name="suaThuongHieu"
                layout="vertical"
                // Đặt giá trị ban đầu khớp với brand prop
                initialValues={{
                    brandName: brand.brandName,
                    logoUrl: brand.logoUrl,
                }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Row gutter={16}>
                    <Col xs={24} sm={16}>
                        <Form.Item
                            // Sửa label và name
                            label="Tên Thương Hiệu"
                            name="brandName"
                            rules={[
                                {
                                    required: true,
                                    // Sửa message
                                    message: 'Hãy nhập tên thương hiệu!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            // Sửa label và name
                            label="Url Logo"
                            name="logoUrl"
                        >
                            <Input onChange={handleImageUrlChange} placeholder="https://example.com/logo.png" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={8}>
                         <Form.Item label="Xem trước logo">
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '140px', height: '140px', border: '1px dashed #d9d9d9', borderRadius: '8px', padding: '5px' }}>
                                {brandImage ? (
                                    <Image
                                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                        src={brandImage}
                                    />
                                ) : (
                                    <span style={{ color: '#bfbfbf' }}>Xem trước</span>
                                )}
                            </div>
                         </Form.Item>
                    </Col>
                </Row>

                {/* Xóa Form.Item của description vì Brand không có */}

                <Form.Item style={{ textAlign: 'right', marginTop: '20px', marginBottom: 0 }}>
                    <Button type="default" onClick={() => setModalChild(null)} style={{ marginRight: 8 }}>
                        Hủy bỏ
                    </Button>
                    {/* Sửa text nút */}
                    <Button type="primary" htmlType="submit">
                        Cập Nhật
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditBrand;