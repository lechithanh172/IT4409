import React, { useState } from "react";
import {
  Button,
  Col,
  ConfigProvider,
  Image,
  Radio,
  Rate,
  Row,
  Typography,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import EditProduct from "./EditProduct";
const { Paragraph } = Typography;

const CustomRow = ({ label, value }) => (
  <Row gutter={[16, 16]}>
    <Col span={8} style={{ fontSize: 16, color: "#929292" }}>
      {label}:
    </Col>
    <Col span={16} style={{ fontSize: 18 }}>
      {value}
    </Col>
  </Row>
);
const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const getSoLuong = (products) => {
  return products.variants?.reduce(
    (total, variant) => total + variant.quantity, 0) || 0;  // Nếu không có variants thì trả về 0
}; 

const ProductDetails = ({ products, setModalChild, handleRefresh }) => {

  const options = products?.variants?.map((variant) => ({
    label: variant.color,     
    value: variant._id,           
    image: variant.image,        
    sale: variant.sale,           
    quantity: variant.quantity
  })) || [];  
  
  const [variant, setVariant] = useState(options[0] || null); 
  

  const onChange = (e) => {
    const selectedVariant = options.find((option) => option.value === e.target.value);
    setVariant(selectedVariant);  
  };
  
  
  if (!products || !products.variants) {
    return <div>Đang tải...</div>;  
  }

  return (
    <div style={{ width: 1000 }}>
      <Row gutter={16}>
        <Col flex="0 1 400px">
          <Image
            src={variant.image}
            height={400}
            width={400}
            style={{ marginBottom: "20px", objectFit: "contain" }}
          />
        </Col>
        <Col flex="1 0 400px">
          <span
            style={{
              fontSize: 20,
              fontWeight: 500,
              lineHeight: "24px",
              overflowWrap: "break-word",
            }}
          >
            {products.name}
          </span>

          <Row gutter={[16, 16]} style={{ marginBottom: 10 }}>
            <Col span={8}>
              <span
                style={{
                  color: "#d0011b",
                  borderBottom: "1px solid #d0011b",
                  fontSize: 16,
                }}
              >
                {products.rating}
              </span>
              <ConfigProvider
                theme={{
                  token: {
                    marginXS: 0,
                  },
                }}
              >
                <Rate
                  allowHalf
                  defaultValue={products.rating}
                  disabled
                  style={{ fontSize: 14, marginLeft: 5, color: "#d0011b" }}
                />
              </ConfigProvider>
            </Col>
            <Col
              span={8}
              style={{
                borderLeft: "1px solid #dbdbdb",
                borderRight: "1px solid #dbdbdb",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  borderBottom: "1px solid #555",
                  marginRight: 5,
                }}
              >
                {products.star1 +
                  products.star2 +
                  products.star3 +
                  products.star4 +
                  products.star5}
              </span>
              <span>Đánh giá {products.star1}</span>
              
            </Col>
          </Row>

          <CustomRow label="Mã hàng hóa" value={products._id} />
          <CustomRow label="Loại hàng hóa" value={products.category} />
          <CustomRow label="Hãng sản xuất" value={products.brand.name} />
          <CustomRow label="Tổng số lượng" value={getSoLuong(products)} />
          <CustomRow label="Màu" value={
            <Radio.Group
              options={options}
              onChange={onChange}
              value={variant?.value}
              optionType="button"
              buttonStyle="solid" 
            >
              {options.map((option, index) => (
                <Radio.Button
                  key={`${option.value}-${index}`}
                  value={option.value}
                  style={{
                    backgroundColor: option.value,  // Hiển thị màu nền theo màu của biến thể
                    color: '#fff',  // Màu chữ trắng trên nền
                    borderColor: option.value,  // Để viền giống màu nền
                    padding: '8px 16px',  // Điều chỉnh padding cho nút Radio
                    margin: '0 8px',  // Khoảng cách giữa các nút Radio
                  }}
                >
                  {option.label} - {option.sale}% Giảm giá
                </Radio.Button>
              ))}
            </Radio.Group>
          } />
          
          <Row gutter={[16, 16]}>
            <Col span={8} style={{ fontSize: 16, color: "#929292" }}>
              Giá gốc:
            </Col>
            <Col
              span={16}
              style={{
                fontSize: 18,
                color: "#d0011b",
                textDecoration: "line-through", // Hiển thị giá gốc bị gạch ngang
              }}
            >
              {formatPrice(products.price)} VNĐ {/* Hiển thị giá gốc */}
            </Col>
          </Row>

          <CustomRow label="Giảm giá" value={`${variant.sale}%`} /> {/* Hiển thị mức giảm giá */}

          <Row gutter={[16, 16]}>
            <Col span={8} style={{ fontSize: 16, color: "#929292" }}>
              Giá hiện tại:
            </Col>
            <Col span={16} style={{ fontSize: 18, color: "#d0011b" }}>
              {formatPrice(products.price * (1 - (variant.sale || 0) / 100))} VNĐ {/* Tính toán giá sau giảm */}
            </Col>
          </Row>

          
          <CustomRow label="Số lượng" value={variant.quantity} /> {/* Hiển thị số lượng */}


          <div style={{ fontSize: 18, marginTop: 10 }}>Thông tin: </div>
          <Paragraph
            style={{
              maxHeight: 275,
              overflowY: "auto",
              whiteSpace: "pre-line",
              marginLeft: 10,
            }}
          >
            {products.description
            .map((item) => item.trim())
            .join("\n")
            }
          </Paragraph>

          <div style={{ fontSize: 18, marginTop: 10 }}>Thông số: </div>
          <Paragraph
            style={{
              maxHeight: 275,
              overflowY: "auto",
              whiteSpace: "pre-line",
              marginLeft: 10,
            }}
          >
            {products.specifications
               .map((item) => item.trim())
               .join("\n")
            }
          </Paragraph>
        </Col>
      </Row>
      <Row justify="end">
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => {
            setModalChild(
              <EditProduct product={products} setModalChild={setModalChild} handleRefresh={handleRefresh}/>
            );
          }}
        >
          Chỉnh sửa
        </Button>
      </Row>
    </div>
  );
};

export default ProductDetails;
