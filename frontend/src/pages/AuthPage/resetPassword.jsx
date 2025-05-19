import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './resetPassword.module.css';
import { FiMail, FiKey, FiLock, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';

function ResetPasswordPage() {
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, otp, newPassword } = formData;

        // Kiểm tra dữ liệu
        if (!email || !otp || !newPassword) {
            setError('Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Email không hợp lệ.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword({ email, otp, newPassword });
            setSuccess('Đặt lại mật khẩu thành công. Vui lòng đăng nhập.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message || 'Đặt lại mật khẩu không thành công. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.resetPasswordCard}>
                {/* Phần trang trí bên trái */}
                <div className={styles.decorativeSide}>
                    <div className={styles.logoPlaceholder}>MyEshop</div>
                    <h3>Đặt lại mật khẩu</h3>
                    <p>Nhập email, mã OTP và mật khẩu mới để khôi phục tài khoản.</p>
                </div>

                {/* Phần form bên phải */}
                <div className={styles.formSide}>
                    <form onSubmit={handleSubmit} className={styles.resetPasswordForm} noValidate>
                        <h2 className={styles.title}>Đặt lại mật khẩu</h2>
                        <p className={styles.subtitle}>Vui lòng nhập email, mã OTP và mật khẩu mới</p>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>Email</label>
                            <div className={styles.inputWrapper}>
                                <FiMail className={styles.inputIcon} />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email của bạn"
                                    required
                                    className={styles.input}
                                    disabled={isLoading}
                                    aria-invalid={!!error}
                                    aria-describedby="reset-password-error"
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="otp" className={styles.label}>Mã OTP</label>
                            <div className={styles.inputWrapper}>
                                <FiKey className={styles.inputIcon} />
                                <input
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    placeholder="Nhập mã OTP"
                                    required
                                    className={styles.input}
                                    disabled={isLoading}
                                    aria-invalid={!!error}
                                    aria-describedby="reset-password-error"
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="newPassword" className={styles.label}>Mật khẩu mới</label>
                            <div className={styles.inputWrapper}>
                                <FiLock className={styles.inputIcon} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Mật khẩu mới"
                                    required
                                    className={styles.input}
                                    disabled={isLoading}
                                    aria-invalid={!!error}
                                    aria-describedby="reset-password-error"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles.passwordToggle}
                                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        {success && (
                            <p id="reset-password-success" className={styles.success}>
                                <FiCheckCircle /> {success}
                            </p>
                        )}
                        {error && (
                            <p id="reset-password-error" className={styles.error}>
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
                                <> <FiCheckCircle /> Xác nhận </>
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
}

export default ResetPasswordPage;