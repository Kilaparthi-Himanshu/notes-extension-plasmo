import React, { useEffect } from "react"
import { useEditor, EditorContent, Editor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import styleText from "data-text:../styles.module.css";
import MenuBar from "./MenuBar";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import FontSize from "@tiptap/extension-font-size";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Strike from "@tiptap/extension-strike";
import { useFeatureFlags } from "~hooks/useFeatureFlags";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { FontFamily } from "@tiptap/extension-text-style";
import { rgbToHex } from '~utils/colorFormatChange';
import { detectCollapsedCursorFontColor, detectCollapsedCursorFontFamily, detectCollapsedCursorFontSize, detectMixedFontFamily, detectMixedFontSize } from '~utils/detectMixedFunctions';
import ListItem from '@tiptap/extension-list-item';

const ListItemWithStyle = ListItem.extend({
    addAttributes() {
        return {
            color: {
                default: null,
                parseHTML: element => element.style.color || null,
                renderHTML: attrs => {
                    return attrs.color ? { style: `color: ${attrs.color}` } : {};
                },
            },

            fontSize: {
                default: null,
                parseHTML: element => element.style.fontSize || null,
                renderHTML: attrs => {
                    return attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {};
                },
            },
        };
    },
});

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
    setFontColor: React.Dispatch<React.SetStateAction<string>>;
    font: string;
    setFont: React.Dispatch<React.SetStateAction<string>>;
    fontSize: number;
    setFontSize: React.Dispatch<React.SetStateAction<number>>;
    theme: string;
}

