import { Head } from "@inertiajs/react";
import { CmsPageForm } from "@/components/admin/cms-page-form";
import { index, store } from "@/routes/admin/cms-pages";

export default function AdminCmsPageCreate({
    nextFooterOrder,
}: {
    nextFooterOrder: number;
}) {
    return (
        <>
            <Head title="Add page" />

            <CmsPageForm
                heading="Add a page"
                description="Create a new page for your website. It can be linked from the footer automatically."
                isNew
                submitLabel="Create page"
                initial={{
                    title: "",
                    slug: "",
                    content: "",
                    is_active: true,
                    show_in_footer: true,
                    footer_order: String(nextFooterOrder),
                }}
                onSubmit={(form) => form.post(store().url)}
            />
        </>
    );
}

AdminCmsPageCreate.layout = {
    breadcrumbs: [
        { title: "Content Pages", href: index() },
        { title: "Add page", href: "#" },
    ],
};
