import React from 'react';
import * as style from './styles.module.css';
import type { TipTapEditorHandle } from '../hooks/useEditorExports';
import { TbFileTypePdf } from "react-icons/tb";
import { TbFileTypeHtml } from "react-icons/tb";
import { TbMarkdown } from "react-icons/tb";
import { TbFileTypeDocx } from "react-icons/tb";

export const ExportModal = ({
    customColor,
    theme,
    setShowExportModal,
    editorRef
}: {
    customColor: string;
    theme: string;
    setShowExportModal: (value: boolean) => void;
    editorRef: React.MutableRefObject<TipTapEditorHandle>
}) => {
    const handleClose = () => {
        setShowExportModal(false);
    }

    return (
        <div className={style.passwordOverlay}
            style={{
                backgroundColor: customColor
            }}
        >
            <div className={`z-10 relative rounded-xl w-max min-w-[300px] h-max bg-linear-to-tr shadow-2xl ${theme === 'light' ? 'bg-white text-stone-700' : 'bg-neutral-800 text-stone-200'} flex flex-col items-center justify-center gap-2 overflow-hidden`}>
                <p className={`text-[28px] ${theme === 'light' ? 'text-white bg-neutral-700' : 'text-neutral-800 bg-white'} w-full flex items-center justify-center`}>
                    Export Note
                </p>
                <div className='flex flex-col gap-2 items-center justify-center px-4 py-1 w-full'>
                    <button 
                        className={`w-full flex justify-between ${theme === "light" ? "bg-neutral-800 text-stone-200" : "bg-white text-stone-700"} p-2 rounded-lg cursor-pointer active:scale-[97%] transition-all hover:outline hover:outline-purple-400`}
                        onClick={() => {
                            console.log("SEE THIS: ", editorRef);
                            editorRef.current?.exportMarkdown()}
                        }
                    >
                        <span>Markdown</span>

                        <TbMarkdown size={24} />
                    </button>

                    <button 
                        className={`w-full flex justify-between ${theme === "light" ? "bg-neutral-800 text-stone-200" : "bg-white text-stone-700"} p-2 rounded-lg cursor-pointer active:scale-[97%] transition-all hover:outline hover:outline-purple-400`}
                        onClick={() => {
                            console.log("SEE THIS: ", editorRef);
                            editorRef.current?.exportHtml()}
                        }
                    >
                        <span>HTML</span>

                        <TbFileTypeHtml size={24} />
                    </button>

                    <button 
                        className={`w-full flex justify-between ${theme === "light" ? "bg-neutral-800 text-stone-200" : "bg-white text-stone-700"} p-2 rounded-lg cursor-pointer active:scale-[97%] transition-all hover:outline hover:outline-purple-400`}
                        onClick={() => {
                            console.log("SEE THIS: ", editorRef);
                            editorRef.current?.exportPdf()}
                        }
                    >
                        <span className='flex gap-2'>
                            PDF
                            <span
                                className="
                                    text-[10px]
                                    py-1
                                    px-1
                                    rounded-full
                                    bg-amber-400
                                    text-purple-600
                                    font-medium
                                "
                            >
                                Recommended
                            </span>
                        </span>

                        <TbFileTypePdf size={24} />
                    </button>

                    <button 
                        className={`w-full flex justify-between ${theme === "light" ? "bg-neutral-800 text-stone-200" : "bg-white text-stone-700"} p-2 rounded-lg cursor-pointer active:scale-[97%] transition-all hover:outline hover:outline-purple-400`}
                        onClick={() => {
                            console.log("SEE THIS: ", editorRef);
                            editorRef.current?.exportDocx()}
                        }
                    >
                        <span>DOCX</span>

                        <TbFileTypeDocx size={24} />
                    </button>
                </div>

                <div className="w-full flex items-center justify-end gap-3 text-neutral-800 font-semibold px-4 py-4">
                    <button 
                        className="w-max h-max bg-red-400 text-red-800 px-4 py-2 rounded-lg cursor-pointer shadow-lg active:scale-95 transition-all"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
