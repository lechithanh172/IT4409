import React, { useState, useEffect} from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './resetPassword.module.css';
import { FiMail, FiKey, FiLock, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';

function ResetPasswordPage() {
    useEffect(() => {
            document.title = "Đặt lại mật khẩu | HustShop";
        }, []);

    const location = useLocation();

    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isEmailFieldDisabled, setIsEmailFieldDisabled] = useState(false);

    const { resetPassword } = useAuth();
    const navigate = useNavigate();


    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailFromUrl = params.get('email');

        if (emailFromUrl) {

            setFormData(prev => ({ ...prev, email: emailFromUrl }));

            setIsEmailFieldDisabled(true);
        } else {

            setIsEmailFieldDisabled(false);
        }
    }, [location.search]);


    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'email' && isEmailFieldDisabled) {
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name !== 'email' || !isEmailFieldDisabled) {
             setError('');
             setSuccess('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, otp, newPassword, confirmPassword } = formData;


        if (!email || !otp || !newPassword || !confirmPassword) {
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
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }



        setIsLoading(true);
        setError('');
        setSuccess('');

        try {

            await resetPassword({ email, otp, newPassword });

            setSuccess('Đặt lại mật khẩu thành công. Vui lòng đăng nhập.');


            setTimeout(() => navigate('/login'), 2000);

        } catch (err) {

            console.error("Reset Password Error:", err);
            setError(err.message || 'Đặt lại mật khẩu không thành công. Vui lòng kiểm tra lại thông tin và thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };


    return (
        <div className={styles.pageContainer}>
            <div className={styles.resetPasswordCard}>
                {}
                <div className={styles.decorativeSide}>
                     <div className={styles.logoPlaceholder}>HustShop</div> {}
                    <h3>Đặt lại mật khẩu</h3>
                    <p>Nhập email, mã OTP và mật khẩu mới để khôi phục tài khoản.</p>
                     {}
                </div>

                {}
                <div className={styles.formSide}>
                    <form onSubmit={handleSubmit} className={styles.resetPasswordForm} noValidate>
                        <h2 className={styles.title}>Đặt lại mật khẩu</h2>
                        <p className={styles.subtitle}>Vui lòng nhập email, mã OTP và mật khẩu mới</p>

                        {}
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

                                    disabled={isLoading || isEmailFieldDisabled}
                                    aria-invalid={!!error}
                                    aria-describedby={error ? "reset-password-error" : undefined}
                                />
                            </div>
                        </div>

                        {}
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
                                     aria-describedby={error ? "reset-password-error" : undefined}
                                />
                            </div>
                        </div>

                        {}
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
                                    placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                                    required
                                    className={styles.input}
                                    disabled={isLoading}
                                     aria-invalid={!!error}
                                     aria-describedby={error ? "reset-password-error" : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className={styles.passwordToggle}
                                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                         {}
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword" className={styles.label}>Xác nhận lại mật khẩu</label>
                            <div className={styles.inputWrapper}>
                                <FiLock className={styles.inputIcon} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Xác nhận mật khẩu mới"
                                    required
                                    className={styles.input}
                                    disabled={isLoading}
                                     aria-invalid={!!error}
                                     aria-describedby={error ? "reset-password-error" : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className={styles.passwordToggle}
                                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>


                        {}
                        {success && (
                            <p id="reset-password-success" className={styles.success} role="status" aria-live="polite">
                                <FiCheckCircle /> {success}
                            </p>
                        )}
                        {error && (
                            <p id="reset-password-error" className={styles.error} role="alert" aria-live="assertive">
                                <FiAlertCircle /> {error}
                            </p>
                        )}

                        {}
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

                        {}
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