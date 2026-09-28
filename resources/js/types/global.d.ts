import type { Auth } from "@/types/auth";
import type { ContactSections } from "@/types/cms";
import type { CategoryOption } from "@/types/shop";

declare module "react" {
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
            contactInfo: ContactSections | null;
            [key: string]: unknown;
        };
    }
}
