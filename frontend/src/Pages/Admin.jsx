import React from "react";
import "./Css/Admin.css";
import Navbar from "../Components/admin/Navbar/Navbar";
import Sidebar from "../Components/admin/Sidebar/Sidebar";
import AddAndEditProduct from "../Components/admin/AddAndEditProduct/AddAndEditProduct";
import ListProduct from "../Components/admin/ListProduct/ListProduct";
import { Navigate, Route, Routes } from "react-router-dom";

function Admin() {
  return (
    <div>
      <Navbar />
      <div className="admin">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/admin/listProduct" />} />
          <Route
            path="/addProduct"
            element={<AddAndEditProduct mode={"add"} />}
          />
          <Route path="/listProduct" element={<ListProduct />} />
          <Route path="/edit" element={<AddAndEditProduct mode={"edit"} />}>
            <Route
              path=":productId"
              element={<AddAndEditProduct mode={"edit"} />}
            />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default Admin;
