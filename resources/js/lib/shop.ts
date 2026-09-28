import type { Product } from "@/types";

export function resolveSelectedOptionLabels(
    product: Product | undefined,
    selectedOptions: number[] | null,
): { group: string; label: string }[] {
    if (!product?.option_groups || !selectedOptions) {
        return [];
    }

    const ids = new Set(selectedOptions);

    return product.option_groups.flatMap((group) =>
        group.values
            .filter((value) => ids.has(value.id))
            .map((value) => ({ group: group.name, label: value.label })),
    );
}
