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
  Card,
  Typography,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import apiService from "../../../services/api";

const { Text } = Typography;

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
          }
        } catch (error) {
          parsedSpecifications = [];
          message.error("Lỗi định dạng dữ liệu thông số kỹ thuật nhận được.");
        }
      } else if (Array.isArray(product.specifications)) {
         parsedSpecifications = product.specifications;
      }

      // Chuyển đổi dữ liệu specifications thành định dạng nhóm
      const specificationGroups = [];
      const groupMap = new Map();

      parsedSpecifications.forEach(spec => {
        if (spec.group && spec.title && spec.content) {
          if (!groupMap.has(spec.group)) {
            groupMap.set(spec.group, {
              groupName: spec.group,
              details: []
            });
            specificationGroups.push(groupMap.get(spec.group));
          }
          groupMap.get(spec.group).details.push({
            title: spec.title,
            content: spec.content
          });
        }
      });

      form.setFieldsValue({
        productName: product.productName,
        description: product.description,
        weight: product.weight,
        price: product.price,
        categoryName: product.categoryName,
        brandName: product.brandName,
        supportRushOrder: product.supportRushOrder || false,
        specificationGroups: specificationGroups.length > 0 ? specificationGroups : [{ groupName: "", details: [{ title: "", content: "" }] }],
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

    const specificationsArray = [];
    let hasSpecError = false;
    if (values.specificationGroups && Array.isArray(values.specificationGroups)) {
      values.specificationGroups.forEach(groupItem => {
        if (groupItem && groupItem.groupName?.trim()) {
          if (!groupItem.details || groupItem.details.length === 0 || groupItem.details.every(d => !d?.title?.trim() || !d?.content?.trim())) {
            hasSpecError = true;
          } else {
            groupItem.details.forEach(detail => {
              if (detail && detail.title?.trim() && detail.content?.trim()) {
                specificationsArray.push({
                  group: groupItem.groupName.trim(),
                  title: detail.title.trim(),
                  content: detail.content.trim(),
                });
              } else if (detail && (detail.title?.trim() || detail.content?.trim())) {
                hasSpecError = true;
              }
            });
          }
        } else if (groupItem && groupItem.details && groupItem.details.some(d => d?.title?.trim() || d?.content?.trim())) {
            hasSpecError = true;
        }
      });
    }
     if (hasSpecError) {
        message.error("Vui lòng hoàn thành tất cả các trường cho thông số kỹ thuật đã thêm, bao gồm Tên Nhóm, Tiêu đề và Nội dung cho mỗi chi tiết.");
        return;
    }

    try {
      const specificationsString = JSON.stringify(specificationsArray);

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

            <Form.List
                name="specificationGroups"
                rules={[{
                    validator: async (_, groups) => {
                        if (!groups || groups.length < 1) { return; }
                        const invalidGroup = groups.some(group => group && group.groupName?.trim() && (!group.details || group.details.length === 0 || group.details.every(d => !d?.title?.trim() || !d?.content?.trim())));
                        if (invalidGroup) {
                            return Promise.reject(new Error('Mỗi nhóm thông số đã tạo tên phải có ít nhất một chi tiết (Tiêu đề & Nội dung) hợp lệ.'));
                        }
                    }
                }]}
            >
                {(groupFields, { add: addGroup, remove: removeGroup }, { errors: groupErrors }) => (
                    <div style={{ display: 'flex', flexDirection: 'column', rowGap: 16 }}>
                    {groupFields.map(({ key: groupKey, name: groupName }) => (
                        <Card key={groupKey} size="small" type="inner" title={`Nhóm Thông Số ${groupFields.length > 1 ? `#${groupKey + 1}` : ''}`}
                            extra={
                                <Button type="text" danger onClick={() => removeGroup(groupName)} icon={<MinusCircleOutlined />} title="Xóa nhóm này"/>
                            }
                        >
                        <Form.Item
                            name={[groupName, "groupName"]}
                            label="Tên Nhóm"
                            rules={[{ required: true, message: "Tên nhóm không được trống!" }, { whitespace: true, message: "Tên nhóm không được trống!" }]}
                            style={{marginBottom: 12}}
                        >
                            <Input placeholder="Ví dụ: Màn hình, Cấu hình & Bộ nhớ..." size="large"/>
                        </Form.Item>

                        <Form.List 
                            name={[groupName, "details"]}
                            rules={[{
                                validator: async (_, details) => {
                                    if (!details || details.length < 1) {
                                        return Promise.reject(new Error('Thêm ít nhất một chi tiết cho nhóm này.'));
                                    }
                                    const invalidDetail = details.some(d => (!d || !d.title?.trim() || !d.content?.trim()) && (d?.title?.trim() || d?.content?.trim()));
                                    if (invalidDetail) {
                                        return Promise.reject(new Error('Tiêu đề và Nội dung của chi tiết không được để trống nếu một trong hai có giá trị.'));
                                    }
                                }
                            }]}
                        >
                            {(detailFields, { add: addDetail, remove: removeDetail }, { errors: detailErrors }) => (
                            <div style={{ display: 'flex', flexDirection: 'column', rowGap: 10 }}>
                                {detailFields.map(({ key: detailKey, name: detailName }) => (
                                <Space key={detailKey} style={{ display: 'flex', alignItems: 'center' }} align="center">
                                    <Form.Item name={[detailName, "title"]} style={{ flex: 1, marginBottom: 0 }} rules={[{ required: true, message: "!"}, { whitespace: true, message: "!" }]}>
                                        <Input placeholder="Tiêu đề (VD: Kích thước)" size="large"/>
                                    </Form.Item>
                                    <Text style={{margin: '0 8px'}}>:</Text>
                                    <Form.Item name={[detailName, "content"]} style={{ flex: 2, marginBottom: 0 }} rules={[{ required: true, message: "!"}, { whitespace: true, message: "!" }]}>
                                        <Input placeholder="Nội dung (VD: 6.7 inch)" size="large"/>
                                    </Form.Item>
                                    <Button type="text" danger onClick={() => removeDetail(detailName)} icon={<MinusCircleOutlined />} title="Xóa chi tiết này" style={{padding: '4px 8px'}}/>
                                </Space>
                                ))}
                                <Button type="dashed" onClick={() => addDetail({ title: "", content: "" })} block icon={<PlusOutlined />} style={{marginTop: 8}}>
                                Thêm chi tiết
                                </Button>
                                <Form.ErrorList errors={detailErrors} />
                            </div>
                            )}
                        </Form.List>
                        </Card>
                    ))}
                    <Button type="dashed" onClick={() => addGroup({ groupName: "", details: [{ title: "", content: "" }] })} block icon={<PlusOutlined />} style={{marginTop: 16}}>
                        Thêm Nhóm Thông Số Khác
                    </Button>
                     <Form.ErrorList errors={groupErrors} />
                    </div>
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