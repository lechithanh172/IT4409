import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import MenuTree from '../MenuTree/MenuTree';
import Search from '../Search';

// Import CSS file
import './Navbar.css';

// Import icons from Assets and FontAwesomeIcon
import logo from '../Assets/senashop.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBagShopping, faBars, faPhone, faSearch, faTruckFast, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';

function Navbar() {
    const [isMenu, setIsMenu] = useState(false);
    const [isSearch, setIsSearch] = useState(false);
    const menuRef = useRef(null); // Tham chiếu đến menu

    function handleMenu() {
        setIsMenu(!isMenu);
        if (!isMenu) {
            document.body.classList.add('no-scroll'); // Thêm class no-scroll
        } else {
            document.body.classList.remove('no-scroll'); // Xóa class no-scroll
        }
    }

    function handleSearch() {
        setIsSearch(true);
        document.body.classList.add('no-scroll'); // Thêm class no-scroll
    }

    function closeOverlay() {
        setIsMenu(false);
        setIsSearch(false);
        document.body.classList.remove('no-scroll'); // Xóa class no-scroll
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeOverlay(); // Đóng menu nếu click ra ngoài
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="nav-container">
            <div className="navbar" ref={menuRef}>
                <a href="/" aria-current="page" className="nav-brand">
                    <div className="nav-logo">
                        <img src={logo} alt="" />
                    </div>
                </a>
                <a onClick={handleMenu} className="header-item btn-menu">
                    <div className="box-icon">
                        <FontAwesomeIcon icon={faBars} />
                    </div>
                    <div className="box-content">
                        <p>Danh mục</p>
                    </div>
                </a>
                <div className="menu-container">{isMenu && <MenuTree onMenuItemClick={closeOverlay} />}</div>
                <div className="menu-list" onClick={handleSearch}>
                    <Search overlay={isSearch} />
                </div>
                {isMenu || isSearch ? <div className="overlay" onClick={closeOverlay}></div> : null}
                <a className="header-item about-contact">
                    <div className="box-icon">
                        <div className="my-icon">
                            <FontAwesomeIcon icon={faPhone} className="fa-h-24px" />
                        </div>
                    </div>
                    <div className="box-content">
                        <p className="title">
                            Gọi mua hàng
                            <br />
                            <strong>1800.0000</strong>
                        </p>
                    </div>
                </a>
                <Link to="/order" className="header-item about-delivery-tracking">
                    <div className="box-icon">
                        <div className="my-icon">
                            <FontAwesomeIcon icon={faTruckFast} className="fa-h-24px" />
                        </div>
                    </div>
                    <div className="box-content">
                        <p className="title">
                            Tra cứu
                            <br />
                            đơn hàng
                        </p>
                    </div>
                </Link>
                <Link className="header-item about-cart" to="/cart">
                    <div className="box-icon">
                        <div className="my-icon">
                            <FontAwesomeIcon icon={faBagShopping} className="fa-h-24px" />
                        </div>
                    </div>
                    <div className="box-content">
                        <p className="title">
                            Giỏ&nbsp;
                            <br />
                            hàng
                        </p>
                        {/* <span id="items-in-cart">{getTotalItems() ?? 0}</span> */}
                    </div>
                </Link>
                {localStorage.getItem('auth-token') ? (
                    <div
                        className="login-btn"
                        onClick={() => {
                            localStorage.removeItem('auth-token');
                            localStorage.removeItem('user');
                            localStorage.removeItem('order');
                            window.location.replace('/');
                        }}
                    >
                        <div className="header-item about-member">
                            <div className="box-icon">
                                <div className="my-icon">
                                    <FontAwesomeIcon icon={faCircleUser} className="avatar" />
                                </div>
                            </div>
                            <div className="box-content">
                                <span className="title">Đăng xuất</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Link to="/login">
                        <div className="login-btn">
                            <div className="header-item about-member">
                                <div className="box-icon">
                                    <div className="my-icon">
                                        <FontAwesomeIcon icon={faCircleUser} className="avatar" />
                                    </div>
                                </div>
                                <div className="box-content">
                                    <span className="title">Đăng nhập</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
}

export default Navbar;
