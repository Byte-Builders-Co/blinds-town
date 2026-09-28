import InputError from "@/components/input-error";
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
import type { Coupon, CouponRestrictionOption } from "@/types";

type Errors = Partial<
    Record<
        | "code"
        | "type"
        | "value"
        | "min_order_amount"
        | "max_discount"
        | "starts_at"
        | "ends_at"
        | "usage_limit"
        | "per_user_limit"
        | "is_active"
        | "product_ids"
        | "category_ids",
        string
    >
>;

function toDateInputValue(value: string | null): string {
    return value ? value.slice(0, 10) : "";
}

export function CouponFormFields({
    coupon,
    products,
    categories,
    errors,
}: {
    coupon?: Coupon;
    products: CouponRestrictionOption[];
    categories: CouponRestrictionOption[];
    errors: Errors;
}) {
    const selectedProductIds = new Set(
        (coupon?.products ?? []).map((product) => product.id),
    );
    const selectedCategoryIds = new Set(
        (coupon?.categories ?? []).map((category) => category.id),
    );

    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="code">Coupon code</Label>
                <Input
                    id="code"
                    name="code"
                    defaultValue={coupon?.code}
                    className="uppercase"
                    required
                />
                <InputError message={errors.code} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="type">Discount type</Label>
                    <Select
                        name="type"
                        defaultValue={coupon?.type ?? "percentage"}
                    >
                        <SelectTrigger id="type" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">
                                Percentage
                            </SelectItem>
                            <SelectItem value="fixed">Flat amount</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.type} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="value">Discount value</Label>
                    <Input
                        id="value"
                        name="value"
                        type="number"
                        step="0.01"
                        min={0}
                        defaultValue={coupon?.value ?? 0}
                        required
                    />
                    <InputError message={errors.value} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="min_order_amount">
                        Minimum order amount
                    </Label>
                    <Input
                        id="min_order_amount"
                        name="min_order_amount"
                        type="number"
                        step="0.01"
                        min={0}
                        defaultValue={coupon?.min_order_amount ?? ""}
                    />
                    <InputError message={errors.min_order_amount} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="max_discount">
                        Maximum discount (optional)
                    </Label>
                    <Input
                        id="max_discount"
                        name="max_discount"
                        type="number"
                        step="0.01"
                        min={0}
                        defaultValue={coupon?.max_discount ?? ""}
                    />
                    <InputError message={errors.max_discount} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="starts_at">Start date</Label>
                    <Input
                        id="starts_at"
                        name="starts_at"
                        type="date"
                        defaultValue={toDateInputValue(
                            coupon?.starts_at ?? null,
                        )}
                    />
                    <InputError message={errors.starts_at} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="ends_at">End date</Label>
                    <Input
                        id="ends_at"
                        name="ends_at"
                        type="date"
                        defaultValue={toDateInputValue(coupon?.ends_at ?? null)}
                    />
                    <InputError message={errors.ends_at} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="usage_limit">
                        Total usage limit (optional)
                    </Label>
                    <Input
                        id="usage_limit"
                        name="usage_limit"
                        type="number"
                        min={1}
                        defaultValue={coupon?.usage_limit ?? ""}
                    />
                    <InputError message={errors.usage_limit} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="per_user_limit">
                        Per customer limit (optional)
                    </Label>
                    <Input
                        id="per_user_limit"
                        name="per_user_limit"
                        type="number"
                        min={1}
                        defaultValue={coupon?.per_user_limit ?? ""}
                    />
                    <InputError message={errors.per_user_limit} />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input type="hidden" name="is_active" value="0" />
                <Checkbox
                    id="is_active"
                    name="is_active"
                    defaultChecked={coupon?.is_active ?? true}
                />
                <Label htmlFor="is_active">Active</Label>
                <InputError message={errors.is_active} />
            </div>

            <fieldset className="grid gap-4 rounded-lg border p-4">
                <legend className="text-sm font-medium">
                    Restrictions (leave empty to apply to all products)
                </legend>

                <div className="grid gap-2">
                    <Label>Eligible products</Label>
                    <div className="max-h-40 overflow-y-auto rounded-md border p-2">
                        {products.map((product) => (
                            <label
                                key={product.id}
                                className="flex items-center gap-2 py-1 text-sm"
                            >
                                <input
                                    type="checkbox"
                                    name="product_ids[]"
                                    value={product.id}
                                    defaultChecked={selectedProductIds.has(
                                        product.id,
                                    )}
                                />
                                {product.name}
                            </label>
                        ))}
                    </div>
                    <InputError message={errors.product_ids} />
                </div>

                <div className="grid gap-2">
                    <Label>Eligible categories</Label>
                    <div className="max-h-40 overflow-y-auto rounded-md border p-2">
                        {categories.map((category) => (
                            <label
                                key={category.id}
                                className="flex items-center gap-2 py-1 text-sm"
                            >
                                <input
                                    type="checkbox"
                                    name="category_ids[]"
                                    value={category.id}
                                    defaultChecked={selectedCategoryIds.has(
                                        category.id,
                                    )}
                                />
                                {category.name}
                            </label>
                        ))}
                    </div>
                    <InputError message={errors.category_ids} />
                </div>
            </fieldset>
        </>
    );
}
