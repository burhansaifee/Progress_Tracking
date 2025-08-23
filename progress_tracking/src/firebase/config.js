import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// YOUR WEB APP'S FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyB5qitSPyfY7s6e1hL8_ql6fr-9LXsQDeg",
  authDomain: "progress-tracker-7d02d.firebaseapp.com",
  projectId: "progress-tracker-7d02d",
  storageBucket: "progress-tracker-7d02d.firebasestorage.app",
  messagingSenderId: "876459762554",
  appId: "1:876459762554:web:4d0124f2bbdb6905172cc3",
  measurementId: "G-VCEZHF9X0P"
};

// INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };