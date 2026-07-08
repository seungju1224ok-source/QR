// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBvIR9woU0oVbN60jLl62qs0gSYAjqOo-0",
  authDomain: "ilwol14-counter.firebaseapp.com",
  projectId: "ilwol14-counter",
  storageBucket: "ilwol14-counter.firebasestorage.app",
  messagingSenderId: "1051336081715",
  appId: "1:1051336081715:web:2026e4fd4d0f7d269e3e46"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 연결
const db = getFirestore(app);

// 외부에서 사용할 수 있도록 내보내기
export { db };
