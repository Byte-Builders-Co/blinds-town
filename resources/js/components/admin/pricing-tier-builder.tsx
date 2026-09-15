import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PRICING_TIER_TYPE_LABELS, type PricingTierType } from '@/types';

export type EditablePricingTier = {
    id?: number;
    min_area_sqm: string;
    max_area_sqm: string;
    pricing_type: PricingTierType;
    price: string;
    is_active: boolean;
};

export function newPricingTier(): EditablePricingTier {
    return {
        min_area_sqm: '0',
        max_area_sqm: '',
        pricing_type: 'per_sqm',
        price: '0',
        is_active: true,
    };
}

export function PricingTierBuilder({
    tiers,
    onChange,
    errors = {},
}: {
    tiers: EditablePricingTier[];
    onChange: (tiers: EditablePricingTier[]) => void;
    errors?: Record<string, string>;
}) {
    const updateTier = (index: number, patch: Partial<EditablePricingTier>) => {
        onChange(
            tiers.map((tier, i) =>
                i === index ? { ...tier, ...patch } : tier,
            ),
        );
    };

    const removeTier = (index: number) => {
        onChange(tiers.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
                Optional area-based pricing brackets (e.g. 0&ndash;30 sq.ft at
                one rate, 31&ndash;60 sq.ft at another). When any bracket is
                active, it replaces the linear price-per-m² for this
                product&rsquo;s base area cost; material/fabric add-ons still
                stack on top as usual. Leave empty to keep the simple linear
                rate.
            </p>

            {tiers.map((tier, index) => (
                <div
                    key={index}
                    className="flex flex-wrap items-center gap-3 rounded-md border p-2"
                >
                    <div className="w-28">
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="Min m²"
                            value={tier.min_area_sqm}
                            onChange={(e) =>
                                updateTier(index, {
                                    min_area_sqm: e.target.value,
                                })
                            }
                        />
                        <InputError
                            message={
                                errors[`pricing_tiers.${index}.min_area_sqm`]
                            }
                        />
                    </div>
                    <div className="w-28">
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="Max m² (blank = ∞)"
                            value={tier.max_area_sqm}
                            onChange={(e) =>
                                updateTier(index, {
                                    max_area_sqm: e.target.value,
                                })
                            }
                        />
                        <InputError
                            message={
                                errors[`pricing_tiers.${index}.max_area_sqm`]
                            }
                        />
                    </div>
                    <Select
                        value={tier.pricing_type}
                        onValueChange={(value) =>
                            updateTier(index, {
                                pricing_type: value as PricingTierType,
                            })
                        }
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(PRICING_TIER_TYPE_LABELS).map(
                                ([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                    <div className="w-32">
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="Price"
                            value={tier.price}
                            onChange={(e) =>
                                updateTier(index, { price: e.target.value })
                            }
                        />
                        <InputError
                            message={errors[`pricing_tiers.${index}.price`]}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`tier-active-${index}`}
                            checked={tier.is_active}
                            onCheckedChange={(checked) =>
                                updateTier(index, {
                                    is_active: checked === true,
                                })
                            }
                        />
                        <Label htmlFor={`tier-active-${index}`}>Active</Label>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTier(index)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange([...tiers, newPricingTier()])}
            >
                <Plus /> Add pricing tier
            </Button>
        </div>
    );
}
