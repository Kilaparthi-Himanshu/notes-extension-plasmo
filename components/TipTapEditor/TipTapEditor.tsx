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
import Highlight from '@tiptap/extension-highlight';
import { UndoRedo } from '@tiptap/extensions';
import { EditorState } from "~node_modules/prosemirror-state/dist";

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
                parseHTML: element => {
                    const size = element.style.fontSize;
                    return size ? parseInt(size) : null;
                },
                renderHTML: attrs => {
                    return attrs.fontSize
                        ? { style: `font-size: ${attrs.fontSize}px` } : {};
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
    theme: string;
    showToolbar: boolean;
    canEditSyncedNote: boolean;
}

export default function TipTapEditor({ 
    content, 
    onChange, 
    customColor, 
    theme,
    showToolbar,
    canEditSyncedNote
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
            }),
            Highlight,
            UndoRedo
        ],
        content: content || "<p></p>", // seed empty state
        onUpdate: ({ editor }) => {
            if (!canEditSyncedNote) return;
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
                fontSize: typeof attrs.fontSize === "string"
                            ? parseInt(attrs.fontSize)
                            : typeof attrs.fontSize === "number"
                            ? attrs.fontSize
                            : null,
                fontFamily: attrs.fontFamily ?? null,
                color: attrs.color ? rgbToHex(attrs.color) : null,
                canUndo: ctx.editor.can().chain().focus().undo().run(),
                canRedo: ctx.editor.can().chain().focus().redo().run(),
            }
        }
    });

    // Set Content
    useEffect(() => {
        if (!editor) return;
        if (!content) return;

        const current = editor.getHTML();
        if (current === content) return; // block unnecessary resets

        editor.commands.setContent(content);

        const newState = EditorState.create({
            doc: editor.state.doc,
            plugins: editor.state.plugins,
            schema: editor.state.schema,
        });

        editor.view.updateState(newState);
    }, [editor, content]);

    // Can Edit note depends on canEditSyncedNote
    useEffect(() => {
        if (!editor) return;

        editor.setEditable(canEditSyncedNote);
    }, [editor, canEditSyncedNote]);

    return (
        <>
            <EditorContent 
                editor={editor}
                className={`${styleText.textArea} size-full ${!canEditSyncedNote &&
                    "cursor-not-allowed"}`
                }
                style={{
                    minHeight: "100%",
                    minWidth: "100%",
                    overflowY: "auto",
                }}
            />

            {canUseAdvancedEditor && showToolbar && (
                <div className="absolute bottom-4">
                    <MenuBar editor={editor} editorState={editorState} theme={theme} />
                </div>
            )}
        </>
    );
}
