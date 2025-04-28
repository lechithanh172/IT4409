// EditProduct.jsx
import React, { useState, useEffect } from 'react';
import { Button, Form, Input, InputNumber, Space, Row, Col, Divider, message, Image, Select } from 'antd'; // Bỏ Switch
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import apiService from '../../../services/api';

// --- Dữ liệu cứng Category/Brand (Copy từ AdminProduct hoặc import) ---
const allCategory = [
    { categoryId: 1, name: "Laptop" }, { categoryId: 2, name: "Tablet" }, { categoryId: 3, name: "Smartphone" },
    { categoryId: 4, name: "Accessory" }, { categoryId: 5, name: "Monitor" }, { categoryId: 6, name: "Printer" },
    { categoryId: 7, name: "Router" }, { categoryId: 8, name: "Speaker" }, { categoryId: 9, name: "Camera" },
    { categoryId: 10, name: "Smartwatch" }, { categoryId: 13, name: "bàn phím" }, { categoryId: 14, name: "chuột" },
    { categoryId: 16, name: "tv" }
];
const allBrand = [
    { brandId: 1, name: "Apple", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_59.png" },
    { brandId: 2, name: "Samsung", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_60.png" },
    { brandId: 3, name: "Dell", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Dell.png" },
    { brandId: 4, name: "HP", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/HP.png" },
    { brandId: 5, name: "Lenovo", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Lenovo.png" },
    { brandId: 6, name: "Asus", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Asus.png" },
    { brandId: 7, name: "MSI", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/MSI.png" },
    { brandId: 8, name: "Acer", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/acer.png" },
    { brandId: 9, name: "Xiaomi", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_61.png" },
    { brandId: 10, name: "Sony", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/f/r/frame_87.png" },
    { brandId: 11, name: "Tecno", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_69_1_.png" },
    { brandId: 12, name: "Macbook", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/macbook.png" },
    { brandId: 13, name: "AirPods", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/b/r/brand-icon-airpods.png" },
    { brandId: 14, name: "Bose", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/b/r/brand-icon-bose.png" },
    { brandId: 15, name: "Logitech", logoUrl: "https://cellphones.com.vn/media/icons/brands/brand-248.svg" },
    { brandId: 16, name: "SanDisk", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/a/b/abcde_24_.png" },
    { brandId: 17, name: "LG", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_84_1_.png" },
    { brandId: 18, name: "TCL", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/t/i/tivi-logo-cate.png" }
];
// --- Kết thúc dữ liệu cứng ---

// Tạo options cho Select
const categoryOptions = allCategory.map(cat => ({ value: cat.name, label: cat.name }));
const brandOptions = allBrand.map(brand => ({
    value: brand.name, // Value là tên brand
    label: brand.name,
    image: brand.logoUrl
}));


const EditProduct = ({ product, setModalChild, handleRefresh }) => {
    const [form] = Form.useForm();
    const initialVariants = (product?.variants || []).map((variant, index) => ({
        key: variant.variantId || `existing_${index}`, variantId: variant.variantId,
        color: variant.color || '', imageUrl: variant.imageUrl || '',
        stockQuantity: variant.stockQuantity ?? 0, discount: variant.discount ?? 0,
    }));
    const [variants, setVariants] = useState(initialVariants);
    const [selectedBrandImage, setSelectedBrandImage] = useState(null);

    useEffect(() => {
        if (product) {
            // Đặt giá trị ban đầu cho Form (Thêm lại weight)
            form.setFieldsValue({
                productName: product.productName,
                description: product.description,
                // specifications: product.specifications, // Vẫn bỏ theo yêu cầu trước
                weight: product.weight, // Thêm lại
                price: product.price,
                categoryName: product.categoryName,
                brandName: product.brandName,
                // supportRushOrder: product.supportRushOrder, // Vẫn bỏ theo yêu cầu trước
            });

            // Tìm và đặt logo ban đầu
            const initialBrand = brandOptions.find(b => b.value === product.brandName);
            setSelectedBrandImage(initialBrand ? initialBrand.image : null);

            // Cập nhật variants state
            const updatedInitialVariants = (product.variants || []).map((variant, index) => ({
                 key: variant.variantId || `existing_${index}`, variantId: variant.variantId,
                 color: variant.color || '', imageUrl: variant.imageUrl || '',
                 stockQuantity: variant.stockQuantity ?? 0, discount: variant.discount ?? 0,
             }));
            setVariants(updatedInitialVariants);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product, form]);

    const handleBrandChange = (value) => {
        const selected = brandOptions.find(b => b.value === value);
        setSelectedBrandImage(selected ? selected.image : null);
    };

    const onFinishFailed = (errorInfo) => { console.log('Failed:', errorInfo); message.error('Vui lòng kiểm tra lại các trường thông tin.'); };
    const addVariant = () => { setVariants([...variants, { key: `new_${Date.now()}_${variants.length}`, variantId: undefined, color: '', imageUrl: '', stockQuantity: 0, discount: 0 }]); };
    const removeVariant = (keyToRemove) => { if (variants.length <= 1) { message.warning('Sản phẩm phải có ít nhất một biến thể.'); return; } setVariants(variants.filter((variant) => variant.key !== keyToRemove)); };
    const handleVariantChange = (key, field, value) => { setVariants(variants.map((variant) => (variant.key === key ? { ...variant, [field]: value } : variant))); };

    const onFinish = async (values) => {
        if (!product || !product.productId) { message.error('ID sản phẩm không hợp lệ để cập nhật.'); return; }
        const invalidVariant = variants.some(v => !v.color || v.stockQuantity < 0);
        if (invalidVariant) { message.error('Vui lòng nhập đầy đủ thông tin hợp lệ (Màu sắc, Số lượng >= 0) cho tất cả các biến thể!'); return; }

        try {
            // Tạo payload gửi đi (Thêm lại weight)
            const data = {
                productId: product.productId,
                productName: values.productName || '',
                description: values.description || '',
                // specifications: values.specifications || '', // Vẫn bỏ
                weight: values.weight ?? 0,                 // Thêm lại
                price: values.price ?? 0,
                categoryName: values.categoryName || '',
                brandName: values.brandName || '',
                // supportRushOrder: values.supportRushOrder || false, // Vẫn bỏ
                variants: variants.map(variant => ({
                    ...(variant.variantId && { variantId: variant.variantId }),
                    color: variant.color, imageUrl: variant.imageUrl || '',
                    stockQuantity: variant.stockQuantity ?? 0,
                    discount: variant.discount ?? 0,
                })),
            };

            console.log('Data to send to API (Update):', data);

            await apiService.updateProduct(data); // Gọi API
            message.success('Sản phẩm được cập nhật thành công!');
            handleRefresh(); setModalChild(null);
        } catch (e) {
            const errorMessage = e.response?.data?.message || e.message || 'Đã xảy ra lỗi khi cập nhật sản phẩm';
            console.error("Update Product Error:", e.response || e); message.error(errorMessage);
        }
    };

    if (!product) { return <div>Đang tải dữ liệu sản phẩm...</div>; }

    return (
        <div style={{ width: '80vw', maxWidth: '1200px', minWidth: '700px', margin: 'auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, textAlign: 'center', fontSize: '24px' }}> Chỉnh Sửa Sản Phẩm </h2>
            <Form form={form} name="chinhSuaSanPham" layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                <Row gutter={24}>
                    <Col xs={24} md={12}>
                        <Form.Item label="Tên Sản Phẩm" name="productName" rules={[{ required: true, message: 'Hãy nhập tên sản phẩm!' }]}><Input /></Form.Item>
                        <Form.Item label="Danh Mục" name="categoryName" rules={[{ required: true, message: 'Hãy chọn danh mục!' }]}><Select showSearch placeholder="Chọn danh mục" optionFilterProp="label" options={categoryOptions} /></Form.Item>
                        <Form.Item label="Thương Hiệu" name="brandName" rules={[{ required: true, message: 'Hãy chọn thương hiệu!' }]}>
                             <Row gutter={16} align="middle">
                                <Col flex="auto"><Select showSearch placeholder="Chọn thương hiệu" optionFilterProp="label" options={brandOptions} onChange={handleBrandChange} style={{ width: '100%' }} /></Col>
                                <Col>{selectedBrandImage && (<div style={{ height: '32px', display: 'flex', alignItems: 'center', marginLeft: '8px' }}><Image height={32} src={selectedBrandImage} preview={false} style={{ objectFit: 'contain', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '2px' }} /></div>)}</Col>
                            </Row>
                        </Form.Item>
                        <Form.Item label="Mô tả sản phẩm" name="description" rules={[{ required: true, message: 'Hãy nhập mô tả!' }]}><Input.TextArea rows={4} /></Form.Item>

                        {/* Đã bỏ specifications và supportRushOrder */}

                        {/* Thêm lại Row cho Price và Weight */}
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item label="Giá Gốc (VNĐ)" name="price" rules={[ { required: true, message: 'Hãy nhập giá sản phẩm!' }, { type: 'number', min: 0, message: 'Giá phải là số không âm!'} ]}>
                                    <InputNumber min={0} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/\$\s?|(,*)/g, '')} style={{ width: '100%' }}/>
                                </Form.Item>
                            </Col>
                            {/* Thêm lại Form.Item cho Weight */}
                            <Col xs={24} sm={12}>
                                <Form.Item label="Cân nặng (kg)" name="weight" rules={[ { required: true, message: 'Hãy nhập cân nặng!' }, { type: 'number', min: 0, message: 'Cân nặng phải là số không âm!'} ]}>
                                    <InputNumber min={0} step={0.1} style={{ width: '100%' }}/>
                                </Form.Item>
                            </Col>
                        </Row>
                         {/* Kết thúc Price và Weight */}
                    </Col>

                    <Col xs={24} md={12}>
                        {/* Phần Biến thể (Giữ nguyên) */}
                        <h3 style={{ marginBottom: 16, textAlign: 'center' }}>Biến thể Sản Phẩm</h3>
                        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                            {variants.map((variant, index) => (
                                <div key={variant.key} style={{ marginBottom: 16, padding: '16px', border: '1px solid #e8e8e8', borderRadius: '8px', position: 'relative' }}>
                                    {variants.length > 1 && (<Button icon={<MinusCircleOutlined />} onClick={() => removeVariant(variant.key)} type="text" danger style={{ position: 'absolute', top: 5, right: 5, padding: 5, zIndex: 10, lineHeight: 0, cursor: 'pointer' }} title="Xóa biến thể này" />)}
                                     <Row gutter={16}>
                                        <Col xs={24} sm={14}>
                                            <Form.Item label={`Màu sắc #${index + 1}`} required validateStatus={!variant.color ? 'error' : ''} help={!variant.color ? 'Vui lòng nhập màu sắc' : ''}><Input placeholder="VD: Xanh dương" value={variant.color} onChange={(e) => handleVariantChange(variant.key, 'color', e.target.value)} /></Form.Item>
                                            <Form.Item label={`Url ảnh #${index + 1}`}><Input placeholder="https://example.com/anh-bien-the.jpg" value={variant.imageUrl} onChange={(e) => { handleVariantChange(variant.key, 'imageUrl', e.target.value); }} /></Form.Item>
                                             <Row gutter={8}>
                                                <Col span={12}><Form.Item label={`Số lượng #${index + 1}`} required validateStatus={variant.stockQuantity === null || variant.stockQuantity === undefined || variant.stockQuantity < 0 ? 'error' : ''} help={variant.stockQuantity === null || variant.stockQuantity === undefined || variant.stockQuantity < 0 ? 'Số lượng >= 0' : ''}><InputNumber min={0} value={variant.stockQuantity} onChange={(value) => handleVariantChange(variant.key, 'stockQuantity', value)} style={{ width: '100%' }} /></Form.Item></Col>
                                                <Col span={12}><Form.Item label={`Giảm giá (%) #${index + 1}`} validateStatus={variant.discount < 0 || variant.discount > 100 ? 'error' : ''} help={variant.discount < 0 || variant.discount > 100 ? 'Từ 0 đến 100' : ''}><InputNumber min={0} max={100} value={variant.discount} onChange={(value) => handleVariantChange(variant.key, 'discount', value)} style={{ width: '100%' }} /></Form.Item></Col>
                                            </Row>
                                        </Col>
                                        <Col xs={24} sm={10}>
                                            <Form.Item label={`Ảnh xem trước #${index + 1}`}>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '120px', border: '1px dashed #ccc', borderRadius: '4px' }}>
                                                    {variant.imageUrl ? ( <Image height={110} src={variant.imageUrl} style={{ objectFit: 'contain' }} /> ) : ( <span style={{ color: '#bfbfbf' }}>Ảnh</span> )}
                                                </div>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </div>
                        <Button type="dashed" onClick={addVariant} icon={<PlusOutlined />} style={{ width: '100%', marginTop: 16 }}> Thêm Biến Thể Khác </Button>
                    </Col>
                </Row>
                <Divider />
                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                    <Space> <Button type="default" onClick={() => setModalChild(null)}> Hủy Bỏ </Button> <Button type="primary" htmlType="submit"> Cập Nhật Sản Phẩm </Button> </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditProduct;