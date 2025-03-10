import React from "react";

import "./Banner.css";

import bannerLeft1 from "../Assets/banner-left-1.webp";
import bannerLeft2 from "../Assets/banner-left-2.webp";
import bannerLeft3 from "../Assets/banner-left-3.webp";
import SlidingBanner from "./SlidingBanner/SlidingBanner";

function Banner() {
  return (
    <div className="banner">
      <div className="left-banner">
        <div className="left-banner-item">
          <img src={bannerLeft1} alt="" />
        </div>
        <div className="left-banner-item">
          <img src={bannerLeft2} alt="" />
        </div>
        <div className="left-banner-item">
          <img src={bannerLeft3} alt="" />
        </div>
      </div>
      <SlidingBanner />
    </div>
  );
}

export default Banner;
