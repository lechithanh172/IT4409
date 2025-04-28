import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Input, InputNumber, Space, Row, Col, message, Image, Select, Divider } from 'antd'; // Đã thêm lại InputNumber nếu cần
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import apiService from '../../../services/api'; // Đảm bảo đường dẫn đúng

const AddProduct = ({ setModalChild, handleRefresh }) => {
    const [form] = Form.useForm();
    const [variants, setVariants] = useState([{ key: Date.now() + '_initial', color: '', quantity: 0, sale: 0, image: '' }]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [brandOptions, setBrandOptions] = useState([]);
    const [isAddingNewBrand, setIsAddingNewBrand] = useState(false);
    const [newBrandImagePreview, setNewBrandImagePreview] = useState(null);

    // Dữ liệu cứng - Nên fetch từ API
    const allBrand = [
        { "brandId": 1, "name": "Apple", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_59.png" },
        { "brandId": 2, "name": "Samsung", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_60.png" },
        { "brandId": 9, "name": "Xiaomi", "logoUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_61.png" },
        // ... add other brands if needed
    ];

    const allCategory = [
        { categoryId: 1, name: "Laptop" }, { categoryId: 2, name: "Tablet" }, { categoryId: 3, name: "Smartphone" },
        { categoryId: 4, name: "Accessory" }, { categoryId: 5, name: "Monitor" }, { categoryId: 6, name: "Printer" },
        { categoryId: 7, name: "Router" }, { categoryId: 8, name: "Speaker" }, { categoryId: 9, name: "Camera" },
        { categoryId: 10, name: "Smartwatch" }
    ];

    const categoryOptions = allCategory.map(cat => ({ value: cat.name, label: cat.name }));

    useEffect(() => {
        const fetchBrand = async () => {
            try {
                // const response = await apiService.getAllBrands();
                // const fetchedBrands = response.data || [];
                const fetchedBrands = allBrand;
                const options = fetchedBrands.map((brand) => ({
                    value: brand.brandId,
                    label: brand.name,
                    image: brand.logoUrl,
                }));
                setBrandOptions(options);
            } catch (error) {
                console.error('Error fetching brands:', error);
                message.error('Không thể tải danh sách thương hiệu.');
            }
        };
        fetchBrand();
    }, []);

    const handleSelectBrandChange = (value) => {
        const selected = brandOptions.find((b) => b.value === value);
        setSelectedBrand(selected || null);
        setIsAddingNewBrand(false);
        form.setFieldsValue({ newBrandName: '', newBrandLogoUrl: '' });
        setNewBrandImagePreview(null);
    };

    const handleShowAddBrandForm = () => {
        setIsAddingNewBrand(true);
        setSelectedBrand(null);
        form.setFieldsValue({ selectedBrandId: null });
    };

    const handleCancelAddBrand = () => {
        setIsAddingNewBrand(false);
        form.setFieldsValue({ newBrandName: '', newBrandLogoUrl: '' });
        setNewBrandImagePreview(null);
    };

    const handleNewBrandImageChange = (e) => {
        setNewBrandImagePreview(e.target.value);
    }

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Vui lòng kiểm tra lại các trường thông tin.');
    };

    const addVariant = () => {
        setVariants([...variants, { key: Date.now() + Math.random(), color: '', quantity: 0, sale: 0, image: '' }]);
    };

    const removeVariant = (keyToRemove) => {
        if (variants.length <= 1) {
            message.warning('Sản phẩm phải có ít nhất một biến thể.');
            return;
        }
        setVariants(variants.filter((variant) => variant.key !== keyToRemove));
    };

    const handleVariantChange = (key, field, value) => {
        setVariants(variants.map((variant) => (variant.key === key ? { ...variant, [field]: value } : variant)));
    };

    const onFinish = async (values) => {
        if (!selectedBrand && !isAddingNewBrand) {
            message.error('Vui lòng chọn thương hiệu hoặc thêm thương hiệu mới!');
            form.validateFields(['selectedBrandId']);
            return;
        }
        if (isAddingNewBrand && !values.newBrandName) {
             message.error('Vui lòng nhập tên cho thương hiệu mới!');
             form.validateFields(['newBrandName']);
             return;
        }

        const invalidVariant = variants.some(v => !v.color || v.quantity === null || v.quantity === undefined || v.quantity < 0);
        if (invalidVariant) {
            message.error('Vui lòng nhập đầy đủ thông tin hợp lệ (Màu sắc, Số lượng >= 0) cho tất cả các biến thể!');
            return;
        }

        try {
            // *** Thêm lại weight vào data object ***
            const data = {
                productName: values.productName || '',
                description: values.description || '',
                // specifications: values.specifications || '', // Giữ lại nếu API cần
                price: values.price === null || values.price === undefined ? 0 : values.price,
                weight: values.weight === null || values.weight === undefined ? 0 : values.weight, // Thêm lại weight
                categoryName: values.categoryName || '',
                brandName: isAddingNewBrand
                           ? values.newBrandName
                           : (selectedBrand ? selectedBrand.label : ''),
                // supportRushOrder: values.supportRushOrder || false, // Giữ lại nếu API cần
                variants: variants.map(variant => ({
                    color: variant.color,
                    imageUrl: variant.image || '',
                    stockQuantity: variant.quantity === null || variant.quantity === undefined ? 0 : variant.quantity,
                    discount: variant.sale === null || variant.sale === undefined ? 0 : variant.sale,
                })),
            };

            console.log('Data to send to API:', data);

            await apiService.addProduct(data); // Gọi API addProduct
            message.success('Sản phẩm được thêm thành công!');
            handleRefresh();
            setModalChild(null);
        } catch (e) {
            const errorMessage = e.response?.data?.message || e.message || 'Đã xảy ra lỗi khi thêm sản phẩm';
            console.error("Add Product Error:", e.response || e);
            message.error(errorMessage);
        }
    };

    return (
        <div style={{ width: '80vw', maxWidth: '1200px', minWidth: '700px', margin: 'auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, textAlign: 'center', fontSize: '24px' }}>Thêm Sản Phẩm Mới</h2>

            <Form
                form={form}
                name="themSanPham"
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Row gutter={24}>
                    {/* Cột thông tin chung */}
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Tên Sản Phẩm"
                            name="productName"
                            rules={[{ required: true, message: 'Hãy nhập tên sản phẩm!' }]}
                        >
                            <Input />
                        </Form.Item>

                         <Form.Item
                            label="Danh Mục"
                            name="categoryName"
                            rules={[{ required: true, message: 'Hãy chọn danh mục!' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn danh mục"
                                optionFilterProp="label"
                                options={categoryOptions}
                            />
                        </Form.Item>

                        <Form.Item label="Thương Hiệu" required>
                            <Row gutter={16} align="bottom">
                                <Col flex="auto">
                                    <Form.Item
                                        name="selectedBrandId"
                                        noStyle
                                        rules={[{
                                            validator: async (_, value) => {
                                                if (!isAddingNewBrand && !selectedBrand) {
                                                    return Promise.reject(new Error('Hãy chọn thương hiệu!'));
                                                }
                                                return Promise.resolve();
                                            }
                                        }]}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="Chọn thương hiệu có sẵn"
                                            optionFilterProp="label"
                                            onChange={handleSelectBrandChange}
                                            options={brandOptions}
                                            value={selectedBrand ? selectedBrand.value : undefined}
                                            disabled={isAddingNewBrand}
                                            style={{ width: '100%' }}
                                            allowClear
                                            onClear={() => setSelectedBrand(null)}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col>
                                    {selectedBrand && !isAddingNewBrand && (
                                        <div style={{ height: '32px', display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
                                            <Image
                                                height={32}
                                                src={selectedBrand.image}
                                                preview={false}
                                                style={{ objectFit: 'contain', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '2px' }}
                                            />
                                        </div>
                                    )}
                                </Col>
                                <Col>
                                    <Button
                                        onClick={handleShowAddBrandForm}
                                        disabled={isAddingNewBrand}
                                        style={{ marginLeft: '8px' }}
                                    >
                                        Hoặc thêm mới
                                    </Button>
                                </Col>
                            </Row>
                        </Form.Item>

                        {isAddingNewBrand && (
                            <div style={{ border: '1px dashed #d9d9d9', padding: '16px', borderRadius: '8px', marginBottom: '16px', position: 'relative' }}>
                                <Button
                                    icon={<MinusCircleOutlined />}
                                    onClick={handleCancelAddBrand}
                                    type="text"
                                    danger
                                    style={{ position: 'absolute', top: 5, right: 5, zIndex: 1 }}
                                    title="Hủy thêm thương hiệu mới"
                                />
                                <Row gutter={16}>
                                    <Col xs={24} sm={16}>
                                        <Form.Item
                                            label="Tên Thương Hiệu Mới"
                                            name="newBrandName"
                                            rules={[{ required: true, message: 'Hãy nhập tên thương hiệu mới!' }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                        <Form.Item
                                            label="Url Logo Mới"
                                            name="newBrandLogoUrl"
                                        >
                                            <Input onChange={handleNewBrandImageChange} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item label="Xem trước logo mới">
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px', border: '1px dashed #ccc', borderRadius: '4px' }}>
                                                {newBrandImagePreview ? (
                                                    <Image height={90} src={newBrandImagePreview} style={{ objectFit: 'contain' }}/>
                                                ) : (
                                                    <span style={{ color: '#bfbfbf' }}>Logo</span>
                                                )}
                                            </div>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        )}

                        <Form.Item
                            label="Mô tả sản phẩm"
                            name="description"
                            rules={[{ required: true, message: 'Hãy nhập mô tả!' }]}
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>

                        {/* Thông số kỹ thuật và Hỗ trợ giao nhanh có thể giữ lại nếu API add cần */}
                        {/* <Form.Item label="Thông số kỹ thuật" name="specifications">
                            <Input.TextArea rows={4} placeholder="Mỗi thông số trên một dòng" />
                        </Form.Item> */}

                         {/* *** Thêm lại Row cho Price và Weight *** */}
                         <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Giá Gốc (VNĐ)"
                                    name="price"
                                    rules={[
                                        { required: true, message: 'Hãy nhập giá sản phẩm!' },
                                        { type: 'number', min: 0, message: 'Giá phải là số không âm!'}
                                    ]}
                                >
                                    <InputNumber
                                        min={0}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </Col>
                             {/* *** Thêm lại Form.Item cho Weight *** */}
                             <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Cân nặng (kg)"
                                    name="weight"
                                     rules={[
                                        { required: true, message: 'Hãy nhập cân nặng!' },
                                        { type: 'number', min: 0, message: 'Cân nặng phải là số không âm!'}
                                     ]}
                                >
                                    <InputNumber min={0} step={0.1} style={{ width: '100%' }}/>
                                </Form.Item>
                            </Col>
                         </Row>

                        {/* <Form.Item label="Hỗ trợ giao hàng nhanh" name="supportRushOrder" valuePropName="checked">
                            <Switch />
                        </Form.Item> */}
                    </Col>

                     {/* Cột biến thể (giữ nguyên) */}
                    <Col xs={24} md={12}>
                        <h3 style={{ marginBottom: 16, textAlign: 'center' }}>Biến thể Sản Phẩm</h3>
                        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                            {variants.map((variant, index) => (
                                <div key={variant.key} style={{ marginBottom: 16, padding: '16px', border: '1px solid #e8e8e8', borderRadius: '8px', position: 'relative' }}>
                                    {variants.length > 1 && (
                                        <Button
                                            icon={<MinusCircleOutlined />}
                                            onClick={() => removeVariant(variant.key)}
                                            type="text"
                                            danger
                                            style={{ position: 'absolute', top: 5, right: 5, zIndex: 10, padding: 5 }}
                                            title="Xóa biến thể này"
                                        />
                                    )}
                                    <Row gutter={16}>
                                        <Col xs={24} sm={14}>
                                            <Form.Item
                                                label={`Màu sắc #${index + 1}`}
                                                required
                                                validateStatus={!variant.color ? 'error' : ''}
                                                help={!variant.color ? 'Vui lòng nhập màu sắc' : ''}
                                            >
                                                <Input
                                                    placeholder="VD: Xanh dương"
                                                    value={variant.color}
                                                    onChange={(e) =>
                                                        handleVariantChange(variant.key, 'color', e.target.value)
                                                    }
                                                />
                                            </Form.Item>
                                            <Form.Item label={`Url ảnh #${index + 1}`}>
                                                <Input
                                                    placeholder="https://example.com/anh-bien-the.jpg"
                                                    value={variant.image}
                                                    onChange={(e) => {
                                                        handleVariantChange(variant.key, 'image', e.target.value);
                                                    }}
                                                />
                                            </Form.Item>
                                             <Row gutter={8}>
                                                <Col span={12}>
                                                    <Form.Item
                                                        label={`Số lượng #${index + 1}`}
                                                        required
                                                        validateStatus={variant.quantity === null || variant.quantity === undefined || variant.quantity < 0 ? 'error' : ''}
                                                        help={variant.quantity === null || variant.quantity === undefined || variant.quantity < 0 ? 'Số lượng >= 0' : ''}
                                                    >
                                                        <InputNumber
                                                            min={0}
                                                            value={variant.quantity}
                                                            onChange={(value) =>
                                                                handleVariantChange(variant.key, 'quantity', value)
                                                            }
                                                            style={{ width: '100%' }}
                                                            defaultValue={0}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item
                                                        label={`Giảm giá (%) #${index + 1}`}
                                                        validateStatus={variant.sale < 0 || variant.sale > 100 ? 'error' : ''}
                                                        help={variant.sale < 0 || variant.sale > 100 ? 'Từ 0 đến 100' : ''}
                                                    >
                                                        <InputNumber
                                                            min={0}
                                                            max={100}
                                                            value={variant.sale}
                                                            onChange={(value) => handleVariantChange(variant.key, 'sale', value)}
                                                            style={{ width: '100%' }}
                                                            defaultValue={0}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col xs={24} sm={10}>
                                            <Form.Item label={`Ảnh xem trước #${index + 1}`}>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '120px', border: '1px dashed #ccc', borderRadius: '4px' }}>
                                                    {variant.image ? (
                                                        <Image
                                                            height={110}
                                                            src={variant.image}
                                                            style={{ objectFit: 'contain' }}
                                                        />
                                                    ) : (
                                                        <span style={{ color: '#bfbfbf' }}>Ảnh</span>
                                                    )}
                                                </div>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </div>

                        <Button
                            type="dashed"
                            onClick={addVariant}
                            icon={<PlusOutlined />}
                            style={{ width: '100%', marginTop: 16 }}
                        >
                            Thêm Biến Thể Khác
                        </Button>
                    </Col>
                </Row>

                <Divider />

                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                    <Space>
                        <Button type="default" onClick={() => setModalChild(null)}>
                            Hủy Bỏ
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Thêm Sản Phẩm
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default AddProduct;