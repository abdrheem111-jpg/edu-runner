// Firebase project of the game (public web configuration – access is protected by the Firestore rules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, serverTimestamp, increment, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDcS-_0Sl6tEf12gBc2wWcjcAJIS4RgaJA",
  authDomain: "run-way-5306a.firebaseapp.com",
  projectId: "run-way-5306a",
  storageBucket: "run-way-5306a.firebasestorage.app",
  messagingSenderId: "115868947785",
  appId: "1:115868947785:web:88f8731c9709ff50d97698"
};

export const TEACHER_EMAIL = "abdrheem.111@gmail.com";
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function signInGoogle() {
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, p);
}
export { signOut, onAuthStateChanged, doc, getDoc, setDoc, addDoc, collection, serverTimestamp, increment, query, orderBy, limit, getDocs };

export function deviceKind() {
  const ua = navigator.userAgent || "";
  if (/iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ipad";
  if (/iPhone|iPod/.test(ua)) return "iphone";
  if (/Android/.test(ua)) return /Mobile/.test(ua) ? "android-phone" : "android-tablet";
  return "computer";
}

export function friendlyError(e) {
  const c = (e && e.code) || "";
  if (c.includes("popup-blocked")) return "المتصفح منع نافذة الدخول — اسمح بالنوافذ المنبثقة ثم حاول مرة ثانية";
  if (c.includes("popup-closed") || c.includes("cancelled-popup")) return "أُغلقت نافذة الدخول قبل الانتهاء — حاول مرة ثانية";
  if (c.includes("network")) return "لا يوجد اتصال بالإنترنت — تأكد من الشبكة ثم حاول مرة ثانية";
  if (c.includes("unauthorized-domain")) return "هذا الموقع غير مسموح في إعدادات Firebase";
  return "تعذّر تسجيل الدخول: " + (c || (e && e.message) || e);
}
