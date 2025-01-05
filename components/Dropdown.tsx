import React from 'react';
import { Menu } from 'lucide-react';
import styleText from "data-text:./styles.module.css";
import * as style from "./styles.module.css";
import { useState } from 'react';
import ThemeToggle from './DropdownItems/ThemeToggle';
import ColorToggle from './DropdownItems/ColorToggle';
import PinToggle from './DropdownItems/PinToggle';
import PersistToggle from './DropdownItems/PersistToggle';

interface DropDownProps {
    theme: string;
}

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = styleText;
    return style;
}

const Dropdown = ({ theme }: DropDownProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <div className={style.hamburger}>
                <Menu 
                    style={{
                        color: isOpen 
                                    ? "red"
                                    : theme === "light" ? "black" : "white",
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                />
            </div>
            {isOpen && (
                <div className={style.dropdown}>
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