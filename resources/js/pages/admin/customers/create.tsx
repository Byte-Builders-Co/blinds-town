import { Head, Link, useForm } from "@inertiajs/react";
import { type FormEvent } from "react";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { create, index, store } from "@/routes/admin/customers";
import { USER_STATUS_LABELS } from "@/types/auth";
import type { UserStatus } from "@/types";

type FormData = {
    first_name: string;
    last_name: string;
    email: string;
    mobile_number: string;
    password: string;
    password_confirmation: string;
    status: UserStatus;
};

export default function AdminCustomerCreate({
    statuses,
}: {
    statuses: UserStatus[];
}) {
    const form = useForm<FormData>({
        first_name: "",
        last_name: "",
        email: "",
        mobile_number: "",
        password: "",
        password_confirmation: "",
        status: "active",
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(store().url);
    };

    return (
        <>
            <Head title="New Customer" />

            <div className="p-4 md:p-6">
                <h1 className="text-2xl font-semibold">New Customer</h1>

                <form onSubmit={submit} className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="first_name">First name</Label>
                                <Input
                                    id="first_name"
                                    value={form.data.first_name}
                                    onChange={(e) =>
                                        form.setData(
                                            "first_name",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError
                                    message={form.errors.first_name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Last name</Label>
                                <Input
                                    id="last_name"
                                    value={form.data.last_name}
                                    onChange={(e) =>
                                        form.setData(
                                            "last_name",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError message={form.errors.last_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) =>
                                        form.setData("email", e.target.value)
                                    }
                                    required
                                />
                                <InputError message={form.errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="mobile_number">
                                    Mobile number (optional)
                                </Label>
                                <Input
                                    id="mobile_number"
                                    value={form.data.mobile_number}
                                    onChange={(e) =>
                                        form.setData(
                                            "mobile_number",
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.mobile_number}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) =>
                                        form.setData(
                                            "password",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError message={form.errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={(e) =>
                                        form.setData(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={form.data.status}
                                    onValueChange={(value) =>
                                        form.setData(
                                            "status",
                                            value as UserStatus,
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        id="status"
                                        className="w-full"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((status) => (
                                            <SelectItem
                                                key={status}
                                                value={status}
                                            >
                                                {USER_STATUS_LABELS[status]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.status} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-background sticky bottom-0 -mx-4 mt-6 flex justify-end gap-2 border-t px-4 py-4 md:-mx-6 md:px-6">
                        <Button type="button" variant="outline" asChild>
                            <Link href={index()}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Create Customer
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

AdminCustomerCreate.layout = {
    breadcrumbs: [
        { title: "Customers", href: index() },
        { title: "New", href: create() },
    ],
};
