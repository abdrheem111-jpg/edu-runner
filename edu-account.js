// Sign-in screen of the game: Google account → player name, and every visit / finished round is saved for the teacher.
import { auth, db, signInGoogle, signOut, onAuthStateChanged, doc, getDoc, setDoc, addDoc, collection, serverTimestamp, increment, deviceKind, friendlyError, hasAccess } from "./edu-firebase.js";

const $ = (id) => document.getElementById(id);
const device = deviceKind();
let current = null;

function show(state) {
  $("login-wait").classList.toggle("hidden", state !== "wait");
  $("btn-google").classList.toggle("hidden", state !== "out");
  $("login-user").classList.toggle("hidden", state !== "in");
  $("login-denied").classList.toggle("hidden", state !== "denied");
  $("login-note").classList.toggle("hidden", state === "in" || state === "denied");
}

function shortName(u) {
  const n = (u.displayName || (u.email || "").split("@")[0] || "لاعب").trim();
  return n.length > 30 ? n.slice(0, 30) : n;
}

async function checkAndShow(u) {
  show("wait");
  if (!(await hasAccess(u))) {
    if (current !== u) return;
    $("denied-email").textContent = u.email || "";
    show("denied");
    // let the teacher see who is waiting (stats page → "طلبات الدخول")
    try { await setDoc(doc(db, "requests", u.uid), { name: shortName(u), email: (u.email || "").toLowerCase(), at: serverTimestamp(), device }); } catch (e) { console.warn("request", e); }
    return;
  }
  if (current !== u) return;
  $("user-name").textContent = shortName(u);
  if (u.photoURL) { $("user-photo").src = u.photoURL; $("user-photo").classList.remove("hidden"); } else $("user-photo").classList.add("hidden");
  show("in");
}

onAuthStateChanged(auth, (u) => {
  current = u;
  if (!u) { show("out"); return; }
  checkAndShow(u);
});

$("btn-recheck").addEventListener("click", () => { $("login-err").textContent = ""; if (current) checkAndShow(current); });
$("btn-switch2").addEventListener("click", async () => {
  $("login-err").textContent = "";
  try { await signInGoogle(); } catch (e) { $("login-err").textContent = friendlyError(e); }
});

$("btn-google").addEventListener("click", async () => {
  $("login-err").textContent = "";
  try { await signInGoogle(); } catch (e) { $("login-err").textContent = friendlyError(e); }
});

$("btn-switch").addEventListener("click", async () => {
  $("login-err").textContent = "";
  // the account chooser replaces the current account (no sign-out first: iPad only opens the window straight from the tap)
  try { await signInGoogle(); } catch (e) { $("login-err").textContent = friendlyError(e); }
});

$("btn-play").addEventListener("click", async () => {
  const u = current; if (!u || $("login-user").classList.contains("hidden")) return;
  const name = shortName(u);
  window.eduPlayerName = name;
  window.eduStartGame();              // the download starts right away; saving the visit happens alongside
  try {
    const ref = doc(db, "players", u.uid);
    const snap = await getDoc(ref);
    const data = { name, email: u.email || "", photo: u.photoURL || "", lastSeen: serverTimestamp(), visits: increment(1), device };
    if (!snap.exists()) { data.firstSeen = serverTimestamp(); data.runs = 0; }
    await setDoc(ref, data, { merge: true });
    await addDoc(collection(db, "visits"), { uid: u.uid, name, at: serverTimestamp(), device });
  } catch (e) { console.warn("visit not saved", e); }
});

// called by the game after every finished round
window.eduReportResult = async (r) => {
  const u = current; if (!u) return;
  try {
    await addDoc(collection(db, "results"), {
      uid: u.uid, name: window.eduPlayerName || shortName(u), at: serverTimestamp(), device,
      board: String(r.board || ""), mode: String(r.mode || ""), bank: String(r.bank || ""),
      value: Number(r.value) || 0, detail: String(r.detail || ""), correct: r.correct | 0, wrong: r.wrong | 0
    });
    await setDoc(doc(db, "players", u.uid), { runs: increment(1), lastSeen: serverTimestamp() }, { merge: true });
  } catch (e) { console.warn("result not saved", e); }
};

show("wait");
