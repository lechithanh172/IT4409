import React, { useEffect, useRef, useState } from "react";
import styles from "./ListItem.module.css";
import ProductCard from "../../Components/ProductCard/ProductCard.jsx";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";


// const data = [
//     {
//       productName: "iPhone 16e 128GB | Chính hãng VN/A",
//       description: "iPhone 16e được trang bị chip xử lý Apple A18 mạnh mẽ, mang đến khả năng xử lý mượt mà mọi tác vụ hàng ngày, từ công việc đến giải trí.",
//       weight: 1,
//       price: 16990000,
//       supportRushOrder: true,
//       brandId: 1,
//       categoryId: 3,
//       variants: [
//         {
//           color: "Trắng",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16e-128gb_1__1.png",
//           stockQuantity: 10,
//           discount: 10
//         },
//         {
//           color: "Đen",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16e-128gb_1_1.png",
//           stockQuantity: 29,
//           discount: 8
//         }
//       ]
//     },
//     {
//       productName: "iPhone 15 Pro Max 512GB | Chính hãng VN/A",
//       description: "Thiết kế khung viền từ titan chuẩn hàng không vũ trụ - Cực nhẹ, bền cùng viền cạnh mỏng cầm nắm thoải mái",
//       weight: 1,
//       price: 40990000,
//       supportRushOrder: true,
//       brandId: 1,
//       categoryId: 3,
//       variants: [
//         {
//           color: "Titan Tự Nhiên",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-512gb-titan-nau.jpg",
//           stockQuantity: 20,
//           discount: 8
//         },
//         {
//           color: "Titan Đen",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-512gb-titan-den.jpg",
//           stockQuantity: 13,
//           discount: 9
//         },
//         {
//           color: "Titan Xanh",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-512gb-titan-xanh.jpg",
//           stockQuantity: 30,
//           discount: 10
//         }
//       ]
//     },
//     {
//       productName: "Samsung Galaxy Z Flip6 12GB 256GB",
//       description: "Chip Snapdragon 8 Gen 3 8 nhân mang đến hiệu năng mạnh mẽ, cho phép bạn xử lý các tác vụ hàng ngày một cách mượt mà.",
//       weight: 1,
//       price: 28990000,
//       supportRushOrder: true,
//       brandId: 2,
//       categoryId: 3,
//       variants: [
//         {
//           color: "Đen",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/f/l/fliip-6-den_4__1.png",
//           stockQuantity: 10,
//           discount: 10
//         },
//         {
//           color: "Xám",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/f/l/flip-den.jpg",
//           stockQuantity: 15,
//           discount: 8
//         },
//         {
//           color: "Vàng",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/f/l/flip-vang.jpg",
//           stockQuantity: 30,
//           discount: 12
//         },
//         {
//           color: "Xanh dương",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/f/l/flip-xanh.jpg",
//           stockQuantity: 20,
//           discount: 13
//         }
//       ]
//     },
//     {
//       productName: "Samsung Galaxy S25 Ultra 12GB 256GB",
//       description: "Chuẩn IP68 trên Samsung S25 Ultra 5G – Chống nước, chống bụi, thiết kế cao cấp, sang trọng.",
//       weight: 1,
//       price: 39990000,
//       supportRushOrder: true,
//       brandId: 2,
//       categoryId: 3,
//       variants: [
//         {
//           color: "Trắng",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_5.png",
//           stockQuantity: 22,
//           discount: 12
//         },
//         {
//           color: "Xanh dương",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_2__6.png",
//           stockQuantity: 12,
//           discount: 10
//         },
//         {
//           color: "Đen",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_3__6.png",
//           stockQuantity: 26,
//           discount: 14
//         },
//         {
//           color: "Xám",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_1__6.png",
//           stockQuantity: 22,
//           discount: 15
//         }
//       ]
//     },
//     {
//       productName: "Xiaomi Redmi Note 14 6GB 128GB",
//       description: "Redmi Note 14 5G sở hữu camera AI 108MP kết hợp với zoom trong cảm biến 3x, cho ra những bức ảnh sắc nét, chi tiết dù chụp chủ thể ở xa hay cận cảnh phức tạp.",
//       weight: 1,
//       price: 4990000,
//       supportRushOrder: true,
//       brandId: 9,
//       categoryId: 3,
//       variants: [
//         {
//           color: "Xanh lá",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-xiaomi-redmi-note-14_1__2.png",
//           stockQuantity: 34,
//           discount: 12
//         },
//         {
//           color: "Đen",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-xiaomi-redmi-note-14_1.png",
//           stockQuantity: 26,
//           discount: 10
//         },
//         {
//           color: "Tím",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-xiaomi-redmi-note-14.1.png",
//           stockQuantity: 30,
//           discount: 15
//         }
//       ]
//     },
//     {
//       productName: "Xiaomi 14 12GB 256GB",
//       description: "Mạnh mẽ cân mọi tác vụ, đa nhiệm cực đỉnh - Chip Snapdragon 8 Gen 3 (4nm) mượt mà đi kèm RAM 12GB",
//       weight: 1,
//       price: 22990000,
//       supportRushOrder: true,
//       brandId: 9,
//       categoryId: 3,
//       variants: [
//         {
//           color: "Xanh",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/x/i/xiaomi-14-pre-xanh-la_1.png",
//           stockQuantity: 36,
//           discount: 9
//         },
//         {
//           color: "Trắng",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/x/i/xiaomi-14-pre-trang_1.png",
//           stockQuantity: 32,
//           discount: 10
//         },
//         {
//           color: "Đen",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/x/i/xiaomi-14-pre-den_1.png",
//           stockQuantity: 25,
//           discount: 9
//         }
//       ]
//     },
//     {
//       productName: "TECNO SPARK 30 Pro 8GB 256GB Transformer",
//       description: "Với chip MediaTek Helio G100, Tecno Spark 30 Pro được thiết kế để mang lại hiệu năng vượt trội, đáp ứng mọi nhu cầu sử dụng hàng ngày của bạn.",
//       weight: 1,
//       price: 5290000,
//       supportRushOrder: true,
//       brandId: 11,
//       categoryId: 3,
//       variants: [
//         {
//           color: "Đen",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2025-01-10_08-54-30.jpg",
//           stockQuantity: 10,
//           discount: 6
//         },
//         {
//           color: "Đỏ",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2025-01-10_08-54-33.jpg",
//           stockQuantity: 5,
//           discount: 4
//         }
//       ]
//     },
//     {
//       productName: "Tecno Pova 6 8GB 256GB",
//       description: "Màn hình 6.78 inch cho không gian rộng rãi để xem phim, chơi game và đọc sách.",
//       weight: 1,
//       price: 6490000,
//       supportRushOrder: true,
//       brandId: 11,
//       categoryId: 3,
//       variants: [
//         {
//           color: "Xám",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2024-07-25_11-39-16.jpg",
//           stockQuantity: 15,
//           discount: 10
//         },
//         {
//           color: "Xanh lá",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2024-07-25_11-40-46.jpg",
//           stockQuantity: 15,
//           discount: 12
//         }
//       ]
//     },
//     {
//       productName: "Apple MacBook Air M2 2024 8CPU 8GPU 16GB 256GB",
//       description: "Thiết kế sang trọng, lịch lãm - siêu mỏng 11.3mm, chỉ 1.24kg",
//       weight: 1,
//       price: 24990000,
//       supportRushOrder: true,
//       brandId: 12,
//       categoryId: 1,
//       variants: [
//         {
//           color: "Bạc",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_air_m2_2_1_1_7.png",
//           stockQuantity: 42,
//           discount: 12
//         },
//         {
//           color: "Đen",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_air_m2_1_1_1_8.png",
//           stockQuantity: 26,
//           discount: 10
//         },
//         {
//           color: "Vàng",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_air_m2_3_1_1_6.png",
//           stockQuantity: 24,
//           discount: 9
//         }
//       ]
//     },
//     {
//       productName: "MacBook Pro 14 M4 10CPU 10GPU 16GB 512GB",
//       description: "Cung cấp hiệu năng mạnh mẽ với 10 nhân CPU và 10 nhân GPU, đáp ứng tốt nhu cầu công việc hàng ngày và các tác vụ sáng tạo cơ bản.",
//       weight: 1,
//       price: 39990000,
//       supportRushOrder: true,
//       brandId: 12,
//       categoryId: 1,
//       variants: [
//         {
//           color: "Đen",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_pro_14-inch_m4_chip_space_black_pdp_image_position_1__vn-vi.jpg",
//           stockQuantity: 7,
//           discount: 0
//         },
//         {
//           color: "Bạc",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_pro_14-inch_m4_chip_silver_pdp_image_position_1__vn-vi.jpg",
//           stockQuantity: 15,
//           discount: 2
//         }
//       ]
//     },
//     {
//       productName: "Laptop ASUS Gaming VivoBook K3605ZF-RP634W",
//       description: "Trang bị CPU Intel Core i5-12500H và card đồ họa NVIDIA GeForce RTX 2050, laptop mang đến trải nghiệm gaming mượt mà trên các tựa game phổ biến.",
//       weight: 1,
//       price: 20990000,
//       supportRushOrder: true,
//       brandId: 6,
//       categoryId: 1,
//       variants: [
//         {
//           color: "Đen",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/t/e/text_ng_n_9_72.png",
//           stockQuantity: 26,
//           discount: 19
//         }
//       ]
//     },
//     {
//       productName: "Laptop ASUS TUF Gaming F15 FX507ZC4-HN074W",
//       description: "CPU Intel Core i5 12500H dễ dàng xử lý các tác vụ nặng và chơi game AAA cấu hình cao",
//       weight: 1,
//       price: 25990000,
//       supportRushOrder: true,
//       brandId: 6,
//       categoryId: 1,
//       variants: [
//         {
//           color: "Xám",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/t/e/text_ng_n_2__3_25.png",
//           stockQuantity: 36,
//           discount: 16
//         },
//         {
//           color: "Bạc",
//           imageUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_8__1_89.png",
//           stockQuantity: 26,
//           discount: 13
//         }
//       ]
//     },
//     {
//       productName: "Tai nghe Bluetooth Apple AirPods 4",
//       description: "Chip H2 nổi bật, mạnh mẽ được tích hợp trong Airpod 4 giúp trải nghiệm âm thanh của bạn mượt mà hơn.",
//       weight: 1,
//       price: 3190000,
//       supportRushOrder: true,
//       brandId: 13,
//       categoryId: 8,
//       variants: [
//         {
//           color: "Trắng",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/t/e/text_ng_n_-_2024-09-10t082905.078_2.png",
//           stockQuantity: 30,
//           discount: 5
//         }
//       ]
//     },
//     {
//       productName: "Tai nghe Bluetooth chụp tai Bose QuietComfort",
//       description: "Chống ồn chủ động giúp loại bỏ tiếng ồn hiệu quả, cho bạn tập trung mà không bị phân tâm",
//       weight: 1,
//       price: 7490000,
//       supportRushOrder: true,
//       brandId: 14,
//       categoryId: 8,
//       variants: [
//         {
//           color: "Xanh đá",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2024-11-05_15-29-02.jpg",
//           stockQuantity: 39,
//           discount: 9
//         },
//         {
//           color: "Sa thạch",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2024-11-05_15-27-42.jpg",
//           stockQuantity: 20,
//           discount: 8
//         },
//         {
//           color: "Trắng",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/t/a/tai-nghe-chup-tai-bose-quietcomfort-_13__1.png",
//           stockQuantity: 15,
//           discount: 6
//         }
//       ]
//     },
//     {
//       productName: "Bàn phím Apple Magic Keyboard 2 Kèm Phím Số Trắng",
//       description: "Kết nối đa dạng: Hỗ trợ kết nối 2.4Ghz và Bluetooth, thuận tiện cho nhiều thiết bị.",
//       weight: 1,
//       price: 2990000,
//       supportRushOrder: true,
//       brandId: 1,
//       categoryId: 13,
//       variants: [
//         {
//           color: "Trắng",
//           imageUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/magic-keyboard-2-phim-so-1_1.jpg",
//           stockQuantity: 28,
//           discount: 6
//         }
//       ]
//     },
//     {
//       productName: "Bàn phím Bluetooth Logitech Pebble Key 2 K380S",
//       description: "Thiết kế mỏng nhẹ, chỉ có trọng lượng 415g, thuận tiện cầm theo bất cứ đâu",
//       weight: 1,
//       price: 1129000,
//       supportRushOrder: true,
//       brandId: 15,
//       categoryId: 13,
//       variants: [
//         {
//           color: "Trắng",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/b/a/ban-phim-bluetooth-logitech-pebble-k380s-6_1.png",
//           stockQuantity: 33,
//           discount: 9
//         },
//         {
//           color: "Hồng",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/b/a/ban-phim-bluetooth-logitech-pebble-k380s-2_1.png",
//           stockQuantity: 25,
//           discount: 12
//         },
//         {
//           color: "Đen",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/b/a/ban-phim-bluetooth-logitech-pebble-k380s-8_1.png",
//           stockQuantity: 29,
//           discount: 10
//         }
//       ]
//     },
//     {
//       productName: "Chuột không dây Logitech Signature M650 Size L",
//       description: "Tính năng cuộn SMARTWHEEL đạt độ chính xác đến từng dòng",
//       weight: 1,
//       price: 890000,
//       supportRushOrder: true,
//       brandId: 15,
//       categoryId: 14,
//       variants: [
//         {
//           color: "Trắng",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/c/h/chuot-khong-day-logitech-signature-m650-1_3.jpg",
//           stockQuantity: 58,
//           discount: 16
//         },
//         {
//           color: "Đen",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/c/h/chuot-khong-day-logitech-signature-m650-2_3.jpg",
//           stockQuantity: 45,
//           discount: 18
//         },
//         {
//           color: "Hồng nhạt",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/c/h/chuot-khong-day-logitech-signature-m650-6_3.jpg",
//           stockQuantity: 38,
//           discount: 15
//         }
//       ]
//     },
//     {
//       productName: "Chuột Apple Magic Mouse 3 2024 (MXK53)",
//       description: "Magic Mouse không dây với pin sạc bền bỉ, sử dụng hơn một tháng sau mỗi lần sạc.",
//       weight: 1,
//       price: 2290000,
//       supportRushOrder: true,
//       brandId: 1,
//       categoryId: 14,
//       variants: [
//         {
//           color: "Trắng",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/c/h/chuot-apple-magic-mouse-3_3__1.png",
//           stockQuantity: 26,
//           discount: 22
//         }
//       ]
//     },
//     {
//       productName: "Thẻ nhớ Samsung Evo Plus (SD Adapter) 160MBS 64GB",
//       description: "Thẻ nhớ Samsung Evo Plus (SD Adapter) 160MBS 64GB sở hữu tốc độ đọc lên đến 160 MB/s, đồng thời hỗ trợ quay phim và chụp ảnh lên đến 4K UHD sắc nét. Dung lượng lưu trữ 64GB cho phép thẻ nhớ Samsung Evo Plus có thể lưu trữ hàng chục ngàn bức ảnh.",
//       weight: 1,
//       price: 259000,
//       supportRushOrder: true,
//       brandId: 2,
//       categoryId: 4,
//       variants: [
//         {
//           color: "Trắng",
//           imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/t/h/the-nho-samsung-evo-plus-sd-adapter-160mbs-64gb_7__1.png",
//           stockQuantity: 89,
//           discount: 27
//         }
//       ]
//     },
//     {
//       productName: "Thẻ nhớ Samsung Evo Plus 64GB 130MB/s",
//       description: "Thẻ nhớ Samsung Evo Plus 64GB 130Mps cho phép người dùng lưu trữ nhiều hơn trên đa thiết bị. Với tốc độ nhanh chóng 130Mps nhờ đó thẻ nhớ đem đến hiệu suất truyền tải đáng tin cậy và độ an toàn cao từ 6 lớp bảo vệ.",
//       weight: 1,
//       price: 359000,
//       supportRushOrder: true,
//       brandId: 2,
//       categoryId: 4,
//       variants: [
//         {
//           color: "Trắng",
//           imageUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/h/the-nho-samsung-evo-plus-64-gb-130mps.png",
//           stockQuantity: 123,
//           discount: 12
//         }
//       ]
//     },
//     {
//       productName: "Thẻ nhớ Micro SDXC Sandisk Extreme Pro V30 A2 200MB/S 128GB",
//       description: "Thẻ nhớ Micro SDXC Sandisk Extreme V30 A2 200MB/S 128GB được thiết kế chất lượng cao, bền bỉ, bảo vệ những tài liệu được lưu trữ một cách tốt nhất. Với dung lượng lưu trữ lên đến 128GB cùng tốc độ đọc/ ghi dữ liệu cực nhanh, chiếc thẻ nhớ này sẽ là phụ kiện cần thiết cho nhiều người dùng.",
//       weight: 1,
//       price: 699000,
//       supportRushOrder: true,
//       brandId: 16,
//       categoryId: 4,
//       variants: [
//         {
//           color: "Đen/Đỏ",
//           imageUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/h/the-nho-micro-sdxc-sandisk-extreme-pro-v30-a2-128gb-200mbs.png",
//           stockQuantity: 86,
//           discount: 10
//         }
//       ]
//     },
//     {
//       productName: "Thẻ nhớ SDHC SanDisk Extreme Pro U3 64GB V30 200MB/s",
//       description: "Thẻ nhớ SDHC Sandisk Extreme Pro U3 64GB V30 200MB/s phù hợp với những dòng máy ảnh DSLR khi có thể hỗ trợ quay chụp với chất lượng đến 4K. Với tốc độ đọc và ghi vượt trội, sản phẩm thẻ nhớ cũng có khả năng truy xuất dữ liệu nhanh chóng và hỗ trợ các chế độ chụp liên tiếp.",
//       weight: 1,
//       price: 590000,
//       supportRushOrder: true,
//       brandId: 16,
//       categoryId: 4,
//       variants: [
//         {
//           color: "Đen",
//           imageUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/h/the-nho-sdhc-sandisk-extreme-pro-u3-64gb-v30-200mbs.png",
//           stockQuantity: 69,
//           discount: 13
//         }
//       ]
//     },
//     {
//       productName: "Google Tivi OLED Sony 4K 48 inch XR-48A90K",
//       description: "Nâng tầm hình ảnh và âm thanh với bộ xử lý Cognitive Processor XR™.",
//       weight: 1,
//       price: 41890000,
//       supportRushOrder: true,
//       brandId: 10,
//       categoryId: 16,
//       variants: [
//         {
//           color: "48 inch",
//           imageUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/o/google-tivi-oled-sony-xr-48a90k-4k-48-inch_4_.png",
//           stockQuantity: 25,
//           discount: 23
//         }
//       ]
//     },
//     {
//       productName: "Google Tivi OLED Sony 4K 65 inch XR-65A95L",
//       description: "Bộ xử lý Cognitive Processor XR mang đến hình ảnh có độ tương phản tối ưu và sắc màu phong phú.",
//       weight: 1,
//       price: 92100000,
//       supportRushOrder: true,
//       brandId: 10,
//       categoryId: 16,
//       variants: [
//         {
//           color: "65 inch",
//           imageUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/o/google-tivi-oled-sony-xr-65a95l-4k-65-inch_9_.png",
//           stockQuantity: 36,
//           discount: 24
//         }
//       ]
//     },
//     {
//       productName: "Smart Tivi LG 4K 65 inch LED 2024 (65UT7350)",
//       description: "Độ phân giải 4K cho hình ảnh sắc nét, chi tiết gấp 4 lần Full HD.",
//       weight: 1,
//       price: 16900000,
//       supportRushOrder: true,
//       brandId: 17,
//       categoryId: 16,
//       variants: [
//         {
//           color: "65 inch",
//           imageUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/m/smart-tivi-lg-oled-evo-97g4psa-4k-91-inch-2024_13__1.png",
//           stockQuantity: 65,
//           discount: 25
//         }
//       ]
//     },
//     {
//       productName: "Smart Tivi NanoCell LG 4K 55 inch 55NANO76SQA",
//       description: "Màn hình 55 inch cùng thiết kế thanh mảnh, tinh tế, phù hợp cho cả phòng ngủ, phòng họp nhỏ, phòng khách sạn,...",
//       weight: 1,
//       price: 22900000,
//       supportRushOrder: true,
//       brandId: 17,
//       categoryId: 16,
//       variants: [
//         {
//           color: "55 inch",
//           imageUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/o/google-tivi-oled-sony-xr-65a95l-4k-65-inch_9_.png",
//           stockQuantity: 68,
//           discount: 35
//         }
//       ]
//     },
//     {
//       productName: "Google Tivi TCL UHD 4K 65 inch 2024 (65P79B) Pro",
//       description: "Màn hình 65 inch mỏng nhẹ, thiết kế nguyên khối sang trọng.",
//       weight: 1,
//       price: 15490000,
//       supportRushOrder: true,
//       brandId: 18,
//       categoryId: 16,
//       variants: [
//         {
//           color: "65 inch",
//           imageUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/2/_/2_690_13_1.png",
//           stockQuantity: 66,
//           discount: 26
//         }
//       ]
//     },
//     {
//       productName: "Tivi Xiaomi A Pro 4K 65 inch QLED 2025",
//       description: "Màn hình QLED 4K với 1.07 tỷ màu cho hình ảnh sắc nét, màu sắc rực rỡ và độ tương phản cao, mang đến trải nghiệm xem phim, chơi game và xem thể thao tuyệt vời.",
//       weight: 1,
//       price: 19990000,
//       supportRushOrder: true,
//       brandId: 9,
//       categoryId: 16,
//       variants: [
//         {
//           color: "65 inch",
//           imageUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/i/tivi-xiaomi-qled-a-pro-43-inch-4k-2025_1_1.png",
//           stockQuantity: 35,
//           discount: 28
//         }
//       ]
//     }
// ];
 
