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
} from '../firebase/firestore';
import type {
  UserDoc,
  UserCreateInput,
  UserUpdateInput,
  UnsubscribeFn,
  DocCallback,
  CollectionCallback,
} from '../types/collections';

export async function createUser(uid: string, data: UserCreateInput): Promise<void> {
  await createDocument<UserCreateInput>(COLLECTIONS.USERS, data, uid);
}

export async function getUser(uid: string): Promise<UserDoc | null> {
  return getDocument<UserDoc>(COLLECTIONS.USERS, uid);
}

export async function updateUser(uid: string, data: UserUpdateInput): Promise<void> {
  await updateDocument<UserUpdateInput>(COLLECTIONS.USERS, uid, data);
}

export async function getUsersByWard(wardId: string): Promise<UserDoc[]> {
  return getDocuments<UserDoc>(COLLECTIONS.USERS, [
    where('wardId', '==', wardId),
    orderBy('createdAt', 'desc'),
  ]);
}

export async function getUsersByRole(role: UserDoc['role']): Promise<UserDoc[]> {
  return getDocuments<UserDoc>(COLLECTIONS.USERS, [
    where('role', '==', role),
    orderBy('createdAt', 'desc'),
  ]);
}

export function subscribeToUser(uid: string, cb: DocCallback<UserDoc>): UnsubscribeFn {
  return subscribeToDocument<UserDoc>(COLLECTIONS.USERS, uid, cb);
}

export function subscribeToWardCitizens(
  wardId: string,
  cb: CollectionCallback<UserDoc>,
): UnsubscribeFn {
  return subscribeToCollection<UserDoc>(
    COLLECTIONS.USERS,
    [where('wardId', '==', wardId), where('role', '==', 'citizen'), orderBy('createdAt', 'desc')],
    cb,
  );
}
