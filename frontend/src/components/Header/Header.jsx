import React, { useState, useRef, useEffect } from 'react'; // Thêm useEffect nếu cần
import { Link, NavLink, useNavigate } from 'react-router-dom';
// Giả sử bạn vẫn dùng CartContext để lấy cartItemCount
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext'; // *** IMPORT useAuth ***
import Button from '../Button/Button'; // Import Button component
import styles from './Header.module.css'; // Import CSS Module
import useClickOutside from '../../hooks/useClickOutside'; // Import hook click outside

// Import icons
import {
  FiShoppingCart,
  FiSearch,
  FiUser,         // Icon mặc định khi chưa đăng nhập
  FiMenu,
  FiX,
  FiChevronDown,
  FiLogOut,
  FiBox,          // Icon cho đơn hàng
  FiUserCheck,    // Icon khi đã đăng nhập
  FiLogIn         // Icon cho nút đăng nhập (tùy chọn)
} from 'react-icons/fi'; // Sử dụng Feather Icons

const Header = () => {
  // Lấy dữ liệu giỏ hàng
  const { cartItemCount } = useCart();
  // *** LẤY DỮ LIỆU AUTH TỪ CONTEXT ***
  const { user, isAuthenticated, logout } = useAuth();
  // Hook để điều hướng
  const navigate = useNavigate();

  // --- BỎ STATE GIẢ LẬP ---
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [userName, setUserName] = useState('User Name');

  // --- State quản lý UI của Header ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // --- REFS ---
  const categoryDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // --- HOOKS ---
  useClickOutside(categoryDropdownRef, () => setIsCategoryDropdownOpen(false));
  useClickOutside(userDropdownRef, () => setIsUserDropdownOpen(false));

  // --- HANDLERS ---
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      closeAllDropdowns();
    }
  };
  const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
      setIsCategoryDropdownOpen(false);
      setIsUserDropdownOpen(false);
  };
  const toggleCategoryDropdown = () => {
      setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
      setIsUserDropdownOpen(false);
  };
  const toggleUserDropdown = () => {
      setIsUserDropdownOpen(!isUserDropdownOpen);
      setIsCategoryDropdownOpen(false);
  };
  const closeAllDropdowns = () => {
      setIsMobileMenuOpen(false);
      setIsCategoryDropdownOpen(false);
      setIsUserDropdownOpen(false);
  };
  const handleMobileLinkClick = () => setIsMobileMenuOpen(false);

   // --- HÀM CHUYỂN HƯỚNG ĐẾN AUTH PAGES ---
   const handleLoginClick = () => {
    closeAllDropdowns();
    navigate('/login');
 };
 const handleSignupClick = () => {
    closeAllDropdowns();
    navigate('/signup');
 };

  // --- HÀM LOGOUT (Gọi từ Context)---
  const handleLogout = () => {
    logout(); // *** GỌI HÀM LOGOUT TỪ AUTHCONTEXT ***
    setIsUserDropdownOpen(false); // Đóng dropdown sau khi logout
    // navigate('/'); // Không cần navigate ở đây nếu ProtectedRoute xử lý tốt
    console.log("Đã gọi hàm logout từ context");
  };
 // --- KẾT THÚC HANDLERS ---


  // --- RENDER COMPONENT ---
  // Lấy tên hiển thị từ user object trong context
  const displayName = user?.firstName || user?.username || 'Tài khoản'; // Ưu tiên firstName, rồi đến username

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* === Logo === */}
        <Link to="/" className={styles.logo} onClick={closeAllDropdowns}>MyEshop</Link>

        {/* === Desktop Navigation === */}
        <nav className={styles.desktopNav}>
             {/* ... các NavLink ... */}
             <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} end>Trang Chủ</NavLink>
              <div className={styles.dropdownContainer} ref={categoryDropdownRef}>
                <button onClick={toggleCategoryDropdown} className={`${styles.navLink} ${styles.dropdownToggle}`}>Danh Mục <FiChevronDown className={`${styles.chevronIcon} ${isCategoryDropdownOpen ? styles.chevronOpen : ''}`} /></button>
                {isCategoryDropdownOpen && (
                  <div className={`${styles.dropdownMenu} ${styles.categoryDropdown}`}>
                    <Link to="/products?category=Smartphone" className={styles.dropdownItem} onClick={toggleCategoryDropdown}><span className={styles.categoryEmoji}>📱</span> Smartphones</Link>
                    <Link to="/products?category=Laptop" className={styles.dropdownItem} onClick={toggleCategoryDropdown}><span className={styles.categoryEmoji}>💻</span> Laptops</Link>
                    <Link to="/products" className={styles.dropdownItem} onClick={toggleCategoryDropdown}>Tất cả sản phẩm</Link>
                  </div>
                )}
              </div>
              <NavLink to="/promotions" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Khuyến Mãi</NavLink>
        </nav>

        {/* === Khu vực Actions === */}
        <div className={styles.actions}>
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
            <input type="text" placeholder="Tìm kiếm sản phẩm..." className={styles.searchInput} value={searchTerm} onChange={handleSearchChange} aria-label="Tìm kiếm sản phẩm"/>
            <button type="submit" className={styles.searchButton} aria-label="Tìm kiếm"><FiSearch /></button>
          </form>

          {/* Nút Giỏ hàng */}
          <Link to="/cart" className={styles.actionButton} title="Giỏ hàng" onClick={closeAllDropdowns}>
            <FiShoppingCart />
            {cartItemCount > 0 && (<span className={styles.cartCount}>{cartItemCount}</span>)}
          </Link>

          {/* --- Auth / User Menu (Desktop) --- */}
          <div className={styles.desktopAuth}>
            {/* *** KIỂM TRA isAuthenticated TỪ AUTHCONTEXT *** */}
            {isAuthenticated ? (
              // --- Khi Đã Đăng Nhập ---
              <div className={styles.dropdownContainer} ref={userDropdownRef}>
                <button onClick={toggleUserDropdown} className={`${styles.actionButton} ${styles.userButton}`} title={displayName}>
                  <FiUserCheck />
                  {/* Hiển thị username hoặc tên */}
                  <span className={styles.userNameDesktop}>{displayName}</span>
                  <FiChevronDown className={`${styles.chevronIcon} ${styles.userChevron} ${isUserDropdownOpen ? styles.chevronOpen : ''}`} />
                </button>
                {/* Dropdown menu người dùng */}
                {isUserDropdownOpen && (
                  <div className={`${styles.dropdownMenu} ${styles.userDropdown}`}>
                    {/* Chào mừng với tên */}
                    <div className={styles.dropdownHeader}>Chào, {displayName}!</div>
                    <Link to="/profile" className={styles.dropdownItem} onClick={toggleUserDropdown}><FiUser className={styles.dropdownIcon}/> Hồ sơ</Link>
                    <Link to="/orders" className={styles.dropdownItem} onClick={toggleUserDropdown}><FiBox className={styles.dropdownIcon}/> Đơn hàng</Link>
                    {/* Nút Đăng xuất gọi handleLogout */}
                    <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutButton}`}><FiLogOut className={styles.dropdownIcon}/> Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              // --- Khi Chưa Đăng Nhập ---
              <>
                <Button variant="secondary" size="small" onClick={handleLoginClick} className={styles.authButton}><FiLogIn /> Đăng nhập</Button>
                <Button variant="primary" size="small" onClick={handleSignupClick} className={styles.authButton}>Đăng ký</Button>
              </>
            )}
          </div>

          {/* Nút bật/tắt Menu Mobile */}
          <button className={styles.mobileMenuToggle} onClick={toggleMobileMenu} aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}>
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <nav ref={mobileMenuRef} className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
         <div className={styles.mobileMenuHeader}>
              <span className={styles.mobileMenuTitle}>Menu</span>
              <button onClick={toggleMobileMenu} className={styles.closeButton} aria-label="Đóng menu"><FiX /></button>
         </div>

         {/* Thông tin User hoặc Nút Auth trong Mobile Menu */}
         <div className={styles.mobileUserInfo}>
            {/* *** KIỂM TRA isAuthenticated *** */}
           {isAuthenticated ? (
             <>
                <div className={styles.mobileWelcome}><FiUserCheck className={styles.mobileUserIcon}/> Chào, {displayName}!</div>
                <Link to="/profile" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Hồ sơ</Link>
                <Link to="/orders" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Đơn hàng</Link>
                <button onClick={() => { handleLogout(); handleMobileLinkClick(); }} className={`${styles.mobileNavLink} ${styles.mobileLogoutButton}`}>Đăng xuất</button>
             </>
           ) : (
             <div className={styles.mobileAuthButtons}>
                 <Button variant="primary" onClick={() => { handleLoginClick(); handleMobileLinkClick(); }} className={styles.mobileAuthBtn}>Đăng nhập</Button>
                 <Button variant="secondary" onClick={() => { handleSignupClick(); handleMobileLinkClick(); }} className={styles.mobileAuthBtn}>Đăng ký</Button>
             </div>
           )}
        </div>

        <hr className={styles.mobileMenuDivider} />
         {/* ... Các link khác ... */}
         <Link to="/" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Trang Chủ</Link>
         <div className={styles.mobileCategorySection}>
            <div className={styles.mobileNavGroupTitle}>Danh Mục</div>
            <Link to="/products?category=Smartphone" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>📱 Smartphones</Link>
            <Link to="/products?category=Laptop" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>💻 Laptops</Link>
            <Link to="/products" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Tất cả sản phẩm</Link>
        </div>
        <hr className={styles.mobileMenuDivider} />
        <Link to="/promotions" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Khuyến Mãi</Link>
      </nav>
       {isMobileMenuOpen && <div className={styles.overlay} onClick={toggleMobileMenu}></div>}
    </header>
  );
};

export default Header;