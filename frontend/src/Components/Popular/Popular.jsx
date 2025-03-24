import React, { useEffect, useRef, useState } from "react";
import "./Popular.css";
import "../NewCollections/NewCollections.css";
import Item from "../Item/Item";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function Popular({ category }) {
  const [popularProducts, setPopularProducts] = useState([]);
  const [title, setTitle] = useState("");
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const elementRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);

  useEffect(() => {
    axios
      .get(`https://e-commerce-group9-2024-1.onrender.com/product/popular/${category}`)
      .then((res) => setPopularProducts(res.data));

    switch (category) {
      case "Mobile":
        setTitle("ĐIỆN THOẠI");
        break;

      case "Tablet":
        setTitle("MÁY TÍNH BẢNG");
        break;

      case "Laptop":
        setTitle("LAPTOP");
        break;

      case "PersonalComputer":
        setTitle("MÁY TÍNH, MÁY TÍNH ĐỂ BÀN");
        break;

      default:
        break;
    }
  }, [category]);

  useEffect(() => {
    const handleOffset = () => {
      const element = elementRef.current;
      let containerWidth;

      if (window.innerWidth > 1200) {
        setOffset(index * 234.8);
        setMaxIndex(popularProducts.length - 5);
      } else if (window.innerWidth > 990) {
        setOffset(index * (width / 4 + 2.5));
        setMaxIndex(popularProducts.length - 4);
      } else if (window.innerWidth > 717) {
        setOffset(index * (width / 3 + 3.33333));
        setMaxIndex(popularProducts.length - 3);
      } else {
        setOffset(index * (width / 2 + 5));
        setMaxIndex(popularProducts.length - 2);
      }

      if (element) {
        containerWidth = element.offsetWidth;
        setWidth(containerWidth);
      }
    };

    handleOffset();

    window.addEventListener("resize", handleOffset);

    return () => window.removeEventListener("resize", handleOffset);
  }, [index, width, popularProducts.length]);

  useEffect(() => {
    if (index < -maxIndex) {
      if (window.innerWidth > 1200) {
        setIndex(
          popularProducts.length > 5 ? -(popularProducts.length - 5) : 0
        );
      } else if (window.innerWidth > 990) {
        setIndex(
          popularProducts.length > 4 ? -(popularProducts.length - 4) : 0
        );
      } else if (window.innerWidth > 717) {
        setIndex(
          popularProducts.length > 3 ? -(popularProducts.length - 3) : 0
        );
      } else {
        setIndex(
          popularProducts.length > 2 ? -(popularProducts.length - 2) : 0
        );
      }
    }
  }, [maxIndex, index]);

  return (
    <>
      {popularProducts.length > 0 && (
        <div className="popular">
          <div className="product-list-title">
            <Link to={`/${category.toLowerCase()}`} className="title">
              <h2>{title} NỔI BẬT</h2>
            </Link>
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
                  {popularProducts.map((product, index) => {
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

export default Popular;
