import type { Category } from "@/types";

export type CategoryChoice = {
    id: number;
    name: string;
    /** 0 for a top-level category, 1 for a subcategory. */
    depth: 0 | 1;
};

/**
 * Orders categories as a tree for pickers: each top-level category is
 * followed by its subcategories, so they read as "Parent" then "— Child".
 */
export function categoryChoices(
    categories: Pick<Category, "id" | "name" | "parent_id">[],
): CategoryChoice[] {
    const topLevel = categories.filter(
        (category) => category.parent_id === null,
    );

    return topLevel.flatMap((parent) => [
        { id: parent.id, name: parent.name, depth: 0 as const },
        ...categories
            .filter((category) => category.parent_id === parent.id)
            .map((child) => ({
                id: child.id,
                name: child.name,
                depth: 1 as const,
            })),
    ]);
}
