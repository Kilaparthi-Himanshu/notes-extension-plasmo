import React from 'react';
import * as style from "./dropdownStyles.module.css"
import { useContext } from 'react';
import { DropdownContext } from '~components/context';

const FontToggle = () => {

    const {font, setFont, theme} = useContext(DropdownContext);

    return (
        <div className={`${style.dropdownCard} ${style[theme]}`}>
            <div>Font:</div>
            <select value={font} 
                onChange={(e) => setFont(e.target.value)} 
                className={style.fontSelect}
                style={{backgroundColor: theme === "light" ? 
                    "rgb(175, 175, 175)" : "rgb(70, 70, 70)",
                    color: theme === "light" ? "#2e2e2e" : "white",
                    border: theme === "light" ? "2px solid rgb(70, 70, 70)" : "2px solid rgb(175, 175, 175)"}}
            >
                <option value="Gill Sans MT">Gill Sans MT</option>
                <option value="Roboto">Roboto</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
                <option value="Lucida Console">Lucida Console</option>
                <option value="Lucida Handwriting">Lucida Handwriting</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
            </select>
        </div>
    )
}

export default FontToggle