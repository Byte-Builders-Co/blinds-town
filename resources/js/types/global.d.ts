import type { Auth } from "@/types/auth";
import type { ContactSections } from "@/types/cms";
import type { CategoryOption } from "@/types/shop";

declare module "react" {
    // T must match React's own InputHTMLAttributes<T> signature for this
    // declaration merge to apply; renaming it breaks the merge project-wide.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module "@inertiajs/core" {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            cart: { count: number };
            navCategories: CategoryOption[];
            footerPages: { title: string; url: string }[];
            contactInfo: ContactSections | null;
            [key: string]: unknown;
        };
    }
}
