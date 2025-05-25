import React, { useState, useEffect} from 'react';
import { Link } from 'react-router-dom'; // Changed from Navigate as we use window.location
import { useAuth } from '../../contexts/AuthContext';
import styles from './forgetPassword.module.css';
import { FiMail, FiAlertCircle, FiSend } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';

const ForgetPasswordPage = () => {
    useEffect(() => {
        document.title = "Quên mật khẩu | HustShop";
    }, []);

    const { forgetPassword } = useAuth(); // Assuming this sends OTP/email
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(''); // For success message
    const [error, setError] = useState(''); // For error message
    const [isLoading, setIsLoading] = useState(false);
    // State to control when to redirect - ensures message is shown first
    const [redirectToReset, setRedirectToReset] = useState('');

    // Use useEffect to handle the redirect AFTER the message is set
    useEffect(() => {
        if (redirectToReset) {
             // ** IMPORTANT: Replace with your actual Reset Password Page URL **
            const resetPasswordBaseUrl = 'https://lehaanhduc.io.vn/reset-password'; // Example URL
            const targetUrlWithEmail = `${resetPasswordBaseUrl}?email=${encodeURIComponent(redirectToReset)}`;

            console.log("Redirecting to:", targetUrlWithEmail);
            // Perform the full page redirect
            window.location.href = targetUrlWithEmail;

             // Note: Code below window.location.href might not execute
             // as the browser immediately navigates.
        }
    }, [redirectToReset]); // Dependency array includes redirectToReset

   const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setRedirectToReset(''); // Clear previous redirect intent

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
            // Call the backend API to request OTP/reset link
            // Assuming forgetPassword sends an email and returns a success indicator/message
            await forgetPassword(trimmedEmail);

            // On success, set a message and trigger the redirect via state update
            setMessage('Yêu cầu đặt lại mật khẩu đã được xử lý. Đang chuyển hướng...');
            // Set the email to trigger the redirect useEffect
            setRedirectToReset(trimmedEmail);


        } catch (err) {
            // Handle API errors
            console.error("Forget Password Error:", err);
            setError(err.message || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng kiểm tra email và thử lại.');
             // If API fails, stop loading here
            setIsLoading(false);
        }
        // Note: finally block is less predictable with window.location.href
        // The useEffect handles the success case loading state implicitly by navigating.
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
                                    disabled={isLoading || !!message} // Disable input while loading or message (redirecting) is shown
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
                            disabled={isLoading || !!message} // Disable button while loading or redirecting
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