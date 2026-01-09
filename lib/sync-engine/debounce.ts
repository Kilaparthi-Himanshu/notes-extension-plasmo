export function debounce<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
) {
    let timer: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        console.log("Debounced");
        if (timer) clearTimeout(timer);

        timer = setTimeout(() => {
            timer = null;
            fn(...args);
        }, delay);
    };
}
