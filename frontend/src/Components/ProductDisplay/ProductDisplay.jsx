import React, { useState } from "react";
import "./ProductDisplay.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartPlus,
  faChevronLeft,
  faChevronRight,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function ProductDisplay() {
  const [index, setIndex] = useState(0);
  const [choosenColor, setChoosenColor] = useState(0);

  return (
    <div className="productdisplay">
      <div className="box-product-detail">
        <div className="box-product-detail__left">
          <div className="box-gallery">
            <div className="gallery-slide swiper-container">
              <div
                className="swiper-wrapper"
                style={{
                  transform: `translateX(${-index * 100}%)`,
                  transitionDuration: "300ms",
                }}
              >
                {/* Placeholder for images */}
                <div className="swiper-slide gallery-img">
                  <img src="#" alt="product" />
                </div>
                <div className="swiper-slide gallery-img">
                  <img src="#" alt="product" />
                </div>
              </div>
              <div
                className="swiper-button-prev"
                onClick={() => setIndex((prev) => prev - 1)}
                style={index === 0 ? { display: "none" } : {}}
              >
                <div className="icon">
                  <FontAwesomeIcon icon={faChevronLeft} />
                </div>
              </div>
              <div
                className="swiper-button-next"
                onClick={() => setIndex((prev) => prev + 1)}
                style={index === 1 ? { display: "none" } : {}}
              >
                <div className="icon">
                  <FontAwesomeIcon icon={faChevronRight} />
                </div>
              </div>
            </div>
            <div className="thumbnail-slide swiper-container">
              <div className="swiper-wrapper">
                {/* Placeholder for thumbnail images */}
                <div
                  className="swiper-slide thumb-img"
                  onClick={() => setIndex(0)}
                >
                  <img src="#" width={"58"} height={"58"} alt="thumbnail" />
                </div>
                <div
                  className="swiper-slide thumb-img"
                  onClick={() => setIndex(1)}
                >
                  <img src="#" width={"58"} height={"58"} alt="thumbnail" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="box-product-detail__right">
          <div className="box-header">
            <div className="box-product-name">
              <h1>Product Name</h1>
            </div>
            <div className="box-rating">
              <div className="star-icon">
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div className="star-icon">
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div className="star-icon">
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div className="star-icon">
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div className="star-icon">
                <FontAwesomeIcon icon={faStar} />
              </div>
              &nbsp;100 đánh giá
            </div>
          </div>
          <hr />
          <div className="box-product-colors">
            <div className="box-title">
              <p>Chọn màu để xem giá chi tiết</p>
            </div>
            <div className="box-content">
              <ul className="list-colors">
                {/* Placeholder for color selection */}
                <li
                  className={`item-color ${choosenColor === 0 && "choosen-color"}`}
                  onClick={() => setChoosenColor(0)}
                >
                  <a title="Color 1" className="change-color-btn">
                    <img src="#" alt="color 1" />
                    <div>
                      <strong className="item-color-name">Color 1</strong>
                      <span>$10.00</span>
                    </div>
                  </a>
                </li>
                <li
                  className={`item-color ${choosenColor === 1 && "choosen-color"}`}
                  onClick={() => setChoosenColor(1)}
                >
                  <a title="Color 2" className="change-color-btn">
                    <img src="#" alt="color 2" />
                    <div>
                      <strong className="item-color-name">Color 2</strong>
                      <span>$12.00</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="box-price">
            <div className="item-price-detail">
              <p className="item-new-price">$10.00</p>
            </div>
            <div className="item-price-detail">
              <p className="item-old-price">$12.00</p>
            </div>
          </div>
          <div className="box-order-btn">
            <button className="order-btn">
              <Link to="/cart">
                <strong>MUA NGAY</strong>
                <span>(Thanh toán khi nhận hàng hoặc nhận tại cửa hàng)</span>
              </Link>
            </button>
            <button className="add-to-cart-btn">
              <FontAwesomeIcon icon={faCartPlus} />
              <span>Thêm vào giỏ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDisplay;
