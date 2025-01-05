import React from 'react';
import styleText from "data-text:./dropdownStyles.module.css"
import * as style from "./dropdownStyles.module.css"
 
export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = styleText;
    return style;
}

const ThemeToggle = () => {
    return (
        <div className={style.dropdownCard}>
            Theme:
        </div>
    );
}

export default ThemeToggle;