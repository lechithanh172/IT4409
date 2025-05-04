import React from 'react'; // Không cần useState, useEffect ở đây nếu chỉ hiển thị
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Hook để lấy thông tin user
import Button from '../../components/Button/Button';     // Component Button
import Spinner from '../../components/Spinner/Spinner';   // Component Spinner
import styles from './UserProfilePage.module.css';        // CSS Module cho trang này
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit3, FiKey, FiLogOut } from 'react-icons/fi'; // Icons

const UserProfilePage = () => {
  // Lấy thông tin user, trạng thái loading và hàm logout từ AuthContext
  const { user, isLoading } = useAuth();
  const navigate = useNavigate(); // Hook để điều hướng

  // Hàm xử lý khi nhấn nút chỉnh sửa (chuyển đến trang chỉnh sửa)
  const handleEditProfile = () => {
    // Bạn cần tạo trang/component riêng cho việc chỉnh sửa
    navigate('/profile/edit'); // Ví dụ đường dẫn trang chỉnh sửa
    console.log("Điều hướng đến trang chỉnh sửa profile...");
  };

   // Hàm xử lý khi nhấn nút đổi mật khẩu (chuyển đến trang đổi mật khẩu)
   const handleChangePassword = () => {
      navigate('/change-password'); // Ví dụ đường dẫn trang đổi mật khẩu
      console.log("Điều hướng đến trang đổi mật khẩu...");
   };
  // --- Render trạng thái Loading ---
  // Hiển thị Spinner nếu context đang trong quá trình kiểm tra token ban đầu và chưa có user
  if (isLoading && !user) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" />
      </div>
    );
  }

  // --- Render trạng thái nếu không có thông tin user ---
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
  // Ghép họ và tên, xử lý trường hợp thiếu 1 trong 2
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

  return (
    <div className={styles.profileContainer}>
      {/* Tiêu đề trang */}
      <h1 className={styles.pageTitle}>Thông tin tài khoản</h1>

      {/* Card chứa thông tin profile */}
      <div className={styles.profileCard}>

        {/* Phần Header của Card: Avatar và Tên */}
        <div className={styles.cardHeader}>
          {/* Avatar */}
          <div className={styles.avatar}>
            {/* Hiển thị chữ cái đầu hoặc icon nếu không có ảnh */}
            {/* Thay thế bằng <img/> nếu user object có trường avatarUrl */}
            {user.firstName ? user.firstName.charAt(0).toUpperCase() : <FiUser />}
          </div>
          {/* Thông tin tên */}
          <div className={styles.headerInfo}>
            {/* Ưu tiên hiển thị Họ tên đầy đủ */}
            <h2 className={styles.userName}>{fullName || user.username}</h2>
            {/* Hiển thị username nếu có Họ tên */}
            {fullName && <p className={styles.userUsername}>@{user.username}</p>}
            {/* <p className={styles.userRole}>Khách hàng</p> */} {/* Bỏ hiển thị Role theo yêu cầu */}
          </div>
        </div>

        {/* Phần Body của Card: Chi tiết thông tin */}
        <div className={styles.cardBody}>
          <h3 className={styles.sectionTitle}>Thông tin cá nhân</h3>

          {/* Grid hiển thị các mục thông tin */}
          <div className={styles.infoGrid}>
            {/* Mục Họ và tên */}
            <div className={styles.infoItem}>
              <FiUser className={styles.infoIcon} />
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Họ và tên</span>
                <span className={styles.infoValue}>{fullName || '(Chưa cập nhật)'}</span>
              </div>
            </div>

             {/* Mục Tên đăng nhập */}
             <div className={styles.infoItem}>
                {/* Có thể dùng icon khác hoặc bỏ icon */}
                <span className={styles.infoIcon}>@</span>
                <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Tên đăng nhập</span>
                    <span className={styles.infoValue}>{user.username}</span> {/* Username luôn có */}
                </div>
             </div>

            {/* Mục Email */}
            <div className={styles.infoItem}>
              <FiMail className={styles.infoIcon} />
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{user.email || '(Chưa cập nhật)'}</span>
              </div>
            </div>

            {/* Mục Số điện thoại */}
            <div className={styles.infoItem}>
              <FiPhone className={styles.infoIcon} />
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Số điện thoại</span>
                <span className={styles.infoValue}>{user.phoneNumber || '(Chưa cập nhật)'}</span>
              </div>
            </div>

            {/* Mục Địa chỉ */}
            <div className={`${styles.infoItem} ${styles.fullWidth}`}> {/* Chiếm cả dòng */}
              <FiMapPin className={styles.infoIcon} />
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Địa chỉ</span>
                <span className={styles.infoValue}>{user.address || '(Chưa cập nhật)'}</span>
              </div>
            </div>
          </div>

           {/* Phần Nút bấm ở cuối Card */}
           <div className={styles.actionButtons}>
                {/* Nút Chỉnh sửa */}
                <Button
                    variant="secondary" // Hoặc primary tùy thiết kế
                    onClick={handleEditProfile}
                    className={styles.actionButton}
                >
                    <FiEdit3 /> Chỉnh sửa thông tin
                </Button>
                {/* Nút Đổi mật khẩu */}
                 <Button
                    variant="outline" // Hoặc secondary
                    onClick={handleChangePassword}
                    className={styles.actionButton}
                >
                    <FiKey /> Đổi mật khẩu
                </Button>
                 {/* Nút Đăng xuất */}
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;