import React from 'react';


const NoteSpinner = () => {
    return (
        <div className="flex flex-row gap-2">
            <div className="w-4 h-4 rounded-full bg-[#be5cf7] shadow-md animate-bounce"></div>
            <div className="w-4 h-4 rounded-full bg-[#be5cf7] shadow-md animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-4 h-4 rounded-full bg-[#be5cf7] shadow-md animate-bounce [animation-delay:-.5s]"></div>
        </div>
    );
}

export default NoteSpinner;
