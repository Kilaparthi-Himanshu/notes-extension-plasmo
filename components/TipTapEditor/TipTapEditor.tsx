import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { useEditor, EditorContent, Editor, useEditorState, type AnyExtension } from "@tiptap/react";
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
import ListItem from '@tiptap/extension-list-item';
import Highlight from '@tiptap/extension-highlight';
import { UndoRedo } from '@tiptap/extensions';
import { EditorState } from "~node_modules/prosemirror-state/dist";
import hljsStyle from "data-text:highlight.js/styles/github-dark.css";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import * as Y from "yjs";
import { HocuspocusProvider, HocuspocusProviderWebsocket } from "@hocuspocus/provider";
import type { NoteType } from "~types/noteTypes";
import { debounce } from "~lib/sync-engine/debounce";
import { supabase } from "~lib/supabase";
import NoteSpinner from "../misc/NoteSpinner";
import { Markdown } from "@tiptap/markdown";
import { useEditorExports, type TipTapEditorHandle } from "../../hooks/useEditorExports";
import { AlertTriangle } from "lucide-react";
import { CircleX } from 'lucide-react';
// import { TaskItem, TaskList } from '@tiptap/extension-list';

// Fix for ProseMirror/Yjs inside Shadow DOM environments (e.g. Chrome extensions)
//
// Problem:
// ProseMirror expects `root.createRange()` and `root.getSelection()` to exist.
// In Shadow DOM, `root` is a ShadowRoot, which DOES NOT implement these methods.
// This causes runtime errors like:
//   "this.prosemirrorView._root.createRange is not a function"
//
// Solution:
// Monkey-patch ShadowRoot prototype to delegate these calls to the global document.
//
// Notes:
// - Safe because ShadowRoot should conceptually behave like Document for selection APIs
// - Guarded to avoid overriding if browser adds native support in future
// - Must run BEFORE editor initializes
if (typeof window !== "undefined") {
    const proto = ShadowRoot.prototype as any;

    if (!proto.createRange) {
        proto.createRange = function () {
            return document.createRange();
        };
    }

    if (!proto.getSelection) {
        proto.getSelection = function () {
            return document.getSelection();
        };
    }
}

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

// Forcefully stops a Hocuspocus provider and its underlying WebSocket.
//
// Why this exists:
// - HocuspocusProvider internally keeps retrying connections (infinite by default)
// - This can cause:
//    • infinite reconnect loops when server is offline
//    • duplicate Yjs content when connection resumes
// - `provider.destroy()` alone is NOT sufficient (WebSocket may still retry)
//
// What this does:
// 1. Accesses internal WebSocket instance (not officially exposed)
// 2. Explicitly closes + destroys it
// 3. Disconnects and destroys the provider
//
// Notes:
// - Uses internal/private fields → not future-proof, but necessary workaround
// - Safe in current Hocuspocus implementation
// - Should be called when:
//      • connection fails / times out
//      • falling back to local mode
//      • unmount cleanup (optional but good)
//
// This is critical to prevent "Hello → Hello Hello" duplication bug
const forceStopProvider = (provider: HocuspocusProvider | null) => {
    if (!provider) return;

    // Access the internal websocket and destroy it first
    const ws = (provider as any).configuration?.websocketProvider ?? (provider as any).webSocket;
    ws?.close?.();
    ws?.destroy?.();

    provider.disconnect();
    provider.destroy();
}

interface TipTapEditorProps {
    note: NoteType
    content: string;
    onChange: (html: string) => void;
    customColor: string;
    theme: string;
    showToolbar: boolean;
    canEditSyncedNote: boolean;
    remoteId: string;
    enableRealtime: boolean;
    editorRef: React.MutableRefObject<TipTapEditorHandle>
}

