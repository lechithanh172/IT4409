import React, { useContext } from "react";
import { Link } from "react-router-dom";

import "./Item.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

function Item(props) {

  return (
    <div className="item">
      <div className="item-info">
        <Link to={`/product/${props.id}`}>
          <div className="item-image">
            <img src={props.image} alt={props.name} />
          </div>
          <div className="item-name">
            <h3>{props.name}</h3>
          </div>
          <div className="box-price">
            <p className="item-price-new">{props.new_price}</p>
            <p className="item-price-old">{props.old_price}</p>
            <div className="item-price-percent">
              <p className="item-price-percent-detail">
                Giảm&nbsp;
                {(100 - (props.new_price / props.old_price) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          <div className="item-promotions">
            <div className="promotion">
              <p className="coupon-price">
                Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6
                tháng
              </p>
            </div>
          </div>
        </Link>
      </div>
      <div className="bottom-div">
        <div className="item-rating">
          <div className="icon-star">
            <FontAwesomeIcon icon={faStar} />
          </div>
          <div className="icon-star">
            <FontAwesomeIcon icon={faStar} />
          </div>
          <div className="icon-star">
            <FontAwesomeIcon icon={faStar} />
          </div>
          <div className="icon-star">
            <FontAwesomeIcon icon={faStar} />
          </div>
          <div className="icon-star">
            <FontAwesomeIcon icon={faStar} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Item;
