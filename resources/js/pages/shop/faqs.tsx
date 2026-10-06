import { Head, Link } from "@inertiajs/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { RichText } from "@/components/shop/rich-text";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { show as contactShow } from "@/routes/contact";
import type { Faq } from "@/types";

function FaqItem({ faq }: { faq: Faq }) {
    const [open, setOpen] = useState(false);

    return (
        <Collapsible
            open={open}
            onOpenChange={setOpen}
            className="border-b py-3"
        >
            <CollapsibleTrigger className="flex w-full items-center justify-between text-left font-medium">
                {faq.question}
                <ChevronDown
                    className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 pb-1 text-sm">
                <RichText text={faq.answer} />
            </CollapsibleContent>
        </Collapsible>
    );
}

export default function ShopFaqs({ faqs }: { faqs: Faq[] }) {
    const categories = Array.from(
        new Set(faqs.map((faq) => faq.category ?? "General")),
    );

    return (
        <>
            <Head title="Frequently Asked Questions" />

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold">
                    Frequently Asked Questions
                </h1>

                {faqs.length === 0 && (
                    <p className="text-muted-foreground mt-6">
                        No questions have been added yet.
                    </p>
                )}

                {categories.map((category) => (
                    <div key={category} className="mt-8">
                        <h2 className="text-lg font-semibold">{category}</h2>
                        <div className="mt-2">
                            {faqs
                                .filter(
                                    (faq) =>
                                        (faq.category ?? "General") ===
                                        category,
                                )
                                .map((faq) => (
                                    <FaqItem key={faq.id} faq={faq} />
                                ))}
                        </div>
                    </div>
                ))}

                <div className="mt-14 pt-8 text-center">
                    <h2 className="text-xl font-semibold">
                        Still have questions?
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Can&apos;t find the answer you&apos;re looking for? Our
                        team is here to help with any question about your
                        windows or blinds.
                    </p>
                    <Button asChild className="mt-5">
                        <Link href={contactShow()}>Contact Us</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