export default function TipTapEditor({ 
    content, 
    onChange, 
    customColor, 
    fontColor, 
    setFontColor,
    font,
    setFont, 
    fontSize, 
    setFontSize,
    theme,
}: TipTapEditorProps) {
    const { canUseAdvancedEditor } = useFeatureFlags();

    const BoldExtension = Bold.extend({
        addKeyboardShortcuts() {
            if (!canUseAdvancedEditor) {
                return {
                    "Mod-b": () => true // true = handled, but does nothing
                }
            }
            return {
                "Mod-b": () => this.editor.commands.toggleBold(),
            }
        },
    });

    const ItalicExtension = Italic.extend({
        addKeyboardShortcuts() {
            if (!canUseAdvancedEditor) {
                return {
                    "Mod-i": () => true
                }
            }
            return {
                "Mod-i": () => this.editor.commands.toggleItalic(),
            }
        },
    });

    const StrikeExtension = Strike.extend({
        addKeyboardShortcuts() {
            if (!canUseAdvancedEditor) {
                return {
                    "Mod-Shift-s": () => true
                }
            }
            return {
                "Mod-Shift-s": () => this.editor.commands.toggleStrike(),
            }
        },
    });

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bold: false,
                italic: false,
                strike: false,
                bulletList: false,
                orderedList: false,
                undoRedo: false,
            }),
            TextStyle,
            FontSize.configure({
                types: ["textStyle"], // applies to textStyle mark
            }),
            BulletList.configure({
                HTMLAttributes: {
                    class: `list-disc ml-4 ProseMirror`, // Tailwind: disc bullets + margin
                },
                keepMarks: true,
                keepAttributes: true,
            }),
            OrderedList.configure({
                HTMLAttributes: {
                    class: `list-decimal ml-4 [&>ol]:ml-4 ProseMirror`, // Tailwind: numbered list + margin
                },
                keepMarks: true,
                keepAttributes: true,
            }), 
            ListItemWithStyle,
            // Always render Bold/Italic/Strike marks, but disable shortcuts if not pro
            BoldExtension,
            ItalicExtension,
            StrikeExtension,
            Image.configure({
                resize: {
                    enabled: true,
                    alwaysPreserveAspectRatio: true,
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            FontFamily,
            Color.configure({
                types: ['textStyle'],
            })
        ],
        content: content || "<p></p>", // seed empty state
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "flex-1 h-max rounded-xl py-4 px-6 focus:outline-none",
                // style: `font-size: ${fontSize}px;`
            },
        },
        autofocus: false,
        // onSelectionUpdate({ editor }) {
        //     handleSelectionChange(editor);
        // },
        // onTransaction({ editor }) {
        //     handleSelectionChange(editor);
        // }
    });

    const editorState = useEditorState({
        editor,
        selector: ctx => {
            const attrs = ctx.editor.getAttributes("textStyle");

            return {
                fontSize: attrs.fontSize ? parseInt(attrs.fontSize.replace("px","")) : null,
                fontFamily: attrs.fontFamily ?? null,
                color: attrs.color ? rgbToHex(attrs.color) : null,
            }
        }
    });

    // useEffect(() => {
    //     if (!editorState) return;

    //     setFontSize(editorState.fontSize);
    //     setFont(editorState.fontFamily);
    //     setFontColor(editorState.color);

    // }, [editorState]);

    // function handleSelectionChange(editor: Editor) {
    // // FONT SIZE
    //     const size = detectCollapsedCursorFontSize(editor);
    //     setFontSize(size ? parseInt(size.replace("px","")) : null);

    //     // FONT FAMILY
    //     const family = detectCollapsedCursorFontFamily(editor);
    //     setFont(family ?? null);

    //     // FONT COLOR
    //     const color = detectCollapsedCursorFontColor(editor);
    //     setFontColor(color ?? null);
    // }

    // Font Size Change
    // useEffect(() => {
    //     if (!editor) return;
    //     if (fontSize === null) return; // mixed → do nothing

    //     editor.chain().focus().setFontSize(`${fontSize}px`).run();
    // }, [fontSize]);

    // // Font Family Change
    // useEffect(() => {
    //     if (!editor) return;
    //     if (!font) return;

    //     editor.chain().focus().setFontFamily(font).run();
    // }, [font]);

    // // Font Color Change
    // useEffect(() => {
    //     if (!editor) return;
    //     if (fontColor === null) return; // mixed → don't apply

    //     // Always update stored marks
    //     editor.chain().focus().setMark("textStyle", { color: fontColor }).run();
    // }, [fontColor]);

    // Set Content
    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    // Full Text Size change
    // useEffect(() => {
    //     if (editor && fontSize) {
    //         // save current selection
    //         const { from, to } = editor.state.selection;
    //         // Apply to whole doc
    //         editor.chain().focus().selectAll().setFontSize(`${fontSize}px`).run();
    //         // restore user selection
    //         editor.commands.setTextSelection({ from, to });
    //         // Also set active mark so new text continues at same size
    //         editor.chain().focus().setFontSize(`${fontSize}px`).run();
    //     }
    // }, [editor, fontSize]);

    // Selected Text Size Change
    // useEffect(() => {
    //     if (!editor) return;

    //     const { from, to } = editor.state.selection;

    //     // Apply font size only to selected text
    //     if (from !== to) {
    //         editor.chain().focus().setFontSize(`${fontSize}px`).run();
    //     } else {
    //         // If no text selected, set active mark so new text typed will use this size
    //         editor.chain().focus().setFontSize(`${fontSize}px`).run();
    //     }
    // }, [editor, fontSize]);

    // // Update Font Size With Cursor
    // useEffect(() => {
    //     if (!editor) return;

    //     // Runs on every cursor movement / selection change
    //     const handleUpdate = () => {
    //         const attrs = editor.getAttributes("textStyle");
    //         const size = attrs.fontSize;

    //         if (size && size.endsWith("px")) {
    //             const px = parseInt(size.replace("px", ""));
    //             if (!isNaN(px)) {
    //                 setFontSize(px);  // 👈 Update your global FontMenu state
    //             }
    //         }
    //     };

    //     editor.on("selectionUpdate", handleUpdate);
    //     editor.on("transaction", handleUpdate);

    //     return () => {
    //         editor.off("selectionUpdate", handleUpdate);
    //         editor.off("transaction", handleUpdate);
    //     };
    // }, [editor]);

    // Selected Text Font Change
    // useEffect(() => {
    // if (!editor) return;

    //     const { from, to } = editor.state.selection;

    //     if (from !== to) {
    //         editor.chain().focus().setFontFamily(font).run();
    //     } else {
    //         editor.chain().focus().setFontFamily(font).run();
    //     }
    // }, [editor, font]);

    // // Update Font Family With Cursor
    // useEffect(() => {
    //     if (!editor) return;

    //     const handleUpdate = () => {
    //         const attrs = editor.getAttributes("textStyle");
    //         const family = attrs.fontFamily;

    //         if (family) {
    //             setFont(family); // 👈 update your DropdownContext state
    //         }
    //     };

    //     editor.on("selectionUpdate", handleUpdate);
    //     editor.on("transaction", handleUpdate);

    //     return () => {
    //         editor.off("selectionUpdate", handleUpdate);
    //         editor.off("transaction", handleUpdate);
    //     };
    // }, [editor]);

    // Selected Text Color Change
    // useEffect(() => {
    //     if (!editor) return;

    //     const { from, to } = editor.state.selection;

    //     if (from !== to) {
    //         editor.chain().focus().setColor(fontColor).run();
    //     } else {
    //         editor.chain().focus().setColor(fontColor).run();
    //     }
    // }, [editor, fontColor]);

    // Update Font Color With Cursor
    // useEffect(() => {
    //     if (!editor) return;

    //     const handleUpdate = () => {
    //         const attrs = editor.getAttributes("textStyle");
    //         let color = attrs.color;

    //         if (color) {
    //             color = rgbToHex(color);
    //             setFontColor(color); // sync your color picker
    //         }
    //     };

    //     editor.on("selectionUpdate", handleUpdate);
    //     editor.on("transaction", handleUpdate);

    //     return () => {
    //         editor.off("selectionUpdate", handleUpdate);
    //         editor.off("transaction", handleUpdate);
    //     };
    // }, [editor]);

    return (
        <>
            <EditorContent 
                editor={editor}
                className={`${styleText.textArea} size-full`} 
                style={{
                    // backgroundColor: customColor,
                    // color: editorState.color || (theme === "light" ? "black" : "white"),
                    // fontFamily: editorState.fontFamily,
                    // fontSize: `${editorState.fontSize}px`,
                    minHeight: "100%",
                    minWidth: "100%",
                    overflowY: "auto",
                }}
            />

            {canUseAdvancedEditor && (
                <div className="absolute bottom-4">
                    <MenuBar editor={editor} editorState={editorState} theme={theme} />
                </div>
            )}
        </>
    );
}
