import React, { useState, useEffect } from "react";
import {
  Button, Form, Input, InputNumber, Space, Row, Col,
  message, Image, Select, Divider, Checkbox, Typography, Card
} from "antd";
import { PlusOutlined, MinusCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import apiService from "../../../services/api"; // Đảm bảo đường dẫn này đúng

const { Title, Text } = Typography;
const { Option } = Select;

const AddProduct = ({ setModalChild, handleRefresh, closeModal }) => { // Thêm closeModal prop
  const [form] = Form.useForm();
  const [variants, setVariants] = useState([
    {
      key: Date.now() + "_initial",
      color: "",
      stockQuantity: 0,
      discountPercentage: 0,
      imageUrl: "",
      imageFile: null, // Để lưu File object nếu có upload
    },
  ]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandOptions, setBrandOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [brandResponse, categoryResponse] = await Promise.all([
          apiService.getAllBrands(),
          apiService.getAllCategories(),
        ]);

        const fetchedBrands = brandResponse?.data?.brands || [];
        const brandOpts = fetchedBrands.map((brand) => ({
          value: brand._id,
          label: brand.name,
          image: brand.image,
        }));
        setBrandOptions(brandOpts);

        const fetchedCategories = categoryResponse?.data?.categories || [];
        const categoryOpts = fetchedCategories.map((categoryName) => ({
          value: categoryName,
          label: categoryName,
        }));
        setCategoryOptions(categoryOpts);

      } catch (error) {
        console.error("Lỗi tải brand/category:", error);
        message.error("Không thể tải danh sách thương hiệu hoặc danh mục.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectBrandChange = (brandId) => {
    const selected = brandOptions.find((b) => b.value === brandId);
    setSelectedBrand(selected || null);
    form.setFieldsValue({ selectedBrandId: brandId }); // Cập nhật field ẩn cho validation
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
        key: Date.now() + "_" + Math.random().toString(36).substr(2, 9),
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

  // Placeholder cho logic upload ảnh thực tế (nếu bạn dùng Upload component của Antd)
  const handleImageUploadForVariant = (key, { file }) => {
    if (file && file.status !== 'removed') {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleVariantChange(key, "imageUrl", reader.result); // Preview bằng base64
        handleVariantChange(key, "imageFile", file.originFileObj); // Lưu file để upload sau
      };
      reader.readAsDataURL(file.originFileObj);
    } else if (file && file.status === 'removed') {
         handleVariantChange(key, "imageUrl", "");
         handleVariantChange(key, "imageFile", null);
    }
    return false; // Ngăn Antd Upload tự động
  };


  const onFinish = async (values) => {
    setIsSubmitting(true);
    if (!selectedBrand) {
      message.error("Vui lòng chọn thương hiệu!");
      form.validateFields(["selectedBrandId"]);
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
            hasSpecError = true; // Đánh dấu có lỗi
          } else {
            groupItem.details.forEach(detail => {
              if (detail && detail.title?.trim() && detail.content?.trim()) {
                specificationsArray.push({
                  group: groupItem.groupName.trim(),
                  title: detail.title.trim(),
                  content: detail.content.trim(),
                });
              } else if (detail && (detail.title?.trim() || detail.content?.trim())) {
                // Nếu có title hoặc content nhưng không có cả hai
                hasSpecError = true;
              }
            });
          }
        } else if (groupItem && groupItem.details && groupItem.details.some(d => d?.title?.trim() || d?.content?.trim())) {
            // Nếu không có tên nhóm nhưng lại có chi tiết
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
      // TODO: Implement actual image uploading for variants' imageFile
      // and get back the URLs to replace variant.imageUrl.

      const productData = {
        productName: values.productName.trim(),
        description: values.description.trim(),
        price: values.price ?? 0,
        weight: values.weight ?? 0,
        categoryName: values.categoryName,
        brand: {
            name: selectedBrand.label,
            image: selectedBrand.image || "",
        },
        supportRushOrder: values.supportRushOrder || false,
        specifications: JSON.stringify(specificationsArray),
        variants: variants.map((variant) => ({
          color: variant.color.trim(),
          imageUrl: variant.imageUrl || null,
          stockQuantity: variant.stockQuantity ?? 0,
          discountPercentage: variant.discountPercentage ?? 0,
        })),
        images: variants.length > 0 && variants[0].imageUrl ? [variants[0].imageUrl] : [],
      };

      console.log("Data to submit:", productData);

      await apiService.addProduct(productData);
      message.success(`Sản phẩm "${productData.productName}" đã được thêm thành công!`);
      if(typeof handleRefresh === 'function') handleRefresh();
      // Sử dụng prop closeModal đã được truyền vào
      if(typeof closeModal === 'function') closeModal();
      else if(typeof setModalChild === 'function') setModalChild(null); 

    } catch (e) {
      const errorMessage = e.response?.data?.message || e.message || "Đã xảy ra lỗi khi thêm sản phẩm";
      console.error("Add product error:", e);
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: "80vw", maxWidth: "1200px", minWidth: "700px", margin: "auto", maxHeight: '85vh', overflowY: 'auto', padding: '0 15px 20px 5px' }}>
      <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>Thêm Sản Phẩm Mới</Title>
      <Form
        form={form}
        name="addProductForm"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        initialValues={{
          supportRushOrder: false,
          specificationGroups: [{ groupName: "", details: [{ title: "", content: "" }] }],
          price: undefined, // Để placeholder hiển thị
          weight: undefined,
          variants: [{stockQuantity: 0, discountPercentage: 0}] // Để placeholder hiển thị
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
                            loading={loadingData}
                            size="large"
                            allowClear
                        />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Thương Hiệu" required>
                            <Form.Item name="selectedBrandId" noStyle rules={[{ required: true, message: "Hãy chọn thương hiệu!" }]}>
                                 <Input hidden />
                            </Form.Item>
                            <Select
                                showSearch
                                placeholder="Chọn thương hiệu"
                                optionFilterProp="label"
                                onChange={handleSelectBrandChange}
                                // options={brandOptions} // Sử dụng children để render với Image
                                value={selectedBrand ? selectedBrand.value : undefined}
                                style={{ width: "100%" }}
                                allowClear
                                onClear={() => {
                                    setSelectedBrand(null);
                                    form.setFieldsValue({selectedBrandId: undefined});
                                }}
                                loading={loadingData}
                                size="large"
                            >
                                {brandOptions.map(opt => (
                                    <Option key={opt.value} value={opt.value} label={opt.label}>
                                        <Space>
                                            {opt.image && <Image src={opt.image} width={20} height={20} preview={false} style={{objectFit:'contain'}} fallback="/placeholder-logo.png"/>}
                                            {opt.label}
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                label="Mô tả sản phẩm"
                name="description"
                rules={[{ required: true, message: "Hãy nhập mô tả!" }]}
                >
                <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết về sản phẩm..." size="large"/>
                </Form.Item>

                <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item
                    label="Giá Gốc (VNĐ)"
                    name="price"
                    rules={[{ required: true, message: "Giá không được để trống!" },{ type: "number", min: 0, message: "Giá phải là số không âm!" }]}
                    >
                    <InputNumber
                        min={0}
                        formatter={(value) =>`${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value.replace(/VNĐ\s?|(,*)/g, "")} // Sửa parser
                        style={{ width: "100%" }}
                        placeholder="Nhập giá sản phẩm"
                        size="large"
                    />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item
                    label="Cân nặng (kg)"
                    name="weight"
                    rules={[{ required: true, message: "Cân nặng không được để trống!" },{ type: "number", min: 0, message: "Cân nặng phải là số không âm!" }]}
                    >
                    <InputNumber min={0} step={0.1} style={{ width: "100%" }} placeholder="Ví dụ: 0.2" size="large"/>
                    </Form.Item>
                </Col>
                </Row>
                <Form.Item name="supportRushOrder" valuePropName="checked">
                <Checkbox>Hỗ trợ giao hàng nhanh</Checkbox>
                </Form.Item>
            </Card>

            <Card title="Thông số kỹ thuật" bordered={false} style={{ marginBottom: 24 }}>
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
                                <Space key={detailKey} style={{ display: 'flex', alignItems: 'center' }} align="center"> {/* Đổi align thành center */}
                                    <Form.Item name={[detailName, "title"]} style={{ flex: 1, marginBottom: 0 }} rules={[{ required: true, message: "!"}, { whitespace: true, message: "!" }]}>
                                        <Input placeholder="Tiêu đề (VD: Kích thước)" size="large"/>
                                    </Form.Item>
                                    <Text style={{margin: '0 8px'}}>:</Text>
                                    <Form.Item name={[detailName, "content"]} style={{ flex: 2, marginBottom: 0 }} rules={[{ required: true, message: "!"}, { whitespace: true, message: "!" }]}>
                                        <Input placeholder="Nội dung (VD: 6.7 inch)" size="large"/>
                                    </Form.Item>
                                    {/* Cho phép xóa chi tiết đầu tiên nếu không phải là chi tiết duy nhất của group */}
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
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Các mẫu sản phẩm (Biến thể)" bordered={false}>
                <div style={{ maxHeight: "calc(85vh - 180px)", overflowY: "auto", paddingRight: "10px" }}>
                {variants.map((variant, index) => (
                    <Card 
                        key={variant.key} 
                        type="inner" 
                        size="small"
                        title={`Mẫu #${index + 1}`} 
                        style={{ marginBottom: 16 }}
                        extra={variants.length > 1 && (
                            <Button icon={<MinusCircleOutlined />} onClick={() => removeVariant(variant.key)} type="text" danger title="Xóa mẫu này"/>
                        )}
                    >
                    <Form.Item label="Màu sắc / Tên mẫu" required 
                        validateStatus={!variant.color?.trim() ? 'error' : ''} 
                        help={!variant.color?.trim() ? 'Thông tin này không được trống!' : ''}
                    >
                        <Input placeholder="VD: Xanh Titan, 128GB" value={variant.color}
                        onChange={(e) => handleVariantChange(variant.key, "color", e.target.value)} size="large"/>
                    </Form.Item>
                    <Form.Item label="URL Ảnh Mẫu">
                        <Input placeholder="https://example.com/image.jpg" value={variant.imageUrl}
                        onChange={(e) => handleVariantChange(variant.key, "imageUrl", e.target.value)} size="large"/>
                         {variant.imageUrl && <Image height={80} width={80} src={variant.imageUrl} style={{ objectFit: "contain", marginTop: 8, border:'1px solid #f0f0f0', borderRadius:4 }} fallback="/placeholder-image.png"/>}
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                        <Form.Item label="Số lượng tồn" required
                            validateStatus={variant.stockQuantity === null || variant.stockQuantity < 0 ? 'error' : ''}
                            help={variant.stockQuantity === null || variant.stockQuantity < 0 ? 'Số lượng phải >= 0!' : ''}
                        >
                            <InputNumber min={0} value={variant.stockQuantity}
                            onChange={(value) => handleVariantChange(variant.key, "stockQuantity", value ?? 0)}
                            style={{ width: "100%" }} placeholder="0" size="large"/>
                        </Form.Item>
                        </Col>
                        <Col span={12}>
                        <Form.Item label="Giảm giá (%)"
                            validateStatus={variant.discountPercentage === null || variant.discountPercentage < 0 || variant.discountPercentage > 100 ? 'error' : ''}
                            help={variant.discountPercentage === null || variant.discountPercentage < 0 || variant.discountPercentage > 100 ? 'Từ 0 đến 100!' : ''}
                        >
                            <InputNumber min={0} max={100} value={variant.discountPercentage}
                            onChange={(value) => handleVariantChange(variant.key, "discountPercentage", value ?? 0)}
                            style={{ width: "100%" }} placeholder="0" addonAfter="%" size="large"/>
                        </Form.Item>
                        </Col>
                    </Row>
                    </Card>
                ))}
                </div>
                <Button type="dashed" onClick={addVariant} icon={<PlusOutlined />} block style={{ marginTop: 16 }}>
                Thêm Mẫu Khác
                </Button>
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: "30px 0" }} />

        <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
          <Space size="middle">
            <Button onClick={() => {if(typeof closeModal === 'function') closeModal(); else if(typeof setModalChild === 'function') setModalChild(null);}} size="large">
              Hủy Bỏ
            </Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting} size="large">
              Thêm Sản Phẩm
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddProduct;