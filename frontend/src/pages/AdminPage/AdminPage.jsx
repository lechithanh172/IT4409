import React, { useState } from "react"; // Removed useEffect unless needed elsewhere
import {
  UserOutlined,
  BellOutlined,
  InfoCircleOutlined,
  CaretRightOutlined,
  CaretLeftOutlined,
  TruckOutlined,
  HddOutlined,
} from "@ant-design/icons";
import { Badge, Button, Menu } from "antd";
import AdminUser from "../../Components/AdminPages/AdminUser/AdminUser";
import AdminProduct from "../../Components/AdminPages/AdminProduct/AdminProduct";
import AdminOrder from "../../Components/AdminPages/AdminOrder/AdminOrder";
import AdminProfile from "../../Components/AdminPages/AdminProfile/AdminProfile";
import AdminBrands from "../../components/AdminPages/AdminBrand/AdminBrands";
import AdminCategories from "../../components/AdminPages/AdminCategory/AdminCategories";
import styles from "./AdminPage.module.css";
// import Tooltip from "./Tooltip "; // Assuming Tooltip might be added back later
// import CustomModal from './CustomModal'; // Assuming Modal might be added back later

const logout = () => {
  console.log("User logged out");
  localStorage.clear();
  window.location.href = "/";
};

function getItem(label, key, icon, children, type) {
  return { key, icon, children, label, type };
}

// Define items - Add components for Categories/Brands if they exist
const items = [
  getItem("Sản phẩm", " products", <HddOutlined />, [
    { key: "products", label: "Tất cả" },
    { key: "categories", label: "Danh mục" },
    { key: "brands", label: "Thương hiệu" },
  ]),
  getItem("Người dùng", "users", <UserOutlined />),
  getItem("Đơn hàng", "orders", <TruckOutlined />),
  getItem("Thông tin", "profile", <InfoCircleOutlined />),
];


const Admin = () => {
  const [keySelected, setKeySelected] = useState("products");
  const [collapsed, setCollapsed] = useState(false); // State for sidebar collapse
  const [isTooltipVisible, setTooltipVisible] = useState(false); // State for notification tooltip
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 }); // Position for tooltip
  const [isRead, setIsRead] = useState(true); // Notification read status

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleBellClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect(); // Use currentTarget
    setTooltipPosition({
        // Adjust position relative to the bell icon as needed
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX - 150, // May need fine-tuning
    });
    setTooltipVisible((prevVisible) => !prevVisible);
    // setIsRead(true); // Mark as read when clicked
  };

  const handleOnClick = ({ key }) => {
    setKeySelected(key);
  };

  const renderPage = (key) => {
    switch (key) {
      case "users": return <AdminUser />;
      case "products": return <AdminProduct />;
      case "categories": return <AdminCategories />;
      case "brands": return <AdminBrands />;
      case "orders": return <AdminOrder />;
      case "profile": return <AdminProfile />;
      default: return <AdminProduct />; // Default page
    }
  };

  return (
    // Use a fragment or a main div wrapper if needed for the whole component
    <>
      {/* Header remains fixed */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Admin</h1>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ position: "relative", marginRight: "15px" }}>
            <Badge dot={!isRead} offset={[-10, 10]}>
              <Button
                ghost // Use ghost for better visibility on dark background
                shape="circle"
                icon={<BellOutlined />}
                onClick={handleBellClick}
                className={styles.notificationIcon} // Use specific class if needed
              />
            </Badge>
            {/* Conditionally render your Tooltip here based on isTooltipVisible */}
            {/* {isTooltipVisible && <Tooltip ... />} */}
          </div>
          <Button
            ghost // Use ghost for better visibility
            onClick={logout}
            className={styles.headerButton} // Apply button style
          >
            Đăng xuất
          </Button>
        </div>
      </header>

      {/* NEW: Main layout container below the header */}
      <div className={styles.mainLayout}>
        {/* Sidebar Area */}
        <div className={`${styles.sidebarWrapper} ${collapsed ? styles.sidebarWrapperCollapsed : ''}`}>
           {/* Add the collapse button INSIDE the sidebar wrapper */}
           <Button
             type="text" // Or choose another type like 'link' or 'default'
             icon={collapsed ? <CaretRightOutlined /> : <div><CaretLeftOutlined /></div>}
             onClick={toggleCollapsed}
             className={styles.collapseButton}
           />
          <Menu
            mode="inline"
            theme="dark" // Match your original background color intent
            selectedKeys={[keySelected]}
            style={{ height: 'calc(100% - 60px)', borderRight: 0 }} // Adjust height considering button
            items={items}
            inlineCollapsed={collapsed}
            onClick={handleOnClick}
            className={styles.menuAntd} // Add specific class if needed
          />
        </div>

        {/* Content Area */}
        <div className={styles.contentWrapper}>
          {/* The actual page content rendered here */}
          {renderPage(keySelected)}
        </div>
      </div>
    </>
  );
};

export default Admin;