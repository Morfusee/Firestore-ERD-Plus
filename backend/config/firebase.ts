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
import zlib from "zlib";

dotenv.config();

const firebaseConfig = {
  apiKey: "AIzaSyB5Rfgt5iAYhC28CZNKy4FXyNvwHhl7wws",
  authDomain: "firestore-cd9dc.firebaseapp.com",
  projectId: "firestore-cd9dc",
  storageBucket: "firestore-cd9dc.firebasestorage.app",
  messagingSenderId: "719958333872",
  appId: "1:719958333872:web:d2337762f8e5a257229e75",
  measurementId: "G-YFS1BGK5SV"
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
  storageBucket: firebaseConfig.storageBucket
});

const bucket = admin.storage().bucket();

export {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  bucket,
  admin,
};
