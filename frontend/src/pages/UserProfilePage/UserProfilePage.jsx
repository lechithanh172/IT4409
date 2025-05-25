import React, { useState, useEffect } from 'react'; // Import useState here
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Hook để lấy thông tin user
import Button from '../../components/Button/Button';     // Component Button
import Spinner from '../../components/Spinner/Spinner';   // Component Spinner
import styles from './UserProfilePage.module.css';        // CSS Module cho trang này
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit3, FiKey, FiLogOut, FiSave, FiXCircle } from 'react-icons/fi'; // Icons cần thêm Save và Cancel
import apiService from '../../services/api'; // Import your apiService

const UserProfilePage = () => {
  const { user, isLoading, updateUser } = useAuth(); // Lấy thêm updateUser nếu AuthContext cung cấp
  const navigate = useNavigate();

  // --- State cho chức năng chỉnh sửa ---
  const [isEditing, setIsEditing] = useState(false); // Trạng thái: đang chỉnh sửa hay không
  const [formData, setFormData] = useState({ // State lưu dữ liệu đang chỉnh sửa
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
  });
  const [isUpdating, setIsUpdating] = useState(false); // Trạng thái: đang gửi yêu cầu cập nhật
  const [updateError, setUpdateError] = useState(null); // State lưu lỗi khi cập nhật
  const [updateSuccess, setUpdateSuccess] = useState(false); // State lưu trạng thái cập nhật thành công


  // --- Effects ---
  // Effect để đặt lại formData khi user data từ context thay đổi (sau khi load ban đầu hoặc sau khi update thành công)
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
    }
    // Đặt lại trạng thái chỉnh sửa và update khi user data thay đổi (ví dụ sau khi update thành công)
     setIsEditing(false);
     setIsUpdating(false);
     setUpdateError(null);
     setUpdateSuccess(false); // Reset success state
  }, [user]); // Chạy khi user object thay đổi

  // Effect để set tiêu đề trang
  useEffect(() => {
      document.title = "Thông tin cá nhân | HustShop";
  }, []);

  // --- Handlers ---
  // Bắt đầu chỉnh sửa
  const handleEditClick = () => {
    setIsEditing(true);
    setUpdateError(null); // Xóa lỗi cũ nếu có
    setUpdateSuccess(false); // Reset success state
  };

  // Xử lý thay đổi ở các input field
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
     setUpdateError(null); // Xóa lỗi khi người dùng bắt đầu chỉnh sửa lại
      setUpdateSuccess(false); // Reset success state
  };

  // Lưu thông tin đã chỉnh sửa
  const handleSaveClick = async () => {
    setIsUpdating(true);
    setUpdateError(null); // Xóa lỗi cũ
    setUpdateSuccess(false); // Reset success
    try {
      // Gửi dữ liệu cập nhật
      // Assuming apiService.updateUserInfo expects an object like { firstName, lastName, phoneNumber, address }
      const updatedUserData = await apiService.updateUserInfo(formData);

      // Cập nhật user data trong AuthContext (nếu AuthContext có hàm updateUser)
      // Điều này quan trọng để các component khác dùng useAuth thấy data mới ngay lập tức
      if (updateUser) { // Kiểm tra xem hàm updateUser có tồn tại không
         updateUser(updatedUserData.data); // Cập nhật user state trong context
      } else {
          // Nếu không có hàm updateUser trong context, bạn có thể cần cách khác
          // để refresh user data hoặc chấp nhận dữ liệu trong context sẽ cũ
          // cho đến khi page reload hoặc user login lại.
          // Đối với ví dụ này, chúng ta sẽ dựa vào effect [user] để tự set lại formData
          // khi user data trong context thay đổi (nếu có).
          console.warn("AuthContext does not provide an 'updateUser' function. Profile data in context might not update immediately.");
      }


      setUpdateSuccess(true); // Đánh dấu thành công
      // Tự động thoát khỏi chế độ chỉnh sửa sau 2 giây (hoặc giữ nguyên tùy UX)
      setTimeout(() => {
         setIsEditing(false);
         setUpdateSuccess(false); // Ẩn thông báo thành công
      }, 2000); // Thoát sau 2 giây

    } catch (error) {
      console.error('Error updating profile:', error);
       // Xử lý lỗi chi tiết hơn nếu API trả về cấu trúc lỗi cụ thể
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.';
      setUpdateError(errorMessage);
      setUpdateSuccess(false); // Đảm bảo success là false khi có lỗi
      // Giữ nguyên chế độ chỉnh sửa để người dùng sửa lại
      setIsEditing(true); // Giữ chế độ edit khi lỗi
    } finally {
      setIsUpdating(false); // Kết thúc quá trình cập nhật
    }
  };

  // Hủy bỏ chỉnh sửa
  const handleCancelClick = () => {
    // Đặt lại formData về dữ liệu user hiện tại từ context
    if (user) {
       setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
       });
    }
    setIsEditing(false); // Thoát chế độ chỉnh sửa
    setUpdateError(null); // Xóa lỗi
    setUpdateSuccess(false); // Xóa thông báo thành công
  };


   // Hàm xử lý khi nhấn nút đổi mật khẩu (chuyển đến trang đổi mật khẩu)
   const handleChangePassword = () => {
      navigate('/change-password'); // Ví dụ đường dẫn trang đổi mật khẩu
      console.log("Điều hướng đến trang đổi mật khẩu...");
   };


  // --- Render trạng thái Loading ban đầu ---
  // Hiển thị Spinner nếu context đang trong quá trình kiểm tra token ban đầu và chưa có user
  if (isLoading && !user) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" />
      </div>
    );
  }

  // --- Render trạng thái nếu không có thông tin user sau khi loading ---
  // Xảy ra nếu ProtectedRoute không hoạt động đúng hoặc context lỗi sau khi loading
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

  // --- Render giao diện Profile khi có dữ liệu user ---
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
                     type="text" // Hoặc 'tel'
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
                            disabled={isUpdating} // Disable khi đang cập nhật
                        >
                           {isUpdating ? <Spinner size="small" /> : <FiSave />}
                           {isUpdating ? 'Đang lưu...' : 'Lưu thông tin'}
                       </Button>
                       <Button
                            variant="outline" // Hoặc secondary
                            onClick={handleCancelClick}
                            className={styles.actionButton}
                            disabled={isUpdating} // Disable khi đang cập nhật
                        >
                            <FiXCircle /> Hủy bỏ
                        </Button>
                    </>
                ) : (
                    // Hiển thị nút Chỉnh sửa khi không chỉnh sửa
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
                    variant="outline" // Hoặc secondary
                    onClick={handleChangePassword}
                    className={styles.actionButton}
                    disabled={isEditing || isUpdating} // Disable khi đang chỉnh sửa hoặc lưu
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