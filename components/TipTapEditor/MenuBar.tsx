import * as React from "react";
import { Editor } from "@tiptap/react";
import { Bold, Italic, Underline, List, ListOrdered, Strikethrough } from "lucide-react";
import styleText from "data-text:../styles.module.css";

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent =  styleText;
    return style
}

const MenuBar = ({ editor, theme }: { editor: Editor | null; theme: string }) => {
    if (!editor) return null

    const highlightColor = theme === 'light' ? 'bg-blue-400' : 'bg-blue-500';

    return (
        <div className={`flex space-x-2 p-1 ${theme === 'light' ? 'bg-neutral-300' : 'bg-[#454545] text-white'} rounded-xl shadow-lg hover:scale-[1.15] transition-transform`}style={{
            border: '1px solid rgba(255, 255, 255, 0.25)'
        }}>
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
        </div>
    )
}

export default MenuBar
