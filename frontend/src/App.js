import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; // Import Navigate
import Home from './pages/Home'; // Assuming you have a Home component
import UserProfilePage from './pages/UserProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/profile" replace />} />  {/* Redirect from / to /profile */}
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/home" element={<Home />} /> {/* Add routes for other pages later */}
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;