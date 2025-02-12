import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import admin from "firebase-admin";
import dotenv from "dotenv";
import key from "../config/firebasePrivateKey.json";
import zlib from "zlib";

dotenv.config();

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

/* DONT REMOVE */
// This is the code for turning the service account JSON into base64
/* const zlib = require("zlib");
const json = JSON.stringify(require("./config/firebasePrivateKey.json"));
const compressed = zlib.gzipSync(json).toString("base64"); */

const decompressedServiceAccount = JSON.parse(
  zlib
    .gunzipSync(Buffer.from(process.env.SERVICE_ACCOUNT!, "base64"))
    .toString()
);

admin.initializeApp({
  credential: admin.credential.cert(decompressedServiceAccount),
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
