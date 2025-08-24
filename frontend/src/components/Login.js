import React from 'react';
import { useImmer } from 'use-immer';
import { authAPI } from '../services/api';
import { useApi } from '../hooks/useApi';
import { setToken, setUser } from '../utils/auth';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

function Login() {
    const [state, updateState] = useImmer({
        phoneNumber: '',
        otpCode: '',
        otpSent: false,
        showOtp: false
    });

    const { loading, error, executeRequest } = useApi();
    const { login } = useAuth();

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        updateState(draft => {
            draft.phoneNumber = value;
            if (draft.error) draft.error = '';
        });
    };

    const handleOtpChange = (e) => {
        const value = e.target.value;
        updateState(draft => {
            draft.otpCode = value;
            if (draft.error) draft.error = '';
        });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (!state.phoneNumber.trim()) {
            return;
        }

        try {
            await executeRequest(
                () => authAPI.sendVerification(state.phoneNumber),
                {
                    onSuccess: (data) => {
                        console.log('OTP sent successfully:', data);
                        updateState(draft => {
                            draft.otpSent = true;
                            draft.showOtp = true;
                        });
                        // Remove the alert - just update the state
                    },
                    onError: (errorInfo) => {
                        console.error('Failed to send OTP:', errorInfo);
                    }
                }
            );
        } catch (error) {
            console.error('Send OTP error:', error);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!state.otpCode.trim()) {
            return;
        }

        try {
            const response = await executeRequest(
                () => authAPI.verifyOTP(state.phoneNumber, state.otpCode),
                {
                    onSuccess: (data) => {
                        console.log('OTP verified successfully:', data);
                        if (data.status === 'approved') {
                            console.log('✅ OTP approved, setting up authentication...');

                            // Store JWT token and user data
                            if (data.token) {
                                console.log('🔐 Setting JWT token...');
                                setToken(data.token);
                                setUser(data.user);

                                // Update auth context
                                console.log('👤 Updating auth context...');
                                login(data.token, data.user);
                            }

                            // Store legacy session data for backward compatibility
                            localStorage.setItem('userPhone', state.phoneNumber);
                            localStorage.setItem('isAuthenticated', 'true');

                            console.log('✅ Authentication setup complete!');
                            // Update auth context will automatically redirect to CallCenter
                            // No need for window.location.href since we use conditional rendering
                        } else {
                            // Show error in the UI instead of alert
                            updateState(draft => {
                                draft.error = 'Invalid OTP code. Please try again.';
                            });
                        }
                    },
                    onError: (errorInfo) => {
                        console.error('Failed to verify OTP:', errorInfo);
                    }
                }
            );
        } catch (error) {
            console.error('Verify OTP error:', error);
        }
    };

    const toggleOtpVisibility = () => {
        updateState(draft => {
            draft.showOtp = !draft.showOtp;
        });
    };

    const resetForm = () => {
        updateState(draft => {
            draft.phoneNumber = '';
            draft.otpCode = '';
            draft.otpSent = false;
            draft.showOtp = false;
            draft.error = '';
        });
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                        <h2>Welcome Back</h2>
                        <p>Enter your phone number to receive OTP</p>
                    </div>

                    <form onSubmit={state.otpSent ? handleVerifyOtp : handleSendOtp} className="login-form">
                        <div className="form-group">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <div className="input-wrapper">
                                <svg className="input-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                </svg>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    placeholder="Enter your phone number"
                                    value={state.phoneNumber}
                                    onChange={handlePhoneChange}
                                    required
                                    className="login-input"
                                    disabled={state.otpSent}
                                />
                            </div>
                        </div>

                        {state.otpSent && (
                            <div className="form-group otp-field">
                                <label htmlFor="otpCode">OTP Code</label>
                                <div className="input-wrapper">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                    </svg>
                                    <input
                                        type={state.showOtp ? "text" : "password"}
                                        id="otpCode"
                                        name="otpCode"
                                        placeholder="Enter OTP code"
                                        value={state.otpCode}
                                        onChange={handleOtpChange}
                                        required
                                        className="login-input"
                                        maxLength="6"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={toggleOtpVisibility}
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            {state.showOtp ? (
                                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                            ) : (
                                                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                                            )}
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`login-button ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    {state.otpSent ? 'Verifying...' : 'Sending OTP...'}
                                </>
                            ) : (
                                state.otpSent ? 'Verify OTP' : 'Send OTP'
                            )}
                        </button>

                        {state.otpSent && (
                            <button
                                type="button"
                                className="back-to-login-button"
                                onClick={resetForm}
                                disabled={loading}
                            >
                                <svg className="back-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                                </svg>
                                Change Phone Number
                            </button>
                        )}
                    </form>

                    {error && (
                        <div className="error-message">
                            <svg className="error-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            <div className="error-content">
                                <h4>Login Error</h4>
                                <p>{error.message}</p>
                            </div>
                        </div>
                    )}

                    <div className="login-footer">
                        <p>Demo: Use any valid phone number to test</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;