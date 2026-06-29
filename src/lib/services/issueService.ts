import {
  COLLECTIONS,
  createDocument,
  getDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  subscribeToDocument,
  subscribeToCollection,
  rawUpdateDocument,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
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

const PAGE_SIZE = 20;

export async function createIssue(data: any): Promise<string> {
  const docId = data.id || `issue_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  await createDocument(COLLECTIONS.ISSUES, {
    id: docId,
    ...data,
    upvotes: data.upvotes ?? 0,
    upvotedBy: data.upvotedBy ?? [],
    commentsCount: data.commentsCount ?? 0,
    timeline: data.timeline ?? [],
  }, docId);
  return docId;
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
  await rawUpdateDocument(COLLECTIONS.ISSUES, issueId, {
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
  const timelineEntry = {
    status: newStatus,
    note,
    updatedBy,
    timestamp: serverTimestamp(),
  };
  await rawUpdateDocument(COLLECTIONS.ISSUES, issueId, {
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

export async function addComment(
  issueId: string,
  userId: string,
  userName: string,
  text: string,
): Promise<void> {
  const comment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId,
    userName,
    text,
    createdAt: Timestamp.now(),
  };
  await rawUpdateDocument(COLLECTIONS.ISSUES, issueId, {
    comments: arrayUnion(comment),
    commentsCount: increment(1),
  });
}

export function subscribeToAllIssues(cb: CollectionCallback<IssueDoc>): UnsubscribeFn {
  return subscribeToCollection<IssueDoc>(
    COLLECTIONS.ISSUES,
    [orderBy('reportedAt', 'desc'), limit(100)],
    cb,
  );
}
