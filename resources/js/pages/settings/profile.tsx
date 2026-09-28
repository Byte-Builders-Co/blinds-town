import { Form, Head, usePage } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import ProfileController from "@/actions/App/Http/Controllers/Settings/ProfileController";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DeleteUser from "@/components/delete-user";
import Heading from "@/components/heading";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInitials } from "@/hooks/use-initials";
import { edit } from "@/routes/profile";
import type { Auth } from "@/types";
import { send } from "@/routes/verification";

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const getInitials = useInitials();

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your name, contact details, and photo"
                />

                <Form
                    {...ProfileController.update.form()}
                    encType="multipart/form-data"
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage
                                        src={
                                            auth.user.profile_image_path
                                                ? `/storage/${auth.user.profile_image_path}`
                                                : undefined
                                        }
                                        alt={auth.user.name}
                                    />
                                    <AvatarFallback className="text-lg">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid gap-2">
                                    <Label htmlFor="avatar">
                                        Profile photo
                                    </Label>
                                    <Input
                                        id="avatar"
                                        type="file"
                                        name="avatar"
                                        accept="image/*"
                                        className="max-w-xs"
                                    />
                                    <InputError message={errors.avatar} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">
                                        First name
                                    </Label>
                                    <Input
                                        id="first_name"
                                        defaultValue={auth.user.first_name}
                                        name="first_name"
                                        required
                                        autoComplete="given-name"
                                    />
                                    <InputError message={errors.first_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">Last name</Label>
                                    <Input
                                        id="last_name"
                                        defaultValue={auth.user.last_name}
                                        name="last_name"
                                        required
                                        autoComplete="family-name"
                                    />
                                    <InputError message={errors.last_name} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="mobile_number">
                                        Mobile number
                                    </Label>
                                    <Input
                                        id="mobile_number"
                                        defaultValue={
                                            auth.user.mobile_number ?? ""
                                        }
                                        name="mobile_number"
                                        autoComplete="tel"
                                    />
                                    <InputError
                                        message={errors.mobile_number}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="date_of_birth">
                                        Date of birth
                                    </Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        defaultValue={
                                            auth.user.date_of_birth ?? ""
                                        }
                                        name="date_of_birth"
                                    />
                                    <InputError
                                        message={errors.date_of_birth}
                                    />
                                </div>
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="text-muted-foreground -mt-4 text-sm">
                                            Your email address is unverified.{" "}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to re-send the
                                                verification email.
                                            </Link>
                                        </p>

                                        {status ===
                                            "verification-link-sent" && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been
                                                sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    Save
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: "Profile settings",
            href: edit(),
        },
    ],
};
