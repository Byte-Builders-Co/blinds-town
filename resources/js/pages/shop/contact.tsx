import { Form, Head } from '@inertiajs/react';
import ContactController from '@/actions/App/Http/Controllers/ContactController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CmsPage, ContactSections } from '@/types';

export default function ShopContact({ page }: { page: CmsPage }) {
    const business = page.sections as unknown as ContactSections;

    return (
        <>
            <Head title="Contact Us" />

            <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold">Contact Us</h1>

                <div className="mt-8 grid gap-10 lg:grid-cols-2">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">
                            {business.business_name}
                        </h2>
                        <dl className="text-muted-foreground space-y-2 text-sm">
                            <div>
                                <dt className="text-foreground font-medium">
                                    Email
                                </dt>
                                <dd>{business.email}</dd>
                            </div>
                            {business.phone && (
                                <div>
                                    <dt className="text-foreground font-medium">
                                        Phone
                                    </dt>
                                    <dd>{business.phone}</dd>
                                </div>
                            )}
                            {business.address && (
                                <div>
                                    <dt className="text-foreground font-medium">
                                        Address
                                    </dt>
                                    <dd className="whitespace-pre-line">
                                        {business.address}
                                    </dd>
                                </div>
                            )}
                            {business.hours && (
                                <div>
                                    <dt className="text-foreground font-medium">
                                        Business Hours
                                    </dt>
                                    <dd>{business.hours}</dd>
                                </div>
                            )}
                        </dl>
                        {business.map_url && (
                            <a
                                href={business.map_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary text-sm underline"
                            >
                                View on map
                            </a>
                        )}
                    </div>

                    <Form
                        {...ContactController.store.form()}
                        resetOnSuccess
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" required />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">
                                        Phone (optional)
                                    </Label>
                                    <Input id="phone" name="phone" />
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="subject">
                                        Subject (optional)
                                    </Label>
                                    <Input id="subject" name="subject" />
                                    <InputError message={errors.subject} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="message">Message</Label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        className="border-input dark:bg-input/30 min-h-32 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs"
                                    />
                                    <InputError message={errors.message} />
                                </div>
                                <Button type="submit" disabled={processing}>
                                    Send Message
                                </Button>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}
