import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
// Giả sử bạn vẫn dùng CartContext để lấy cartItemCount
import { useCart } from '../../contexts/CartContext';
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
  FiUserCheck     // Icon khi đã đăng nhập
} from 'react-icons/fi'; // Sử dụng Feather Icons

const Header = () => {
  // Lấy dữ liệu giỏ hàng từ CartContext
  const { cartItemCount } = useCart();
  // Hook để điều hướng
  const navigate = useNavigate();

  // --- STATE QUẢN LÝ TRẠNG THÁI GIẢ LẬP ĐĂNG NHẬP CỤC BỘ ---
  // Dùng state này để demo giao diện khi đăng nhập/chưa đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Ban đầu là chưa đăng nhập
  // Tên người dùng giả lập, bạn có thể đổi
  const [userName, setUserName] = useState('Tran Duc');

  // --- State quản lý UI khác của Header ---
  const [searchTerm, setSearchTerm] = useState(''); // Nội dung ô tìm kiếm
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Trạng thái mở/đóng menu mobile
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false); // Trạng thái mở/đóng dropdown danh mục
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // Trạng thái mở/đóng dropdown người dùng

  // --- REFS để xử lý click outside ---
  const categoryDropdownRef = useRef(null); // Ref cho dropdown danh mục
  const userDropdownRef = useRef(null);     // Ref cho dropdown người dùng
  const mobileMenuRef = useRef(null);       // Ref cho menu mobile (nếu cần đóng khi click ngoài)

  // --- SỬ DỤNG HOOK useClickOutside ---
  // Đóng dropdown danh mục khi click ra ngoài nó
  useClickOutside(categoryDropdownRef, () => setIsCategoryDropdownOpen(false));
  // Đóng dropdown người dùng khi click ra ngoài nó
  useClickOutside(userDropdownRef, () => setIsUserDropdownOpen(false));
  // Đóng menu mobile khi click ra ngoài (tùy chọn)
  // useClickOutside(mobileMenuRef, () => setIsMobileMenuOpen(false));

  // --- HANDLERS (Hàm xử lý sự kiện) ---

  // Cập nhật state searchTerm khi gõ vào ô tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Xử lý khi submit form tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Ngăn trang reload
    if (searchTerm.trim()) { // Chỉ tìm khi có nội dung (đã bỏ khoảng trắng thừa)
      // Điều hướng đến trang kết quả tìm kiếm (ví dụ: /search?q=keyword)
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(''); // Xóa nội dung ô tìm kiếm
      closeAllDropdowns(); // Đóng các menu/dropdown đang mở
    }
  };

  // Đóng/mở menu mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Đóng các dropdown khác khi mở menu mobile
    setIsCategoryDropdownOpen(false);
    setIsUserDropdownOpen(false);
  };

  // Đóng/mở dropdown danh mục
  const toggleCategoryDropdown = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
    setIsUserDropdownOpen(false); // Đóng dropdown user nếu đang mở
  };

  // Đóng/mở dropdown người dùng
  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    setIsCategoryDropdownOpen(false); // Đóng dropdown danh mục nếu đang mở
  };

  // --- HÀM GIẢ LẬP & CHUYỂN HƯỚNG AUTH ---
  // Xử lý khi nhấn nút Đăng xuất (giả lập)
  const handleLogout = () => {
    setIsLoggedIn(false); // Đặt lại trạng thái đăng nhập là false
    setIsUserDropdownOpen(false); // Đóng dropdown
    // Có thể chuyển hướng về trang chủ nếu muốn
    // navigate('/');
    console.log("Đã đăng xuất (giả lập)");
  };

   // Hàm tiện ích đóng tất cả dropdown/menu
   const closeAllDropdowns = () => {
    setIsMobileMenuOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsUserDropdownOpen(false);
  };

   // Hàm đóng menu mobile khi click vào link bên trong
   const handleMobileLinkClick = () => {
       setIsMobileMenuOpen(false);
   }

   // Hàm chuyển hướng đến trang Đăng nhập
   const handleLoginClick = () => {
    closeAllDropdowns(); // Đóng menu/dropdown
    navigate('/login'); // Điều hướng đến trang /login
 };

 // Hàm chuyển hướng đến trang Đăng ký
 const handleSignupClick = () => {
    closeAllDropdowns(); // Đóng menu/dropdown
    navigate('/signup'); // Điều hướng đến trang /signup
 };
 // --- KẾT THÚC HANDLERS ---


  // --- RENDER COMPONENT ---
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* === Logo === */}
        <Link to="/" className={styles.logo} onClick={closeAllDropdowns}>
          MyEshop
        </Link>

        {/* === Desktop Navigation === */}
        <nav className={styles.desktopNav}>
          {/* Link Trang Chủ */}
          <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} end>
            Trang Chủ
          </NavLink>

          {/* --- Dropdown Danh Mục --- */}
          <div className={styles.dropdownContainer} ref={categoryDropdownRef}>
            <button onClick={toggleCategoryDropdown} className={`${styles.navLink} ${styles.dropdownToggle}`}>
              Danh Mục <FiChevronDown className={`${styles.chevronIcon} ${isCategoryDropdownOpen ? styles.chevronOpen : ''}`} />
            </button>
            {/* Nội dung dropdown chỉ hiện khi isCategoryDropdownOpen là true */}
            {isCategoryDropdownOpen && (
              <div className={`${styles.dropdownMenu} ${styles.categoryDropdown}`}>
                <Link to="/products?category=Smartphone" className={styles.dropdownItem} onClick={toggleCategoryDropdown}>
                  <span className={styles.categoryEmoji}>📱</span> Smartphones
                </Link>
                <Link to="/products?category=Laptop" className={styles.dropdownItem} onClick={toggleCategoryDropdown}>
                 <span className={styles.categoryEmoji}>💻</span> Laptops
                </Link>
                <Link to="/products" className={styles.dropdownItem} onClick={toggleCategoryDropdown}>
                   Tất cả sản phẩm
                </Link>
              </div>
            )}
          </div>

          {/* Link Khuyến Mãi */}
           <NavLink to="/promotions" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            Khuyến Mãi
          </NavLink>
        </nav>

        {/* === Khu vực Actions (Search, Cart, Auth) === */}
        <div className={styles.actions}>
          {/* --- Search Bar --- */}
          <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Tìm kiếm sản phẩm"
            />
            <button type="submit" className={styles.searchButton} aria-label="Tìm kiếm">
              <FiSearch />
            </button>
          </form>

          {/* --- Nút Giỏ hàng --- */}
          <Link to="/cart" className={styles.actionButton} title="Giỏ hàng" onClick={closeAllDropdowns}>
            <FiShoppingCart />
            {/* Hiển thị số lượng chỉ khi lớn hơn 0 */}
            {cartItemCount > 0 && (
              <span className={styles.cartCount}>{cartItemCount}</span>
            )}
          </Link>

          {/* --- Auth / User Menu (Cho Desktop) --- */}
          <div className={styles.desktopAuth}>
            {/* Kiểm tra state isLoggedIn giả lập */}
            {isLoggedIn ? (
              // --- Khi Đã Đăng Nhập ---
              <div className={styles.dropdownContainer} ref={userDropdownRef}>
                <button onClick={toggleUserDropdown} className={`${styles.actionButton} ${styles.userButton}`} title="Tài khoản">
                  <FiUserCheck /> {/* Icon user đã đăng nhập */}
                  {/* Có thể hiển thị tên ngắn ở đây nếu muốn */}
                  {/* <span className={styles.userNameDesktop}>{userName}</span> */}
                   <FiChevronDown className={`${styles.chevronIcon} ${styles.userChevron} ${isUserDropdownOpen ? styles.chevronOpen : ''}`} />
                </button>
                {/* Dropdown menu người dùng */}
                {isUserDropdownOpen && (
                  <div className={`${styles.dropdownMenu} ${styles.userDropdown}`}>
                    {/* Chào mừng */}
                    <div className={styles.dropdownHeader}>Chào, {userName}!</div>
                    {/* Link Hồ sơ */}
                    <Link to="/profile" className={styles.dropdownItem} onClick={toggleUserDropdown}>
                       <FiUser className={styles.dropdownIcon}/> Hồ sơ
                    </Link>
                    {/* Link Đơn hàng */}
                    <Link to="/orders" className={styles.dropdownItem} onClick={toggleUserDropdown}>
                       <FiBox className={styles.dropdownIcon}/> Đơn hàng
                    </Link>
                    {/* Nút Đăng xuất */}
                    <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutButton}`}>
                      <FiLogOut className={styles.dropdownIcon}/> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // --- Khi Chưa Đăng Nhập ---
              <>
                {/* Nút Đăng nhập */}
                <Button variant="secondary" size="small" onClick={handleLoginClick} className={styles.authButton}>
                  Đăng nhập
                </Button>
                {/* Nút Đăng ký */}
                <Button variant="primary" size="small" onClick={handleSignupClick} className={styles.authButton}>
                  Đăng ký
                </Button>
              </>
            )}
          </div>

          {/* --- Nút bật/tắt Menu Mobile --- */}
          <button className={styles.mobileMenuToggle} onClick={toggleMobileMenu} aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}>
            {/* Hiển thị icon X hoặc Hamburger tùy trạng thái */}
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* === Mobile Menu Drawer (Thanh menu trượt ra từ bên phải) === */}
      <nav ref={mobileMenuRef} className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        {/* Header của menu mobile */}
        <div className={styles.mobileMenuHeader}>
          <span className={styles.mobileMenuTitle}>Menu</span>
          <button onClick={toggleMobileMenu} className={styles.closeButton} aria-label="Đóng menu">
            <FiX />
          </button>
        </div>

        {/* --- Thông tin User hoặc Nút Auth trong Mobile Menu --- */}
        <div className={styles.mobileUserInfo}>
           {/* Kiểm tra state isLoggedIn giả lập */}
           {isLoggedIn ? (
             // --- Khi Đã Đăng Nhập (Mobile) ---
             <>
                <div className={styles.mobileWelcome}>
                  <FiUserCheck className={styles.mobileUserIcon}/> Chào, {userName}!
                </div>
                <Link to="/profile" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Hồ sơ</Link>
                <Link to="/orders" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Đơn hàng</Link>
                {/* Nút đăng xuất */}
                <button onClick={() => {handleLogout(); handleMobileLinkClick();}} className={`${styles.mobileNavLink} ${styles.mobileLogoutButton}`}>Đăng xuất</button>
             </>
           ) : (
             // --- Khi Chưa Đăng Nhập (Mobile) ---
             <div className={styles.mobileAuthButtons}>
                 <Button variant="primary" onClick={() => { handleLoginClick(); handleMobileLinkClick(); }} className={styles.mobileAuthBtn}>Đăng nhập</Button>
                 <Button variant="secondary" onClick={() => { handleSignupClick(); handleMobileLinkClick(); }} className={styles.mobileAuthBtn}>Đăng ký</Button>
             </div>
           )}
        </div>

        {/* Đường kẻ ngang phân cách */}
        <hr className={styles.mobileMenuDivider} />

        {/* --- Các Link chính trong Mobile Menu --- */}
        <Link to="/" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Trang Chủ</Link>

        {/* --- Danh mục trong Mobile Menu --- */}
        <div className={styles.mobileCategorySection}>
             <div className={styles.mobileNavGroupTitle}>Danh Mục</div>
            <Link to="/products?category=Smartphone" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>📱 Smartphones</Link>
            <Link to="/products?category=Laptop" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>💻 Laptops</Link>
            <Link to="/products" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Tất cả sản phẩm</Link>
        </div>

         {/* Đường kẻ ngang */}
         <hr className={styles.mobileMenuDivider} />

         {/* --- Các Link khác --- */}
          <Link to="/promotions" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Khuyến Mãi</Link>
          {/* Thêm các link khác nếu cần */}

      </nav>
       {/* Lớp phủ màu đen mờ khi menu mobile mở */}
       {isMobileMenuOpen && <div className={styles.overlay} onClick={toggleMobileMenu}></div>}
    </header>
  );
};

export default Header;