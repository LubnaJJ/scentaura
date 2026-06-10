import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyD5X4xbkEdOq_1NZZNN-yPg9CzEcUNa-ws',
  authDomain: 'fluttercourse-d8455.firebaseapp.com',
  projectId: 'fluttercourse-d8455',
  storageBucket: 'fluttercourse-d8455.firebasestorage.app',
  messagingSenderId: '777971907355',
  appId: '1:777971907355:web:b3c06e7ad75ae83c5b31be',
  measurementId: 'G-73K5GJED4B',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
