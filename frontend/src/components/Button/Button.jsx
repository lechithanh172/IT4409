import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) => {
  // Kết hợp class từ module và class truyền vào từ props
  const buttonClasses = `${styles.button} ${styles[variant]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClasses}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;