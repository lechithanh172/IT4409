// EditProduct.jsx
import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Space,
  Row,
  Col,
  Divider,
  message,
  Image,
  Select,
  Checkbox, // Thêm Checkbox
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import apiService from "../../../services/api";

// --- Dữ liệu cứng Category/Brand (Nên fetch từ API) ---
const allCategory = [
  { categoryId: 1, name: "Laptop" }, { categoryId: 2, name: "Tablet" }, { categoryId: 3, name: "Smartphone" },
  { categoryId: 4, name: "Accessory" }, { categoryId: 5, name: "Monitor" }, { categoryId: 6, name: "Printer" },
  { categoryId: 7, name: "Router" }, { categoryId: 8, name: "Speaker" }, { categoryId: 9, name: "Camera" },
  { categoryId: 10, name: "Smartwatch" }, { categoryId: 13, name: "bàn phím" }, { categoryId: 14, name: "chuột" }, { categoryId: 16, name: "tv" },
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
  // Thêm các brand khác nếu cần
];
// --- Kết thúc dữ liệu cứng ---

// Tạo options cho Select Category
const categoryOptions = allCategory.map((cat) => ({
  value: cat.name,
  label: cat.name,
}));
// Tạo options cho Select Brand (bao gồm cả ảnh)
const brandOptions = allBrand.map((brand) => ({
  value: brand.name, // Dùng tên brand làm value (hoặc brandId nếu API backend dùng ID)
  label: brand.name,
  image: brand.logoUrl,
}));

