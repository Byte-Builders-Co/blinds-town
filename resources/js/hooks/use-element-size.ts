import { useEffect, useState } from "react";

/**
 * Tracks the rendered size of an element. Returns a callback ref to attach to
 * the element and its latest content-box size (0 until first measured).
 */
export function useElementSize<T extends HTMLElement>() {
    const [element, setElement] = useState<T | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!element) {
            return;
        }

        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;

            setSize({ width, height });
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, [element]);

    return [setElement, size] as const;
}
