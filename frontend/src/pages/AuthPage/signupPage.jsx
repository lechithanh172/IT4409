import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './signupPage.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiUserPlus, FiKey } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import { useLocation } from 'react-router-dom';

import { toast } from 'react-toastify';


function SignupPage() {

    useEffect(() => {
            document.title = "Đăng ký | HustShop";
        }, []);

    const location = useLocation();
    const prefillData = location.state || {};


    const [formData, setFormData] = useState({

        username: prefillData.username || '',
        firstname: prefillData.firstname || '',
        lastname: prefillData.lastname || '',
        email: prefillData.email || '',
        otp: prefillData.otp || '',
        phone: prefillData.phone || '',
        address: prefillData.address || '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');



        const { username, firstname, lastname, email, otp, phone, address, password, confirmPassword } = formData;
        if (!username || !firstname || !lastname || !email || !otp || !phone || !address || !password || !confirmPassword) {
            const msg = 'Vui lòng nhập đầy đủ thông tin.';
            setError(msg);
            toast.error(msg);
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const msg = 'Email không hợp lệ.';
            setError(msg);
            toast.error(msg);
            return;
        }
        if (!/^\d{6}$/.test(otp)) {
            const msg = 'Mã OTP phải là 6 chữ số.';
            setError(msg);
            toast.error(msg);
            return;
        }
        if (!/^\d{10,11}$/.test(phone)) {
             const msg = 'Số điện thoại phải có 10-11 chữ số.';
            setError(msg);
            toast.error(msg);
            return;
        }
        if (password.length < 6) {
            const msg = 'Mật khẩu phải có ít nhất 6 ký tự.';
            setError(msg);
            toast.error(msg);
            return;
        }
        if (password !== confirmPassword) {
            const msg = 'Mật khẩu và xác nhận mật khẩu không khớp.';
            setError(msg);
            toast.error(msg);
            return;
        }

        setIsLoading(true);
        try {
            const { confirmPassword, ...signupData } = formData;
            const dataToSend = { ...signupData, role: 'CUSTOMER' };
            await signup(dataToSend);


            toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');




            navigate('/login');
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Đăng ký không thành công. Vui lòng thử lại.';
            setError(msg);

            toast.error(msg);

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
                        <h2 className={styles.title}>Tạo tài khoản</h2>
                        <p className={styles.subtitle}>Nhanh chóng và dễ dàng</p>

                        {/* Grid Layout */}
                        <div className={styles.formGrid}>
                            {/* Username */}
                            <div className={styles.inputGroup}>
                                <label htmlFor="username" className={styles.label}>Tên đăng nhập</label>
                                <div className={styles.inputWrapper}>
                                    <FiUser className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        placeholder="Chọn tên đăng nhập"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={styles.input}
                                        required
                                        disabled={isLoading}
                                        aria-invalid={!!error}
                                        aria-describedby="signup-error"
                                    />
                                </div>
                            </div>

                            {/* Last Name */}
                            <div className={styles.inputGroup}>
                                <label htmlFor="lastname" className={styles.label}>Họ</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="text"
                                        id="lastname"
                                        name="lastname"
                                        placeholder="Nhập họ của bạn"
                                        value={formData.lastname}
                                        onChange={handleChange}
                                        className={`${styles.input} ${styles.noIconPadding}`}
                                        required
                                        disabled={isLoading}
                                        aria-invalid={!!error}
                                        aria-describedby="signup-error"
                                    />
                                </div>
                            </div>

                            {/* First Name */}
                            <div className={styles.inputGroup}>
                                <label htmlFor="firstname" className={styles.label}>Tên</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="text"
                                        id="firstname"
                                        name="firstname"
                                        placeholder="Nhập tên của bạn"
                                        value={formData.firstname}
                                        onChange={handleChange}
                                        className={`${styles.input} ${styles.noIconPadding}`}
                                        required
                                        disabled={isLoading}
                                        aria-invalid={!!error}
                                        aria-describedby="signup-error"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className={styles.inputGroup}>
                                <label htmlFor="email" className={styles.label}>Email</label>
                                <div className={styles.inputWrapper}>
                                    <FiMail className={styles.inputIcon} />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="vidu@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={styles.input}
                                        required
                                        disabled={isLoading}
                                        aria-invalid={!!error}
                                        aria-describedby="signup-error"
                                    />
                                </div>
                            </div>

                            {/* OTP */}
                            <div className={styles.inputGroup}>
                                <label htmlFor="otp" className={styles.label}>Mã OTP</label>
                                <div className={styles.inputWrapper}>
                                    <FiKey className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        id="otp"
                                        name="otp"
                                        placeholder="Nhập mã OTP (6 chữ số)"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        className={styles.input}
                                        required
                                        disabled={isLoading}
                                        pattern="\d{6}"
                                        title="Mã OTP phải là 6 chữ số"
                                        aria-invalid={!!error}
                                        aria-describedby="signup-error"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className={styles.inputGroup}>
                                <label htmlFor="phone" className={styles.label}>Số điện thoại</label>
                                <div className={styles.inputWrapper}>
                                    <FiPhone className={styles.inputIcon} />
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        placeholder="Số điện thoại liên lạc"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={styles.input}
                                        required
                                        disabled={isLoading}
                                        pattern="[0-9]{10,11}"
                                        title="Số điện thoại hợp lệ gồm 10-11 chữ số"
                                        aria-invalid={!!error}
                                        aria-describedby="signup-error"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                <label htmlFor="address" className={styles.label}>Địa chỉ</label>
                                <div className={styles.inputWrapper}>
                                    <FiMapPin className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        placeholder="Địa chỉ nhận hàng"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className={styles.input}
                                        required
                                        disabled={isLoading}
                                        aria-invalid={!!error}
                                        aria-describedby="signup-error"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Fields */}
                        <div className={styles.passwordGrid}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="password" className={styles.label}>Mật khẩu</label>
                                <div className={styles.inputWrapper}>
                                    <FiLock className={styles.inputIcon} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={styles.input}
                                        required
                                        disabled={isLoading}
                                        minLength={6}
                                        aria-invalid={!!error}
                                        aria-describedby="signup-error"
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

                            <div className={styles.inputGroup}>
                                <label htmlFor="confirmPassword" className={styles.label}>Xác nhận mật khẩu</label>
                                <div className={styles.inputWrapper}>
                                    <FiLock className={styles.inputIcon} />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        placeholder="Nhập lại mật khẩu"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={styles.input}
                                        required
                                        disabled={isLoading}
                                        minLength={6}
                                        aria-invalid={!!error}
                                        aria-describedby="signup-error"
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
                        </div>

                        {/* Hiển thị lỗi - Keeping this is good for immediate feedback */}
                        {error && (
                            <p id="signup-error" className={styles.error}>
                                <FiAlertCircle /> {error}
                            </p>
                        )}

                        {/* Nút Đăng ký */}
                        <Button
                            type="submit"
                            className={styles.signupButton}
                            variant="gradient"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Spinner size="small" color="#fff" />
                            ) : (
                                <> <FiUserPlus /> Tạo tài khoản </>
                            )}
                        </Button>

                        {/* Link quay lại Đăng nhập */}
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

export default SignupPage;