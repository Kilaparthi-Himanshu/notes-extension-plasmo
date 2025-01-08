import React from 'react';
import styleText from "data-text:./dropdownStyles.module.css"
import * as style from "./dropdownStyles.module.css"
import { useContext } from 'react';
import { DropdownContext } from '~components/context';

export const getDropdownStyle = () => {
    const style = document.createElement("style");
    style.textContent = styleText;
    return style;
}

const ThemeToggle = () => {
    const {theme, handleThemeChange} = useContext(DropdownContext);

    return (
        <div className={`${style.dropdownCard} ${style[theme]}`}>
            <div>
                Theme:
            </div>
            <div>
                <div className={style.themeToggle}>
                    <button
                        className={`${style.themeButton} ${theme === 'light' ? style.active : ''}`}
                        onClick={() => handleThemeChange('light')}
                        title="Light Theme"
                    >
                        🌞
                    </button>
                    <button
                        className={`${style.themeButton} ${theme === 'dark' ? style.active : ''}`}
                        onClick={() => handleThemeChange('dark')}
                        title="Dark Theme"
                    >
                        🌙
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ThemeToggle;