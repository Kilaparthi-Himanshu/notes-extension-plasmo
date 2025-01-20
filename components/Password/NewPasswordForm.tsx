import React, { useState } from 'react';
import * as style from '../styles.module.css';
import passwordChecker from './passwordFunctions';
import { Eye, EyeOff } from 'lucide-react';

const NewPasswordForm = ({ theme, setShowNewPasswordForm, setPassword, email, setEmail}: { theme: string, setShowNewPasswordForm: (value: boolean) => void, setPassword: (value: string) => void, email: string, setEmail: (value: string) => void}) => {
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [isPasswordVisible1, setIsPasswordVisible1] = useState(false);
    const [isPasswordVisible2, setIsPasswordVisible2] = useState(false);

    const handleSubmit = () => {
        if (passwordChecker(password1, password2)) {
            setShowNewPasswordForm(false);
            setPassword(password1);
        } else {
            alert('Passwords do not match');
        }
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
                    handleSubmit();
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
                            Enter New Password
                        <div className={style.borderBottom} style={{width: '100%'}}></div>
                    </label>
                    <div style={{position: 'relative'}}>
                        <input 
                            required
                            type={isPasswordVisible1 ? 'text' : 'password'}
                            placeholder="Enter password..."
                            className={style.passwordInput}
                            style={{
                                backgroundColor: theme === 'light' ? 'white' : 'darkgray',
                                color: 'black'
                            }}
                            onChange={(e) => setPassword1(e.target.value)}
                        />
                        <div className={style.passwordEye}>
                            {isPasswordVisible1 ? 
                            <EyeOff 
                                className={style.eye}
                                style={{
                                    color: theme === 'light' ? 'white' : 'black',
                                }}
                                onClick={() => setIsPasswordVisible1(!isPasswordVisible1)}
                            /> : 
                            <Eye 
                                className={style.eye}
                                style={{
                                    color: theme === 'light' ? 'white' : 'black',
                                }}
                                onClick={() => setIsPasswordVisible1(!isPasswordVisible1)}
                            />}
                        </div>
                    </div>
                    <div style={{position: 'relative'}}>
                        <input 
                            required
                            type={isPasswordVisible2 ? 'text' : 'password'}
                            placeholder="Confirm password..."
                            className={style.passwordInput}
                            style={{
                                backgroundColor: theme === 'light' ? 'white' : 'darkgray',
                                color: 'black'
                            }}
                            onChange={(e) => setPassword2(e.target.value)}
                        />
                        <div className={style.passwordEye}>
                            {isPasswordVisible2 ? 
                            <EyeOff 
                                className={style.eye}
                                style={{
                                    color: theme === 'light' ? 'white' : 'black',
                                }}
                                onClick={() => setIsPasswordVisible2(!isPasswordVisible2)}
                            /> : 
                            <Eye 
                                className={style.eye}
                                style={{
                                    color: theme === 'light' ? 'white' : 'black',
                                }}
                                onClick={() => setIsPasswordVisible2(!isPasswordVisible2)}
                            />}
                        </div>
                    </div>
                    <div style={{position: 'relative'}}>
                        <input 
                            required
                            type="email"
                            placeholder="Enter recovery email..."
                            className={style.passwordInput}
                            style={{
                                backgroundColor: theme === 'light' ? 'white' : 'darkgray',
                                color: 'black'
                            }}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className={style.passwordSubmitButton}
                        style={{
                            color: theme === 'light' ? 'black' : 'white'
                        }}
                    >
                        Set Password
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NewPasswordForm;