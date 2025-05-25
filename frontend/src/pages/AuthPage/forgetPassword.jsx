import React, { useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
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

    const [redirectToReset, setRedirectToReset] = useState('');


    useEffect(() => {
        if (redirectToReset) {

            const resetPasswordBaseUrl = 'https://lehaanhduc.io.vn/reset-password';
            const targetUrlWithEmail = `${resetPasswordBaseUrl}?email=${encodeURIComponent(redirectToReset)}`;

            console.log("Redirecting to:", targetUrlWithEmail);

            window.location.href = targetUrlWithEmail;



        }
    }, [redirectToReset]);

   const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setRedirectToReset('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const trimmedEmail = email.trim();

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


            await forgetPassword(trimmedEmail);


            setMessage('Yêu cầu đặt lại mật khẩu đã được xử lý. Đang chuyển hướng...');

            setRedirectToReset(trimmedEmail);


        } catch (err) {

            console.error("Forget Password Error:", err);
            setError(err.message || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng kiểm tra email và thử lại.');

            setIsLoading(false);
        }


    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.forgetPasswordCard}>
                {/* Decorative side */}
                <div className={styles.decorativeSide}>
                     <div className={styles.logoPlaceholder}>HustShop</div> {/* Consider replacing with an actual logo */}
                    <h3>Khôi phục tài khoản</h3>
                    <p>Nhập email để nhận mã OTP và đặt lại mật khẩu.</p>
                     {/* Maybe add an image or illustration here */}
                </div>

                {/* Form side */}
                <div className={styles.formSide}>
                    <form onSubmit={handleSubmit} className={styles.forgetPasswordForm} noValidate>
                        <h2 className={styles.title}>Quên Mật Khẩu</h2>
                        <p className={styles.subtitle}>Nhập email của bạn để nhận OTP</p>

                        {/* Email Input */}
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
                                    disabled={isLoading || !!message}
                                    aria-invalid={!!error}
                                    aria-describedby={error ? "forget-password-error" : undefined}
                                />
                            </div>
                        </div>

                        {/* Messages */}
                        {message && (
                            <p id="forget-password-message" className={styles.message} role="status" aria-live="polite">
                                {message}
                            </p>
                        )}
                        {error && (
                            <p id="forget-password-error" className={styles.error} role="alert" aria-live="assertive">
                                <FiAlertCircle /> {error}
                            </p>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className={styles.submitButton}
                            variant="gradient"
                            disabled={isLoading || !!message}
                        >
                            {isLoading ? (
                                <Spinner size="small" color="#fff" />
                            ) : (
                                <> <FiSend /> Gửi OTP </>
                            )}
                        </Button>

                        {/* Link back to Login */}
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