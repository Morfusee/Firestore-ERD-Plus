import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyB5Rfgt5iAYhC28CZNKy4FXyNvwHhl7wws",
  authDomain: "firestore-cd9dc.firebaseapp.com",
  projectId: "firestore-cd9dc",
  storageBucket: "firestore-cd9dc.firebasestorage.app",
  messagingSenderId: "719958333872",
  appId: "1:719958333872:web:d2337762f8e5a257229e75",
  measurementId: "G-YFS1BGK5SV",
};

// Initialize Firebase (only once)
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// // Enable emulators in development
// if (import.meta.env.DEV) {
//   try {
//     // Connect to Auth Emulator (runs on localhost:9099)
//     if (window.location.hostname === "localhost") {
//       connectAuthEmulator(auth, "http://localhost:9099", {
//         disableWarnings: true,
//       });
//     }

//     // Connect to Firestore Emulator (runs on localhost:8080)
//     if (window.location.hostname === "localhost") {
//       connectFirestoreEmulator(db, "localhost", 8080);
//     }
//   } catch (error) {
//     // Emulators might already be connected, which is fine
//     console.debug("Emulator connection info:", error);
//   }
// }

export default app;
