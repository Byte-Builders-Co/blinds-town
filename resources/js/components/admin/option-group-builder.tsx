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
import {
    OPTION_GROUP_KIND_LABELS,
    type OptionGroupKind,
    type OptionSelectionType,
} from '@/types';

export type EditableOptionValue = {
    id?: number;
    label: string;
    image: File | null;
    existing_image_path?: string | null;
    hex_color: string;
    price_modifier: string;
    price_per_sqm: string;
    instructions: string;
    is_default: boolean;
    is_active: boolean;
    requires_option_value_id: number | null;
};

export type EditableOptionGroup = {
    id?: number;
    name: string;
    kind: OptionGroupKind;
    selection_type: OptionSelectionType;
    is_required: boolean;
    is_active: boolean;
    requires_option_value_id: number | null;
    values: EditableOptionValue[];
};

const OPTION_GROUP_KINDS = Object.keys(
    OPTION_GROUP_KIND_LABELS,
) as OptionGroupKind[];

/** Kinds that support an image per option value. */
const IMAGE_KINDS: OptionGroupKind[] = [
    'fabric',
    'color',
    'pattern',
    'material',
    'operation_type',
    'motor',
    'mechanism',
    'accessory',
];

/** Kinds where the free-text "instructions" field doubles as a description. */
const DESCRIPTION_KINDS: OptionGroupKind[] = [
    'mount_type',
    'motor',
    'mechanism',
    'accessory',
];

export function newOptionGroup(): EditableOptionGroup {
    return {
        name: '',
        kind: 'custom',
        selection_type: 'single',
        is_required: true,
        is_active: true,
        requires_option_value_id: null,
        values: [newOptionValue()],
    };
}

export function newOptionValue(): EditableOptionValue {
    return {
        label: '',
        image: null,
        existing_image_path: null,
        hex_color: '',
        price_modifier: '0',
        price_per_sqm: '',
        instructions: '',
        is_default: false,
        is_active: true,
        requires_option_value_id: null,
    };
}

/** Flat list of already-persisted values (id set) across every group, for "show only when" pickers. */
function existingValueOptions(groups: EditableOptionGroup[]) {
    return groups.flatMap((group) =>
        group.values
            .filter((value) => value.id !== undefined)
            .map((value) => ({
                id: value.id as number,
                label: `${group.name || OPTION_GROUP_KIND_LABELS[group.kind]}: ${value.label || 'Untitled'}`,
            })),
    );
}

