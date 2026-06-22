import {
  COLLECTIONS,
  createDocument,
  getDocument,
  getDocuments,
  updateDocument,
  subscribeToDocument,
  subscribeToCollection,
  where,
  orderBy,
} from '../firebase/firestore';
import type {
  WardDoc,
  WardUpdateInput,
  UnsubscribeFn,
  DocCallback,
  CollectionCallback,
} from '../types/collections';

export async function createWard(id: string, data: Omit<WardDoc, 'id'>): Promise<void> {
  await createDocument(COLLECTIONS.WARDS, data as Record<string, unknown>, id);
}

export async function getWard(wardId: string): Promise<WardDoc | null> {
  return getDocument<WardDoc>(COLLECTIONS.WARDS, wardId);
}

export async function updateWard(wardId: string, data: WardUpdateInput): Promise<void> {
  await updateDocument(COLLECTIONS.WARDS, wardId, data as Record<string, unknown>);
}

export async function getAllWards(city?: string): Promise<WardDoc[]> {
  const constraints = city
    ? [where('city', '==', city), orderBy('wardNumber', 'asc')]
    : [orderBy('wardNumber', 'asc')];
  return getDocuments<WardDoc>(COLLECTIONS.WARDS, constraints);
}

export async function getWardsByHealthTrend(
  trend: WardDoc['healthTrend'],
): Promise<WardDoc[]> {
  return getDocuments<WardDoc>(COLLECTIONS.WARDS, [
    where('healthTrend', '==', trend),
    orderBy('healthScore', 'asc'),
  ]);
}

export function subscribeToWard(wardId: string, cb: DocCallback<WardDoc>): UnsubscribeFn {
  return subscribeToDocument<WardDoc>(COLLECTIONS.WARDS, wardId, cb);
}

export function subscribeToAllWards(
  city: string,
  cb: CollectionCallback<WardDoc>,
): UnsubscribeFn {
  return subscribeToCollection<WardDoc>(
    COLLECTIONS.WARDS,
    [where('city', '==', city), orderBy('wardNumber', 'asc')],
    cb,
  );
}

export function subscribeToCriticalWards(cb: CollectionCallback<WardDoc>): UnsubscribeFn {
  return subscribeToCollection<WardDoc>(
    COLLECTIONS.WARDS,
    [where('healthTrend', '==', 'declining'), orderBy('healthScore', 'asc')],
    cb,
  );
}
