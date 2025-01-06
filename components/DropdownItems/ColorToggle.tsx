import React from 'react';
import * as style from "./dropdownStyles.module.css"
import { DropdownContext } from '~components/context';
import { useContext } from 'react';

const ColorToggle = () => {
    const {customColor, setTextAreaColor, theme} = useContext(DropdownContext);

    return (
        <div className={`${style.dropdownCard} ${style[theme]}`}>
            <div>Color:</div>
            <div>
                <input
                    title="Choose Note Color"
                    className={style.colorSelector}
                    type="color"
                    value={customColor}
                    onChange={(e) => setTextAreaColor(e.target.value)}
                />
            </div>
        </div>
    );
}

export default ColorToggle;