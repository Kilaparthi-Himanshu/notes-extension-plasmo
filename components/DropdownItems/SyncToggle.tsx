import React from 'react';
import * as style from "./dropdownStyles.module.css"
import { useContext } from 'react';
import { DropdownContext } from '~components/context';
import { MdSyncLock } from "react-icons/md";

const SyncToggle = ({
    handleClose
}: {
    handleClose: () => void;
}) => {

    const { sync, setSync, showSyncConfirmationModal, setShowSyncConfirmationModal, theme } = useContext(DropdownContext);

    const handleToolbarToggle = () => {
        setShowSyncConfirmationModal(true);
        handleClose();
    }

    return (
        <div className={`${style.dropdownCard} ${style[theme]}`} onClick={handleToolbarToggle}>
            <div>
                Sync
            </div>
            <div>
                <div title="Pin Note" className={`${style.pinsContainer} ${style.proPinsContainer} ${style[theme]}`}>
                    <MdSyncLock
                        style={{
                            color: sync
                                ? "#32D74B"
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

export default SyncToggle;