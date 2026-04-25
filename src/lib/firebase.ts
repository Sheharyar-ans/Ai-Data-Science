import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';

// Validate config. If it's empty, we'll expose a flag.
export const isFirebaseConfigured = !!firebaseConfig && !!firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5;

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null as any;
export const db = app ? getFirestore(app, firebaseConfig?.firestoreDatabaseId || "(default)") : null as any;
export const storage = app ? getStorage(app) : null as any;
