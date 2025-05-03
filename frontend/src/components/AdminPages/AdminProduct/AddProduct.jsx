import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Space,
  Row,
  Col,
  message,
  Image,
  Select,
  Divider,
  Checkbox,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import apiService from "../../../services/api"; // Đảm bảo đường dẫn đúng

const AddProduct = ({ setModalChild, handleRefresh }) => {
  const [form] = Form.useForm();
  const [variants, setVariants] = useState([
    {
      key: Date.now() + "_initial",
      color: "",
      stockQuantity: 0,
      discountPercentage: 0,
      imageUrl: "",
    },
  ]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandOptions, setBrandOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandResponse, categoryResponse] = await Promise.all([
          apiService.getAllBrands(),
          apiService.getAllCategories(),
        ]);

        const fetchedBrands = brandResponse?.data || [];
        const brandOpts = fetchedBrands.map((brand) => ({
          value: brand.brandId,
          label: brand.brandName,
          image: brand.logoUrl,
        }));
        setBrandOptions(brandOpts);

        const fetchedCategories = categoryResponse?.data || [];
        const categoryOpts = fetchedCategories.map((category) => ({
          value: category.categoryName,
          label: category.categoryName,
        }));
        setCategoryOptions(categoryOpts);
      } catch (error) {
        console.error("Lỗi khi tải danh sách thương hiệu/danh mục:", error);
        message.error("Không thể tải danh sách thương hiệu hoặc danh mục.");
      }
    };
    fetchData();
  }, []);

  const handleSelectBrandChange = (value) => {
    const selected = brandOptions.find((b) => b.value === value);
    setSelectedBrand(selected || null);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Thất bại:", errorInfo);
    message.error(
      "Vui lòng kiểm tra lại các trường thông tin còn thiếu hoặc không hợp lệ."
    );
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        key: Date.now() + Math.random(),
        color: "",
        stockQuantity: 0,
        discountPercentage: 0,
        imageUrl: "",
      },
    ]);
  };

  const removeVariant = (keyToRemove) => {
    if (variants.length <= 1) {
      message.warning("Sản phẩm phải có ít nhất một biến thể.");
      return;
    }
    setVariants(variants.filter((variant) => variant.key !== keyToRemove));
  };

  const handleVariantChange = (key, field, value) => {
    setVariants(
      variants.map((variant) =>
        variant.key === key ? { ...variant, [field]: value } : variant
      )
    );
  };

  const onFinish = async (values) => {
    if (!selectedBrand) {
      message.error("Vui lòng chọn thương hiệu!");
      form.validateFields(["selectedBrandId"]);
      return;
    }

    // Kiểm tra thông tin các biến thể
    const invalidVariant = variants.some(
      (v) =>
        !v.color ||
        v.stockQuantity === null ||
        v.stockQuantity === undefined ||
        v.stockQuantity < 0 ||
        v.discountPercentage < 0 ||
        v.discountPercentage > 100
    );
    if (invalidVariant) {
      message.error(
        "Vui lòng nhập đầy đủ thông tin hợp lệ (Màu sắc, Số lượng >= 0, Giảm giá 0-100) cho tất cả các biến thể!"
      );
      return;
    }

    // Kiểm tra thông tin các thông số kỹ thuật
    const invalidSpecification = (values.specifications || []).some(
      (spec) => !spec || !spec.group || !spec.title || !spec.content
    );
    if (invalidSpecification) {
      message.error(
        "Vui lòng nhập đầy đủ thông tin (Nhóm, Tiêu đề, Nội dung) cho tất cả các thông số kỹ thuật!"
      );
      return;
    }

    try {
      // Chuẩn bị dữ liệu gửi đi API
      const data = {
        productName: values.productName || "",
        description: values.description || "",
        price: values.price ?? 0,
        weight: values.weight ?? 0,
        categoryName: values.categoryName || "", // Lấy categoryName từ form
        brandName: selectedBrand.label, // Lấy brandName từ state đã chọn
        supportRushOrder: values.supportRushOrder || false,
        specifications: JSON.stringify(
          (values.specifications || []).map((spec) => ({
            // Ví dụ chuyển thành JSON
            group: spec.group || "",
            title: spec.title || "",
            content: spec.content || "",
          }))
        ),
        variants: variants.map((variant) => ({
          color: variant.color,
          imageUrl: variant.imageUrl || null, // Gửi null nếu rỗng? Hoặc '' tùy API
          stockQuantity: variant.stockQuantity ?? 0,
          discountPercentage: variant.discountPercentage ?? 0,
        })),
      };

      console.log("Dữ liệu gửi lên API (Thêm mới):", data);
      await apiService.addProduct(data);
      message.success(`Sản phẩm ${data.productName} được thêm thành công!`);
      handleRefresh(); // Refresh danh sách
      setModalChild(null); // Đóng modal
    } catch (e) {
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        "Đã xảy ra lỗi khi thêm sản phẩm";
      console.error("Lỗi thêm sản phẩm:", e.response || e);
      message.error(errorMessage);
    }
  };

  return (
    <div
      style={{
        width: "80vw",
        maxWidth: "1200px",
        minWidth: "700px",
        margin: "auto",
      }}
    >
      <Form
        form={form}
        name="themSanPham"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        initialValues={{
          supportRushOrder: false,
          specifications: [{ group: "", title: "", content: "" }],
          price: 0,
          weight: 0,
        }}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Tên Sản Phẩm"
              name="productName"
              rules={[{ required: true, message: "Hãy nhập tên sản phẩm!" }]}
            >
              <Input placeholder="Ví dụ: iPhone 17 Pro Max" />
            </Form.Item>

            {/* Trường Danh Mục */}
            <Form.Item
              label="Danh Mục"
              name="categoryName" // Name phải khớp với key trong object data gửi đi
              rules={[{ required: true, message: "Hãy chọn danh mục!" }]}
            >
              <Select
                showSearch
                placeholder="Chọn danh mục"
                optionFilterProp="label"
                options={categoryOptions}
              />
            </Form.Item>

            {/* Phần chọn Thương hiệu */}
            <Form.Item label="Thương Hiệu" required>
              <Row gutter={16} align="middle">
                <Col flex="auto">
                  <Form.Item
                    name="selectedBrandId" // Dùng để validate nhưng giá trị thực lấy từ state
                    noStyle
                    rules={[
                      { required: true, message: "Hãy chọn thương hiệu!" },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Chọn thương hiệu có sẵn"
                      optionFilterProp="label"
                      onChange={handleSelectBrandChange}
                      options={brandOptions} // Sử dụng state brandOptions
                      value={selectedBrand ? selectedBrand.value : undefined} // Hiển thị brandId đã chọn
                      style={{ width: "100%" }}
                      allowClear
                      onClear={() => setSelectedBrand(null)}
                    />
                  </Form.Item>
                </Col>
                <Col>
                  {selectedBrand && (
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
                        src={selectedBrand.image || "/placeholder-logo.png"}
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

            <Form.Item
              label="Mô tả sản phẩm"
              name="description"
              rules={[{ required: true, message: "Hãy nhập mô tả!" }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Giá Gốc (VNĐ)"
                  name="price"
                  rules={[
                    { required: true, message: "Hãy nhập giá sản phẩm!" },
                    {
                      type: "number",
                      min: 0,
                      message: "Giá phải là số không âm!",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    style={{ width: "100%" }}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Cân nặng (kg)"
                  name="weight"
                  rules={[
                    { required: true, message: "Hãy nhập cân nặng!" },
                    {
                      type: "number",
                      min: 0,
                      message: "Cân nặng phải là số không âm!",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    step={0.1}
                    style={{ width: "100%" }}
                    placeholder="0.0"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="supportRushOrder" valuePropName="checked">
              <Checkbox>Hỗ trợ giao hàng nhanh</Checkbox>
            </Form.Item>

            <Divider>Thông số kỹ thuật</Divider>
            <Form.List name="specifications">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{
                        display: "flex",
                        marginBottom: 8,
                        alignItems: "baseline",
                      }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "group"]}
                        rules={[{ required: true, message: "Nhập nhóm" }]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="Nhóm (VD: Màn hình)" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "title"]}
                        rules={[{ required: true, message: "Nhập tiêu đề" }]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="Tiêu đề (VD: Kích thước)" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "content"]}
                        rules={[{ required: true, message: "Nhập nội dung" }]}
                        style={{ flex: 2 }}
                      >
                        <Input placeholder="Nội dung (VD: 6.7 inch)" />
                      </Form.Item>
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        title="Xóa thông số này"
                      />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add({ group: "", title: "", content: "" })}
                      block
                      icon={<PlusOutlined />}
                    >
                      Thêm thông số kỹ thuật
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Col>

          <Col xs={24} md={12}>
            <h3 style={{ marginBottom: 16, textAlign: "center" }}>
              Mẫu Sản Phẩm
            </h3>
            <div
              style={{
                maxHeight: "65vh",
                overflowY: "auto",
                paddingRight: "10px",
              }}
            >
              {variants.map((variant, index) => (
                <div
                  key={variant.key}
                  style={{
                    marginBottom: 16,
                    padding: "16px",
                    border: "1px solid #e8e8e8",
                    borderRadius: "8px",
                    position: "relative",
                  }}
                >
                  {variants.length > 1 && (
                    <Button
                      icon={<MinusCircleOutlined />}
                      onClick={() => removeVariant(variant.key)}
                      type="text"
                      danger
                      style={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        zIndex: 10,
                        padding: 5,
                      }}
                      title="Xóa biến thể này"
                    />
                  )}
                  <Row gutter={16}>
                    <Col xs={24} sm={14}>
                      <Form.Item label={`Màu sắc #${index + 1}`} required>
                        <Input
                          placeholder="VD: Xanh dương"
                          value={variant.color}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.key,
                              "color",
                              e.target.value
                            )
                          }
                        />
                      </Form.Item>
                      <Form.Item label={`Url ảnh #${index + 1}`}>
                        <Input
                          placeholder="https://example.com/anh-mau-san-pham.jpg"
                          value={variant.imageUrl}
                          onChange={(e) => {
                            handleVariantChange(
                              variant.key,
                              "imageUrl",
                              e.target.value
                            );
                          }}
                        />
                      </Form.Item>
                      <Row gutter={8}>
                        <Col span={12}>
                          <Form.Item label={`Số lượng #${index + 1}`} required>
                            <InputNumber
                              min={0}
                              value={variant.stockQuantity}
                              onChange={
                                (value) =>
                                  handleVariantChange(
                                    variant.key,
                                    "stockQuantity",
                                    value ?? 0
                                  ) // Handle null/undefined from InputNumber
                              }
                              style={{ width: "100%" }}
                              placeholder="0"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label={`Giảm giá (%) #${index + 1}`}
                            validateStatus={
                              variant.discountPercentage < 0 ||
                              variant.discountPercentage > 100
                                ? "error"
                                : ""
                            }
                            help={
                              variant.discountPercentage < 0 ||
                              variant.discountPercentage > 100
                                ? "Từ 0 đến 100"
                                : ""
                            }
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              value={variant.discountPercentage}
                              onChange={(value) =>
                                handleVariantChange(
                                  variant.key,
                                  "discountPercentage",
                                  value ?? 0
                                )
                              } // Handle null/undefined
                              style={{ width: "100%" }}
                              placeholder="0"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <Col xs={24} sm={10}>
                      <Form.Item label={`Ảnh xem trước #${index + 1}`}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "120px",
                            border: "1px dashed #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          {variant.imageUrl ? (
                            <Image
                              height={110}
                              src={variant.imageUrl}
                              style={{ objectFit: "contain" }}
                              fallback="/placeholder-image.png"
                            />
                          ) : (
                            <span style={{ color: "#bfbfbf" }}>
                              Chưa có ảnh
                            </span>
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
              style={{ width: "100%", marginTop: 16 }}
            >
              Thêm Mẫu Khác
            </Button>
          </Col>
        </Row>

        <Divider style={{ margin: "24px 0" }} />

        <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
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
