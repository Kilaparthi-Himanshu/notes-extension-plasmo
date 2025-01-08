import React from 'react';
import { DropdownContext } from '~components/context';
import * as style from "./dropdownStyles.module.css"
import { useContext } from 'react';
import { Repeat } from 'lucide-react';

const PersistToggle = () => {

    const {active, handleActive, theme} = useContext(DropdownContext);
    return (
        <div className={`${style.dropdownCard} ${style[theme]}`} onClick={handleActive}>
            <div>
                Persist:
            </div>
            <div>
                <div title="Persist" className={style.pinsContainer}>
                    <Repeat
                        style={{
                            color: active 
                                ? "red"
                                : theme === "light" ? "black" : "white",
                            marginTop: "2px"
                        }}
                        size={20}
                        onClick={handleActive}
                    />
                </div>
            </div>
        </div>
    );
}

export default PersistToggle;