import React from 'react';
import UserProfile from '../components/UserProfile/UserProfile';
import Sidebar from '../components/UserProfile/UserSideBar'; 
import "./UserProfilePage.css";

function UserProfilePage() {
  return (
    <div className="user-profile-page-container">
   
      <div className="user-profile-content">
        <Sidebar /> 
        <UserProfile />
      </div>
    </div>
  );
}

export default UserProfilePage;