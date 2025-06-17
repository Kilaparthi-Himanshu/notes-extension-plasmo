import React from 'react';
import { RiMenu2Line } from "react-icons/ri";
import styleText from "data-text:./styles.module.css";
import * as style from "./styles.module.css";
import { useState } from 'react';
import ThemeToggle from './DropdownItems/ThemeToggle';
import ColorToggle from './DropdownItems/ColorToggle';
import PinToggle from './DropdownItems/PinToggle';
import PersistToggle from './DropdownItems/PersistToggle';
import FontToggle from './DropdownItems/FontToggle';
import PasswordToggle from './DropdownItems/PasswordToggle';
import { useContext, useRef, useEffect } from 'react';
import { DropdownContext } from './context';

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = styleText;
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
                    width: '38px',
                    height: '38px'
                }}
                title={requirePassword ? "Unlock Note To Open Options" : "Options"}
            >
                <RiMenu2Line
                    style={{
                        color: isOpen 
                            ? "red"
                            : theme === "light" ? "black" : "white",
                    }}
                    className='w-full h-full'
                />
            </div>
            {isOpen && (
                <div 
                    className={`${style.dropdown} ${isClosing ? style.dropdownClose : ''}`} 
                    onMouseDown={(e) => e.stopPropagation()} 
                    style={{backgroundColor: theme === "light" ? 
                        "white" : "#262626", 
                        color: theme === "light" ? "black" : "white"}}
                    ref={dropdownRef}
                >
                    <ThemeToggle />
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