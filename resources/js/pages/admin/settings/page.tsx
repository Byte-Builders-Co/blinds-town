import { Form, Head, Link } from "@inertiajs/react";
import AdminSettingsController from "@/actions/App/Http/Controllers/Admin/SettingsController";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
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
}) {
    return (
        <div className="grid gap-2">
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

            <div className="max-w-xl p-4">
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
                    className="mt-6 space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            {group === "store" && (
                                <>
                                    <Field
                                        name="store_name"
                                        label="Store name"
                                        defaultValue={values.store_name}
                                        required
                                        error={errors.store_name}
                                    />
                                    <Field
                                        name="store_email"
                                        label="Store email"
                                        type="email"
                                        defaultValue={values.store_email}
                                        error={errors.store_email}
                                    />
                                    <Field
                                        name="store_phone"
                                        label="Store phone"
                                        defaultValue={values.store_phone}
                                        error={errors.store_phone}
                                    />
                                    <Field
                                        name="store_address"
                                        label="Store address"
                                        defaultValue={values.store_address}
                                        error={errors.store_address}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field
                                            name="currency"
                                            label="Currency (e.g. usd)"
                                            defaultValue={values.currency}
                                            required
                                            error={errors.currency}
                                        />
                                        <Field
                                            name="timezone"
                                            label="Timezone"
                                            defaultValue={values.timezone}
                                            required
                                            error={errors.timezone}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="logo">Logo</Label>
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
                                        <InputError message={errors.logo} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="favicon">Favicon</Label>
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
                                        <InputError message={errors.favicon} />
                                    </div>
                                </>
                            )}

                            {group === "business" && (
                                <>
                                    <Field
                                        name="legal_business_name"
                                        label="Legal business name"
                                        defaultValue={
                                            values.legal_business_name
                                        }
                                        error={errors.legal_business_name}
                                    />
                                    <Field
                                        name="business_address"
                                        label="Business address"
                                        defaultValue={values.business_address}
                                        error={errors.business_address}
                                    />
                                    <Field
                                        name="business_phone"
                                        label="Business phone"
                                        defaultValue={values.business_phone}
                                        error={errors.business_phone}
                                    />
                                    <Field
                                        name="business_email"
                                        label="Business email"
                                        type="email"
                                        defaultValue={values.business_email}
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
                                        error={errors.registration_details}
                                    />
                                </>
                            )}

                            {group === "tax" && (
                                <>
                                    <SettingCheckbox
                                        name="gst_enabled"
                                        label="GST enabled"
                                        defaultChecked={values.gst_enabled}
                                        error={errors.gst_enabled}
                                    />
                                    <Field
                                        name="gst_rate"
                                        label="GST rate (%)"
                                        type="number"
                                        defaultValue={values.gst_rate}
                                        required
                                        error={errors.gst_rate}
                                    />
                                    <SettingCheckbox
                                        name="tax_inclusive"
                                        label="Prices are tax inclusive"
                                        defaultChecked={values.tax_inclusive}
                                        error={errors.tax_inclusive}
                                    />
                                </>
                            )}

                            {group === "shipping" && (
                                <>
                                    <SettingCheckbox
                                        name="shipping_enabled"
                                        label="Shipping enabled"
                                        defaultChecked={values.shipping_enabled}
                                        error={errors.shipping_enabled}
                                    />
                                    <Field
                                        name="default_shipping_charge"
                                        label="Default shipping charge"
                                        type="number"
                                        defaultValue={
                                            values.default_shipping_charge
                                        }
                                        required
                                        error={errors.default_shipping_charge}
                                    />
                                    <Field
                                        name="free_shipping_threshold"
                                        label="Free shipping threshold (optional)"
                                        type="number"
                                        defaultValue={
                                            values.free_shipping_threshold
                                        }
                                        error={errors.free_shipping_threshold}
                                    />
                                    <Field
                                        name="installation_charge"
                                        label="Installation charge"
                                        type="number"
                                        defaultValue={
                                            values.installation_charge
                                        }
                                        required
                                        error={errors.installation_charge}
                                    />
                                </>
                            )}

                            {group === "payment" && (
                                <>
                                    <Field
                                        name="payment_gateway"
                                        label="Payment gateway"
                                        defaultValue={values.payment_gateway}
                                        required
                                        error={errors.payment_gateway}
                                    />
                                    <SettingCheckbox
                                        name="test_mode"
                                        label="Test mode"
                                        defaultChecked={values.test_mode}
                                        error={errors.test_mode}
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        Gateway API keys are configured via the
                                        server environment and are never exposed
                                        here.
                                    </p>
                                </>
                            )}

                            {group === "notifications" && (
                                <>
                                    <fieldset className="grid gap-3 rounded-lg border p-4">
                                        <legend className="text-sm font-medium">
                                            Channels
                                        </legend>
                                        <SettingCheckbox
                                            name="channel_email"
                                            label="Email"
                                            defaultChecked={
                                                values.channel_email
                                            }
                                            error={errors.channel_email}
                                        />
                                        <SettingCheckbox
                                            name="channel_sms"
                                            label="SMS"
                                            defaultChecked={values.channel_sms}
                                            error={errors.channel_sms}
                                        />
                                        <SettingCheckbox
                                            name="channel_whatsapp"
                                            label="WhatsApp"
                                            defaultChecked={
                                                values.channel_whatsapp
                                            }
                                            error={errors.channel_whatsapp}
                                        />
                                    </fieldset>
                                    <fieldset className="grid gap-3 rounded-lg border p-4">
                                        <legend className="text-sm font-medium">
                                            Events
                                        </legend>
                                        <SettingCheckbox
                                            name="event_order_created"
                                            label="Order created"
                                            defaultChecked={
                                                values.event_order_created
                                            }
                                            error={errors.event_order_created}
                                        />
                                        <SettingCheckbox
                                            name="event_payment_success"
                                            label="Payment success"
                                            defaultChecked={
                                                values.event_payment_success
                                            }
                                            error={errors.event_payment_success}
                                        />
                                        <SettingCheckbox
                                            name="event_payment_failed"
                                            label="Payment failed"
                                            defaultChecked={
                                                values.event_payment_failed
                                            }
                                            error={errors.event_payment_failed}
                                        />
                                        <SettingCheckbox
                                            name="event_order_shipped"
                                            label="Order shipped"
                                            defaultChecked={
                                                values.event_order_shipped
                                            }
                                            error={errors.event_order_shipped}
                                        />
                                        <SettingCheckbox
                                            name="event_order_delivered"
                                            label="Order delivered"
                                            defaultChecked={
                                                values.event_order_delivered
                                            }
                                            error={errors.event_order_delivered}
                                        />
                                        <SettingCheckbox
                                            name="event_low_stock"
                                            label="Low stock"
                                            defaultChecked={
                                                values.event_low_stock
                                            }
                                            error={errors.event_low_stock}
                                        />
                                    </fieldset>
                                </>
                            )}

                            <Button type="submit" disabled={processing}>
                                Save Changes
                            </Button>
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
