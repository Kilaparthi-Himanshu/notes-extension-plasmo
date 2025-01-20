import React, { useState } from 'react';
import * as style from '../styles.module.css';
import passwordChecker from './passwordFunctions';
import {Check, Eye, EyeOff} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const PasswordForm = ({ theme, setRequirePassword, password}: { theme: string, setRequirePassword: (value: boolean) => void, password: string}) => {
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

    const handleResetPassword = () => {
        alert('Password reset successfully');
        setIsResetPassword(true);
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
                    handlePasswordSubmit();
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
                            Enter Password
                        <div className={style.borderBottom} style={{width: '100%'}}></div>
                    </label>
                    <div style={{position: 'relative'}}>
                        <input 
                            required
                            type={isPasswordVisible ? 'text' : 'password'}
                            placeholder="Enter password..."
                            className={style.passwordInput}
                            style={{
                                backgroundColor: theme === 'light' ? 'white' : 'darkgray',
                                color: 'black'
                            }}
                            onChange={(e) => setPassword1(e.target.value)}
                        />
                        <div className={style.passwordEye}>
                            {isPasswordVisible ? 
                            <EyeOff 
                                className={style.eye}
                                style={{
                                    color: theme === 'light' ? 'white' : 'black',
                                }}
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            /> : 
                            <Eye 
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
                        Unlock
                    </button>
                    <div>
                        <div 
                            className={style.resetPassword} 
                            onClick={() => handleResetPassword()}
                        > 
                            Reset Password
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default PasswordForm;