import React from 'react';
import { RiMenu2Line } from "react-icons/ri";
import styleText from "data-text:./styles.module.css";
import * as style from "./styles.module.css";
import { useState } from 'react';
import ThemeToggle from './DropdownItems/ThemeToggle';
import GlassEffectToggle from './DropdownItems/GlassEffectToggle';
import ColorToggle from './DropdownItems/ColorToggle';
import PinToggle from './DropdownItems/PinToggle';
import PersistToggle from './DropdownItems/PersistToggle';
import FontToggle from './DropdownItems/FontToggle';
import PasswordToggle from './DropdownItems/PasswordToggle';
import { useContext, useRef, useEffect } from 'react';
import { DropdownContext } from './context';
import { useFeatureFlags } from '~hooks/useFeatureFlags';
import tailwindStyles from "data-text:../styles/global.css";

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = styleText + tailwindStyles;
    return style;
}

const Dropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {theme, requirePassword} = useContext(DropdownContext);
    const [isClosing, setIsClosing] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 200); // Match animation duration
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                handleClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const { canHaveGlassEffect } = useFeatureFlags();

    return (
        <div>
            <div 
                className={style.hamburger}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    if (requirePassword) {
                        e.preventDefault();
                        return;
                    } else {
                        isOpen ? handleClose() : setIsOpen(true)
                    }
                }}
                style={{
                    cursor: requirePassword ? "not-allowed" : "pointer",
                    width: '40px', // old value is 38px
                    height: '40px' // old value is 38px
                }}
                title={requirePassword ? "Unlock Note To Open Options" : "Options"}
            >
                {/* <RiMenu2Line
                    style={{
                        color: isOpen 
                            ? "red"
                            : theme === "light" ? "black" : "white",
                    }}
                    className='w-full h-full'
                /> */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{
                        color: isOpen 
                            ? "red"
                            : theme === "light" ? "black" : "white",
                    }}
                    className='w-full h-full'>
                    <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                </svg>
            </div>
            {isOpen && (
                <div 
                    className={`${style.dropdown} ${isClosing ? style.dropdownClose : ''}`} 
                    onMouseDown={(e) => e.stopPropagation()} 
                    style={{
                        backgroundColor: theme === "light" ? 
                            "white" : "#262626", 
                        color: theme === "light" ? "black" : "white"
                    }}
                    ref={dropdownRef}
                >
                    <ThemeToggle />
                    {canHaveGlassEffect && <GlassEffectToggle />}
                    <ColorToggle />
                    <PinToggle />
                    <PersistToggle />
                    <FontToggle />
                    <PasswordToggle />
                </div>
            )}
        </div>
    )
}

export default Dropdown;