// firebase-init.js

const firebaseConfig = {
  apiKey: "AIzaSyDVCiUp3qy0hYLQQ3D1jPpfndCVOKEHEZg",
  authDomain: "befaringsappen.firebaseapp.com",
  projectId: "befaringsappen",
  storageBucket: "befaringsappen.appspot.com",
  messagingSenderId: "455917300957",
  appId: "1:455917300957:web:99c0259444c7a7ac5f7f34",
  measurementId: "G-T8E9CXZNJ4",
  databaseURL: "https://befaringsappen-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialiser app og database
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
// firebase-init.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child } from "firebase/database";

const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX",
  projectId: "XXX",
  storageBucket: "XXX",
  messagingSenderId: "XXX",
  appId: "XXX"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, get, child };
