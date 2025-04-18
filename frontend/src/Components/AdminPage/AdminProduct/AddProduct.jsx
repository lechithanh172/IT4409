import React, { useState } from 'react';
import { Button, Form, Input, InputNumber, Space, Row, Col, Divider, message, Upload, Image } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import apiService from '../../../api/api';

const AddProduct = ({ setModalChild, handleRefresh }) => {
    const [variants, setVariants] = useState([]);
    const [productImage, setProductImage] = useState(null);

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const addVariant = () => {
        setVariants([...variants, { key: Date.now(), color: '', quantity: '', sale: '', image: '' }]);
    };

    const removeVariant = (key) => {
        setVariants(variants.filter((variant) => variant.key !== key));
    };

    const handleVariantChange = (key, field, value) => {
        setVariants(variants.map((variant) => (variant.key === key ? { ...variant, [field]: value } : variant)));
    };

    const onFinish = async (values) => {
        try {
            console.log('Form Values:', values);
            console.log('Variants:', variants);

            // Kiểm tra và tạo dữ liệu chính xác
            const data = {
                name: values.name || '', // Đảm bảo giá trị không undefined/null
                category: values.category || '',
                brand: {
                    name: values.brand?.name || '',
                    image: values.brand?.image || '', // Đảm bảo có hình ảnh cho thương hiệu
                },
                description: values.description ? values.description.split('\n') : [], // Kiểm tra null/undefined
                specifications: values.specifications ? values.specifications.split('\n') : [],
                price: values.price || 0,
                variants: [],
            };

            // Xử lý variants
            if (Array.isArray(variants)) {
                variants.forEach((variant) => {
                    data.variants.push({
                        color: variant.color || 'default',
                        quantity: variant.quantity || 0,
                        sale: variant.sale || 0,
                        image: variant.image || '',
                    });
                });
            } else {
                console.warn('Variants không phải là một mảng hợp lệ');
            }

            console.log('Data to send:', data);

            // Gọi API để thêm sản phẩm mới
            await apiService.createProduct(data);
            message.success('Sản phẩm được thêm thành công!');
            handleRefresh();
            setModalChild(null);
        } catch (e) {
            message.error(e.message || 'Đã xảy ra lỗi khi thêm sản phẩm');
        }
    };

    return (
        <div style={{ width: 1200 }}>
            <h2 style={{ marginTop: 0, marginBottom: 10, textAlign: 'center', fontSize: '24px' }}>Thêm Sản Phẩm</h2>

            <Form
                name="themSanPham"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Tên"
                            name="name"
                            rules={[{ required: true, message: 'Hãy nhập tên sản phẩm!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Loại"
                            name="category"
                            rules={[{ required: true, message: 'Hãy nhập loại hàng hóa!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item label="Nhà sản xuất">
                            <Row justify="center">
                                <Col span={16}>
                                    <Form.Item
                                        label="Tên"
                                        name={['brand', 'name']}
                                        required
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Hãy nhập tên hãng sản xuất!',
                                            },
                                        ]}
                                        labelCol={{ span: 4 }}
                                        wrapperCol={{ span: 20 }}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="Url ảnh"
                                        name={['brand', 'image']}
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 20 }}
                                        style={{
                                            marginBottom: 0,
                                        }}
                                    >
                                        <Input
                                            onChange={(e) => {
                                                setProductImage(e.target.value);
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col
                                    span={8}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {productImage && (
                                        <Image
                                            height={100}
                                            width={100}
                                            style={{
                                                objectFit: 'contain',
                                                borderRadius: '10px',
                                                border: '1px solid #ccc',
                                            }}
                                            src={productImage}
                                            fallback="data:image/png;base64,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"
                                        />
                                    )}
                                </Col>
                            </Row>
                        </Form.Item>
                        <Form.Item
                            label="Thông tin"
                            name="description"
                            rules={[{ required: true, message: 'Hãy nhập thông tin sản phẩm!' }]}
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>
                        <Form.Item
                            label="Giá"
                            name="price"
                            wrapperCol={{ span: 12 }}
                            rules={[{ required: true, message: 'Hãy nhập giá sản phẩm!' }]}
                        >
                            <InputNumber
                                min={0}
                                addonAfter="VNĐ"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12} style={{ paddingLeft: 10 }}>
                        <h3 style={{ margin: 0, textAlign: 'center' }}>Biến thể</h3>
                        {variants.map((variant) => (
                            <div key={variant.key} style={{ marginBottom: 8 }}>
                                <Divider style={{ margin: 10 }} />
                                <Row>
                                    <Col span={17}>
                                        <Form.Item
                                            label="Màu sắc"
                                            required
                                            labelCol={{ span: 6 }}
                                            wrapperCol={{ span: 17 }}
                                        >
                                            <Input
                                                placeholder="Màu sắc"
                                                value={variant.color}
                                                onChange={(e) =>
                                                    handleVariantChange(variant.key, 'color', e.target.value)
                                                }
                                            />
                                        </Form.Item>
                                        <Form.Item label="Url ảnh" labelCol={{ span: 6 }} wrapperCol={{ span: 17 }}>
                                            <Input
                                                value={variant.image}
                                                onChange={(e) => {
                                                    handleVariantChange(variant.key, 'image', e.target.value);
                                                }}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Số lượng"
                                            labelCol={{ span: 6 }}
                                            rules={[{ required: true, message: 'Hãy nhập số lượng!' }]}
                                        >
                                            <InputNumber
                                                min={0}
                                                value={variant.quantity}
                                                onChange={(value) =>
                                                    handleVariantChange(variant.key, 'quantity', value)
                                                }
                                            />
                                        </Form.Item>
                                        <Form.Item label="Giảm giá" labelCol={{ span: 6 }} style={{ marginBottom: 0 }}>
                                            <InputNumber
                                                min={0}
                                                addonAfter="%"
                                                value={variant.sale}
                                                onChange={(value) => handleVariantChange(variant.key, 'sale', value)}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={5}>
                                        {variant.image && (
                                            <Image
                                                height={100}
                                                width={100}
                                                src={variant.image}
                                                style={{
                                                    objectFit: 'contain',
                                                    borderRadius: '10px',
                                                    border: '1px solid #ccc',
                                                }}
                                                fallback="data:image/png;base64,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"
                                            />
                                        )}
                                    </Col>
                                    <Col span={2} style={{ display: 'flex', alignItems: 'center' }}>
                                        <Button
                                            type="dashed"
                                            onClick={() => removeVariant(variant.key)}
                                            icon={<MinusCircleOutlined />}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        ))}

                        <Button
                            type="dashed"
                            onClick={addVariant}
                            icon={<PlusOutlined />}
                            style={{ width: '100%', marginBottom: 20 }}
                        >
                            Thêm biến thể
                        </Button>
                    </Col>
                </Row>
                <Form.Item
                    wrapperCol={{
                        offset: 21,
                        span: 3,
                    }}
                    style={{ marginBottom: 0 }}
                >
                    <Space>
                        <Button type="primary" htmlType="submit">
                            OK
                        </Button>
                        <Button type="default" onClick={() => setModalChild(null)}>
                            Cancel
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default AddProduct;
