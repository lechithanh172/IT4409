import React from 'react';
import './UserDetails.css';

function UserDetails() {
    const sampleUser = {
        userID: "user123",
        name: "Le Anh Duc",
        email: "duclaa@example.com",
        phoneNumber: "0912345678"
    };

    return (
        <div className="user-details">
            <h3>Thông tin cá nhân</h3>
            <p>
                <label>ID:</label>
                <span>{sampleUser.userID}</span>
            </p>
            <p>
                <label>Họ và tên:</label>
                <span>{sampleUser.name}</span>
            </p>
            <p>
                <label>Email:</label>
                <span>{sampleUser.email}</span>
            </p>
            <p>
                <label>Số điện thoại:</label>
                <span>{sampleUser.phoneNumber}</span>
            </p>
        </div>
    );
}

export default UserDetails;