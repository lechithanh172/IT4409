
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

import { Link } from 'react-router-dom';
import styles from './UserInfoEdit.module.css';
import Spinner from '../../components/Spinner/Spinner';




function UserInfoEdit() {
  useEffect(() => {
          document.title = "Chỉnh sửa thông tin | HustShop";
      }, []);



  const { user, isLoading: authLoading, isAuthenticated } = useAuth();



  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
  });


  const [isUpdating, setIsUpdating] = useState(false);

  const [updateError, setUpdateError] = useState(null);
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState(null);


  useEffect(() => {
    if (user) {
      console.log("[UserInfoEdit] User data loaded from AuthContext, populating form:", user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
    } else if (!authLoading && !isAuthenticated) {


        console.log("[UserInfoEdit] AuthContext finished loading, user is not authenticated.");

    }
  }, [user, authLoading, isAuthenticated]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {


         setUpdateError("Bạn cần đăng nhập để thực hiện chức năng này.");
         return;
    }

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccessMessage(null);

    try {


      const response = await apiService.updateUserInfo(formData);

      console.log("Cập nhật thành công:", response.data);
      setUpdateSuccessMessage("Thông tin người dùng đã được cập nhật thành công!");









    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);


      const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định khi cập nhật.';
      setUpdateError(`Lỗi: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };


   if (authLoading) {

       return (
            <div className={styles.loadingContainer}>
                <Spinner size="large" />
                <p>Đang tải thông tin người dùng...</p>
            </div>
       );
   }


   if (!isAuthenticated) {

       return (
           <div className={styles.authErrorContainer}>
               {/* Sử dụng class errorMessage để style text lỗi */}
               <p className={styles.errorMessage}>Bạn cần đăng nhập để xem trang này.</p>
               {/* Optional: Add a link to login page using react-router-dom's Link */}
               {/* <Link to="/login">Đi đến trang đăng nhập</Link> */}
           </div>
       );
   }



  return (



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