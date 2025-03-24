import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import UserProfilePage from './pages/UserProfilePage';
import UserOrderHistoryPage from './pages/UserOrderHistoryPage'; // Import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/profile" replace />} />
        <Route path="/profile" element={<UserProfilePage />} />
         <Route path="/profile/order-history" element={<UserOrderHistoryPage />} /> {/* Add route */}
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;