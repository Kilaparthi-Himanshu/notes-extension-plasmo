import React from 'react';

function IndexPopup() {
    const handleInject = async () => {
        try {
            const [tab] = await chrome.tabs.query({ 
                active: true, 
                currentWindow: true 
            });

            if (!tab.id) return;

            await chrome.tabs.sendMessage(tab.id, { 
                type: "INJECT_COMPONENT"
            });

        } catch (err) {
            console.error("Failed:", err);
        }
    };

    return (
        <div>
            <button onClick={handleInject}
                style={{
                    backgroundColor: 'lightblue',
                    padding: '10px',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer'
                }}
            >
                Add Note
            </button>
        </div>
    );
}

export default IndexPopup;