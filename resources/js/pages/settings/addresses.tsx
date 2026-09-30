import { Form, Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import AddressController from "@/actions/App/Http/Controllers/Customer/AddressController";
import { AddressFormFields } from "@/components/account/address-form-fields";
import { ConfirmDialog } from "@/components/confirm-dialog";
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
import type { Address, Auth } from "@/types";

export default function Addresses({ addresses }: { addresses: Address[] }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<Address | null>(null);
    const [deleting, setDeleting] = useState<Address | null>(null);

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
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            {address.type}
                                        </Badge>
                                        {address.is_default && (
                                            <Badge>Default</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setEditing(address)}
                                            aria-label="Edit address"
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setDeleting(address)}
                                            aria-label="Delete address"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    {address.address_line1}
                                    {address.address_line2 &&
                                        `, ${address.address_line2}`}
                                    <br />
                                    {address.city}, {address.state}{" "}
                                    {address.pincode}
                                    <br />
                                    {address.country}
                                </p>
                                {!address.is_default && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
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
        </>
    );
}
