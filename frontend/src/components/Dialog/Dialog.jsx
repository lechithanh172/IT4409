import React, { useEffect, useRef } from 'react';
import styles from './Dialog.module.css';
import { FaTimes } from 'react-icons/fa';
import useClickOutside from '../../hooks/useClickOutside'; // Import hook đã tạo

const Dialog = ({ isOpen, onClose, title, children }) => {
  const dialogRef = useRef(null);

  // Đóng dialog khi click bên ngoài
  useClickOutside(dialogRef, () => {
      if (isOpen) { // Chỉ đóng khi dialog đang mở
          onClose();
      }
  });

  // Đóng dialog khi nhấn phím Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Ngăn scroll body khi dialog mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup khi component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null; // Không render gì nếu không mở

  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogContainer} ref={dialogRef}>
        <header className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>{title || 'Thông báo'}</h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Đóng">
            <FaTimes />
          </button>
        </header>
        <div className={styles.dialogContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dialog;