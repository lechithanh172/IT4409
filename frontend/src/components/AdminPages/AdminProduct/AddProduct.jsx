import React, { useState, useEffect } from 'react';
import { Button, Form, Input, InputNumber, Space, Row, Col, message, Image, Select, Divider, Checkbox } from 'antd'; // Thêm Checkbox
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import apiService from '../../../services/api'; // Đảm bảo đường dẫn đúng

const AddProduct = ({ setModalChild, handleRefresh }) => {
    const [form] = Form.useForm();
    // State cho biến thể sản phẩm
    const [variants, setVariants] = useState([{ key: Date.now() + '_initial', color: '', stockQuantity: 0, discount: 0, imageUrl: '' }]);
    // State lưu trữ thương hiệu đã chọn (object chứa value, label, image)
    const [selectedBrand, setSelectedBrand] = useState(null);
    // State lưu danh sách options cho Select thương hiệu
    const [brandOptions, setBrandOptions] = useState([]);

    // --- Dữ liệu cứng Category/Brand (Nên fetch từ API trong thực tế) ---
    const allBrand = [
        { brandId: 1, name: "Apple", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_59.png" },
        { brandId: 2, name: "Samsung", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_60.png" },
        { brandId: 9, name: "Xiaomi", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_61.png" },
        { brandId: 3, name: "Dell", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Dell.png" },
        { brandId: 5, name: "Lenovo", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Lenovo.png" },
        // Thêm các brand khác nếu cần
    ];
    const allCategory = [
        { categoryId: 1, name: "Laptop" }, { categoryId: 2, name: "Tablet" }, { categoryId: 3, name: "Smartphone" },
        { categoryId: 4, name: "Accessory" }, { categoryId: 5, name: "Monitor" }, { categoryId: 6, name: "Printer" },
        { categoryId: 7, name: "Router" }, { categoryId: 8, name: "Speaker" }, { categoryId: 9, name: "Camera" },
        { categoryId: 10, name: "Smartwatch" }, { categoryId: 13, name: "bàn phím" }, { categoryId: 14, name: "chuột" }, { categoryId: 16, name: "tv" },
    ];
    // Tạo options cho Select Category
    const categoryOptions = allCategory.map(cat => ({ value: cat.name, label: cat.name }));

    // Fetch danh sách thương hiệu khi component mount
    useEffect(() => {
        const fetchBrand = async () => {
            try {
                // TODO: Thay thế bằng gọi API thật để lấy danh sách thương hiệu
                // const response = await apiService.getAllBrands();
                // const fetchedBrands = response.data || [];
                const fetchedBrands = allBrand; // Dùng data cứng tạm thời
                const options = fetchedBrands.map((brand) => ({
                    value: brand.brandId, // Sử dụng brandId làm value để định danh duy nhất
                    label: brand.name,
                    image: brand.logoUrl,
                }));
                setBrandOptions(options);
            } catch (error) {
                console.error('Lỗi khi tải danh sách thương hiệu:', error);
                message.error('Không thể tải danh sách thương hiệu.');
            }
        };
        fetchBrand();
    }, []);

    // Xử lý khi chọn thương hiệu từ Select
    const handleSelectBrandChange = (value) => {
        const selected = brandOptions.find((b) => b.value === value);
        setSelectedBrand(selected || null); // Cập nhật state thương hiệu đã chọn
    };

    // Xử lý khi form submit thất bại (validation errors)
    const onFinishFailed = (errorInfo) => {
        console.log('Thất bại:', errorInfo);
        message.error('Vui lòng kiểm tra lại các trường thông tin còn thiếu hoặc không hợp lệ.');
    };

    // Thêm một biến thể mới vào state `variants`
    const addVariant = () => {
        setVariants([...variants, { key: Date.now() + Math.random(), color: '', stockQuantity: 0, discount: 0, imageUrl: '' }]);
    };

    // Xóa một biến thể khỏi state `variants` dựa vào key
    const removeVariant = (keyToRemove) => {
        // Không cho xóa nếu chỉ còn 1 biến thể
        if (variants.length <= 1) {
            message.warning('Sản phẩm phải có ít nhất một biến thể.');
            return;
        }
        setVariants(variants.filter((variant) => variant.key !== keyToRemove));
    };

    // Cập nhật thông tin của một biến thể cụ thể trong state `variants`
    const handleVariantChange = (key, field, value) => {
        setVariants(variants.map((variant) => (variant.key === key ? { ...variant, [field]: value } : variant)));
    };

    // Xử lý khi submit form thành công (sau khi đã qua validation)
    const onFinish = async (values) => {
        // Kiểm tra lại đã chọn thương hiệu chưa (dù đã có rule, kiểm tra thêm cho chắc)
        if (!selectedBrand) {
            message.error('Vui lòng chọn thương hiệu!');
            form.validateFields(['selectedBrandId']); // Kích hoạt validation cho Select thương hiệu
            return;
        }

        // Kiểm tra thông tin các biến thể (màu sắc và số lượng >= 0)
        const invalidVariant = variants.some(v => !v.color || v.stockQuantity === null || v.stockQuantity === undefined || v.stockQuantity < 0);
        if (invalidVariant) {
            message.error('Vui lòng nhập đầy đủ thông tin hợp lệ (Màu sắc, Số lượng >= 0) cho tất cả các biến thể!');
            return; // Dừng lại nếu có biến thể không hợp lệ
        }

        // Kiểm tra thông tin các thông số kỹ thuật (group, title, content không được rỗng)
        const invalidSpecification = (values.specifications || []).some(spec => !spec || !spec.group || !spec.title || !spec.content);
        if (invalidSpecification) {
            message.error('Vui lòng nhập đầy đủ thông tin (Nhóm, Tiêu đề, Nội dung) cho tất cả các thông số kỹ thuật!');
            // Tìm và focus vào trường lỗi đầu tiên (nếu cần thiết, phức tạp hơn)
            // form.validateFields(['specifications']); // Có thể không focus đúng chỗ
            return;
        }


        try {
            // Chuẩn bị dữ liệu gửi đi API
            const data = {
                productName: values.productName || '',
                description: values.description || '',
                price: values.price ?? 0,
                weight: values.weight ?? 0,
                categoryName: values.categoryName || '',
                brandName: selectedBrand.label, // Lấy tên thương hiệu từ state đã chọn
                supportRushOrder: values.supportRushOrder || false, // Lấy giá trị boolean từ Checkbox
                // Lấy danh sách thông số kỹ thuật từ form, đảm bảo là mảng và các trường không null/undefined
                specifications: (values.specifications || []).map(spec => ({
                    group: spec.group || '',
                    title: spec.title || '',
                    content: spec.content || ''
                })),
                // Ánh xạ state variants sang định dạng API yêu cầu
                variants: variants.map(variant => ({
                    color: variant.color,
                    imageUrl: variant.imageUrl || '',
                    stockQuantity: variant.stockQuantity ?? 0,
                    discount: variant.discount ?? 0,
                })),
            };

            console.log('Dữ liệu gửi lên API (Thêm mới):', data);

            // --- Gọi API (Giả lập) ---
            // TODO: Thay thế bằng gọi API thật
            // await apiService.addProduct(data);
            message.success(`(Giả lập) Sản phẩm ${data.productName} được thêm thành công!`);
            // --- Kết thúc Giả lập ---

            handleRefresh(); // Gọi hàm refresh danh sách sản phẩm ở component cha (AdminProduct)
            setModalChild(null); // Đóng modal thêm sản phẩm
        } catch (e) {
            const errorMessage = e.response?.data?.message || e.message || 'Đã xảy ra lỗi khi thêm sản phẩm';
            console.error("Lỗi thêm sản phẩm:", e.response || e);
            message.error(errorMessage);
        }
    };

    return (
        // Container chính của form
        <div style={{ width: '80vw', maxWidth: '1200px', minWidth: '700px', margin: 'auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, textAlign: 'center', fontSize: '24px' }}>Thêm Sản Phẩm Mới</h2>

            {/* Component Form của Ant Design */}
            <Form
                form={form} // Liên kết form instance
                name="themSanPham" // Tên form (hữu ích cho debug hoặc testing)
                layout="vertical" // Layout các label và input
                onFinish={onFinish} // Hàm xử lý khi submit thành công
                onFinishFailed={onFinishFailed} // Hàm xử lý khi submit thất bại (validation)
                autoComplete="off" // Tắt gợi ý tự động của trình duyệt
                // Giá trị mặc định ban đầu cho các trường trong form
                initialValues={{
                    supportRushOrder: false, // Mặc định không hỗ trợ giao nhanh
                    specifications: [{ group: '', title: '', content: '' }], // Bắt đầu với một dòng thông số trống
                    price: 0, // Giá mặc định
                    weight: 0, // Cân nặng mặc định
                    // Bạn có thể thêm các giá trị mặc định khác nếu muốn
                }}
            >
                {/* Sử dụng Row và Col để chia layout thành 2 cột */}
                <Row gutter={24}>
                    {/* === Cột 1: Thông tin chung và Thông số kỹ thuật === */}
                    <Col xs={24} md={12}>
                        {/* Trường Tên Sản Phẩm */}
                        <Form.Item
                            label="Tên Sản Phẩm"
                            name="productName"
                            rules={[{ required: true, message: 'Hãy nhập tên sản phẩm!' }]}
                        >
                            <Input placeholder="Ví dụ: iPhone 17 Pro Max"/>
                        </Form.Item>

                         {/* Trường Danh Mục */}
                         <Form.Item
                            label="Danh Mục"
                            name="categoryName"
                            rules={[{ required: true, message: 'Hãy chọn danh mục!' }]}
                        >
                            <Select
                                showSearch // Cho phép tìm kiếm trong danh sách
                                placeholder="Chọn danh mục"
                                optionFilterProp="label" // Tìm kiếm dựa trên nội dung của label
                                options={categoryOptions} // Danh sách các category options
                            />
                        </Form.Item>

                        {/* Phần chọn Thương hiệu */}
                        <Form.Item label="Thương Hiệu" required> {/* Label chung, đánh dấu required */}
                             <Row gutter={16} align="middle"> {/* Căn giữa các thành phần theo chiều dọc */}
                                <Col flex="auto"> {/* Col chứa Select chiếm phần lớn không gian */}
                                    {/* Form Item chỉ chứa Select, không có style riêng để nằm gọn trong Row */}
                                    <Form.Item
                                        name="selectedBrandId" // Vẫn cần name để form quản lý value và validation rule
                                        noStyle // Không áp dụng style mặc định của Form.Item (như margin)
                                        rules={[{ required: true, message: 'Hãy chọn thương hiệu!' }]} // Quy tắc bắt buộc chọn
                                    >
                                        <Select
                                            showSearch
                                            placeholder="Chọn thương hiệu có sẵn"
                                            optionFilterProp="label" // Tìm kiếm theo tên thương hiệu
                                            onChange={handleSelectBrandChange} // Gọi hàm xử lý khi giá trị thay đổi
                                            options={brandOptions} // Danh sách các brand options
                                            value={selectedBrand ? selectedBrand.value : undefined} // Hiển thị giá trị brandId đã chọn
                                            style={{ width: '100%' }}
                                            allowClear // Cho phép xóa lựa chọn hiện tại
                                            onClear={() => setSelectedBrand(null)} // Xử lý khi nhấn nút xóa
                                        />
                                    </Form.Item>
                                </Col>
                                <Col> {/* Col chứa ảnh logo */}
                                     {/* Hiển thị logo nếu đã chọn thương hiệu */}
                                    {selectedBrand && (
                                        <div style={{ height: '32px', display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
                                            <Image
                                                height={32} // Chiều cao cố định
                                                src={selectedBrand.image} // Nguồn ảnh từ state
                                                preview={false} // Không cho phép xem trước ảnh lớn khi click
                                                style={{ objectFit: 'contain', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '2px' }} // Style cho ảnh
                                            />
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Form.Item>

                        {/* Trường Mô tả sản phẩm */}
                        <Form.Item
                            label="Mô tả sản phẩm"
                            name="description"
                            rules={[{ required: true, message: 'Hãy nhập mô tả!' }]}
                        >
                            <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết về sản phẩm..."/>
                        </Form.Item>

                         {/* Hàng chứa Giá và Cân nặng */}
                         <Row gutter={16}>
                            <Col xs={24} sm={12}> {/* Chiếm 12 cột trên màn hình nhỏ trở lên */}
                                <Form.Item
                                    label="Giá Gốc (VNĐ)"
                                    name="price"
                                    rules={[
                                        { required: true, message: 'Hãy nhập giá sản phẩm!' },
                                        { type: 'number', min: 0, message: 'Giá phải là số không âm!'} // Validation: phải là số và >= 0
                                    ]}
                                >
                                    <InputNumber
                                        min={0} // Giá trị nhỏ nhất là 0
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} // Định dạng hiển thị số với dấu phẩy
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')} // Chuyển đổi giá trị nhập có dấu phẩy thành số
                                        style={{ width: '100%' }}
                                        placeholder="0"
                                    />
                                </Form.Item>
                            </Col>
                             <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Cân nặng (kg)"
                                    name="weight"
                                     rules={[
                                        { required: true, message: 'Hãy nhập cân nặng!' },
                                        { type: 'number', min: 0, message: 'Cân nặng phải là số không âm!'} // Validation
                                     ]}
                                >
                                    <InputNumber
                                        min={0} // Giá trị nhỏ nhất
                                        step={0.1} // Bước nhảy khi tăng/giảm
                                        style={{ width: '100%' }}
                                        placeholder="0.0"
                                    />
                                </Form.Item>
                            </Col>
                         </Row>

                        {/* Trường Hỗ trợ giao hàng nhanh */}
                        <Form.Item
                            name="supportRushOrder"
                            valuePropName="checked" // Quan trọng: Checkbox sử dụng prop `checked` thay vì `value`
                        >
                            <Checkbox>Hỗ trợ giao hàng nhanh</Checkbox>
                        </Form.Item>

                        <Divider>Thông số kỹ thuật</Divider>
                        {/* Sử dụng Form.List để quản lý danh sách động các thông số */}
                        <Form.List name="specifications">
                            {(fields, { add, remove }) => (
                                <>
                                    {/* Lặp qua từng field (dòng thông số) trong Form.List */}
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'baseline' }} align="baseline">
                                            {/* Trường Nhóm thông tin */}
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'group']}
                                                rules={[{ required: true, message: 'Nhập nhóm' }]}
                                                style={{ flex: 1 }} // Chiếm không gian linh hoạt
                                            >
                                                <Input placeholder="Nhóm (VD: Màn hình)" />
                                            </Form.Item>
                                            {/* Trường Tiêu đề */}
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'title']}
                                                rules={[{ required: true, message: 'Nhập tiêu đề' }]}
                                                style={{ flex: 1 }}
                                            >
                                                <Input placeholder="Tiêu đề (VD: Kích thước)" />
                                            </Form.Item>
                                            {/* Trường Nội dung */}
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'content']}
                                                rules={[{ required: true, message: 'Nhập nội dung' }]}
                                                style={{ flex: 2 }} // Cho nhiều không gian hơn
                                            >
                                                <Input placeholder="Nội dung (VD: 6.7 inch)" />
                                            </Form.Item>
                                            {/* Nút xóa dòng thông số */}
                                            <MinusCircleOutlined onClick={() => remove(name)} title="Xóa thông số này"/>
                                        </Space>
                                    ))}
                                    {/* Nút thêm dòng thông số mới */}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add({ group: '', title: '', content: '' })} block icon={<PlusOutlined />}>
                                            Thêm thông số kỹ thuật
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>

                    </Col> {/* Kết thúc Cột 1 */}

                     {/* === Cột 2: Biến thể sản phẩm === */}
                    <Col xs={24} md={12}>
                        <h3 style={{ marginBottom: 16, textAlign: 'center' }}>Biến thể Sản Phẩm</h3>
                        {/* Container cho danh sách biến thể, có scroll nếu quá cao */}
                        <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '10px' }}>
                            {/* Lặp qua state `variants` để render từng form biến thể */}
                            {variants.map((variant, index) => (
                                <div key={variant.key} style={{ marginBottom: 16, padding: '16px', border: '1px solid #e8e8e8', borderRadius: '8px', position: 'relative' }}>
                                    {/* Nút xóa biến thể, chỉ hiển thị nếu có nhiều hơn 1 biến thể */}
                                    {variants.length > 1 && (
                                        <Button
                                            icon={<MinusCircleOutlined />}
                                            onClick={() => removeVariant(variant.key)} // Gọi hàm xóa biến thể
                                            type="text" // Kiểu nút trong suốt
                                            danger // Màu đỏ cảnh báo
                                            style={{ position: 'absolute', top: 5, right: 5, zIndex: 10, padding: 5 }}
                                            title="Xóa biến thể này" // Tooltip
                                        />
                                    )}
                                    {/* Layout hàng cho mỗi biến thể */}
                                    <Row gutter={16}>
                                        {/* Cột con chứa thông tin (Màu, URL, Số lượng, Giảm giá) */}
                                        <Col xs={24} sm={14}>
                                            {/* Trường Màu sắc */}
                                            <Form.Item
                                                label={`Màu sắc #${index + 1}`}
                                                required // Đánh dấu là trường bắt buộc (dấu *)
                                                // Validation thủ công cho state `variants` sẽ được thực hiện trong onFinish
                                            >
                                                <Input
                                                    placeholder="VD: Xanh dương"
                                                    value={variant.color}
                                                    onChange={(e) =>
                                                        handleVariantChange(variant.key, 'color', e.target.value) // Cập nhật state khi nhập
                                                    }
                                                />
                                            </Form.Item>
                                            {/* Trường URL ảnh */}
                                            <Form.Item label={`Url ảnh #${index + 1}`}>
                                                <Input
                                                    placeholder="https://example.com/anh-bien-the.jpg"
                                                    value={variant.imageUrl} // Lấy giá trị từ state
                                                    onChange={(e) => {
                                                        handleVariantChange(variant.key, 'imageUrl', e.target.value); // Cập nhật state
                                                    }}
                                                />
                                            </Form.Item>
                                             {/* Hàng con chứa Số lượng và Giảm giá */}
                                             <Row gutter={8}>
                                                <Col span={12}> {/* Chiếm 12/24 cột */}
                                                    <Form.Item
                                                        label={`Số lượng #${index + 1}`}
                                                        required
                                                    >
                                                        <InputNumber
                                                            min={0} // Số lượng không âm
                                                            value={variant.stockQuantity} // Lấy giá trị từ state
                                                            onChange={(value) =>
                                                                handleVariantChange(variant.key, 'stockQuantity', value) // Cập nhật state
                                                            }
                                                            style={{ width: '100%' }}
                                                            placeholder="0"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item
                                                        label={`Giảm giá (%) #${index + 1}`}
                                                        // Validation: 0 <= discount <= 100
                                                        validateStatus={variant.discount < 0 || variant.discount > 100 ? "error" : ""}
                                                        help={variant.discount < 0 || variant.discount > 100 ? "Từ 0 đến 100" : ""}
                                                    >
                                                        <InputNumber
                                                            min={0}
                                                            max={100} // Giảm giá tối đa 100%
                                                            value={variant.discount} // Lấy giá trị từ state
                                                            onChange={(value) => handleVariantChange(variant.key, 'discount', value)} // Cập nhật state
                                                            style={{ width: '100%' }}
                                                            placeholder="0"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Col>
                                        {/* Cột con chứa ảnh xem trước */}
                                        <Col xs={24} sm={10}>
                                            <Form.Item label={`Ảnh xem trước #${index + 1}`}>
                                                {/* Khung chứa ảnh */}
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '120px', border: '1px dashed #ccc', borderRadius: '4px' }}>
                                                    {/* Hiển thị ảnh nếu có URL, ngược lại hiển thị chữ "Ảnh" */}
                                                    {variant.imageUrl ? (
                                                        <Image
                                                            height={110} // Chiều cao tối đa của ảnh
                                                            src={variant.imageUrl} // Nguồn ảnh
                                                            style={{ objectFit: 'contain' }} // Đảm bảo ảnh không bị méo
                                                            fallback="/placeholder-image.png" // Ảnh hiển thị nếu URL lỗi
                                                        />
                                                    ) : (
                                                        <span style={{ color: '#bfbfbf' }}>Chưa có ảnh</span>
                                                    )}
                                                </div>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </div>

                        {/* Nút thêm biến thể mới */}
                        <Button
                            type="dashed" // Kiểu nút nét đứt
                            onClick={addVariant} // Gọi hàm thêm biến thể
                            icon={<PlusOutlined />} // Icon dấu cộng
                            style={{ width: '100%', marginTop: 16 }}
                        >
                            Thêm Biến Thể Khác
                        </Button>
                    </Col> {/* Kết thúc Cột 2 */}
                </Row> {/* Kết thúc Row chính */}

                <Divider style={{ margin: '24px 0' }} />

                {/* Hàng chứa các nút action (Hủy, Thêm) */}
                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}> {/* Căn phải và không có margin dưới */}
                    <Space> {/* Tạo khoảng cách giữa các nút */}
                        <Button type="default" onClick={() => setModalChild(null)}>
                            Hủy Bỏ
                        </Button>
                        <Button type="primary" htmlType="submit"> {/* htmlType="submit" để trigger onFinish */}
                            Thêm Sản Phẩm
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default AddProduct;