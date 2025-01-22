import React, { useState } from 'react';
import * as style from '../styles.module.css';
import passwordChecker from './passwordFunctions';
import { Eye, EyeOff} from 'lucide-react';
import VerificationInput from './VerificationInput';

const PasswordForm = ({ theme, setRequirePassword, password, email, setShowNewPasswordForm}: { theme: string, setRequirePassword: (value: boolean) => void, password: string, email: string, setShowNewPasswordForm: (value: boolean) => void}) => {
    const [password1, setPassword1] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isResetPassword, setIsResetPassword] = useState(false);

    const handlePasswordSubmit = () => {
        if (passwordChecker(password, password1)) {
            setRequirePassword(false);
        } else {
            alert('Wrong password');
        }
    }

    const handleSendResetCode = () => {
        alert(`Reset Code Sent to ${email}`);
        setIsResetPassword(true);
    }

    const handleResetPassword = () => {
        alert(`GG`);
        setIsResetPassword(false);
        setIsPasswordVisible(false);
        setRequirePassword(false);
        setShowNewPasswordForm(true);
    }

    return (
        <div 
            className={style.passwordOverlay}
            style={{
                backgroundColor: theme === "light" ? 
                    "rgb(175, 175, 175)" : "rgb(70, 70, 70)"
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
                            className={style.passwordInput}
                            style={{
                                backgroundColor: isResetPassword ? 'lightgray' : theme === 'light' ? 'white' : 'darkgray',
                                color: 'black',
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
                            <Eye 
                                className={style.eye}
                                style={{
                                    color: theme === 'light' ? 'white' : 'black',
                                }}
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            /> : 
                            <EyeOff 
                                className={style.eye}
                                style={{
                                    color: theme === 'light' ? 'white' : 'black',
                                }}
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            />}
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        className={style.passwordSubmitButton}
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
                        <div 
                            className={style.resetPassword} 
                            onClick={() => handleSendResetCode()}
                        > 
                            Reset Password
                        </div>
                        {isResetPassword && 
                        <div>
                            <div>
                                <VerificationInput 
                                    theme={theme}
                                />
                            </div>
                            <div 
                                className={style.resetPassword} 
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