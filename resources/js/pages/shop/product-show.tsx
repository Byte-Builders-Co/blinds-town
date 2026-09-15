import { Head, useForm } from '@inertiajs/react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { OptionValueCards } from '@/components/shop/option-value-cards';
import { ProductGallery } from '@/components/shop/product-gallery';
import { RelatedProducts } from '@/components/shop/related-products';
import { ReviewForm } from '@/components/shop/review-form';
import { ReviewList } from '@/components/shop/review-list';
import { WishlistButton } from '@/components/shop/wishlist-button';
import { Badge } from '@/components/ui/badge';
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { resolveSelectedOptionLabels } from '@/lib/shop';
import { formatCurrency } from '@/lib/utils';
import { reconfigure, store as addToCart } from '@/routes/cart';
import { quote } from '@/routes/products';
import {
    FUNCTIONAL_OPTION_KINDS,
    STOCK_STATUS_LABELS,
    VISUAL_OPTION_KINDS,
} from '@/types';
import type {
    CartItem,
    MeasurementUnit,
    Paginated,
    PriceBreakdown,
    Product,
    ProductOptionGroup,
    ProductReview,
} from '@/types';

function boundsInUnit(minCm: number, maxCm: number, unit: MeasurementUnit) {
    if (unit === 'cm') {
        return { min: minCm, max: maxCm };
    }

    return {
        min: Math.round((minCm / 2.54) * 10) / 10,
        max: Math.round((maxCm / 2.54) * 10) / 10,
    };
}

function groupSelections(
    optionGroups: ProductOptionGroup[],
    ids: number[],
): Record<number, number[]> {
    const result: Record<number, number[]> = {};
    for (const group of optionGroups) {
        const matched = group.values
            .filter((v) => ids.includes(v.id))
            .map((v) => v.id);
        if (matched.length > 0) {
            result[group.id] = matched;
        }
    }
    return result;
}

function isGroupVisible(group: ProductOptionGroup, selectedIds: number[]) {
    return (
        group.requires_option_value_id === null ||
        selectedIds.includes(group.requires_option_value_id)
    );
}

function isValueVisible(
    value: ProductOptionGroup['values'][number],
    selectedIds: number[],
) {
    return (
        value.requires_option_value_id === null ||
        selectedIds.includes(value.requires_option_value_id)
    );
}

