import { Form, Head } from "@inertiajs/react";
import AdminCategoryController from "@/actions/App/Http/Controllers/Admin/CategoryController";
import { CategoryFormFields } from "@/components/admin/category-form-fields";
import { Button } from "@/components/ui/button";
import { index } from "@/routes/admin/categories";
import type { Category, CategoryOption } from "@/types";

export default function AdminCategoryEdit({
    category,
    parentOptions,
}: {
    category: Category;
    parentOptions: CategoryOption[];
}) {
    return (
        <>
            <Head title={`Edit ${category.name}`} />

            <div className="p-4 md:p-6">
                <h1 className="text-2xl font-semibold">Edit {category.name}</h1>

                <Form
                    {...AdminCategoryController.update.form(category)}
                    encType="multipart/form-data"
                    className="mt-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <CategoryFormFields
                                category={category}
                                parentOptions={parentOptions}
                                errors={errors}
                            />
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

AdminCategoryEdit.layout = {
    breadcrumbs: [
        { title: "Categories", href: index() },
        { title: "Edit Category", href: "#" },
    ],
};
