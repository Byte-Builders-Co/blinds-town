import { Head } from "@inertiajs/react";
import { RichText } from "@/components/shop/rich-text";
import type { CmsPage } from "@/types";

export default function ShopCmsPage({ page }: { page: CmsPage }) {
    return (
        <>
            <Head title={page.seo_title ?? page.title}>
                {page.seo_description && (
                    <meta name="description" content={page.seo_description} />
                )}
            </Head>

            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold">{page.title}</h1>
                <div className="mt-6">
                    <RichText text={page.content ?? ""} />
                </div>
            </div>
        </>
    );
}
