import * as React from "react";
import { Editor } from "@tiptap/react";
import { Bold, Italic, Underline, List, ListOrdered, Strikethrough } from "lucide-react";
import styleText from "data-text:../styles.module.css";
import { FaImages } from "react-icons/fa6";
import { FiAlignLeft } from "react-icons/fi";
import { FiAlignCenter } from "react-icons/fi";
import { FiAlignRight } from "react-icons/fi";
import { FiAlignJustify } from "react-icons/fi";

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent =  styleText;
    return style
}

const MenuBar = ({ editor, editorState, theme }: { 
    editor: Editor | null; 
    editorState: {
        fontSize: number;
        fontFamily: any;
        color: string;
    };
    theme: string;
}) => {
    if (!editor) return null;

    const highlightColor = theme === 'light' ? 'bg-blue-400' : 'bg-blue-500';
    const colorRef = React.useRef<HTMLInputElement>(null);

    const addImage = React.useCallback(() => {
        const url = window.prompt('URL')

        if (url) {
        editor.chain().focus().setImage({ src: url }).run()
        }
    }, [editor]);

    return (
        <div className={`flex flex-col space-y-1 items-center p-1 ${theme === 'light' ? 'bg-neutral-300' : 'bg-[#454545] text-white'} rounded-xl shadow-lg hover:scale-[1.15] transition-transform`}style={{
            border: '1px solid rgba(255, 255, 255, 0.25)'
        }}>
            <div className="flex space-x-2">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`hover:bg-neutral-400 p-1 rounded-lg ${editor.isActive("bold") ? highlightColor : ""}`}
                    title="Bold"
                >
                    <Bold size={16} />
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`hover:bg-neutral-400 p-1 rounded-lg ${editor.isActive("italic") ? highlightColor : ""} cursor-pointer`}
                    title="Italic"
                >
                    <Italic size={16} />
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`hover:bg-neutral-400 p-1 rounded-lg ${editor.isActive("underline") ? highlightColor : ""} cursor-pointer`}
                    title="Underline"
                >
                    <Underline size={16} />
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`hover:bg-neutral-400 p-1 rounded-lg ${editor.isActive("strike") ? highlightColor : ""} cursor-pointer`}
                    title="Strikethrough"
                    >
                    <Strikethrough size={16} />
                </button>

                <select value={editorState.fontFamily ?? ""}
                    onChange={(event) => {
                        editor
                            .chain()
                            .focus()
                            .setFontFamily(event.target.value)
                            .run()
                        }}
                    // className={style.fontSelect}
                    style={{backgroundColor: theme === "light" ? 
                        "white" : "#262626",
                        color: theme === "light" ? "black" : "white",
                        border: theme === "light" ? "2px solid #262626" : "2px solid white"}}
                >
                    <option value="" disabled className='hidden'></option>
                    <option value="Gill Sans MT">Gill Sans MT</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Arial">Arial</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Lucida Console">Lucida Console</option>
                    <option value="Lucida Handwriting">Lucida Handwriting</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                </select>

                <div
                    className="relative hover:bg-neutral-400 p-1 rounded-lg flex items-center justify-center"
                >
                    <input
                        type="color"
                        onInput={(event) => {
                        const color = event.currentTarget.value;

                        editor
                            .chain()
                            .focus()
                            .setColor(color)                    // colors text span
                            .updateAttributes("listItem", {     // update the parent <li>
                                color: color
                            })
                            .run();
                        }}
                        value={editorState.color || "#000000"}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    <div
                        className="w-[16px] h-[16px] rounded-[4px] border border-neutral-900"
                        style={{ backgroundColor: editorState.color || "#000000" }}
                    />
                </div>
            </div>

            <div className="flex space-x-2">
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`hover:bg-neutral-400 p-1 rounded-lg ${editor.isActive("bulletList") ? highlightColor : ""} cursor-pointer`}
                    title="Bullet List"
                >
                    <List size={16} />
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`hover:bg-neutral-400 p-1 rounded-lg ${editor.isActive("orderedList") ? highlightColor : ""} cursor-pointer`}
                    title="Numbered List"
                >
                    <ListOrdered size={16} />
                </button>

                {/* <button
                    onClick={addImage}
                    className={`hover:bg-neutral-400 p-1 rounded-lg cursor-pointer`}
                    title="Image URL Upload"
                >
                    <FaImages size={16} />
                </button> */}
                {/* Planned for later */}

                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`hover:bg-neutral-400 p-1 rounded-lg ${editor.isActive({ textAlign: 'left' }) ? highlightColor : ''}`}
                >
                    <FiAlignLeft />
                </button>

                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`hover:bg-neutral-400 p-1 rounded-lg ${editor.isActive({ textAlign: 'center' }) ? highlightColor : ''}`}
                >
                    <FiAlignCenter />
                </button>

                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`hover:bg-neutral-400 p-1 rounded-lg ${editor.isActive({ textAlign: 'right' }) ? highlightColor : ''}`}
                >
                    <FiAlignRight />
                </button>

                <button
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={`hover:bg-neutral-400 p-1 rounded-lg ${editor.isActive({ textAlign: 'justify' }) ? highlightColor : ''}`}
                >
                    <FiAlignJustify />
                </button>
            </div>
        </div>
    );
}

export default MenuBar
