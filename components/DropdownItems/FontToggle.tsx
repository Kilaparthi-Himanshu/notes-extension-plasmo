import React, { useState } from 'react';
import * as style from "./dropdownStyles.module.css"
import { useContext } from 'react';
import { DropdownContext } from '~components/context';
import FontMenu from './SubDropdownItems/FontMenu';
import { ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

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
                    <motion.div animate={{rotate: openFontMenu ? 180 : 0}}>
                        <ChevronUp style={{color: openFontMenu ? "red" : "white", paddingTop: "3px"}}/>
                    </motion.div>
                </div>
            </div>
            <FontMenu isVisible={openFontMenu} />
        </>
    );
}

export default FontToggle;