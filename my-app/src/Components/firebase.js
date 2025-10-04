import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";  // <-- IMPORT storage

const firebaseConfig = {
  apiKey: "AIzaSyAJ6Tto_i9HNs_fHy8kgBwePtXyr8M_8VY",
  authDomain: "javaxerox-11341.firebaseapp.com",
  databaseURL: "https://javaxerox-11341-default-rtdb.firebaseio.com",
  projectId: "javaxerox-11341",
  storageBucket: "javaxerox-11341.appspot.com",
  messagingSenderId: "229149776050",
  appId: "1:229149776050:web:ea8c5cb5804f88954611ab",
  measurementId: "G-JSLWTC2VYX"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);  // <-- EXPORT storage here
