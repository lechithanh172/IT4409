import React, { useState } from "react";
import { Link } from "react-router-dom";

import "./MenuBottomTabs.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCircleUser,
  faHouse,
  faPhone,
  faTruckFast,
} from "@fortawesome/free-solid-svg-icons";

function MenuBottomTabs({ active }) {
  const [isMenu, setIsMenu] = useState(false);

  const handleMenu = () => {
    setIsMenu(!isMenu);
  };

  return (
    <div className="menu-bottom-tabs">
      <ul>
        <li
          className={`menu-bottom-item ${
            active === "Home" && !isMenu ? "is-active" : ""
          }`}
        >
          <Link to={"/"}>
            <FontAwesomeIcon icon={faHouse} className="icon" />
            <span>Trang chủ</span>
          </Link>
        </li>
        <li className={`menu-bottom-item ${isMenu ? "is-active" : ""}`}>
          <a onClick={handleMenu}>
            <FontAwesomeIcon icon={faBars} className="icon" />
            <span>Danh mục</span>
          </a>
        </li>
        <li
          className={`menu-bottom-item ${
            active === "2" && !isMenu ? "is-active" : ""
          }`}
        >
          <Link to={"/"}>
            <FontAwesomeIcon icon={faPhone} className="icon" />
            <span>Gọi mua hàng</span>
          </Link>
        </li>
        <li
          className={`menu-bottom-item ${
            active === "3" && !isMenu ? "is-active" : ""
          }`}
        >
          <Link to={"/"}>
            <FontAwesomeIcon icon={faTruckFast} className="icon" />
            <span>Đơn hàng</span>
          </Link>
        </li>
        {localStorage.getItem("auth-token") ? (
          <li
            className="menu-bottom-item"
            onClick={() => {
              localStorage.removeItem("auth-token");
              window.location.replace("/");
            }}
          >
            <a>
              <FontAwesomeIcon icon={faCircleUser} className="icon" />
              <span>Đăng xuất</span>
            </a>
          </li>
        ) : (
          <li
            className={`menu-bottom-item ${
              active === "Login" && !isMenu ? "is-active" : ""
            }`}
          >
            <Link to={"/login"}>
              <FontAwesomeIcon icon={faCircleUser} className="icon" />
              <span>Đăng nhập</span>
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

export default MenuBottomTabs;
