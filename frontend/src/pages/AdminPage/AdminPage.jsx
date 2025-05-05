import React, { useState } from "react";
import {
  UserOutlined,
  BellOutlined,
  InfoCircleOutlined,
  TruckOutlined,
  HddOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Badge, Button, Menu, Layout, Space, Avatar, Dropdown, Typography } from "antd";
import AdminUser from "../../Components/AdminPages/AdminUser/AdminUser";
import AdminProduct from "../../components/AdminPages/AdminProduct/AdminProduct";
import AdminOrder from "../../components/AdminPages/AdminOrder/AdminOrder";
import AdminBrands from "../../components/AdminPages/AdminBrand/AdminBrands";
import AdminCategories from "../../components/AdminPages/AdminCategory/AdminCategories";
import AdminProfile from "../../components/AdminPages/AdminProfile/AdminProfile";
import styles from "./AdminPage.module.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const logout = () => {
  localStorage.clear();
  window.location.href = "/";
};

function getItem(label, key, icon, children, type) {
  return { key, icon, children, label, type };
}

const items = [
  getItem("Quản lý Sản phẩm", "productSub", <AppstoreOutlined />, [
    { key: "products", label: "Tất cả Sản phẩm" },
    { key: "categories", label: "Danh mục" },
    { key: "brands", label: "Thương hiệu" },
  ]),
  getItem("Người dùng", "users", <UserOutlined />),
  getItem("Đơn hàng", "orders", <TruckOutlined />),
  getItem("Thông tin Admin", "profile", <InfoCircleOutlined />),
];

const Admin = () => {
  const [keySelected, setKeySelected] = useState("products");
  const [collapsed, setCollapsed] = useState(false);
  const [isTooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isRead, setIsRead] = useState(true);

  // localStorage.setItem("accessToken", "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQURNSU4iLCJzdWIiOiJ0cmFuZHVjdGhwdDEiLCJpYXQiOjE3NDY0MDQxMTYsImV4cCI6MTc0NjQwNzcxNn0.AJ8iLWWX6cJMArDhrM3FwD8p1Xn0XzPBL-e9IP4fu6I");

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleBellClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      top: rect.bottom + window.scrollY + 10,
      left: rect.right + window.scrollX - 200,
    });
    setTooltipVisible((prevVisible) => !prevVisible);
  };

  const handleOnClick = ({ key }) => {
    setKeySelected(key);
    setTooltipVisible(false);
  };

  const renderPage = (key) => {
    switch (key) {
      case "users": return <AdminUser />;
      case "products": return <AdminProduct />;
      case "categories": return <AdminCategories />;
      case "brands": return <AdminBrands />;
      case "orders": return <AdminOrder />;
      case "profile": return <AdminProfile />;
      default: return <AdminProduct />;
    }
  };

  const userMenuItems = [
    {
      key: 'profileLink',
      label: 'Xem hồ sơ',
      icon: <UserOutlined />,
      onClick: () => {
          setKeySelected('profile');
          setTooltipVisible(false);
      }
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className={styles.header}>
        <div className={styles.logoArea}>
           <Title level={3} className={styles.headerTitle}>Admin Dashboard</Title>
        </div>

        <div className={styles.headerRight}>
          <Space size="middle" align="center">
            <div style={{ position: "relative" }}>
                <Badge dot={!isRead} offset={[-5, 5]} >
                    <Button
                        type="text"
                        shape="circle"
                        icon={<BellOutlined className={styles.headerIcon}/>}
                        onClick={handleBellClick}
                    />
                </Badge>
            </div>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow trigger={['click']}>
                <a onClick={(e) => e.preventDefault()} className={styles.avatarLink}>
                    <Space>
                        <Avatar size="default" icon={<UserOutlined />} className={styles.avatar}/>
                    </Space>
                </a>
            </Dropdown>
          </Space>
        </div>
      </Header>

      <Layout>
        <Sider
           trigger={null}
           collapsible
           collapsed={collapsed}
           width={220}
           className={styles.sidebar}
           theme="dark"
        >
           <Menu
              mode="inline"
              theme="dark"
              selectedKeys={[keySelected]}
              style={{ height: 'calc(100% - 48px)', borderRight: 0, overflowY: 'auto', overflowX: 'hidden' }}
              items={items}
              onClick={handleOnClick}
           />
           <Button
             type="text"
             icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
             onClick={toggleCollapsed}
             className={styles.collapseButton}
           />
        </Sider>

        <Layout className={styles.contentLayout}>
            <Content className={styles.contentWrapper}>
                {renderPage(keySelected)}
            </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Admin;