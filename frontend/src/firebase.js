// 1. Шаардлагатай функцуудыг Firebase-аас дуудаж оруулна
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 2. Чиний Firebase тохиргоо
const firebaseConfig = {
  apiKey: "AIzaSyDxO5BiNUMpl-k8fyyeJDHbLUYyKb51AgA",
  authDomain: "learnkorean-b682d.firebaseapp.com",
  projectId: "learnkorean-b682d",
  storageBucket: "learnkorean-b682d.firebasestorage.app",
  messagingSenderId: "83508220109",
  appId: "1:83508220109:web:7efa8e2962a126d4eb9984",
  measurementId: "G-GSN35R2Q0F"
};

// 3. Firebase-ийг эхлүүлэх
const app = initializeApp(firebaseConfig);

// 4. Auth болон Provider-ыг экспортолно
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' }); //энэ хэсэг нь гөөгл ээр нэвтрэх үед аккаунтаа сонгож болохоор хийж өгөв
// 5. Нэвтрэх болон Гарах функцууд
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
export const db = getFirestore(app);