import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { TbTruckDelivery } from "react-icons/tb";
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import Button from '../Button/Button';
import styles from './Header.module.css';
import useClickOutside from '../../hooks/useClickOutside';
import Spinner from '../Spinner/Spinner';

import {
  FiShoppingCart, FiSearch, FiUser, FiMenu, FiX, FiChevronDown,
  FiLogOut, FiBox, FiUserCheck, FiLogIn, FiGrid, FiPackage, FiShield
} from 'react-icons/fi';

const Header = () => {

  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);


  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);


  const [categories, setCategories] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);

  const categoryDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const searchDropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);


  useClickOutside(categoryDropdownRef, () => setIsCategoryDropdownOpen(false));
  useClickOutside(userDropdownRef, () => setIsUserDropdownOpen(false));
  useClickOutside(searchDropdownRef, () => {
     setIsSearchDropdownOpen(false);
   });



  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoryLoading(true);
      try {
        const response = await apiService.getAllCategories();
        if (response && Array.isArray(response.data)) {
           const formattedCategories = response.data.map(cat => ({
              categoryId: cat.categoryId || cat.id,
              categoryName: cat.name || cat.categoryName
           }));
          setCategories(formattedCategories);
        } else {
          console.warn("Invalid category data received for categories:", response?.data);
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
  }, []);



  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const minLength = 2;
    const trimmedSearchTerm = searchTerm.trim();

    if (trimmedSearchTerm.length >= minLength) {
      setIsSearching(true);
      setIsSearchDropdownOpen(true);

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          console.log(`[Header] Searching for: ${trimmedSearchTerm}`);
          const response = await apiService.searchProducts(trimmedSearchTerm);

          if (response && Array.isArray(response.data)) {
            setSearchResults(response.data.slice(0, 5));
          } else {
             console.warn("[Header] Invalid search results data:", response?.data);
             setSearchResults([]);
          }
        } catch (error) {
          console.error("[Header] Error fetching search results:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);

    } else {

      setSearchResults([]);
      setIsSearching(false);
      if (trimmedSearchTerm.length === 0) {
         setIsSearchDropdownOpen(false);
      }
       console.log("[Header] Search term too short or empty, clearing results.");
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);




  const closeAllDropdowns = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsUserDropdownOpen(false);
    setIsSearchDropdownOpen(false);
  }, []);

  const handleDropdownLinkClick = useCallback(() => {
    closeAllDropdowns();
  }, [closeAllDropdowns]);


  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSearchInputFocus = () => {
     if (searchTerm.trim().length > 0 || isSearching) {
         setIsSearchDropdownOpen(true);
     }
     setIsCategoryDropdownOpen(false);
     setIsUserDropdownOpen(false);
     setIsMobileMenuOpen(false);
  };


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      navigate(`/search?q=${encodeURIComponent(trimmedSearchTerm)}`);
      setSearchTerm('');
      setSearchResults([]);
      closeAllDropdowns();
    }
  };

  const handleSearchResultItemClick = useCallback(() => {
      setSearchTerm('');
      setSearchResults([]);
      closeAllDropdowns();
  }, [closeAllDropdowns]);


  const toggleMobileMenu = useCallback(() => { setIsMobileMenuOpen(prev => !prev); setIsCategoryDropdownOpen(false); setIsUserDropdownOpen(false); setIsSearchDropdownOpen(false); }, []);
  const toggleCategoryDropdown = useCallback(() => { if (!isCategoryLoading) { setIsCategoryDropdownOpen(prev => !prev); setIsUserDropdownOpen(false); setIsMobileMenuOpen(false); setIsSearchDropdownOpen(false); } }, [isCategoryLoading]);
  const toggleUserDropdown = useCallback(() => { setIsUserDropdownOpen(prev => !prev); setIsCategoryDropdownOpen(false); setIsMobileMenuOpen(false); setIsSearchDropdownOpen(false); }, []);

  const handleLoginClick = useCallback(() => {
    closeAllDropdowns();
    navigate('/login');
  }, [closeAllDropdowns, navigate]);

  const handleSignupClick = useCallback(() => {
    closeAllDropdowns();
    navigate('/pre-signup');
  }, [closeAllDropdowns, navigate]);

  const handleLogout = useCallback(() => {
      logout();
      closeAllDropdowns();
  }, [logout, closeAllDropdowns]);



  const displayName = user?.firstName || user?.username || 'Tài khoản';
  const userRole = user?.role?.toLowerCase() || null;


  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* LOGO */}
        <Link to="/" className={styles.logo} onClick={closeAllDropdowns}>
          <img src="/logo.png" alt="HustShop Logo" />
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
             <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} end onClick={handleDropdownLinkClick}>Trang Chủ</NavLink>
              <div className={styles.dropdownContainer} ref={categoryDropdownRef}>
                <button onClick={toggleCategoryDropdown} className={`${styles.navLink} ${styles.dropdownToggle}`} disabled={isCategoryLoading} aria-haspopup="true" aria-expanded={isCategoryDropdownOpen}>
                  Danh Mục {isCategoryLoading ? <Spinner size="small"/> : <FiChevronDown className={`${styles.chevronIcon} ${isCategoryDropdownOpen ? styles.chevronOpen : ''}`} />}
                </button>
                <div className={` ${styles.dropdownMenu} ${styles.categoryDropdown} ${isCategoryDropdownOpen ? styles.show : ''} `} role="menu">
                    {isCategoryLoading ? (
                        <div className={styles.dropdownLoading} role="menuitem" aria-disabled="true"><Spinner size="small"/> Đang tải...</div>
                    ) : categories.length > 0 ? (
                         <>
                           <Link to="/products" className={styles.dropdownItem} onClick={handleDropdownLinkClick} role="menuitem"><FiGrid className={styles.categoryIcon} /> Tất cả sản phẩm</Link>
                           <hr className={styles.dropdownDivider}/>
                           {categories.map((category) => (
                             <Link to={`/products?category=${encodeURIComponent(category.categoryName)}`} key={category.categoryId} className={styles.dropdownItem} onClick={handleDropdownLinkClick} role="menuitem">
                               {category.categoryName}
                              </Link>
                            ))}
                         </>
                    ) : ( <div className={styles.dropdownError} role="menuitem" aria-disabled="true"><p>Không tải được danh mục.</p></div> )}
                </div>
              </div>
              {isAuthenticated && userRole === 'admin' && (
                   <NavLink to="/admin" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} onClick={handleDropdownLinkClick}>
                       <FiShield className={styles.roleIcon} /> Admin Panel
                   </NavLink>
              )}
              {isAuthenticated && userRole === 'shipper' && (
                   <NavLink to="/shipper" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} onClick={handleDropdownLinkClick}>
                       <TbTruckDelivery className={styles.roleIcon} /> Đơn hàng Shipper
                   </NavLink>
              )}
               {isAuthenticated && userRole === 'product_manager' && (
                   <NavLink to="/pm" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} onClick={handleDropdownLinkClick}>
                       <FiPackage className={styles.roleIcon} /> Quản lý SP
                   </NavLink>
              )}
        </nav>
        {/* Actions and Search */}
        <div className={styles.actions}>
             {/* SEARCH BAR AND DROPDOWN */}
             <div className={styles.searchDropdownContainer} ref={searchDropdownRef}>
                <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
                  <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      className={styles.searchInput}
                      value={searchTerm}
                      onChange={handleSearchChange}
                      aria-label="Tìm kiếm sản phẩm"
                      onFocus={handleSearchInputFocus}

                  />
                  <button type="submit" className={styles.searchButton} aria-label="Tìm kiếm"><FiSearch /></button>
                </form>

                {/* Dropdown hiển thị kết quả tìm kiếm */}
                {/* Render container dropdown chỉ khi isSearchDropdownOpen là true */}
                {isSearchDropdownOpen && (
                    <div className={`${styles.dropdownMenu} ${styles.searchResultsDropdown} ${isSearchDropdownOpen ? styles.show : ''}`} role="listbox">
                        {/* Nội dung bên trong dropdown */}
                        {isSearching ? (
                            <div className={styles.searchLoading}>
                                <Spinner size="small" /> Đang tìm...
                            </div>
                        ) : searchResults.length > 0 ? (
                           <>
                             <div className={styles.searchResultsList}>
                                {searchResults.map(product => (

                                    <Link to={`/products/${product.productId || product.id}`} key={product.productId || product.id} className={styles.searchResultItem} onClick={handleSearchResultItemClick} role="option" aria-selected="false">
                                        {/* Lấy imageUrl từ variants[0].imageUrl nếu có, nếu không dùng placeholder */}
                                        <img
                                           src={
                                              (product.variants && product.variants.length > 0 && product.variants[0].imageUrl)
                                              ? product.variants[0].imageUrl
                                              : '/images/placeholder-product.png'
                                           }
                                           alt={product.productName}
                                           className={styles.searchResultImage}
                                           onError={(e)=>{e.target.src='/images/placeholder-product.png'}}
                                        />
                                        <div className={styles.searchResultInfo}>
                                           <div className={styles.searchResultName}>{product.productName}</div> {/* Sử dụng productName */}
                                            {product.price != null && <div className={styles.searchResultPrice}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</div>} {/* Sử dụng price */}
                                        </div>
                                    </Link>

                                ))}
                             </div>
                             <hr className={styles.dropdownDivider}/>
                              {searchTerm.trim().length > 0 && (
                                 <Link to={`/search?q=${encodeURIComponent(searchTerm.trim())}`} className={styles.searchViewAllLink} onClick={handleDropdownLinkClick}>
                                   Xem tất cả kết quả
                                 </Link>
                              )}
                           </>
                        ) : searchTerm.trim().length >= 2 && !isSearching ? (
                             <div className={styles.searchEmpty}>Không tìm thấy sản phẩm nào cho "{searchTerm}".</div>
                        ) : searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && !isSearching ? (
                            <div className={styles.searchEmpty}>Tiếp tục gõ ({2 - searchTerm.trim().length} ký tự nữa)...</div>
                        ) : (

                            <div className={styles.searchEmpty}>Nhập từ khóa để tìm kiếm...</div>
                        )}
                    </div>
                )}
             </div>
              {/* END SEARCH BAR AND DROPDOWN */}


             {isAuthenticated && (
                <Link to="/cart" className={styles.actionButton} title="Giỏ hàng" onClick={handleDropdownLinkClick}>
                    <FiShoppingCart />
                    {/* <span className={styles.cartCount}>3</span> */}
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
                        <Link to="/profile" className={styles.dropdownItem} onClick={handleDropdownLinkClick} role="menuitem"><FiUser className={styles.dropdownIcon}/> Hồ sơ</Link>
                        <Link to="/profile/orders" className={styles.dropdownItem} onClick={handleDropdownLinkClick} role="menuitem"><FiBox className={styles.dropdownIcon}/> Đơn hàng</Link>
                        {userRole === 'admin' && ( <Link to="/admin" className={styles.dropdownItem} onClick={handleDropdownLinkClick} role="menuitem"><FiShield className={styles.dropdownIcon} /> Admin Panel</Link> )}
                         {userRole === 'shipper' && ( <Link to="/shipper" className={styles.dropdownItem} onClick={handleDropdownLinkClick} role="menuitem"><TbTruckDelivery className={styles.dropdownIcon} /> Đơn hàng vận chuyển</Link> )}
                        {userRole === 'product_manager' && ( <Link to="/pm" className={styles.dropdownItem} onClick={handleDropdownLinkClick} role="menuitem"><FiPackage className={styles.dropdownIcon} /> Quản lý SP</Link> )}
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
      {/* Mobile Menu Drawer */}
      <nav ref={mobileMenuRef} className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <div className={styles.mobileMenuHeader}>
              <span className={styles.mobileMenuTitle}>Menu</span>
              <button onClick={toggleMobileMenu} className={styles.closeButton} aria-label="Đóng menu"><FiX /></button>
          </div>
          <div className={styles.mobileUserInfo}>
           {isAuthenticated ? (
             <>
                <div className={styles.mobileWelcome}><FiUserCheck className={styles.mobileUserIcon}/> Chào, {displayName}!</div>
                {/* Links cần đóng menu khi click */}
                <Link to="/profile" className={styles.mobileNavLink} onClick={handleDropdownLinkClick}>Hồ sơ</Link>
                <Link to="/profile/orders" className={styles.mobileNavLink} onClick={handleDropdownLinkClick}>Đơn hàng</Link>
                 {userRole === 'admin' && ( <Link to="/admin" className={styles.mobileNavLink} onClick={handleDropdownLinkClick}><FiShield className={styles.mobileRoleIcon}/> Admin Panel</Link> )}
                 {userRole === 'product_manager' && ( <Link to="/pm" className={styles.mobileNavLink} onClick={handleDropdownLinkClick}><FiPackage className={styles.mobileRoleIcon}/> Quản lý SP</Link> )}
                 {userRole === 'shipper' && ( <Link to="/shipper" className={styles.mobileNavLink} onClick={handleDropdownLinkClick}><TbTruckDelivery className={styles.mobileRoleIcon}/> Đơn hàng vận chuyển</Link> )}
                <button onClick={handleLogout} className={`${styles.mobileNavLink} ${styles.mobileLogoutButton}`}>Đăng xuất</button>
             </>
           ) : (
             <div className={styles.mobileAuthButtons}>
                 <Button variant="primary" onClick={handleLoginClick} className={styles.mobileAuthBtn}>Đăng nhập</Button>
                 <Button variant="secondary" onClick={handleSignupClick} className={styles.mobileAuthBtn}>Đăng ký</Button>
             </div>
           )}
        </div>
          <hr className={styles.mobileMenuDivider} />
          {/* Main Nav Links (Mobile) */}
          <Link to="/" className={styles.mobileNavLink} onClick={handleDropdownLinkClick}>Trang Chủ</Link>
          {/* Mobile Category Section */}
          <div className={styles.mobileCategorySection}>
               <div className={styles.mobileNavGroupTitle}>Danh Mục</div>
               <Link to="/products" className={styles.mobileNavLink} onClick={handleDropdownLinkClick}><FiGrid className={styles.mobileCategoryIcon}/> Tất cả sản phẩm</Link>
               {
                isCategoryLoading ? (
                     <div className={styles.mobileLoading}><Spinner size="small"/> Đang tải...</div>
                ) : categories.length > 0 ? (
                    categories.map((category) => (
                        <Link to={`/products?category=${encodeURIComponent(category.categoryName)}`} key={category.categoryId} className={styles.mobileNavLink} onClick={handleDropdownLinkClick}>
                            {category.categoryName}
                        </Link>
                    ))
               ) : (<p className={styles.mobileError}>Không tải được danh mục.</p>)}
          </div>
      </nav>
       {/* Overlay hiển thị khi mobile menu mở */}
       {isMobileMenuOpen && <div className={styles.overlay} onClick={toggleMobileMenu}></div>}
    </header>
  );
};

export default Header;