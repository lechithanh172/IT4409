import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api'; // Đảm bảo đường dẫn đúng
import Button from '../Button/Button';
import styles from './Header.module.css';
import useClickOutside from '../../hooks/useClickOutside';
import Spinner from '../Spinner/Spinner';

// Import icons
import {
  FiShoppingCart, FiSearch, FiUser, FiMenu, FiX, FiChevronDown,
  FiLogOut, FiBox, FiUserCheck, FiLogIn, FiGrid, FiSettings, FiShield, FiPackage // Thêm icon cho Admin/PM
} from 'react-icons/fi';

const Header = () => {
  // Hooks và Context
  const { cartItemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth(); // Lấy user, trạng thái đăng nhập, hàm logout
  const navigate = useNavigate();

  // State UI
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // State cho Categories
  const [categories, setCategories] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);

  // Refs
  const categoryDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Hook click outside
  useClickOutside(categoryDropdownRef, () => setIsCategoryDropdownOpen(false));
  useClickOutside(userDropdownRef, () => setIsUserDropdownOpen(false));

  // Fetch Categories khi mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoryLoading(true);
      try {
        const response = await apiService.getAllCategories();
        if (response && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Lỗi fetch categories:", error);
        setCategories([]);
      } finally {
        setIsCategoryLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      navigate(`/search?q=${encodeURIComponent(trimmedSearchTerm)}`);
      setSearchTerm('');
      closeAllDropdowns();
    }
  };
  const toggleMobileMenu = () => {
      setIsMobileMenuOpen(prev => !prev);
      setIsCategoryDropdownOpen(false);
      setIsUserDropdownOpen(false);
  };
  const toggleCategoryDropdown = () => {
      if (!isCategoryLoading) {
          setIsCategoryDropdownOpen(prev => !prev);
          setIsUserDropdownOpen(false);
      }
  };
  const toggleUserDropdown = () => {
      setIsUserDropdownOpen(prev => !prev);
      setIsCategoryDropdownOpen(false);
  };
  const closeAllDropdowns = () => {
      setIsMobileMenuOpen(false);
      setIsCategoryDropdownOpen(false);
      setIsUserDropdownOpen(false);
  };
  const handleMobileLinkClick = () => setIsMobileMenuOpen(false);
  const handleLoginClick = () => { closeAllDropdowns(); navigate('/login'); };
  const handleSignupClick = () => { closeAllDropdowns(); navigate('/signup'); };
  const handleLogout = () => {
      logout();
      setIsUserDropdownOpen(false);
      // navigate('/'); // Chuyển về trang chủ nếu cần
  };

  // Lấy tên hiển thị và vai trò (chuyển role về chữ thường để dễ so sánh)
  const displayName = user?.firstName || user?.username || 'Tài khoản';
  const userRole = user?.role?.toLowerCase(); // Lấy role và chuyển thành chữ thường

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={closeAllDropdowns}>MyEshop</Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
             <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} end>Trang Chủ</NavLink>

              {/* Dropdown Danh Mục */}
              <div className={styles.dropdownContainer} ref={categoryDropdownRef}>
                <button onClick={toggleCategoryDropdown} className={`${styles.navLink} ${styles.dropdownToggle}`} disabled={isCategoryLoading} aria-haspopup="true" aria-expanded={isCategoryDropdownOpen}>
                  Danh Mục {isCategoryLoading ? <Spinner size="inline" /> : <FiChevronDown className={`${styles.chevronIcon} ${isCategoryDropdownOpen ? styles.chevronOpen : ''}`} />}
                </button>
                <div className={` ${styles.dropdownMenu} ${styles.categoryDropdown} ${isCategoryDropdownOpen ? styles.show : ''} `} role="menu">
                    {isCategoryLoading ? ( <div className={styles.dropdownLoading} role="menuitem" aria-disabled="true"><Spinner size="small"/> Đang tải...</div> )
                     : categories.length > 0 ? ( <>
                           <Link to="/products" className={styles.dropdownItem} onClick={closeAllDropdowns} role="menuitem"><FiGrid className={styles.categoryIcon} /> Tất cả sản phẩm</Link>
                           <hr className={styles.dropdownDivider}/>
                           {categories.map((category) => (<Link to={`/products?category=${encodeURIComponent(category.categoryName)}`} key={category.categoryId} className={styles.dropdownItem} onClick={closeAllDropdowns} role="menuitem"><span className={styles.categoryEmoji}></span>{category.categoryName}</Link>))}
                         </>
                    ) : ( <div className={styles.dropdownError} role="menuitem" aria-disabled="true"><p>Không tải được danh mục.</p></div> )}
                </div>
              </div>

              <NavLink to="/promotions" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Khuyến Mãi</NavLink>

              {/* === LIÊN KẾT ADMIN/PM (CHỈ HIỂN THỊ KHI ĐÚNG ROLE) === */}
              {isAuthenticated && userRole === 'admin' && (
                   <NavLink to="/admin" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                       <FiShield className={styles.roleIcon} /> Admin Panel
                   </NavLink>
              )}
               {isAuthenticated && userRole === 'product_manager' && ( // *** ĐẢM BẢO TÊN ROLE KHỚP ***
                   <NavLink to="/pm" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                       <FiPackage className={styles.roleIcon} /> Quản lý SP
                   </NavLink>
              )}
              {/* === KẾT THÚC LIÊN KẾT ADMIN/PM === */}
        </nav>

        {/* Khu vực Actions */}
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

             {/* Auth / User Menu (Desktop) */}
             <div className={styles.desktopAuth}>
                {isAuthenticated ? ( // Kiểm tra đã đăng nhập chưa
                  <div className={styles.dropdownContainer} ref={userDropdownRef}>
                    {/* Nút hiển thị tên và mở dropdown */}
                    <button onClick={toggleUserDropdown} className={`${styles.actionButton} ${styles.userButton}`} title={displayName} aria-haspopup="true" aria-expanded={isUserDropdownOpen}>
                      <FiUserCheck />
                      <span className={styles.userNameDesktop}>{displayName}</span>
                      <FiChevronDown className={`${styles.chevronIcon} ${styles.userChevron} ${isUserDropdownOpen ? styles.chevronOpen : ''}`} />
                    </button>
                    {/* Dropdown User */}
                    <div className={` ${styles.dropdownMenu} ${styles.userDropdown} ${isUserDropdownOpen ? styles.show : ''} `} role="menu">
                        <div className={styles.dropdownHeader}>Chào, {displayName}!</div>
                        <Link to="/profile" className={styles.dropdownItem} onClick={closeAllDropdowns} role="menuitem"><FiUser className={styles.dropdownIcon}/> Hồ sơ</Link>
                        <Link to="/orders" className={styles.dropdownItem} onClick={closeAllDropdowns} role="menuitem"><FiBox className={styles.dropdownIcon}/> Đơn hàng</Link>
                        {/* Thêm link Admin/PM vào dropdown user */}
                        {userRole === 'admin' && (
                           <Link to="/admin" className={styles.dropdownItem} onClick={closeAllDropdowns} role="menuitem">
                               <FiShield className={styles.dropdownIcon} /> Admin Panel
                           </Link>
                        )}
                         {userRole === 'product_manager' && (
                           <Link to="/pm" className={styles.dropdownItem} onClick={closeAllDropdowns} role="menuitem">
                               <FiPackage className={styles.dropdownIcon} /> Quản lý SP
                           </Link>
                        )}
                        <hr className={styles.dropdownDivider}/> {/* Phân cách trước khi logout */}
                        <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutButton}`} role="menuitem"><FiLogOut className={styles.dropdownIcon}/> Đăng xuất</button>
                    </div>
                  </div>
                ) : ( // Khi chưa đăng nhập
                  <>
                    <Button variant="secondary" size="small" onClick={handleLoginClick} className={styles.authButton}><FiLogIn /> Đăng nhập</Button>
                    <Button variant="primary" size="small" onClick={handleSignupClick} className={styles.authButton}>Đăng ký</Button>
                  </>
                )}
             </div>

             {/* Nút bật/tắt Menu Mobile */}
             <button className={styles.mobileMenuToggle} onClick={toggleMobileMenu} aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}>{isMobileMenuOpen ? <FiX /> : <FiMenu />}</button>
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
           {isAuthenticated ? (
             <>
                <div className={styles.mobileWelcome}><FiUserCheck className={styles.mobileUserIcon}/> Chào, {displayName}!</div>
                <Link to="/profile" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Hồ sơ</Link>
                <Link to="/orders" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Đơn hàng</Link>
                 {/* Thêm link Admin/PM vào mobile menu */}
                 {userRole === 'admin' && (
                     <Link to="/admin" className={styles.mobileNavLink} onClick={handleMobileLinkClick}><FiShield className={styles.mobileRoleIcon}/> Admin Panel</Link>
                 )}
                  {userRole === 'product_manager' && (
                     <Link to="/pm" className={styles.mobileNavLink} onClick={handleMobileLinkClick}><FiPackage className={styles.mobileRoleIcon}/> Quản lý SP</Link>
                 )}
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
          <Link to="/" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Trang Chủ</Link>
          {/* Danh mục trong Mobile Menu */}
          <div className={styles.mobileCategorySection}>
               <div className={styles.mobileNavGroupTitle}>Danh Mục</div>
               <Link to="/products" className={styles.mobileNavLink} onClick={handleMobileLinkClick}><FiGrid className={styles.mobileCategoryIcon}/> Tất cả sản phẩm</Link>
               {isCategoryLoading ? <div className={styles.mobileLoading}><Spinner size="small"/> Đang tải...</div>
                : categories.length > 0 ? (
                    categories.map((category) => (<Link to={`/products?category=${encodeURIComponent(category.categoryName)}`} key={category.categoryId} className={styles.mobileNavLink} onClick={handleMobileLinkClick}><span className={styles.mobileCategoryIcon}></span> {category.categoryName}</Link>))
               ) : (<p className={styles.mobileError}>Không tải được danh mục.</p>)}
          </div>
          <hr className={styles.mobileMenuDivider} />
          <Link to="/promotions" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Khuyến Mãi</Link>
      </nav>
       {/* Overlay */}
       {isMobileMenuOpen && <div className={styles.overlay} onClick={toggleMobileMenu}></div>}
    </header>
  );
};

export default Header;