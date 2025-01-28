import React from 'react';
import * as style from "./dropdownStyles.module.css"
import { DropdownContext } from '~components/context';
import { useContext } from 'react';
import { Pin } from 'lucide-react';

const PinToggle = () => {
    const {pinned, handlePin, theme} = useContext(DropdownContext);

    return (
        <div className={`${style.dropdownCard} ${style[theme]}`} onClick={handlePin}>
            <div>
                Pin
            </div>
            <div>
                <div title="Pin Note" className={style.pinsContainer}>
                    <Pin
                        style={{
                            color: pinned
                                ? "red"
                                : theme === "light" ? "black" : "white",
                            marginTop: "3.3px",
                        }}
                        size={24}
                        className={style.pinIcon}
                        onClick={handlePin}
                    />
                </div>
            </div>
        </div>
    );
}

export default PinToggle;