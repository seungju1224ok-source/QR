import { db } from "./firebase.js";

import {
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const docRef = doc(db, "visitors", "stats");

onSnapshot(docRef, (snapshot) => {

    if(!snapshot.exists()){
        console.log("stats document not found.");
        return;
    }

    const data = snapshot.data();

    document.getElementById("stat-total").textContent = data.total;
    document.getElementById("stat-day").textContent = data.today;
    document.getElementById("stat-week").textContent = data.week;
    document.getElementById("stat-month").textContent = data.month;
    document.getElementById("stat-year").textContent = data.year;

    document.getElementById("loading").style.display = "none";
    document.getElementById("stats").style.display = "grid";

});
