import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB_F6jDEoWcJKlEVS_fC8J3TCng3iVqsQY",
  authDomain: "dcs-buenaventura.firebaseapp.com",
  projectId: "dcs-buenaventura",
  storageBucket: "dcs-buenaventura.firebasestorage.app",
  messagingSenderId: "44886397164",
  appId: "1:44886397164:web:722a99874a8db7524f15c9",
  measurementId: "G-B3PJ924185"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
