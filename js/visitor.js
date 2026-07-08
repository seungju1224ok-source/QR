import { db } from "./firebase.js";

import {
  doc,
  updateDoc,
  increment,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const docRef = doc(db, "visitors", "stats");

async function countVisitor() {

    // 같은 브라우저에서 새로고침할 때 중복 증가 방지
    if(sessionStorage.getItem("visited")){
        return;
    }

    sessionStorage.setItem("visited","true");

    const snap = await getDoc(docRef);

    if(!snap.exists()){
        console.log("stats document not found.");
        return;
    }

    await updateDoc(docRef,{
        total: increment(1),
        today: increment(1),
        week: increment(1),
        month: increment(1),
        year: increment(1)
    });

    console.log("Visitor counted.");
}

countVisitor();
