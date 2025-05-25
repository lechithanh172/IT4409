import React from 'react';
import styles from './ConfirmModal.module.css'; 
import Button from '../Button/Button'; 

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Xác nhận", cancelText = "Hủy bỏ" }) => {
  if (!isOpen) {
    return null; 
  }

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={handleContentClick}>
        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalMessage}>{message}</p>
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