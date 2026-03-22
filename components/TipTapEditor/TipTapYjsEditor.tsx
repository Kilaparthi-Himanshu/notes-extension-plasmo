import React, { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Collaboration from "@tiptap/extension-collaboration"
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import styleText from "data-text:../styles.module.css";

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent =  styleText;
    return style;
}

export default function TipTapYjsEditor({ remoteId }: { remoteId: string }) {
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
                undoRedo: false,
            }),
            Collaboration.configure({
                document: ydocRef.current,
            }),
        ],

        editorProps: {
            attributes: {
                class: "prosemirror-editor"
            },

            // @ts-expect-error Shadow DOM fix
            root: document,
        },
    });

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

    if (!editor) return null;

    return (
        <EditorContent 
            editor={editor} 
            className={`${styleText.textArea} size-full`}
            style={{
                minHeight: "100%",
                minWidth: "100%",
                overflowY: "auto",
            }} 
        />
    );
}
