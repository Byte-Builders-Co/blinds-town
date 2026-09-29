import InputError from "@/components/input-error";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Category, CategoryOption } from "@/types";

type Errors = Partial<
    Record<
        | "parent_id"
        | "name"
        | "short_description"
        | "description"
        | "image"
        | "banner_image"
        | "meta_title"
        | "meta_description"
        | "meta_keywords"
        | "sort_order"
        | "is_featured"
        | "is_active",
        string
    >
>;

export function CategoryFormFields({
    category,
    parentOptions,
    errors,
}: {
    category?: Category;
    parentOptions: CategoryOption[];
    errors: Errors;
}) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Basic details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="parent_id">
                            Parent category (optional)
                        </Label>
                        <Select
                            name="parent_id"
                            defaultValue={
                                category?.parent_id?.toString() ?? "none"
                            }
                        >
                            <SelectTrigger id="parent_id" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    None (top-level category)
                                </SelectItem>
                                {parentOptions.map((option) => (
                                    <SelectItem
                                        key={option.id}
                                        value={option.id.toString()}
                                    >
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.parent_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={category?.name}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="short_description">
                            Short description (optional)
                        </Label>
                        <Input
                            id="short_description"
                            name="short_description"
                            defaultValue={category?.short_description ?? ""}
                        />
                        <InputError message={errors.short_description} />
                    </div>

                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            name="description"
                            defaultValue={category?.description ?? ""}
                            className="border-input dark:bg-input/30 min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs"
                        />
                        <InputError message={errors.description} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Media</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="image">Image</Label>
                        {category?.image_path && (
                            <img
                                src={`/storage/${category.image_path}`}
                                alt={category.name}
                                className="h-24 w-24 rounded-md object-cover"
                            />
                        )}
                        <Input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                        />
                        <InputError message={errors.image} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="banner_image">
                            Banner image (optional)
                        </Label>
                        {category?.banner_image_path && (
                            <img
                                src={`/storage/${category.banner_image_path}`}
                                alt={category.name}
                                className="h-24 w-full rounded-md object-cover"
                            />
                        )}
                        <Input
                            id="banner_image"
                            name="banner_image"
                            type="file"
                            accept="image/*"
                        />
                        <InputError message={errors.banner_image} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Organization & status</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="sort_order">Sort order</Label>
                        <Input
                            id="sort_order"
                            name="sort_order"
                            type="number"
                            min={0}
                            className="w-32"
                            defaultValue={category?.sort_order ?? 0}
                        />
                        <InputError message={errors.sort_order} />
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="hidden" name="is_featured" value="0" />
                        <Checkbox
                            id="is_featured"
                            name="is_featured"
                            defaultChecked={category?.is_featured ?? false}
                        />
                        <Label htmlFor="is_featured">Featured</Label>
                        <InputError message={errors.is_featured} />
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="hidden" name="is_active" value="0" />
                        <Checkbox
                            id="is_active"
                            name="is_active"
                            defaultChecked={category?.is_active ?? true}
                        />
                        <Label htmlFor="is_active">Active</Label>
                        <InputError message={errors.is_active} />
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Search engine details</CardTitle>
                    <CardDescription>
                        Optional — used for search engine listings and social
                        sharing.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="meta_title">Meta title</Label>
                        <Input
                            id="meta_title"
                            name="meta_title"
                            defaultValue={category?.meta_title ?? ""}
                        />
                        <InputError message={errors.meta_title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="meta_keywords">Meta keywords</Label>
                        <Input
                            id="meta_keywords"
                            name="meta_keywords"
                            defaultValue={category?.meta_keywords ?? ""}
                        />
                        <InputError message={errors.meta_keywords} />
                    </div>

                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="meta_description">
                            Meta description
                        </Label>
                        <Input
                            id="meta_description"
                            name="meta_description"
                            defaultValue={category?.meta_description ?? ""}
                        />
                        <InputError message={errors.meta_description} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
