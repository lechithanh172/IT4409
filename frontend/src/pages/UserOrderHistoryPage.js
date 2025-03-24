import React from 'react';
import Sidebar from '../components/UserProfile/UserSideBar';
import OrderHistory from '../components/UserProfile/OrderHistory'; // Import the component
import "./UserOrderHistoryPage.css";

function UserOrderHistoryPage() {
return (
<div className="user-order-history-page-container">
<Sidebar />
<div className="user-order-history-table">
<h2>LỊCH SỬ ĐẶT HÀNG</h2>
<OrderHistory />
</div>
</div>
);
}
export default UserOrderHistoryPage;