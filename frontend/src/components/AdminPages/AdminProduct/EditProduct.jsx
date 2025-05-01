import React, { useState, useEffect, useMemo } from "react";
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
  Checkbox,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import apiService from "../../../services/api"; // Đảm bảo đường dẫn này chính xác


// Component EditProduct nhận props: product (dữ liệu sản phẩm cần sửa), setModalChild (để đóng modal), handleRefresh (để refresh list), categoriesList, brandsList
const EditProduct = ({ product, setModalChild, handleRefresh, categoriesList = [], brandsList = [] }) => {
  const [form] = Form.useForm(); // Hook để quản lý Form Antd

  // State để lưu danh sách các biến thể (variants) của sản phẩm
  // Khởi tạo từ prop product.variants
  const initialVariants = useMemo(() => (product?.variants || []).map((variant, index) => ({
    key: variant.variantId || `existing_${index}`, // Dùng variantId làm key nếu có, nếu không thì tạo key tạm
    variantId: variant.variantId, // Lưu lại variantId để gửi lên API khi cập nhật
    color: variant.color || "",
    imageUrl: variant.imageUrl || "",
    stockQuantity: variant.stockQuantity ?? 0,
    discount: variant.discount ?? 0,
  })), [product?.variants]); // Tính toán lại chỉ khi product.variants thay đổi


  // Các options đã được memoize cho component Select
  const categoryOptions = useMemo(() => (
    categoriesList.map(cat => ({
        value: cat.categoryName || `Danh mục ${cat.categoryId}`, // Value cần khớp với form item name="categoryName"
        label: cat.categoryName || `Danh mục ${cat.categoryId}`
    }))
  ), [categoriesList]);

  const brandOptions = useMemo(() => (
    brandsList.map(brand => ({
        value: brand.brandName || `Thương hiệu ${brand.brandId}`, // Value cần khớp với form item name="brandName"
        label: brand.brandName || `Thương hiệu ${brand.brandId}`,
        image: brand.logoUrl
    }))
  ), [brandsList]);

  const [variants, setVariants] = useState(initialVariants);
  const [selectedBrandImage, setSelectedBrandImage] = useState(null); // State cho URL logo thương hiệu được chọn

  // useEffect để cập nhật form và state khi prop `product` thay đổi (khi mở modal)
  useEffect(() => {
    if (product) {
      // *** CHUYỂN ĐỔI CHUỖI SPECIFICATIONS THÀNH MẢNG ***
      let parsedSpecifications = [];
      if (product.specifications && typeof product.specifications === 'string') {
        try {
          parsedSpecifications = JSON.parse(product.specifications);
          // Kiểm tra cơ bản: đảm bảo nó là một mảng và các đối tượng có key mong đợi
          if (!Array.isArray(parsedSpecifications)) {
            console.error("Thông số kỹ thuật đã parse không phải là mảng:", parsedSpecifications);
            parsedSpecifications = []; // Reset nếu không phải là mảng
          } else {
            // Đảm bảo mỗi mục có các key cần thiết, cung cấp giá trị mặc định nếu thiếu
            parsedSpecifications = parsedSpecifications.map(spec => ({
                group: spec?.group || '',
                title: spec?.title || '',
                content: spec?.content || ''
            }));
          }
        } catch (error) {
          console.error("Không thể parse chuỗi JSON thông số kỹ thuật:", product.specifications, error);
          message.error("Lỗi định dạng dữ liệu thông số kỹ thuật nhận được.");
          parsedSpecifications = []; // Mặc định là mảng rỗng nếu có lỗi parse
        }
      } else if (Array.isArray(product.specifications)) {
         // Xử lý trường hợp API đôi khi có thể trả về một mảng
         console.warn("Nhận được thông số kỹ thuật dưới dạng mảng trực tiếp, mong đợi chuỗi JSON.");
         parsedSpecifications = product.specifications.map(spec => ({
             group: spec?.group || '',
             title: spec?.title || '',
             content: spec?.content || ''
         }));
      }
      // *******************************************

      // Đặt giá trị ban đầu cho các trường Form
      form.setFieldsValue({
        productName: product.productName,
        description: product.description,
        weight: product.weight,
        price: product.price,
        categoryName: product.categoryName,
        brandName: product.brandName, // Giá trị này sẽ khớp với một option trong Select Thương hiệu
        supportRushOrder: product.supportRushOrder || false, // Đặt giá trị Checkbox
        // Đặt mảng ĐÃ PARSE vào Form.List cho specifications
        specifications: parsedSpecifications,
      });

      // Tìm và đặt URL logo thương hiệu ban đầu
      const initialBrandData = brandOptions.find(
        (b) => b.value === product.brandName // So sánh theo tên thương hiệu (value của option)
      );
      setSelectedBrandImage(initialBrandData ? initialBrandData.image : null); // Cập nhật state logo

      // Cập nhật state `variants` từ prop `product` phòng trường hợp dữ liệu bị cũ
       setVariants((product?.variants || []).map((variant, index) => ({
         key: variant.variantId || `existing_${index}`,
         variantId: variant.variantId,
         color: variant.color || "",
         imageUrl: variant.imageUrl || "",
         stockQuantity: variant.stockQuantity ?? 0,
         discount: variant.discount ?? 0,
       })));
    }
    // Mảng dependency: Chạy lại effect khi product, form, brandOptions hoặc categoryOptions thay đổi
  }, [product, form, brandOptions, categoryOptions]); // Đã thêm categoryOptions và brandOptions dependencies

  // Hàm xử lý khi thay đổi lựa chọn thương hiệu
  const handleBrandChange = (value) => { // 'value' ở đây là chuỗi brandName được chọn
    console.log('Sự kiện onChange của Select Thương hiệu được kích hoạt. Giá trị mới:', value); // Log debug
    const selectedBrand = brandOptions.find((b) => b.value === value);
    setSelectedBrandImage(selectedBrand ? selectedBrand.image : null);

    // *** CẬP NHẬT TRẠNG THÁI FORM MỘT CÁCH TƯỜNG MINH ***
    // Mặc dù Select bên trong Form.Item nên tự động xử lý việc này,
    // việc đặt giá trị một cách tường minh đảm bảo trạng thái nội bộ của form được cập nhật chính xác.
    if (value !== undefined) { // Tránh đặt undefined nếu lựa chọn bị xóa
        form.setFieldsValue({ brandName: value });
        console.log('Giá trị brandName của Form được đặt tường minh thành:', value); // Log debug để xác nhận
    } else {
        // Xử lý sự kiện xóa nếu cần (ví dụ: đặt thành null hoặc chuỗi rỗng nếu allowClear là true)
         form.setFieldsValue({ brandName: undefined }); // Đặt thành undefined hoặc null tùy theo yêu cầu
         setSelectedBrandImage(null); // Xóa ảnh khi thương hiệu bị xóa
         console.log('Giá trị brandName của Form được xóa tường minh.'); // Log debug
    }
  };


  // Hàm xử lý khi submit form thất bại (do lỗi validation)
  const onFinishFailed = (errorInfo) => {
    console.log("Submit Thất Bại:", errorInfo);
    message.error("Vui lòng kiểm tra lại các trường thông tin còn thiếu hoặc không hợp lệ.");
  };

  // Thêm một dòng biến thể mới vào state `variants`
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        key: `new_${Date.now()}_${variants.length}`, // Tạo key mới, duy nhất
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
    // Ngăn xóa nếu chỉ còn một biến thể
    if (variants.length <= 1) {
      message.warning("Sản phẩm phải có ít nhất một biến thể.");
      return;
    }
    setVariants(variants.filter((variant) => variant.key !== keyToRemove));
    // TODO: Nếu cần, gọi API để xóa biến thể này khỏi DB ngay lập tức hoặc đánh dấu để xóa khi submit
  };

  // Cập nhật một trường cụ thể của một biến thể trong state `variants`
  const handleVariantChange = (key, field, value) => {
    setVariants(
      variants.map((variant) =>
        variant.key === key ? { ...variant, [field]: value } : variant
      )
    );
  };

  // Hàm xử lý khi submit form thành công (sau khi đã qua validation)
  const onFinish = async (values) => {
    // Kiểm tra ID sản phẩm có hợp lệ không
    if (!product || !product.productId) {
      message.error("ID sản phẩm không hợp lệ để cập nhật.");
      return;
    }

    // Kiểm tra thông tin biến thể trong state `variants`
    const invalidVariant = variants.some(
      (v) => !v.color || v.stockQuantity === null || v.stockQuantity === undefined || v.stockQuantity < 0
    );
    if (invalidVariant) {
      message.error(
        "Vui lòng nhập đầy đủ thông tin hợp lệ (Màu sắc, Số lượng >= 0) cho tất cả các biến thể!"
      );
      return; // Dừng lại nếu có biến thể không hợp lệ
    }

    // Kiểm tra thông tin thông số kỹ thuật từ `values` (do Form quản lý)
    const invalidSpecification = (values.specifications || []).some(spec => !spec || !spec.group || !spec.title || !spec.content);
    if (invalidSpecification) {
        message.error('Vui lòng nhập đầy đủ thông tin (Nhóm, Tiêu đề, Nội dung) cho tất cả các thông số kỹ thuật!');
        // Cố gắng focus vào trường thông số kỹ thuật bị lỗi đầu tiên
        const firstInvalidSpecIndex = (values.specifications || []).findIndex(spec => !spec || !spec.group || !spec.title || !spec.content);
        if (firstInvalidSpecIndex !== -1) {
            const fieldName = ['specifications', firstInvalidSpecIndex, 'group']; // Focus vào 'group' của mục bị lỗi đầu tiên
             try {
                 form.scrollToField(fieldName);
             } catch(e){ console.warn("Không thể cuộn đến trường thông số kỹ thuật", e)}
        }
        return;
    }

    try {
      // *** CHUYỂN ĐỔI MẢNG SPECIFICATIONS THÀNH CHUỖI JSON TRƯỚC KHI GỬI ***
      const specificationsString = JSON.stringify(values.specifications || []);
      // *****************************************************

      // Chuẩn bị dữ liệu để gửi lên API
      const data = {
        productId: product.productId, // ID của sản phẩm cần cập nhật
        productName: values.productName || "",
        description: values.description || "",
        weight: values.weight ?? 0,
        price: values.price ?? 0,
        categoryName: values.categoryName || "",
        brandName: values.brandName || "", // Lấy từ form values (giờ đã được cập nhật đúng)
        supportRushOrder: values.supportRushOrder || false, // Lấy từ form values
        // Gửi chuỗi JSON cho specifications
        specifications: specificationsString,
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

      // --- Gọi API ---
      await apiService.updateProduct(data); // Thay thế bằng lệnh gọi API thực tế của bạn
      message.success(`Sản phẩm ${data.productName} đã được cập nhật thành công!`);
      // --- Kết thúc Gọi API ---

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

  // Hiển thị trạng thái đang tải nếu chưa có dữ liệu `product`
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
        {/* Layout chia thành 2 cột */}
        <Row gutter={24}>
          {/* === Cột 1: Thông tin chung & Thông số kỹ thuật === */}
          <Col xs={24} md={12}>
            {/* Tên Sản Phẩm */}
            <Form.Item
              label="Tên Sản Phẩm"
              name="productName"
              rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
            >
              <Input />
            </Form.Item>
            {/* Danh Mục */}
            <Form.Item
              label="Danh Mục"
              name="categoryName"
              rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
            >
              <Select
                showSearch
                placeholder="Chọn danh mục"
                optionFilterProp="label" // Tìm kiếm theo nội dung label
                filterOption={(input, option) => // Hàm lọc tùy chỉnh
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={categoryOptions}
              />
            </Form.Item>
            {/* Thương Hiệu */}
            <Form.Item
              label="Thương Hiệu"
              name="brandName" // Tên này phải khớp với key trong form.setFieldsValue
              rules={[{ required: true, message: "Vui lòng chọn thương hiệu!" }]}
            >
              <Row gutter={16} align="middle">
                <Col flex="auto">
                  <Select
                    showSearch
                    placeholder="Chọn thương hiệu"
                    optionFilterProp="label" // Tìm kiếm theo nội dung label
                    filterOption={(input, option) => // Hàm lọc tùy chỉnh
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={brandOptions}
                    onChange={handleBrandChange} // Cập nhật logo và state form khi thay đổi
                    style={{ width: "100%" }}
                    allowClear
                    onClear={() => handleBrandChange(undefined)} // Xử lý rõ ràng sự kiện clear
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
                        fallback="/placeholder-image.png" // Cung cấp đường dẫn ảnh fallback
                      />
                    </div>
                  )}
                </Col>
              </Row>
            </Form.Item>
            {/* Mô tả */}
            <Form.Item
              label="Mô tả sản phẩm"
              name="description"
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
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
                    { required: true, message: "Vui lòng nhập giá sản phẩm!" },
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
                    { required: true, message: "Vui lòng nhập cân nặng!" },
                    { type: "number", min: 0, message: "Cân nặng phải là số không âm!" },
                  ]}
                >
                  <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            {/* Checkbox Hỗ trợ giao hàng nhanh */}
            <Form.Item
              name="supportRushOrder"
              valuePropName="checked" // Quan trọng cho Checkbox với Form
            >
              <Checkbox>Hỗ trợ giao hàng nhanh</Checkbox>
            </Form.Item>

            <Divider>Thông số kỹ thuật</Divider>
            {/* Form.List để quản lý các thông số kỹ thuật động */}
            <Form.List name="specifications">
              {(fields, { add, remove }, { errors }) => ( // Destructure errors để hiển thị nếu cần
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'baseline' }} align="baseline">
                      {/* Nhóm */}
                      <Form.Item
                        {...restField}
                        name={[name, 'group']}
                        rules={[{ required: true, message: 'Nhập nhóm' }]}
                        style={{ flex: 1, marginBottom: 0 }} // Điều chỉnh margin để căn chỉnh
                      >
                        <Input placeholder="Nhóm" />
                      </Form.Item>
                       {/* Tiêu đề */}
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        rules={[{ required: true, message: 'Nhập tiêu đề' }]}
                         style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder="Tiêu đề" />
                      </Form.Item>
                       {/* Nội dung */}
                      <Form.Item
                        {...restField}
                        name={[name, 'content']}
                        rules={[{ required: true, message: 'Nhập nội dung' }]}
                         style={{ flex: 2, marginBottom: 0 }}
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
                     {/* Tùy chọn: Hiển thị lỗi cấp Form.List */}
                     <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>

          </Col> {/* Kết thúc Cột 1 */}

          {/* === Cột 2: Biến thể Sản phẩm === */}
          <Col xs={24} md={12}>
            <h3 style={{ marginBottom: 16, textAlign: "center" }}>Biến thể Sản Phẩm</h3>
            {/* Container cho danh sách biến thể */}
            <div style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: "10px" }}>
              {/* Render từng biến thể từ state `variants` */}
              {variants.map((variant, index) => (
                <div key={variant.key} style={{ marginBottom: 16, padding: "16px", border: "1px solid #e8e8e8", borderRadius: "8px", position: "relative" }}>
                  {/* Nút Xóa Biến Thể */}
                  {variants.length > 1 && (
                    <Button icon={<MinusCircleOutlined />} onClick={() => removeVariant(variant.key)} type="text" danger style={{ position: "absolute", top: 5, right: 5, padding: 5, zIndex: 10, lineHeight: 0, cursor: "pointer" }} title="Xóa biến thể này" />
                  )}
                  {/* Hàng layout cho mỗi biến thể */}
                  <Row gutter={16}>
                    {/* Cột con cho thông tin */}
                    <Col xs={24} sm={14}>
                      {/* Màu sắc */}
                      <Form.Item label={`Màu sắc #${index + 1}`} required validateStatus={!variant.color ? "error" : ""} help={!variant.color ? "Vui lòng nhập màu sắc" : ""}>
                        <Input placeholder="VD: Xanh dương" value={variant.color} onChange={(e) => handleVariantChange(variant.key, "color", e.target.value)} />
                      </Form.Item>
                      {/* URL Ảnh */}
                      <Form.Item label={`Url ảnh #${index + 1}`}>
                        <Input placeholder="https://example.com/anh-bien-the.jpg" value={variant.imageUrl} onChange={(e) => handleVariantChange(variant.key, "imageUrl", e.target.value)} />
                      </Form.Item>
                      {/* Hàng con cho Số lượng và Giảm giá */}
                      <Row gutter={8}>
                        <Col span={12}>
                          <Form.Item label={`Số lượng #${index + 1}`} required validateStatus={variant.stockQuantity === null || variant.stockQuantity === undefined || variant.stockQuantity < 0 ? "error" : ""} help={variant.stockQuantity === null || variant.stockQuantity === undefined || variant.stockQuantity < 0 ? "SL >= 0" : ""}>
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
                    {/* Cột con cho xem trước ảnh */}
                    <Col xs={24} sm={10}>
                      <Form.Item label={`Xem trước #${index + 1}`}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "120px", border: "1px dashed #ccc", borderRadius: "4px", overflow: "hidden" }}>
                          {/* Hiển thị ảnh hoặc chữ placeholder */}
                          {variant.imageUrl ? ( <Image height={118} src={variant.imageUrl} style={{ objectFit: "contain" }} fallback="/placeholder-image.png"/> ) : ( <span style={{ color: "#bfbfbf" }}>Chưa có ảnh</span> )}
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
            {/* Nút Thêm Biến Thể */}
            <Button type="dashed" onClick={addVariant} icon={<PlusOutlined />} style={{ width: "100%", marginTop: 16 }}> Thêm Biến Thể Khác </Button>
          </Col> {/* Kết thúc Cột 2 */}
        </Row> {/* Kết thúc Hàng chính */}
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