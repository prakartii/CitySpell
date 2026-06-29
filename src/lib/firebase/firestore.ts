import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
  type DocumentData,
  type QueryConstraint,
  type DocumentSnapshot,
  type QuerySnapshot,
  type DocumentReference,
  type CollectionReference,
  type Query,
} from 'firebase/firestore';
import { db } from './config';
import type {
  CollectionCallback,
  DocCallback,
  UnsubscribeFn,
} from '../types/collections';

// ─── Collection names ─────────────────────────────────────────────────────────

export const COLLECTIONS = {
  USERS: 'users',
  ISSUES: 'issues',
  WARDS: 'wards',
  PREDICTIONS: 'predictions',
  DEPARTMENTS: 'departments',
  ASSIGNMENTS: 'assignments',
  COPILOT_REPORTS: 'copilot_reports',
  NOTIFICATIONS: 'notifications',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function colRef(name: CollectionName): CollectionReference<DocumentData> {
  return collection(db, name);
}

export function docRef(name: CollectionName, id: string): DocumentReference<DocumentData> {
  return doc(db, name, id);
}

function snapToData<T>(snap: DocumentSnapshot<DocumentData>): T | null {
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getDocument<T>(
  col: CollectionName,
  id: string,
): Promise<T | null> {
  const snap = await getDoc(docRef(col, id));
  return snapToData<T>(snap);
}

export async function getDocuments<T>(
  col: CollectionName,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  const q: Query<DocumentData> = query(colRef(col), ...constraints);
  const snap: QuerySnapshot<DocumentData> = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

export async function createDocument<T extends Record<string, unknown>>(
  col: CollectionName,
  data: T,
  id?: string,
): Promise<string> {
  const payload = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  if (id) {
    await setDoc(docRef(col, id), payload);
    return id;
  }
  const ref = await addDoc(colRef(col), payload);
  return ref.id;
}

export async function updateDocument<T extends Record<string, unknown>>(
  col: CollectionName,
  id: string,
  data: Partial<T>,
): Promise<void> {
  await updateDoc(docRef(col, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocument(col: CollectionName, id: string): Promise<void> {
  await deleteDoc(docRef(col, id));
}

// For updates that need raw FieldValue objects (arrayUnion, arrayRemove, increment).
// Unlike updateDocument, this does NOT auto-append updatedAt.
export async function rawUpdateDocument(
  col: CollectionName,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await updateDoc(docRef(col, id), data);
}

// ─── Realtime subscriptions ───────────────────────────────────────────────────

export function subscribeToDocument<T>(
  col: CollectionName,
  id: string,
  callback: DocCallback<T>,
): UnsubscribeFn {
  return onSnapshot(docRef(col, id), (snap: DocumentSnapshot<DocumentData>) => {
    callback(snapToData<T>(snap));
  });
}

export function subscribeToCollection<T>(
  col: CollectionName,
  constraints: QueryConstraint[],
  callback: CollectionCallback<T>,
): UnsubscribeFn {
  const q: Query<DocumentData> = query(colRef(col), ...constraints);
  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as T)));
  });
}

// ─── Field helpers re-exported ────────────────────────────────────────────────

export {
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
  where,
  orderBy,
  limit,
  startAfter,
};
