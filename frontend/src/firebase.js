import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signOut, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxO5BiNUMpl-k8fyyeJDHbLUYyKb51AgA",
  authDomain: "learnkorean-b682d.firebaseapp.com",
  projectId: "learnkorean-b682d",
  storageBucket: "learnkorean-b682d.firebasestorage.app",
  messagingSenderId: "83508220109",
  appId: "1:83508220109:web:7efa8e2962a126d4eb9984",
  measurementId: "G-GSN35R2Q0F"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err) {
    if (err.code === 'auth/popup-blocked') {
      return signInWithRedirect(auth, googleProvider);
    }
    throw err;
  }
};

export const logout = () => signOut(auth);
export const db = getFirestore(app);