import { Head } from "@inertiajs/react";
import { ConfirmPasswordForm } from "@/components/confirm-password-form";

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirm password" />
            <ConfirmPasswordForm />
        </>
    );
}

ConfirmPassword.layout = {
    title: "Confirm password",
    description:
        "This is a secure area of the application. Please confirm your password before continuing.",
};
