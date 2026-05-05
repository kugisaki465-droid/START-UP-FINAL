/**
 * Firebase Configuration — SakaySmart Butuan
 */
import { initializeApp } from 'firebase/app';
import { getAuth }       from 'firebase/auth';
import { getFirestore }  from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyAIBAZjSYPcJQJxvvO5p0GDHlFItyk-zSs',
  authDomain:        'start-up-9fe39.firebaseapp.com',
  projectId:         'start-up-9fe39',
  storageBucket:     'start-up-9fe39.firebasestorage.app',
  messagingSenderId: '297910618119',
  appId:             '1:297910618119:web:c08a74e85b938fd5c482a2',
  measurementId:     'G-2L4919X9YQ',
};

const app       = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

export default app;
