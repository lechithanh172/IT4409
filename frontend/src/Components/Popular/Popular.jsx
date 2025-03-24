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

const data = [
  {
    "_id": "66291dd1fad211e5a98e601a",
    "id": 8,
    "name": "Xiaomi Redmi Note 13 Pro 4G",
    "images": [
      "http://localhost:4000/images/d7ec7e13-214e-456c-8c03-ab73329bf97c.webp",
      "http://localhost:4000/images/c1b07fb4-fcc4-4899-830c-fca072f79aac.webp",
      "http://localhost:4000/images/dc72611c-9295-4d77-b068-4da485facf58.webp",
      "http://localhost:4000/images/0eb716e5-563b-41c7-98a3-ec70c4bcd7e1.webp",
      "http://localhost:4000/images/013cfcc1-b611-42e8-a659-da58ccf11e07.webp",
      "http://localhost:4000/images/0795cb09-4c92-4ad6-9144-337e6487fe91.webp",
      "http://localhost:4000/images/dea86f53-b511-448e-a22e-eab9904a969f.webp",
      "http://localhost:4000/images/f8d9a024-96ec-48f0-bce2-11a5ae344a08.webp",
      "http://localhost:4000/images/67396839-2af7-458c-baac-adcc6ac375eb.webp",
      "http://localhost:4000/images/e43131a5-b5b3-49ae-b206-50ad700f9c0f.webp",
      "http://localhost:4000/images/9737735a-a506-49d8-8952-56284e353d99.webp"
    ],
    "category": "Mobile",
    "brand": "Xiaomi",
    "new_price": 6390000,
    "old_price": 7290000,
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nMáy, Que lấy SIM, sách hướng dẫn sử dụng, củ sạc 67W, dây sạc USB Type-C, ốp lưng nhựa.\nBảo hành 18 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất.\nGiá sản phẩm đã bao gồm VAT",
    "label": "popular",
    "date": "2024-04-24T14:57:21.285Z",
    "__v": 0,
    "total_quantity": 23,
    "total_sold": 0,
    "colors": [
      {
        "color": "Đen",
        "image": "http://localhost:4000/images/aabfdf3f-67dd-47fa-8026-c98196e51ad0.webp",
        "new_price": 6390000,
        "old_price": 7290000,
        "quantity": 5,
        "sold": 0,
        "_id": "663e600b8e549dae4c66b2a9"
      },
      {
        "color": "Xanh lá",
        "image": "http://localhost:4000/images/5d15b7a4-7952-4683-8329-a37d94a352be.webp",
        "new_price": 6390000,
        "old_price": 7290000,
        "quantity": 10,
        "sold": 0,
        "_id": "663e600b8e549dae4c66b2aa"
      },
      {
        "color": "Tím",
        "image": "http://localhost:4000/images/1c4eacb2-f5f4-41f5-aa42-3c9fc26c3a69.webp",
        "new_price": 6390000,
        "old_price": 7290000,
        "quantity": 8,
        "sold": 0,
        "_id": "663e600b8e549dae4c66b2ab"
      }
    ],
    "variants": [
      
    ]
  },
  {
    "_id": "66291f4afad211e5a98e6023",
    "id": 9,
    "name": "Xiaomi Redmi Note 13 6GB 128GB",
    "images": [
      "http://localhost:4000/images/6a77e91c-7f18-4bef-bd6d-219d25bca60a.webp",
      "http://localhost:4000/images/8ddcb5ac-109c-406d-b76e-396e7abe934d.webp",
      "http://localhost:4000/images/a5212a00-1eb1-4e4e-a4ad-76c065c86215.webp",
      "http://localhost:4000/images/687f8e2c-435f-4e36-a0c3-b92c51f7b021.webp",
      "http://localhost:4000/images/0b465553-ebb4-4622-94cd-02de87d4264c.webp",
      "http://localhost:4000/images/f6bbcbd1-0888-48d3-aeea-74439ad610e9.webp",
      "http://localhost:4000/images/1a4351e8-96b5-4053-9044-3907c5dee5e9.webp",
      "http://localhost:4000/images/baa8deb2-60f5-43b1-a4d6-161ce58065d6.webp",
      "http://localhost:4000/images/bf0efa94-27d4-4fce-a418-245797d22d03.webp",
      "http://localhost:4000/images/3aeeafe7-aefa-47e1-b84d-98aa8d19006b.webp",
      "http://localhost:4000/images/a2b22783-5adf-41bc-b384-bda18a71d851.webp"
    ],
    "category": "Mobile",
    "brand": "Xiaomi",
    "new_price": 4690000,
    "old_price": 4890000,
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nMáy, sạc, Cáp USB Type-C, Dụng cụ lấy SIM, Vỏ bảo vệ, Hướng dẫn sử dụng nhanh\nBảo hành 18 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất.\nGiá sản phẩm đã bao gồm VAT",
    "label": "popular",
    "date": "2024-04-24T15:03:38.622Z",
    "__v": 0,
    "total_quantity": 37,
    "total_sold": 0,
    "colors": [
      {
        "color": "Đen",
        "image": "http://localhost:4000/images/de0edcfa-dbd3-45b8-9268-a00e78b1eef1.webp",
        "new_price": 4690000,
        "old_price": 4890000,
        "quantity": 10,
        "sold": 0,
        "_id": "663eb8808e549dae4c66b395"
      },
      {
        "color": "Xanh lá",
        "image": "http://localhost:4000/images/e03b2fb4-4202-48d5-a380-dbe152465397.webp",
        "new_price": 4690000,
        "old_price": 4890000,
        "quantity": 15,
        "sold": 0,
        "_id": "663eb8808e549dae4c66b396"
      },
      {
        "color": "Vàng",
        "image": "http://localhost:4000/images/fa6123cb-f81b-4019-b442-c6f97c9ebc2a.webp",
        "new_price": 4690000,
        "old_price": 4890000,
        "quantity": 12,
        "sold": 0,
        "_id": "663eb8808e549dae4c66b397"
      }
    ],
    "variants": [
      
    ]
  },
  {
    "_id": "662916c135e37982ac8a992b",
    "id": 6,
    "name": "iPhone 14 Pro Max 128GB | Chính hãng VN/A",
    "images": [
      "http://localhost:4000/images/bb103116-b56c-416d-aabb-c6370edb38e7.webp",
      "http://localhost:4000/images/08e175ed-9be7-4e1d-977b-4f2f0ab87236.webp",
      "http://localhost:4000/images/1c418022-6520-4d73-8a0f-b6472f5dba6a.webp",
      "http://localhost:4000/images/8396af9b-24f3-431d-8dd3-5b2129779c9c.webp",
      "http://localhost:4000/images/19c0d8f2-29f2-4d75-a7a0-cbf183946da4.webp",
      "http://localhost:4000/images/ac368fcb-9a5a-4125-ae13-f99311bea3f3.webp",
      "http://localhost:4000/images/84193162-8b0e-41f3-b3e9-fa2cf270ffe8.webp",
      "http://localhost:4000/images/490e39e6-2ab3-48fe-afd9-8d3f8b7bc3c0.webp"
    ],
    "category": "Mobile",
    "brand": "Apple",
    "new_price": 26690000,
    "old_price": 29990000,
    "description": "Máy mới 100% , chính hãng Apple Việt Nam.\nHộp, Sách hướng dẫn, Cây lấy sim, Cáp Lightning - Type C\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple\nGiá sản phẩm đã bao gồm VAT",
    "label": "popular",
    "date": "2024-04-24T14:27:13.509Z",
    "__v": 0,
    "total_quantity": 10,
    "total_sold": 0,
    "colors": [
      {
        "color": "Tím",
        "image": "http://localhost:4000/images/2d960ba4-f7a9-47b0-8a23-99a9d3bc846c.webp",
        "new_price": 26690000,
        "old_price": 29990000,
        "quantity": 10,
        "sold": 0,
        "_id": "663de2168e549dae4c66a635"
      }
    ],
    "variants": [
      
    ]
  },
  {
    "_id": "6629177435e37982ac8a992e",
    "id": 7,
    "name": "Samsung Galaxy Z Flip5 256GB",
    "images": [
      "http://localhost:4000/images/9b4ae4e3-0a7a-4e7c-93aa-f08cbebdd660.webp",
      "http://localhost:4000/images/3dfcc25d-b157-47a2-9a2b-a91e0a79d097.webp",
      "http://localhost:4000/images/fe2b44fd-56cd-4d2c-89e6-86b296bd0c19.webp",
      "http://localhost:4000/images/108d314b-a5fc-4368-9694-c828b3d0b4d2.webp",
      "http://localhost:4000/images/546c4887-430f-4713-8009-65b367a843e6.webp",
      "http://localhost:4000/images/0683cf6d-0189-4651-a72e-1446383a931c.webp",
      "http://localhost:4000/images/583cd67c-901b-4b6b-b2bc-0f428d66a132.webp",
      "http://localhost:4000/images/54fb55d9-2090-439b-89ae-4ad50d1fa685.webp",
      "http://localhost:4000/images/416d243c-62a0-4b21-a647-4ffb4ad2cb15.webp"
    ],
    "category": "Mobile",
    "brand": "Samsung",
    "new_price": 16490000,
    "old_price": 25990000,
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nHộp, Sách hướng dẫn, Cây lấy sim, Cáp Type C\nBảo hành 12 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. \nGiá sản phẩm đã bao gồm VAT",
    "label": "popular",
    "date": "2024-04-24T14:30:12.926Z",
    "__v": 0,
    "total_quantity": 38,
    "total_sold": 0,
    "colors": [
      {
        "color": "Kem",
        "image": "http://localhost:4000/images/7dd86e10-75b4-48b3-a259-74b28a1810e3.webp",
        "new_price": 16490000,
        "old_price": 25990000,
        "quantity": 10,
        "sold": 0,
        "_id": "663e5f4f8e549dae4c66b20e"
      },
      {
        "color": "Xám",
        "image": "http://localhost:4000/images/f4aa73c0-5775-40fd-895e-805b3e9a37e4.webp",
        "new_price": 16490000,
        "old_price": 25990000,
        "quantity": 8,
        "sold": 0,
        "_id": "663e5f4f8e549dae4c66b20f"
      },
      {
        "color": "Tím",
        "image": "http://localhost:4000/images/77a4db18-3df7-4aab-9212-b6afd5fc53b5.webp",
        "new_price": 16490000,
        "old_price": 25990000,
        "quantity": 5,
        "sold": 0,
        "_id": "663e5f4f8e549dae4c66b210"
      },
      {
        "color": "Xanh lá",
        "image": "http://localhost:4000/images/1e9b32a6-d1d4-4641-8e1d-cc2222f370b1.webp",
        "new_price": 16490000,
        "old_price": 25990000,
        "quantity": 15,
        "sold": 0,
        "_id": "663e5f4f8e549dae4c66b211"
      }
    ],
    "variants": [
      
    ]
  },
  {
    "_id": "6629200efad211e5a98e6026",
    "id": 10,
    "name": "Samsung Galaxy M34 5G 8GB 128GB",
    "images": [
      "http://localhost:4000/images/800db32b-f89e-4068-bd16-8aa762b7fe98.webp",
      "http://localhost:4000/images/663a7547-3fe4-40d1-9ed8-a655e3dc257f.webp",
      "http://localhost:4000/images/f3190b44-a9a1-4f72-aa32-a3cc2eb62f2d.webp",
      "http://localhost:4000/images/c7121710-a4be-474e-b1a0-83f8ef02a050.webp",
      "http://localhost:4000/images/49630e08-7208-420b-bd74-2bed64c2e95c.webp",
      "http://localhost:4000/images/34644110-e686-4d41-9541-4a409c2e71b4.webp",
      "http://localhost:4000/images/6126b390-b201-4797-8919-bd4a06507870.webp",
      "http://localhost:4000/images/b512eb88-9130-47c0-8db8-9abb3a6e4f65.webp"
    ],
    "category": "Mobile",
    "brand": "Samsung",
    "new_price": 5590000,
    "old_price": 7990000,
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nCáp Type C, Cây lấy sim, Hộp, Sách hướng dẫn\nBảo hành 12 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất.\nGiá sản phẩm đã bao gồm VAT",
    "label": "popular",
    "date": "2024-04-24T15:06:54.112Z",
    "__v": 0,
    "total_quantity": 23,
    "total_sold": 0,
    "colors": [
      {
        "color": "Xanh nhạt",
        "image": "http://localhost:4000/images/e98294e3-40b7-4011-974e-2afa22433f6e.webp",
        "new_price": 5590000,
        "old_price": 7990000,
        "quantity": 10,
        "sold": 0,
        "_id": "663eb98d8e549dae4c66b3da"
      },
      {
        "color": "Xanh đậm",
        "image": "http://localhost:4000/images/fe837f19-4291-48fc-a2a0-26059521b8fc.webp",
        "new_price": 5590000,
        "old_price": 7990000,
        "quantity": 8,
        "sold": 0,
        "_id": "663eb98d8e549dae4c66b3db"
      },
      {
        "color": "Bạc",
        "image": "http://localhost:4000/images/f56e2602-11aa-4bc6-af53-7ec999d71038.webp",
        "new_price": 5590000,
        "old_price": 7990000,
        "quantity": 5,
        "sold": 0,
        "_id": "663eb98d8e549dae4c66b3dc"
      }
    ],
    "variants": [
      
    ]
  },
  {
    "_id": "662925e0fad211e5a98e602e",
    "id": 12,
    "name": "Samsung Galaxy Z Fold5 12GB 256GB",
    "images": [
      "http://localhost:4000/images/4cf50639-a7d9-40f2-87cd-ac05a2f8bdb9.webp",
      "http://localhost:4000/images/0f17e312-21d1-4d0b-903c-5075af666fee.webp",
      "http://localhost:4000/images/d49a5fc5-9097-48df-b1ef-2325afe17e29.webp",
      "http://localhost:4000/images/690ad1ed-cea4-4745-8aff-444595e2a9b9.webp",
      "http://localhost:4000/images/b266c7be-8f07-49bd-82c4-a15aeb67e95b.webp",
      "http://localhost:4000/images/964aaba9-d035-4599-9239-bcf1814c6f82.webp",
      "http://localhost:4000/images/60104bd6-2aa5-4b65-8c26-7708743939fc.webp",
      "http://localhost:4000/images/1ad31879-b3c8-4895-bae4-1f412589f452.webp"
    ],
    "category": "Mobile",
    "brand": "Samsung",
    "new_price": 30490000,
    "old_price": 40990000,
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nCáp Type C, Cây lấy sim, Hộp, Sách hướng dẫn\nBảo hành 12 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất.\nGiá sản phẩm đã bao gồm VAT",
    "label": "popular",
    "date": "2024-04-24T15:31:44.288Z",
    "__v": 0,
    "total_quantity": 25,
    "total_sold": 0,
    "colors": [
      {
        "color": "Xanh dương",
        "image": "http://localhost:4000/images/4e587ab2-32d3-4b04-9255-e668a36ca426.webp",
        "new_price": 30490000,
        "old_price": 40990000,
        "quantity": 10,
        "sold": 0,
        "_id": "663ebbda8e549dae4c66b46d"
      },
      {
        "color": "Kem",
        "image": "http://localhost:4000/images/00ef2db0-bbcb-436a-bd63-f5f9b79d7b9c.webp",
        "new_price": 30490000,
        "old_price": 40990000,
        "quantity": 10,
        "sold": 0,
        "_id": "663ebbda8e549dae4c66b46e"
      },
      {
        "color": "Đen",
        "image": "http://localhost:4000/images/d0b20456-0567-4cee-a77d-b03f7b7ade11.webp",
        "new_price": 30490000,
        "old_price": 40990000,
        "quantity": 5,
        "sold": 0,
        "_id": "663ebbda8e549dae4c66b46f"
      }
    ],
    "variants": [
      
    ]
  },
  {
    "_id": "6629250afad211e5a98e602b",
    "id": 11,
    "name": "iPhone 11 64GB | Chính hãng VN/A",
    "images": [
      "http://localhost:4000/images/be1fcaca-4b8d-4f2b-87a3-1c97cd06bb32.webp",
      "http://localhost:4000/images/857aaa47-d72f-4ffc-8364-35034ad16b30.webp",
      "http://localhost:4000/images/a48c999e-37de-4f83-9afa-9edaccc8af2a.webp",
      "http://localhost:4000/images/98ffded3-dbc9-455e-8893-49be4dd392db.webp",
      "http://localhost:4000/images/ed217654-acd2-40f9-8cee-d9506887836c.webp",
      "http://localhost:4000/images/2c80b7b0-8bd6-4f65-aa97-2154bbb271f1.webp"
    ],
    "category": "Mobile",
    "brand": "Apple",
    "new_price": 8690000,
    "old_price": 11990000,
    "description": "Mới, đầy đủ phụ kiện từ nhà sản xuất\nHộp, Sách hướng dẫn, Cây lấy sim, Cáp Lightning - Type C\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple\nGiá sản phẩm đã bao gồm VAT",
    "label": "popular",
    "date": "2024-04-24T15:28:10.195Z",
    "__v": 0,
    "total_quantity": 13,
    "total_sold": 0,
    "colors": [
      {
        "color": "Đen",
        "image": "http://localhost:4000/images/c017fb56-6285-4768-bdcf-13b7937099e0.webp",
        "new_price": 8690000,
        "old_price": 11990000,
        "quantity": 5,
        "sold": 0,
        "_id": "663ebb048e549dae4c66b422"
      },
      {
        "color": "Trắng",
        "image": "http://localhost:4000/images/e99af08d-f389-477a-b47d-572d8eb6e5c5.webp",
        "new_price": 8690000,
        "old_price": 11990000,
        "quantity": 8,
        "sold": 0,
        "_id": "663ebb048e549dae4c66b423"
      }
    ],
    "variants": [
      
    ]
  }
]

function Popular({ category }) {
  const [popularProducts, setPopularProducts] = useState([]);
  const [title, setTitle] = useState("");
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const elementRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);

  useEffect(() => {
    // axios
    //   .get(`https://e-commerce-group9-2024-1.onrender.com/product/popular/${category}`)
    //   .then((res) => setPopularProducts(res.data));
    setPopularProducts(data);
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
