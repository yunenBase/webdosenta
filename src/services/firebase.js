import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig'; // Adjust path to firebaseConfig.js

const app = initializeApp(firebaseConfig);
console.log('firebase.js loaded');
export const db = getFirestore(app);