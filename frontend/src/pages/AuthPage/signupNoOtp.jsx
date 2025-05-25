import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './signupNoOtp.module.css';
import { FiUser, FiMail, FiAlertCircle, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import { Link } from 'react-router-dom'
function SignupNoOtpPage() {
    useEffect(() => {
            document.title = "Đăng ký | HustShop";
        }, []);
    const [formData, setFormData] = useState({ username: '', email: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { preSignup } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');


        if (!formData.username.trim() || !formData.email.trim()) {
            setError('Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Email không hợp lệ.');
            return;
        }

        setIsLoading(true);
        try {
            await preSignup(formData);
            navigate('/signup', { state: { username: formData.username, email: formData.email } });
        } catch (err) {
            setError(err.message || 'Đăng ký không thành công. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.signupCard}>
                {/* Phần trang trí bên trái */}
                <div className={styles.decorativeSide}>
                    <div className={styles.logoPlaceholder}>HustShop</div>
                    <h3>Tham gia ngay!</h3>
                    <p>Tạo tài khoản để nhận nhiều ưu đãi hấp dẫn.</p>
                </div>

                {/* Phần form bên phải */}
                <div className={styles.formSide}>
                    <form onSubmit={handleSubmit} className={styles.signupForm} noValidate>
                        <h2 className={styles.title}>Đăng ký tài khoản</h2>
                        <p className={styles.subtitle}>Nhập tên đăng nhập và email</p>

                        <div className={styles.inputGroup}>
                            <label htmlFor="username" className={styles.label}>Tên đăng nhập</label>
                            <div className={styles.inputWrapper}>
                                <FiUser className={styles.inputIcon} />
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Tên đăng nhập"
                                    required
                                    className={styles.input}
                                    disabled={isLoading}
                                    aria-invalid={!!error}
                                    aria-describedby="signup-error"
                                />
                            </div>
                        </div>

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
                                    aria-describedby="signup-error"
                                />
                            </div>
                        </div>

                        {error && (
                            <p id="signup-error" className={styles.error}>
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
                                <> <FiUserPlus /> Tiếp tục </>
                            )}
                        </Button>

                        <div className={styles.loginLinkContainer}>
                            <span>Đã có tài khoản?</span>
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

export default SignupNoOtpPage;