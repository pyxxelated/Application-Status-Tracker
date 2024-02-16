
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import {getAuth} from 'firebase/auth'
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDPWuQ491HsP4I1WKowcUC3Q-oi2rdOySQ",
  authDomain: "statusync-e9225.firebaseapp.com",
  projectId: "statusync-e9225",
  storageBucket: "statusync-e9225.appspot.com",
  messagingSenderId: "733034325988",
  appId: "1:733034325988:web:e2f9da7cc5ebc9fe5d49f1"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app);


console.log(db);


export {
    db,
    auth,
    storage
}