export default function ProductShow({
    product,
    relatedProducts,
    isWishlisted,
    canReview,
    reviews,
    ratingBreakdown,
    editingCartItem,
}: {
    product: Product;
    relatedProducts: Product[];
    isWishlisted: boolean;
    canReview: boolean;
    reviews: Paginated<ProductReview>;
    ratingBreakdown: Record<number, number>;
    editingCartItem: CartItem | null;
}) {
    const optionGroups = useMemo(
        () => product.option_groups ?? [],
        [product.option_groups],
    );

    const [unit, setUnit] = useState<MeasurementUnit>(
        editingCartItem?.measurement_unit ?? product.measurement_unit_default,
    );
    const widthBounds = boundsInUnit(
        product.min_width_cm,
        product.max_width_cm,
        unit,
    );
    const heightBounds = boundsInUnit(
        product.min_height_cm,
        product.max_height_cm,
        unit,
    );

    const [width, setWidth] = useState(() => {
        if (editingCartItem) {
            return unit === 'inch'
                ? Math.round((editingCartItem.width_cm / 2.54) * 10) / 10
                : editingCartItem.width_cm;
        }
        return widthBounds.min;
    });
    const [height, setHeight] = useState(() => {
        if (editingCartItem) {
            return unit === 'inch'
                ? Math.round((editingCartItem.height_cm / 2.54) * 10) / 10
                : editingCartItem.height_cm;
        }
        return heightBounds.min;
    });
    const [selected, setSelected] = useState<Record<number, number[]>>(() => {
        if (editingCartItem?.selected_options) {
            return groupSelections(
                optionGroups,
                editingCartItem.selected_options,
            );
        }

        const defaults: Record<number, number[]> = {};
        for (const group of optionGroups) {
            const defaultValue =
                group.values.find((v) => v.is_default) ?? group.values[0];
            if (defaultValue) {
                defaults[group.id] = [defaultValue.id];
            }
        }
        return defaults;
    });
    const [measurementPhoto, setMeasurementPhoto] = useState<File | null>(null);
    const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
    const [quoteError, setQuoteError] = useState<string | null>(null);
    const [quoting, setQuoting] = useState(false);

    const selectedOptionIds = useMemo(
        () => Object.values(selected).flat(),
        [selected],
    );

    // Drop any selection whose "show only when" prerequisite is no longer
    // met (e.g. switching Operation Type away from Motorized clears a
    // previously chosen Motor) so stale, no-longer-visible options never
    // get priced or submitted.
    useEffect(() => {
        setSelected((prev) => {
            let changed = false;
            const next: Record<number, number[]> = {};

            for (const group of optionGroups) {
                if (!isGroupVisible(group, selectedOptionIds)) {
                    if ((prev[group.id]?.length ?? 0) > 0) changed = true;
                    continue;
                }

                const kept = (prev[group.id] ?? []).filter((id) => {
                    const value = group.values.find((v) => v.id === id);
                    return (
                        value !== undefined &&
                        isValueVisible(value, selectedOptionIds)
                    );
                });

                if (kept.length !== (prev[group.id]?.length ?? 0)) {
                    changed = true;
                }

                if (kept.length > 0) {
                    next[group.id] = kept;
                }
            }

            return changed ? next : prev;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOptionIds, optionGroups]);

    const visibleGroups = useMemo(
        () => optionGroups.filter((g) => isGroupVisible(g, selectedOptionIds)),
        [optionGroups, selectedOptionIds],
    );

    const visualGroups = visibleGroups.filter((g) =>
        VISUAL_OPTION_KINDS.includes(g.kind),
    );
    const functionalGroups = visibleGroups.filter((g) =>
        FUNCTIONAL_OPTION_KINDS.includes(g.kind),
    );

    type Section =
        | { type: 'group'; group: ProductOptionGroup }
        | { type: 'size' };

    const sections: Section[] = [
        ...visualGroups.map((group) => ({ type: 'group' as const, group })),
        { type: 'size' as const },
        ...functionalGroups.map((group) => ({ type: 'group' as const, group })),
    ];

    const mountInstructions = useMemo(() => {
        for (const group of optionGroups) {
            if (group.kind !== 'mount_type') continue;
            const selectedId = selected[group.id]?.[0];
            const value = group.values.find((v) => v.id === selectedId);
            if (value?.instructions) return value.instructions;
        }
        return null;
    }, [optionGroups, selected]);

    const configurationLabels = useMemo(
        () =>
            resolveSelectedOptionLabels(
                { ...product, option_groups: optionGroups },
                selectedOptionIds,
            ),
        [product, optionGroups, selectedOptionIds],
    );

    useEffect(() => {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            setQuoting(true);
            setQuoteError(null);
            fetch(
                quote.url(product.slug, {
                    query: {
                        width,
                        height,
                        unit,
                        option_value_ids: selectedOptionIds,
                    },
                }),
                {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                },
            )
                .then(async (res) => {
                    if (!res.ok) {
                        const body = await res.json().catch(() => null);
                        const firstError = body?.errors
                            ? (Object.values(body.errors)[0] as
                                  | string[]
                                  | undefined)
                            : null;
                        setQuoteError(
                            firstError?.[0] ??
                                'Unable to calculate a price for this configuration.',
                        );
                        setBreakdown(null);
                        return;
                    }
                    setBreakdown(await res.json());
                })
                .catch(() => {})
                .finally(() => setQuoting(false));
        }, 300);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [width, height, unit, selectedOptionIds, product.slug]);

    const form = useForm({
        product_id: product.id,
        width,
        height,
        unit,
        quantity: editingCartItem?.quantity ?? 1,
        option_value_ids: selectedOptionIds,
        measurement_photo: null as File | null,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const payload = {
            width,
            height,
            unit,
            quantity: form.data.quantity,
            option_value_ids: selectedOptionIds,
            measurement_photo: measurementPhoto,
        };

        if (editingCartItem) {
            form.transform(() => payload);
            form.put(reconfigure(editingCartItem.id).url, {
                forceFormData: true,
            });
        } else {
            form.transform(() => ({ product_id: product.id, ...payload }));
            form.post(addToCart().url, { forceFormData: true });
        }
    };

    const images = [
        ...(product.image_path ? [product.image_path] : []),
        ...(product.gallery ?? []),
    ];

    const toggleValue = (group: ProductOptionGroup, valueId: number) => {
        if (group.selection_type === 'multiple') {
            setSelected((prev) => {
                const current = prev[group.id] ?? [];
                return {
                    ...prev,
                    [group.id]: current.includes(valueId)
                        ? current.filter((id) => id !== valueId)
                        : [...current, valueId],
                };
            });
        } else {
            setSelected((prev) => ({
                ...prev,
                [group.id]: [valueId],
            }));
        }
    };

    const renderGroup = (group: ProductOptionGroup, stepNumber: number) => {
        const selectedIds = selected[group.id] ?? [];
        const selectedValues = group.values.filter((value) =>
            selectedIds.includes(value.id),
        );
        const visibleValues = group.values.filter((value) =>
            isValueVisible(value, selectedOptionIds),
        );

        return (
            <div key={group.id} className="grid gap-2">
                <Label className="text-base">
                    Step {stepNumber}: {group.name}
                    {group.is_required && (
                        <span className="text-destructive"> *</span>
                    )}
                </Label>

                {group.kind === 'color' ? (
                    <div className="flex flex-wrap gap-2">
                        {visibleValues.map((value) => {
                            const isSelected = selectedIds.includes(value.id);

                            return (
                                <button
                                    key={value.id}
                                    type="button"
                                    aria-label={value.label}
                                    aria-pressed={isSelected}
                                    title={value.label}
                                    onClick={() => toggleValue(group, value.id)}
                                    className={`size-9 rounded-full border-2 transition ${
                                        isSelected
                                            ? 'border-primary ring-primary/30 ring-2'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                    style={{
                                        backgroundColor:
                                            value.hex_color ?? '#e5e5e5',
                                    }}
                                />
                            );
                        })}
                    </div>
                ) : VISUAL_OPTION_KINDS.includes(group.kind) ||
                  group.kind === 'operation_type' ||
                  group.kind === 'motor' ||
                  group.kind === 'mechanism' ||
                  group.kind === 'accessory' ? (
                    <OptionValueCards
                        values={visibleValues}
                        selectedIds={selectedIds}
                        onToggle={(valueId) => toggleValue(group, valueId)}
                        showDescription={
                            group.kind === 'motor' ||
                            group.kind === 'mechanism' ||
                            group.kind === 'accessory'
                        }
                    />
                ) : group.selection_type === 'multiple' ? (
                    <div className="flex flex-wrap gap-3">
                        {visibleValues.map((value) => (
                            <div
                                key={value.id}
                                className="flex items-center gap-2 rounded-md border px-3 py-2"
                            >
                                <Checkbox
                                    id={`option-${value.id}`}
                                    checked={selectedIds.includes(value.id)}
                                    onCheckedChange={() =>
                                        toggleValue(group, value.id)
                                    }
                                />
                                <Label
                                    htmlFor={`option-${value.id}`}
                                    className="font-normal"
                                >
                                    {value.label}
                                    {Number(value.price_modifier) > 0 &&
                                        ` (+${formatCurrency(value.price_modifier)})`}
                                </Label>
                            </div>
                        ))}
                    </div>
                ) : (
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        value={selectedIds[0]?.toString()}
                        onValueChange={(value) => {
                            if (!value) return;
                            toggleValue(group, Number(value));
                        }}
                        className="flex-wrap justify-start"
                    >
                        {visibleValues.map((value) => (
                            <ToggleGroupItem
                                key={value.id}
                                value={value.id.toString()}
                                className="px-3"
                            >
                                {value.label}
                                {Number(value.price_modifier) > 0 &&
                                    ` (+${formatCurrency(value.price_modifier)})`}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                )}

                {group.kind === 'color' && selectedValues[0] && (
                    <p className="text-muted-foreground text-xs">
                        {selectedValues[0].label}
                        {Number(selectedValues[0].price_modifier) > 0 &&
                            ` (+${formatCurrency(selectedValues[0].price_modifier)})`}
                    </p>
                )}

                {group.kind === 'mount_type' && mountInstructions && (
                    <p className="bg-muted mt-1 rounded-md p-2 text-xs">
                        {mountInstructions}
                    </p>
                )}
            </div>
        );
    };

    return (
        <>
            <Head title={product.name} />

            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    <ProductGallery images={images} alt={product.name} />

                    <div>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                {product.category && (
                                    <p className="text-muted-foreground text-sm">
                                        {product.category.name}
                                    </p>
                                )}
                                <h1 className="mt-1 text-3xl font-semibold">
                                    {product.name}
                                </h1>
                                {product.sku && (
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        SKU: {product.sku}
                                    </p>
                                )}
                            </div>
                            <WishlistButton
                                product={product}
                                initialWishlisted={isWishlisted}
                            />
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                            {product.sale_price !== null ? (
                                <>
                                    <span className="text-2xl font-semibold">
                                        From{' '}
                                        {formatCurrency(product.sale_price)}
                                    </span>
                                    <span className="text-muted-foreground line-through">
                                        {formatCurrency(product.base_price)}
                                    </span>
                                    <Badge variant="outline">
                                        -{product.discount_percent}%
                                    </Badge>
                                </>
                            ) : (
                                <span className="text-2xl font-semibold">
                                    From {formatCurrency(product.base_price)}
                                </span>
                            )}
                        </div>

                        <Badge variant="secondary" className="mt-2">
                            {STOCK_STATUS_LABELS[product.stock_status]}
                        </Badge>

                        {product.description && (
                            <p className="text-muted-foreground mt-4">
                                {product.description}
                            </p>
                        )}

                        <form onSubmit={submit} className="mt-8 space-y-6">
                            {sections.map((section, index) => {
                                const stepNumber = index + 1;

                                if (section.type === 'size') {
                                    return (
                                        <div
                                            key="size"
                                            className="grid gap-3 rounded-lg border p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base">
                                                    Step {stepNumber}: Size
                                                </Label>
                                                <Select
                                                    value={unit}
                                                    onValueChange={(value) => {
                                                        const newUnit =
                                                            value as MeasurementUnit;
                                                        const newWidthBounds =
                                                            boundsInUnit(
                                                                product.min_width_cm,
                                                                product.max_width_cm,
                                                                newUnit,
                                                            );
                                                        const newHeightBounds =
                                                            boundsInUnit(
                                                                product.min_height_cm,
                                                                product.max_height_cm,
                                                                newUnit,
                                                            );
                                                        setUnit(newUnit);
                                                        setWidth(
                                                            newWidthBounds.min,
                                                        );
                                                        setHeight(
                                                            newHeightBounds.min,
                                                        );
                                                    }}
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="cm">
                                                            Centimeters
                                                        </SelectItem>
                                                        <SelectItem value="inch">
                                                            Inches
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="width">
                                                        Width ({unit})
                                                    </Label>
                                                    <Input
                                                        id="width"
                                                        type="number"
                                                        step="0.1"
                                                        min={widthBounds.min}
                                                        max={widthBounds.max}
                                                        value={width}
                                                        onChange={(e) =>
                                                            setWidth(
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                    <p className="text-muted-foreground text-xs">
                                                        {widthBounds.min}
                                                        &ndash;
                                                        {widthBounds.max} {unit}
                                                    </p>
                                                    {form.errors.width && (
                                                        <p className="text-destructive text-xs">
                                                            {form.errors.width}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="height">
                                                        Height ({unit})
                                                    </Label>
                                                    <Input
                                                        id="height"
                                                        type="number"
                                                        step="0.1"
                                                        min={heightBounds.min}
                                                        max={heightBounds.max}
                                                        value={height}
                                                        onChange={(e) =>
                                                            setHeight(
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                    <p className="text-muted-foreground text-xs">
                                                        {heightBounds.min}
                                                        &ndash;
                                                        {heightBounds.max}{' '}
                                                        {unit}
                                                    </p>
                                                    {form.errors.height && (
                                                        <p className="text-destructive text-xs">
                                                            {form.errors.height}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return renderGroup(section.group, stepNumber);
                            })}

                            <div className="grid gap-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min={1}
                                    max={50}
                                    className="w-24"
                                    value={form.data.quantity}
                                    onChange={(e) =>
                                        form.setData(
                                            'quantity',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="measurement_photo">
                                    Measurement photo (optional)
                                </Label>
                                {editingCartItem?.measurement_photo_path && (
                                    <p className="text-muted-foreground text-xs">
                                        A photo is already attached. Upload a
                                        new one to replace it.
                                    </p>
                                )}
                                <Input
                                    id="measurement_photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setMeasurementPhoto(
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                {form.errors.measurement_photo && (
                                    <p className="text-destructive text-xs">
                                        {form.errors.measurement_photo}
                                    </p>
                                )}
                            </div>

                            {form.errors.option_value_ids && (
                                <p className="text-destructive text-sm">
                                    {form.errors.option_value_ids}
                                </p>
                            )}

                            <div className="space-y-3 border-t pt-6">
                                <p className="text-sm font-medium">
                                    Your Configuration
                                </p>
                                {configurationLabels.length > 0 && (
                                    <dl className="text-muted-foreground space-y-1 text-sm">
                                        {configurationLabels.map((entry) => (
                                            <div
                                                key={`${entry.group}-${entry.label}`}
                                                className="flex justify-between"
                                            >
                                                <dt>{entry.group}</dt>
                                                <dd>{entry.label}</dd>
                                            </div>
                                        ))}
                                        <div className="flex justify-between">
                                            <dt>Size</dt>
                                            <dd>
                                                {width} &times; {height} {unit}
                                            </dd>
                                        </div>
                                    </dl>
                                )}

                                {quoteError ? (
                                    <p className="text-destructive text-sm">
                                        {quoteError}
                                    </p>
                                ) : breakdown ? (
                                    <dl className="text-muted-foreground space-y-1 border-t pt-3 text-sm">
                                        {breakdown.breakdown.map((line) => (
                                            <div
                                                key={line.key}
                                                className="flex justify-between"
                                            >
                                                <dt>
                                                    {line.group
                                                        ? `${line.group}: ${line.label}`
                                                        : line.label}
                                                </dt>
                                                <dd>
                                                    {line.amount < 0
                                                        ? `-${formatCurrency(Math.abs(line.amount))}`
                                                        : formatCurrency(
                                                              line.amount,
                                                          )}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                ) : null}

                                <div className="flex items-center justify-between border-t pt-2">
                                    <div>
                                        <p className="text-muted-foreground text-sm">
                                            Total price
                                        </p>
                                        <p className="text-2xl font-semibold">
                                            {quoting
                                                ? '…'
                                                : breakdown
                                                  ? formatCurrency(
                                                        breakdown.final_price,
                                                    )
                                                  : formatCurrency(
                                                        product.base_price,
                                                    )}
                                        </p>
                                    </div>
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={form.processing || !breakdown}
                                    >
                                        {editingCartItem
                                            ? 'Save Changes'
                                            : 'Add to cart'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-16 space-y-8 border-t pt-12">
                    <ReviewList
                        reviews={reviews}
                        avgRating={product.reviews_avg_rating ?? null}
                        ratingBreakdown={ratingBreakdown}
                    />
                    {canReview && <ReviewForm product={product} />}
                </div>

                <div className="mt-16 border-t pt-12">
                    <RelatedProducts products={relatedProducts} />
                </div>
            </div>
        </>
    );
}
