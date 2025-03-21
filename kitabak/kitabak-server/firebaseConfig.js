import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyA9HYD1Swq71-v25E2iA90ZsfRPav0ET9E",
  authDomain: "kitabak-90dd0.firebaseapp.com",
  projectId: "kitabak-90dd0",
  storageBucket: "kitabak-90dd0.firebasestorage.app",
  messagingSenderId: "56163093621",
  appId: "1:56163093621:web:0799e2983c309223413c3c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;