export default function TipTapEditor({ 
    note,
    content, 
    onChange, 
    customColor, 
    theme,
    showToolbar,
    canEditSyncedNote,
    remoteId,
    enableRealtime,
    editorRef
}: TipTapEditorProps) {
    const { canUseAdvancedEditor } = useFeatureFlags();

    const lowlight = createLowlight(all);

    const ydocRef = useRef<Y.Doc | null>(new Y.Doc());
    const providerRef = useRef<HocuspocusProvider | null>(null);
    const isSyncedRef = useRef(!enableRealtime);

    // Prevent reconnecting to the collaboration server after falling back to local mode.
    // Reconnecting the same editor/Y.Doc instance after manual local content injection
    // can cause duplicated CRDT content merges.
    const preventReconnectRef = useRef(false);

    // Populatigng contentRef
    const contentRef = useRef(content);
    const hasSeededRef = useRef(false);

    const [isSynced, setIsSynced] = useState(!enableRealtime);
    const [syncFailed, setSyncFailed] = useState(false);

    // Create provider synchronously on first render if realtime
    if (enableRealtime && !providerRef.current && !preventReconnectRef.current) {
        providerRef.current = new HocuspocusProvider({
            url: process.env.NODE_ENV == "development" 
                ? "ws://localhost:1234"
                : "wss://notetogo-server-production.up.railway.app",
            name: remoteId,
            document: ydocRef.current,
            onSynced() {
                isSyncedRef.current = true;
                setIsSynced(true);
            },
            onDisconnect() {
                console.warn("❌ Server disconnected");

                forceStopProvider(providerRef.current);
                providerRef.current = null;

                preventReconnectRef.current = true;

                setSyncFailed(true);
            },
            token: async () => {
                const {
                    data: { session }
                } = await supabase.auth.getSession();

                return session?.access_token;
            }
        });
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            forceStopProvider(providerRef.current);
            providerRef.current = null;
        };
    }, []);

    // Creating the editor
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bold: false,
                italic: false,
                strike: false,
                bulletList: false,
                orderedList: false,
                undoRedo: false,
                listItem: false,
                codeBlock: false,
            }),
            Markdown,
            // Collaboration.configure({
            //     document: ydocRef.current,
            // }),
            // CollaborationCaret.configure({
            //     provider: providerRef.current,
            // }),
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
                    directions: [
                        // 'top',
                        // 'bottom',
                        // 'left',
                        // 'right',
                        'top-left',
                        'top-right',
                        'bottom-left',
                        'bottom-right',
                    ],
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
            // TODO:
            // Reintroduce TaskList support both in extension and server code.
            // Current implementation conflicts with custom ListItemWithStyle.
            // Investigate extending TaskItem instead of ListItem.
            // TaskList,
            // TaskItem.configure({
            //     nested: true,
            // }),
            CodeBlockLowlight.configure({
                lowlight,
                enableTabIndentation: true,
                tabSize: 2,
                HTMLAttributes: {
                    class: "hljs"
                }
            }),
            ...(enableRealtime
            ? [
                Collaboration.configure({
                    document: ydocRef.current!,
                }),
            ]
            : []),
        ],
        content: !enableRealtime ? content : undefined,
        onUpdate: ({ editor }) => {
            if (!canEditSyncedNote) return;
            if (!isSyncedRef.current) return;

            const html = editor.getHTML();
            onChange(html);

            // saveContent(html);
        },
        editorProps: {
            attributes: {
                class: "ProseMirror flex-1 h-max rounded-xl py-4 px-6 focus:outline-none",
                // style: `font-size: ${fontSize}px;`
            },
            // Block native rich-text formatting commands for non-pro users.
            //
            // Why this exists:
            // - Browsers apply shortcuts like Cmd/Ctrl+B, Cmd/Ctrl+I, etc.
            //   through the native `beforeinput` contenteditable pipeline
            // - These formatting actions bypass normal Tiptap/ProseMirror keymaps,
            //   so blocking keydown events alone is NOT sufficient
            //
            // This prevents non-pro users from creating/modifying rich text formatting
            // while still allowing previously formatted content to render correctly.
            handleDOMEvents: {
                beforeinput(view, event: InputEvent) {
                    if (canUseAdvancedEditorRef.current) {
                        return false;
                    }

                    const blockedInputTypes = [
                        "formatBold",
                        "formatItalic",
                        "formatUnderline",
                        "formatStrikeThrough",
                        "formatRemove",
                        "historyUndo",
                        "historyRedo",
                    ];

                    if (blockedInputTypes.includes(event.inputType)) {
                        event.preventDefault();
                        return true;
                    }

                    return false;
                },
            },
        },
        autofocus: false,
    });

    useEffect(() => {
        if (!enableRealtime) return;
        if (isSynced) return;

        const timeout = setTimeout(() => {
            console.warn("⚠️ Sync timed out, rendering as local note");

            isSyncedRef.current = true;
            setIsSynced(true); // unblock the UI
            setSyncFailed(true);

            preventReconnectRef.current = true;

            editor.commands.setContent(content);

            // providerRef.current?.disconnect();
            // providerRef.current?.destroy();
            // providerRef.current = null;
            forceStopProvider(providerRef.current);
        }, 5000);

        return () => clearTimeout(timeout);
    }, [enableRealtime, isSynced, editor]);

    const canUseAdvancedEditorRef = useRef(canUseAdvancedEditor);
    useEffect(() => {
            canUseAdvancedEditorRef.current = canUseAdvancedEditor;
    }, [canUseAdvancedEditor]);

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
                canUndo: ctx.editor.can().chain().focus().undo?.().run?.() ?? false,
                canRedo: ctx.editor.can().chain().focus().redo?.().run?.() ?? false,
            }
        }
    });

    // Can Edit note depends on canEditSyncedNote
    useEffect(() => {
        if (!editor) return;

        editor.setEditable(canEditSyncedNote);
    }, [editor, canEditSyncedNote]);

    useEffect(() => {
        if (!editor) return;
        const shadowRoot = editor.view.dom.getRootNode();
        if (shadowRoot instanceof ShadowRoot) {
            // Patch missing methods onto shadowRoot that ProseMirror/Y.js expect
            if (!(shadowRoot as any).createRange) {
                (shadowRoot as any).createRange = () => document.createRange();
            }
            if (!(shadowRoot as any).getSelection) {
                (shadowRoot as any).getSelection = () => document.getSelection();
            }
        }
    }, [editor]);

    useEditorExports(editor, editorRef);

    if (!isSynced) return (
        <div className="flex flex-col items-center justify-center gap-2">
            <NoteSpinner />
            <span className="inline-block text-black border border-blue-500 bg-blue-50 rounded-full px-3 py-1 text-sm shadow-xl">
                Connecting…
            </span>
        </div>
    );
    if (!editor) return null;

    return (
        <div className="min-h-full min-w-full flex flex-col">
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

                    /* Scrollbar */
                    .textArea::-webkit-scrollbar {
                        width: 10px;
                    }

                    .textArea::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    .textArea::-webkit-scrollbar-thumb {
                        background: rgba(255,255,255,0.25);
                        border-radius: 999px;
                    }

                    .textArea::-webkit-scrollbar-thumb:hover {
                        background: rgba(255,255,255,0.45);
                    }
                `}
            </style>

            {syncFailed && (
                <div className="w-full bg-amber-500/90 text-gray-700 text-sm font-medium p-1 px-3 flex items-center justify-center gap-1 relative">
                    <span className="block text-center">
                        Realtime sync is unavailable. Your changes are still being saved to cloud. If the issue still persists{" "}

                        <button
                            className="underline font-semibold hover:opacity-80 inline-flex gap-2 items-center"
                            onClick={() => {
                                window.open(
                                    chrome.runtime.getURL("options.html#/bug-report"),
                                    "_blank"
                                );
                            }}
                        >
                            submit a bug report.

                            <AlertTriangle size={18} className="shrink-0" />
                        </button>
                    </span>

                    <button
                        className="absolute right-1 top-1"
                        onClick={() => setSyncFailed(false)}
                    >
                        <CircleX size={20} className="text-white bg-red-500 shrink-0 rounded-full" />
                    </button>
                </div>
            )}

            <EditorContent 
                editor={editor}
                className={`textArea size-full ${!canEditSyncedNote &&
                    "cursor-not-allowed"}`
                }
                style={{
                    minHeight: "100%",
                    minWidth: "100%",
                    overflowY: "auto",
                }}
                data-lenis-prevent
            />

            {showToolbar && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <MenuBar editor={editor} editorState={editorState} theme={theme} canUseAdvancedEditor={canUseAdvancedEditor} />
                </div>
            )}
        </div>
    );
}
