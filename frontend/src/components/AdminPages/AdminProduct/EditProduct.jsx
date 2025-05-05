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
import apiService from "../../../services/api";

const EditProduct = ({ product, setModalChild, handleRefresh, categoriesList = [], brandsList = [] }) => {
  const [form] = Form.useForm();
  const initialVariants = useMemo(() => (product?.variants || []).map((variant, index) => ({
    key: variant.variantId || `existing_${index}`,
    variantId: variant.variantId,
    color: variant.color || "",
    imageUrl: variant.imageUrl || "",
    stockQuantity: variant.stockQuantity ?? 0,
    discountPercentage: variant.discountPercentage ?? 0,
  })), [product?.variants]);

  const categoryOptions = useMemo(() => (
    categoriesList.map(cat => ({
        value: cat.categoryName || `Danh mục ${cat.categoryId}`,
        label: cat.categoryName || `Danh mục ${cat.categoryId}`
    }))
  ), [categoriesList]);

  const brandOptions = useMemo(() => (
    brandsList.map(brand => ({
        value: brand.brandName || `Thương hiệu ${brand.brandId}`,
        label: brand.brandName || `Thương hiệu ${brand.brandId}`,
        image: brand.logoUrl
    }))
  ), [brandsList]);

  const [variants, setVariants] = useState(initialVariants);
  const [selectedBrandImage, setSelectedBrandImage] = useState(null);

  useEffect(() => {
    if (product) {
      let parsedSpecifications = [];
      if (product.specifications && typeof product.specifications === 'string') {
        try {
          parsedSpecifications = JSON.parse(product.specifications);
          if (!Array.isArray(parsedSpecifications)) {
            parsedSpecifications = [];
          } else {
            parsedSpecifications = parsedSpecifications.map(spec => ({
              group: spec?.group || '',
              title: spec?.title || '',
              content: spec?.content || ''
            }));
          }
        } catch (error) {
          parsedSpecifications = [];
          message.error("Lỗi định dạng dữ liệu thông số kỹ thuật nhận được.");
        }
      } else if (Array.isArray(product.specifications)) {
         parsedSpecifications = product.specifications.map(spec => ({
             group: spec?.group || '',
             title: spec?.title || '',
             content: spec?.content || ''
         }));
      }

      form.setFieldsValue({
        productName: product.productName,
        description: product.description,
        weight: product.weight,
        price: product.price,
        categoryName: product.categoryName,
        brandName: product.brandName,
        supportRushOrder: product.supportRushOrder || false,
        specifications: parsedSpecifications,
      });

      const initialBrandData = brandOptions.find(
        (b) => b.value === product.brandName
      );
      setSelectedBrandImage(initialBrandData ? initialBrandData.image : null);

      setVariants((product?.variants || []).map((variant, index) => ({
        key: variant.variantId || `existing_${index}`,
        variantId: variant.variantId,
        color: variant.color || "",
        imageUrl: variant.imageUrl || "",
        stockQuantity: variant.stockQuantity ?? 0,
        discountPercentage: variant.discountPercentage ?? 0,
      })));
    }
  }, [product, form, brandOptions, categoryOptions]);

  const handleBrandChange = (value) => {
    const selectedBrand = brandOptions.find((b) => b.value === value);
    setSelectedBrandImage(selectedBrand ? selectedBrand.image : null);

    if (value !== undefined) {
        form.setFieldsValue({ brandName: value });
    } else {
        form.setFieldsValue({ brandName: undefined });
        setSelectedBrandImage(null);
    }
  };

  const onFinishFailed = (errorInfo) => {
    message.error("Vui lòng kiểm tra lại các trường thông tin còn thiếu hoặc không hợp lệ.");
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        key: `new_${Date.now()}_${variants.length}`,
        variantId: undefined,
        color: "",
        imageUrl: "",
        stockQuantity: 0,
        discountPercentage: 0,
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
    if (!product || !product.productId) {
      message.error("ID sản phẩm không hợp lệ để cập nhật.");
      return;
    }

    const invalidVariant = variants.some(
      (v) => !v.color || v.stockQuantity === null || v.stockQuantity === undefined || v.stockQuantity < 0
    );
    if (invalidVariant) {
      message.error(
        "Vui lòng nhập đầy đủ thông tin hợp lệ (Màu sắc, Số lượng >= 0) cho tất cả các biến thể!"
      );
      return;
    }

    const invalidSpecification = (values.specifications || []).some(spec => !spec || !spec.group || !spec.title || !spec.content);
    if (invalidSpecification) {
        message.error('Vui lòng nhập đầy đủ thông tin (Nhóm, Tiêu đề, Nội dung) cho tất cả các thông số kỹ thuật!');
        const firstInvalidSpecIndex = (values.specifications || []).findIndex(spec => !spec || !spec.group || !spec.title || !spec.content);
        if (firstInvalidSpecIndex !== -1) {
            const fieldName = ['specifications', firstInvalidSpecIndex, 'group'];
             try {
                 form.scrollToField(fieldName);
             } catch(e){}
        }
        return;
    }

    try {
      const specificationsString = JSON.stringify(values.specifications || []);

      const data = {
        productId: product.productId,
        productName: values.productName || "",
        description: values.description || "",
        weight: values.weight ?? 0,
        price: values.price ?? 0,
        categoryName: values.categoryName || "",
        brandName: values.brandName || "",
        supportRushOrder: values.supportRushOrder || false,
        specifications: specificationsString,
        variants: variants.map((variant) => ({
          ...(variant.variantId && { variantId: variant.variantId }),
          color: variant.color,
          imageUrl: variant.imageUrl || "",
          stockQuantity: variant.stockQuantity ?? 0,
          discountPercentage: variant.discountPercentage ?? 0,
        })),
      };

      await apiService.updateProduct(data);
      message.success(`Sản phẩm ${data.productName} đã được cập nhật thành công!`);
      handleRefresh();
      setModalChild(null);
    } catch (e) {
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        "Đã xảy ra lỗi khi cập nhật sản phẩm";
      message.error(errorMessage);
    }
  };

  if (!product) {
    return <div>Đang tải dữ liệu sản phẩm...</div>;
  }

  return (
    <div style={{ width: "80vw", maxWidth: "1200px", minWidth: "700px", margin: "auto" }}>
      <Form
        form={form}
        name="chinhSuaSanPham"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item label="Tên Sản Phẩm" name="productName" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Danh Mục" name="categoryName" rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}>
              <Select
                showSearch
                placeholder="Chọn danh mục"
                optionFilterProp="label"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={categoryOptions}
              />
            </Form.Item>

            <Form.Item label="Thương Hiệu" name="brandName" rules={[{ required: true, message: "Vui lòng chọn thương hiệu!" }]}>
              <Row gutter={16} align="middle">
                <Col flex="auto">
                  <Select
                    showSearch
                    placeholder="Chọn thương hiệu"
                    optionFilterProp="label"
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    options={brandOptions}
                    onChange={handleBrandChange}
                    style={{ width: "100%" }}
                    allowClear
                    onClear={() => handleBrandChange(undefined)}
                  />
                </Col>
                <Col>
                  {selectedBrandImage && (
                    <div style={{ height: "32px", display: "flex", alignItems: "center", marginLeft: "8px" }}>
                      <Image height={32} src={selectedBrandImage} preview={false} style={{ objectFit: "contain", border: "1px solid #d9d9d9", borderRadius: "4px", padding: "2px" }} />
                    </div>
                  )}
                </Col>
              </Row>
            </Form.Item>

            <Form.Item label="Mô tả sản phẩm" name="description" rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}>
              <Input.TextArea rows={4} />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Giá Gốc (VNĐ)" name="price" rules={[{ required: true, message: "Vui lòng nhập giá sản phẩm!" }, { type: "number", min: 0, message: "Giá phải là số không âm!" }]}>
                  <InputNumber min={0} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => value.replace(/\$\s?|(,*)/g, "")} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Cân nặng (kg)" name="weight" rules={[{ required: true, message: "Vui lòng nhập cân nặng!" }, { type: "number", min: 0, message: "Cân nặng phải là số không âm!" }]}>
                  <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="supportRushOrder" valuePropName="checked">
              <Checkbox>Hỗ trợ giao hàng nhanh</Checkbox>
            </Form.Item>

            <Divider>Thông số kỹ thuật</Divider>

            <Form.List name="specifications">
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'baseline' }} align="baseline">
                      <Form.Item {...restField} name={[name, 'group']} rules={[{ required: true, message: 'Nhập nhóm' }]}>
                        <Input placeholder="Nhóm" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'title']} rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
                        <Input placeholder="Tiêu đề" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'content']} rules={[{ required: true, message: 'Nhập nội dung' }]}>
                        <Input placeholder="Nội dung" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} title="Xóa thông số này" />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add({ group: '', title: '', content: '' })} block icon={<PlusOutlined />}>
                      Thêm thông số kỹ thuật
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Col>

          <Col xs={24} md={12}>
            <h3 style={{ marginBottom: 16, textAlign: "center" }}>Mẫu Sản Phẩm</h3>
            <div style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: "10px" }}>
              {variants.map((variant, index) => (
                <div key={variant.key} style={{ marginBottom: 16, padding: "16px", border: "1px solid #e8e8e8", borderRadius: "8px", position: "relative" }}>
                  {variants.length > 1 && (
                    <Button icon={<MinusCircleOutlined />} onClick={() => removeVariant(variant.key)} type="text" danger style={{ position: "absolute", top: 5, right: 5, padding: 5, zIndex: 10 }} title="Xóa biến thể này" />
                  )}
                  <Row gutter={16}>
                    <Col xs={24} sm={14}>
                      <Form.Item label={`Màu sắc #${index + 1}`} required validateStatus={!variant.color ? "error" : ""} help={!variant.color ? "Vui lòng nhập màu sắc" : ""}>
                        <Input placeholder="VD: Xanh dương" value={variant.color} onChange={(e) => handleVariantChange(variant.key, "color", e.target.value)} />
                      </Form.Item>
                      <Form.Item label={`Url ảnh #${index + 1}`}>
                        <Input placeholder="https://example.com/anh-mau-san-pham.jpg" value={variant.imageUrl} onChange={(e) => handleVariantChange(variant.key, "imageUrl", e.target.value)} />
                      </Form.Item>
                      <Row gutter={8}>
                        <Col span={12}>
                          <Form.Item label={`Số lượng #${index + 1}`} required validateStatus={variant.stockQuantity === null || variant.stockQuantity === undefined || variant.stockQuantity < 0 ? "error" : ""} help={variant.stockQuantity === null || variant.stockQuantity === undefined || variant.stockQuantity < 0 ? "SL >= 0" : ""}>
                            <InputNumber min={0} value={variant.stockQuantity} onChange={(value) => handleVariantChange(variant.key, "stockQuantity", value)} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label={`Giảm giá (%) #${index + 1}`} validateStatus={variant.discountPercentage < 0 || variant.discountPercentage > 100 ? "error" : ""} help={variant.discountPercentage < 0 || variant.discountPercentage > 100 ? "Từ 0 đến 100" : ""}>
                            <InputNumber min={0} max={100} value={variant.discountPercentage} onChange={(value) => handleVariantChange(variant.key, "discountPercentage", value)} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <Col xs={24} sm={10}>
                      <Form.Item label={`Xem trước #${index + 1}`}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "120px", border: "1px dashed #ccc", borderRadius: "4px", overflow: "hidden" }}>
                          {variant.imageUrl ? (
                            <Image height={118} src={variant.imageUrl} style={{ objectFit: "contain" }} fallback="/placeholder-image.png" />
                          ) : (
                            <span style={{ color: "#bfbfbf" }}>Chưa có ảnh</span>
                          )}
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
            <Button type="dashed" onClick={addVariant} icon={<PlusOutlined />} style={{ width: "100%", marginTop: 16 }}>Thêm Mẫu Khác</Button>
          </Col>
        </Row>

        <Divider style={{ margin: '24px 0' }} />

        <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
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