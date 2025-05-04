import React from 'react';
import styles from './emailPage.module.css';
import { useAuth } from '../../contexts/AuthContext';


function EmailInputPage() {
    const { EmailInput } = useAuth();
    const { email, setEmail, handleSubmit, type } = EmailInput();

    return (
        <div className={styles.container}>
            <div className={styles['email-form-container']}>
                <form onSubmit={handleSubmit} className={styles['email-form']}>
                    <h2>{type === 'reset' ? 'Đặt lại mật khẩu' : 'Đăng ký'}</h2>
                    <input
                        type="email"
                        placeholder="Nhập email..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={styles['email-input']}
                    />
                    <button type="submit" className={styles['submit-button']}>
                        Tiếp tục
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EmailInputPage;
