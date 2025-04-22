// src/services/api.js

const BASE_URL = "http://3.27.90.134:8080"; // Địa chỉ API của bạn

/**
 * Hàm fetch dữ liệu cơ bản từ API
 * @param {string} endpoint Đường dẫn API (ví dụ: '/product/category/Smartphone')
 * @param {object} options Tùy chọn cho fetch (method, headers, body,...)
 * @returns {Promise<any>} Promise chứa dữ liệu JSON trả về
 * @throws {Error} Nếu request không thành công hoặc có lỗi mạng
 */
export const fetchData = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options, // Bao gồm các options mặc định hoặc được truyền vào
      headers: {
        'Content-Type': 'application/json', // Mặc định là JSON
        ...options.headers, // Ghi đè headers nếu cần
      },
    });

    if (!response.ok) {
      // Nếu response không thành công (status code không phải 2xx)
      let errorData;
      try {
        // Thử parse lỗi từ body response nếu có
        errorData = await response.json();
      } catch (e) {
        // Nếu không parse được JSON lỗi
        errorData = { message: response.statusText };
      }
      console.error(`API Error ${response.status}:`, errorData);
      throw new Error(
        `Yêu cầu thất bại với mã trạng thái ${response.status}. ${errorData?.message || ''}`
      );
    }

    // Nếu response thành công, parse JSON
    // Kiểm tra nếu body rỗng (ví dụ: DELETE request thành công trả về 204 No Content)
    if (response.status === 204) {
      return null; // Hoặc một giá trị biểu thị thành công không có nội dung
    }
    return await response.json();

  } catch (error) {
    // Bắt lỗi mạng hoặc lỗi từ việc throw new Error ở trên
    console.error('Lỗi khi fetch dữ liệu:', error);
    // Re-throw lỗi để component có thể bắt và xử lý
    throw error;
  }
};

// Có thể thêm các hàm tiện ích khác ở đây sau này (ví dụ: postData, putData, deleteData)
// export const postData = (endpoint, body, options) => fetchData(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
// export const putData = (endpoint, body, options) => fetchData(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
// export const deleteData = (endpoint, options) => fetchData(endpoint, { ...options, method: 'DELETE' });