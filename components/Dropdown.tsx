import React from 'react';
import { Menu } from 'lucide-react';
import styleText from "data-text:./styles.module.css";
import * as style from "./styles.module.css";
import { useState } from 'react';
import ThemeToggle from './DropdownItems/ThemeToggle';
import ColorToggle from './DropdownItems/ColorToggle';
import PinToggle from './DropdownItems/PinToggle';
import PersistToggle from './DropdownItems/PersistToggle';
import { useContext } from 'react';
import { DropdownContext } from './context';

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = styleText;
    return style;
}

const Dropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {theme} = useContext(DropdownContext);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 200); // Match animation duration
    };

    return (
        <div>
            <div className={style.hamburger} title="Options">
                <Menu 
                    style={{
                        color: isOpen 
                                    ? "red"
                                    : theme === "light" ? "black" : "white",
                    }}
                    onClick={() => isOpen ? handleClose() : setIsOpen(true)} 
                />
            </div>
            {isOpen && (
                <div className={`${style.dropdown} ${isClosing ? style.dropdownClose : ''}`} onMouseDown={(e) => e.stopPropagation()} 
                style={{backgroundColor: theme === "light" ? 
                    "rgb(175, 175, 175)" : "rgb(70, 70, 70)", 
                    color: theme === "light" ? "#2e2e2e" : "white"}}
                >
                    <ThemeToggle />
                    <div className={style.borderBottom}></div>
                    <ColorToggle />
                    <div className={style.borderBottom}></div>
                    <PinToggle />
                    <div className={style.borderBottom}></div>
                    <PersistToggle />
                </div>
            )}
        </div>
    )
}

export default Dropdown;