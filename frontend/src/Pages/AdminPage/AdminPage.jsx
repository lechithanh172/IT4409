import React, { useEffect, useState } from "react";
import { UserOutlined, ProductOutlined, BellOutlined } from "@ant-design/icons";
import { Badge, Button, Menu } from "antd";
import AdminUser from "../../Components/AdminPage/AdminUser/AdminUser";
import AdminProduct from "../../Components/AdminPage/AdminProduct/AdminProduct";
import boxImage from "./box.png";
import AdminOrder from "../../Components/AdminPage/AdminOrder/AdminOrder";
import AdminProfile from "../../Components/AdminPage/AdminProfile/AdminProfile";
import styles from "./AdminPage.module.css";
import { InfoCircleOutlined } from "@ant-design/icons";
import { io } from "socket.io-client";
import Tooltip from "./Tooltip ";
import CustomModal from './CustomModal';

const socket = io("http://localhost:5001");

const logout = () => {
  console.log("User logged out");
  localStorage.clear();
  window.location.href = "/";
};

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const items = [
  getItem("Sản phẩm", "products", <ProductOutlined />),
  getItem("Người dùng", "users", <UserOutlined />),
  getItem("Đơn hàng", "orders", <img src={boxImage} alt="Order" width={14} />),
  getItem("Thông tin", "profile", <InfoCircleOutlined />),
];

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTooltipVisible, setTooltipVisible] = useState(false);
  const [isRead, setIsRead] = useState(true);
  const [keySelected, setKeySelected] = useState("products");
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isChatModalVisible, setChatModalVisible] = useState(false);

  useEffect(() => {
    const role = "admin";
    if (role !== "admin") {
      window.location.href = "/";
      return;
    }

    socket.on("receive_message", (data) => {
      console.log("Received new message:", data);
      setMessages((prevMessages) => [...prevMessages, data]);
      setIsRead(false);

      setUsers((prevUsers) => {
        if (!prevUsers.some((user) => user.id === data.userId)) {
          return [...prevUsers, { id: data.userId, mes: data.message }];
        }
        return prevUsers;
      });
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const handleBellClick = (event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      top: rect.bottom + window.scrollY + 10,
      left: rect.left + window.scrollX - 100,
    });
    setTooltipVisible((prevVisible) => !prevVisible);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setTooltipVisible(false); // Close tooltip when a user is selected
    setChatModalVisible(true); // Open chat modal with the selected user
  };

  const handleOnClick = ({ key }) => {
    setKeySelected(key);
  };

  const renderPage = (key) => {
    switch (key) {
      case "users":
        return <AdminUser />;
      case "products":
        return <AdminProduct />;
      case "orders":
        return <AdminOrder />;
      case "profile":
        return <AdminProfile />;
      default:
        return <></>;
    }
  };

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Admin</h1>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Badge dot={!isRead} offset={[-10, 10]}>
              <Button
                ghost
                shape="circle"
                icon={<BellOutlined />}
                onClick={handleBellClick}
              />
            </Badge>

            <Tooltip
              visible={isTooltipVisible}
              position={tooltipPosition}
              onClose={() => setTooltipVisible(false)}
              content={
                <div>
                  <h4>Người dùng nhắn tin:</h4>
                  <ul style={{ margin: 5, padding: 0, listStyle: "none" }}>
                    {users.map((user) => (
                      <li
                        key={user.id}
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          background: "#f9f9f9",
                          borderRadius: "4px",
                          marginBottom: "5px",
                        }}
                        onClick={() => handleUserClick(user)}
                      >
                        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                          ID: {user.id}
                        </div>
                        <div style={{ color: "#333" }}>
                          Tin nhắn: {user.mes}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              }
            />
          </div>
          <Button
            ghost
            onClick={logout}
            style={{ marginLeft: 10, marginRight: 40 }}
          >
            Đăng xuất
          </Button>
        </div>
      </header>
      <div>
        <div className={styles.menuContainer}>
          <Menu
            mode="inline"
            selectedKeys={[keySelected]}
            style={{ height: "100%" }}
            items={items}
            onClick={handleOnClick}
          />
        </div>
        <div className={styles.content}>
          <div
            style={{ height: "calc(100vh - 120px - 40px)", overflowY: "auto" }}
          >
            {renderPage(keySelected)}
          </div>
        </div>
      </div>
      {isChatModalVisible && (
        <CustomModal
          
          isVisible={isChatModalVisible}
          onClose={() => setChatModalVisible(false)}
          selectedUser={selectedUser}
          socket={socket}
        />
      )}
    </>
  );
};

export default Admin;