const data = [
{
  productId: 1,
  productName: "iPhone 16e 128GB | Chính hãng VN/A",
  description: "Máy mới 100% , chính hãng Apple Việt Nam.\nCellphoneS hiện là đại lý bán lẻ uỷ quyền iPhone chính hãng VN/A của Apple Việt Nam\niPhone 16e 128GB sử dụng iOS 18\nCáp Sạc USB-C (1m)\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
  price: 16990000,
  imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16e-128gb_1__1.png",
  stockQuantity: 10,
  categoryId: 3,
  brandId: 1
},
{
  productId: 2,
  productName: "iPhone 15 Pro Max 512GB | Chính hãng VN/A",
  description: "Máy mới 100% , chính hãng Apple Việt Nam.\nCellphoneS hiện là đại lý bán lẻ uỷ quyền iPhone chính hãng VN/A của Apple Việt Nam\nHộp, Sách hướng dẫn, Cây lấy sim, Cáp Type C\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nXem thông tin kích hoạt bảo hành các sản phẩm Apple (tại đây)\nGiá sản phẩm đã bao gồm VAT",
  price: 40990000,
  imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-512gb-titan-nau.jpg",
  stockQuantity: 13,
  categoryId: 3,
  brandId: 1
},
{
  productId: 3,
  productName: "Samsung Galaxy Z Flip6 12GB 256GB",
  description: "Mới, đầy đủ phụ kiện từ nhà sản xuất\nBảo hành 12 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
  price: 28990000,
  imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/f/l/fliip-6-den_4__1.png",
  stockQuantity: 10,
  categoryId: 3,
  brandId: 2
},
{
  productId: 4,
  productName: "Samsung Galaxy S25 Ultra 12GB 256GB",
  description: "Mới, đầy đủ phụ kiện từ nhà sản xuất\nĐiện thoại Samsung Galaxy S25 Ultra 5G 12GB 256GB\nBảo hành 12 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
  price: 39990000,
  imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_5.png",
  stockQuantity: 22,
  categoryId: 3,
  brandId: 2
},
{
  productId: 5,
  productName: "Xiaomi Redmi Note 14 6GB 128GB",
  description: "Mới, đầy đủ phụ kiện từ nhà sản xuất\nRedmi Note 14, Cáp USB Type C, Củ sạc 33W, Dụng cụ lấy SIM, Sách hướng dẫn,...\nBảo hành 18 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
  price: 4990000,
  imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/d/i/dien-thoai-xiaomi-redmi-note-14_1__2.png",
  stockQuantity: 34,
  categoryId: 3,
  brandId: 9
},
{
  productId: 6,
  productName: "Xiaomi 14 12GB 256GB",
  description: "Mới, đầy đủ phụ kiện từ nhà sản xuất\nMáy, sạc, Cáp USB Type-C, Dụng cụ lấy SIM, Ốp, Hướng dẫn sử dụng nhanh\nBảo hành 24 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
  price: 22990000,
  imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/x/i/xiaomi-14-pre-xanh-la_1.png",
  stockQuantity: 36,
  categoryId: 3,
  brandId: 9
},
{
  productId: 7,
  productName: "TECNO SPARK 30 Pro 8GB 256GB Transformer",
  description: "Mới, đầy đủ phụ kiện từ nhà sản xuất\nMáy, Củ cáp, Cáp sạc, Ốp lưng\nBảo hành 13 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
  price: 5290000,
  imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2025-01-10_08-54-30.jpg",
  stockQuantity: 10,
  categoryId: 3,
  brandId: 10
},
{
  productId: 8,
  productName: "Tecno Pova 6 8GB 256GB",
  description: "Mới, đầy đủ phụ kiện từ nhà sản xuất\nBảo hành 13 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. (xem chi tiết)\nGiá sản phẩm đã bao gồm VAT",
  price: 6490000,
  imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/p/h/photo_2024-07-25_11-39-16.jpg",
  stockQuantity: 15,
  categoryId: 3,
  brandId: 10
},
{
  productId: 9,
  productName: "Apple MacBook Air M2 2024 8CPU 8GPU 16GB 256GB",
  description: "Máy mới 100%, đầy đủ phụ kiện từ nhà sản xuất. Sản phẩm có mã SA/A (được Apple Việt Nam phân phối chính thức).\nMáy, Sách HDSD, Cáp sạc USB-C (2 m), Cốc sạc USB-C 30W\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nXem thông tin kích hoạt bảo hành các sản phẩm Apple (tại đây)\nGiá sản phẩm đã bao gồm VAT",
  price: 24990000,
  imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_air_m2_2_1_1_7.png",
  stockQuantity: 42,
  categoryId: 1,
  brandId: 1
},
{
productId: 10,
productName: "Apple MacBook Air M2 2024 8CPU 8GPU 16GB 256GB",
description: "Máy mới 100%, đầy đủ phụ kiện từ nhà sản xuất. Sản phẩm có mã SA/A (được Apple Việt Nam phân phối chính thức).\nMáy, Sách HDSD, Cáp sạc USB-C (2 m), Cốc sạc USB-C 30W\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nXem thông tin kích hoạt bảo hành các sản phẩm Apple (tại đây)\nGiá sản phẩm đã bao gồm VAT",
price: 24990000,
imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_air_m2_2_1_1_7.png",
stockQuantity: 42,
categoryId: 1,
brandId: 1
},
{
productId: 11,
productName: "Apple MacBook Air M2 2024 8CPU 8GPU 16GB 256GB",
description: "Máy mới 100%, đầy đủ phụ kiện từ nhà sản xuất. Sản phẩm có mã SA/A (được Apple Việt Nam phân phối chính thức).\nMáy, Sách HDSD, Cáp sạc USB-C (2 m), Cốc sạc USB-C 30W\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nXem thông tin kích hoạt bảo hành các sản phẩm Apple (tại đây)\nGiá sản phẩm đã bao gồm VAT",
price: 24990000,
imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_air_m2_2_1_1_7.png",
stockQuantity: 42,
categoryId: 1,
brandId: 1
},
{
productId: 12,
productName: "Apple MacBook Air M2 2024 8CPU 8GPU 16GB 256GB",
description: "Máy mới 100%, đầy đủ phụ kiện từ nhà sản xuất. Sản phẩm có mã SA/A (được Apple Việt Nam phân phối chính thức).\nMáy, Sách HDSD, Cáp sạc USB-C (2 m), Cốc sạc USB-C 30W\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nXem thông tin kích hoạt bảo hành các sản phẩm Apple (tại đây)\nGiá sản phẩm đã bao gồm VAT",
price: 24990000,
imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_air_m2_2_1_1_7.png",
stockQuantity: 42,
categoryId: 1,
brandId: 1
},
{
productId: 13,
productName: "Apple MacBook Air M2 2024 8CPU 8GPU 16GB 256GB",
description: "Máy mới 100%, đầy đủ phụ kiện từ nhà sản xuất. Sản phẩm có mã SA/A (được Apple Việt Nam phân phối chính thức).\nMáy, Sách HDSD, Cáp sạc USB-C (2 m), Cốc sạc USB-C 30W\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nXem thông tin kích hoạt bảo hành các sản phẩm Apple (tại đây)\nGiá sản phẩm đã bao gồm VAT",
price: 24990000,
imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_air_m2_2_1_1_7.png",
stockQuantity: 42,
categoryId: 1,
brandId: 1
},
{
productId: 13,
productName: "Apple MacBook Air M2 2024 8CPU 8GPU 16GB 256GB",
description: "Máy mới 100%, đầy đủ phụ kiện từ nhà sản xuất. Sản phẩm có mã SA/A (được Apple Việt Nam phân phối chính thức).\nMáy, Sách HDSD, Cáp sạc USB-C (2 m), Cốc sạc USB-C 30W\n1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple: CareS.vn(xem chi tiết)\nXem thông tin kích hoạt bảo hành các sản phẩm Apple (tại đây)\nGiá sản phẩm đã bao gồm VAT",
price: 24990000,
imageUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/m/a/macbook_air_m2_2_1_1_7.png",
stockQuantity: 42,
categoryId: 1,
brandId: 1
}
];

