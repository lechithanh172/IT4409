import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './changePasswordPage.module.css';
import { FiLock, FiRepeat, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import { useAuth } from '../../contexts/AuthContext';

function ChangePasswordPage() {
    useEffect(() => {
            document.title = "Đổi mật khẩu | HustShop";
        }, []);
    const { changePassword } = useAuth();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError('');
        if (successMessage) setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // Kiểm tra dữ liệu
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setError('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        if (formData.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu mới và xác nhận không khớp.');
            return;
        }

        setIsLoading(true);
        try {
            await changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });
            setSuccessMessage('Đổi mật khẩu thành công!');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.changePasswordCard}>
                {/* Phần trang trí bên trái */}
                <div className={styles.decorativeSide}>
                    <div className={styles.logoPlaceholder}>MyEshop</div>
                    <h3>Đổi mật khẩu</h3>
                    <p>Đảm bảo mật khẩu mới đủ mạnh để bảo vệ tài khoản của bạn.</p>
                </div>

                {/* Phần form bên phải */}
                <div className={styles.formSide}>
                    <form onSubmit={handleSubmit} className={styles.changePasswordForm} noValidate>
                        <h2 className={styles.title}>Đổi mật khẩu</h2>
                        <p className={styles.subtitle}>Nhập mật khẩu hiện tại và mật khẩu mới</p>

                        <div className={styles.inputGroup}>
                            <label htmlFor="currentPassword" className={styles.label}>Mật khẩu hiện tại</label>
                            <div className={styles.inputWrapper}>
                                <FiLock className={styles.inputIcon} />
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập mật khẩu hiện tại"
                                    required
                                    className={styles.input}
                                    disabled={isLoading}
                                    aria-invalid={!!error}
                                    aria-describedby="change-password-error"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className={styles.passwordToggle}
                                    aria-label={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    tabIndex={-1}
                                >
                                    {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="newPassword" className={styles.label}>Mật khẩu mới</label>
                            <div className={styles.inputWrapper}>
                                <FiLock className={styles.inputIcon} />
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập mật khẩu mới"
                                    required
                                    className={styles.input}
                                    disabled={isLoading}
                                    aria-invalid={!!error}
                                    aria-describedby="change-password-error"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className={styles.passwordToggle}
                                    aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    tabIndex={-1}
                                >
                                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword" className={styles.label}>Xác nhận mật khẩu mới</label>
                            <div className={styles.inputWrapper}>
                                <FiRepeat className={styles.inputIcon} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập lại mật khẩu mới"
                                    required
                                    className={styles.input}
                                    disabled={isLoading}
                                    aria-invalid={!!error}
                                    aria-describedby="change-password-error"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className={styles.passwordToggle}
                                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        {successMessage && (
                            <p id="change-password-success" className={styles.success}>
                                <FiCheckCircle /> {successMessage}
                            </p>
                        )}
                        {error && (
                            <p id="change-password-error" className={styles.error}>
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
                                <> <FiCheckCircle /> Đổi mật khẩu </>
                            )}
                        </Button>

                        <div className={styles.backLinkContainer}>
                            <span>Quay lại?</span>
                            <Link to="/profile" className={`${styles.link} ${styles.backLink}`}>
                                Trang hồ sơ
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChangePasswordPage;