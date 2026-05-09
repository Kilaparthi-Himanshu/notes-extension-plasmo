import React from 'react';
import * as style from "./dropdownStyles.module.css"
import { DropdownContext } from '~components/context';
import { useContext } from 'react';
import { PiExport } from "react-icons/pi";

const ExportToggle = ({
    handleClose
}: {
    handleClose: () => void;
}) => {
    const {showExportModal, setShowExportModal, theme} = useContext(DropdownContext);

    const handleShowExportModal = () => {
        setShowExportModal(!showExportModal);
        handleClose();
    }

    return (
        <div className={`${style.dropdownCard} ${style[theme]}`} onClick={handleShowExportModal}>
            <div>
                Export
            </div>
            <div>
                <div title="Export Note" className={style.pinsContainer}>
                    <PiExport
                        style={{
                            color: theme === "light" ? "black" : "white",
                            marginTop: "3.3px",
                        }}
                        size={26}
                        className={style.pinIcon}
                        onClick={handleShowExportModal}
                    />
                </div>
            </div>
        </div>
    );
}

export default ExportToggle;