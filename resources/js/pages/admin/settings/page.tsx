import { Form, Head, Link } from "@inertiajs/react";
import AdminSettingsController from "@/actions/App/Http/Controllers/Admin/SettingsController";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { edit } from "@/routes/admin/settings";
import type { SettingsGroup } from "@/types";

const groupTitles: Record<SettingsGroup, string> = {
    store: "Website Configuration",
    business: "Basic Store Settings",
    tax: "Basic Store Settings: GST / Tax",
    shipping: "Basic Store Settings: Shipping",
    payment: "Basic Store Settings: Payment",
    notifications: "Email Notifications",
};

/**
 * "Basic Store Settings" is one module with four sub-sections. Only the
 * first ("business") appears in the sidebar — these tabs keep tax,
 * shipping and payment reachable without adding extra top-level nav items.
 */
const basicStoreSettingsTabs: { group: SettingsGroup; label: string }[] = [
    { group: "business", label: "Business Info" },
    { group: "tax", label: "GST / Tax" },
    { group: "shipping", label: "Shipping" },
    { group: "payment", label: "Payment" },
];

function SettingCheckbox(props: {
    name: string;
    label: string;
    defaultChecked?: boolean;
    error?: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <input type="hidden" name={props.name} value="0" />
            <Checkbox
                id={props.name}
                name={props.name}
                defaultChecked={props.defaultChecked ?? false}
            />
            <Label htmlFor={props.name}>{props.label}</Label>
            <InputError message={props.error} />
        </div>
    );
}

function Field(props: {
    name: string;
    label: string;
    defaultValue?: string | number | null;
    type?: string;
    error?: string;
    required?: boolean;
    className?: string;
}) {
    return (
        <div className={`grid gap-2 ${props.className ?? ""}`}>
            <Label htmlFor={props.name}>{props.label}</Label>
            <Input
                id={props.name}
                name={props.name}
                type={props.type ?? "text"}
                step={props.type === "number" ? "0.01" : undefined}
                defaultValue={props.defaultValue ?? ""}
                required={props.required}
            />
            <InputError message={props.error} />
        </div>
    );
}

