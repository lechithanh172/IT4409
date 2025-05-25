import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) => {

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