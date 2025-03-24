import React from "react";

import "./NewColorProduct.css";

import uploadArea from "../../Assets/upload_area.svg";

function NewColorProduct({
  index,
  newColor,
  image,
  handleChange,
  handleImage,
}) {
  return (
    <div className="new-color-product">
      <hr />
      <div className="new-color-itemfield-box">
        <div className="new-color-itemfield">
          <p>Ảnh mẫu</p>
          <div className="new-color-item-image">
            <label htmlFor={`file-input${index}`}>
              {image ? (
                <img
                  src={
                    image instanceof File ? URL.createObjectURL(image) : image
                  }
                  className="new-color-thumbnail-img"
                  alt=""
                />
              ) : (
                <img
                  src={uploadArea}
                  className="new-color-thumbnail-img"
                  alt=""
                />
              )}
            </label>
            <input
              onChange={(e) => handleImage(e, index)}
              type="file"
              name="image"
              id={`file-input${index}`}
              hidden
            />
          </div>
        </div>
        <div className="new-color-itemfield">
          <div className="new-color-itemfield">
            <p>Màu sản phẩm</p>
            <input
              value={newColor.color}
              onChange={(e) => handleChange(e, index)}
              type="text"
              name="color"
              placeholder="Type here"
            />
          </div>
          <div className="new-color-itemfield">
            <p>Số lượng</p>
            <input
              value={newColor.quantity}
              onChange={(e) => handleChange(e, index)}
              type="text"
              name="quantity"
              placeholder="Type here"
            />
          </div>
        </div>
      </div>
      <div className="new-color-itemfield-box">
        <div className="new-color-itemfield">
          <p>Giá bán</p>
          <input
            value={newColor.old_price}
            onChange={(e) => handleChange(e, index)}
            type="text"
            name="old_price"
            placeholder="Type here"
          />
        </div>
        <div className="new-color-itemfield">
          <p>Giá khuyến mãi</p>
          <input
            value={newColor.new_price}
            onChange={(e) => handleChange(e, index)}
            type="text"
            name="new_price"
            placeholder="Type here"
          />
        </div>
      </div>
    </div>
  );
}

export default NewColorProduct;
