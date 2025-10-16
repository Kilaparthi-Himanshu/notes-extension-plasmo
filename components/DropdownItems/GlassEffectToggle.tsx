import React, { useContext } from 'react';
import * as style from "./dropdownStyles.module.css"
import { DropdownContext } from '~components/context';
import { Sparkles } from 'lucide-react';

const GlassEffectToggle = () => {
    const { glassEffect, setGlassEffect, theme } = useContext(DropdownContext);

    const handleGlassEffect = () => {
        setGlassEffect(!glassEffect);
    }

    return (
        <div className={`${style.dropdownCard} ${style[theme]}`} onClick={handleGlassEffect}>
            <div>
                Glass
            </div>
            <div>
                <div title="Pin Note" className={style.pinsContainer}>
                    <Sparkles
                        style={{
                            color: glassEffect
                                ? "#9B5EFF"
                                : theme === "light" ? "black" : "white",
                            marginTop: "3.3px",
                        }}
                        size={24}
                        className={style.pinIcon}
                        onClick={handleGlassEffect}
                    />
                </div>
            </div>
        </div>
    );
}

export default GlassEffectToggle
