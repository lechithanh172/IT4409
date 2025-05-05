import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './loginPage.module.css';
import { useAuth } from '../../contexts/AuthContext';

function LoginPage() {
    const [userName, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!userName.trim() || !password.trim()) {
            setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
            return;
        }

        try {
            const user = await login(userName, password);

            // Kiểm tra user tồn tại và có role
            if (!user || !user.role) {
                throw new Error('Thông tin người dùng không hợp lệ');
            }

            // Điều hướng theo role
            switch (user.role) {
                case 'admin':
                    navigate('/admin-dashboard');
                    break;
                case 'productManager':
                    navigate('/manager/product');
                    break;
                default:
                    navigate('/');
            }

        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại, vui lòng thử lại!');
        }
    };

    return (
        <div className={styles.container}>

            <div className={styles['login-container']}>
                <form onSubmit={handleLogin} className={styles['login-form']}>
                    <h2>Đăng nhập</h2>

                    <input
                        type="text"
                        placeholder="Username"
                        value={userName}
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.input}
                    />

                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                    />

                    <div className={styles.links}>
                        <Link to="/email?type=reset" className={styles.link}>
                            Quên mật khẩu?
                        </Link>
                        <span> | </span>
                        <Link to="/email?type=signup" className={styles.link}>
                            Đăng ký tài khoản
                        </Link>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.button}
                    >
                        Đăng nhập
                    </button>
                </form>
            </div>

        </div>
    );
}

export default LoginPage;