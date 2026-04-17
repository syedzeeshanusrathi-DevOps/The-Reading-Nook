import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export function onUserChange(cb) {
  onAuthStateChanged(auth, cb);
}

export async function signUp(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOutUser() {
  await signOut(auth);
}

// === Per-user book status ===
// Firestore path:   users/{uid}/books/{bookId}
//                   { status: "read" | "wantToRead" | null, favorite: boolean }

function bookRef(uid, bookId) {
  return doc(db, "users", uid, "books", bookId);
}

export async function loadUserBooks(uid) {
  const snap = await getDocs(collection(db, "users", uid, "books"));
  const map = {};
  snap.forEach((d) => { map[d.id] = d.data(); });
  return map;
}

export async function saveBookState(uid, bookId, state) {
  // state = { status, favorite }
  if (!state.status && !state.favorite) {
    await deleteDoc(bookRef(uid, bookId));
  } else {
    await setDoc(bookRef(uid, bookId), state, { merge: true });
  }
}
