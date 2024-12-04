// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Nếu bạn cần sử dụng Realtime Database
import { getDatabase } from "firebase/database"; // Import cho Realtime Database
import { getStorage } from "firebase/storage"; // Import cho Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAaf_nbGpXShwuthvQZ23ZLiGcvMCN82o0",
  authDomain: "fitnessworkoutapp-601c0.firebaseapp.com",
  databaseURL: "https://fitnessworkoutapp-601c0-default-rtdb.firebaseio.com",
  projectId: "fitnessworkoutapp-601c0",
  storageBucket: "fitnessworkoutapp-601c0.appspot.com",
  messagingSenderId: "857412161759",
  appId: "1:857412161759:web:d814def8a71851c636596a",
  measurementId: "G-34CNE3XTXM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics if supported
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  } else {
    console.warn("Firebase Analytics is not supported in this environment.");
  }
});

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const db = getFirestore(app);

// Khởi tạo Realtime Database (nếu cần)
export const database = getDatabase(app); // Khởi tạo Realtime Database

// Khởi tạo Firebase Storage (nếu cần)
export const storage = getStorage(app); // Khởi tạo Storage
