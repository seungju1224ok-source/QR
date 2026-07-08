import { db } from "./firebase.js";

import {
doc,
onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const ref=doc(db,"visitors","stats");

onSnapshot(ref,(docSnap)=>{

const d=docSnap.data();

document.getElementById("stat-total").textContent=d.total;
document.getElementById("stat-day").textContent=d.today;
document.getElementById("stat-week").textContent=d.week;
document.getElementById("stat-month").textContent=d.month;
document.getElementById("stat-year").textContent=d.year;

});
