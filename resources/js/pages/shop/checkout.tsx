import { Head, useForm } from '@inertiajs/react';
import { type FormEvent, useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resolveSelectedOptionLabels } from '@/lib/shop';
import { formatCurrency } from '@/lib/utils';
import { quote, store as storeCheckout } from '@/routes/checkout';
import type { Address, Cart } from '@/types';

type QuoteBreakdown = {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    shippingCharge: number;
    installationCharge: number;
    total: number;
};

export default function Checkout({
    cart,
    addresses,
    installationCharge,
    shippingCharge,
}: {
    cart: Cart;
    addresses: Address[];
    installationCharge: number;
    shippingCharge: number;
}) {
    const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0];
    const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>(
        defaultAddress ? defaultAddress.id : 'new',
    );
    const [installationRequested, setInstallationRequested] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [breakdown, setBreakdown] = useState<QuoteBreakdown | null>(null);
    const [quoting, setQuoting] = useState(false);

    const form = useForm({
        shipping_name: defaultAddress?.full_name ?? '',
        shipping_line1: defaultAddress?.address_line1 ?? '',
        shipping_line2: defaultAddress?.address_line2 ?? '',
        shipping_city: defaultAddress?.city ?? '',
        shipping_postal_code: defaultAddress?.pincode ?? '',
        shipping_country: defaultAddress?.country ?? '',
        shipping_phone: defaultAddress?.mobile_number ?? '',
        installation_requested: false,
        coupon_code: '',
    });

    const selectAddress = (address: Address) => {
        setSelectedAddressId(address.id);
        form.setData({
            ...form.data,
            shipping_name: address.full_name,
            shipping_line1: address.address_line1,
            shipping_line2: address.address_line2 ?? '',
            shipping_city: address.city,
            shipping_postal_code: address.pincode,
            shipping_country: address.country,
            shipping_phone: address.mobile_number,
        });
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            setQuoting(true);
            setCouponError(null);
            fetch(
                quote.url({
                    query: {
                        installation_requested: installationRequested ? 1 : 0,
                        coupon_code: couponCode || undefined,
                    },
                }),
                { headers: { Accept: 'application/json' } },
            )
                .then(async (res) => {
                    if (!res.ok) {
                        const body = await res.json().catch(() => null);
                        setCouponError(
                            body?.errors?.coupon_code?.[0] ??
                                'This coupon code is not valid.',
                        );
                        setAppliedCoupon(null);
                        return;
                    }
                    setBreakdown(await res.json());
                    setAppliedCoupon(couponCode || null);
                })
                .catch(() => {})
                .finally(() => setQuoting(false));
        }, 400);

        return () => clearTimeout(timeout);
    }, [installationRequested, couponCode]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            installation_requested: installationRequested,
            coupon_code: couponCode || null,
        }));
        form.post(storeCheckout().url);
    };

    return (
        <>
            <Head title="Checkout" />

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
                <form onSubmit={submit} className="space-y-8 lg:col-span-2">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Shipping details
                        </h1>

                        {addresses.length > 0 && (
                            <div className="mt-4 grid gap-3">
                                {addresses.map((address) => (
                                    <label
                                        key={address.id}
                                        className={`cursor-pointer rounded-lg border p-3 text-sm ${
                                            selectedAddressId === address.id
                                                ? 'border-primary bg-primary/5'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="radio"
                                                name="address_selection"
                                                className="mt-1"
                                                checked={
                                                    selectedAddressId ===
                                                    address.id
                                                }
                                                onChange={() =>
                                                    selectAddress(address)
                                                }
                                            />
                                            <div>
                                                <p className="font-medium">
                                                    {address.full_name}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {address.address_line1}
                                                    {address.address_line2 &&
                                                        `, ${address.address_line2}`}
                                                    , {address.city},{' '}
                                                    {address.state}{' '}
                                                    {address.pincode}
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                                <label
                                    className={`cursor-pointer rounded-lg border p-3 text-sm ${
                                        selectedAddressId === 'new'
                                            ? 'border-primary bg-primary/5'
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="address_selection"
                                            checked={
                                                selectedAddressId === 'new'
                                            }
                                            onChange={() =>
                                                setSelectedAddressId('new')
                                            }
                                        />
                                        Enter a new address
                                    </div>
                                </label>
                            </div>
                        )}

                        {selectedAddressId === 'new' && (
                            <div className="mt-6 space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="shipping_name">
                                        Full name
                                    </Label>
                                    <Input
                                        id="shipping_name"
                                        value={form.data.shipping_name}
                                        onChange={(e) =>
                                            form.setData(
                                                'shipping_name',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={form.errors.shipping_name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="shipping_line1">
                                        Address line 1
                                    </Label>
                                    <Input
                                        id="shipping_line1"
                                        value={form.data.shipping_line1}
                                        onChange={(e) =>
                                            form.setData(
                                                'shipping_line1',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={form.errors.shipping_line1}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="shipping_line2">
                                        Address line 2 (optional)
                                    </Label>
                                    <Input
                                        id="shipping_line2"
                                        value={form.data.shipping_line2}
                                        onChange={(e) =>
                                            form.setData(
                                                'shipping_line2',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={form.errors.shipping_line2}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="shipping_city">
                                            City
                                        </Label>
                                        <Input
                                            id="shipping_city"
                                            value={form.data.shipping_city}
                                            onChange={(e) =>
                                                form.setData(
                                                    'shipping_city',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={form.errors.shipping_city}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="shipping_postal_code">
                                            Postal code
                                        </Label>
                                        <Input
                                            id="shipping_postal_code"
                                            value={
                                                form.data.shipping_postal_code
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    'shipping_postal_code',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={
                                                form.errors.shipping_postal_code
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="shipping_country">
                                            Country code (e.g. US)
                                        </Label>
                                        <Input
                                            id="shipping_country"
                                            value={form.data.shipping_country}
                                            onChange={(e) =>
                                                form.setData(
                                                    'shipping_country',
                                                    e.target.value,
                                                )
                                            }
                                            maxLength={2}
                                            required
                                        />
                                        <InputError
                                            message={
                                                form.errors.shipping_country
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="shipping_phone">
                                            Phone
                                        </Label>
                                        <Input
                                            id="shipping_phone"
                                            value={form.data.shipping_phone}
                                            onChange={(e) =>
                                                form.setData(
                                                    'shipping_phone',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={form.errors.shipping_phone}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold">Installation</h2>
                        <label className="mt-3 flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={installationRequested}
                                onCheckedChange={(checked) =>
                                    setInstallationRequested(checked === true)
                                }
                            />
                            Request professional installation (+
                            {formatCurrency(installationCharge)})
                        </label>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold">Coupon</h2>
                        <div className="mt-3 flex items-center gap-2">
                            <Input
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChange={(e) =>
                                    setCouponCode(e.target.value.toUpperCase())
                                }
                                className="max-w-xs"
                            />
                            {appliedCoupon && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setCouponCode('');
                                        setAppliedCoupon(null);
                                    }}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                        {couponError && (
                            <p className="text-destructive mt-1 text-sm">
                                {couponError}
                            </p>
                        )}
                        {appliedCoupon && !couponError && (
                            <p className="mt-1 text-sm text-green-600">
                                Coupon "{appliedCoupon}" applied.
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={form.processing}
                        className="w-full"
                    >
                        Continue to payment
                    </Button>
                </form>

                <div>
                    <h2 className="text-lg font-semibold">Order summary</h2>
                    <div className="mt-4 space-y-3">
                        {cart.items.map((item) => {
                            const optionLabels = resolveSelectedOptionLabels(
                                item.product,
                                item.selected_options,
                            );

                            return (
                                <div key={item.id} className="text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-medium">
                                            {item.product?.name} &times;{' '}
                                            {item.quantity}
                                        </span>
                                        <span>
                                            {formatCurrency(item.line_total)}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground">
                                        {item.width_cm}cm &times;{' '}
                                        {item.height_cm}cm
                                        {optionLabels.length > 0 &&
                                            ` · ${optionLabels.map((o) => o.label).join(', ')}`}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 space-y-1 border-t pt-4 text-sm">
                        {breakdown ? (
                            <>
                                <div className="text-muted-foreground flex justify-between">
                                    <span>Subtotal</span>
                                    <span>
                                        {formatCurrency(breakdown.subtotal)}
                                    </span>
                                </div>
                                {breakdown.discountAmount > 0 && (
                                    <div className="text-muted-foreground flex justify-between">
                                        <span>Discount</span>
                                        <span>
                                            -
                                            {formatCurrency(
                                                breakdown.discountAmount,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {breakdown.shippingCharge > 0 && (
                                    <div className="text-muted-foreground flex justify-between">
                                        <span>Shipping</span>
                                        <span>
                                            {formatCurrency(
                                                breakdown.shippingCharge,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {breakdown.installationCharge > 0 && (
                                    <div className="text-muted-foreground flex justify-between">
                                        <span>Installation</span>
                                        <span>
                                            {formatCurrency(
                                                breakdown.installationCharge,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {breakdown.taxAmount > 0 && (
                                    <div className="text-muted-foreground flex justify-between">
                                        <span>GST / Tax</span>
                                        <span>
                                            {formatCurrency(
                                                breakdown.taxAmount,
                                            )}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                                    <span>Total</span>
                                    <span>
                                        {quoting
                                            ? '…'
                                            : formatCurrency(breakdown.total)}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground">
                                Calculating totals…
                            </p>
                        )}
                    </div>

                    <p className="text-muted-foreground mt-4 text-xs">
                        Shipping charge shown reflects a flat{' '}
                        {formatCurrency(shippingCharge)} rate.
                    </p>
                </div>
            </div>
        </>
    );
}
