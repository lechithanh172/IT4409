import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import Button from "../Button/Button";
import Search from "../Search";
import styles from "./Header.module.css";
import logo from "../../../public/logosenashop.png";
import useClickOutside from "../../hooks/useClickOutside"; // Import hook

// Import icons
import {
  FiShoppingCart,
  FiSearch,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiLogOut,
  FiBox, // Ví dụ icon cho đơn hàng
  FiUserCheck, // Ví dụ icon cho profile khi đăng nhập
} from "react-icons/fi"; // Chọn bộ icon bạn thích (Feather icons)

const Category = [
  { categoryId: 1, name: "Laptop", description: "Portable personal computers" },
  { categoryId: 2, name: "Tablet", description: "Touchscreen mobile devices" },
  { categoryId: 3, name: "Smartphone", description: "Mobile phones" },
  { categoryId: 4, name: "Accessory", description: "Computer accessories" },
  { categoryId: 5, name: "Monitor", description: "Display devices" },
  { categoryId: 6, name: "Printer", description: "Printing machines" },
  { categoryId: 7, name: "Router", description: "Network routers" },
  { categoryId: 8, name: "Speaker", description: "Audio output devices" },
  { categoryId: 9, name: "Camera", description: "Photography and video" },
  { categoryId: 10, name: "Smartwatch", description: "Wearable smart devices" },
];

