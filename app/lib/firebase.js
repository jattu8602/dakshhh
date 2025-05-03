import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBvPqdHSbnajOCmloRbXwhz9Dq-X1cyVkY",
  authDomain: "adder-8e2a9.firebaseapp.com",
  projectId: "adder-8e2a9",
  storageBucket: "adder-8e2a9.firebasestorage.app",
  messagingSenderId: "933649905107",
  appId: "1:933649905107:web:fb13afdd98e08e01d7eb26",
  measurementId: "G-9H0CXPZGJD"
};

// Initialize Firebase if it hasn't been initialized already
let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

// Initialize services
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export { db, auth };