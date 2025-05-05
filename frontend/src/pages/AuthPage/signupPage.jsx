import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useAuth } from '../../contexts/AuthContext';
import styles from './signupPage.module.css';

function SignupPage() {
    const [formData, setFormData] = useState({
        username: '',
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        address: '',
        role: '',
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
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu không khớp!');
            return;
        }

        setIsLoading(true);
        try {
            await signup(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles['register-container']}>
                <form onSubmit={handleSubmit} className={styles['register-form']}>
                    <h2 className={styles.title}>Đăng ký tài khoản</h2>

                    <div className={styles['form-grid']}>
                        <div className={styles['input-group']}>
                            <label>Tên người dùng</label>
                            <input
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles['input-group']}>
                            <label>Họ</label>
                            <input
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles['input-group']}>
                            <label>Tên</label>
                            <input
                                name="firstname"
                                value={formData.firstname}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles['input-group']}>
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles['input-group']}>
                            <label>Số điện thoại</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles['input-group']}>
                            <label>Địa chỉ</label>
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles['input-group']}>
                            <label>Vai trò</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                className={styles.select}
                            >
                                <option value="">Chọn vai trò</option>
                                <option value="user">Người dùng</option>
                                <option value="seller">Người bán</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles['password-group']}>
                        <div className={styles['input-group']}>
                            <label>Mật khẩu</label>
                            <div className={styles['password-wrapper']}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles['password-toggle']}
                                >
                                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                                </span>
                            </div>
                        </div>

                        <div className={styles['input-group']}>
                            <label>Nhập lại mật khẩu</label>
                            <div className={styles['password-wrapper']}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <span
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className={styles['password-toggle']}
                                >
                                    {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                                </span>
                            </div>
                        </div>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SignupPage;