import { db } from "./firebase.js";

import {
  doc,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firestore document currently used by counter.js.
// Field names must stay the same so the admin page can keep reading them.
const statRef = doc(db, "visitors", "stats");

// Keep the existing sessionStorage key so refreshes in the same browser session
// do not create duplicate visits.
const VISITOR_SESSION_KEY = "visited_ilwol14";

function pad2(value) {
  return String(value).padStart(2, "0");
}

// Use the visitor's local date for daily/monthly/yearly buckets.
function getLocalDateKey(date) {
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate())
  ].join("-");
}

function getLocalMonthKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

function getLocalYearKey(date) {
  return String(date.getFullYear());
}

// ISO week: Monday starts the week, and the week-year follows the Thursday rule.
// The result format matches the existing Firestore value, for example "2026-W28".
function getISOWeekKey(date) {
  const target = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));

  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);

  const isoYear = target.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const weekNumber = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);

  return `${isoYear}-W${pad2(weekNumber)}`;
}

function getCurrentPeriodKeys(date) {
  return {
    date: getLocalDateKey(date),
    week: getISOWeekKey(date),
    month: getLocalMonthKey(date),
    year: getLocalYearKey(date)
  };
}

// Firestore stores these fields as integers. If a value is unexpectedly missing,
// use 0 so the transaction can recover without creating new field names.
function readCount(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function alreadyVisitedInThisSession() {
  try {
    return sessionStorage.getItem(VISITOR_SESSION_KEY) === "true";
  } catch (error) {
    console.warn("Visitor sessionStorage read failed", error);
    return false;
  }
}

function markVisitedInThisSession() {
  try {
    sessionStorage.setItem(VISITOR_SESSION_KEY, "true");
  } catch (error) {
    console.warn("Visitor sessionStorage write failed", error);
  }
}

async function increaseVisitor() {
  if (alreadyVisitedInThisSession()) {
    console.log("Visitor already counted in this session");
    return;
  }

  try {
    const now = new Date();
    const current = getCurrentPeriodKeys(now);

    const result = await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(statRef);

      // If the stats document is ever missing, recreate it with only the
      // already-approved fields so counter.js can continue to work.
      if (!snapshot.exists()) {
        transaction.set(statRef, {
          total: 1,
          today: 1,
          week: 1,
          month: 1,
          year: 1,
          lastResetDate: current.date,
          lastWeek: current.week,
          lastMonth: current.month,
          lastYear: current.year
        });

        return {
          logs: [
            "Visitor stats document initialized",
            "Visitor counted"
          ]
        };
      }

      const data = snapshot.data();
      const shouldResetDay = data.lastResetDate !== current.date;
      const shouldResetWeek = data.lastWeek !== current.week;
      const shouldResetMonth = data.lastMonth !== current.month;
      const shouldResetYear = data.lastYear !== current.year;

      // Resettable counters are written with explicit numeric values.
      // If a period changed, store 1 directly for the current visitor.
      // Only periods that did not reset are calculated as previous value + 1.
      const nextTotal = readCount(data.total) + 1;
      const nextToday = shouldResetDay ? 1 : readCount(data.today) + 1;
      const nextWeek = shouldResetWeek ? 1 : readCount(data.week) + 1;
      const nextMonth = shouldResetMonth ? 1 : readCount(data.month) + 1;
      const nextYear = shouldResetYear ? 1 : readCount(data.year) + 1;

      transaction.update(statRef, {
        total: nextTotal,
        today: nextToday,
        week: nextWeek,
        month: nextMonth,
        year: nextYear,
        lastResetDate: current.date,
        lastWeek: current.week,
        lastMonth: current.month,
        lastYear: current.year
      });

      const logs = [];

      if (shouldResetDay) logs.push("Day reset");
      if (shouldResetWeek) logs.push("Week reset");
      if (shouldResetMonth) logs.push("Month reset");
      if (shouldResetYear) logs.push("Year reset");

      logs.push("Visitor counted");

      return { logs };
    });

    markVisitedInThisSession();
    result.logs.forEach((message) => console.log(message));
  } catch (error) {
    console.error("Visitor count failed", error);
  }
}

increaseVisitor();
