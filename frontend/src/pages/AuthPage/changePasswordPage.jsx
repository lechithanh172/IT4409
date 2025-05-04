import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useAuth } from '../../contexts/AuthContext';
import styles from './changePasswordPage.module.css';

function ChangePassword() {
    const navigate = useNavigate();
    const { changePassword } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu không khớp');
            return;
        }

        setIsLoading(true);
        try {
            await changePassword(formData.password);
            alert('Đổi mật khẩu thành công!');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Đổi mật khẩu thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles['reset-password-container']}>
                <form onSubmit={handleSubmit} className={styles['reset-password-form']}>
                    <h2 className={styles.title}>Đặt lại mật khẩu</h2>

                    <div className={styles['input-group']}>
                        <label>Mật khẩu mới</label>
                        <div className={styles['password-wrapper']}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="6"
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
                        <label>Xác nhận mật khẩu</label>
                        <div className={styles['password-wrapper']}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength="6"
                            />
                            <span
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className={styles['password-toggle']}
                            >
                                {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                            </span>
                        </div>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;