export function OptionGroupBuilder({
    groups,
    onChange,
    errors = {},
}: {
    groups: EditableOptionGroup[];
    onChange: (groups: EditableOptionGroup[]) => void;
    errors?: Record<string, string>;
}) {
    const updateGroup = (
        index: number,
        patch: Partial<EditableOptionGroup>,
    ) => {
        onChange(
            groups.map((group, i) =>
                i === index ? { ...group, ...patch } : group,
            ),
        );
    };

    const removeGroup = (index: number) => {
        onChange(groups.filter((_, i) => i !== index));
    };

    const updateValue = (
        groupIndex: number,
        valueIndex: number,
        patch: Partial<EditableOptionValue>,
    ) => {
        updateGroup(groupIndex, {
            values: groups[groupIndex].values.map((value, i) =>
                i === valueIndex ? { ...value, ...patch } : value,
            ),
        });
    };

    const removeValue = (groupIndex: number, valueIndex: number) => {
        updateGroup(groupIndex, {
            values: groups[groupIndex].values.filter(
                (_, i) => i !== valueIndex,
            ),
        });
    };

    return (
        <div className="space-y-4">
            {groups.map((group, groupIndex) => {
                const dependencyOptions = existingValueOptions(groups).filter(
                    (option) => !group.values.some((v) => v.id === option.id),
                );

                return (
                    <div key={groupIndex} className="rounded-lg border p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Option group name (e.g. Color)"
                                    value={group.name}
                                    onChange={(e) =>
                                        updateGroup(groupIndex, {
                                            name: e.target.value,
                                        })
                                    }
                                />
                                <InputError
                                    message={
                                        errors[
                                            `option_groups.${groupIndex}.name`
                                        ]
                                    }
                                />
                            </div>
                            <Select
                                value={group.kind}
                                onValueChange={(value) =>
                                    updateGroup(groupIndex, {
                                        kind: value as OptionGroupKind,
                                    })
                                }
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {OPTION_GROUP_KINDS.map((kind) => (
                                        <SelectItem key={kind} value={kind}>
                                            {OPTION_GROUP_KIND_LABELS[kind]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={group.selection_type}
                                onValueChange={(value) =>
                                    updateGroup(groupIndex, {
                                        selection_type:
                                            value as OptionSelectionType,
                                    })
                                }
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="single">
                                        Single select
                                    </SelectItem>
                                    <SelectItem value="multiple">
                                        Multi select
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={`required-${groupIndex}`}
                                    checked={group.is_required}
                                    onCheckedChange={(checked) =>
                                        updateGroup(groupIndex, {
                                            is_required: checked === true,
                                        })
                                    }
                                />
                                <Label htmlFor={`required-${groupIndex}`}>
                                    Required
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={`group-active-${groupIndex}`}
                                    checked={group.is_active}
                                    onCheckedChange={(checked) =>
                                        updateGroup(groupIndex, {
                                            is_active: checked === true,
                                        })
                                    }
                                />
                                <Label htmlFor={`group-active-${groupIndex}`}>
                                    Active
                                </Label>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeGroup(groupIndex)}
                            >
                                <Trash2 />
                            </Button>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                            <Label className="text-muted-foreground text-xs whitespace-nowrap">
                                Only show this group when:
                            </Label>
                            <Select
                                value={
                                    group.requires_option_value_id?.toString() ??
                                    'none'
                                }
                                onValueChange={(value) =>
                                    updateGroup(groupIndex, {
                                        requires_option_value_id:
                                            value === 'none'
                                                ? null
                                                : Number(value),
                                    })
                                }
                            >
                                <SelectTrigger className="h-8 w-64 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        Always shown
                                    </SelectItem>
                                    {dependencyOptions.map((option) => (
                                        <SelectItem
                                            key={option.id}
                                            value={option.id.toString()}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError
                                message={
                                    errors[
                                        `option_groups.${groupIndex}.requires_option_value_id`
                                    ]
                                }
                            />
                        </div>

                        <div className="mt-3 space-y-2">
                            {group.values.map((value, valueIndex) => (
                                <div
                                    key={valueIndex}
                                    className="flex flex-wrap items-center gap-3 rounded-md border p-2"
                                >
                                    <div className="flex-1 basis-40">
                                        <Input
                                            placeholder="Label (e.g. White)"
                                            value={value.label}
                                            onChange={(e) =>
                                                updateValue(
                                                    groupIndex,
                                                    valueIndex,
                                                    {
                                                        label: e.target.value,
                                                    },
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    `option_groups.${groupIndex}.values.${valueIndex}.label`
                                                ]
                                            }
                                        />
                                    </div>

                                    {group.kind === 'color' && (
                                        <Input
                                            type="color"
                                            value={value.hex_color || '#000000'}
                                            onChange={(e) =>
                                                updateValue(
                                                    groupIndex,
                                                    valueIndex,
                                                    {
                                                        hex_color:
                                                            e.target.value,
                                                    },
                                                )
                                            }
                                            className="h-9 w-14 p-1"
                                        />
                                    )}

                                    {IMAGE_KINDS.includes(group.kind) && (
                                        <div className="flex items-center gap-2">
                                            {value.existing_image_path && (
                                                <img
                                                    src={`/storage/${value.existing_image_path}`}
                                                    alt={value.label}
                                                    className="h-9 w-9 rounded object-cover"
                                                />
                                            )}
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    updateValue(
                                                        groupIndex,
                                                        valueIndex,
                                                        {
                                                            image:
                                                                e.target
                                                                    .files?.[0] ??
                                                                null,
                                                        },
                                                    )
                                                }
                                                className="w-40 text-xs"
                                            />
                                        </div>
                                    )}

                                    {group.kind === 'fabric' ? (
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Price / m²"
                                            value={value.price_per_sqm}
                                            onChange={(e) =>
                                                updateValue(
                                                    groupIndex,
                                                    valueIndex,
                                                    {
                                                        price_per_sqm:
                                                            e.target.value,
                                                    },
                                                )
                                            }
                                            className="w-32"
                                        />
                                    ) : (
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Price +/-"
                                            value={value.price_modifier}
                                            onChange={(e) =>
                                                updateValue(
                                                    groupIndex,
                                                    valueIndex,
                                                    {
                                                        price_modifier:
                                                            e.target.value,
                                                    },
                                                )
                                            }
                                            className="w-32"
                                        />
                                    )}

                                    {DESCRIPTION_KINDS.includes(group.kind) && (
                                        <Input
                                            placeholder={
                                                group.kind === 'mount_type'
                                                    ? 'Measurement instructions'
                                                    : 'Description'
                                            }
                                            value={value.instructions}
                                            onChange={(e) =>
                                                updateValue(
                                                    groupIndex,
                                                    valueIndex,
                                                    {
                                                        instructions:
                                                            e.target.value,
                                                    },
                                                )
                                            }
                                            className="flex-1 basis-52"
                                        />
                                    )}

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id={`default-${groupIndex}-${valueIndex}`}
                                            checked={value.is_default}
                                            onCheckedChange={(checked) =>
                                                updateValue(
                                                    groupIndex,
                                                    valueIndex,
                                                    {
                                                        is_default:
                                                            checked === true,
                                                    },
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor={`default-${groupIndex}-${valueIndex}`}
                                        >
                                            Default
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id={`value-active-${groupIndex}-${valueIndex}`}
                                            checked={value.is_active}
                                            onCheckedChange={(checked) =>
                                                updateValue(
                                                    groupIndex,
                                                    valueIndex,
                                                    {
                                                        is_active:
                                                            checked === true,
                                                    },
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor={`value-active-${groupIndex}-${valueIndex}`}
                                        >
                                            Active
                                        </Label>
                                    </div>
                                    <div className="flex w-full basis-full items-center gap-2">
                                        <Label className="text-muted-foreground text-xs whitespace-nowrap">
                                            Only show when:
                                        </Label>
                                        <Select
                                            value={
                                                value.requires_option_value_id?.toString() ??
                                                'none'
                                            }
                                            onValueChange={(selected) =>
                                                updateValue(
                                                    groupIndex,
                                                    valueIndex,
                                                    {
                                                        requires_option_value_id:
                                                            selected === 'none'
                                                                ? null
                                                                : Number(
                                                                      selected,
                                                                  ),
                                                    },
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-8 w-64 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    Always available
                                                </SelectItem>
                                                {existingValueOptions(groups)
                                                    .filter(
                                                        (option) =>
                                                            option.id !==
                                                            value.id,
                                                    )
                                                    .map((option) => (
                                                        <SelectItem
                                                            key={option.id}
                                                            value={option.id.toString()}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                errors[
                                                    `option_groups.${groupIndex}.values.${valueIndex}.requires_option_value_id`
                                                ]
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            removeValue(groupIndex, valueIndex)
                                        }
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    updateGroup(groupIndex, {
                                        values: [
                                            ...group.values,
                                            newOptionValue(),
                                        ],
                                    })
                                }
                            >
                                <Plus /> Add value
                            </Button>
                        </div>
                    </div>
                );
            })}

            <Button
                type="button"
                variant="outline"
                onClick={() => onChange([...groups, newOptionGroup()])}
            >
                <Plus /> Add option group
            </Button>
        </div>
    );
}
