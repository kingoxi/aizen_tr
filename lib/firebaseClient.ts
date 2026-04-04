import { initializeApp, type FirebaseApp, getApps } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCVp3ztpgbvgOTCcXr8f04jtFDDGShymsg",
    authDomain: "aizentr.firebaseapp.com",
    projectId: "aizentr",
    storageBucket: "aizentr.firebasestorage.app",
    messagingSenderId: "174286735186",
    appId: "1:174286735186:web:413eb9935190aa55741c8b",
    measurementId: "G-MCM785J8PS",
};

export function getFirebaseClientApp(): FirebaseApp {
    if (getApps().length > 0) {
        return getApps()[0]!;
    }
    return initializeApp(firebaseConfig);
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
    if (typeof window === "undefined") {
        return null;
    }
    if (!(await isSupported())) {
        return null;
    }
    const app = getFirebaseClientApp();
    return getAnalytics(app);
}

