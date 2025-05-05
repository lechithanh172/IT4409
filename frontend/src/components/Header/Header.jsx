import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import Button from "../Button/Button";
import Search from "../Search";
import styles from "./Header.module.css";
import logo from "../../../src/assets/logosenashop.png";
import useClickOutside from "../../hooks/useClickOutside";
import apiService from "../../services/api";

import {
  FiShoppingCart,
  FiSearch,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiLogOut,
  FiBox,
  FiUserCheck,
} from "react-icons/fi";

const Header = () => {
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User Name");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const categoryDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const overlayRef = useRef(null); 

  useClickOutside(categoryDropdownRef, () => setIsCategoryDropdownOpen(false));
  useClickOutside(userDropdownRef, () => setIsUserDropdownOpen(false));
  // Hook để đóng overlay khi click ngoài - Cần đảm bảo nó gọi closeOverlay đúng cách
  useClickOutside(overlayRef, () => {
      // Chỉ đóng nếu overlay đang thực sự hiển thị VÀ không phải do mobile menu gây ra
      // (vì mobile menu có thể có logic đóng riêng khi click vào link bên trong)
      // Hoặc đơn giản là gọi closeOverlay luôn
      if (isSearch) { // Chỉ đóng overlay nếu do search gây ra
        closeOverlay();
      }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setErrorCategories(null);
      try {
        const response = await apiService.getAllCategories();
        const fetchedCategories = response?.data || [];
        if (Array.isArray(fetchedCategories)) {
          setCategories(fetchedCategories);
        } else {
          setCategories([]);
          setErrorCategories("Không thể tải danh mục.");
        }
      } catch (error) {
        setErrorCategories("Lỗi tải danh mục. Vui lòng thử lại.");
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // **** useEffect để quản lý class noScroll ****
  useEffect(() => {
    // Nếu search overlay hoặc mobile menu đang mở -> thêm class noScroll
    if (isSearch || isMobileMenuOpen) {
      document.body.classList.add("noScroll");
    } else {
      // Nếu cả hai đều đóng -> xóa class noScroll
      document.body.classList.remove("noScroll");
    }

    // Cleanup function: Xóa class khi component unmount (quan trọng)
    return () => {
      document.body.classList.remove("noScroll");
    };
  }, [isSearch, isMobileMenuOpen]); // Theo dõi sự thay đổi của isSearch và isMobileMenuOpen

  const handleSearchChange = (e) => { setSearchTerm(e.target.value); };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      closeAllDropdowns();
      closeOverlay(); // Đóng overlay sau khi submit
    }
   };
  const toggleMobileMenu = () => {
      const opening = !isMobileMenuOpen;
      setIsMobileMenuOpen(opening);
      // Logic quản lý noScroll đã chuyển vào useEffect riêng
      setIsCategoryDropdownOpen(false);
      setIsUserDropdownOpen(false);
   };
  const toggleCategoryDropdown = () => { setIsCategoryDropdownOpen(!isCategoryDropdownOpen); setIsUserDropdownOpen(false); };
  const toggleUserDropdown = () => { setIsUserDropdownOpen(!isUserDropdownOpen); setIsCategoryDropdownOpen(false); };
  const handleLogout = () => { setIsLoggedIn(false); setIsUserDropdownOpen(false); navigate("/"); };
  const closeAllDropdowns = () => { setIsMobileMenuOpen(false); setIsCategoryDropdownOpen(false); setIsUserDropdownOpen(false); };

  // Hàm đóng overlay (chỉ tắt isSearch)
  const closeOverlay = () => {
    setIsSearch(false);
    // setIsMenu(false); // Không cần nếu dùng isMobileMenuOpen
    // Logic xóa noScroll đã chuyển vào useEffect
  };

  // Hàm xử lý khi nhấn nút Search icon/container -> mở overlay search
  const handleSearchContainerClick = () => {
    setIsSearch(true); // Chỉ cần set isSearch, useEffect sẽ xử lý noScroll
    closeAllDropdowns(); // Đóng các dropdown khác
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={closeAllDropdowns}>
          <img src={logo} alt="SENA Shop Logo" className={styles.logoShop} />
          <p>SENA Shop</p>
        </Link>

        <nav className={styles.desktopNav}>
          <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} end> Trang Chủ </NavLink>

          <div className={styles.dropdownContainer} ref={categoryDropdownRef}>
            <button onClick={toggleCategoryDropdown} className={`${styles.navLink} ${styles.dropdownToggle}`} disabled={loadingCategories}>
              Danh Mục{" "}
              <FiChevronDown className={`${styles.chevronIcon} ${isCategoryDropdownOpen ? styles.chevronOpen : ""}`} />
            </button>
            {isCategoryDropdownOpen && (
              <div className={`${styles.dropdownMenu} ${styles.categoryDropdown}`}>
                {loadingCategories && <div className={styles.dropdownItem}>Đang tải...</div>}
                {errorCategories && !loadingCategories && <div className={`${styles.dropdownItem} ${styles.errorItem}`}>{errorCategories}</div>}
                {!loadingCategories && !errorCategories && categories.length > 0 && categories.map((category) => (
                  <Link to={`/products?category=${encodeURIComponent(category.categoryName)}`} className={styles.dropdownItem} key={category.categoryId} onClick={toggleCategoryDropdown} >
                    {category.categoryName}
                  </Link>
                ))}
                 {!loadingCategories && !errorCategories && categories.length === 0 && <div className={styles.dropdownItem}>Không có danh mục nào.</div>}
                <Link to="/products" className={styles.dropdownItem} onClick={toggleCategoryDropdown} >
                  Tất cả sản phẩm
                </Link>
              </div>
            )}
          </div>

          <NavLink to="/promotions" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}> Khuyến Mãi </NavLink>
        </nav>

        <div className={styles.actions}>
           {/* **** Gắn onClick vào div bao ngoài Search để trigger overlay **** */}
           <div className={styles.menuList} onClick={handleSearchContainerClick}>
             <Search />
           </div>

          {/* **** Overlay hiển thị khi isSearch HOẶC isMobileMenuOpen là true **** */}
          {(isSearch || isMobileMenuOpen) && (
            <div ref={overlayRef} className={styles.overlay} onClick={closeOverlay}></div>
          )}

          {/* Component Search không cần hiển thị có điều kiện ở đây nữa nếu nó dùng Tippy */}
          <Link to="/cart" className={styles.actionButton} title="Giỏ hàng" onClick={closeAllDropdowns} >
            <FiShoppingCart />
            {cartItemCount > 0 && ( <span className={styles.cartCount}>{cartItemCount}</span> )}
          </Link>

          <div className={styles.desktopAuth}>
             {isLoggedIn ? (
              <div className={styles.dropdownContainer} ref={userDropdownRef}>
                <button onClick={toggleUserDropdown} className={`${styles.actionButton} ${styles.userButton}`} title="Tài khoản" >
                  <FiUserCheck />
                  <FiChevronDown className={`${styles.chevronIcon} ${styles.userChevron} ${ isUserDropdownOpen ? styles.chevronOpen : "" }`} />
                </button>
                {isUserDropdownOpen && (
                  <div className={`${styles.dropdownMenu} ${styles.userDropdown}`} >
                    <div className={styles.dropdownHeader}> Chào, {userName}! </div>
                    <Link to="/profile" className={styles.dropdownItem} onClick={toggleUserDropdown} > <FiUser className={styles.dropdownIcon} /> Hồ sơ </Link>
                    <Link to="/orders" className={styles.dropdownItem} onClick={toggleUserDropdown} > <FiBox className={styles.dropdownIcon} /> Đơn hàng </Link>
                    <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutButton}`} > <FiLogOut className={styles.dropdownIcon} /> Đăng xuất </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="secondary" size="small" onClick={() => navigate('/login')} className={styles.authButton}> Đăng nhập </Button>
                <Button variant="primary" size="small" onClick={() => navigate('/register')} className={styles.authButton}> Đăng ký </Button>
              </>
            )}
          </div>

          {/* Nút này vẫn toggle isMobileMenuOpen */}
          <button className={styles.mobileMenuToggle} onClick={toggleMobileMenu} aria-label="Mở menu" >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer (logic isMobileMenuOpen vẫn giữ nguyên) */}
      <nav ref={mobileMenuRef} className={`${styles.mobileMenu} ${ isMobileMenuOpen ? styles.mobileMenuOpen : "" }`} >
         {/* ... Nội dung mobile menu giữ nguyên ... */}
         <div className={styles.mobileMenuHeader}> <span className={styles.mobileMenuTitle}>Menu</span> <button onClick={toggleMobileMenu} className={styles.closeButton} aria-label="Đóng menu" > <FiX /> </button> </div>
         <div className={styles.mobileUserInfo}> {/* ... */} </div>
         <hr className={styles.mobileMenuDivider} />
         <div className={styles.mobileCategorySection}> <div className={styles.mobileNavGroupTitle}>Danh Mục</div> {/* ... */} </div>
         <hr className={styles.mobileMenuDivider} />
         <Link to="/promotions" className={styles.mobileNavLink} onClick={toggleMobileMenu} > Khuyến Mãi </Link>
      </nav>
    </header>
  );
};

export default Header;