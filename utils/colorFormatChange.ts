export function hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function rgbToHex(rgb: string) {
    if (!rgb) return "";

    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return rgb;

    const [r, g, b] = result.slice(0, 3).map(Number);

    if ([r, g, b].some(v => isNaN(v))) return rgb;

    return (
        "#" +
        [r, g, b]
            .map(x => x.toString(16).padStart(2, "0"))
            .join("")
    );
}
