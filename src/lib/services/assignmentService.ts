import {
  COLLECTIONS,
  createDocument,
  getDocument,
  getDocuments,
  updateDocument,
  subscribeToDocument,
  subscribeToCollection,
  serverTimestamp,
  arrayUnion,
  where,
  orderBy,
  limit,
} from '../firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type {
  AssignmentDoc,
  AssignmentCreateInput,
  AssignmentUpdateInput,
  AssignmentStatus,
  AssignmentUpdate,
  UnsubscribeFn,
  DocCallback,
  CollectionCallback,
} from '../types/collections';

export async function createAssignment(data: AssignmentCreateInput): Promise<string> {
  return createDocument(COLLECTIONS.ASSIGNMENTS, {
    ...data,
    updates: [],
  } as unknown as Record<string, unknown>);
}

export async function getAssignment(id: string): Promise<AssignmentDoc | null> {
  return getDocument<AssignmentDoc>(COLLECTIONS.ASSIGNMENTS, id);
}

export async function updateAssignment(
  id: string,
  data: AssignmentUpdateInput,
): Promise<void> {
  await updateDocument(COLLECTIONS.ASSIGNMENTS, id, data as Record<string, unknown>);
}

export async function updateAssignmentStatus(
  id: string,
  newStatus: AssignmentStatus,
  note: string,
  by: string,
): Promise<void> {
  const update: Omit<AssignmentUpdate, 'at'> & { at: ReturnType<typeof serverTimestamp> } = {
    status: newStatus,
    note,
    by,
    at: serverTimestamp() as ReturnType<typeof serverTimestamp>,
  };
  const ref = doc(db, COLLECTIONS.ASSIGNMENTS, id);
  await updateDoc(ref, {
    status: newStatus,
    updates: arrayUnion(update),
    updatedAt: serverTimestamp(),
    ...(newStatus === 'completed' ? { completedAt: serverTimestamp() } : {}),
  });
}

export async function getAssignmentsByIssue(issueId: string): Promise<AssignmentDoc[]> {
  return getDocuments<AssignmentDoc>(COLLECTIONS.ASSIGNMENTS, [
    where('issueId', '==', issueId),
    orderBy('createdAt', 'desc'),
  ]);
}

export async function getAssignmentsByDepartment(
  departmentId: string,
  status?: AssignmentStatus,
): Promise<AssignmentDoc[]> {
  const constraints = status
    ? [
        where('departmentId', '==', departmentId),
        where('status', '==', status),
        orderBy('dueDate', 'asc'),
      ]
    : [where('departmentId', '==', departmentId), orderBy('dueDate', 'asc')];
  return getDocuments<AssignmentDoc>(COLLECTIONS.ASSIGNMENTS, constraints);
}

export async function getOverdueAssignments(): Promise<AssignmentDoc[]> {
  return getDocuments<AssignmentDoc>(COLLECTIONS.ASSIGNMENTS, [
    where('status', 'in', ['pending', 'accepted', 'in_progress']),
    where('dueDate', '<', new Date()),
    orderBy('dueDate', 'asc'),
  ]);
}

export function subscribeToAssignment(
  id: string,
  cb: DocCallback<AssignmentDoc>,
): UnsubscribeFn {
  return subscribeToDocument<AssignmentDoc>(COLLECTIONS.ASSIGNMENTS, id, cb);
}

export function subscribeToIssueAssignments(
  issueId: string,
  cb: CollectionCallback<AssignmentDoc>,
): UnsubscribeFn {
  return subscribeToCollection<AssignmentDoc>(
    COLLECTIONS.ASSIGNMENTS,
    [where('issueId', '==', issueId), orderBy('createdAt', 'desc')],
    cb,
  );
}

export function subscribeToDepartmentAssignments(
  departmentId: string,
  cb: CollectionCallback<AssignmentDoc>,
): UnsubscribeFn {
  return subscribeToCollection<AssignmentDoc>(
    COLLECTIONS.ASSIGNMENTS,
    [
      where('departmentId', '==', departmentId),
      where('status', 'in', ['pending', 'accepted', 'in_progress']),
      orderBy('dueDate', 'asc'),
      limit(30),
    ],
    cb,
  );
}
