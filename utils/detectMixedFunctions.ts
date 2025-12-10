import { Editor } from "@tiptap/react";
import { rgbToHex } from "./colorFormatChange";

export const detectMixedFontSize = (editor: Editor) => {
    const { from, to } = editor.state.selection;

    let found = null;
    let mixed = false;

    editor.state.doc.nodesBetween(from, to, node => {
        if (!node.isText) return;

        const mark = node.marks.find(m => m.type.name === "textStyle");
        const size = mark?.attrs?.fontSize;

        if (size) {
            if (found === null) {
                found = size;
            } else if (found !== size) {
                mixed = true;
            }
        }
    });

    return mixed ? null : found;
}

export const detectMixedFontFamily = (editor: Editor) => {
    const { from, to } = editor.state.selection;

    let found: string | null = null;
    let mixed = false;

    editor.state.doc.nodesBetween(from, to, node => {
        if (!node.isText) return;

        const mark = node.marks.find(m => m.type.name === "textStyle");
        const family = mark?.attrs?.fontFamily;

        if (family) {
            if (found === null) {
                found = family;
            } else if (found !== family) {
                mixed = true;
            }
        }
    });

    return mixed ? null : found;
}

export const detectMixedFontColor = (editor: Editor) => {
    const { from, to } = editor.state.selection;

    let found: string | null = null;
    let mixed = false;
    let sawAnyColor = false;

    editor.state.doc.nodesBetween(from, to, node => {
        if (!node.isText) return;

        const mark = node.marks.find(m => m.type.name === "textStyle");
        const color = mark?.attrs?.color;

        if (color) {
            sawAnyColor = true;

            if (found === null) {
                found = color;
            } else if (found !== color) {
                mixed = true;
            }
        }
    });

    if (mixed) return null;

    // If NO color marks → default = black
    if (!sawAnyColor) return "#000000";

    return rgbToHex(found!);
}

export const detectCollapsedCursorFontSize = (editor: Editor) => {
    const { from, empty } = editor.state.selection;

    if (!empty) return detectMixedFontSize(editor);

    const resolved = editor.state.doc.resolve(from - 1);
    const node = resolved.nodeAfter || resolved.nodeBefore;

    if (!node) return null;

    const mark = node.marks.find(m => m.type.name === 'textStyle');
    return mark?.attrs?.fontSize || null;
}

export const detectCollapsedCursorFontFamily = (editor: Editor) => {
    const { from, empty } = editor.state.selection;

    if (!empty) return detectMixedFontFamily(editor);

    const resolved = editor.state.doc.resolve(from - 1);
    const node = resolved.nodeAfter || resolved.nodeBefore;

    if (!node) return null;

    const mark = node.marks.find(m => m.type.name === "textStyle");
    return mark?.attrs?.fontFamily ?? null;
}

export const detectCollapsedCursorFontColor = (editor: Editor) => {
    const { from, empty } = editor.state.selection;

    if (!empty) return detectMixedFontColor(editor);

    const resolved = editor.state.doc.resolve(from - 1);
    const node = resolved.nodeAfter || resolved.nodeBefore;

    if (!node) return "#000000"; // default

    const mark = node.marks.find(m => m.type.name === "textStyle");
    return mark?.attrs?.color ? rgbToHex(mark.attrs.color) : "#000000";
}
