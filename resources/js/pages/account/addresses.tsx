import { Form, Head, router, usePage } from "@inertiajs/react";
import {
    Briefcase,
    Home,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Star,
    Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import AddressController from "@/actions/App/Http/Controllers/Customer/AddressController";
import { AccountLayout } from "@/components/account/account-layout";
import { AddressFormFields } from "@/components/account/address-form-fields";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { setDefault } from "@/routes/addresses";
import type { Address, AddressType } from "@/types";

const TYPE_META: Record<AddressType, { label: string; icon: LucideIcon }> = {
    home: { label: "Home", icon: Home },
    office: { label: "Office", icon: Briefcase },
    other: { label: "Other", icon: MapPin },
};

export default function Addresses({
    stats,
    addresses,
}: {
    stats: { orders: number; wishlist: number };
    addresses: Address[];
}) {
    const { auth } = usePage().props;
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<Address | null>(null);
    const [deleting, setDeleting] = useState<Address | null>(null);

    return (
        <AccountLayout stats={stats}>
            <Head title="Saved Addresses" />

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Saved Addresses
                    </h1>
                    <p className="text-muted-foreground mt-1.5 text-sm">
                        Manage the delivery addresses for your blinds orders.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)}>
                    <Plus /> Add New Address
                </Button>
            </div>

            {addresses.length === 0 ? (
                <div className="flex flex-col items-center border-y px-6 py-16 text-center">
                    <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                        <MapPin className="size-6" />
                    </span>
                    <h2 className="mt-4 text-lg font-semibold">
                        No saved addresses yet
                    </h2>
                    <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                        Add an address once and use it for faster checkout on
                        every order.
                    </p>
                    
                </div>
            ) : (
                <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
                    {addresses.map((address) => {
                        const meta = TYPE_META[address.type] ?? TYPE_META.other;

                        return (
                            <article
                                key={address.id}
                                className="flex flex-col border-t pt-5"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-2 text-sm font-semibold">
                                        <meta.icon className="text-muted-foreground size-4" />
                                        {meta.label}
                                    </span>
                                    {address.is_default && (
                                        <span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                                            Default
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 space-y-1 pt-4 text-sm">
                                    <p className="font-semibold">
                                        {address.full_name}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {address.address_line1}
                                        {address.address_line2 &&
                                            `, ${address.address_line2}`}
                                    </p>
                                    {address.landmark && (
                                        <p className="text-muted-foreground">
                                            Near {address.landmark}
                                        </p>
                                    )}
                                    <p className="text-muted-foreground">
                                        {address.city}, {address.state} -{" "}
                                        {address.pincode}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {address.country}
                                    </p>
                                    <p className="text-muted-foreground flex items-center gap-2 pt-2">
                                        <Phone className="size-3.5" />
                                        {address.mobile_number}
                                    </p>
                                </div>

                                <div className="mt-5 flex flex-wrap items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditing(address)}
                                    >
                                        <Pencil /> Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive dark:text-red-400"
                                        onClick={() => setDeleting(address)}
                                    >
                                        <Trash2 /> Delete
                                    </Button>
                                    {!address.is_default && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="ml-auto"
                                            onClick={() =>
                                                router.patch(
                                                    setDefault(address).url,
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            <Star /> Set as default
                                        </Button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            <Dialog open={creating} onOpenChange={setCreating}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                        <DialogDescription>
                            Where should we deliver your order?
                        </DialogDescription>
                    </DialogHeader>
                    <Form
                        {...AddressController.store.form()}
                        onSuccess={() => setCreating(false)}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <AddressFormFields
                                    defaultFullName={auth.user.name}
                                    defaultMobileNumber={
                                        auth.user.mobile_number ?? undefined
                                    }
                                    errors={errors}
                                />
                                <Button type="submit" disabled={processing}>
                                    Save address
                                </Button>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Address</DialogTitle>
                        <DialogDescription>
                            Update the details of this address.
                        </DialogDescription>
                    </DialogHeader>
                    {editing && (
                        <Form
                            {...AddressController.update.form(editing)}
                            onSuccess={() => setEditing(null)}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <AddressFormFields
                                        address={editing}
                                        errors={errors}
                                    />
                                    <Button type="submit" disabled={processing}>
                                        Save changes
                                    </Button>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete this address?"
                description="This address will be permanently removed from your account."
                confirmLabel="Delete"
                onConfirm={() => {
                    if (deleting) {
                        router.delete(AddressController.destroy(deleting).url, {
                            preserveScroll: true,
                        });
                    }
                }}
            />
        </AccountLayout>
    );
}
