import type { SiteSettings } from "./api";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
    aboutContent: "",
    backgroundType: "dynamic",
    backgroundMediaUrl: "",
    backgroundMediaUrlMobile: "",
    profileName: "",
    profileTitle: "",
    profileImage: "",
    profileLocation: "",
    profileEmail: "",
    githubUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
    phone: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    quotes: [],
};

function asString(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter((item): item is string => typeof item === "string");
}

export function normalizeSiteSettings(input: Partial<SiteSettings> | null | undefined): SiteSettings {
    const backgroundType = input?.backgroundType;

    return {
        aboutContent: asString(input?.aboutContent),
        backgroundType:
            backgroundType === "video" || backgroundType === "none" ? backgroundType : "dynamic",
        backgroundMediaUrl: asString(input?.backgroundMediaUrl),
        backgroundMediaUrlMobile: asString(input?.backgroundMediaUrlMobile),
        profileName: asString(input?.profileName),
        profileTitle: asString(input?.profileTitle),
        profileImage: asString(input?.profileImage),
        profileLocation: asString(input?.profileLocation),
        profileEmail: asString(input?.profileEmail),
        githubUrl: asString(input?.githubUrl),
        linkedinUrl: asString(input?.linkedinUrl),
        instagramUrl: asString(input?.instagramUrl),
        phone: asString(input?.phone),
        metaTitle: asString(input?.metaTitle),
        metaDescription: asString(input?.metaDescription),
        metaKeywords: asString(input?.metaKeywords),
        quotes: asStringArray(input?.quotes),
    };
}
