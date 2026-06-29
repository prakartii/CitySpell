import {
  COLLECTIONS,
  createDocument,
  getDocument,
  updateDocument,
  subscribeToDocument,
  where,
  orderBy,
  getDocuments,
  subscribeToCollection,
  serverTimestamp,
} from '../firebase/firestore';
import { DEMO_MODE } from '../firebase/config';
import {
  DEMO_CITIZEN,
  DEMO_AUTHORITY,
  getDemoProfileForEmail,
  getDemoProfileForPhone,
} from '../firebase/demo';
import type {
  UserDoc,
  UserCreateInput,
  UserUpdateInput,
  UnsubscribeFn,
  DocCallback,
  CollectionCallback,
} from '../types/collections';

// ─── Demo helpers ─────────────────────────────────────────────────────────────

function asDemoDoc(
  partial: Omit<UserDoc, 'createdAt' | 'updatedAt'>,
): UserDoc {
  return {
    ...partial,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as UserDoc['createdAt'],
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as UserDoc['updatedAt'],
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createUser(uid: string, data: UserCreateInput): Promise<void> {
  if (DEMO_MODE) return;
  await createDocument<UserCreateInput>(COLLECTIONS.USERS, data, uid);
}

export async function getUser(uid: string): Promise<UserDoc | null> {
  if (DEMO_MODE) {
    if (uid === DEMO_CITIZEN.uid) return asDemoDoc(DEMO_CITIZEN);
    if (uid === DEMO_AUTHORITY.uid) return asDemoDoc(DEMO_AUTHORITY);
    return asDemoDoc(DEMO_CITIZEN);
  }
  return getDocument<UserDoc>(COLLECTIONS.USERS, uid);
}

export async function updateUser(uid: string, data: UserUpdateInput): Promise<void> {
  if (DEMO_MODE) return;
  await updateDocument<UserUpdateInput>(COLLECTIONS.USERS, uid, data);
}

export async function updateLastLogin(uid: string): Promise<void> {
  if (DEMO_MODE) return;
  try {
    await updateDocument(COLLECTIONS.USERS, uid, {
      lastLogin: serverTimestamp(),
    } as Partial<UserDoc>);
  } catch {
    // Non-critical — don't surface to user
  }
}

export async function getUsersByWard(wardId: string): Promise<UserDoc[]> {
  if (DEMO_MODE) return [asDemoDoc(DEMO_CITIZEN)];
  return getDocuments<UserDoc>(COLLECTIONS.USERS, [
    where('wardId', '==', wardId),
    orderBy('createdAt', 'desc'),
  ]);
}

export async function getUsersByRole(role: UserDoc['role']): Promise<UserDoc[]> {
  if (DEMO_MODE) {
    if (role === 'authority') return [asDemoDoc(DEMO_AUTHORITY)];
    return [asDemoDoc(DEMO_CITIZEN)];
  }
  return getDocuments<UserDoc>(COLLECTIONS.USERS, [
    where('role', '==', role),
    orderBy('createdAt', 'desc'),
  ]);
}

export async function getUserByPhone(phone: string): Promise<UserDoc | null> {
  if (DEMO_MODE) return asDemoDoc(getDemoProfileForPhone(phone));
  const users = await getDocuments<UserDoc>(COLLECTIONS.USERS, [
    where('phone', '==', phone),
  ]);
  return users.length > 0 ? users[0] : null;
}

export async function getUserByEmail(email: string): Promise<UserDoc | null> {
  if (DEMO_MODE) return asDemoDoc(getDemoProfileForEmail(email));
  const users = await getDocuments<UserDoc>(COLLECTIONS.USERS, [
    where('email', '==', email),
  ]);
  return users.length > 0 ? users[0] : null;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export function subscribeToUser(uid: string, cb: DocCallback<UserDoc>): UnsubscribeFn {
  if (DEMO_MODE) {
    const doc =
      uid === DEMO_AUTHORITY.uid ? asDemoDoc(DEMO_AUTHORITY) : asDemoDoc(DEMO_CITIZEN);
    setTimeout(() => cb(doc), 50);
    return () => {};
  }
  return subscribeToDocument<UserDoc>(COLLECTIONS.USERS, uid, cb);
}

export function subscribeToWardCitizens(
  wardId: string,
  cb: CollectionCallback<UserDoc>,
): UnsubscribeFn {
  if (DEMO_MODE) {
    setTimeout(() => cb([asDemoDoc(DEMO_CITIZEN)]), 50);
    return () => {};
  }
  return subscribeToCollection<UserDoc>(
    COLLECTIONS.USERS,
    [where('wardId', '==', wardId), where('role', '==', 'citizen'), orderBy('createdAt', 'desc')],
    cb,
  );
}
