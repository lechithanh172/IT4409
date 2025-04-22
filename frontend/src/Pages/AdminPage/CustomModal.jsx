import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Modal, Input, Button } from 'antd';

const CustomModal = ({ isVisible, onClose, selectedUser }) => {
  const [message, setMessage] = useState('');

  // Nếu `selectedUser.mes` là một chuỗi đơn giản, hiển thị trực tiếp
  const messages = selectedUser?.mes ? selectedUser.mes.split('\n') : [];

  return ReactDOM.createPortal(
    <Modal
      open={isVisible}
      title={`Trò chuyện với ${selectedUser?.id || "người dùng"}`}
      onCancel={onClose}
      footer={null}
      style={{ zIndex: 1050 }}
    >
      <div>
        <div
          style={{
            height: 300,
            overflowY: 'auto',
            border: '1px solid #f0f0f0',
            padding: 10,
          }}
        >
          {/* Duyệt qua từng tin nhắn trong mảng `messages` */}
          {messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: 10 }}>
              <strong>{selectedUser.id}:</strong> {msg}
            </div>
          ))}
        </div>
      </div>
    </Modal>,
    document.body
  );
};

export default CustomModal;
