import React, { useState, useEffect, useMemo } from "react";
import {
  Button, Form, Input, InputNumber, Space, Row, Col,
  message, Image, Select, Divider, Checkbox, Typography, Card
} from "antd";
import { PlusOutlined, MinusCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import apiService from "../../../services/api";

const { Title, Text } = Typography;
const { Option } = Select;

const AddProduct = ({ closeModal, onProductAdded, categoriesList = [], brandsList = [] }) => {
  const [form] = Form.useForm();
  const [variants, setVariants] = useState([
    {
      key: Date.now() + "_initial",
      color: "",
      stockQuantity: 0,
      discountPercentage: 0,
      imageUrl: "",
      imageFile: null,
    },
  ]);
  const [selectedBrandName, setSelectedBrandName] = useState(undefined);
  const [selectedBrandImage, setSelectedBrandImage] = useState(null);

  const categoryOptions = useMemo(() => (
    categoriesList.map(cat => ({
        value: typeof cat === 'object' ? cat.categoryName : cat, 
        label: typeof cat === 'object' ? cat.categoryName : cat
    }))
  ), [categoriesList]);

  const brandOptions = useMemo(() => (
    brandsList.map(brand => ({
        value: brand.brandName || brand.name,
        label: brand.brandName || brand.name,
        image: brand.logoUrl || brand.image,
        _id: brand.brandId || brand._id
    }))
  ), [brandsList]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false); 

  const handleBrandChange = (value) => {
    const selected = brandOptions.find((b) => b.value === value);
    setSelectedBrandName(selected ? selected.value : undefined);
    setSelectedBrandImage(selected ? selected.image : null);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Form validation failed:", errorInfo);
    message.error(
      "Vui lòng kiểm tra lại các trường thông tin còn thiếu hoặc không hợp lệ."
    );
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        key: `new_${Date.now()}_${variants.length}`,
        color: "", stockQuantity: 0, discountPercentage: 0, imageUrl: "", imageFile: null,
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

  const handleImageUploadForVariant = (key, { file }) => {
    if (file && file.status !== 'removed') {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleVariantChange(key, "imageUrl", reader.result);
        handleVariantChange(key, "imageFile", file.originFileObj);
      };
      reader.readAsDataURL(file.originFileObj);
    } else if (file && file.status === 'removed') {
         handleVariantChange(key, "imageUrl", "");
         handleVariantChange(key, "imageFile", null);
    }
    return false;
  };

  const onFinish = async (values) => {
    setIsSubmitting(true);
    if (!values.brandName) {
      message.error("Vui lòng chọn thương hiệu!");
      form.validateFields(["brandName"]);
      setIsSubmitting(false);
      return;
    }

    const invalidVariant = variants.some(
      (v) =>
        !v.color?.trim() ||
        v.stockQuantity === null || v.stockQuantity < 0 ||
        v.discountPercentage === null || v.discountPercentage < 0 || v.discountPercentage > 100
    );
    if (invalidVariant) {
      message.error("Vui lòng nhập đầy đủ và hợp lệ cho các biến thể (Màu, Số lượng >= 0, Giảm giá 0-100).");
      setIsSubmitting(false);
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
        setIsSubmitting(false);
        return;
    }

    try {
      const brandDataForAPI = brandOptions.find(b => b.value === values.brandName);

      const productData = {
        productName: values.productName.trim(),
        description: values.description.trim(),
        price: values.price ?? 0,
        weight: values.weight ?? 0,
        categoryName: values.categoryName,
        brandName: values.brandName,
        supportRushOrder: values.supportRushOrder || false,
        specifications: JSON.stringify(specificationsArray),
        variants: variants.map((variant) => ({
          color: variant.color.trim(),
          imageUrl: variant.imageUrl || null,
          stockQuantity: variant.stockQuantity ?? 0,
          discountPercentage: variant.discountPercentage ?? 0,
        })),
      };

      console.log("Data to submit for Add Product:", productData);
      await apiService.addProduct(productData);
      message.success(`Sản phẩm "${productData.productName}" đã được thêm thành công!`);
      if(typeof onProductAdded === 'function') onProductAdded();
      if(typeof closeModal === 'function') closeModal();
      
    } catch (e) {
      const errorMessage = e.response?.data?.message || e.message || "Đã xảy ra lỗi khi thêm sản phẩm";
      console.error("Add product error:", e);
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: "80vw", maxWidth: "1200px", minWidth: "700px", margin: "auto", overflowY: 'auto', padding: '0 15px 20px 5px' }}>
      <Form
        form={form}
        name="addProductForm_antd_v3"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        initialValues={{
          supportRushOrder: false,
          specificationGroups: [{ groupName: "", details: [{ title: "", content: "" }] }],
          price: undefined,
          weight: undefined,
        }}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Card title="Thông tin chung" bordered={false} style={{ marginBottom: 24 }}>
                <Form.Item
                    label="Tên Sản Phẩm"
                    name="productName"
                    rules={[{ required: true, message: "Hãy nhập tên sản phẩm!" }, { whitespace: true, message: "Tên không được chỉ chứa khoảng trắng!" }]}
                >
                    <Input placeholder="Ví dụ: iPhone 16 Pro Max" size="large"/>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
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
                                loading={loadingData && categoriesList.length === 0}
                                size="large"
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            label="Thương Hiệu" 
                            name="brandName"
                            rules={[{ required: true, message: "Hãy chọn thương hiệu!" }]}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn thương hiệu"
                                optionFilterProp="label"
                                onChange={handleBrandChange}
                                value={selectedBrandName}
                                style={{ width: "100%" }}
                                allowClear
                                onClear={() => {
                                    setSelectedBrandName(undefined);
                                    setSelectedBrandImage(null);
                                }}
                                loading={loadingData && brandsList.length === 0}
                                size="large"
                            >
                                {brandOptions.map(opt => (
                                    <Option key={opt._id || opt.value} value={opt.value} label={opt.label}>
                                        <Space>
                                            {opt.image && <Image src={opt.image} width={20} height={20} preview={false} style={{objectFit:'contain'}} fallback="/placeholder-logo.png"/>}
                                            {opt.label}
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        {selectedBrandImage && (
                            <div style={{ marginTop: -15, marginBottom: 15, display:'flex', alignItems:'center', gap: 8 }}>
                                <Text type="secondary" style={{fontSize: 12}}>Ảnh:</Text>
                                <Image height={28} src={selectedBrandImage} preview={false} style={{objectFit:'contain', border: '1px solid #f0f0f0', borderRadius: '4px', padding:'2px'}} fallback="/placeholder-logo.png"/>
                            </div>
                        )}
                    </Col>
                </Row>

                <Form.Item label="Mô tả sản phẩm" name="description" rules={[{ required: true, message: "Hãy nhập mô tả!" }]}>
                    <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết về sản phẩm..." size="large"/>
                </Form.Item>
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item label="Giá Gốc (VNĐ)" name="price" rules={[{ required: true, message: "Giá không được để trống!" },{ type: "number", min: 0, message: "Giá phải là số không âm!" }]}>
                            <InputNumber min={0} formatter={(value) =>`${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => value.replace(/VNĐ\s?|(,*)/g, "")} style={{ width: "100%" }} placeholder="Nhập giá sản phẩm" size="large"/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item label="Cân nặng (kg)" name="weight" rules={[{ required: true, message: "Cân nặng không được để trống!" },{ type: "number", min: 0, message: "Cân nặng phải là số không âm!" }]}>
                            <InputNumber min={0} step={0.1} style={{ width: "100%" }} placeholder="Ví dụ: 0.2" size="large"/>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="supportRushOrder" valuePropName="checked">
                    <Checkbox>Hỗ trợ giao hàng nhanh</Checkbox>
                </Form.Item>
            </Card>
            <Card title="Thông số kỹ thuật" bordered={false} style={{ marginBottom: 24 }}>
                <Form.List name="specificationGroups" rules={[{ validator: async (_, groups) => { if (!groups || groups.length < 1) { return; } const invalidGroup = groups.some(group => group && group.groupName?.trim() && (!group.details || group.details.length === 0 || group.details.every(d => !d?.title?.trim() || !d?.content?.trim()))); if (invalidGroup) { return Promise.reject(new Error('Mỗi nhóm thông số đã tạo tên phải có ít nhất một chi tiết (Tiêu đề & Nội dung) hợp lệ.')); }}}]}>
                {(groupFields, { add: addGroup, remove: removeGroup }, { errors: groupErrors }) => (
                    <div style={{ display: 'flex', flexDirection: 'column', rowGap: 16 }}>
                    {groupFields.map(({ key: groupKey, name: groupName }) => (
                        <Card key={groupKey} size="small" type="inner" title={`Nhóm Thông Số ${groupFields.length > 1 ? `#${groupKey + 1}` : ''}`} extra={<Button type="text" danger onClick={() => removeGroup(groupName)} icon={<MinusCircleOutlined />} title="Xóa nhóm này"/>}>
                        <Form.Item name={[groupName, "groupName"]} label="Tên Nhóm" rules={[{ required: true, message: "Tên nhóm không được trống!" }, { whitespace: true, message: "Tên nhóm không được trống!" }]} style={{marginBottom: 12}}>
                            <Input placeholder="Ví dụ: Màn hình, Cấu hình & Bộ nhớ..." size="large"/>
                        </Form.Item>
                        <Form.List name={[groupName, "details"]} rules={[{ validator: async (_, details) => { if (!details || details.length < 1) { return Promise.reject(new Error('Thêm ít nhất một chi tiết cho nhóm này.')); } const invalidDetail = details.some(d => (!d || !d.title?.trim() || !d.content?.trim()) && (d?.title?.trim() || d?.content?.trim())); if (invalidDetail) {return Promise.reject(new Error('Tiêu đề và Nội dung của chi tiết không được để trống nếu một trong hai có giá trị.'));}}}]}>
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
                                <Button type="dashed" onClick={() => addDetail({ title: "", content: "" })} block icon={<PlusOutlined />} style={{marginTop: 8}}>Thêm chi tiết</Button>
                                <Form.ErrorList errors={detailErrors} />
                            </div>
                            )}
                        </Form.List>
                        </Card>
                    ))}
                    <Button type="dashed" onClick={() => addGroup({ groupName: "", details: [{ title: "", content: "" }] })} block icon={<PlusOutlined />} style={{marginTop: 16}}>Thêm Nhóm Thông Số Khác</Button>
                     <Form.ErrorList errors={groupErrors} />
                    </div>
                )}
                </Form.List>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Các mẫu sản phẩm" bordered={false}>
                <div style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: "10px" }}>
                {variants.map((variant, index) => (
                    <Card key={variant.key} type="inner" size="small" title={`Mẫu #${index + 1}`} style={{ marginBottom: 16 }} extra={variants.length > 1 && (<Button icon={<MinusCircleOutlined />} onClick={() => removeVariant(variant.key)} type="text" danger title="Xóa mẫu này"/>)}>
                        <Row gutter={16}>
                            <Col span={16}>
                                <Form.Item 
                                    label={`Màu sắc #${index + 1}`} 
                                    required 
                                    validateStatus={isSubmitting && !variant.color ? "error" : ""} 
                                    help={isSubmitting && !variant.color ? "Vui lòng nhập màu sắc" : ""}
                                >
                                    <Input 
                                        placeholder="VD: Xanh dương" 
                                        value={variant.color} 
                                        onChange={(e) => handleVariantChange(variant.key, "color", e.target.value)} 
                                        size="large"
                                    />
                                </Form.Item>
                                <Form.Item label={`Url ảnh #${index + 1}`}> 
                                    <Input 
                                        placeholder="https://example.com/anh-mau-san-pham.jpg" 
                                        value={variant.imageUrl} 
                                        onChange={(e) => handleVariantChange(variant.key, "imageUrl", e.target.value)} 
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label={`Xem trước #${index + 1}`}> 
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "130px", border: "1px dashed #ccc", borderRadius: "4px", overflow: "hidden" }}>
                                        {variant.imageUrl ? (
                                            <Image height={120} src={variant.imageUrl} style={{ objectFit: "contain" }} fallback="/placeholder-image.png" />
                                        ) : (
                                            <span style={{ color: "#bfbfbf" }}>Chưa có ảnh</span>
                                        )}
                                    </div>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item 
                                    label={`Số lượng #${index + 1}`} 
                                    required 
                                    validateStatus={isSubmitting && (variant.stockQuantity === null || variant.stockQuantity < 0) ? 'error' : ''} 
                                    help={isSubmitting && (variant.stockQuantity === null || variant.stockQuantity < 0) ? 'Số lượng phải >= 0!' : ''}
                                >
                                    <InputNumber 
                                        min={0} 
                                        value={variant.stockQuantity} 
                                        onChange={(value) => handleVariantChange(variant.key, "stockQuantity", value ?? 0)} 
                                        style={{ width: "100%" }} 
                                        placeholder="0" 
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    label={`Giảm giá (%) #${index + 1}`} 
                                    validateStatus={isSubmitting && (variant.discountPercentage === null || variant.discountPercentage < 0 || variant.discountPercentage > 100) ? 'error' : ''} 
                                    help={isSubmitting && (variant.discountPercentage === null || variant.discountPercentage < 0 || variant.discountPercentage > 100) ? 'Từ 0 đến 100!' : ''}
                                >
                                    <InputNumber 
                                        min={0} 
                                        max={100} 
                                        value={variant.discountPercentage} 
                                        onChange={(value) => handleVariantChange(variant.key, "discountPercentage", value ?? 0)} 
                                        style={{ width: "100%" }} 
                                        placeholder="0" 
                                        addonAfter="%" 
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                ))}
                </div>
                <Button type="dashed" onClick={addVariant} icon={<PlusOutlined />} block style={{ marginTop: 16 }}>Thêm Mẫu Khác</Button>
            </Card>
          </Col>
        </Row>
        <Divider style={{ margin: "30px 0" }} />
        <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
          <Space size="middle">
            <Button onClick={closeModal} size="large">Hủy Bỏ</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting} size="large">Thêm Sản Phẩm</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddProduct;