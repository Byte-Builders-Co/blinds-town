import { Head, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import InputError from '@/components/input-error';
import {
    OptionGroupBuilder,
    type EditableOptionGroup,
} from '@/components/admin/option-group-builder';
import {
    PricingTierBuilder,
    type EditablePricingTier,
} from '@/components/admin/pricing-tier-builder';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { create, index, store } from '@/routes/admin/products';
import type { Category, MeasurementUnit, StockStatus } from '@/types';

type FormData = {
    sku: string;
    category_id: string;
    name: string;
    description: string;
    price_per_sqm: string;
    min_area_sqm: string;
    base_price: string;
    tax_rate_percent: string;
    discount_percent: string;
    min_width_cm: string;
    max_width_cm: string;
    min_height_cm: string;
    max_height_cm: string;
    measurement_unit_default: MeasurementUnit;
    is_active: boolean;
    is_featured: boolean;
    stock_status: StockStatus;
    image: File | null;
    option_groups: EditableOptionGroup[];
    pricing_tiers: EditablePricingTier[];
};

export default function AdminProductCreate({
    categories,
}: {
    categories: Category[];
}) {
    const form = useForm<FormData>({
        sku: '',
        category_id: categories[0]?.id.toString() ?? '',
        name: '',
        description: '',
        price_per_sqm: '',
        min_area_sqm: '',
        base_price: '0',
        tax_rate_percent: '',
        discount_percent: '',
        min_width_cm: '30',
        max_width_cm: '300',
        min_height_cm: '30',
        max_height_cm: '300',
        measurement_unit_default: 'cm',
        is_active: true,
        is_featured: false,
        stock_status: 'in_stock',
        image: null,
        option_groups: [],
        pricing_tiers: [],
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(store().url, { forceFormData: true });
    };

    return (
        <>
            <Head title="New Product" />

            <div className="max-w-2xl p-4">
                <h1 className="text-2xl font-semibold">New Product</h1>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="category_id">Category</Label>
                        <Select
                            value={form.data.category_id}
                            onValueChange={(value) =>
                                form.setData('category_id', value)
                            }
                        >
                            <SelectTrigger id="category_id" className="w-full">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.id.toString()}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.category_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            id="sku"
                            value={form.data.sku}
                            onChange={(e) =>
                                form.setData('sku', e.target.value)
                            }
                        />
                        <InputError message={form.errors.sku} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            className="border-input dark:bg-input/30 min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs"
                        />
                        <InputError message={form.errors.description} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price_per_sqm">
                                Price per m² ($)
                            </Label>
                            <Input
                                id="price_per_sqm"
                                type="number"
                                step="0.01"
                                value={form.data.price_per_sqm}
                                onChange={(e) =>
                                    form.setData(
                                        'price_per_sqm',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                            <InputError message={form.errors.price_per_sqm} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="base_price">
                                Base / cutting fee ($)
                            </Label>
                            <Input
                                id="base_price"
                                type="number"
                                step="0.01"
                                value={form.data.base_price}
                                onChange={(e) =>
                                    form.setData('base_price', e.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.base_price} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="min_area_sqm">
                                Minimum billable area (m²)
                            </Label>
                            <Input
                                id="min_area_sqm"
                                type="number"
                                step="0.01"
                                placeholder="No minimum"
                                value={form.data.min_area_sqm}
                                onChange={(e) =>
                                    form.setData('min_area_sqm', e.target.value)
                                }
                            />
                            <InputError message={form.errors.min_area_sqm} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tax_rate_percent">
                                Tax rate (%)
                            </Label>
                            <Input
                                id="tax_rate_percent"
                                type="number"
                                step="0.01"
                                placeholder="Use store default"
                                value={form.data.tax_rate_percent}
                                onChange={(e) =>
                                    form.setData(
                                        'tax_rate_percent',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={form.errors.tax_rate_percent}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="discount_percent">
                                Discount (%)
                            </Label>
                            <Input
                                id="discount_percent"
                                type="number"
                                step="0.01"
                                placeholder="No discount"
                                value={form.data.discount_percent}
                                onChange={(e) =>
                                    form.setData(
                                        'discount_percent',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={form.errors.discount_percent}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="measurement_unit_default">
                                Default measurement unit
                            </Label>
                            <Select
                                value={form.data.measurement_unit_default}
                                onValueChange={(value) =>
                                    form.setData(
                                        'measurement_unit_default',
                                        value as MeasurementUnit,
                                    )
                                }
                            >
                                <SelectTrigger id="measurement_unit_default">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cm">
                                        Centimeters
                                    </SelectItem>
                                    <SelectItem value="inch">Inches</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError
                                message={form.errors.measurement_unit_default}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="stock_status">Stock status</Label>
                            <Select
                                value={form.data.stock_status}
                                onValueChange={(value) =>
                                    form.setData(
                                        'stock_status',
                                        value as StockStatus,
                                    )
                                }
                            >
                                <SelectTrigger id="stock_status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="in_stock">
                                        In Stock
                                    </SelectItem>
                                    <SelectItem value="out_of_stock">
                                        Out of Stock
                                    </SelectItem>
                                    <SelectItem value="made_to_order">
                                        Available for Customization
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.stock_status} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="min_width_cm">Min width (cm)</Label>
                            <Input
                                id="min_width_cm"
                                type="number"
                                value={form.data.min_width_cm}
                                onChange={(e) =>
                                    form.setData('min_width_cm', e.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.min_width_cm} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="max_width_cm">Max width (cm)</Label>
                            <Input
                                id="max_width_cm"
                                type="number"
                                value={form.data.max_width_cm}
                                onChange={(e) =>
                                    form.setData('max_width_cm', e.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.max_width_cm} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="min_height_cm">
                                Min height (cm)
                            </Label>
                            <Input
                                id="min_height_cm"
                                type="number"
                                value={form.data.min_height_cm}
                                onChange={(e) =>
                                    form.setData(
                                        'min_height_cm',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                            <InputError message={form.errors.min_height_cm} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="max_height_cm">
                                Max height (cm)
                            </Label>
                            <Input
                                id="max_height_cm"
                                type="number"
                                value={form.data.max_height_cm}
                                onChange={(e) =>
                                    form.setData(
                                        'max_height_cm',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                            <InputError message={form.errors.max_height_cm} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="image">Image</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                form.setData(
                                    'image',
                                    e.target.files?.[0] ?? null,
                                )
                            }
                        />
                        <InputError message={form.errors.image} />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_active"
                                checked={form.data.is_active}
                                onCheckedChange={(checked) =>
                                    form.setData('is_active', checked === true)
                                }
                            />
                            <Label htmlFor="is_active">Active</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_featured"
                                checked={form.data.is_featured}
                                onCheckedChange={(checked) =>
                                    form.setData(
                                        'is_featured',
                                        checked === true,
                                    )
                                }
                            />
                            <Label htmlFor="is_featured">Featured</Label>
                        </div>
                    </div>

                    <div>
                        <Label className="mb-2 block">Options</Label>
                        <OptionGroupBuilder
                            groups={form.data.option_groups}
                            errors={form.errors}
                            onChange={(groups) =>
                                form.setData('option_groups', groups)
                            }
                        />
                    </div>

                    <div>
                        <Label className="mb-2 block">Area pricing tiers</Label>
                        <PricingTierBuilder
                            tiers={form.data.pricing_tiers}
                            errors={form.errors}
                            onChange={(tiers) =>
                                form.setData('pricing_tiers', tiers)
                            }
                        />
                    </div>

                    <Button type="submit" disabled={form.processing}>
                        Create Product
                    </Button>
                </form>
            </div>
        </>
    );
}

AdminProductCreate.layout = {
    breadcrumbs: [
        { title: 'Products', href: index() },
        { title: 'New', href: create() },
    ],
};
