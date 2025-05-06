import React, { useState } from "react";
import {
    UserOutlined,
    BellOutlined,
    InfoCircleOutlined,
    TruckOutlined,
    HddOutlined,
    LogoutOutlined, // <-- Import Logout icon
    MenuFoldOutlined, // <-- Icon for collapsed state
    MenuUnfoldOutlined, // <-- Icon for expanded state
    AppstoreOutlined, // Example icon for Products parent menu
} from "@ant-design/icons";
import { Badge, Button, Menu, Layout, Space, Avatar, Dropdown, Typography } from "antd";
import AdminProduct from "../../components/AdminPages/AdminProduct/AdminProduct";
import AdminOrder from "../../components/AdminPages/AdminOrder/AdminOrder";
import UserProfile from "../../components/Profile/Profile";
import AdminBrands from "../../components/AdminPages/AdminBrand/AdminBrands";
import AdminCategories from "../../components/AdminPages/AdminCategory/AdminCategories";
import styles from "./ProductManager.module.css";

const { Header, Sider, Content } = Layout; // Destructure Layout components
const { Title } = Typography; // Use Typography for title

// Logout Function
const logout = () => {
    console.log("User logged out");
    localStorage.clear();
    window.location.href = "/"; // Redirect to homepage or login page
};

// Menu Item Helper
function getItem(label, key, icon, children, type) {
    return { key, icon, children, label, type };
}

// Define Menu Items
const items = [
    getItem("Quản lý Sản phẩm", "productSub", <AppstoreOutlined />, [ // Use a unique key for the submenu itself
        { key: "products", label: "Tất cả Sản phẩm" },
        { key: "categories", label: "Danh mục" },
        { key: "brands", label: "Thương hiệu" },
    ]),
    getItem("Đơn hàng", "orders", <TruckOutlined />),
    getItem("Thông tin PM", "profile", <InfoCircleOutlined />),
];


const ProductManager = () => {
    // State variables
    const [keySelected, setKeySelected] = useState("products"); // Default selection
    const [collapsed, setCollapsed] = useState(false); // Sidebar collapse state
    const [isTooltipVisible, setTooltipVisible] = useState(false); // Notification tooltip visibility
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 }); // Tooltip position
    const [isRead, setIsRead] = useState(true); // Notification read status (set false for dot)

    // Toggle Sidebar Collapse
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    // Handle Notification Bell Click
    const handleBellClick = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            top: rect.bottom + window.scrollY + 10,
            left: rect.right + window.scrollX - 200, // Adjust positioning relative to bell
        });
        setTooltipVisible((prevVisible) => !prevVisible);
        // Optionally mark as read when opened
        // setIsRead(true);
    };

    // Handle Menu Item Click
    const handleOnClick = ({ key }) => {
        setKeySelected(key);
        // Close notification tooltip if open when navigating
        setTooltipVisible(false);
    };

    // Render Content Based on Selected Key
    const renderPage = (key) => {
        switch (key) {
            case "users": return <AdminUser />;
            case "products": return <AdminProduct />;
            case "categories": return <AdminCategories />;
            case "brands": return <AdminBrands />;
            case "orders": return <AdminOrder />;
            case "profile": return <UserProfile />;
            default: return <AdminProduct />; // Default to products page
        }
    };

    // Define User Dropdown Menu Items
    const userMenuItems = [
        {
            key: 'profileLink',
            label: 'Xem hồ sơ',
            icon: <UserOutlined />,
            onClick: () => {
                setKeySelected('profile'); // Navigate to profile page
                setTooltipVisible(false); // Close tooltip if open
            }
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: logout, // Call the logout function
        },
    ];


    return (
        <Layout style={{ minHeight: '100vh' }}> {/* Main layout container */}
            {/* Ant Design Header */}
            <Header className={styles.header}>
                {/* Logo/Title Area */}
                <div className={styles.logoArea}>
                    {/* Optional: Replace with your actual logo */}
                    {/* <img src="/logo.png" alt="Logo" className={styles.logoImg} /> */}
                    <Title level={3} className={styles.headerTitle}>Product Manager Dashboard</Title>
                </div>

                {/* Right Aligned Header Items */}
                <div className={styles.headerRight}>
                    <Space size="middle" align="center">
                        {/* Notification Bell */}
                        <div style={{ position: "relative" }}>
                            <Badge dot={!isRead} offset={[-5, 5]} > {/* Adjust offset as needed */}
                                <Button
                                    type="text" // Text button blends well with dark header
                                    shape="circle"
                                    icon={<BellOutlined className={styles.headerIcon} />}
                                    onClick={handleBellClick}
                                />
                            </Badge>
                            {/* Your Notification Tooltip/Popover Component */}
                            {/* {isTooltipVisible && <YourNotificationComponent position={tooltipPosition} onClose={() => setTooltipVisible(false)} />} */}
                        </div>

                        {/* User Avatar and Dropdown Menu */}
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow trigger={['click']}>
                            {/* Clickable Avatar Area */}
                            <a onClick={(e) => e.preventDefault()} className={styles.avatarLink}>
                                <Space>
                                    <Avatar size="default" icon={<UserOutlined />} className={styles.avatar} />
                                    {/* Optional: Display Admin Username */}
                                    {/* <span className={styles.username}>Admin</span> */}
                                </Space>
                            </a>
                        </Dropdown>
                    </Space>
                </div>
            </Header>

            {/* Layout container for Sidebar and Content */}
            <Layout>
                {/* Ant Design Sidebar */}
                <Sider
                    trigger={null} // Disable default trigger, use custom button
                    collapsible
                    collapsed={collapsed}
                    width={220} // Width when expanded
                    className={styles.sidebar}
                    theme="dark"
                >
                    {/* Navigation Menu */}
                    <Menu
                        mode="inline"
                        theme="dark"
                        selectedKeys={[keySelected]}
                        // openKeys can be managed with state if needed for submenus
                        style={{ height: 'calc(100% - 48px)', borderRight: 0, overflowY: 'auto', overflowX: 'hidden' }} // Fill sidebar height minus button, allow scroll
                        items={items}
                        onClick={handleOnClick}
                    />
                    {/* Custom Collapse Button at the bottom */}
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={toggleCollapsed}
                        className={styles.collapseButton}
                    />
                </Sider>

                {/* Main Content Area Layout */}
                <Layout className={styles.contentLayout}>
                    <Content className={styles.contentWrapper}>
                        {/* Render the selected page component */}
                        {renderPage(keySelected)}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default ProductManager;