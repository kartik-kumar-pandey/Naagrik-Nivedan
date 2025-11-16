// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate Firebase config
const isFirebaseConfigured = firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.databaseURL && 
  firebaseConfig.projectId;

if (!isFirebaseConfigured) {
  console.error('Firebase configuration is missing! Please set environment variables:');
  console.error('REACT_APP_FIREBASE_API_KEY');
  console.error('REACT_APP_FIREBASE_AUTH_DOMAIN');
  console.error('REACT_APP_FIREBASE_DATABASE_URL');
  console.error('REACT_APP_FIREBASE_PROJECT_ID');
  console.error('REACT_APP_FIREBASE_STORAGE_BUCKET');
  console.error('REACT_APP_FIREBASE_MESSAGING_SENDER_ID');
  console.error('REACT_APP_FIREBASE_APP_ID');
}

// Initialize Firebase
let app;
let auth;
let database;

try {
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getDatabase(app);
    console.log('[Firebase] Initialized successfully');
  } else {
    console.warn('[Firebase] Using mock Firebase (environment variables not set)');
    // Create mock objects to prevent crashes
    app = null;
    auth = null;
    database = null;
  }
} catch (error) {
  console.error('[Firebase] Initialization error:', error);
  app = null;
  auth = null;
  database = null;
}

export { auth, database };
export default app;


