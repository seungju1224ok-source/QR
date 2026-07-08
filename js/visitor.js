import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const statRef = doc(db, "visitors", "stats");

async function increaseVisitor() {

    if(sessionStorage.getItem("visited_ilwol14")){
        return;
    }

    sessionStorage.setItem("visited_ilwol14",true);

    const snapshot = await getDoc(statRef);

    if(snapshot.exists()){

        await updateDoc(statRef,{
            total: increment(1),
            today: increment(1),
            week: increment(1),
            month: increment(1),
            year: increment(1)
        });

    }

}

increaseVisitor();
