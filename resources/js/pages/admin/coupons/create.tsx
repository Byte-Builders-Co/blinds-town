import { Form, Head } from '@inertiajs/react';
import AdminCouponController from '@/actions/App/Http/Controllers/Admin/CouponController';
import { CouponFormFields } from '@/components/admin/coupon-form-fields';
import { Button } from '@/components/ui/button';
import { create, index } from '@/routes/admin/coupons';
import type { CouponRestrictionOption } from '@/types';

export default function AdminCouponCreate({
    products,
    categories,
}: {
    products: CouponRestrictionOption[];
    categories: CouponRestrictionOption[];
}) {
    return (
        <>
            <Head title="New Coupon" />

            <div className="max-w-xl p-4">
                <h1 className="text-2xl font-semibold">New Coupon</h1>

                <Form
                    {...AdminCouponController.store.form()}
                    className="mt-6 space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <CouponFormFields
                                products={products}
                                categories={categories}
                                errors={errors}
                            />
                            <Button type="submit" disabled={processing}>
                                Create Coupon
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

AdminCouponCreate.layout = {
    breadcrumbs: [
        { title: 'Coupons', href: index() },
        { title: 'New', href: create() },
    ],
};
