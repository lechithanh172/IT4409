import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import styles from './UserProfilePage.module.css';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit3, FiKey, FiLogOut, FiSave, FiXCircle } from 'react-icons/fi';
import apiService from '../../services/api';

const UserProfilePage = () => {
  const { user, isLoading, updateUser } = useAuth();
  const navigate = useNavigate();


  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);




  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
    }

     setIsEditing(false);
     setIsUpdating(false);
     setUpdateError(null);
     setUpdateSuccess(false);
  }, [user]);


  useEffect(() => {
      document.title = "Thông tin cá nhân | HustShop";
  }, []);



  const handleEditClick = () => {
    setIsEditing(true);
    setUpdateError(null);
    setUpdateSuccess(false);
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
     setUpdateError(null);
      setUpdateSuccess(false);
  };


  const handleSaveClick = async () => {
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);
    try {


      const updatedUserData = await apiService.updateUserInfo(formData);



      if (updateUser) {
         updateUser(updatedUserData.data);
      } else {





          console.warn("AuthContext does not provide an 'updateUser' function. Profile data in context might not update immediately.");
      }


      setUpdateSuccess(true);

      setTimeout(() => {
         setIsEditing(false);
         setUpdateSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error updating profile:', error);

      const errorMessage = error.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.';
      setUpdateError(errorMessage);
      setUpdateSuccess(false);

      setIsEditing(true);
    } finally {
      setIsUpdating(false);
    }
  };


  const handleCancelClick = () => {

    if (user) {
       setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
       });
    }
    setIsEditing(false);
    setUpdateError(null);
    setUpdateSuccess(false);
  };



   const handleChangePassword = () => {
      navigate('/change-password');
      console.log("Điều hướng đến trang đổi mật khẩu...");
   };




  if (isLoading && !user) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" />
      </div>
    );
  }



  if (!user) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.errorCard}>
           <p className={styles.errorText}>Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.</p>
           <Link to="/login"><Button variant="primary">Đăng nhập</Button></Link>
        </div>
      </div>
    );
  }


  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

  return (
    <div className={styles.profileContainer}>
      {/* Tiêu đề trang */}
      <h1 className={styles.pageTitle}>Thông tin tài khoản</h1>

      {/* Card chứa thông tin profile */}
      <div className={styles.profileCard}>

        {/* Phần Header của Card: Avatar và Tên */}
        <div className={styles.cardHeader}>
          <div className={styles.avatar}>
            {user.firstName ? user.firstName.charAt(0).toUpperCase() : <FiUser size={40} />} {/* Kích thước icon lớn hơn */}
          </div>
          <div className={styles.headerInfo}>
            {/* Hiển thị tên từ user object (đã được cập nhật nếu save thành công) */}
            <h2 className={styles.userName}>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}</h2>
             {/* Hiển thị username nếu có Họ tên */}
            {fullName && <p className={styles.userUsername}>@{user.username}</p>}
          </div>
        </div>

        {/* Phần Body của Card: Chi tiết thông tin */}
        <div className={styles.cardBody}>
          <h3 className={styles.sectionTitle}>Thông tin cá nhân</h3>

           {/* Thông báo lỗi/thành công khi cập nhật */}
            {updateError && (
                <div className={`${styles.messageBox} ${styles.error}`}>
                    {updateError}
                </div>
            )}
             {updateSuccess && (
                <div className={`${styles.messageBox} ${styles.success}`}>
                    Thông tin đã được cập nhật thành công!
                </div>
            )}

          {/* Grid hiển thị các mục thông tin (static hoặc input) */}
          <div className={styles.infoGrid}>

            {/* Mục Họ */}
            <div className={styles.infoItem}>
              <FiUser className={styles.infoIcon} />
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Họ</span>
                {isEditing ? (
                   <input
                     type="text"
                     name="firstName"
                     value={formData.firstName}
                     onChange={handleInputChange}
                     className={styles.infoInput}
                   />
                ) : (
                   <span className={styles.infoValue}>{user.firstName || '(Chưa cập nhật)'}</span>
                )}
              </div>
            </div>

            {/* Mục Tên */}
            <div className={styles.infoItem}>
              <FiUser className={styles.infoIcon} />
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Tên</span>
                 {isEditing ? (
                   <input
                     type="text"
                     name="lastName"
                     value={formData.lastName}
                     onChange={handleInputChange}
                     className={styles.infoInput}
                   />
                ) : (
                   <span className={styles.infoValue}>{user.lastName || '(Chưa cập nhật)'}</span>
                )}
              </div>
            </div>

             {/* Mục Tên đăng nhập (Luôn static) */}
             <div className={styles.infoItem}>
                <span className={styles.infoIcon}>@</span> {/* Sử dụng ký tự @ làm icon */}
                <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Tên đăng nhập</span>
                    {/* Username thường không cho sửa */}
                    <span className={styles.infoValue}>{user.username}</span>
                </div>
             </div>

            {/* Mục Email (Luôn static, hoặc cần luồng xác minh phức tạp) */}
            <div className={styles.infoItem}>
              <FiMail className={styles.infoIcon} />
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Email</span>
                {/* Email thường không cho sửa trực tiếp */}
                <span className={styles.infoValue}>{user.email || '(Chưa cập nhật)'}</span>
              </div>
            </div>

            {/* Mục Số điện thoại */}
            <div className={styles.infoItem}>
              <FiPhone className={styles.infoIcon} />
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Số điện thoại</span>
                {isEditing ? (
                   <input
                     type="text"
                     name="phoneNumber"
                     value={formData.phoneNumber}
                     onChange={handleInputChange}
                     className={styles.infoInput}
                   />
                ) : (
                   <span className={styles.infoValue}>{user.phoneNumber || '(Chưa cập nhật)'}</span>
                )}
              </div>
            </div>

            {/* Mục Địa chỉ */}
            <div className={`${styles.infoItem} ${styles.fullWidth}`}> {/* Chiếm cả dòng */}
              <FiMapPin className={styles.infoIcon} />
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Địa chỉ</span>
                 {isEditing ? (
                   <input
                     type="text"
                     name="address"
                     value={formData.address}
                     onChange={handleInputChange}
                     className={styles.infoInput}
                   />
                ) : (
                   <span className={styles.infoValue}>{user.address || '(Chưa cập nhật)'}</span>
                )}
              </div>
            </div>
          </div>

           {/* Phần Nút bấm ở cuối Card */}
           <div className={styles.actionButtons}>
                {/* Hiển thị nút Lưu và Hủy khi đang chỉnh sửa */}
                {isEditing ? (
                    <>
                       <Button
                            variant="primary"
                            onClick={handleSaveClick}
                            className={styles.actionButton}
                            disabled={isUpdating}
                        >
                           {isUpdating ? <Spinner size="small" /> : <FiSave />}
                           {isUpdating ? 'Đang lưu...' : 'Lưu thông tin'}
                       </Button>
                       <Button
                            variant="outline"
                            onClick={handleCancelClick}
                            className={styles.actionButton}
                            disabled={isUpdating}
                        >
                            <FiXCircle /> Hủy bỏ
                        </Button>
                    </>
                ) : (

                    <Button
                        variant="secondary"
                        onClick={handleEditClick}
                        className={styles.actionButton}
                    >
                        <FiEdit3 /> Chỉnh sửa thông tin
                    </Button>
                )}

                {/* Nút Đổi mật khẩu (luôn hiển thị) */}
                 <Button
                    variant="outline"
                    onClick={handleChangePassword}
                    className={styles.actionButton}
                    disabled={isEditing || isUpdating}
                >
                    <FiKey /> Đổi mật khẩu
                </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;