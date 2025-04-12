import React, { useEffect, useState } from "react";

import "./SlidingBanner.css";

import allSlidingBanner from "../../Assets/sliding";

function SlidingBanner() {
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (index === -(allSlidingBanner.length - 1)) {
        setIndex(0);
      } else {
        setIndex((prev) => prev - 1);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [index]);

  useEffect(() => {
    const handleOffset = () => {
      if (window.innerWidth > 717) {
        if (index > -(allSlidingBanner.length - 1)) {
          setOffset(index < -3 ? (index + 3) * 20 : 0);
        } else if (index === -(allSlidingBanner.length - 1)) {
          setOffset((index + 4) * 20);
        }
      } else {
        if (index > -(allSlidingBanner.length - 1)) {
          setOffset(index < -2 ? (index + 2) * 25 : 0);
        } else if (index === -(allSlidingBanner.length - 1)) {
          setOffset((index + 3) * 25);
        }
      }
    };

    handleOffset();

    window.addEventListener("resize", handleOffset);

    return () => window.removeEventListener("resize", handleOffset);
  }, [index]);

  return (
    <div className="sliding-banner">
      <div className="block-sliding">
        <div className="swiper-container banner-top">
          <div
            className="swiper-wrapper"
            style={{
              transform: `translateX(${index * 100}%)`,
              transitionDuration: "300ms",
            }}
          >
            {allSlidingBanner.map((item, index) => {
              return (
                <div key={index} className="swiper-slide">
                  <img src={item.image} alt="" />
                </div>
              );
            })}
          </div>
        </div>
        <div className="swiper-container sliding-content">
          <div
            className="swiper-wrapper"
            style={{
              transitionDuration: "300ms",
              transform: `translateX(${offset}%)`,
            }}
          >
            {allSlidingBanner.map((item, i) => {
              return (
                <div
                  key={i}
                  className={`swiper-slide ${
                    index === -item.id ? "swiper-slide-active" : ""
                  }`}
                  onClick={() => setIndex(-item.id)}
                >
                  <div>
                    {item.name}
                    <br />
                    {item.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="swiper-pagination">
          {allSlidingBanner.map((item, i) => {
            return (
              <span
                key={i}
                className={`swiper-pagination-bullet ${
                  index === -item.id ? "swiper-pagination-bullet-active" : ""
                }`}
                onClick={() => setIndex(-item.id)}
              ></span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SlidingBanner;
