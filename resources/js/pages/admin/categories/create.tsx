import { Form, Head } from '@inertiajs/react';
import AdminCategoryController from '@/actions/App/Http/Controllers/Admin/CategoryController';
import { CategoryFormFields } from '@/components/admin/category-form-fields';
import { Button } from '@/components/ui/button';
import { create, index } from '@/routes/admin/categories';
import type { CategoryOption } from '@/types';

export default function AdminCategoryCreate({
    parentOptions,
}: {
    parentOptions: CategoryOption[];
}) {
    return (
        <>
            <Head title="New Category" />

            <div className="max-w-xl p-4">
                <h1 className="text-2xl font-semibold">New Category</h1>

                <Form
                    {...AdminCategoryController.store.form()}
                    encType="multipart/form-data"
                    className="mt-6 space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <CategoryFormFields
                                parentOptions={parentOptions}
                                errors={errors}
                            />
                            <Button type="submit" disabled={processing}>
                                Create Category
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

AdminCategoryCreate.layout = {
    breadcrumbs: [
        { title: 'Categories', href: index() },
        { title: 'New', href: create() },
    ],
};
