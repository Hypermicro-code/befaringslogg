// firebase-init.js

// Lastes med <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
// og <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script> i index.html

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
