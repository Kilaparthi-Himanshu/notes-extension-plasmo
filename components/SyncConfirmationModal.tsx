import React from 'react';
import * as style from './styles.module.css';

export const SyncConfirmationModal = ({
    customColor,
    setSync,
    setShowSyncConfirmationModal,
}: {
    customColor: string;
    setSync: (value: boolean) => void;
    setShowSyncConfirmationModal: (value: boolean) => void;
}) => {
    return (
        <div className={style.passwordOverlay}
            style={{
                backgroundColor: customColor
            }}
            onClick={() => setShowSyncConfirmationModal(false)} // PURELY DEBUG PURPOSE
        >
            GGWP
        </div>
    );
}
