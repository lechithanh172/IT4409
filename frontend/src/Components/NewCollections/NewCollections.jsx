import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./NewCollections.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Item from "../Item/Item"; // Giả sử bạn đã có Item component

function NewCollections() {
  const [mobileProducts, setMobileProducts] = useState([]);
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const elementRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);

  useEffect(() => {
    // Gọi API để lấy sản phẩm Mobile
    axios
      .get(`https://e-commerce-group9-2024-1.onrender.com/product/popular/Mobile`)
      .then((res) => setMobileProducts(res.data));

    const handleOffset = () => {
      const element = elementRef.current;
      let containerWidth;

      if (window.innerWidth > 1200) {
        setOffset(index * 234.8);
        setMaxIndex(mobileProducts.length - 5);
      } else if (window.innerWidth > 990) {
        setOffset(index * (width / 4 + 2.5));
        setMaxIndex(mobileProducts.length - 4);
      } else if (window.innerWidth > 717) {
        setOffset(index * (width / 3 + 3.33333));
        setMaxIndex(mobileProducts.length - 3);
      } else {
        setOffset(index * (width / 2 + 5));
        setMaxIndex(mobileProducts.length - 2);
      }

      if (element) {
        containerWidth = element.offsetWidth;
        setWidth(containerWidth);
      }
    };

    handleOffset();

    window.addEventListener("resize", handleOffset);

    return () => window.removeEventListener("resize", handleOffset);
  }, [index, width, mobileProducts.length]);

  useEffect(() => {
    if (index < -maxIndex) {
      if (window.innerWidth > 1200) {
        setIndex(
          mobileProducts.length > 5 ? -(mobileProducts.length - 5) : 0
        );
      } else if (window.innerWidth > 990) {
        setIndex(
          mobileProducts.length > 4 ? -(mobileProducts.length - 4) : 0
        );
      } else if (window.innerWidth > 717) {
        setIndex(
          mobileProducts.length > 3 ? -(mobileProducts.length - 3) : 0
        );
      } else {
        setIndex(
          mobileProducts.length > 2 ? -(mobileProducts.length - 2) : 0
        );
      }
    }
  }, [maxIndex, index, mobileProducts.length]);

  return (
    <>
      {mobileProducts.length > 0 && (
        <div className="newcollections">
          <div className="product-list-title">
            <h2>SẢN PHẨM MOBILE MỚI</h2>
          </div>
          <div className="product-list">
            <div className="product-list-swiper">
              <div className="swiper-container">
                <div
                  ref={elementRef}
                  className="swiper-wrapper"
                  style={{
                    transform: `translateX(${offset}px)`,
                    transitionDuration: "300ms",
                  }}
                >
                  {mobileProducts.map((product, index) => {
                    return (
                      <div key={index} className="swiper-slide">
                        <Item
                          id={product.id}
                          name={product.name}
                          image={product.images[0].replace(/http:\/\/localhost:4000/g, 'https://e-commerce-group9-2024-1.onrender.com')}
                          new_price={product.new_price}
                          old_price={product.old_price}
                        />
                      </div>
                    );
                  })}
                </div>
                <div
                  onClick={() => setIndex((prev) => prev + 1)}
                  className="swiper-button-prev"
                  style={index === 0 ? { display: "none" } : {}}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </div>
                <div
                  onClick={() => setIndex((prev) => prev - 1)}
                  className="swiper-button-next"
                  style={index <= -maxIndex ? { display: "none" } : {}}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NewCollections;
