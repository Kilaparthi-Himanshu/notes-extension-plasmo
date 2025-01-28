import React from 'react';
import * as style from '../styles.module.css';

const VerificationInput = ({ theme, setResetCode }: { theme: string, resetCode: string, setResetCode: (code: string) => void }) => {

    return (
        <div>
            <input 
                placeholder=" _____"
                type="text" 
                className={`${style.verificationInput} ${style[theme]}`}
                required
                maxLength={5}
                onChange={(e) => setResetCode(e.target.value)}
            />
        </div>
    );
}

export default VerificationInput;