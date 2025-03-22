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
                         <img src="/avatar.jpg" alt="User Avatar" className="user-avatar" />

            <h3><span>{sampleUser.name}</span></h3>
            <p>
                <label>ID:</label>
                <span>{sampleUser.userID}</span>
            </p>
            <p>
                <label>Email:</label>
                <span>{sampleUser.email}</span>
            </p>
            <p className = "last-item">
                <label>Số điện thoại:</label>
                <span>{sampleUser.phoneNumber}</span>
            </p>
        </div>
    );
}

export default UserDetails;