import React, { useState, useEffect } from 'react';
import UserDetails from './UserDetails';
import { getUserProfile } from '../../services/userService';  
import './UserProfile.css';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
         const userData = await getUserProfile(123);
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, []); 

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!user) {
    return <p>Could not load user profile.</p>;
  }

  return (
    <div className="user-profile">
      <UserDetails user={user} />
    </div>
  );
}

export default UserProfile;