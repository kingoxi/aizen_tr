function required(name: string): string {
    const value = process.env[name];
    if (!value || !value.trim()) {
        throw new Error(`Missing required env var: ${name}`);
    }
    return value;
}

function optional(name: string): string | undefined {
    const value = process.env[name];
    return value && value.trim() ? value : undefined;
}

export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",

    SITE_URL: optional("SITE_URL") || "https://aizen.tr",
    SITE_NAME: optional("SITE_NAME") || "aizen.tr",

    JWT_SECRET: required("JWT_SECRET"),
    ADMIN_USERNAME: optional("ADMIN_USERNAME") || "admin",
    ADMIN_PASSWORD: optional("ADMIN_PASSWORD") || "admin123",

    FIREBASE_PROJECT_ID: optional("FIREBASE_PROJECT_ID") || "aizentr",
    FIREBASE_SERVICE_ACCOUNT_JSON: optional("FIREBASE_SERVICE_ACCOUNT_JSON"),
    FIREBASE_SERVICE_ACCOUNT_PATH: optional("FIREBASE_SERVICE_ACCOUNT_PATH"),
    GOOGLE_APPLICATION_CREDENTIALS: optional("GOOGLE_APPLICATION_CREDENTIALS"),
};

