import React from 'react';
import * as style from '../styles.module.css';

const VerificationInput = ({ theme }: { theme: string }) => {

    return (
        <div>
            <input 
                type="text" 
                className={style.verificationInput}
                required
                maxLength={5}
                style={{
                    backgroundColor: theme === 'light' ? 'white' : 'darkgray',
                    color: 'black',
                }}
            />
        </div>
    );
}

export default VerificationInput;