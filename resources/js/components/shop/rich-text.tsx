export function RichText({ text }: { text: string }) {
    const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim() !== "");

    return (
        <div className="space-y-4">
            {paragraphs.map((paragraph, index) => (
                <p
                    key={index}
                    className="text-muted-foreground whitespace-pre-line"
                >
                    {paragraph}
                </p>
            ))}
        </div>
    );
}
