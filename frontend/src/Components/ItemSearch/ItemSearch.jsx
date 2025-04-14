import React from 'react'
import { Link } from 'react-router-dom'
import './ItemSearch.css'

function ItemSearch(props) {
  const formatPrice = (price) => {
    let priceString = price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    return priceString.replace(/\s/g, '');
  };

  if (props.noResult) {
    return (
      <div className="no-result">
        <p className='text'>Không có kết quả nào phù hợp.</p>
      </div>
    );
  }

  const discountPrice = props.price * (1 - props.sale / 100);
  return (
    <div className="item1">
      <div className="item-info">
        <Link to={`/Product/${props.id}`}>
          <div className="item-image">
            <img src={props.image} alt={props.name} />
          </div>
          <div className="item-name">
            <h3>{props.name}</h3>
            <div className="box-price">
              <p className="item-price-new">{formatPrice(discountPrice)}</p>
              <p className="item-price-old">{formatPrice(props.price)}</p>   
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default ItemSearch;