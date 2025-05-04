import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const SocialIcon = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
    {children}
  </a>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerColumn}>
            <h4 className={styles.columnTitle}>MyEshop</h4>
            <p className={styles.footerText}>
              Cửa hàng công nghệ hàng đầu, cung cấp Smartphone và Laptop chính hãng.
            </p>
            <div className={styles.socialIcons}>
               <SocialIcon href="https://facebook.com">FB</SocialIcon>
               <SocialIcon href="https://instagram.com">IG</SocialIcon> 
               <SocialIcon href="https://youtube.com">YT</SocialIcon> 
            </div>
          </div>
          <div className={styles.footerColumn}>
            <h4 className={styles.columnTitle}>Liên kết</h4>
            <ul className={styles.linkList}>
              <li><Link to="/about-us" className={styles.footerLink}>Về chúng tôi</Link></li> 
              <li><Link to="/contact" className={styles.footerLink}>Liên hệ</Link></li>
              <li><Link to="/products" className={styles.footerLink}>Sản phẩm</Link></li>
              <li><Link to="/faq" className={styles.footerLink}>Câu hỏi thường gặp</Link></li> 
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h4 className={styles.columnTitle}>Chính sách</h4>
            <ul className={styles.linkList}>
              <li><Link to="/privacy-policy" className={styles.footerLink}>Chính sách bảo mật</Link></li>
              <li><Link to="/terms-of-service" className={styles.footerLink}>Điều khoản dịch vụ</Link></li>
              <li><Link to="/shipping-returns" className={styles.footerLink}>Giao hàng & Đổi trả</Link></li>
            </ul>
          </div>
           <div className={styles.footerColumn}>
            <h4 className={styles.columnTitle}>Liên Hệ</h4>
            <p className={styles.footerText}>
              Địa chỉ: 123 Đường ABC, Quận XYZ, Thành phố HCM
            </p>
            <p className={styles.footerText}>
              Email: support@myeshop.com
            </p>
             <p className={styles.footerText}>
              Điện thoại: (028) 1234 5678
            </p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© {currentYear} MyEshop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;