// Component EditProduct nhận props: product (dữ liệu sản phẩm cần sửa), setModalChild (để đóng modal), handleRefresh (để refresh list)
const EditProduct = ({ product, setModalChild, handleRefresh }) => {
  const [form] = Form.useForm(); // Hook để quản lý Form Antd

  // State để lưu danh sách các biến thể (variants) của sản phẩm
  // Khởi tạo state này từ dữ liệu `product.variants` truyền vào
  const initialVariants = (product?.variants || []).map((variant, index) => ({
    key: variant.variantId || `existing_${index}`, // Dùng variantId làm key nếu có, nếu không thì tạo key tạm
    variantId: variant.variantId, // Lưu lại variantId để gửi lên API khi cập nhật
    color: variant.color || "",
    imageUrl: variant.imageUrl || "",
    stockQuantity: variant.stockQuantity ?? 0,
    discount: variant.discount ?? 0,
  }));
  const [variants, setVariants] = useState(initialVariants);

  // State để lưu URL ảnh của thương hiệu đang được chọn (để hiển thị logo)
  const [selectedBrandImage, setSelectedBrandImage] = useState(null);

  // useEffect để cập nhật form và state khi `product` prop thay đổi (khi mở modal)
  useEffect(() => {
    if (product) {
      // Đặt các giá trị ban đầu cho các trường trong Form Antd
      form.setFieldsValue({
        productName: product.productName,
        description: product.description,
        weight: product.weight,
        price: product.price,
        categoryName: product.categoryName,
        brandName: product.brandName, // Giá trị này sẽ tự động khớp với option trong Select Brand
        supportRushOrder: product.supportRushOrder || false, // Đặt giá trị cho Checkbox
        // Đặt giá trị cho Form.List specifications
        // Cần đảm bảo product.specifications là một mảng các object {group, title, content}
        specifications: (product.specifications || []).map(spec => ({
            group: spec.group || '',
            title: spec.title || '',
            content: spec.content || ''
        })),
      });

      // Tìm và đặt URL ảnh logo của thương hiệu ban đầu
      const brandData = brandOptions.find(
        (b) => b.value === product.brandName // So sánh theo tên brand (value của option)
      );
      setSelectedBrandImage(brandData ? brandData.image : null); // Cập nhật state ảnh logo

      // Cập nhật lại state `variants` từ `product` prop phòng trường hợp dữ liệu bị stale
      const updatedInitialVariants = (product.variants || []).map(
        (variant, index) => ({
          key: variant.variantId || `existing_${index}`,
          variantId: variant.variantId,
          color: variant.color || "",
          imageUrl: variant.imageUrl || "",
          stockQuantity: variant.stockQuantity ?? 0,
          discount: variant.discount ?? 0,
        })
      );
      setVariants(updatedInitialVariants);
    }
    // Dependency array: Chạy lại effect khi `product` hoặc `form` thay đổi
  }, [product, form]);

  // Xử lý khi người dùng chọn một thương hiệu khác trong Select
  const handleBrandChange = (value) => {
    const selected = brandOptions.find((b) => b.value === value);
    setSelectedBrandImage(selected ? selected.image : null); // Cập nhật ảnh logo hiển thị
    // form.setFieldsValue({ brandName: value }); // Antd Select tự xử lý việc cập nhật giá trị vào form state
  };

  // Xử lý khi form submit thất bại (do validation errors)
  const onFinishFailed = (errorInfo) => {
    console.log("Thất bại:", errorInfo);
    message.error("Vui lòng kiểm tra lại các trường thông tin còn thiếu hoặc không hợp lệ.");
  };

  // Thêm một dòng biến thể mới vào state `variants`
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        key: `new_${Date.now()}_${variants.length}`, // Tạo key mới, duy nhất cho biến thể mới
        variantId: undefined, // Biến thể mới chưa có ID từ DB
        color: "",
        imageUrl: "",
        stockQuantity: 0,
        discount: 0,
      },
    ]);
  };

  // Xóa một biến thể khỏi state `variants` dựa vào key
  const removeVariant = (keyToRemove) => {
    // Ngăn không cho xóa nếu chỉ còn một biến thể
    if (variants.length <= 1) {
      message.warning("Sản phẩm phải có ít nhất một biến thể.");
      return;
    }
    setVariants(variants.filter((variant) => variant.key !== keyToRemove));
    // TODO: Nếu cần, gọi API để xóa biến thể này khỏi DB ngay lập tức hoặc đánh dấu để xóa khi submit
  };

  // Cập nhật thông tin (field) của một biến thể cụ thể trong state `variants`
  const handleVariantChange = (key, field, value) => {
    setVariants(
      variants.map((variant) =>
        variant.key === key ? { ...variant, [field]: value } : variant
      )
    );
  };

  // Xử lý khi submit form thành công (sau khi đã qua validation)
  const onFinish = async (values) => {
    // Kiểm tra ID sản phẩm có hợp lệ không
    if (!product || !product.productId) {
      message.error("ID sản phẩm không hợp lệ để cập nhật.");
      return;
    }

    // Kiểm tra thông tin các biến thể trong state `variants`
    const invalidVariant = variants.some(
      (v) => !v.color || v.stockQuantity === null || v.stockQuantity === undefined || v.stockQuantity < 0
    );
    if (invalidVariant) {
      message.error(
        "Vui lòng nhập đầy đủ thông tin hợp lệ (Màu sắc, Số lượng >= 0) cho tất cả các biến thể!"
      );
      return; // Dừng lại nếu có biến thể không hợp lệ
    }

    // Kiểm tra thông tin các thông số kỹ thuật từ `values` (đã được Form quản lý)
    const invalidSpecification = (values.specifications || []).some(spec => !spec || !spec.group || !spec.title || !spec.content);
    if (invalidSpecification) {
        message.error('Vui lòng nhập đầy đủ thông tin (Nhóm, Tiêu đề, Nội dung) cho tất cả các thông số kỹ thuật!');
        // form.validateFields(['specifications']); // Có thể không focus đúng chỗ
        return;
    }

    try {
      // Chuẩn bị dữ liệu để gửi lên API
      const data = {
        productId: product.productId, // ID của sản phẩm cần cập nhật
        productName: values.productName || "",
        description: values.description || "",
        weight: values.weight ?? 0,
        price: values.price ?? 0,
        categoryName: values.categoryName || "",
        brandName: values.brandName || "", // Lấy từ form values
        supportRushOrder: values.supportRushOrder || false, // Lấy từ form values
        // Lấy danh sách thông số kỹ thuật từ form values
        specifications: (values.specifications || []).map(spec => ({
            group: spec.group || '',
            title: spec.title || '',
            content: spec.content || ''
        })),
        // Ánh xạ state `variants` sang định dạng API yêu cầu
        // Bao gồm `variantId` cho các biến thể đã tồn tại để backend biết cần update hay insert
        variants: variants.map((variant) => ({
          ...(variant.variantId && { variantId: variant.variantId }), // Chỉ thêm variantId nếu nó tồn tại (biến thể cũ)
          color: variant.color,
          imageUrl: variant.imageUrl || "",
          stockQuantity: variant.stockQuantity ?? 0,
          discount: variant.discount ?? 0,
        })),
      };

      console.log("Dữ liệu gửi lên API (Cập nhật):", data);

      // --- Gọi API (Giả lập) ---
      // TODO: Thay thế bằng gọi API thật
      // await apiService.updateProduct(data);
      message.success(`(Giả lập) Sản phẩm ${data.productName} đã được cập nhật!`);
      // --- Kết thúc gọi API ---

      handleRefresh(); // Refresh lại danh sách sản phẩm ở component cha
      setModalChild(null); // Đóng modal chỉnh sửa
    } catch (e) {
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        "Đã xảy ra lỗi khi cập nhật sản phẩm";
      console.error("Lỗi cập nhật sản phẩm:", e.response || e);
      message.error(errorMessage);
    }
  };

  // Nếu chưa có dữ liệu `product`, hiển thị loading
  if (!product) {
    return <div>Đang tải dữ liệu sản phẩm...</div>;
  }

  return (
    // Container chính của form chỉnh sửa
    <div
      style={{
        width: "80vw", // Chiều rộng 80% viewport
        maxWidth: "1200px", // Chiều rộng tối đa
        minWidth: "700px", // Chiều rộng tối thiểu
        margin: "auto", // Căn giữa
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 20, // Tăng khoảng cách dưới tiêu đề
          textAlign: "center",
          fontSize: "24px",
        }}
      >
        Chỉnh Sửa Sản Phẩm
      </h2>
      {/* Component Form của Ant Design */}
      <Form
        form={form} // Liên kết form instance
        name="chinhSuaSanPham"
        layout="vertical"
        onFinish={onFinish} // Hàm xử lý khi submit thành công
        onFinishFailed={onFinishFailed} // Hàm xử lý khi submit thất bại
        autoComplete="off"
        // Không cần initialValues ở đây vì dùng form.setFieldsValue trong useEffect
      >
        {/* Chia layout thành 2 cột */}
        <Row gutter={24}>
          {/* === Cột 1: Thông tin chung và Thông số kỹ thuật === */}
          <Col xs={24} md={12}>
            {/* Trường Tên Sản Phẩm */}
            <Form.Item
              label="Tên Sản Phẩm"
              name="productName"
              rules={[{ required: true, message: "Hãy nhập tên sản phẩm!" }]}
            >
              <Input />
            </Form.Item>
            {/* Trường Danh Mục */}
            <Form.Item
              label="Danh Mục"
              name="categoryName"
              rules={[{ required: true, message: "Hãy chọn danh mục!" }]}
            >
              <Select
                showSearch
                placeholder="Chọn danh mục"
                optionFilterProp="label"
                options={categoryOptions}
              />
            </Form.Item>
            {/* Trường Thương Hiệu */}
            <Form.Item
              label="Thương Hiệu"
              name="brandName" // Tên field này phải khớp với key trong form.setFieldsValue
              rules={[{ required: true, message: "Hãy chọn thương hiệu!" }]}
            >
              <Row gutter={16} align="middle">
                <Col flex="auto">
                  <Select
                    showSearch
                    placeholder="Chọn thương hiệu"
                    optionFilterProp="label"
                    options={brandOptions}
                    onChange={handleBrandChange} // Cập nhật ảnh logo khi thay đổi
                    style={{ width: "100%" }}
                    allowClear
                    onClear={() => setSelectedBrandImage(null)} // Xóa ảnh khi clear
                  />
                </Col>
                <Col>
                  {/* Hiển thị logo thương hiệu đã chọn */}
                  {selectedBrandImage && (
                    <div
                      style={{
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        marginLeft: "8px",
                      }}
                    >
                      <Image
                        height={32}
                        src={selectedBrandImage}
                        preview={false}
                        style={{
                          objectFit: "contain",
                          border: "1px solid #d9d9d9",
                          borderRadius: "4px",
                          padding: "2px",
                        }}
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
              rules={[{ required: true, message: "Hãy nhập mô tả!" }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            {/* Hàng chứa Giá và Cân nặng */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Giá Gốc (VNĐ)"
                  name="price"
                  rules={[
                    { required: true, message: "Hãy nhập giá sản phẩm!" },
                    { type: "number", min: 0, message: "Giá phải là số không âm!" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Cân nặng (kg)"
                  name="weight"
                  rules={[
                    { required: true, message: "Hãy nhập cân nặng!" },
                    { type: "number", min: 0, message: "Cân nặng phải là số không âm!" },
                  ]}
                >
                  <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            {/* Trường Hỗ trợ giao hàng nhanh */}
            <Form.Item
              name="supportRushOrder"
              valuePropName="checked" // Quan trọng cho Checkbox
            >
              <Checkbox>Hỗ trợ giao hàng nhanh</Checkbox>
            </Form.Item>

            <Divider>Thông số kỹ thuật</Divider>
            {/* Form.List để quản lý các thông số kỹ thuật */}
            <Form.List name="specifications">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'baseline' }} align="baseline">
                      {/* Trường Nhóm */}
                      <Form.Item
                        {...restField}
                        name={[name, 'group']}
                        rules={[{ required: true, message: 'Nhập nhóm' }]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="Nhóm" />
                      </Form.Item>
                       {/* Trường Tiêu đề */}
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        rules={[{ required: true, message: 'Nhập tiêu đề' }]}
                         style={{ flex: 1 }}
                      >
                        <Input placeholder="Tiêu đề" />
                      </Form.Item>
                       {/* Trường Nội dung */}
                      <Form.Item
                        {...restField}
                        name={[name, 'content']}
                        rules={[{ required: true, message: 'Nhập nội dung' }]}
                         style={{ flex: 2 }}
                      >
                        <Input placeholder="Nội dung" />
                      </Form.Item>
                      {/* Nút xóa */}
                      <MinusCircleOutlined onClick={() => remove(name)} title="Xóa thông số này"/>
                    </Space>
                  ))}
                   {/* Nút thêm */}
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
            <h3 style={{ marginBottom: 16, textAlign: "center" }}>Biến thể Sản Phẩm</h3>
            {/* Container cho danh sách biến thể */}
            <div style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: "10px" }}>
              {/* Render từng biến thể từ state `variants` */}
              {variants.map((variant, index) => (
                <div key={variant.key} style={{ marginBottom: 16, padding: "16px", border: "1px solid #e8e8e8", borderRadius: "8px", position: "relative" }}>
                  {/* Nút xóa biến thể */}
                  {variants.length > 1 && (
                    <Button icon={<MinusCircleOutlined />} onClick={() => removeVariant(variant.key)} type="text" danger style={{ position: "absolute", top: 5, right: 5, padding: 5, zIndex: 10, lineHeight: 0, cursor: "pointer" }} title="Xóa biến thể này" />
                  )}
                  {/* Layout hàng cho mỗi biến thể */}
                  <Row gutter={16}>
                    {/* Cột con chứa thông tin */}
                    <Col xs={24} sm={14}>
                      {/* Trường Màu sắc */}
                      <Form.Item label={`Màu sắc #${index + 1}`} required validateStatus={!variant.color ? "error" : ""} help={!variant.color ? "Vui lòng nhập màu sắc" : ""}>
                        <Input placeholder="VD: Xanh dương" value={variant.color} onChange={(e) => handleVariantChange(variant.key, "color", e.target.value)} />
                      </Form.Item>
                      {/* Trường URL ảnh */}
                      <Form.Item label={`Url ảnh #${index + 1}`}>
                        <Input placeholder="https://example.com/anh-bien-the.jpg" value={variant.imageUrl} onChange={(e) => handleVariantChange(variant.key, "imageUrl", e.target.value)} />
                      </Form.Item>
                      {/* Hàng con chứa Số lượng và Giảm giá */}
                      <Row gutter={8}>
                        <Col span={12}>
                          <Form.Item label={`Số lượng #${index + 1}`} required validateStatus={variant.stockQuantity === null || variant.stockQuantity === undefined || variant.stockQuantity < 0 ? "error" : ""} help={variant.stockQuantity === null || variant.stockQuantity === undefined || variant.stockQuantity < 0 ? "Số lượng >= 0" : ""}>
                            <InputNumber min={0} value={variant.stockQuantity} onChange={(value) => handleVariantChange(variant.key, "stockQuantity", value)} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label={`Giảm giá (%) #${index + 1}`} validateStatus={variant.discount < 0 || variant.discount > 100 ? "error" : ""} help={variant.discount < 0 || variant.discount > 100 ? "Từ 0 đến 100" : ""}>
                            <InputNumber min={0} max={100} value={variant.discount} onChange={(value) => handleVariantChange(variant.key, "discount", value)} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    {/* Cột con chứa ảnh xem trước */}
                    <Col xs={24} sm={10}>
                      <Form.Item label={`Ảnh xem trước #${index + 1}`}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "120px", border: "1px dashed #ccc", borderRadius: "4px" }}>
                          {/* Hiển thị ảnh hoặc chữ placeholder */}
                          {variant.imageUrl ? ( <Image height={110} src={variant.imageUrl} style={{ objectFit: "contain" }} fallback="/placeholder-image.png"/> ) : ( <span style={{ color: "#bfbfbf" }}>Chưa có ảnh</span> )}
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
            {/* Nút thêm biến thể */}
            <Button type="dashed" onClick={addVariant} icon={<PlusOutlined />} style={{ width: "100%", marginTop: 16 }}> Thêm Biến Thể Khác </Button>
          </Col> {/* Kết thúc Cột 2 */}
        </Row> {/* Kết thúc Row chính */}
        <Divider style={{ margin: '24px 0' }} /> {/* Đường kẻ ngang phân cách */}

        {/* Hàng chứa các nút action */}
        <Form.Item style={{ textAlign: "right", marginBottom: 0 }}> {/* Căn phải */}
          <Space>
            <Button type="default" size="middle" onClick={() => setModalChild(null)}> Hủy Bỏ </Button>
            <Button type="primary" size="middle" htmlType="submit"> Cập Nhật Sản Phẩm </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditProduct;