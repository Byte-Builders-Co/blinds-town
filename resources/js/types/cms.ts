export type CmsPage = {
    id: number;
    slug: string;
    title: string;
    content: string | null;
    sections: Record<string, never> | null;
    is_active: boolean;
    show_in_footer: boolean;
    footer_order: number;
    seo_title: string | null;
    seo_description: string | null;
};

export type HomepageSections = {
    hero: {
        heading: string;
        subheading: string;
        cta_text: string;
        cta_url: string;
        secondary_cta_text: string;
        secondary_cta_url: string;
        image_path: string | null;
    };
    promo: {
        eyebrow: string;
        heading: string;
        subheading: string;
        button_text: string;
        button_url: string;
        image_path: string | null;
    };
    about: {
        heading: string;
        body: string;
        image_path: string | null;
    };
};

export type ContactSections = {
    business_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    hours: string | null;
    map_url: string | null;
};

export type CmsBanner = {
    id: number;
    title: string;
    subtitle: string | null;
    image_path: string;
    button_text: string | null;
    button_url: string | null;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    sort_order: number;
};

export type Faq = {
    id: number;
    question: string;
    answer: string;
    category: string | null;
    sort_order: number;
    is_active: boolean;
};
