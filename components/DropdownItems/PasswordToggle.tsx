import React, { useState } from 'react';
import * as style from "./dropdownStyles.module.css"
import { useContext } from 'react';
import { DropdownContext } from '~components/context';
import { Lock, LockOpen } from 'lucide-react';

const PasswordToggle = () => {

    const {theme, isPasswordProtected, setIsPasswordProtected, showNewPasswordForm, setShowNewPasswordForm} = useContext(DropdownContext);

    const passWordFormToggle = () => {
        setIsPasswordProtected(!isPasswordProtected);
        setShowNewPasswordForm(!isPasswordProtected);
    }

    return (
        <>
            <div className={`${style.dropdownCard} ${style[theme]}`} onClick={passWordFormToggle}>
                <div>Password</div>
                <div onClick={passWordFormToggle} 
                    className={style.pinsContainer}
                >
                    {isPasswordProtected ? <Lock style={{color: "red"}}/> : <LockOpen />}
                </div>
            </div>
        </>
    )
}

export default PasswordToggle;