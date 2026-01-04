import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBA4V5ES6Y8GkrNuFEvsDTIepGOLSFXinU",
  authDomain: "personal-edu-app.firebaseapp.com",
  projectId: "personal-edu-app",
  storageBucket: "personal-edu-app.firebasestorage.app",
  messagingSenderId: "643704680692",
  appId: "1:643704680692:web:b593c5fd31630aa24eeea1"
};



const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);