import { Head } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { Faq } from '@/types';

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
                    className={`size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </CollapsibleTrigger>
            <CollapsibleContent className="text-muted-foreground mt-2 text-sm whitespace-pre-line">
                {faq.answer}
            </CollapsibleContent>
        </Collapsible>
    );
}

export default function ShopFaqs({ faqs }: { faqs: Faq[] }) {
    const categories = Array.from(
        new Set(faqs.map((faq) => faq.category ?? 'General')),
    );

    return (
        <>
            <Head title="Frequently Asked Questions" />

            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
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
                                        (faq.category ?? 'General') ===
                                        category,
                                )
                                .map((faq) => (
                                    <FaqItem key={faq.id} faq={faq} />
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
