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

    const { sync, setShowSyncConfirmationModal, syncToggleEnable, theme, saved } = useContext(DropdownContext);

    const handleToolbarToggle = () => {
        setShowSyncConfirmationModal(true);
        handleClose();
    }

    const titleForSync = () => {
        return sync ? 'You Cannot Turn Off Sync' : !saved ? 'Save The Note To Enable Sync' : !syncToggleEnable ? 'Pro Subscription Required' : 'Turn On Sync';
    }

    return (
        <div 
            className={`${style.dropdownCard} ${style[theme]}`} onClick={() => syncToggleEnable && handleToolbarToggle()} 
            title={titleForSync()}
        >
            <div className={`${!syncToggleEnable && 'text-neutral-500'}`} >
                Sync
            </div>
            <div>
                <div title="Sync Note" className={`${style.pinsContainer} ${style.proPinsContainer} ${style[theme]}`}>
                    <MdSyncLock
                        style={{
                            color: !syncToggleEnable 
                                ? "#737373"
                                : sync 
                                ? "#32D74B"
                                : theme === "light" 
                                ? "black" 
                                : "white",
                            marginTop: "3.3px",
                        }}
                        size={24}
                        className={style.pinIcon}
                    />
                </div>
            </div>
        </div>
    );
}

export default SyncToggle;
