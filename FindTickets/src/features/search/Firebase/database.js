
// database/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Din Firebase-konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyCBa0UqL-7iS0OjKAAcCmeK6kT4lZv_2aY",
  authDomain: "innit-projekt.firebaseapp.com",
  projectId: "innit-projekt",
  storageBucket: "innit-projekt.firebasestorage.app",
  messagingSenderId: "399216676727",
  appId: "1:399216676727:web:ba6b2d3280686485089b72"
};

// Initialiser app kun én gang
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Vigtigt: brug **RTDB URL fra Firebase > Realtime Database > Data** (ikke projektID)
const rtdb = getDatabase(firebaseApp, "https://innit-projekt-default-rtdb.europe-west1.firebasedatabase.app/");

// Eksporter til brug i andre filer
export { firebaseApp, rtdb };