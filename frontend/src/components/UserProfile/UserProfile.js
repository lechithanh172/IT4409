import React, { useState } from 'react';
import './UserProfile.css';

function UserDetails() {

    const [userData, setUserData] = useState({
        userID: "user123",
        name: "Lê Hà Anh Đức",
        email: "fantasys3142@gmail.com",
        phoneNumber: "0966957208",
        gender: "Nam",
        birthdate: "17/02/2003",
        membershipDate: "23/02/2025",
        accumulatedPoints: "0đ",
        totalSpending: "1.250.000đ",
        address: "Chưa có địa chỉ mặc định"
    });
    const [editableFields, setEditableFields] = useState({
        name: false,
        address: false,
    });

    const [isEditing, setIsEditing] = useState(false);
    const toggleEdit = (field) => {
        setEditableFields((prevFields) => ({
            ...prevFields,
            [field]: !prevFields[field],
        }));
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUserData(prevUserData => ({
            ...prevUserData,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setIsEditing(false);
        setEditableFields({
            name:false,
            address:false
        });

        console.log("Submitting updated data:", userData);
        alert("Thông tin đã được cập nhật!");
    };


    return (
        <div className="user-details">
            <img src="/avatar.jpg" alt="User Avatar" className="user-avatar" />
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <label>Họ và tên:</label>
                    {editableFields.name ? (
                        <input
                            type="text"
                            name="name"
                            value={userData.name}
                            onChange={handleInputChange}
                        />
                    ) : (
                        <span>{userData.name}</span>
                    )}
                        <span className="edit-icon" onClick={() => toggleEdit('name')}>
                            ✎
                        </span>
                </div>
                <div className="form-row">
                    <label>Email:</label>
                    <span>{userData.email}</span>
                </div>
                <div className="form-row">
                    <label>Giới tính:</label>
                    <span>{userData.gender}</span>
                </div>
                <div className="form-row">
                    <label>Số điện thoại:</label>
                    <span>{userData.phoneNumber}</span>
                </div>
                <div className="form-row">
                    <label>Sinh nhật:</label>
                    <span>{userData.birthdate}</span>
                </div>
                <div className="form-row">
                    <label>Ngày tạo tài khoản:</label>
                    <span>{userData.membershipDate}</span>
                </div>
                <div className="form-row">
                    <label>Tổng tiền tích lũy từ 01/01/2024:</label>
                    <span>{userData.accumulatedPoints}</span>
                </div>
                <div className="form-row">
                    <label>Tổng tiền đã mua sắm:</label>
                    <span>{userData.totalSpending}</span>
                </div>
                <div className="form-row">
                    <label>Địa chỉ:</label>
                    {editableFields.address ? (
                        <input
                            type="text"
                            name="address"
                            value={userData.address}
                            onChange={handleInputChange}
                        />
                    ) : (
                        <span>{userData.address}</span>
                    )}

                        <span className="edit-icon" onClick={() => toggleEdit('address')}>
                            ✎
                        </span>

                </div>
                <div className="form-row">
                    <label>Đổi mật khẩu</label>
                </div>

                <button type="submit" className="update-button">

                        Cập nhật thông tin

                </button>
            </form>
        </div>
    );
}

export default UserDetails;