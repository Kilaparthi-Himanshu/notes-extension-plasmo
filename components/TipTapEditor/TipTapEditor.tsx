import React, { useEffect, useRef } from "react"
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
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { all, createLowlight } from 'lowlight'
import { rgbToHex } from '~utils/colorFormatChange';
import { detectCollapsedCursorFontColor, detectCollapsedCursorFontFamily, detectCollapsedCursorFontSize, detectMixedFontFamily, detectMixedFontSize } from '~utils/detectMixedFunctions';
import ListItem from '@tiptap/extension-list-item';
import Highlight from '@tiptap/extension-highlight';
import { UndoRedo } from '@tiptap/extensions';
import { EditorState } from "~node_modules/prosemirror-state/dist";
import hljsStyle from "data-text:highlight.js/styles/github-dark.css";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";

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
    style.textContent =  styleText + hljsStyle;
    return style;
}

interface TipTapEditorProps {
    content: string;
    onChange: (html: string) => void;
    customColor: string;
    theme: string;
    showToolbar: boolean;
    canEditSyncedNote: boolean;
    remoteId: string;
}

export default function TipTapEditor({ 
    content, 
    onChange, 
    customColor, 
    theme,
    showToolbar,
    canEditSyncedNote,
    remoteId
}: TipTapEditorProps) {
    const { canUseAdvancedEditor } = useFeatureFlags();

    const lowlight = createLowlight(all);

    const ydocRef = useRef<Y.Doc | null>(null);
    const providerRef = useRef<HocuspocusProvider | null>(null);

    if (!ydocRef.current) {
        ydocRef.current = new Y.Doc();

        providerRef.current = new HocuspocusProvider({
            url: "ws://localhost:1234",
            name: remoteId,
            document: ydocRef.current,
        });
    }

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
            Collaboration.configure({
                document: ydocRef.current,
            }),
            CollaborationCaret.configure({
                provider: providerRef.current,
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
            // BoldExtension,
            // ItalicExtension,
            // StrikeExtension,
            Bold,
            Italic,
            Strike,
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
            UndoRedo,
            CodeBlockLowlight.configure({
                lowlight,
                enableTabIndentation: true,
                tabSize: 2,
                HTMLAttributes: {
                    class: "hljs"
                }
            }),
        ],
        // content: content || "<p></p>", // seed empty state
        onUpdate: ({ editor }) => {
            if (!canEditSyncedNote) return;
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "ProseMirror flex-1 h-max rounded-xl py-4 px-6 focus:outline-none",
                // style: `font-size: ${fontSize}px;`
            },

            // @ts-expect-error Shadow DOM fix
            root: document,
        },
        autofocus: false,
        // onSelectionUpdate({ editor }) {
        //     handleSelectionChange(editor);
        // },
        // onTransaction({ editor }) {
        //     handleSelectionChange(editor);
        // }
    });

    const canUseAdvancedEditorRef = useRef(canUseAdvancedEditor);
    useEffect(() => {
        canUseAdvancedEditorRef.current = canUseAdvancedEditor;
    }, [canUseAdvancedEditor]);

    useEffect(() => {
        const dom = editor?.view?.dom;
        if (!dom) return;

        const root = dom.getRootNode();
        const target = (root instanceof ShadowRoot ? root : dom) as EventTarget;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (canUseAdvancedEditorRef.current) return;
            const mod = e.ctrlKey || e.metaKey;
            if (!mod) return;
            const key = e.key.toLowerCase();
            const shouldBlock =
                key === "b" ||
                key === "i" ||
                key === "u" ||
                (key === "s" && e.shiftKey);

            if (shouldBlock) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        };

        target.addEventListener("keydown", handleKeyDown, true);
        return () => target.removeEventListener("keydown", handleKeyDown, true);
    }, [editor?.view?.dom]);

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
    // useEffect(() => {
    //     if (!editor) return;
    //     if (!content) return;

    //     const current = editor.getHTML();
    //     if (current === content) return; // block unnecessary resets

    //     editor.commands.setContent(content);

    //     const newState = EditorState.create({
    //         doc: editor.state.doc,
    //         plugins: editor.state.plugins,
    //         schema: editor.state.schema,
    //     });

    //     editor.view.updateState(newState);
    // }, [editor, content]);

    // Can Edit note depends on canEditSyncedNote
    useEffect(() => {
        if (!editor) return;

        editor.setEditable(canEditSyncedNote);
    }, [editor, canEditSyncedNote]);

    useEffect(() => {
        if (!editor) return

        const view = editor.view as any

        if (view && view._root !== document) {
            view._root = document
        }

        editor.on("create", () => {
            const v = editor.view as any
            if (v) v._root = document
        })

    }, [editor]);

    useEffect(()=> {
        return () => {
            providerRef.current?.destroy();
            ydocRef.current?.destroy();
        }
    }, []);

    return (
        <>
            <style>{hljsStyle as unknown as string}
                {`
                    .hljs {
                        // background: transparent !important;
                    }

                    pre.hljs {
                        // background: transparent !important;
                        padding: 14px 16px;
                        border: 1px solid rgba(255,255,255,0.25);
                        border-radius: 12px;
                        margin: 8px 0;
                        overflow-x: auto;
                    }
                `}
            </style>

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
