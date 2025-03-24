import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import NewColorProduct from "../NewColorProduct/NewColorProduct";

import "./AddAndEditProduct.css";

import uploadArea from "../../Assets/upload_area.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";

function AddAndEditProduct({ mode }) {
  const { productId } = useParams();
  const [images, setImages] = useState([]);
  const [productDetails, setProductDetails] = useState({
    name: "",
    images: [],
    category: "",
    brand: "",
    new_price: "",
    old_price: "",
    colors: [],
    description: "",
    label: "new",
    total_quantity: "0",
  });

  const newColor = {
    color: "",
    image: "",
    new_price: "",
    old_price: "",
    quantity: "0",
  };
  const [colors, setColors] = useState([newColor]);
  const [colorImages, setColorImages] = useState(
    Array(colors.length).fill(null)
  );

  const fetchProduct = async () => {
    let resData;

    if (productId) {
      await fetch(`https://e-commerce-group9-2024-1.onrender.com/product/get/${productId}`)
        .then((res) => res.json())
        .then((data) => (resData = data));

      setProductDetails(resData);
      setColors(resData.colors);
      let colorImagesData = resData.colors.map((item) => {
        return item.image;
      });
      setColorImages(colorImagesData);
    }
  };

  useEffect(() => {
    if (mode === "edit") {
      fetchProduct();
    } else if (mode === "add") {
      setProductDetails({
        name: "",
        images: [],
        category: "",
        brand: "",
        new_price: "",
        old_price: "",
        description: "",
        label: "new",
        total_quantity: "0",
      });
      setImages([]);
      setColors([newColor]);
      setColorImages(Array(1).fill(null));
    }
  }, [mode]);

  const handleImages = (e) => {
    setImages([...images, e.target.files[0]]);
  };

  const handleChange = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const handleColorImage = (e, index) => {
    let updateColorsImage = [...colorImages];
    if (e.target.files) {
      updateColorsImage[index] = e.target.files[0];
    }
    setColorImages(updateColorsImage);
  };

  const handleColorChange = (e, index) => {
    let updatedColors = [...colors];
    updatedColors[index] = {
      ...updatedColors[index],
      [e.target.name]: e.target.value,
    };
    setColors(updatedColors);
  };

  const addNewColor = () => {
    setColors([...colors, newColor]);
    setColorImages([...colorImages, null]);
  };

  const addProduct = async () => {
    let resData;
    let product = productDetails;
    let colorsData = colors;
    let totalQuantity = 0;
    let minNewPrice = colors[0].new_price;
    let minOldPrice = colors[0].old_price;

    // Upload images of different colors of a product
    let formData = new FormData();
    colorImages.forEach((image) => {
      formData.append("color", image);
    });

    await fetch("https://e-commerce-group9-2024-1.onrender.com/upload", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          colorsData = colorsData.map((item, index) => {
            totalQuantity += Number(item.quantity);
            if (minNewPrice > item.new_price) minNewPrice = item.new_price;
            if (minOldPrice > item.old_price) minOldPrice = item.old_price;
            return { ...item, image: data.image_urls[index] };
          });
        }
      });

    //Upload images of product
    formData = new FormData();
    images.forEach((image) => {
      formData.append("product", image);
    });

    await fetch("https://e-commerce-group9-2024-1.onrender.com/upload", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        resData = data;
      });

    //Add product to database
    if (resData.success) {
      product.images = resData.image_urls;
      product.new_price = minNewPrice;
      product.old_price = minOldPrice;
      product.colors = colorsData;
      product.total_quantity = totalQuantity;
      await fetch("https://e-commerce-group9-2024-1.onrender.com/product/add", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })
        .then((res) => res.json())
        .then((data) => {
          data.success ? alert("Product Added") : alert("Failed");
        });
    }

    setProductDetails({
      name: "",
      images: [],
      category: "",
      brand: "",
      new_price: "",
      old_price: "",
      description: "",
      label: "new",
      total_quantity: "0",
    });
    setImages([]);
    setColors([newColor]);
    setColorImages(Array(1).fill(null));
  };

  const editProduct = async () => {
    let resData;
    let product = productDetails;
    let colorsData = colors;
    let totalQuantity = 0;
    let minNewPrice = colors[0].new_price;
    let minOldPrice = colors[0].old_price;

    // Upload images of different colors of a product
    let formData = new FormData();
    colorImages.forEach((image) => {
      formData.append("color", image);
    });

    await fetch("https://e-commerce-group9-2024-1.onrender.com/upload", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          let i = 0;
          let colorImagesData = colorImages.map((item) => {
            if (item instanceof File) {
              return data.image_urls[i++];
            }
            return item;
          });
          colorsData = colorsData.map((item, index) => {
            totalQuantity += Number(item.quantity);
            if (minNewPrice > item.new_price) minNewPrice = item.new_price;
            if (minOldPrice > item.old_price) minOldPrice = item.old_price;
            return { ...item, image: colorImagesData[index] };
          });
        }
      });

    //Upload images of product
    formData = new FormData();
    images.forEach((image) => {
      formData.append("product", image);
    });

    await fetch("https://e-commerce-group9-2024-1.onrender.com/upload", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        resData = data;
      });

    // Updata a product
    if (resData.success) {
      product.images = [...product.images, ...resData.image_urls];
      product.new_price = minNewPrice;
      product.old_price = minOldPrice;
      product.colors = colorsData;
      product.total_quantity = totalQuantity;
      await fetch("https://e-commerce-group9-2024-1.onrender.com/product/update", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })
        .then((res) => res.json())
        .then((data) => {
          data.success ? alert("Product Detail Changed") : alert("Failed");
        });
    }
  };

  return (
    <div className="add-and-edit-product">
      <div className="product-itemfield">
        <p>Tên sản phẩm</p>
        <input
          value={productDetails.name}
          onChange={(e) => handleChange(e)}
          type="text"
          name="name"
          placeholder="Type here"
        />
      </div>
      <div className="product-itemfield-box">
        <div className="product-itemfield">
          <p>Danh mục</p>
          <select
            value={productDetails.category}
            onChange={(e) => handleChange(e)}
            name="category"
            className="product-selector"
            placeholder="Chọn danh mục"
          >
            <option value="" disabled>
              Chọn danh mục
            </option>
            <option value="Mobile">Mobile</option>
            <option value="Tablet">Tablet</option>
            <option value="Laptop">Laptop</option>
            <option value="PersonalComputer">PC</option>
          </select>
        </div>
        <div className="product-itemfield">
          <p>Thương hiệu</p>
          <select
            value={productDetails.brand}
            onChange={(e) => handleChange(e)}
            name="brand"
            className="product-selector"
            placeholder="Chọn thương hiệu"
          >
            <option value="" disabled>
              Chọn thương hiệu
            </option>
            <option value="Apple">Apple</option>
            <option value="Samsung">Samsung</option>
            <option value="Xiaomi">Xiaomi</option>
            <option value="OPPO">OPPO</option>
          </select>
        </div>
        <div className="product-itemfield">
          <p>Nhãn sản phẩm</p>
          <select
            value={productDetails.label}
            onChange={(e) => handleChange(e)}
            name="label"
            className="product-selector"
          >
            <option value="new">Mới</option>
            <option value="popular">Nổi bật</option>
          </select>
        </div>
      </div>
      <div className="product-itemfield">
        <p>Hình ảnh</p>
        <div className="product-item-images">
          {productDetails.images.length > 0 ? (
            productDetails.images.map((image, i) => {
              return (
                <img
                  key={i}
                  src={image}
                  className="product-thumbnail-img"
                  alt=""
                />
              );
            })
          ) : (
            <></>
          )}
          {images.length > 0 ? (
            images.map((image, i) => {
              return (
                <img
                  key={i}
                  src={URL.createObjectURL(image)}
                  className="product-thumbnail-img"
                  alt=""
                />
              );
            })
          ) : (
            <></>
          )}
          <label htmlFor="files-input">
            <img src={uploadArea} className="product-thumbnail-img" alt="" />
          </label>
          <input
            onChange={(e) => handleImages(e)}
            type="file"
            name="images"
            id="files-input"
            hidden
          />
        </div>
      </div>
      <div className="product-itemfield">
        <p>Mô tả</p>
        <textarea
          name="description"
          id="description"
          cols="30"
          rows="10"
          value={productDetails.description}
          onChange={(e) => handleChange(e)}
          placeholder="Type here"
        />
      </div>
      <div className="product-itemfield">
        <div className="product-color-field-title">
          <p>Loại màu sản phẩm</p>
          <FontAwesomeIcon icon={faSquarePlus} onClick={() => addNewColor()} />
        </div>
        <div className="product-colors-box">
          {colors.map((item, index) => (
            <NewColorProduct
              key={index}
              index={index}
              newColor={item}
              image={colorImages[index]}
              handleChange={handleColorChange}
              handleImage={handleColorImage}
            />
          ))}
        </div>
      </div>
      {mode === "add" && (
        <button onClick={() => addProduct()} className="addproduct-btn">
          ADD
        </button>
      )}
      {mode === "edit" && (
        <button onClick={() => editProduct()} className="editproduct-btn">
          SAVE CHANGES
        </button>
      )}
    </div>
  );
}

export default AddAndEditProduct;
