import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchDropdownVisible, setIsSearchDropdownVisible] = useState(false);


  const [categories, setCategories] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);

  const categoryDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null); 
  const searchContainerRef = useRef(null);


  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const closeCategoryDropdown = useCallback(() => setIsCategoryDropdownOpen(false), []);
  const closeUserDropdown = useCallback(() => setIsUserDropdownOpen(false), []);
  const closeSearchDropdown = useCallback(() => {
       setIsSearchDropdownVisible(false);
  }, []);

  const closeAllDropdowns = useCallback(() => {
    closeMobileMenu();
    closeCategoryDropdown();
    closeUserDropdown();
    closeSearchDropdown();
  }, [closeMobileMenu, closeCategoryDropdown, closeUserDropdown, closeSearchDropdown]);


  useClickOutside(categoryDropdownRef, closeCategoryDropdown);
  useClickOutside(userDropdownRef, closeUserDropdown);
  useClickOutside(searchContainerRef, () => {
       const trimmedSearchTerm = searchTerm.trim();
        if (!isSearching && (trimmedSearchTerm.length < 2 || (searchResults.length === 0 && trimmedSearchTerm.length >= 2))) {
           setIsSearchDropdownVisible(false);
       }
  });


  useEffect(() => {
    closeAllDropdowns();
  }, [location.pathname, closeAllDropdowns]);

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

  const searchTimeoutRef = useRef(null);
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const minLength = 2;
    const trimmedSearchTerm = searchTerm.trim();

    if (trimmedSearchTerm.length >= minLength) {
      setIsSearching(true);
      setIsSearchDropdownVisible(true); 
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          console.log(`[Header] Searching for: ${trimmedSearchTerm}`);
          const response = await apiService.searchProducts(trimmedSearchTerm);

          if (response && Array.isArray(response.data)) {
            setSearchResults(response.data.slice(0, 5)); 
             setIsSearchDropdownVisible(true);
          } else {
             console.warn("[Header] Invalid search results data:", response?.data);
             setSearchResults([]);
             if (trimmedSearchTerm.length >= minLength) {
                 setIsSearchDropdownVisible(true);
             } else {
                closeSearchDropdown();
             }
          }
        } catch (error) {
          console.error("[Header] Error fetching search results:", error);
          setSearchResults([]);
            if (trimmedSearchTerm.length >= minLength) {
                 setIsSearchDropdownVisible(true);
           } else {
               closeSearchDropdown();
           }
        } finally {
          setIsSearching(false);
        }
      }, 300); 

    } else { 
      setSearchResults([]);
      setIsSearching(false);

       if (trimmedSearchTerm.length === 0) {
           setIsSearchDropdownVisible(false);
       }
       else if (trimmedSearchTerm.length > 0 && trimmedSearchTerm.length < minLength) {
           setIsSearchDropdownVisible(true);
       }
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]); 


  const handleDropdownLinkClick = useCallback(() => {
    closeAllDropdowns();
  }, [closeAllDropdowns]);


  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSearchInputFocus = () => {
     closeMobileMenu();
     closeCategoryDropdown();
     closeUserDropdown();
     setIsSearchDropdownVisible(true);
  };

    const clickedResultRef = useRef(false);

  const handleSearchInputBlur = () => {
      setTimeout(() => {
          if (!clickedResultRef.current) {
              setIsSearchDropdownVisible(false);
          }
          clickedResultRef.current = false;
      }, 100);
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
      clickedResultRef.current = true;
     
  }, []); 


  const toggleMobileMenu = useCallback(() => {
      const newState = !isMobileMenuOpen;
      if (newState) { 
          closeAllDropdowns(); 
      }
      setIsMobileMenuOpen(newState);
  }, [isMobileMenuOpen, closeAllDropdowns]);

  const toggleCategoryDropdown = useCallback(() => {
      if (isCategoryLoading) return; 
      const newState = !isCategoryDropdownOpen;
      if (newState) {
          closeAllDropdowns(); 
      }
      setIsCategoryDropdownOpen(newState); 
  }, [isCategoryDropdownOpen, closeAllDropdowns, isCategoryLoading]);

  const toggleUserDropdown = useCallback(() => {
      const newState = !isUserDropdownOpen;
      if (newState) {
           closeAllDropdowns(); 
      }
      setIsUserDropdownOpen(newState); 
  }, [isUserDropdownOpen, closeAllDropdowns]);


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


  const renderSearchResultsContent = useCallback(() => {
     const trimmedSearchTerm = searchTerm.trim();
     const minLength = 2;

     if (isSearching) {
         return (
             <div className={styles.searchLoading}>
                 <Spinner size="small" color="currentColor" /> Đang tìm...
             </div>
         );
     }

     if (searchResults.length > 0) {
        return (
           <>
             <div className={styles.searchResultsList}>
               {searchResults.map(product => (
                   <Link to={`/products/${product.productId || product.id}`} key={product.productId || product.id} className={styles.searchResultItem} onClick={handleSearchResultItemClick} role="option" aria-selected="false">
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
                          <div className={styles.searchResultName}>{product.productName}</div>
                           {product.price != null && <div className={styles.searchResultPrice}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</div>}
                       </div>
                   </Link>
               ))}
             </div>
             {searchResults.length > 0 && trimmedSearchTerm.length > 0 && (
                <>
                 <hr className={styles.dropdownDivider}/>
                 <Link to={`/search?q=${encodeURIComponent(trimmedSearchTerm)}`} className={styles.searchViewAllLink} onClick={handleDropdownLinkClick}>
                   Xem tất cả kết quả cho "{trimmedSearchTerm}"
                 </Link>
                </>
              )}
           </>
        );
     }

     if (trimmedSearchTerm.length >= minLength && !isSearching) {
          return <div className={styles.searchEmpty}>Không tìm thấy sản phẩm nào cho "{trimmedSearchTerm}".</div>;
     }

      if (trimmedSearchTerm.length > 0 && trimmedSearchTerm.length < minLength && !isSearching) {
         return <div className={styles.searchEmpty}>Tiếp tục gõ ({minLength - trimmedSearchTerm.length} ký tự nữa) để tìm kiếm...</div>;
      }

     return <div className={styles.searchEmpty}>Nhập từ khóa để tìm kiếm sản phẩm...</div>;
  }, [searchTerm, isSearching, searchResults, handleSearchResultItemClick, handleDropdownLinkClick]); // Add dependencies


  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={handleDropdownLinkClick}>
          <img src="/logo.png" alt="HustShop Logo" />
        </Link>

        <button className={styles.mobileMenuToggle} onClick={toggleMobileMenu} aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}>
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={styles.searchContainer} ref={searchContainerRef}>
           <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
             <input
                 type="text"
                 placeholder="Tìm kiếm..."
                 className={styles.searchInput}
                 value={searchTerm}
                 onChange={handleSearchChange}
                 aria-label="Tìm kiếm sản phẩm"
                 onFocus={handleSearchInputFocus} 
                 onBlur={handleSearchInputBlur}
             />
             <button type="submit" className={styles.searchButton} aria-label="Tìm kiếm"><FiSearch /></button>
           </form>

           { isSearchDropdownVisible && (
               <div className={`${styles.dropdownMenu} ${styles.searchResultsDropdown} ${styles.show}`} role="listbox">
                   {renderSearchResultsContent()}
               </div>
            )}
        </div>
        <nav className={styles.desktopNav}>
             <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} end onClick={handleDropdownLinkClick}>Trang Chủ</NavLink>
              <div className={styles.dropdownContainer} ref={categoryDropdownRef}>
                <button onClick={toggleCategoryDropdown} className={`${styles.navLink} ${styles.dropdownToggle}`} disabled={isCategoryLoading} aria-haspopup="true" aria-expanded={isCategoryDropdownOpen}>
                  Danh Mục {<FiChevronDown className={`${styles.chevronIcon} ${isCategoryDropdownOpen ? styles.chevronOpen : ''}`} />}
                </button>
                <div className={` ${styles.dropdownMenu} ${styles.categoryDropdown} ${isCategoryDropdownOpen ? styles.show : ''} `} role="menu">
                    {isCategoryLoading ? (
                        <div className={styles.dropdownLoading} role="menuitem" aria-disabled="true"><Spinner size="small" color="currentColor"/> Đang tải...</div>
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
        <div className={styles.actions}>
             {/* Cart Icon */}
             {isAuthenticated && (
                <Link to="/cart" className={`${styles.actionButton} ${styles.cartButton}`} title="Giỏ hàng" onClick={handleDropdownLinkClick}>
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
        </div>
      </div> 
      <nav ref={mobileMenuRef} className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <div className={styles.mobileMenuHeader}>
              <span className={styles.mobileMenuTitle}>Menu</span>
              <button onClick={closeMobileMenu} className={styles.closeButton} aria-label="Đóng menu"><FiX /></button>
          </div>
          <div className={styles.mobileUserInfo}>
           {isAuthenticated ? (
             <>
                <div className={styles.mobileWelcome}><FiUserCheck className={styles.mobileUserIcon}/> Chào, {displayName}!</div>
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
          <Link to="/" className={styles.mobileNavLink} onClick={handleDropdownLinkClick}>Trang Chủ</Link>
          <div className={styles.mobileCategorySection}>
               <div className={styles.mobileNavGroupTitle}>Danh Mục</div>
               <Link to="/products" className={styles.mobileNavLink} onClick={handleDropdownLinkClick}><FiGrid className={styles.mobileCategoryIcon}/> Tất cả sản phẩm</Link>
               {
                isCategoryLoading ? (
                     <div className={styles.mobileLoading}><Spinner size="small" color="currentColor"/> Đang tải...</div>
                ) : categories.length > 0 ? (
                    categories.map((category) => (
                        <Link to={`/products?category=${encodeURIComponent(category.categoryName)}`} key={category.categoryId} className={styles.mobileNavLink} onClick={handleDropdownLinkClick}>
                            {category.categoryName}
                        </Link>
                    ))
               ) : (<p className={styles.mobileError}>Không tải được danh mục.</p>)}
          </div>
      </nav>
       {isMobileMenuOpen && <div className={styles.overlay} onClick={closeMobileMenu}></div>}
    </header>
  );
};

export default Header;