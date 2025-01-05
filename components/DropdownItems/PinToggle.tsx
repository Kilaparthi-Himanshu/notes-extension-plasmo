import React from 'react';
import styleText from "data-text:./dropdownStyles.module.css"
import * as style from "./dropdownStyles.module.css"
 
export const getDropdownStyle = () => {
    const style = document.createElement("style");
    style.textContent = styleText;
    return style;
}

const PinToggle = () => {
    return (
        <div className={style.dropdownCard}>
            Pin:
        </div>
    );
}

export default PinToggle;

// style={{borderBottom: "1px solid #5e5e5e"}}