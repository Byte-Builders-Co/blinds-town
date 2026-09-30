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
import type { Address } from "@/types";

type Errors = Partial<Record<keyof Address, string>>;

export function AddressFormFields({
    address,
    defaultFullName,
    defaultMobileNumber,
    errors,
}: {
    address?: Address;
    defaultFullName?: string;
    defaultMobileNumber?: string;
    errors: Errors;
}) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                    id="full_name"
                    name="full_name"
                    defaultValue={address?.full_name ?? defaultFullName}
                    required
                />
                <InputError message={errors.full_name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="mobile_number">Mobile number</Label>
                <Input
                    id="mobile_number"
                    name="mobile_number"
                    defaultValue={address?.mobile_number ?? defaultMobileNumber}
                    required
                />
                <InputError message={errors.mobile_number} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address_line1">Address line 1</Label>
                <Input
                    id="address_line1"
                    name="address_line1"
                    defaultValue={address?.address_line1}
                    required
                />
                <InputError message={errors.address_line1} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address_line2">Address line 2 (optional)</Label>
                <Input
                    id="address_line2"
                    name="address_line2"
                    defaultValue={address?.address_line2 ?? ""}
                />
                <InputError message={errors.address_line2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                        id="city"
                        name="city"
                        defaultValue={address?.city}
                        required
                    />
                    <InputError message={errors.city} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                        id="state"
                        name="state"
                        defaultValue={address?.state}
                        required
                    />
                    <InputError message={errors.state} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                        id="country"
                        name="country"
                        defaultValue={address?.country}
                        required
                    />
                    <InputError message={errors.country} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                        id="pincode"
                        name="pincode"
                        defaultValue={address?.pincode}
                        required
                    />
                    <InputError message={errors.pincode} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="landmark">Landmark (optional)</Label>
                <Input
                    id="landmark"
                    name="landmark"
                    defaultValue={address?.landmark ?? ""}
                />
                <InputError message={errors.landmark} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="type">Address type</Label>
                <Select name="type" defaultValue={address?.type ?? "home"}>
                    <SelectTrigger id="type" className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <InputError message={errors.type} />
            </div>

            <div className="flex items-center gap-2">
                <input type="hidden" name="is_default" value="0" />
                <Checkbox
                    id="is_default"
                    name="is_default"
                    defaultChecked={address?.is_default ?? false}
                />
                <Label htmlFor="is_default">Set as default address</Label>
            </div>
        </>
    );
}
