import {
  COLLECTIONS,
  createDocument,
  getDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  subscribeToDocument,
  subscribeToCollection,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  where,
  orderBy,
  limit,
} from '../firebase/firestore';
import type {
  IssueDoc,
  IssueCreateInput,
  IssueUpdateInput,
  IssueStatus,
  IssueSeverity,
  IssueTimeline,
  UnsubscribeFn,
  DocCallback,
  CollectionCallback,
} from '../types/collections';
import { doc, updateDoc } from 'firebase/firestore';
import { db as firestoreDb } from '../firebase/config';

const PAGE_SIZE = 20;

export async function createIssue(data: IssueCreateInput): Promise<string> {
  return createDocument<IssueCreateInput>(COLLECTIONS.ISSUES, {
    ...data,
    upvotes: 0,
    upvotedBy: [],
    commentsCount: 0,
    timeline: [],
  } as unknown as IssueCreateInput);
}

export async function getIssue(issueId: string): Promise<IssueDoc | null> {
  return getDocument<IssueDoc>(COLLECTIONS.ISSUES, issueId);
}

export async function updateIssue(issueId: string, data: IssueUpdateInput): Promise<void> {
  await updateDocument<IssueUpdateInput>(COLLECTIONS.ISSUES, issueId, data);
}

export async function deleteIssue(issueId: string): Promise<void> {
  await deleteDocument(COLLECTIONS.ISSUES, issueId);
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getIssuesByWard(
  wardId: string,
  pageLimit = PAGE_SIZE,
): Promise<IssueDoc[]> {
  return getDocuments<IssueDoc>(COLLECTIONS.ISSUES, [
    where('location.wardId', '==', wardId),
    orderBy('reportedAt', 'desc'),
    limit(pageLimit),
  ]);
}

export async function getIssuesByStatus(
  status: IssueStatus,
  wardId?: string,
): Promise<IssueDoc[]> {
  const constraints = wardId
    ? [where('status', '==', status), where('location.wardId', '==', wardId), orderBy('reportedAt', 'desc')]
    : [where('status', '==', status), orderBy('reportedAt', 'desc')];
  return getDocuments<IssueDoc>(COLLECTIONS.ISSUES, constraints);
}

export async function getIssuesByUser(uid: string): Promise<IssueDoc[]> {
  return getDocuments<IssueDoc>(COLLECTIONS.ISSUES, [
    where('reportedBy', '==', uid),
    orderBy('reportedAt', 'desc'),
  ]);
}

export async function getIssuesBySeverity(
  severity: IssueSeverity,
  wardId?: string,
): Promise<IssueDoc[]> {
  const constraints = wardId
    ? [where('severity', '==', severity), where('location.wardId', '==', wardId), orderBy('reportedAt', 'desc')]
    : [where('severity', '==', severity), orderBy('reportedAt', 'desc')];
  return getDocuments<IssueDoc>(COLLECTIONS.ISSUES, constraints);
}

export async function getIssuesByDepartment(departmentId: string): Promise<IssueDoc[]> {
  return getDocuments<IssueDoc>(COLLECTIONS.ISSUES, [
    where('assignedTo', '==', departmentId),
    orderBy('reportedAt', 'desc'),
  ]);
}

// ─── Upvote ───────────────────────────────────────────────────────────────────

export async function toggleUpvote(issueId: string, uid: string, hasVoted: boolean): Promise<void> {
  const ref = doc(firestoreDb, COLLECTIONS.ISSUES, issueId);
  await updateDoc(ref, {
    upvotedBy: hasVoted ? arrayRemove(uid) : arrayUnion(uid),
    upvotes: increment(hasVoted ? -1 : 1),
    updatedAt: serverTimestamp(),
  });
}

// ─── Status transition with timeline ─────────────────────────────────────────

export async function updateIssueStatus(
  issueId: string,
  newStatus: IssueStatus,
  note: string,
  updatedBy: string,
): Promise<void> {
  const timelineEntry: Omit<IssueTimeline, 'timestamp'> & { timestamp: ReturnType<typeof serverTimestamp> } = {
    status: newStatus,
    note,
    updatedBy,
    timestamp: serverTimestamp() as ReturnType<typeof serverTimestamp>,
  };
  const ref = doc(firestoreDb, COLLECTIONS.ISSUES, issueId);
  await updateDoc(ref, {
    status: newStatus,
    timeline: arrayUnion(timelineEntry),
    updatedAt: serverTimestamp(),
    ...(newStatus === 'resolved' ? { resolvedAt: serverTimestamp() } : {}),
  });
}

// ─── Realtime subscriptions ───────────────────────────────────────────────────

export function subscribeToIssue(issueId: string, cb: DocCallback<IssueDoc>): UnsubscribeFn {
  return subscribeToDocument<IssueDoc>(COLLECTIONS.ISSUES, issueId, cb);
}

export function subscribeToWardIssues(
  wardId: string,
  cb: CollectionCallback<IssueDoc>,
): UnsubscribeFn {
  return subscribeToCollection<IssueDoc>(
    COLLECTIONS.ISSUES,
    [where('location.wardId', '==', wardId), orderBy('reportedAt', 'desc'), limit(50)],
    cb,
  );
}

export function subscribeToOpenIssues(
  wardId: string,
  cb: CollectionCallback<IssueDoc>,
): UnsubscribeFn {
  return subscribeToCollection<IssueDoc>(
    COLLECTIONS.ISSUES,
    [
      where('location.wardId', '==', wardId),
      where('status', 'in', ['open', 'assigned', 'in_progress']),
      orderBy('reportedAt', 'desc'),
    ],
    cb,
  );
}

export function subscribeToCriticalIssues(cb: CollectionCallback<IssueDoc>): UnsubscribeFn {
  return subscribeToCollection<IssueDoc>(
    COLLECTIONS.ISSUES,
    [where('severity', '==', 'critical'), where('status', '!=', 'resolved'), orderBy('status'), orderBy('reportedAt', 'desc'), limit(20)],
    cb,
  );
}

export function subscribeToUserIssues(uid: string, cb: CollectionCallback<IssueDoc>): UnsubscribeFn {
  return subscribeToCollection<IssueDoc>(
    COLLECTIONS.ISSUES,
    [where('reportedBy', '==', uid), orderBy('reportedAt', 'desc')],
    cb,
  );
}

export function subscribeToDepartmentIssues(
  departmentId: string,
  cb: CollectionCallback<IssueDoc>,
): UnsubscribeFn {
  return subscribeToCollection<IssueDoc>(
    COLLECTIONS.ISSUES,
    [where('assignedTo', '==', departmentId), orderBy('reportedAt', 'desc'), limit(50)],
    cb,
  );
}
