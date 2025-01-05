import React from 'react';
import { Menu } from 'lucide-react';
import styleText from "data-text:./styles.module.css";
import * as style from "./styles.module.css";
import { useState } from 'react';

interface DropDownProps {
    theme: string;
}

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = styleText;
    return style;
}

const Dropdown = ({ theme }: DropDownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div>
            <div className={style.hamburger}>
                <Menu 
                    style={{
                        color: isOpen 
                                    ? "red"
                                    : theme === "light" ? "black" : "white",
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                />
            </div>
            {isOpen && (
                <div className={style.dropdown}>
                    <div style={{
                        backgroundColor: "gray",
                        width: "90%",
                        height: "50px",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        margin: "10px",
                        cursor: "pointer",
                        borderRadius: "10px",
                    }}>GG</div>
                    <div style={{
                        backgroundColor: "gray",
                        width: "90%",
                        height: "50px",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        margin: "10px",
                        cursor: "pointer",
                        borderRadius: "10px",
                    }}>GG</div>
                    <div style={{
                        backgroundColor: "gray",
                        width: "90%",
                        height: "50px",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        margin: "10px",
                        cursor: "pointer",
                        borderRadius: "10px",
                    }}>GG</div>
                </div>
            )}
        </div>
    )
}

export default Dropdown