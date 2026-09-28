import AuthLayoutTemplate from "@/layouts/auth/auth-simple-layout";

export default function AuthLayout({
    title = "",
    description = "",
    card = true,
    children,
}: {
    title?: string;
    description?: string;
    card?: boolean;
    children: React.ReactNode;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description} card={card}>
            {children}
        </AuthLayoutTemplate>
    );
}
