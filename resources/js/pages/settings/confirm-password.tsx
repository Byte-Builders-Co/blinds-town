import { Head } from "@inertiajs/react";
import { ConfirmPasswordForm } from "@/components/confirm-password-form";
import Heading from "@/components/heading";

export default function SettingsConfirmPassword() {
    return (
        <>
            <Head title="Confirm password" />

            <div className="max-w-md space-y-6">
                <Heading
                    variant="small"
                    title="Confirm your password"
                    description="This is a secure area. Please confirm your password before continuing."
                />
                <ConfirmPasswordForm />
            </div>
        </>
    );
}
