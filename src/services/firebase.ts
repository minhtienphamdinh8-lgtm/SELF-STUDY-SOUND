/**
 * Firebase App & Firestore Initialization
 * Connects to project 'key-messenger-dghtt' with database 'ai-studio-soundstudy-aff2356f-f529-4193-bf9a-d0c666e69181'
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase app singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Authentication instance
export const auth = getAuth(app);

// Cloud Firestore with the configured custom database ID
export const db = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Initial project owner email from environment / metadata
export const INITIAL_PROJECT_OWNER_EMAIL = 'phamdinhminhtien304@gmail.com';
