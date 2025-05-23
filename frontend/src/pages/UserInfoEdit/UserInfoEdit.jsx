// src/components/UserInfoEdit/UserInfoEdit.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth hook từ AuthContext của bạn
import apiService from '../../services/api'; // Sử dụng apiService đã được setup interceptor
// Import CSS Module
import { Link } from 'react-router-dom';
import styles from './UserInfoEdit.module.css';
import Spinner from '../../components/Spinner/Spinner'; // Import Spinner (nếu bạn dùng nó)
// Import Link từ react-router-dom nếu bạn muốn thêm link "Đi đến trang đăng nhập"
// import { Link } from 'react-router-dom';


function UserInfoEdit() {
  useEffect(() => {
          document.title = "Chỉnh sửa thông tin | HustShop";
      }, []);
  // Lấy user data và trạng thái loading ban đầu từ AuthContext
  // authLoading là loading của AuthContext, cho biết nó đã kiểm tra xong trạng thái đăng nhập chưa
  // user là thông tin người dùng đã đăng nhập (nếu có)
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  // State cho form data
  // Khởi tạo ban đầu là rỗng, sẽ được điền vào từ user data sau khi AuthContext load xong
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
  });

  // State cho trạng thái loading khi gửi form (cập nhật)
  const [isUpdating, setIsUpdating] = useState(false);
  // State cho thông báo lỗi/thành công khi cập nhật
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState(null);

  // Effect để điền dữ liệu form khi user data từ AuthContext có sẵn
  useEffect(() => {
    if (user) {
      console.log("[UserInfoEdit] User data loaded from AuthContext, populating form:", user);
      setFormData({
        firstName: user.firstName || '', // Dùng || '' để tránh undefined
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
    } else if (!authLoading && !isAuthenticated) {
        // Nếu AuthContext đã load xong (không còn loading) và user không authenticated,
        // bạn có thể muốn xử lý ở đây (ví dụ: redirect về trang login)
        console.log("[UserInfoEdit] AuthContext finished loading, user is not authenticated.");
        // setUpdateError("Bạn cần đăng nhập để xem và chỉnh sửa thông tin."); // Có thể set lỗi hoặc chỉ dựa vào render bên dưới
    }
  }, [user, authLoading, isAuthenticated]); // Chạy lại effect khi user, authLoading hoặc isAuthenticated thay đổi

  // Hàm xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Hàm xử lý gửi form cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn chặn reload trang

    if (!isAuthenticated) {
         // This case should ideally be handled by the render logic below,
         // but adding a check here is harmless defensive programming.
         setUpdateError("Bạn cần đăng nhập để thực hiện chức năng này.");
         return;
    }

    setIsUpdating(true); // Bắt đầu trạng thái cập nhật
    setUpdateError(null); // Xóa lỗi cũ
    setUpdateSuccessMessage(null); // Xóa thông báo thành công cũ

    try {
      // Gọi API PUT để cập nhật thông tin
      // apiService đã được setup interceptor và sẽ tự động thêm token
      const response = await apiService.updateUserInfo(formData);

      console.log("Cập nhật thành công:", response.data);
      setUpdateSuccessMessage("Thông tin người dùng đã được cập nhật thành công!");

      // TODO: Cập nhật user state trong AuthContext sau khi cập nhật thành công
      // Nếu AuthContext có hàm cập nhật local user state, gọi ở đây:
      // useAuth().updateUserLocalState(formData);
      // Hoặc re-fetch user info nếu cần (ít hiệu quả hơn):
      // const updatedUserInfo = await apiService.getUserInfo(user.username);
      // useAuth().updateUserLocalState(updatedUserInfo);


    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      // Xử lý lỗi API
      // Interceptor đã xử lý 401. Các lỗi khác (400, 404, 500, network)
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định khi cập nhật.';
      setUpdateError(`Lỗi: ${errorMessage}`);
    } finally {
      setIsUpdating(false); // Kết thúc trạng thái cập nhật
    }
  };

   // Nếu AuthContext đang load, hiển thị Spinner
   if (authLoading) {
       // Sử dụng class loadingContainer từ CSS module
       return (
            <div className={styles.loadingContainer}>
                <Spinner size="large" />
                <p>Đang tải thông tin người dùng...</p>
            </div>
       );
   }

   // Nếu đã load xong nhưng user không authenticated, hiển thị thông báo lỗi
   if (!isAuthenticated) {
       // Sử dụng class authErrorContainer từ CSS module
       return (
           <div className={styles.authErrorContainer}>
               {/* Sử dụng class errorMessage để style text lỗi */}
               <p className={styles.errorMessage}>Bạn cần đăng nhập để xem trang này.</p>
               {/* Optional: Add a link to login page using react-router-dom's Link */}
               {/* <Link to="/login">Đi đến trang đăng nhập</Link> */}
           </div>
       );
   }


  // Render form khi AuthContext load xong và user đã authenticated
  return (
    // Sử dụng class formCard từ CSS module để tạo giao diện card cho form
    // Bạn có thể bao bọc component này trong một div với class styles.profileContainer
    // ở component cha nếu muốn nó nằm trong container giới hạn chiều rộng như trang Profile
    <div className={styles.formCard}>
      {/* Sử dụng class formTitle từ CSS module cho tiêu đề */}
      <h2 className={styles.formTitle}>Chỉnh sửa thông tin người dùng</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="firstName">Tên:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lastName">Họ:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber">Số điện thoại:</label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="address">Địa chỉ:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        {/* Hiển thị thông báo lỗi hoặc thành công */}
        {updateError && <div className={styles.errorMessage}>{updateError}</div>}
        {updateSuccessMessage && <div className={styles.successMessage}>{updateSuccessMessage}</div>}

        {/* Sử dụng class submitButton từ CSS module */}
        <button type="submit" className={styles.submitButton} disabled={isUpdating}>
          {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
      <div className={styles.backLinkContainer}>
                            <span>Quay lại?</span>
                            <Link to="/profile" className={`${styles.link} ${styles.backLink}`}>
                                Trang hồ sơ
                            </Link>
                        </div>
    </div>
  );
}

export default UserInfoEdit;