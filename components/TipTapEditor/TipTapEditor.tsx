import React, { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import styleText from "data-text:../styles.module.css";
import MenuBar from "./MenuBar";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import FontSize from "@tiptap/extension-font-size";
import { TextStyle } from "@tiptap/extension-text-style";
import Strike from "@tiptap/extension-strike";
import { useFeatureFlags } from "~hooks/useFeatureFlags";

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent =  styleText;
    return style;
}

interface TipTapEditorProps {
    content: string;
    onChange: (html: string) => void;
    customColor: string;
    fontColor: string;
    font: string;
    fontSize: number;
    theme: string;
}

export default function TipTapEditor({ 
    content, 
    onChange, 
    customColor, 
    fontColor, 
    font, 
    fontSize, 
    theme,
}: TipTapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: false, // disable default
                orderedList: false,
            }),
            TextStyle,
            FontSize.configure({
                types: ["textStyle"], // applies to textStyle mark
            }),
            BulletList.configure({
                    HTMLAttributes: {
                    class: `list-disc ml-4`, // Tailwind: disc bullets + margin
                },  
            }),
            OrderedList.configure({
                    HTMLAttributes: {
                    class: `list-decimal ml-4`, // Tailwind: numbered list + margin
                },
            }), 
            Strike,
        ],
        content: content || "<p></p>", // seed empty state
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: "flex-1 h-full rounded-xl p-2 focus:outline-none",
                style: `font-size: ${fontSize}px;`
            },
        },
    });

    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    useEffect(() => {
        if (editor && fontSize) {
            // Apply to whole doc
            editor.chain().focus().selectAll().setFontSize(`${fontSize}px`).run()

            // Also set active mark so new text continues at same size
            editor.chain().focus().setFontSize(`${fontSize}px`).run()
        }
    }, [editor, fontSize]);

    const { canUseAdvancedEditor } = useFeatureFlags();

    return (
        <>
            <EditorContent 
                editor={editor} 
                className={`${styleText.textArea} size-full`} 
                style={{
                    backgroundColor: customColor,
                    color: fontColor || (theme === "light" ? "black" : "white"),
                    fontFamily: font,
                    // fontSize: `${fontSize}px`,
                    minHeight: "100%",
                    minWidth: "100%",
                    overflowY: "auto",
                }}
            />

           {canUseAdvancedEditor && (
                <div className="absolute bottom-4">
                    <MenuBar editor={editor} theme={theme} />
                </div>
            )}
        </>
    );
}
