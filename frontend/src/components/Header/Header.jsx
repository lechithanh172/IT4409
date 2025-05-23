import React, { useState, useRef, useEffect, useCallback } from 'react'; // Added useCallback
import { Link, NavLink, useNavigate } from 'react-router-dom';
// Removed useCart import
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api'; // Đảm bảo đường dẫn đúng
import Button from '../Button/Button';
import styles from './Header.module.css';
import useClickOutside from '../../hooks/useClickOutside';
import Spinner from '../Spinner/Spinner';
import {
  FiShoppingCart, FiSearch, FiUser, FiMenu, FiX, FiChevronDown,
  FiLogOut, FiBox, FiUserCheck, FiLogIn, FiGrid, FiPackage, FiShield // Removed unused FiSettings
} from 'react-icons/fi';

const Header = () => {
  // Removed: const { cartItemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);

  const categoryDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useClickOutside(categoryDropdownRef, () => setIsCategoryDropdownOpen(false));
  useClickOutside(userDropdownRef, () => setIsUserDropdownOpen(false));

  // --- Fetch Categories ---
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoryLoading(true);
      try {
        const response = await apiService.getAllCategories();
        if (response && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.warn("Invalid category data received:", response?.data);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setIsCategoryLoading(false);
      }
    };
    fetchCategories();
  }, []); // Fetch categories only once on mount

  
  // --- Event Handlers ---
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
  const toggleMobileMenu = () => { setIsMobileMenuOpen(prev => !prev); setIsCategoryDropdownOpen(false); setIsUserDropdownOpen(false); };
  const toggleCategoryDropdown = () => { if (!isCategoryLoading) { setIsCategoryDropdownOpen(prev => !prev); setIsUserDropdownOpen(false); } };
  const toggleUserDropdown = () => { setIsUserDropdownOpen(prev => !prev); setIsCategoryDropdownOpen(false); };
  const closeAllDropdowns = () => { setIsMobileMenuOpen(false); setIsCategoryDropdownOpen(false); setIsUserDropdownOpen(false); };
  const handleMobileLinkClick = () => setIsMobileMenuOpen(false);
  const handleLoginClick = () => { closeAllDropdowns(); navigate('/login'); };
  const handleSignupClick = () => { closeAllDropdowns(); navigate('/pre-signup'); };
  const handleLogout = () => {
      logout(); // Call the logout function from AuthContext
      closeAllDropdowns(); // Close menus after logout
      // fetchCartCount() will be called automatically by useEffect due to isAuthenticated changing
  };

  // --- Derived Data ---
  const displayName = user?.firstName || user?.username || 'Tài khoản';
  // Ensure role is checked safely and converted to lowercase
  const userRole = user?.role?.toLowerCase() || null;

  // --- RENDER ---
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={closeAllDropdowns}>HustShop</Link>
        <nav className={styles.desktopNav}>
             <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} end>Trang Chủ</NavLink>
              <div className={styles.dropdownContainer} ref={categoryDropdownRef}>
                <button onClick={toggleCategoryDropdown} className={`${styles.navLink} ${styles.dropdownToggle}`} disabled={isCategoryLoading} aria-haspopup="true" aria-expanded={isCategoryDropdownOpen}>
                  Danh Mục {isCategoryLoading ? <Spinner size="tinyInline"/> : <FiChevronDown className={`${styles.chevronIcon} ${isCategoryDropdownOpen ? styles.chevronOpen : ''}`} />}
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
              {isAuthenticated && userRole === 'admin' && (
                   <NavLink to="/admin" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} onClick={closeAllDropdowns}>
                       <FiShield className={styles.roleIcon} /> Admin Panel
                   </NavLink>
              )}
               {isAuthenticated && userRole === 'product_manager' && ( 
                   <NavLink to="/pm" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} onClick={closeAllDropdowns}>
                       <FiPackage className={styles.roleIcon} /> Quản lý SP
                   </NavLink>
              )}
        </nav>
        <div className={styles.actions}>
             <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
                <input type="text" placeholder="Tìm kiếm..." className={styles.searchInput} value={searchTerm} onChange={handleSearchChange} aria-label="Tìm kiếm sản phẩm"/>
                <button type="submit" className={styles.searchButton} aria-label="Tìm kiếm"><FiSearch /></button>
             </form>
             {isAuthenticated && (
                <Link to="/cart" className={styles.actionButton} title="Giỏ hàng" onClick={closeAllDropdowns}>
                    <FiShoppingCart />
                </Link>
             )}
             <div className={styles.desktopAuth}>
                {isAuthenticated ? (
                  <div className={styles.dropdownContainer} ref={userDropdownRef}>
                    <button onClick={toggleUserDropdown} className={`${styles.actionButton} ${styles.userButton}`} title={displayName} aria-haspopup="true" aria-expanded={isUserDropdownOpen}>
                      <FiUserCheck />
                      <span className={styles.userNameDesktop}>{displayName}</span>
                      <FiChevronDown className={`${styles.chevronIcon} ${styles.userChevron} ${isUserDropdownOpen ? styles.chevronOpen : ''}`} />
                    </button>
                    <div className={` ${styles.dropdownMenu} ${styles.userDropdown} ${isUserDropdownOpen ? styles.show : ''} `} role="menu">
                        <div className={styles.dropdownHeader}>Chào, {displayName}!</div>
                        <Link to="/profile" className={styles.dropdownItem} onClick={closeAllDropdowns} role="menuitem"><FiUser className={styles.dropdownIcon}/> Hồ sơ</Link>
                        <Link to="/profile/orders" className={styles.dropdownItem} onClick={closeAllDropdowns} role="menuitem"><FiBox className={styles.dropdownIcon}/> Đơn hàng</Link>
                        {userRole === 'admin' && ( <Link to="/admin" className={styles.dropdownItem} onClick={closeAllDropdowns} role="menuitem"><FiShield className={styles.dropdownIcon} /> Admin Panel</Link> )}
                        {userRole === 'product_manager' && ( <Link to="/pm" className={styles.dropdownItem} onClick={closeAllDropdowns} role="menuitem"><FiPackage className={styles.dropdownIcon} /> Quản lý SP</Link> )}
                        <hr className={styles.dropdownDivider}/>
                        <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutButton}`} role="menuitem"><FiLogOut className={styles.dropdownIcon}/> Đăng xuất</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button variant="secondary" size="small" onClick={handleLoginClick} className={styles.authButton}><FiLogIn /> Đăng nhập</Button>
                    <Button variant="primary" size="small" onClick={handleSignupClick} className={styles.authButton}>Đăng ký</Button>
                  </>
                )}
             </div>
             <button className={styles.mobileMenuToggle} onClick={toggleMobileMenu} aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}>{isMobileMenuOpen ? <FiX /> : <FiMenu />}</button>
        </div>
      </div>
      <nav ref={mobileMenuRef} className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <div className={styles.mobileMenuHeader}>
              <span className={styles.mobileMenuTitle}>Menu</span>
              <button onClick={toggleMobileMenu} className={styles.closeButton} aria-label="Đóng menu"><FiX /></button>
          </div>
          <div className={styles.mobileUserInfo}>
           {isAuthenticated ? (
             <>
                <div className={styles.mobileWelcome}><FiUserCheck className={styles.mobileUserIcon}/> Chào, {displayName}!</div>
                <Link to="/profile" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Hồ sơ</Link>
                <Link to="/profile/orders" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>Đơn hàng</Link>
                 {userRole === 'admin' && ( <Link to="/admin" className={styles.mobileNavLink} onClick={handleMobileLinkClick}><FiShield className={styles.mobileRoleIcon}/> Admin Panel</Link> )}
                 {userRole === 'product_manager' && ( <Link to="/pm" className={styles.mobileNavLink} onClick={handleMobileLinkClick}><FiPackage className={styles.mobileRoleIcon}/> Quản lý SP</Link> )}
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
          <div className={styles.mobileCategorySection}>
               <div className={styles.mobileNavGroupTitle}>Danh Mục</div>
               <Link to="/products" className={styles.mobileNavLink} onClick={handleMobileLinkClick}><FiGrid className={styles.mobileCategoryIcon}/> Tất cả sản phẩm</Link>
               {isCategoryLoading ? <div className={styles.mobileLoading}><Spinner size="small"/> Đang tải...</div>
                : categories.length > 0 ? (
                    categories.map((category) => (<Link to={`/products?category=${encodeURIComponent(category.categoryName)}`} key={category.categoryId} className={styles.mobileNavLink} onClick={handleMobileLinkClick}><span className={styles.mobileCategoryIcon}></span> {category.categoryName}</Link>))
               ) : (<p className={styles.mobileError}>Không tải được.</p>)}
          </div>
      </nav>
       {isMobileMenuOpen && <div className={styles.overlay} onClick={toggleMobileMenu}></div>}
    </header>
  );
};

export default Header;