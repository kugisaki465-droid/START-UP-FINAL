/**
 * Firebase Configuration — SakaySmart Butuan
 */
import { initializeApp } from 'firebase/app';
import { getAuth }       from 'firebase/auth';
import { getFirestore }  from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyAYBNeb3JyKTCWJspo_7ffRfU8F76FxELk',
  authDomain:        'start-up-fb533.firebaseapp.com',
  projectId:         'start-up-fb533',
  storageBucket:     'start-up-fb533.firebasestorage.app',
  messagingSenderId: '354285838578',
  appId:             '1:354285838578:web:193bba6eb9a03b4e8cf06b',
  measurementId:     'G-YFKRC738QQ',
};

const app       = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

export default app;
