import React from "react";

import "./Navbar.css";

import navLogo from "../../Assets/nav-logo.svg";
import navProfile from "../../Assets/nav-profile.svg";

function Navbar() {
  const logout = () => {
    localStorage.removeItem("auth-token");
    window.location.replace("https://e-commerce-two-sandy-96.vercel.app/");
  };

  return (
    <div className="adminnavbar">
      <img src={navLogo} alt="" className="adminnav-logo" />
      <img
        onClick={() => logout()}
        src={navProfile}
        alt=""
        className="adminnav-profile"
      />
    </div>
  );
}

export default Navbar;