const Brands = [
    { brandId: 1, name: "Apple", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_59.png" },
    { brandId: 2, name: "Samsung", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_60.png" },
    { brandId: 3, name: "Dell", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Dell.png" },
    { brandId: 4, name: "HP", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/HP.png" },
    { brandId: 5, name: "Lenovo", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Lenovo.png" },
    { brandId: 6, name: "Asus", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/Asus.png" },
    { brandId: 7, name: "MSI", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/MSI.png" },
    { brandId: 8, name: "Acer", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/acer.png" },
    { brandId: 9, name: "Xiaomi", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_61.png" },
    { brandId: 10, name: "Sony", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/f/r/frame_87.png" },
    { brandId: 11, name: "Tecno", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_69_1_.png" },
    { brandId: 12, name: "Macbook", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/wysiwyg/Icon/brand_logo/macbook.png" },
    { brandId: 13, name: "AirPods", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/b/r/brand-icon-airpods.png" },
    { brandId: 14, name: "Bose", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/catalog/product/b/r/brand-icon-bose.png" },
    { brandId: 15, name: "Logitech", logoUrl: "https://cellphones.com.vn/media/icons/brands/brand-248.svg" },
    { brandId: 16, name: "SanDisk", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/a/b/abcde_24_.png" },
    { brandId: 17, name: "LG", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_84_1_.png" },
    { brandId: 18, name: "TCL", logoUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/t/i/tivi-logo-cate.png" }
];
  
const Category = [
    { categoryId: 1, name: "Laptop", description: "Portable personal computers" },
    { categoryId: 2, name: "Tablet", description: "Touchscreen mobile devices" },
    { categoryId: 3, name: "Smartphone", description: "Mobile phones" },
    { categoryId: 4, name: "Accessory", description: "Computer accessories" },
    { categoryId: 5, name: "Monitor", description: "Display devices" },
    { categoryId: 6, name: "Printer", description: "Printing machines" },
    { categoryId: 7, name: "Router", description: "Network routers" },
    { categoryId: 8, name: "Speaker", description: "Audio output devices" },
    { categoryId: 9, name: "Camera", description: "Photography and video" },
    { categoryId: 10, name: "Smartwatch", description: "Wearable smart devices" },
    { categoryId: 13, name: "bàn phím", description: "Keyboards" },
    { categoryId: 14, name: "chuột", description: "Mice" },
    { categoryId: 16, name: "tv", description: "Televisions" }
];

  function ListItem({ category }) {
        const [popularProducts, setPopularProducts] = useState([]);
        const [categoryId, setCategoryId] = useState();
        const [title, setTitle] = useState("");
        const [index, setIndex] = useState(0);
        const [offset, setOffset] = useState(0);
        const [width, setWidth] = useState(0);
        const [maxIndex, setMaxIndex] = useState(0);
        const elementRef = useRef(null);
        
        
        

        useEffect(() => {
            const fetchData = () => {
                try {
                    const products = data;

                    // Thiết lập categoryId
                    let id;
                    switch (category) {
                        case "Smartphone":
                            id = 3;
                            break;
                        case "Laptop":
                            id = 1;
                            break;
                        case "Tablet":
                            id = 2;
                            break;
                        case "Accessory":
                            id = 4;
                            break;
                        case "Monitor":
                            id = 5;
                            break;
                        case "Printer":
                            id = 6;
                            break;
                        case "Router":
                            id = 7;
                            break;
                        case "Speaker":
                            id = 8;
                            break;
                        case "Camera":
                            id = 9;
                            break;
                        case "Smartwatch":
                            id = 10;
                            break;
                        default:
                            alert("404 Not Found");
                            return;
                    }
                    setCategoryId(id);

                    // Lọc sản phẩm ngay lập tức
                    const filteredProducts = products.filter(
                        (product) => product.categoryId === id
                    );
                    setPopularProducts(filteredProducts);

                    // Thiết lập tiêu đề
                    switch (id) {
                        case 1:
                            setTitle("LAPTOP");
                            break;
                        case 2:
                            setTitle("MÁY TÍNH BẢNG");
                            break;
                        case 3:
                            setTitle("ĐIỆN THOẠI");
                            break;
                        case 4:
                            setTitle("PHỤ KIỆN MÁY TÍNH");
                            break;
                        case 5:
                            setTitle("MÀN HÌNH");
                            break;
                        case 6:
                            setTitle("MÁY IN");
                            break;
                        case 7:
                            setTitle("THIẾT BỊ MẠNG");
                            break;
                        case 8:
                            setTitle("LOA ÂM THANH");
                            break;
                        case 9:
                            setTitle("MÁY ẢNH & CAMERA");
                            break;
                        case 10:
                            setTitle("ĐỒNG HỒ THÔNG MINH");
                            break;
                        default:
                            setTitle("TẤT CẢ SẢN PHẨM");
                            break;
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };

            fetchData();
        }, [category]);

        useEffect(() => {
            const handleOffset = () => {
              const element = elementRef.current;
              let containerWidth;
        
              if (window.innerWidth > 1200) {
                setOffset(index * 305);
                setMaxIndex(popularProducts.length - 4);
              } else if (window.innerWidth > 990) {
                setOffset(index * (width / 3 ));
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
            if (index < -maxIndex && index !== 0) {
                setIndex(0);
              }
            // if (index < -maxIndex) {
            // if (window.innerWidth > 1200) {
            //     setIndex(
            //     popularProducts.length > 4 ? -(popularProducts.length - 4) : 0
            //     );
            // } else if (window.innerWidth > 990) {
            //     setIndex(
            //     popularProducts.length > 3 ? -(popularProducts.length - 3) : 0
            //     );
            // } else if (window.innerWidth > 717) {
            //     setIndex(
            //     popularProducts.length > 3 ? -(popularProducts.length - 3) : 0
            //     );
            // } else {
            //     setIndex(
            //     popularProducts.length > 2 ? -(popularProducts.length - 2) : 0
            //     );
            // }
            // }
        }, [maxIndex, index]);
    return (
        <>
            {popularProducts.length > 0 && (
                <div className={styles.popular}>
                    <div className={styles.popularTitle}>
                    <Link to={`/product/category=${category}`} className={styles.title}>
                        <h2>{title} NỔI BẬT</h2>
                    </Link>
                    </div>
                    <div className={styles.productList}>
                        <div className={styles.productListSwipper}>
                            <div className={styles.swiperContainer} >
                                <div
                                    className={styles.productList}
                                    ref={elementRef}
                                    style={{
                                        transform: `translateX(${offset}px)`,
                                        transitionDuration: "300ms",
                                    }}
                                >
                                    {popularProducts.length > 0 ? (
                                        popularProducts.map((product) => (
                                        <div className={styles.listItem}><ProductCard key={product.productId} product={product} /></div>
                                        ))
                                    ) : (
                                        <p>Chưa có sản phẩm nổi bật.</p>
                                    )}
    
                                </div>
                                <div
                                    onClick={() => setIndex((prev) => prev + 1)}
                                    className={styles.swiperButtonPrev}
                                    style={index === 0 ? { display: "none" } : {}}
                                >
            
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </div>
                                <div
                                    onClick={() => setIndex((prev) => prev - 1)}
                                    className={styles.swiperButtonNext}
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

  export default ListItem;