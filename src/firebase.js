// Firebase configuration file
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
// Replace these with your actual Firebase project details
const firebaseConfig = {
    apiKey: "AIzaSyBCV4gWcvJwuGGq-kVS_Np2RFPmN95VKdM",
    authDomain: "dual-axis-2f701.firebaseapp.com",
    databaseURL: "https://dual-axis-2f701-default-rtdb.firebaseio.com",
    projectId: "dual-axis-2f701",
    storageBucket: "dual-axis-2f701.firebasestorage.app",
    messagingSenderId: "465420518729",
    appId: "1:465420518729:web:e3be4e8dc16913d0e30698",
    measurementId: "G-X3JDKHLPZF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };