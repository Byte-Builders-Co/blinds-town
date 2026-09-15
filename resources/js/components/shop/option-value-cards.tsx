import { formatCurrency } from '@/lib/utils';
import type { ProductOptionValue } from '@/types';

export function OptionValueCards({
    values,
    selectedIds,
    onToggle,
    showImage = true,
    showDescription = false,
}: {
    values: ProductOptionValue[];
    selectedIds: number[];
    onToggle: (valueId: number) => void;
    showImage?: boolean;
    showDescription?: boolean;
}) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {values.map((value) => {
                const isSelected = selectedIds.includes(value.id);
                const modifier = Number(value.price_modifier);

                return (
                    <button
                        key={value.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onToggle(value.id)}
                        className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition ${
                            isSelected
                                ? 'border-primary bg-primary/5 ring-primary/30 ring-2'
                                : 'border-border hover:border-primary/50'
                        }`}
                    >
                        {showImage && value.image_path && (
                            <img
                                src={`/storage/${value.image_path}`}
                                alt={value.label}
                                className="h-20 w-full rounded object-cover"
                            />
                        )}
                        <span className="text-sm font-medium">
                            {value.label}
                        </span>
                        {showDescription && value.instructions && (
                            <span className="text-muted-foreground text-xs">
                                {value.instructions}
                            </span>
                        )}
                        {modifier !== 0 && (
                            <span className="text-muted-foreground text-xs">
                                {modifier > 0 ? '+' : ''}
                                {formatCurrency(value.price_modifier)}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
