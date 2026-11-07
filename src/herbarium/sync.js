// One book across every device: Google sign-in + Firestore.
//
// Layout: users/{uid}/readings/{readingId} and users/{uid}/journal/{yyyy-mm-dd}.
// One document per reading/page keeps every write small and far from
// Firestore's 1 MB document limit.
//
// The first time a device signs in, its local book and the cloud book are
// merged (nothing on either side is lost). After that the cloud is the book:
// edits are written through Firestore, which queues them while offline, and
// live snapshots keep every device's copy current.
//
// Firebase is loaded lazily, so nobody who never signs in pays for it.

import { firebaseConfig } from "./firebase-config.js";
import { mergeGrimoire } from "./carry.js";

export const syncAvailable = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const LINKED = "grimoire-sync-uid";      // uid this device's book is linked to
const REDIRECTING = "grimoire-sync-redirect";

let loading = null, ready = null;
function load() {
  if (!loading) loading = (async () => {
    const [{ initializeApp }, A, F] = await Promise.all([
      import("firebase/app"), import("firebase/auth"), import("firebase/firestore"),
    ]);
    const app = initializeApp(firebaseConfig);
    const auth = A.getAuth(app);
    let db;
    try {
      db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) });
    } catch {
      db = F.getFirestore(app);
    }
    // Local testing against the Firebase emulators (never set in production).
    const emu = import.meta.env.VITE_FIREBASE_EMULATOR;
    if (emu) {
      A.connectAuthEmulator(auth, `http://${emu}:9099`, { disableWarnings: true });
      F.connectFirestoreEmulator(db, emu, 8080);
      window.__grimoireTestSignIn = (email) =>
        A.signInWithCredential(auth, A.GoogleAuthProvider.credential(JSON.stringify({ sub: email, email, email_verified: true })));
    }
    return (ready = { auth, db, A, F });
  })();
  return loading;
}

// Warm Firebase up before anyone taps "Sign in", so the popup opens inside
// the tap itself; Safari blocks popups that open after an await.
export const preload = () => { if (syncAvailable) load().catch(() => {}); };

const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key, v) => { try { v == null ? localStorage.removeItem(key) : localStorage.setItem(key, v); } catch {} };

// Should this device wake Firebase on load (it was signed in, or is coming
// back from a sign-in redirect)?
export const wasSignedIn = () => syncAvailable && Boolean(read(LINKED) || read(REDIRECTING));

export async function watchAccount(callback) {
  const { auth, A } = await load();
  if (read(REDIRECTING)) {
    write(REDIRECTING, null);
    try { await A.getRedirectResult(auth); } catch (e) { callback(null, e); }
  }
  return A.onAuthStateChanged(auth, user => callback(user ? { uid: user.uid, email: user.email, name: user.displayName } : null));
}

export async function signIn() {
  const { auth, A } = ready || await load();
  const provider = new A.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    await A.signInWithPopup(auth, provider);
  } catch (e) {
    if (e?.code === "auth/popup-blocked" || e?.code === "auth/operation-not-supported-in-this-environment") {
      write(REDIRECTING, "1");
      await A.signInWithRedirect(auth, provider);
      return;
    }
    if (e?.code === "auth/popup-closed-by-user" || e?.code === "auth/cancelled-popup-request") return;
    throw e;
  }
}

export async function signOut() {
  write(LINKED, null);
  const { auth, A } = await load();
  await A.signOut(auth);
}

// Firestore rejects undefined values; a JSON round trip strips them.
const clean = (x) => JSON.parse(JSON.stringify(x));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function diffReadings(before, after) {
  const was = new Map(before.map(r => [r.id, r]));
  const now = new Map(after.map(r => [r.id, r]));
  const sets = after.filter(r => r?.id && !same(was.get(r.id), r)).map(r => [r.id, r]);
  const dels = before.filter(r => r?.id && !now.has(r.id)).map(r => r.id);
  return { sets, dels };
}
function diffJournal(before, after) {
  const sets = Object.entries(after).filter(([k, v]) => v && !same(before[k], v));
  const dels = Object.keys(before).filter(k => !(k in after));
  return { sets, dels };
}

async function commit(uid, collection, { sets, dels }) {
  if (!sets.length && !dels.length) return;
  const { db, F } = await load();
  const ops = [...sets.map(([id, v]) => ["set", id, v]), ...dels.map(id => ["del", id])];
  for (let i = 0; i < ops.length; i += 400) {
    const batch = F.writeBatch(db);
    for (const [op, id, v] of ops.slice(i, i + 400)) {
      const ref = F.doc(db, "users", uid, collection, id);
      op === "set" ? batch.set(ref, clean(v)) : batch.delete(ref);
    }
    await batch.commit();
  }
}

export const pushReadings = (uid, before, after) => commit(uid, "readings", diffReadings(before, after));
export const pushJournal = (uid, before, after) => commit(uid, "journal", diffJournal(before, after));

// Link this device's book to the account and stream the cloud book back.
// getLocal() returns the current local { readings, journal }.
// onRemote({ readings }) / onRemote({ journal }) fires on every cloud change.
export async function connectBook(uid, getLocal, onRemote) {
  const { db, F } = await load();
  const readingsCol = F.collection(db, "users", uid, "readings");
  const journalCol = F.collection(db, "users", uid, "journal");

  let merged = null;
  if (read(LINKED) !== uid) {
    const [rs, js] = await Promise.all([F.getDocsFromServer(readingsCol), F.getDocsFromServer(journalCol)]);
    const cloud = {
      readings: rs.docs.map(d => d.data()),
      journal: Object.fromEntries(js.docs.map(d => [d.id, d.data()])),
    };
    merged = mergeGrimoire(cloud, getLocal());
    await pushReadings(uid, cloud.readings, merged.readings);
    await pushJournal(uid, cloud.journal, merged.journal);
    write(LINKED, uid);
  }

  const stops = [
    F.onSnapshot(readingsCol, snap => {
      if (snap.empty && snap.metadata.fromCache) return; // a cold cache, not an empty book
      const readings = snap.docs.map(d => d.data()).sort((a, b) => (b.ts || 0) - (a.ts || 0));
      onRemote({ readings });
    }),
    F.onSnapshot(journalCol, snap => {
      if (snap.empty && snap.metadata.fromCache) return;
      onRemote({ journal: Object.fromEntries(snap.docs.map(d => [d.id, d.data()])) });
    }),
  ];
  return { stop: () => stops.forEach(s => s()), merged };
}
