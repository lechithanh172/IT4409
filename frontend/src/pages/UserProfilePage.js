import React from 'react';
import UserProfile from '../components/UserProfile/UserProfile';
import Sidebar from '../components/UserProfile/UserSideBar';
import "./UserProfilePage.css";

function UserProfilePage() {
  return (
     <div className="user-profile-page-container">
      <Sidebar />
      <div className="user-profile-page-content">
        <UserProfile />
      </div>
      </div>
  );
}

export default UserProfilePage;