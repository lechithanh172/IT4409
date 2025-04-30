import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './otpPage.module.css';
import { AiOutlineCloseCircle } from 'react-icons/ai';

function OtpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get('type'); // 'signup' hoặc 'reset'

    // Xử lý chuyển hướng khi OTP thành công
    const handleOtpSuccess = () => {
        if (type === 'reset') navigate('/change-password');
        else if (type === 'signup') navigate('/signup');
    };

    // Lấy hàm từ AuthContext với giá trị mặc định an toàn
    const { useOtp = () => ({}) } = useAuth() || {};
    const {
        otp = [],
        secondsLeft = 0,
        formatTime = () => '00:00',
        handleChange = () => { },
        handleSubmit: submitHandler = (e) => e.preventDefault(),
        error: otpError = '',
        clearError = () => { }
    } = useOtp(handleOtpSuccess) || {};

    return (
        <div className={styles.container}>
            <div className={styles['otp-form-container']}>
                <form
                    onSubmit={submitHandler}
                    className={styles['otp-form']}
                >
                    <h2 className={styles.title}>Xác minh OTP</h2>

                    {otpError && (
                        <div className={styles['error-message']}>
                            <AiOutlineCloseCircle />
                            <span>{otpError}</span>
                            <button
                                type="button"
                                onClick={clearError}
                                className={styles['close-error']}
                            >
                                &times;
                            </button>
                        </div>
                    )}

                    <div className={styles['otp-inputs']}>
                        {Array(6).fill(0).map((_, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                value={otp[index] || ''}
                                onChange={(e) => handleChange(e.target, index)}
                                onFocus={(e) => e.target.select()}
                                disabled={secondsLeft === 0}
                                className={styles['otp-input']}
                                required
                            />
                        ))}
                    </div>

                    <div className={styles.timer}>
                        {secondsLeft > 0 ? (
                            <span>Mã hết hạn sau: {formatTime()}</span>
                        ) : (
                            <span className={styles.expired}>Mã OTP đã hết hạn</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={secondsLeft === 0}
                        className={styles['submit-button']}
                    >
                        Xác nhận
                    </button>
                </form>
            </div>
        </div>
    );
}

export default OtpPage;