export default function AdminSettingsPage({
    group,
    values,
}: {
    group: SettingsGroup;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: Record<string, any>;
}) {
    return (
        <>
            <Head title={groupTitles[group]} />

            <div className="p-4 md:p-6">
                <h1 className="text-2xl font-semibold">{groupTitles[group]}</h1>

                {basicStoreSettingsTabs.some((tab) => tab.group === group) && (
                    <div className="mt-4 flex flex-wrap gap-2 border-b pb-2">
                        {basicStoreSettingsTabs.map((tab) => (
                            <Button
                                key={tab.group}
                                variant={
                                    tab.group === group ? "default" : "outline"
                                }
                                size="sm"
                                asChild
                            >
                                <Link href={edit(tab.group)}>{tab.label}</Link>
                            </Button>
                        ))}
                    </div>
                )}

                <Form
                    {...AdminSettingsController.update.form(group)}
                    encType={
                        group === "store" ? "multipart/form-data" : undefined
                    }
                    className="mt-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-6 lg:grid-cols-2">
                                {group === "store" && (
                                    <>
                                        <Card className="lg:col-span-2">
                                            <CardHeader>
                                                <CardTitle>
                                                    Store details
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                                <Field
                                                    name="store_name"
                                                    label="Store name"
                                                    defaultValue={
                                                        values.store_name
                                                    }
                                                    required
                                                    error={errors.store_name}
                                                />
                                                <Field
                                                    name="store_email"
                                                    label="Store email"
                                                    type="email"
                                                    defaultValue={
                                                        values.store_email
                                                    }
                                                    error={errors.store_email}
                                                />
                                                <Field
                                                    name="store_phone"
                                                    label="Store phone"
                                                    defaultValue={
                                                        values.store_phone
                                                    }
                                                    error={errors.store_phone}
                                                />
                                                <Field
                                                    name="store_address"
                                                    label="Store address"
                                                    defaultValue={
                                                        values.store_address
                                                    }
                                                    error={
                                                        errors.store_address
                                                    }
                                                />
                                                <Field
                                                    name="currency"
                                                    label="Currency (e.g. usd)"
                                                    defaultValue={
                                                        values.currency
                                                    }
                                                    required
                                                    error={errors.currency}
                                                />
                                                <Field
                                                    name="timezone"
                                                    label="Timezone"
                                                    defaultValue={
                                                        values.timezone
                                                    }
                                                    required
                                                    error={errors.timezone}
                                                />
                                            </CardContent>
                                        </Card>

                                        <Card className="lg:col-span-2">
                                            <CardHeader>
                                                <CardTitle>Branding</CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="logo">
                                                        Logo
                                                    </Label>
                                                    {values.logo_path && (
                                                        <img
                                                            src={`/storage/${values.logo_path}`}
                                                            alt="Logo"
                                                            className="h-16 w-auto rounded-md border object-contain"
                                                        />
                                                    )}
                                                    <Input
                                                        id="logo"
                                                        name="logo"
                                                        type="file"
                                                        accept="image/*"
                                                    />
                                                    <InputError
                                                        message={errors.logo}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="favicon">
                                                        Favicon
                                                    </Label>
                                                    {values.favicon_path && (
                                                        <img
                                                            src={`/storage/${values.favicon_path}`}
                                                            alt="Favicon"
                                                            className="size-8 rounded-md border object-contain"
                                                        />
                                                    )}
                                                    <Input
                                                        id="favicon"
                                                        name="favicon"
                                                        type="file"
                                                        accept="image/*"
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.favicon
                                                        }
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}

                                {group === "business" && (
                                    <Card className="lg:col-span-2">
                                        <CardHeader>
                                            <CardTitle>
                                                Business details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-4 sm:grid-cols-2">
                                            <Field
                                                name="legal_business_name"
                                                label="Legal business name"
                                                defaultValue={
                                                    values.legal_business_name
                                                }
                                                error={
                                                    errors.legal_business_name
                                                }
                                            />
                                            <Field
                                                name="business_address"
                                                label="Business address"
                                                defaultValue={
                                                    values.business_address
                                                }
                                                error={
                                                    errors.business_address
                                                }
                                            />
                                            <Field
                                                name="business_phone"
                                                label="Business phone"
                                                defaultValue={
                                                    values.business_phone
                                                }
                                                error={errors.business_phone}
                                            />
                                            <Field
                                                name="business_email"
                                                label="Business email"
                                                type="email"
                                                defaultValue={
                                                    values.business_email
                                                }
                                                error={errors.business_email}
                                            />
                                            <Field
                                                name="gstin"
                                                label="GSTIN"
                                                defaultValue={values.gstin}
                                                error={errors.gstin}
                                            />
                                            <Field
                                                name="registration_details"
                                                label="Business registration details"
                                                defaultValue={
                                                    values.registration_details
                                                }
                                                error={
                                                    errors.registration_details
                                                }
                                            />
                                        </CardContent>
                                    </Card>
                                )}

                                {group === "tax" && (
                                    <Card className="lg:col-span-2">
                                        <CardHeader>
                                            <CardTitle>GST / Tax</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-4 sm:grid-cols-2">
                                            <SettingCheckbox
                                                name="gst_enabled"
                                                label="GST enabled"
                                                defaultChecked={
                                                    values.gst_enabled
                                                }
                                                error={errors.gst_enabled}
                                            />
                                            <SettingCheckbox
                                                name="tax_inclusive"
                                                label="Prices are tax inclusive"
                                                defaultChecked={
                                                    values.tax_inclusive
                                                }
                                                error={errors.tax_inclusive}
                                            />
                                            <Field
                                                name="gst_rate"
                                                label="GST rate (%)"
                                                type="number"
                                                defaultValue={
                                                    values.gst_rate
                                                }
                                                required
                                                error={errors.gst_rate}
                                            />
                                        </CardContent>
                                    </Card>
                                )}

                                {group === "shipping" && (
                                    <Card className="lg:col-span-2">
                                        <CardHeader>
                                            <CardTitle>Shipping</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-4 sm:grid-cols-2">
                                            <SettingCheckbox
                                                name="shipping_enabled"
                                                label="Shipping enabled"
                                                defaultChecked={
                                                    values.shipping_enabled
                                                }
                                                error={
                                                    errors.shipping_enabled
                                                }
                                            />
                                            <div />
                                            <Field
                                                name="default_shipping_charge"
                                                label="Default shipping charge"
                                                type="number"
                                                defaultValue={
                                                    values.default_shipping_charge
                                                }
                                                required
                                                error={
                                                    errors.default_shipping_charge
                                                }
                                            />
                                            <Field
                                                name="free_shipping_threshold"
                                                label="Free shipping threshold (optional)"
                                                type="number"
                                                defaultValue={
                                                    values.free_shipping_threshold
                                                }
                                                error={
                                                    errors.free_shipping_threshold
                                                }
                                            />
                                            <Field
                                                name="installation_charge"
                                                label="Installation charge"
                                                type="number"
                                                defaultValue={
                                                    values.installation_charge
                                                }
                                                required
                                                error={
                                                    errors.installation_charge
                                                }
                                            />
                                        </CardContent>
                                    </Card>
                                )}

                                {group === "payment" && (
                                    <Card className="lg:col-span-2">
                                        <CardHeader>
                                            <CardTitle>Payment</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-4 sm:grid-cols-2">
                                            <Field
                                                name="payment_gateway"
                                                label="Payment gateway"
                                                defaultValue={
                                                    values.payment_gateway
                                                }
                                                required
                                                error={
                                                    errors.payment_gateway
                                                }
                                            />
                                            <SettingCheckbox
                                                name="test_mode"
                                                label="Test mode"
                                                defaultChecked={
                                                    values.test_mode
                                                }
                                                error={errors.test_mode}
                                            />
                                            <p className="text-muted-foreground text-xs sm:col-span-2">
                                                Gateway API keys are
                                                configured via the server
                                                environment and are never
                                                exposed here.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {group === "notifications" && (
                                    <>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Channels</CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid gap-3">
                                                <SettingCheckbox
                                                    name="channel_email"
                                                    label="Email"
                                                    defaultChecked={
                                                        values.channel_email
                                                    }
                                                    error={
                                                        errors.channel_email
                                                    }
                                                />
                                                <SettingCheckbox
                                                    name="channel_sms"
                                                    label="SMS"
                                                    defaultChecked={
                                                        values.channel_sms
                                                    }
                                                    error={errors.channel_sms}
                                                />
                                                <SettingCheckbox
                                                    name="channel_whatsapp"
                                                    label="WhatsApp"
                                                    defaultChecked={
                                                        values.channel_whatsapp
                                                    }
                                                    error={
                                                        errors.channel_whatsapp
                                                    }
                                                />
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Events</CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid gap-3">
                                                <SettingCheckbox
                                                    name="event_order_created"
                                                    label="Order created"
                                                    defaultChecked={
                                                        values.event_order_created
                                                    }
                                                    error={
                                                        errors.event_order_created
                                                    }
                                                />
                                                <SettingCheckbox
                                                    name="event_payment_success"
                                                    label="Payment success"
                                                    defaultChecked={
                                                        values.event_payment_success
                                                    }
                                                    error={
                                                        errors.event_payment_success
                                                    }
                                                />
                                                <SettingCheckbox
                                                    name="event_payment_failed"
                                                    label="Payment failed"
                                                    defaultChecked={
                                                        values.event_payment_failed
                                                    }
                                                    error={
                                                        errors.event_payment_failed
                                                    }
                                                />
                                                <SettingCheckbox
                                                    name="event_order_shipped"
                                                    label="Order shipped"
                                                    defaultChecked={
                                                        values.event_order_shipped
                                                    }
                                                    error={
                                                        errors.event_order_shipped
                                                    }
                                                />
                                                <SettingCheckbox
                                                    name="event_order_delivered"
                                                    label="Order delivered"
                                                    defaultChecked={
                                                        values.event_order_delivered
                                                    }
                                                    error={
                                                        errors.event_order_delivered
                                                    }
                                                />
                                                <SettingCheckbox
                                                    name="event_low_stock"
                                                    label="Low stock"
                                                    defaultChecked={
                                                        values.event_low_stock
                                                    }
                                                    error={
                                                        errors.event_low_stock
                                                    }
                                                />
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    Save Changes
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

AdminSettingsPage.layout = {
    breadcrumbs: [{ title: "Settings", href: edit("store") }],
};
