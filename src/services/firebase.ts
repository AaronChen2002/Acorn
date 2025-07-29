import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { Platform } from 'react-native';

// Firebase configuration - you'll need to add these to your .env.local
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validation for required environment variables
const requiredEnvVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️ Firebase not configured. Missing environment variables:', missingVars);
  console.log('💡 The app will continue to work with local-only data storage');
}

// Check if Firebase is available
export const isFirebaseAvailable = (): boolean => {
  return missingVars.length === 0;
};

// Initialize Firebase (only if configured)
let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseAvailable()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Connect to Firestore emulator in development if needed
    if (__DEV__ && Platform.OS === 'web') {
      try {
        // Only connect to emulator if not already connected
        // connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('🔥 Firebase initialized successfully');
      } catch (error) {
        // Emulator might already be connected
        console.log('🔥 Firebase initialized (emulator already connected)');
      }
    }
    
    console.log('✅ Firebase configured and initialized');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
  }
} else {
  console.log('⚠️ Firebase not available - missing configuration');
}

export { app, auth, db };
export { GoogleAuthProvider, signInWithCredential }; 