import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './signupPage.module.css'; // Sử dụng CSS Module
import { useAuth } from '../../contexts/AuthContext'; // Import Auth Hook
// Sử dụng Fi icons cho đồng bộ
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiUserPlus } from 'react-icons/fi';
import Button from '../../components/Button/Button'; // Import Button nếu muốn dùng component chung
import Spinner from '../../components/Spinner/Spinner'; // Import Spinner

function SignupPage() {
    // State quản lý dữ liệu form
    const [formData, setFormData] = useState({
        username: '',
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        address: '',
        // role: '', // Đã loại bỏ
        password: '',
        confirmPassword: '',
    });

    // State quản lý UI
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Hooks
    // Giả sử bạn có hàm signup trong AuthContext
    // Nếu không có, bạn cần gọi apiService trực tiếp ở đây
    // const { signup } = useAuth(); // Bỏ comment nếu dùng context
    const navigate = useNavigate();

    // Hàm xử lý thay đổi input, xóa lỗi cũ
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) {
            setError(''); // Xóa lỗi khi người dùng nhập lại
        }
    };

    // Hàm xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // --- Các bước kiểm tra dữ liệu phía Client ---
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu và xác nhận mật khẩu không khớp!');
            return;
        }
        if (formData.password.length < 6) {
             setError('Mật khẩu phải có ít nhất 6 ký tự.');
             return;
        }
        // Thêm các kiểm tra khác nếu cần (email hợp lệ, số điện thoại...)

        setIsLoading(true);

        try {
            // Tạo object dữ liệu gửi đi (loại bỏ confirmPassword)
            const { confirmPassword, ...signupData } = formData;
            // Mặc định role là 'user' khi gửi lên API nếu backend yêu cầu
            const dataToSend = { ...signupData, role: 'user' };

            // Gọi hàm signup từ context hoặc apiService
            // await signup(dataToSend); // Nếu dùng context

            // Hoặc gọi trực tiếp apiService nếu không dùng signup trong context
            const apiService = (await import('../../services/api')).default; // Import động hoặc import ở đầu file
            await apiService.signupUser(dataToSend);

            console.log('Đăng ký thành công!');
            alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
            navigate('/login'); // Chuyển đến trang đăng nhập sau khi thành công

        } catch (err) {
            console.error("Lỗi đăng ký:", err);
            setError(err.response?.data?.message || err.message || 'Đăng ký không thành công. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}> {/* Container bao ngoài */}
            <div className={styles.signupCard}> {/* Card chứa form */}
                 {/* Phần trang trí bên trái (tương tự login) */}
                 <div className={styles.decorativeSide}>
                    <div className={styles.logoPlaceholder}>MyEshop</div>
                    <h3>Tham gia ngay!</h3>
                    <p>Tạo tài khoản để nhận nhiều ưu đãi hấp dẫn.</p>
                </div>

                {/* Phần form bên phải */}
                <div className={styles.formSide}>
                    <form onSubmit={handleSubmit} className={styles.signupForm} noValidate>
                        <h2 className={styles.title}>Tạo tài khoản</h2>
                        <p className={styles.subtitle}>Nhanh chóng và dễ dàng</p>

                        {/* Grid Layout */}
                        <div className={styles.formGrid}>
                            {/* Username */}
                            <div className={styles.inputGroup}>
                                <label htmlFor="username" className={styles.label}>Tên đăng nhập</label>
                                <div className={styles.inputWrapper}>
                                    <FiUser className={styles.inputIcon} />
                                    <input type="text" id="username" name="username" placeholder="Chọn tên đăng nhập" value={formData.username} onChange={handleChange} className={styles.input} required disabled={isLoading}/>
                                </div>
                            </div>

                            {/* Last Name */}
                            <div className={styles.inputGroup}>
                                <label htmlFor="lastname" className={styles.label}>Họ</label>
                                 <div className={styles.inputWrapper}>
                                     {/* <FiUser className={styles.inputIcon} />  Bỏ icon nếu thấy rối */}
                                     <input type="text" id="lastname" name="lastname" placeholder="Nhập họ của bạn" value={formData.lastname} onChange={handleChange} className={`${styles.input} ${styles.noIconPadding}`} required disabled={isLoading}/>
                                 </div>
                            </div>

                             {/* First Name */}
                             <div className={styles.inputGroup}>
                                <label htmlFor="firstname" className={styles.label}>Tên</label>
                                 <div className={styles.inputWrapper}>
                                      {/* <FiUser className={styles.inputIcon} /> */}
                                      <input type="text" id="firstname" name="firstname" placeholder="Nhập tên của bạn" value={formData.firstname} onChange={handleChange} className={`${styles.input} ${styles.noIconPadding}`} required disabled={isLoading}/>
                                 </div>
                             </div>

                            {/* Email */}
                            <div className={styles.inputGroup}>
                                <label htmlFor="email" className={styles.label}>Email</label>
                                <div className={styles.inputWrapper}>
                                    <FiMail className={styles.inputIcon} />
                                    <input type="email" id="email" name="email" placeholder="vidu@email.com" value={formData.email} onChange={handleChange} className={styles.input} required disabled={isLoading}/>
                                </div>
                            </div>

                            {/* Phone */}
                             <div className={styles.inputGroup}>
                                <label htmlFor="phone" className={styles.label}>Số điện thoại</label>
                                 <div className={styles.inputWrapper}>
                                     <FiPhone className={styles.inputIcon} />
                                     <input type="tel" id="phone" name="phone" placeholder="Số điện thoại liên lạc" value={formData.phone} onChange={handleChange} className={styles.input} required disabled={isLoading} pattern="[0-9]{10,11}" title="Số điện thoại hợp lệ gồm 10-11 chữ số"/>
                                 </div>
                             </div>

                            {/* Address */}
                            <div className={`${styles.inputGroup} ${styles.fullWidth}`}> {/* Chiếm cả dòng */}
                                <label htmlFor="address" className={styles.label}>Địa chỉ</label>
                                <div className={styles.inputWrapper}>
                                    <FiMapPin className={styles.inputIcon} />
                                    <input type="text" id="address" name="address" placeholder="Địa chỉ nhận hàng" value={formData.address} onChange={handleChange} className={styles.input} required disabled={isLoading}/>
                                </div>
                            </div>
                        </div>

                        {/* Password Fields */}
                        <div className={styles.passwordGrid}> {/* Grid riêng cho mật khẩu */}
                            <div className={styles.inputGroup}>
                                <label htmlFor="password" className={styles.label}>Mật khẩu</label>
                                <div className={styles.inputWrapper}>
                                    <FiLock className={styles.inputIcon} />
                                    <input type={showPassword ? 'text' : 'password'} id="password" name="password" placeholder="Tạo mật khẩu (ít nhất 6 ký tự)" value={formData.password} onChange={handleChange} className={styles.input} required disabled={isLoading} minLength={6}/>
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.passwordToggle} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} tabIndex={-1}>
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="confirmPassword" className={styles.label}>Xác nhận mật khẩu</label>
                                <div className={styles.inputWrapper}>
                                    <FiLock className={styles.inputIcon} />
                                    <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={handleChange} className={styles.input} required disabled={isLoading} minLength={6}/>
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={styles.passwordToggle} aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} tabIndex={-1}>
                                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Hiển thị lỗi */}
                        {error && (
                            <p className={styles.error}>
                                <FiAlertCircle /> {error}
                            </p>
                        )}

                        {/* Nút Đăng ký */}
                        <Button
                            type="submit"
                            className={styles.signupButton} // Class riêng
                            variant="gradient-green" // Thêm variant hoặc custom class
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Spinner size="small" color="#fff"/>
                            ) : (
                                <> <FiUserPlus /> Tạo tài khoản </>
                            )}
                        </Button>

                        {/* Link quay lại Đăng nhập */}
                        <div className={styles.loginLinkContainer}>
                            <span>Đã có tài khoản?</span>
                            <Link to="/login" className={styles.loginLink}>
                                Đăng nhập tại đây
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;