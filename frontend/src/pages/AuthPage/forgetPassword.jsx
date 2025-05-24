import React, { useState, useEffect} from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './forgetPassword.module.css';
import { FiMail, FiAlertCircle, FiSend } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';

const ForgetPasswordPage = () => {
    useEffect(() => {
            document.title = "Quên mật khẩu | HustShop";
        }, []);
    const { forgetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

       const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // Kiểm tra email hợp lệ
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const trimmedEmail = email.trim(); // Dùng email đã bỏ khoảng trắng thừa

        if (!trimmedEmail) {
            setError('Vui lòng nhập email.');
            return;
        }
        if (!emailRegex.test(trimmedEmail)) {
            setError('Email không hợp lệ.');
            return;
        }

        setIsLoading(true);
        try {
            // Bước 1: Gọi API backend để xử lý yêu cầu quên mật khẩu
            // (Ví dụ: kiểm tra email có tồn tại không, gửi email chứa link reset + token...)
            const responseMsg = await forgetPassword(trimmedEmail);

            // Optional: Show a success message based on the API response
            // message.success(responseMsg || 'Yêu cầu đặt lại mật khẩu đã được xử lý.'); // Sử dụng Ant Design message

            // --- Thay thế Navigate của react-router-dom bằng điều hướng qua URL ---

            // Bước 2: Xác định URL của trang Reset Password trên web B của bạn
            // ** RẤT QUAN TRỌNG: Thay đổi 'https://ten-mien-cua-web-khac.com'
            // và '/reset-password' bằng URL thực tế của trang trên web B **
            const resetPasswordBaseUrlWebB = 'https://lehaanhduc.io.vn/reset-password'; // Ví dụ: 'https://hustshop-admin.com/reset-password'

            // Bước 3: Xây dựng URL đích đầy đủ, thêm email vào làm tham số query
            // Sử dụng encodeURIComponent để mã hóa email, đảm bảo an toàn khi chứa ký tự đặc biệt
            const targetUrlWithEmail = `${resetPasswordBaseUrlWebB}?email=${encodeURIComponent(trimmedEmail)}`;

            console.log("Đang điều hướng đến:", targetUrlWithEmail);

            // Bước 4: Thực hiện điều hướng bằng trình duyệt
            // Dòng này sẽ khiến trình duyệt tải lại trang mới tại URL targetUrlWithEmail
            window.location.href = targetUrlWithEmail;

            // Lưu ý: Các dòng code sau window.location.href có thể không được thực thi
            // vì trình duyệt sẽ chuyển hướng ngay lập tức.

            // Về mặt UX/Security, luồng quên mật khẩu chuẩn là:
            // 1. Người dùng nhập email.
            // 2. Web A gọi API backend.
            // 3. Backend gửi email chứa MỘT LIÊN KẾT DUY NHẤT (bao gồm cả email hoặc ID người dùng VÀ MỘT TOKEN CÓ THỜI HẠN)
            //    đến địa chỉ email đó.
            // 4. Web A hiển thị thông báo cho người dùng: "Vui lòng kiểm tra email để đặt lại mật khẩu".
            // 5. Người dùng MỞ EMAIL và CLICK vào liên kết đó.
            // 6. Trình duyệt TẢI TRANG Reset Password trên Web B bằng liên kết đó.
            // 7. Web B đọc EMAIL/ID và TOKEN từ URL, gửi lên backend Web B để xác thực token.
            // 8. Nếu token hợp lệ, Web B hiển thị form cho phép người dùng nhập mật khẩu mới.
            // 9. Người dùng nhập mật khẩu mới và gửi lên backend Web B cùng với EMAIL/ID và TOKEN.
            // 10. Backend Web B kiểm tra lại token và cập nhật mật khẩu.

            // Code của bạn hiện tại thực hiện điều hướng ngay lập tức sau khi gọi API.
            // Điều này KHÔNG THEO LUỒNG CHUẨN và có thể kém bảo mật hơn
            // (vì nó bỏ qua bước người dùng phải xác nhận qua email thật).
            // Nếu đây là yêu cầu đặc thù của bạn, code trên sẽ hoạt động để truyền email qua URL.
            // Nếu không, bạn nên cân nhắc chỉ hiển thị thông báo thành công và KHÔNG điều hướng tự động.

             // Nếu bạn muốn hiển thị thông báo xong rồi mới điều hướng sau vài giây (không chuẩn UX nhưng khớp với cấu trúc code cũ):
             // setMessage(responseMsg || 'Chuyển hướng đến trang đặt lại mật khẩu...');
             // setTimeout(() => { window.location.href = targetUrlWithEmail; }, 2000); // Chuyển hướng sau 2 giây
             // setIsLoding(false) sẽ được gọi trong finally sau khi setTimeout bắt đầu.


        } catch (err) {
            // Xử lý lỗi từ API call forgetPassword
            setError(err.message || 'Có lỗi xảy ra khi gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.');
        } finally {
            // Nếu có lỗi từ API, loading sẽ được tắt.
            // Nếu không có lỗi và window.location.href được gọi, dòng này có thể không kịp chạy.
             if (error) { // Chỉ set loading false nếu có lỗi xảy ra trước khi điều hướng
                setIsLoading(false);
             }
            // else if (targetUrlWithEmail) {
            //    // Nếu điều hướng thành công, loading sẽ được xử lý bởi trang mới.
            //    // Không cần setIsLoading(false) ở đây nữa.
            // }
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.forgetPasswordCard}>
                {/* Phần trang trí bên trái */}
                <div className={styles.decorativeSide}>
                    <div className={styles.logoPlaceholder}>HustShop</div>
                    <h3>Khôi phục tài khoản</h3>
                    <p>Nhập email để nhận mã OTP và đặt lại mật khẩu.</p>
                </div>

                {/* Phần form bên phải */}
                <div className={styles.formSide}>
                    <form onSubmit={handleSubmit} className={styles.forgetPasswordForm} noValidate>
                        <h2 className={styles.title}>Quên Mật Khẩu</h2>
                        <p className={styles.subtitle}>Nhập email của bạn để nhận OTP</p>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>Email</label>
                            <div className={styles.inputWrapper}>
                                <FiMail className={styles.inputIcon} />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email của bạn"
                                    required
                                    className={styles.input}
                                    disabled={isLoading}
                                    aria-invalid={!!error}
                                    aria-describedby="forget-password-error"
                                />
                            </div>
                        </div>

                        {message && (
                            <p id="forget-password-message" className={styles.message}>
                                {message}
                            </p>
                        )}
                        {error && (
                            <p id="forget-password-error" className={styles.error}>
                                <FiAlertCircle /> {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className={styles.submitButton}
                            variant="gradient"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Spinner size="small" color="#fff" />
                            ) : (
                                <> <FiSend /> Gửi OTP </>
                            )}
                        </Button>

                        <div className={styles.loginLinkContainer}>
                            <span>Quay lại?</span>
                            <Link to="/login" className={`${styles.link} ${styles.loginLink}`}>
                                Đăng nhập tại đây
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgetPasswordPage;