// database/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";   // 👈 NYT

const firebaseConfig = {
  apiKey: "AIzaSyCBa0UqL-7iS0OjKAAcCmeK6kT4lZv_2aY",
  authDomain: "innit-projekt.firebaseapp.com",
  projectId: "innit-projekt",
  storageBucket: "innit-projekt.firebasestorage.app",
  messagingSenderId: "399216676727",
  appId: "1:399216676727:web:ba6b2d3280686485089b72"
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const rtdb = getDatabase(
  firebaseApp,
  "https://innit-projekt-default-rtdb.europe-west1.firebasedatabase.app/"
);

// 🔑 Auth instance
const auth = getAuth(firebaseApp);

export { firebaseApp, rtdb, auth };
