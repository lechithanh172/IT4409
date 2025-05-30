import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import styles from './loginPage.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiLock, FiAlertCircle, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';

function LoginPage() {
    useEffect(() => {
            document.title = "Đăng nhập | HustShop";
        }, []);
    const [userName, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const from = location.state?.from?.pathname || "/";

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        if (error) setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!userName.trim() || !password.trim()) {
            setError('Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        setIsLoading(true);
        try {
            const user = await login(userName, password);

            navigate('/', { replace: true });

            /*
            switch (user.role.toLowerCase()) {
                case 'admin': navigate('/admin', { replace: true }); break;
                case 'productmanager': navigate('/pm', { replace: true }); break;
                default: navigate('/', { replace: true }); break;
            }
            */
        } catch (err) {
            setError(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.loginCard}> {/* Đổi tên class cho rõ ràng hơn */}
                {/* Phần hình ảnh trang trí bên trái (Tùy chọn) */}
                <div className={styles.decorativeSide}>
                    <div className={styles.logoPlaceholder}>HustShop</div>
                    <h3>Chào mừng quay trở lại!</h3>
                    <p>Mua sắm thả ga, không lo về giá.</p>
                    {/* <img src="/path/to/login-illustration.svg" alt="Login Illustration" /> */}
                </div>

                {/* Phần form đăng nhập bên phải */}
                <div className={styles.formSide}>
                    <form onSubmit={handleLogin} className={styles.loginForm} noValidate>
                        <h2 className={styles.title}>Đăng nhập</h2>

                        {/* Input Username */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="username" className={styles.label}>Tên đăng nhập</label>
                            <div className={styles.inputWrapper}>
                                <FiUser className={styles.inputIcon} />
                                <input
                                    type="text"
                                    id="username"
                                    placeholder="Nhập tên đăng nhập"
                                    value={userName}
                                    onChange={handleInputChange(setUsername)}
                                    className={styles.input}
                                    disabled={isLoading}
                                    required
                                    aria-invalid={!!error}
                                    aria-describedby="login-error"
                                />
                            </div>
                        </div>

                        {/* Input Password */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="password" className={styles.label}>Mật khẩu</label>
                            <div className={styles.inputWrapper}>
                                <FiLock className={styles.inputIcon} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={handleInputChange(setPassword)}
                                    className={styles.input}
                                    disabled={isLoading}
                                    required
                                    aria-invalid={!!error}
                                    aria-describedby="login-error"
                                />
                                {/* Nút ẩn/hiện mật khẩu */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles.passwordToggle}
                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        {/* Hiển thị lỗi */}
                        {error && (
                            <p id="login-error" className={styles.error}>
                                <FiAlertCircle /> {error}
                            </p>
                        )}

                        {/* Link quên mật khẩu */}
                        <div className={styles.forgotPasswordLinkContainer}>
                            <Link to="/forget-password" className={styles.link}>Quên mật khẩu?</Link>
                        </div>


                        {/* Nút Đăng nhập (Sử dụng Component Button) */}
                        <Button
                            type="submit"
                            className={styles.loginButton}
                            variant="gradient"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Spinner size="small" color="#fff" />
                            ) : (
                                <> <FiLogIn /> Đăng nhập </>
                            )}
                        </Button>

                        {/* Liên kết Đăng ký */}
                        <div className={styles.signupLinkContainer}>
                            <span>Chưa có tài khoản?</span>
                            <Link to="/pre-signup" className={`${styles.link} ${styles.signupLink}`}>
                                Đăng ký ngay
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;