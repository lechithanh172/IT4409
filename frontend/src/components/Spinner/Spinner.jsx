import React from 'react';
import styles from './Spinner.module.css';

const Spinner = ({ size = 'medium' }) => {
  // Kết hợp class cơ bản và class kích thước (nếu có)
  const spinnerClasses = `${styles.spinner} ${styles[size] || styles.medium}`;

  return (
    <div className={styles.spinnerContainer}>
      <div className={spinnerClasses}></div>
    </div>
  );
};

export default Spinner;