import React from 'react';
import * as style from "./dropdownStyles.module.css"
import { useContext } from 'react';
import { DropdownContext } from '~components/context';
import { CgToolbarBottom } from "react-icons/cg";

const ToolbarToggle = () => {

    const { showToolbar, setShowToolbar, theme } = useContext(DropdownContext);

    const handleToolbarToggle = () => {
        setShowToolbar(!showToolbar);
    }

    return (
        <div className={`${style.dropdownCard} ${style[theme]}`} onClick={handleToolbarToggle}>
            <div>
                Toolbar
            </div>
            <div>
                <div title="Pin Note" className={`${style.pinsContainer} ${style.proPinsContainer} ${style[theme]}`}>
                    <CgToolbarBottom
                        style={{
                            color: showToolbar
                                ? "#c45533"
                                : theme === "light" ? "black" : "white",
                            marginTop: "3.3px",
                        }}
                        size={24}
                        className={style.pinIcon}
                        onClick={handleToolbarToggle}
                    />
                </div>
            </div>
        </div>
    );
}

export default ToolbarToggle;