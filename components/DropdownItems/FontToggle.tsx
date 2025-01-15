import React, { useState } from 'react';
import * as style from "./dropdownStyles.module.css"
import { useContext } from 'react';
import { DropdownContext } from '~components/context';
import FontMenu from './SubDropdownItems/FontMenu';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FontToggle = () => {

    const {theme} = useContext(DropdownContext);
    const [openFontMenu, setOpenFontMenu] = useState(false);

    return (
        <>
            <div className={`${style.dropdownCard} ${style[theme]}`} 
                onClick={() => setOpenFontMenu(!openFontMenu)}>
                <div>Font:</div>
                <div onClick={() => setOpenFontMenu(!openFontMenu)} 
                    className={style.pinsContainer}
                >
                    {openFontMenu ? <ChevronUp style={{color: "red"}}/> : <ChevronDown />}
                </div>
            </div>
            {openFontMenu && <FontMenu />}
        </>
    )
}

export default FontToggle;