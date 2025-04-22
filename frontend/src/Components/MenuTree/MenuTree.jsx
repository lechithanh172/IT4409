import React from 'react';
import { Link } from 'react-router-dom';

// Import CSS file
import './MenuTree.css';

// Import icons from Assets and FontAwesomeIcon
// import mobileIcon from '../Assets/mobile_icon.svg';
// import tabletIcon from '../Assets/tablet_icon.png';
// import laptopIcon from '../Assets/laptop_icon.svg';
// import pcIcon from '../Assets/pc_icon.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Brand = [
    { "brand_id": 1, "name": "Apple", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_59.png" },
    { "brand_id": 2, "name": "Samsung", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_60.png" },
    { "brand_id": 3, "name": "Dell", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Dell.png" },
    { "brand_id": 4, "name": "HP", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/HP.png" },
    { "brand_id": 5, "name": "Lenovo", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Lenovo.png" },
    { "brand_id": 6, "name": "Asus", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Asus.png" },
    { "brand_id": 7, "name": "MSI", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/MSI.png" },
    { "brand_id": 8, "name": "Acer", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/acer.png" },
    { "brand_id": 9, "name": "Xiaomi", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_61.png" },
    { "brand_id": 10, "name": "Sony", "logo_url": "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/b/r/brand-icon-sony_2.png" }
]

const Category = [
    { "category_id": 1, "name": "Laptop", "description": "Portable personal computers" },
    { "category_id": 2, "name": "Tablet", "description": "Touchscreen mobile devices" },
    { "category_id": 3, "name": "Smartphone", "description": "Mobile phones" },
    { "category_id": 4, "name": "Accessory", "description": "Computer accessories" },
    { "category_id": 5, "name": "Monitor", "description": "Display devices" },
    { "category_id": 6, "name": "Printer", "description": "Printing machines" },
    { "category_id": 7, "name": "Router", "description": "Network routers" },
    { "category_id": 8, "name": "Speaker", "description": "Audio output devices" },
    { "category_id": 9, "name": "Camera", "description": "Photography and video" },
    { "category_id": 10, "name": "Smartwatch", "description": "Wearable smart devices" }
]
  

function MenuTree({ onMenuItemClick }) {
    return (
        <>
            <div className="menu-tree">
                {Category.map((category) => (
                    <div key={category.category_id} className="label-menu-tree">
                        <Link onClick={onMenuItemClick} to={`/product/category=${category.name}`}>
                            <div className="label-item">
                                <div className="item-content">
                                    <span className="item-link">{category.name}</span>
                                </div>
                                <div className="right-icon">
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
            <div onClick={onMenuItemClick} className="header-overlay"></div>
        </>
    );
}

export default MenuTree;
