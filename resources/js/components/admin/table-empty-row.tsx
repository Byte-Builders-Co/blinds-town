import type { LucideIcon } from "lucide-react";

export function TableEmptyRow({
    colSpan,
    icon: Icon,
    title,
    description = "Try adjusting your search or filters.",
}: {
    colSpan: number;
    icon: LucideIcon;
    title: string;
    description?: string;
}) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-3 py-16 text-center">
                <div className="mx-auto flex max-w-xs flex-col items-center gap-1.5">
                    <Icon className="text-muted-foreground/60 mb-1 size-8" />
                    <p className="font-medium">{title}</p>
                    <p className="text-muted-foreground text-sm">
                        {description}
                    </p>
                </div>
            </td>
        </tr>
    );
}
