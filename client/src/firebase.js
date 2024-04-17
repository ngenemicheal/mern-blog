// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-abe6d.firebaseapp.com",
  projectId: "mern-blog-abe6d",
  storageBucket: "mern-blog-abe6d.appspot.com",
  messagingSenderId: "296316669215",
  appId: "1:296316669215:web:7da80e9ecce4a5f048742a"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);