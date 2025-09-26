import React from "react";
import { Check, Minimize, X } from "lucide-react";

export default function TrafficLights () {
    return (
        <div className='w-[160px] h-[35px] relative flex justify-end items-center space-x-3 pr-2'>
            {/* <svg viewBox="0 0 50 35" width="100%" height="100%" preserveAspectRatio="none">
                <path
                d="M0,0 L31,0 C3,0 31,35 0,35"
                fill="#454545"
                />
            </svg> */}

            <div className='bg-green-400 group rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center hover:scale-110 transition-[scale]'>
                <Check
                className="hidden group-hover:block transition-[display] relative text-[green] mx-[4px]"
                size={10}
                /> 
            </div>

            <div className='bg-[#FFBF48] group rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center hover:scale-110 transition-[scale]'>
                <Minimize
                className="hidden group-hover:block transition-[display] relative text-[rgb(158,124,0)]"
                size={14}
                />
            </div>

            <div className='bg-[#FF4848] group rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center hover:scale-110 transition-[scale] relative text-[darkred]'>
                <X
                className="hidden group-hover:block"
                size={14}
                />
            </div>
            </div>
    );
}