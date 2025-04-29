import React, { useState, useEffect } from 'react';
import { Button, Form, Input, InputNumber, Space, Row, Col, message, Image, Select, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import apiService from '../../../services/api'; // Đảm bảo đường dẫn đúng

const AddProduct = ({ setModalChild, handleRefresh }) => {
    const [form] = Form.useForm();
    // Đổi tên các trường trong state variants cho nhất quán với API và EditProduct
    const [variants, setVariants] = useState([{ key: Date.now() + '_initial', color: '', stockQuantity: 0, discount: 0, imageUrl: '' }]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [brandOptions, setBrandOptions] = useState([]);
    // --- Bỏ state liên quan đến thêm brand mới ---
    // const [isAddingNewBrand, setIsAddingNewBrand] = useState(false);
    // const [newBrandImagePreview, setNewBrandImagePreview] = useState(null);

    // Dữ liệu cứng - Nên fetch từ API
    const allBrand = [
        { brandId: 1, name: "Apple", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_59.png" },
        { brandId: 2, name: "Samsung", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_60.png" },
        { brandId: 9, name: "Xiaomi", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_61.png" },
        // ... add other brands
        { brandId: 3, name: "Dell", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Dell.png" },
        { brandId: 5, name: "Lenovo", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Lenovo.png" },
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
                const fetchedBrands = allBrand; // Dùng data cứng
                const options = fetchedBrands.map((brand) => ({
                    value: brand.brandId, // Sử dụng brandId làm value
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
        // --- Bỏ logic liên quan đến isAddingNewBrand ---
    };

    // --- Bỏ các hàm xử lý thêm brand mới ---
    // const handleShowAddBrandForm = () => { ... };
    // const handleCancelAddBrand = () => { ... };
    // const handleNewBrandImageChange = (e) => { ... };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Vui lòng kiểm tra lại các trường thông tin.');
    };

    const addVariant = () => {
        // Sử dụng tên trường nhất quán
        setVariants([...variants, { key: Date.now() + Math.random(), color: '', stockQuantity: 0, discount: 0, imageUrl: '' }]);
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
        // Đơn giản hóa kiểm tra brand: chỉ cần selectedBrand có giá trị
        if (!selectedBrand) {
            message.error('Vui lòng chọn thương hiệu!');
            form.validateFields(['selectedBrandId']); // Trigger validation cho select
            return;
        }
        // --- Bỏ kiểm tra isAddingNewBrand ---

        // Kiểm tra variants (dùng tên trường đã đổi)
        const invalidVariant = variants.some(v => !v.color || v.stockQuantity === null || v.stockQuantity === undefined || v.stockQuantity < 0);
        if (invalidVariant) {
            message.error('Vui lòng nhập đầy đủ thông tin hợp lệ (Màu sắc, Số lượng >= 0) cho tất cả các biến thể!');
            // Không cần return ở đây nếu muốn kiểm tra hết rồi mới báo lỗi chung
            // return; // Có thể giữ lại để dừng ngay khi gặp lỗi variant đầu tiên
        }

        // Nếu có lỗi variant, dừng lại (sau khi đã hiển thị message)
        if (invalidVariant) return;


        try {
            const data = {
                productName: values.productName || '',
                description: values.description || '',
                price: values.price ?? 0,
                weight: values.weight ?? 0,
                categoryName: values.categoryName || '',
                // Lấy brandName từ selectedBrand
                brandName: selectedBrand.label,
                // --- Bỏ logic isAddingNewBrand ---
                variants: variants.map(variant => ({
                    color: variant.color,
                    imageUrl: variant.imageUrl || '',
                    stockQuantity: variant.stockQuantity ?? 0,
                    discount: variant.discount ?? 0,
                })),
            };

            console.log('Data to send to API:', data);

            // --- Gọi API (Giả lập) ---
            // await apiService.addProduct(data);
            message.success(`(Giả lập) Sản phẩm ${data.productName} được thêm thành công!`);
            // --- Kết thúc Giả lập ---

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
            <h2 style={{ marginTop: 0, marginBottom: 0, textAlign: 'center', fontSize: '24px' }}>Thêm Sản Phẩm Mới</h2>

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

                        {/* Label chung cho Thương hiệu */}
                        <Form.Item label="Thương Hiệu" required>
                             <Row gutter={16} align="middle"> {/* Đổi align thành middle */}
                                <Col flex="auto">
                                    {/* Form Item chỉ chứa Select */}
                                    <Form.Item
                                        name="selectedBrandId" // Vẫn giữ name để form quản lý value và validation
                                        noStyle // Không hiển thị label/style mặc định của Form.Item
                                        rules={[{ required: true, message: 'Hãy chọn thương hiệu!' }]} // Quy tắc đơn giản
                                    >
                                        <Select
                                            showSearch
                                            placeholder="Chọn thương hiệu có sẵn"
                                            optionFilterProp="label"
                                            onChange={handleSelectBrandChange}
                                            options={brandOptions}
                                            value={selectedBrand ? selectedBrand.value : undefined}
                                            // --- Bỏ disabled ---
                                            style={{ width: '100%' }}
                                            allowClear
                                            onClear={() => setSelectedBrand(null)}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col>
                                     {/* Hiển thị logo nếu đã chọn */}
                                    {selectedBrand && (
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
                                {/* --- Bỏ nút "Hoặc thêm mới" --- */}
                            </Row>
                        </Form.Item>

                        {/* --- Bỏ khối form thêm brand mới --- */}
                        {/* {isAddingNewBrand && ( ... )} */}

                        <Form.Item
                            label="Mô tả sản phẩm"
                            name="description"
                            rules={[{ required: true, message: 'Hãy nhập mô tả!' }]}
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>

                         {/* Row cho Price và Weight */}
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
                                        defaultValue={0} // Giá trị mặc định
                                    />
                                </Form.Item>
                            </Col>
                             <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Cân nặng (kg)"
                                    name="weight"
                                     rules={[
                                        { required: true, message: 'Hãy nhập cân nặng!' },
                                        { type: 'number', min: 0, message: 'Cân nặng phải là số không âm!'}
                                     ]}
                                >
                                    <InputNumber
                                        min={0}
                                        step={0.1}
                                        style={{ width: '100%' }}
                                        defaultValue={0} // Giá trị mặc định
                                    />
                                </Form.Item>
                            </Col>
                         </Row>
                    </Col>

                     {/* Cột biến thể */}
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
                                                required // Vẫn hiển thị dấu * yêu cầu
                                                // --- Bỏ validateStatus và help ---
                                                // validateStatus={!variant.color ? 'error' : ''}
                                                // help={!variant.color ? 'Vui lòng nhập màu sắc' : ''}
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
                                                    value={variant.imageUrl} // Đổi tên state
                                                    onChange={(e) => {
                                                        handleVariantChange(variant.key, 'imageUrl', e.target.value); // Đổi tên field
                                                    }}
                                                />
                                            </Form.Item>
                                             <Row gutter={8}>
                                                <Col span={12}>
                                                    <Form.Item
                                                        label={`Số lượng #${index + 1}`}
                                                        required
                                                        // --- Bỏ validateStatus và help ---
                                                        // validateStatus={variant.stockQuantity === null || ... ? 'error' : ''}
                                                        // help={variant.stockQuantity === null || ... ? 'Số lượng >= 0' : ''}
                                                    >
                                                        <InputNumber
                                                            min={0}
                                                            value={variant.stockQuantity} // Đổi tên state
                                                            onChange={(value) =>
                                                                handleVariantChange(variant.key, 'stockQuantity', value) // Đổi tên field
                                                            }
                                                            style={{ width: '100%' }}
                                                            defaultValue={0}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item
                                                        label={`Giảm giá (%) #${index + 1}`}
                                                        // --- Bỏ validateStatus và help ---
                                                        // validateStatus={variant.discount < 0 || ... ? 'error' : ''}
                                                        // help={variant.discount < 0 || ... ? 'Từ 0 đến 100' : ''}
                                                    >
                                                        <InputNumber
                                                            min={0}
                                                            max={100}
                                                            value={variant.discount} // Đổi tên state
                                                            onChange={(value) => handleVariantChange(variant.key, 'discount', value)} // Đổi tên field
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
                                                    {variant.imageUrl ? ( // Đổi tên state
                                                        <Image
                                                            height={110}
                                                            src={variant.imageUrl} // Đổi tên state
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

                <Divider style={{ flexShrink: 0, margin: '8px 0' }} />
               

                <Form.Item style={{ textAlign: 'right', margin: 0 }}>
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