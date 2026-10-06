import { Head } from "@inertiajs/react";
import type { CmsPage } from "@/types";

export default function ShopCmsPage({ page }: { page: CmsPage }) {
    return (
        <>
            <Head title={page.seo_title ?? page.title}>
                {page.seo_description && (
                    <meta name="description" content={page.seo_description} />
                )}
            </Head>

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold">{page.title}</h1>
                {page.content ? (
                    <div
                        className="cms-content mt-6"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                ) : (
                    <p className="text-muted-foreground mt-6">
                        This page doesn&apos;t have any content yet.
                    </p>
                )}
            </div>
        </>
    );
}
