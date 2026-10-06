import type { ReactNode } from "react";

/**
 * Renders CMS text. Blocks are separated by blank lines. A small markdown
 * subset is supported: "## " / "### " headings, "- " bullet lists, "---"
 * dividers and **bold** inline text.
 */
function renderInline(text: string): ReactNode[] {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
            <strong key={index} className="text-foreground font-semibold">
                {part.slice(2, -2)}
            </strong>
        ) : (
            part
        ),
    );
}

export function RichText({ text }: { text: string }) {
    const blocks = text.split(/\n{2,}/).filter((p) => p.trim() !== "");

    return (
        <div className="space-y-4">
            {blocks.map((block, index) => {
                const trimmed = block.trim();

                if (/^-{3,}$/.test(trimmed)) {
                    return <hr key={index} className="my-2" />;
                }

                if (trimmed.startsWith("### ")) {
                    return (
                        <h3
                            key={index}
                            className="text-foreground pt-4 text-xl font-semibold tracking-tight"
                        >
                            {renderInline(trimmed.slice(4))}
                        </h3>
                    );
                }

                if (trimmed.startsWith("## ")) {
                    return (
                        <h2
                            key={index}
                            className="text-foreground pt-4 text-2xl font-semibold tracking-tight"
                        >
                            {renderInline(trimmed.slice(3))}
                        </h2>
                    );
                }

                const lines = trimmed.split("\n");

                if (lines.every((line) => line.startsWith("- "))) {
                    return (
                        <ul
                            key={index}
                            className="text-muted-foreground list-disc space-y-1.5 pl-6 leading-relaxed"
                        >
                            {lines.map((line, i) => (
                                <li key={i}>{renderInline(line.slice(2))}</li>
                            ))}
                        </ul>
                    );
                }

                if (lines.every((line) => /^\d+\. /.test(line))) {
                    return (
                        <ol
                            key={index}
                            className="text-muted-foreground list-decimal space-y-1.5 pl-6 leading-relaxed"
                        >
                            {lines.map((line, i) => (
                                <li key={i}>
                                    {renderInline(line.replace(/^\d+\. /, ""))}
                                </li>
                            ))}
                        </ol>
                    );
                }

                return (
                    <p
                        key={index}
                        className="text-muted-foreground leading-relaxed whitespace-pre-line"
                    >
                        {renderInline(trimmed)}
                    </p>
                );
            })}
        </div>
    );
}
