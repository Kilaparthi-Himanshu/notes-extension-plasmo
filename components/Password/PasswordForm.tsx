import React, { useState } from 'react';
import * as style from '../styles.module.css';
import equalityChecker from './passwordFunctions';
import { Eye, EyeOff} from 'lucide-react';
import VerificationInput from './VerificationInput';
import { emailSend, verifiyCode } from './ResetCodeVerification';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const PasswordForm = ({ theme, customColor, setRequirePassword, password, email, setShowNewPasswordForm}: { theme: string, customColor: string, setRequirePassword: (value: boolean) => void, password: string, email: string, setShowNewPasswordForm: (value: boolean) => void}) => {
    const [password1, setPassword1] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isResetPassword, setIsResetPassword] = useState(false);
    const [resetCode, setResetCode] = useState('');
    const [isThrottled, setIsThrottled] = useState(false);

    const handlePasswordSubmit = () => {
        if (equalityChecker(password, password1)) {
            setRequirePassword(false);
        } else {
            alert('Wrong password');
        }
    }

    const handleSendResetCode = async () => {
        setIsThrottled(true);
        setTimeout(() => setIsThrottled(false), 15000);
        const result = await emailSend(email);
        if (!result) {
            setIsResetPassword(false);
            return;
        }
        setIsResetPassword(true);
    }

    const handleResetPassword = () => {
        const result = verifiyCode(resetCode);
        if (result) {
            setIsResetPassword(false);
            setIsPasswordVisible(false);
            setRequirePassword(false);
            setShowNewPasswordForm(true);
        } else {
            alert('Wrong Code!');
        }
    }

    return (
        <div 
            className={style.passwordOverlay}
            style={{
                backgroundColor: customColor
            }}
        >
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    if (isResetPassword) {
                        handleResetPassword();
                    } else {
                        handlePasswordSubmit();
                    }
                }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                }}
            >
                <div className={`${style.passwordInputContainer} ${style[theme]}`}>
                    <label 
                        htmlFor="password" 
                        className={style.passwordLabel}
                        style={{
                            color: theme === 'light' ? 'black' : 'white',
                        }}
                    >
                            {isResetPassword ? 'Enter 5-Digit Code' : 'Enter Password'}
                        <div className={style.borderBottom} style={{width: '100%'}}></div>
                    </label>
                    <div style={{position: 'relative'}}>
                        <input 
                            disabled={isResetPassword}
                            type={isPasswordVisible ? 'text' : 'password'}
                            placeholder="Enter password..."
                            className={`${style.passwordInput} ${style[theme]}`}
                            style={{
                                backgroundColor: isResetPassword && 'lightgray',
                                cursor: isResetPassword ? 'not-allowed' : 'auto'
                            }}
                            onChange={(e) => setPassword1(e.target.value)}
                        />
                        <div className={style.passwordEye}
                            style={{
                                pointerEvents: isResetPassword ? 'none' : 'auto'
                            }}
                        >
                            {isPasswordVisible ? 
                            <FaRegEye 
                                className={style.eye}
                                style={{
                                    color: theme === 'light' ? 'gray' : 'white',
                                }}
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                size={28}
                            /> : 
                            <FaRegEyeSlash 
                                className={style.eye}
                                style={{
                                    color: theme === 'light' ? 'gray' : 'white',
                                }}
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                size={28}
                            />}
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        className={`${style.passwordSubmitButton} ${style[theme]}`}
                        style={{
                            color: theme === 'light' ? 'black' : 'white'
                        }}
                    >
                        {isResetPassword ? 'Confirm' : 'Unlock'}
                    </button>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            textAlign: 'center',
                            width: '100%'
                        }}
                    >
                        <button 
                            className={style.resetPassword} 
                            onClick={() => handleSendResetCode()}
                            disabled = {isResetPassword || isThrottled}
                            title={isThrottled ? 'Try Again After Some Time!' : 'Reset Password'}
                            style={{
                                cursor: isResetPassword || isThrottled ? 'not-allowed' : 'pointer'
                            }}
                        > 
                            Reset Password
                        </button>
                        {isResetPassword && 
                        <div>
                            <div>
                                <VerificationInput 
                                    theme={theme}
                                    resetCode={resetCode}
                                    setResetCode={setResetCode}
                                />
                            </div>
                            <div 
                                className={`${style.resetPassword}`} 
                                onClick={() => setIsResetPassword(false)}
                            >
                                Cancel
                            </div>
                        </div>
                        }
                    </div>
                </div>
            </form>
        </div>
    );
}

export default PasswordForm;