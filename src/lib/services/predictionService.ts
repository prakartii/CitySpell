import {
  COLLECTIONS,
  createDocument,
  getDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  subscribeToDocument,
  subscribeToCollection,
  where,
  orderBy,
  limit,
} from '../firebase/firestore';
import type {
  PredictionDoc,
  PredictionCreateInput,
  PredictionUpdateInput,
  PredictionStatus,
  PredictionType,
  IssueSeverity,
  UnsubscribeFn,
  DocCallback,
  CollectionCallback,
} from '../types/collections';

export async function createPrediction(data: PredictionCreateInput): Promise<string> {
  return createDocument(COLLECTIONS.PREDICTIONS, data as Record<string, unknown>);
}

export async function getPrediction(id: string): Promise<PredictionDoc | null> {
  return getDocument<PredictionDoc>(COLLECTIONS.PREDICTIONS, id);
}

export async function updatePrediction(id: string, data: PredictionUpdateInput): Promise<void> {
  await updateDocument(COLLECTIONS.PREDICTIONS, id, data as Record<string, unknown>);
}

export async function deletePrediction(id: string): Promise<void> {
  await deleteDocument(COLLECTIONS.PREDICTIONS, id);
}

export async function getActivePredictionsByWard(wardId: string): Promise<PredictionDoc[]> {
  return getDocuments<PredictionDoc>(COLLECTIONS.PREDICTIONS, [
    where('wardId', '==', wardId),
    where('status', '==', 'active'),
    orderBy('probability', 'desc'),
  ]);
}

export async function getHighRiskPredictions(threshold = 0.7): Promise<PredictionDoc[]> {
  return getDocuments<PredictionDoc>(COLLECTIONS.PREDICTIONS, [
    where('status', '==', 'active'),
    where('probability', '>=', threshold),
    orderBy('probability', 'desc'),
    limit(20),
  ]);
}

export async function getPredictionsByType(type: PredictionType): Promise<PredictionDoc[]> {
  return getDocuments<PredictionDoc>(COLLECTIONS.PREDICTIONS, [
    where('type', '==', type),
    where('status', '==', 'active'),
    orderBy('probability', 'desc'),
  ]);
}

export function subscribeToPrediction(
  id: string,
  cb: DocCallback<PredictionDoc>,
): UnsubscribeFn {
  return subscribeToDocument<PredictionDoc>(COLLECTIONS.PREDICTIONS, id, cb);
}

export function subscribeToWardPredictions(
  wardId: string,
  cb: CollectionCallback<PredictionDoc>,
): UnsubscribeFn {
  return subscribeToCollection<PredictionDoc>(
    COLLECTIONS.PREDICTIONS,
    [
      where('wardId', '==', wardId),
      where('status', '==', 'active'),
      orderBy('probability', 'desc'),
    ],
    cb,
  );
}

export function subscribeToCriticalPredictions(cb: CollectionCallback<PredictionDoc>): UnsubscribeFn {
  return subscribeToCollection<PredictionDoc>(
    COLLECTIONS.PREDICTIONS,
    [
      where('status', '==', 'active'),
      where('severity', 'in', ['critical', 'high']),
      orderBy('severity'),
      orderBy('probability', 'desc'),
      limit(10),
    ],
    cb,
  );
}
