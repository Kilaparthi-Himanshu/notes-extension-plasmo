import React from 'react';
import { Menu } from 'lucide-react';
import styleText from "data-text:./styles.module.css";
import * as style from "./styles.module.css";

interface DropDownProps {
    theme: string;
}

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = styleText;
    return style;
}

const Dropdown = ({ theme }: DropDownProps) => {
    
    return (
        <div className={style.hamburger}>
            <Menu 
                style={{
                    color: theme === "light" ? "black" : "white"
                }}
            />
        </div>
    )
}

export default Dropdown