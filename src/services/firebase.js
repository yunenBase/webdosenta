import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig'; // Adjust path to firebaseConfig.js
import { getAuth } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
console.log('firebase.js loaded');
export const db = getFirestore(app);
export const auth = getAuth(app);