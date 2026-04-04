import fs from "fs";
import path from "path";
import { applicationDefault, cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { env } from "./env";

type ServiceAccountLike = {
    project_id: string;
    client_email: string;
    private_key: string;
};

declare global {
    // eslint-disable-next-line no-var
    var __aizenFirebaseAdminApp: App | undefined;
    // eslint-disable-next-line no-var
    var __aizenFirestore: Firestore | undefined;
}

function normalizePrivateKey(privateKey: string): string {
    // Common when storing JSON in env vars.
    return privateKey.includes("\\n") ? privateKey.replace(/\\n/g, "\n") : privateKey;
}

function readServiceAccountFromEnvOrFile(): ServiceAccountLike | null {
    const json = env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
    if (json) {
        const parsed = JSON.parse(json) as ServiceAccountLike;
        parsed.private_key = normalizePrivateKey(parsed.private_key);
        return parsed;
    }

    const filePath = env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
    if (filePath) {
        const absolute = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
        const content = fs.readFileSync(absolute, "utf8");
        const parsed = JSON.parse(content) as ServiceAccountLike;
        parsed.private_key = normalizePrivateKey(parsed.private_key);
        return parsed;
    }

    return null;
}

export function getFirebaseAdminApp(): App {
    if (globalThis.__aizenFirebaseAdminApp) {
        return globalThis.__aizenFirebaseAdminApp;
    }

    if (getApps().length > 0) {
        globalThis.__aizenFirebaseAdminApp = getApps()[0]!;
        return globalThis.__aizenFirebaseAdminApp;
    }

    const serviceAccount = readServiceAccountFromEnvOrFile();
    const projectId = env.FIREBASE_PROJECT_ID || serviceAccount?.project_id;

    globalThis.__aizenFirebaseAdminApp = initializeApp({
        credential: serviceAccount ? cert(serviceAccount as unknown as ServiceAccount) : applicationDefault(),
        projectId,
    });

    return globalThis.__aizenFirebaseAdminApp;
}

export function getFirebaseAdminFirestore(): Firestore {
    if (globalThis.__aizenFirestore) {
        return globalThis.__aizenFirestore;
    }

    const app = getFirebaseAdminApp();
    globalThis.__aizenFirestore = getFirestore(app);
    return globalThis.__aizenFirestore;
}
