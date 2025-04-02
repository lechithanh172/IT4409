import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import MenuTree from '../MenuTree/MenuTree';

// Import CSS file
import './Navbar.css';

// Import icons from Assets and FontAwesomeIcon
import logo from '../Assets/TechZone.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBagShopping, faBars, faPhone, faSearch, faTruckFast, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';

function Navbar() {
    const [isMenu, setIsMenu] = useState(false);

    function handleMenu() {
        setIsMenu(!isMenu);
    }

    return (
        <div className="nav-container">
            <div className="navbar">
                <a href="/" aria-current="page" className="nav-brand">
                    <div className="nav-logo">
                        <img src={logo} alt="" />
                    </div>
                </a>
                <a onClick={() => handleMenu()} className="header-item btn-menu">
                    <div className="box-icon">
                        <FontAwesomeIcon icon={faBars} />
                    </div>
                    <div className="box-content">
                        <p>Danh mục</p>
                    </div>
                </a>
                <div className="menu-container">{isMenu && <MenuTree onMenuItemClick={handleMenu} />}</div>
                <div className="box-search">
                    <form>
                        <div className="group-input">
                            <div className="input-btn">
                                <button type="submit">
                                    <div>
                                        <FontAwesomeIcon icon={faSearch} height={15} />
                                    </div>
                                </button>
                            </div>
                            <input
                                type="text"
                                id="input-search"
                                placeholder="Bạn cần tìm gì?"
                                autoComplete="off"
                                className="input"
                            />
                            <span id="close-search-btn" style={{ display: 'none' }}>
                                <FontAwesomeIcon icon={faXmark} height={15} />
                            </span>
                        </div>
                    </form>
                </div>
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
