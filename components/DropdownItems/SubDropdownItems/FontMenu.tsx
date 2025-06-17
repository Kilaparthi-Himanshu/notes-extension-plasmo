import React, { useState, useEffect } from 'react';
import * as style from "../dropdownStyles.module.css";
import { useContext } from 'react';
import {DropdownContext} from "./../../context";
import { motion, AnimatePresence } from 'framer-motion';

const FontMenu = ({isVisible}: {isVisible: boolean}) => {
    const {font, setFont, theme, fontSize, setFontSize, fontColor, setFontColor} = useContext(DropdownContext);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", gap: "8px"}}
                    initial={{opacity: 0, height: "0px"}}
                    animate={{opacity: 1, height: "auto"}}
                    exit={{opacity: 0, height: "0px"}}
                    transition={{duration: 0.2}}
            >
                <div className={`${style.fontMenu} ${style[theme]}`}>
                    <div>
                        Style
                    </div>
                    <select value={font} 
                        onChange={(e) => setFont(e.target.value)} 
                        className={style.fontSelect}
                        style={{backgroundColor: theme === "light" ? 
                            "white" : "#262626",
                            color: theme === "light" ? "black" : "white",
                            border: theme === "light" ? "2px solid #262626" : "2px solid white"}}
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

                <div className={`${style.fontMenu} ${style[theme]}`}>
                    <div>Size</div>
                    <input className={style.fontSizeSelect} 
                        type="number" 
                        value={fontSize} 
                        min={8}
                        max={80}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        style={{backgroundColor: theme === "light" ? 
                            "white" : "#262626",
                            color: theme === "light" ? "black" : "white",
                            border: theme === "light" ? "2px solid #262626" : "2px solid white"}}
                    />
                </div>

                <div className={`${style.fontMenu} ${style[theme]}`}>
                    <div>
                        Color
                    </div>
                    <input 
                        type="color" 
                        className={style.colorSelector} 
                        value={fontColor} 
                        onChange={(e) => setFontColor(e.target.value)} 
                    />
                </div>
            </motion.div>
            )}
        </AnimatePresence>
    );
}

export default FontMenu;