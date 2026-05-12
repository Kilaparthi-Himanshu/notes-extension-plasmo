import React from 'react';
import { Link } from "react-router-dom";
import NoteToGoIcon from "~assets/icon.png";
import { FaSignInAlt } from "react-icons/fa";
import { MdOutlineBugReport } from "react-icons/md";
import TrafficLights from '~components/misc/TrafficLight';

function Home() {
    return (
        <div className="relative w-dvw h-dvh bg-neutral-800 overflow-hidden flex items-center max-lg:flex-col">
            <div style={{
                    "backgroundColor": "#200436",
                    "backgroundImage": 'url("https://transparenttextures.com/patterns/axiom-pattern.png")'
                }}
                className="w-full h-full absolute z-0"
            />

            <div className="w-full flex items-center justify-center h-[200px] gap-[20px] z-10">
                <span className="text-8xl max-sm:text-6xl text-white underline decoration-purple-200 decoration-[4px] underline-offset-4">NoteToGo</span>
                <img src={NoteToGoIcon} className="size-[80px] max-sm:size-[60px]" />
            </div>

            <div className='w-full h-full flex flex-col gap-4 items-center justify-center z-10'>
                <div className='bg-neutral-900 w-[400px] h-max flex flex-col items-center justify-center text-white p-8 pt-14 rounded-3xl gap-6 shadow-[0_0_5px_3px_#c084fc] relative'>
                    <div className="absolute top-2 right-2">
                        <TrafficLights />
                    </div>

                    <Link 
                        to="/signin" 
                        className="w-full h-[60px] text-violet-300 text-2xl outline-none border-2 border-transparent hover:border-2 hover:border-purple-400 bg-neutral-800 transition-all duration-[100ms] active:scale-95 flex items-center justify-between px-4 gap-4 rounded-xl"
                    >
                        <span className='text-center'>Authentication</span>

                        <FaSignInAlt className='text-center text-blue-400' />
                    </Link>

                    <Link 
                        to="/bug-report"
                        className="w-full h-[60px] text-violet-300 text-2xl outline-none border-2 border-transparent hover:border-2 hover:border-purple-400 bg-neutral-800 transition-all duration-[100ms] active:scale-95 flex items-center justify-between px-4 gap-4 rounded-xl"
                    >
                        <span className='text-center'>Bug Report</span>

                        <MdOutlineBugReport size={30} className='text-center text-green-400' />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;
