import React, { useState } from 'react';
import './OrderHistory.css';

function OrderHistory() {
    const [expandedRows, setExpandedRows] = useState([]); // State for expanded rows

    const orders = [
        {
            orderId: '12345',
            date: '2024-03-15',
            total: '120.000đ',
            status: 'Đang vận chuyển',
            items: [
                { id: 1, name: 'Laptop X', quantity: 1, price: '100.000đ' },
                { id: 2, name: 'Mouse Y', quantity: 2, price: '20.000đ' },
            ],
            address: '123 Main St, Anytown, USA', // Add address and other info
            otherInfo: 'Gift for John',
        },
        {
            orderId: '67890',
            date: '2024-03-10',
            total: '55.500đ',
            status: 'Hoàn thành',
            items: [
                { id: 3, name: 'Keyboard Z', quantity: 1, price: '55.500đ' },
            ],
            address: '456 Elm St, Anytown, USA',
            otherInfo: 'Express shipping requested',
        },
        {
            orderId: '13579',
            date: '2024-03-01',
            total: '99.999đ',
            status: 'Chờ phê duyệt',
            items: [
                { id: 4, name: 'Monitor A', quantity: 1, price: '99.999đ' }
            ],
            address: '789 Oak St, Anytown, USA',
            otherInfo: 'Order placed on hold',
        },
        {
            orderId: '24680',
            date: '2024-02-25',
            total: '45.000đ',
            status: 'Huỷ',
            items: [
                { id: 5, name: 'Headphones B', quantity: 1, price: '45.000đ' },
            ],
            address: '101 Pine St, Anytown, USA',
            otherInfo: 'Customer requested cancellation',
        },
    ];
  const toggleRow = (orderId) => {
    if (expandedRows.includes(orderId)) {
      setExpandedRows(expandedRows.filter((id) => id !== orderId));
    } else {
      setExpandedRows([...expandedRows, orderId]);
    }
  };
    return (
        <div className="order-history">
            {orders.length === 0 ? (
                <p>Bạn chưa đặt đơn hàng nào.</p>
            ) : (
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>MÃ ĐƠN HÀNG</th>
                            <th>NGÀY ĐẶT HÀNG</th>
                            <th>TỔNG THANH TOÁN</th>
                            <th>TRẠNG THÁI</th>
                            <th>HÀNG ĐÃ ĐẶT</th>
                            <th></th> {/* Empty header for expand/collapse */}
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <React.Fragment key={order.orderId}>
                                <tr>
                                    <td>{order.orderId}</td>
                                    <td>{order.date}</td>
                                    <td>{order.total}</td>
                                    <td>
                                        {order.status === 'Chờ phê duyệt' && (
                                            <button className="status-button pending-approval">Chờ phê duyệt</button>
                                        )}
                                        {order.status === 'Đang vận chuyển' && (
                                            <button className="status-button shipping">Đang vận chuyển</button>
                                        )}
                                        {order.status === 'Hoàn thành' && (
                                            <button className="status-button completed">Hoàn thành</button>
                                        )}
                                        {order.status === 'Huỷ' && (
                                            <button className="status-button cancelled">Huỷ</button>
                                        )}
                                        {!(order.status === 'Chờ phê duyệt' || order.status === 'Đang vận chuyển' || order.status === 'Hoàn thành' || order.status === 'Huỷ') && (
                                            <span>{order.status}</span>
                                        )}
                                    </td>
                                    <td>
                                        <ul className="item-list">
                                            {order.items.map((item) => (
                                                <li key={item.id}>
                                                    {item.name} (Số lượng: {item.quantity})
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td>
                                        <button
                                            className="expand-button"
                                            onClick={() => toggleRow(order.orderId)}
                                        >
                                            {expandedRows.includes(order.orderId) ? 'Thu gọn' : 'Xem chi tiết'}
                                        </button>
                                    </td>
                                </tr>
                                {/* Expanded Row */}
                                {expandedRows.includes(order.orderId) && (
                                    <tr className="expanded-row">
                                        <td colSpan="6">
                                            <p><strong>Địa chỉ:</strong> {order.address}</p>
                                            <p><strong>Chú thích cho người vận chuyển:</strong> {order.otherInfo}</p>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default OrderHistory;