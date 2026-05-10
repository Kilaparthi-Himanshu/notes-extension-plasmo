import { useImperativeHandle } from "react";
import type { Editor } from "@tiptap/react";
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ImageRun,
} from "docx";
import { rgbToHex } from "~utils/colorFormatChange";

export type TipTapEditorHandle = {
    exportMarkdown: () => void;
    exportHtml: () => void;
    exportPdf: () => void;
    exportDocx: () => void;
}

export function useEditorExports(
    editor: Editor | null,
    editorRef: React.RefObject<TipTapEditorHandle | null>
) {
    useImperativeHandle(editorRef, () => ({
        exportMarkdown() {
            if (!editor) return;

            const markdown = editor.getMarkdown();

            const blob = new Blob([markdown], {
                type: "text/markdown",
            });

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "note.md";
            a.click();

            URL.revokeObjectURL(url);
        },
        exportHtml() {
            if (!editor) return;

            const html = editor.getHTML();

            const blob = new Blob([html], {
                type: "text/html",
            });

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "note.html";
            a.click();

            URL.revokeObjectURL(url);
        },
        exportPdf() {
            if (!editor) return;

            const html = editor.getHTML();

            const printWindow = window.open("", "_blank");

            if (!printWindow) return;

            printWindow.document.write(`
                <html>
                    <head>
                        <style>
                            body {
                                font-family: sans-serif;
                                padding: 40px;
                                line-height: 1.5;
                            }

                            img {
                                max-width: 100%;
                            }

                            pre {
                                background: #f4f4f4;
                                padding: 12px;
                                overflow-x: auto;
                            }
                        </style>
                    </head>

                    <body>
                        ${html}
                    </body>
                </html>
            `);

            printWindow.document.close();

            printWindow.focus();

            // Wait a bit so content fully renders
            setTimeout(() => {
                printWindow.print();

                // Optional
                printWindow.close();
            }, 300);
        },

        async exportDocx() {
            if (!editor) return;

            const json = editor.getJSON();

            async function renderImage(node: any) {
                const src = node.attrs?.src;

                if (!src) return null;

                try {
                    const response = await fetch(src);

                    const imageBlob = await response.blob();

                    const mimeType = imageBlob.type;

                    let imageType: "png" | "jpg" | "gif";

                    if (mimeType.includes("png")) {
                        imageType = "png";
                    } else if (
                        mimeType.includes("jpeg") ||
                        mimeType.includes("jpg")
                    ) {
                        imageType = "jpg";
                    } else if (mimeType.includes("gif")) {
                        imageType = "gif";
                    } else {
                        imageType = "png";
                    }

                    const arrayBuffer = await imageBlob.arrayBuffer();

                    return new Paragraph({
                        children: [
                            new ImageRun({
                                type: imageType,

                                data: new Uint8Array(arrayBuffer),

                                transformation: {
                                    width: Number(node.attrs?.width) || 400,
                                    height: Number(node.attrs?.height) || 300,
                                },
                            }),
                        ],
                    });
                } catch (err) {
                    console.error("Failed to export image:", err);
                    return null;
                }
            }

            function renderTextRuns(content: any[] = []) {
                const runs: TextRun[] = [];

                for (const child of content) {
                    if (child.type !== "text") continue;

                    const marks = child.marks ?? [];

                    const textStyleMark = marks.find(
                        (m: any) => m.type === "textStyle"
                    );

                    const highlightMark = marks.find(
                        (m: any) => m.type === "highlight"
                    );

                    const rawColor = textStyleMark?.attrs?.color;

                    const docxColor = rawColor
                        ? rgbToHex(rawColor).replace("#", "")
                        : undefined;

                    const fontSize =
                        (
                            parseInt(
                                textStyleMark?.attrs?.fontSize ?? "16"
                            )
                        ) * 2;

                    runs.push(
                        new TextRun({
                            text: child.text ?? "",

                            bold: marks.some(
                                (m: any) => m.type === "bold"
                            ),

                            italics: marks.some(
                                (m: any) => m.type === "italic"
                            ),

                            strike: marks.some(
                                (m: any) => m.type === "strike"
                            ),

                            color: docxColor,

                            size: fontSize,

                            highlight: highlightMark
                                ? "yellow"
                                : undefined,

                            font:
                                textStyleMark?.attrs?.fontFamily ??
                                undefined,
                        })
                    );
                }

                return runs;
            }

            function getAlignment(textAlign?: string) {
                switch (textAlign) {
                    case "center":
                        return "center";

                    case "right":
                        return "right";

                    case "justify":
                        return "both";

                    default:
                        return "left";
                }
            }

            async function renderNode(node: any): Promise<Paragraph[]> {
                switch (node.type) {
                    case "paragraph":
                        return [
                            new Paragraph({
                                children: renderTextRuns(node.content),

                                alignment: getAlignment(
                                    node.attrs?.textAlign
                                ),
                            }),
                        ];

                    case "heading":
                        return [
                            new Paragraph({
                                children: renderTextRuns(node.content),

                                heading: `Heading${node.attrs?.level || 1}` as any,

                                alignment: getAlignment(
                                    node.attrs?.textAlign
                                ),
                            }),
                        ];

                    case "bulletList": {
                        const paragraphs: Paragraph[] = [];

                        for (const item of node.content ?? []) {
                            for (const paragraph of item.content ?? []) {
                                paragraphs.push(
                                    new Paragraph({
                                        children: renderTextRuns(
                                            paragraph.content
                                        ),

                                        bullet: {
                                            level: 0,
                                        },
                                    })
                                );
                            }
                        }

                        return paragraphs;
                    }

                    case "orderedList": {
                        const paragraphs: Paragraph[] = [];

                        let index = 1;

                        for (const item of node.content ?? []) {
                            for (const paragraph of item.content ?? []) {
                                paragraphs.push(
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `${index}. `,
                                                bold: true,
                                            }),

                                            ...renderTextRuns(
                                                paragraph.content
                                            ),
                                        ],
                                    })
                                );

                                index++;
                            }
                        }

                        return paragraphs;
                    }

                    case "codeBlock":
                        return [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text:
                                            node.content?.[0]?.text ?? "",

                                        font: "Courier New",

                                        size: 22,
                                    }),
                                ],

                                shading: {
                                    fill: "F4F4F4",
                                },
                            }),
                        ];

                    case "image": {
                        const imageParagraph = await renderImage(node);

                        return imageParagraph
                            ? [imageParagraph]
                            : [];
                    }

                    default:
                        return [];
                }
            }

            const children: Paragraph[] = [];

            for (const node of json.content ?? []) {
                const rendered = await renderNode(node);

                children.push(...rendered);
            }

            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children,
                    },
                ],
            });

            const blob = await Packer.toBlob(doc);

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;
            a.download = "note.docx";

            document.body.appendChild(a);

            a.click();

            a.remove();

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);
        }
    }), [editor]);
}