import {
  COLLECTIONS,
  createDocument,
  getDocument,
  getDocuments,
  updateDocument,
  subscribeToDocument,
  subscribeToCollection,
  arrayUnion,
  serverTimestamp,
  where,
  orderBy,
  limit,
} from '../firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type {
  CopilotReportDoc,
  CopilotReportCreateInput,
  CopilotReportUpdateInput,
  ReportType,
  UnsubscribeFn,
  DocCallback,
  CollectionCallback,
} from '../types/collections';

export async function createCopilotReport(data: CopilotReportCreateInput): Promise<string> {
  return createDocument(COLLECTIONS.COPILOT_REPORTS, {
    ...data,
    readBy: [],
  } as unknown as Record<string, unknown>);
}

export async function getCopilotReport(id: string): Promise<CopilotReportDoc | null> {
  return getDocument<CopilotReportDoc>(COLLECTIONS.COPILOT_REPORTS, id);
}

export async function updateCopilotReport(
  id: string,
  data: CopilotReportUpdateInput,
): Promise<void> {
  await updateDocument(
    COLLECTIONS.COPILOT_REPORTS,
    id,
    data as Record<string, unknown>,
  );
}

export async function markReportRead(id: string, uid: string): Promise<void> {
  const ref = doc(db, COLLECTIONS.COPILOT_REPORTS, id);
  await updateDoc(ref, { readBy: arrayUnion(uid), updatedAt: serverTimestamp() });
}

export async function getReportsByWard(
  wardId: string,
  pageLimit = 20,
): Promise<CopilotReportDoc[]> {
  return getDocuments<CopilotReportDoc>(COLLECTIONS.COPILOT_REPORTS, [
    where('wardId', '==', wardId),
    where('status', '==', 'published'),
    orderBy('generatedAt', 'desc'),
    limit(pageLimit),
  ]);
}

export async function getReportsByType(type: ReportType): Promise<CopilotReportDoc[]> {
  return getDocuments<CopilotReportDoc>(COLLECTIONS.COPILOT_REPORTS, [
    where('type', '==', type),
    where('status', '==', 'published'),
    orderBy('generatedAt', 'desc'),
    limit(20),
  ]);
}

export async function getHighPriorityReports(): Promise<CopilotReportDoc[]> {
  return getDocuments<CopilotReportDoc>(COLLECTIONS.COPILOT_REPORTS, [
    where('priority', '==', 'high'),
    where('status', '==', 'published'),
    orderBy('generatedAt', 'desc'),
    limit(10),
  ]);
}

export function subscribeToCopilotReport(
  id: string,
  cb: DocCallback<CopilotReportDoc>,
): UnsubscribeFn {
  return subscribeToDocument<CopilotReportDoc>(COLLECTIONS.COPILOT_REPORTS, id, cb);
}

export function subscribeToLatestReports(
  cb: CollectionCallback<CopilotReportDoc>,
  pageLimit = 20,
): UnsubscribeFn {
  return subscribeToCollection<CopilotReportDoc>(
    COLLECTIONS.COPILOT_REPORTS,
    [
      where('status', '==', 'published'),
      orderBy('generatedAt', 'desc'),
      limit(pageLimit),
    ],
    cb,
  );
}

export function subscribeToWardReports(
  wardId: string,
  cb: CollectionCallback<CopilotReportDoc>,
): UnsubscribeFn {
  return subscribeToCollection<CopilotReportDoc>(
    COLLECTIONS.COPILOT_REPORTS,
    [
      where('wardId', '==', wardId),
      where('status', '==', 'published'),
      orderBy('generatedAt', 'desc'),
      limit(10),
    ],
    cb,
  );
}
