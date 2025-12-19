import React from 'react';
import * as style from './styles.module.css';

export const SyncConfirmationModal = ({
    customColor,
    setSync,
    setShowSyncConfirmationModal,
    theme
}: {
    customColor: string;
    setSync: (value: boolean) => void;
    setShowSyncConfirmationModal: (value: boolean) => void;
    theme: string;
}) => {
    const handleClose = () => {
        setShowSyncConfirmationModal(false);
    }

    const handleConfirm = () => {
        setSync(true);
        alert("Sync Enabled Successfully!");
        handleClose();
    }

    return (
        <div className={style.passwordOverlay}
            style={{
                backgroundColor: customColor
            }}
        >
            <div className={`z-10 relative rounded-xl w-max h-max bg-linear-to-tr shadow-2xl ${theme === 'light' ? 'bg-white text-stone-700' : 'bg-neutral-800 text-stone-200'} flex flex-col items-center justify-center gap-2 overflow-hidden`}>
                <p className={`text-[28px] ${theme === 'light' ? 'text-white bg-neutral-700' : 'text-neutral-800 bg-white'} w-full flex items-center justify-center`}>
                    Enable Sync for this note?
                </p>
                <div className='flex flex-col gap-2 items-center justify-center px-4 py-1'>
                    <p className="self-start text-xl underline underline-offset-2">
                        Turning on sync will:
                    </p>
                    <p>
                        • Sync this note across all your devices. <br />
                        • Require an internet connection to make edits. <br />
                        • Enable permanent sync - it can’t be turned off later. <br />
                        • Switch the note to read-only if your Pro plan expires. <br />
                        • Remove sync only by deleting the note. <br />
                    </p>
                </div>

                <div className="w-full flex items-center justify-end gap-3 text-neutral-800 font-semibold px-4 py-4">
                    <button 
                        className="w-max h-max bg-red-400 text-red-800 px-4 py-2 rounded-lg cursor-pointer shadow-lg active:scale-95 transition-all"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="w-max h-max bg-green-400 text-green-800 px-4 py-2 rounded-lg cursor-pointer shadow-lg active:scale-95 transition-all"
                        onClick={handleConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
