import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './otpPage.module.css';
import { Otp } from '../../contexts/AuthContext';

function OtpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get('type'); // 'signup' hoặc 'reset'

    const handleOtpSuccess = (type) => {
        if (type === 'reset') navigate('/change-password');
        else if (type === 'signup') navigate('/signup');
    };

    const {
        otp,
        secondsLeft,
        formatTime,
        handleChange,
        handleSubmit,
    } = Otp(() => handleOtpSuccess(type));

    return (
        <div className={styles.container}>
            <div className={styles['otp-container']}>
                <form
                    onSubmit={(e) => handleSubmit(e)}
                    className={styles['otp-form']}
                >
                    <h2>Xác minh mã OTP</h2>
                    <div className={styles['otp-inputs']}>
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onFocus={(e) => e.target.select()}
                                disabled={secondsLeft === 0}
                                className={styles['otp-input']}
                            />
                        ))}
                    </div>
                    <div className={styles.timer}>
                        {secondsLeft > 0 ? (
                            <span>Còn lại: {formatTime()}</span>
                        ) : (
                            <span className={styles.expired}>
                                OTP đã hết hạn. Vui lòng gửi lại mã mới.
                            </span>
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