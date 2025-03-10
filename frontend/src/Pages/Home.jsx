import React from "react";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import Banner from "../Components/Banner/Banner";
import MenuBottomTabs from "../Components/MenuBottomTabs/MenuBottomTabs";
import FlashSales from "../Components/FlashSales/FlashSales";

import "./Css/Home.css";

function Home() {
  return (
    <div className="home">
      <Header />
      <Banner />
      <MenuBottomTabs active={"Home"} />
      <FlashSales />
      <div style={{height: '2000px'}}></div>
      <Footer />
    </div>
  );
}

export default Home;
