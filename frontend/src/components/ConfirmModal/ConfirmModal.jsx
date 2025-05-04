import React from 'react';
import styles from './ConfirmModal.module.css'; // Tạo file CSS tương ứng
import Button from '../Button/Button'; // Sử dụng lại Button component

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Xác nhận", cancelText = "Hủy bỏ" }) => {
  if (!isOpen) {
    return null; // Không render gì nếu modal không mở
  }

  // Ngăn chặn việc click bên trong modal làm đóng modal
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // Lớp phủ nền mờ
    <div className={styles.modalOverlay} onClick={onClose}>
      {/* Nội dung Modal */}
      <div className={styles.modalContent} onClick={handleContentClick}>
        {/* Tiêu đề Modal */}
        <h2 className={styles.modalTitle}>{title}</h2>
        {/* Thông điệp xác nhận */}
        <p className={styles.modalMessage}>{message}</p>
        {/* Các nút hành động */}
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={onClose} className={styles.cancelButton}>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} className={styles.confirmButton}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;