import { Form, Head } from "@inertiajs/react";
import AdminCouponController from "@/actions/App/Http/Controllers/Admin/CouponController";
import { CouponFormFields } from "@/components/admin/coupon-form-fields";
import { Button } from "@/components/ui/button";
import { index } from "@/routes/admin/coupons";
import type { Coupon, CouponRestrictionOption } from "@/types";

export default function AdminCouponEdit({
    coupon,
    products,
    categories,
}: {
    coupon: Coupon;
    products: CouponRestrictionOption[];
    categories: CouponRestrictionOption[];
}) {
    return (
        <>
            <Head title={`Edit ${coupon.code}`} />

            <div className="max-w-xl p-4">
                <h1 className="text-2xl font-semibold">Edit {coupon.code}</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Used {coupon.usages_count ?? 0} time
                    {coupon.usages_count === 1 ? "" : "s"}
                    {coupon.usage_limit ? ` of ${coupon.usage_limit}` : ""}.
                </p>

                <Form
                    {...AdminCouponController.update.form(coupon)}
                    className="mt-6 space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <CouponFormFields
                                coupon={coupon}
                                products={products}
                                categories={categories}
                                errors={errors}
                            />
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

AdminCouponEdit.layout = {
    breadcrumbs: [
        { title: "Coupons", href: index() },
        { title: "Edit", href: "#" },
    ],
};
