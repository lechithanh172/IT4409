// src/contexts/ProductContext.jsx (phần mockProducts)

const mockProducts = [
    {
      id: 1,
      name: 'iPhone 15 Pro 256GB',
      category: 'Smartphone',
      description: 'Chip A17 Pro siêu mạnh, camera Pro đột phá, thiết kế Titan chuẩn hàng không vũ trụ, nút Action mới và cổng USB-C tiện lợi.',
      rating: 4.8, // Thêm rating
      reviewCount: 215, // Thêm số lượt đánh giá
      variants: [ // Sử dụng variants để quản lý màu sắc/options
        {
          sku: 'IP15P-256-BLK', // Mã định danh duy nhất cho biến thể
          colorName: 'Titan Đen',
          colorHex: '#464749', // Mã màu (tùy chọn)
          price: 28990000, // Giá VND
          oldPrice: 30990000, // Giá cũ (tùy chọn)
          stock: 15,
          images: [ // Nhiều ảnh cho mỗi màu
            '/images/products/iphone15pro/black_1.jpg', // Đường dẫn ảnh mẫu
            '/images/products/iphone15pro/black_2.jpg',
            '/images/products/iphone15pro/black_3.jpg',
          ],
          thumbnail: '/images/products/iphone15pro/thumb_black.jpg' // Ảnh nhỏ đại diện
        },
        {
          sku: 'IP15P-256-NAT',
          colorName: 'Titan Tự Nhiên',
          colorHex: '#BDB6AD',
          price: 28990000,
          oldPrice: 30990000,
          stock: 10,
          images: [
            '/images/products/iphone15pro/natural_1.jpg',
            '/images/products/iphone15pro/natural_2.jpg',
            '/images/products/iphone15pro/natural_3.jpg',
          ],
          thumbnail: '/images/products/iphone15pro/thumb_natural.jpg'
        },
         {
          sku: 'IP15P-256-BLU',
          colorName: 'Titan Xanh',
          colorHex: '#4A5464',
          price: 29190000, // Giá có thể khác nhau
          oldPrice: 30990000,
          stock: 8,
          images: [
            '/images/products/iphone15pro/blue_1.jpg',
            '/images/products/iphone15pro/blue_2.jpg',
            '/images/products/iphone15pro/blue_3.jpg',
          ],
          thumbnail: '/images/products/iphone15pro/thumb_blue.jpg'
        }
      ]
    },
    {
      id: 2,
      name: 'MacBook Air 13 inch M3 8GB/256GB',
      category: 'Laptop',
      description: 'Siêu mỏng nhẹ, hiệu năng M3 đáng kinh ngạc, thời lượng pin lên đến 18 giờ. Hoàn hảo cho công việc và giải trí mọi lúc mọi nơi.',
      rating: 4.9,
      reviewCount: 180,
      variants: [
        {
          sku: 'MBA-M3-13-256-SVR',
          colorName: 'Bạc (Silver)',
          colorHex: '#E3E4E6',
          price: 27990000,
          oldPrice: 28990000,
          stock: 20,
          images: [
            '/images/products/macbookair_m3/silver_1.jpg',
            '/images/products/macbookair_m3/silver_2.jpg',
            '/images/products/macbookair_m3/silver_3.jpg',
          ],
          thumbnail: '/images/products/macbookair_m3/thumb_silver.jpg'
        },
        {
          sku: 'MBA-M3-13-256-GRY',
          colorName: 'Xám (Space Gray)',
          colorHex: '#8A8A8D',
          price: 27990000,
          oldPrice: 28990000,
          stock: 18,
          images: [
            '/images/products/macbookair_m3/gray_1.jpg',
            '/images/products/macbookair_m3/gray_2.jpg',
            '/images/products/macbookair_m3/gray_3.jpg',
          ],
          thumbnail: '/images/products/macbookair_m3/thumb_gray.jpg'
        }
      ]
    },
    // Thêm sản phẩm khác...
  ];
  
  // Nhớ tạo thư mục public/images/products... và đặt ảnh mẫu vào đó
  // Hoặc thay thế bằng URL ảnh thật