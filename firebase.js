// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBhjb5rcdsj-eiyeWIAstOGrBFRjuTMi88",
  authDomain: "adhdapp-d1602.firebaseapp.com",
  projectId: "adhdapp-d1602",
  storageBucket: "adhdapp-d1602.appspot.com",
  messagingSenderId: "557670123794",
  appId: "1:557670123794:web:85951b5600073c29794bcb",
  measurementId: "G-ZQ5LGGD62V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };