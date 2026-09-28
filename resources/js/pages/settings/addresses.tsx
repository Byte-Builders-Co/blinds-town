import { Form, Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import AddressController from "@/actions/App/Http/Controllers/Customer/AddressController";
import { AddressFormFields } from "@/components/account/address-form-fields";
import Heading from "@/components/heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { setDefault } from "@/routes/addresses";
import type { Address } from "@/types";

export default function Addresses({ addresses }: { addresses: Address[] }) {
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<Address | null>(null);

    return (
        <>
            <Head title="Addresses" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Addresses"
                        description="Manage your shipping addresses"
                    />
                    <Button size="sm" onClick={() => setCreating(true)}>
                        <Plus /> Add address
                    </Button>
                </div>

                {addresses.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        You haven&apos;t added any addresses yet.
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">
                                        {address.full_name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            {address.type}
                                        </Badge>
                                        {address.is_default && (
                                            <Badge>Default</Badge>
                                        )}
                                    </div>
                                </div>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {address.address_line1}
                                    {address.address_line2 &&
                                        `, ${address.address_line2}`}
                                    <br />
                                    {address.city}, {address.state}{" "}
                                    {address.pincode}
                                    <br />
                                    {address.country} &middot;{" "}
                                    {address.mobile_number}
                                </p>
                                <div className="mt-3 flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditing(address)}
                                    >
                                        Edit
                                    </Button>
                                    {!address.is_default && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.patch(
                                                    setDefault(address).url,
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            <Star /> Set default
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            if (
                                                confirm("Delete this address?")
                                            ) {
                                                router.delete(
                                                    AddressController.destroy(
                                                        address,
                                                    ).url,
                                                    { preserveScroll: true },
                                                );
                                            }
                                        }}
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={creating} onOpenChange={setCreating}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add address</DialogTitle>
                    </DialogHeader>
                    <Form
                        {...AddressController.store.form()}
                        onSuccess={() => setCreating(false)}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <AddressFormFields errors={errors} />
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
                        <DialogTitle>Edit address</DialogTitle>
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
        </>
    );
}
