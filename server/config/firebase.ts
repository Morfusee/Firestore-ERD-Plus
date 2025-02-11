import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import admin, { ServiceAccount } from "firebase-admin";
import serviceAccount from "./firebasePrivateKey.json";

const firebaseConfig = {
  apiKey: "AIzaSyA80dTz8MbQCNFoQ-DiWEWvElUUwcLlEk8",
  authDomain: "fir-erd-af873.firebaseapp.com",
  projectId: "fir-erd-af873",
  storageBucket: "fir-erd-af873.firebasestorage.app",
  messagingSenderId: "433005157423",
  appId: "1:433005157423:web:817c632fd9a71f08ddbada",
  measurementId: "G-VDSYEWHNPZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  admin,
};
