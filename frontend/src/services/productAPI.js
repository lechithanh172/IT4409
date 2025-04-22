// src/services/productAPI.js
import { fetchData } from './api';

/**
 * Lấy danh sách sản phẩm theo category
 * @param {string} categoryName Tên category (ví dụ: 'Smartphone', 'Laptop')
 * @returns {Promise<Array<object>>} Promise chứa mảng sản phẩm
 */
export const fetchProductsByCategory = async (categoryName) => {
  if (!categoryName) {
    throw new Error('Tên category là bắt buộc');
  }
  // Mã hóa categoryName để đảm bảo URL hợp lệ nếu tên chứa ký tự đặc biệt hoặc khoảng trắng
  const encodedCategoryName = encodeURIComponent(categoryName);
  const endpoint = `/product/category=${encodedCategoryName}`;
  try {
    const products = await fetchData(endpoint);
    // API có thể trả về null hoặc không phải mảng, cần kiểm tra
    return Array.isArray(products) ? products : [];
  } catch (error) {
     console.error(`Lỗi khi lấy sản phẩm cho category "${categoryName}":`, error);
     // Trả về mảng rỗng hoặc re-throw lỗi tùy logic xử lý mong muốn
     return []; // Trả về mảng rỗng để tránh crash UI
     // Hoặc: throw error; // Nếu muốn Context bắt lỗi này
  }
};

/**
 * Lấy chi tiết một sản phẩm theo ID (Ví dụ thêm)
 * Cần biết endpoint chính xác cho việc này
 * @param {string|number} productId ID của sản phẩm
 * @returns {Promise<object|null>} Promise chứa object sản phẩm hoặc null nếu không tìm thấy
 */
// export const fetchProductById = async (productId) => {
//   if (!productId) {
//     throw new Error('Product ID là bắt buộc');
//   }
//   const endpoint = `/product/${productId}`; // Giả sử endpoint là /product/{id}
//   try {
//       const product = await fetchData(endpoint);
//       return product;
//   } catch (error) {
//       if (error.message.includes('404')) { // Ví dụ kiểm tra lỗi 404
//            console.warn(`Sản phẩm với ID "${productId}" không tìm thấy.`);
//            return null;
//       }
//       console.error(`Lỗi khi lấy chi tiết sản phẩm ID "${productId}":`, error);
//       throw error; // Re-throw các lỗi khác
//   }
// };

// Thêm các hàm gọi API sản phẩm khác nếu cần (search, filter,...)