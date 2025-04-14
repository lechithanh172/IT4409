import React, { useEffect, useState } from 'react';
import MenuBottomTabs from '../../Components/MenuBottomTabs/MenuBottomTabs';
import Banner from '../../Components/Banner/Banner';
import NewCollections from '../../Components/NewCollections/NewCollections';
import Popular from '../../Components/Popular/Popular';
import ListItems from '../../Components/ListItems/ListItems';

import './Home.css';

function Home() {
    return (
        <div className="home">
            <Banner />
            <NewCollections />
            <Popular category="Smartphone" />
            <Popular category="Laptop" />
            <ListItems />
            <MenuBottomTabs active={'Home'} />
        </div>
    );
}

export default Home;
