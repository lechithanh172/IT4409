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
        if (!email.trim()) {
            setError('Vui lòng nhập email.');
            return;
        }
        if (!emailRegex.test(email)) {
            setError('Email không hợp lệ.');
            return;
        }

        setIsLoading(true);
        try {
            const responseMsg = await forgetPassword(email);

            setMessage(responseMsg);
            Navigate('/reset-password', { state: { email: email } })
        } catch (err) {
            setError(err.message || 'Gửi yêu cầu không thành công. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.forgetPasswordCard}>
                {/* Phần trang trí bên trái */}
                <div className={styles.decorativeSide}>
                    <div className={styles.logoPlaceholder}>MyEshop</div>
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