const Header = () => {
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  // --- STATE QUẢN LÝ ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User Name");
  const [categories, setCategories] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [isMenu, setIsMenu] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // --- REFS CHO DROPDOWN ---
  const categoryDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const overlayRef = useRef(null);

  // --- SỬ DỤNG HOOK useClickOutside ---
  useClickOutside(categoryDropdownRef, () => setIsCategoryDropdownOpen(false));
  useClickOutside(userDropdownRef, () => setIsUserDropdownOpen(false));
  useClickOutside(overlayRef, () => closeOverlay()); // Đóng overlay khi click ra ngoài

  // --- HANDLERS ---
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsUserDropdownOpen(false);
    navigate("/");
  };

  const closeAllDropdowns = () => {
    setIsMobileMenuOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsUserDropdownOpen(false);
  };

  const closeOverlay = () => {
    setIsMenu(false);
    setIsSearch(false);
    document.body.classList.remove("noScroll"); // Xóa class no-scroll khi đóng overlay
  };

  const handleSearch = () => {
    setIsSearch(true);
    document.body.classList.add("noScroll");
  };

  useEffect(() => {
    setCategories(Category);
  }, []);

  // --- RENDER ---
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={closeAllDropdowns}>
          <img src={logo} className={styles.logoShop} />
          <p>SENA Shop</p>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
            end
          >
            Trang Chủ
          </NavLink>

          {/* Category Dropdown */}
          <div className={styles.dropdownContainer} ref={categoryDropdownRef}>
            <button
              onClick={toggleCategoryDropdown}
              className={`${styles.navLink} ${styles.dropdownToggle}`}
            >
              Danh Mục{" "}
              <FiChevronDown
                className={`${styles.chevronIcon} ${
                  isCategoryDropdownOpen ? styles.chevronOpen : ""
                }`}
              />
            </button>
            {isCategoryDropdownOpen && (
              <div
                className={`${styles.dropdownMenu} ${styles.categoryDropdown}`}
              >
                {categories.map((category) => (
                  <Link
                    to={`/products?category=${category.name}`}
                    className={styles.dropdownItem}
                    key={category.categoryId}
                    onClick={toggleCategoryDropdown}
                  >
                    {category.name}
                  </Link>
                ))}
                <Link
                  to="/products"
                  className={styles.dropdownItem}
                  onClick={toggleCategoryDropdown}
                >
                  Tất cả sản phẩm
                </Link>
              </div>
            )}
          </div>

          <NavLink
            to="/promotions"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Khuyến Mãi
          </NavLink>
        </nav>

        {/* Actions Area */}
        <div className={styles.actions}>
          {/* Search Bar */}
          <div className={styles.menuList} onClick={handleSearch}>
            <Search overlay={isSearch} />
          </div>

          {isMenu || isSearch ? (
            <div
              ref={overlayRef}
              className={styles.overlay}
              onClick={closeOverlay}
            ></div>
          ) : null}

          {/* Cart */}
          <Link
            to="/cart"
            className={styles.actionButton}
            title="Giỏ hàng"
            onClick={closeAllDropdowns}
          >
            <FiShoppingCart />
            {cartItemCount > 0 && (
              <span className={styles.cartCount}>{cartItemCount}</span>
            )}
          </Link>

          {/* Auth / User Menu */}
          <div className={styles.desktopAuth}>
            {isLoggedIn ? (
              <div className={styles.dropdownContainer} ref={userDropdownRef}>
                <button
                  onClick={toggleUserDropdown}
                  className={`${styles.actionButton} ${styles.userButton}`}
                  title="Tài khoản"
                >
                  <FiUserCheck />
                  <FiChevronDown
                    className={`${styles.chevronIcon} ${styles.userChevron} ${
                      isUserDropdownOpen ? styles.chevronOpen : ""
                    }`}
                  />
                </button>
                {isUserDropdownOpen && (
                  <div
                    className={`${styles.dropdownMenu} ${styles.userDropdown}`}
                  >
                    <div className={styles.dropdownHeader}>
                      Chào, {userName}!
                    </div>
                    <Link
                      to="/profile"
                      className={styles.dropdownItem}
                      onClick={toggleUserDropdown}
                    >
                      <FiUser className={styles.dropdownIcon} /> Hồ sơ
                    </Link>
                    <Link
                      to="/orders"
                      className={styles.dropdownItem}
                      onClick={toggleUserDropdown}
                    >
                      <FiBox className={styles.dropdownIcon} /> Đơn hàng
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`${styles.dropdownItem} ${styles.logoutButton}`}
                    >
                      <FiLogOut className={styles.dropdownIcon} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setIsLoggedIn(true)}
                  className={styles.authButton}
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => {}}
                  className={styles.authButton}
                >
                  Đăng ký
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileMenuToggle}
            onClick={toggleMobileMenu}
            aria-label="Mở menu"
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <nav
        ref={mobileMenuRef}
        className={`${styles.mobileMenu} ${
          isMobileMenuOpen ? styles.mobileMenuOpen : ""
        }`}
      >
        <div className={styles.mobileMenuHeader}>
          <span className={styles.mobileMenuTitle}>Menu</span>
          <button
            onClick={toggleMobileMenu}
            className={styles.closeButton}
            aria-label="Đóng menu"
          >
            <FiX />
          </button>
        </div>

        {/* Auth/User Info in Mobile Menu */}
        <div className={styles.mobileUserInfo}>
          {isLoggedIn ? (
            <>
              <div className={styles.mobileWelcome}>
                <FiUserCheck className={styles.mobileUserIcon} /> Chào,{" "}
                {userName}!
              </div>
              <Link
                to="/profile"
                className={styles.mobileNavLink}
                onClick={toggleMobileMenu}
              >
                Hồ sơ
              </Link>
              <Link
                to="/orders"
                className={styles.mobileNavLink}
                onClick={toggleMobileMenu}
              >
                Đơn hàng
              </Link>
              <button
                onClick={handleLogout}
                className={`${styles.mobileNavLink} ${styles.mobileLogoutButton}`}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <div className={styles.mobileAuthButtons}>
              <Button
                variant="primary"
                onClick={() => {
                  setIsLoggedIn(true);
                  toggleMobileMenu();
                }}
                className={styles.mobileAuthBtn}
              >
                Đăng nhập
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  toggleMobileMenu();
                }}
                className={styles.mobileAuthBtn}
              >
                Đăng ký
              </Button>
            </div>
          )}
        </div>

        <hr className={styles.mobileMenuDivider} />

        {/* Categories in Mobile Menu */}
        <div className={styles.mobileCategorySection}>
          <div className={styles.mobileNavGroupTitle}>Danh Mục</div>
          {categories.map((category) => (
            <Link
              to={`/products?category=${category.name}`}
              className={styles.mobileNavLink}
              key={category.categoryId}
              onClick={toggleMobileMenu}
            >
              {category.name}
            </Link>
          ))}
        </div>
        <hr className={styles.mobileMenuDivider} />

        {/* Other Links */}
        <Link
          to="/promotions"
          className={styles.mobileNavLink}
          onClick={toggleMobileMenu}
        >
          Khuyến Mãi
        </Link>
      </nav>
    </header>
  );
};

export default Header;
