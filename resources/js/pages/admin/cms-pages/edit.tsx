import { Head } from "@inertiajs/react";
import { CmsPageForm } from "@/components/admin/cms-page-form";
import { index, update } from "@/routes/admin/cms-pages";
import type { CmsPage } from "@/types";

export default function AdminCmsPageEdit({
    page,
}: {
    page: CmsPage & { public_url: string };
}) {
    return (
        <>
            <Head title={`Edit ${page.title}`} />

            <CmsPageForm
                heading={`Edit ${page.title}`}
                description="Changes appear on your website as soon as you save."
                viewUrl={page.public_url}
                isNew={false}
                submitLabel="Save changes"
                initial={{
                    title: page.title,
                    slug: page.slug,
                    content: page.content ?? "",
                    is_active: page.is_active,
                    show_in_footer: page.show_in_footer,
                    footer_order: String(page.footer_order),
                }}
                onSubmit={(form) =>
                    form.put(update(page.slug).url, { preserveScroll: true })
                }
            />
        </>
    );
}

AdminCmsPageEdit.layout = {
    breadcrumbs: [
        { title: "Content Pages", href: index() },
        { title: "Edit", href: "#" },
    ],
};
