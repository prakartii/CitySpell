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
  DepartmentDoc,
  DepartmentCreateInput,
  DepartmentUpdateInput,
  IssueCategory,
  UnsubscribeFn,
  DocCallback,
  CollectionCallback,
} from '../types/collections';

export async function createDepartment(
  data: DepartmentCreateInput,
  id?: string,
): Promise<string> {
  return createDocument(COLLECTIONS.DEPARTMENTS, data as Record<string, unknown>, id);
}

export async function getDepartment(id: string): Promise<DepartmentDoc | null> {
  return getDocument<DepartmentDoc>(COLLECTIONS.DEPARTMENTS, id);
}

export async function updateDepartment(
  id: string,
  data: DepartmentUpdateInput,
): Promise<void> {
  await updateDocument(COLLECTIONS.DEPARTMENTS, id, data as Record<string, unknown>);
}

export async function getAllDepartments(city?: string): Promise<DepartmentDoc[]> {
  const constraints = city
    ? [where('city', '==', city), orderBy('name', 'asc')]
    : [orderBy('name', 'asc')];
  return getDocuments<DepartmentDoc>(COLLECTIONS.DEPARTMENTS, constraints);
}

export async function getDepartmentsByCategory(
  category: IssueCategory,
): Promise<DepartmentDoc[]> {
  return getDocuments<DepartmentDoc>(COLLECTIONS.DEPARTMENTS, [
    where('handledCategories', 'array-contains', category),
    orderBy('performanceScore', 'desc'),
  ]);
}

export function subscribeToDepartment(
  id: string,
  cb: DocCallback<DepartmentDoc>,
): UnsubscribeFn {
  return subscribeToDocument<DepartmentDoc>(COLLECTIONS.DEPARTMENTS, id, cb);
}

export function subscribeToAllDepartments(
  city: string,
  cb: CollectionCallback<DepartmentDoc>,
): UnsubscribeFn {
  return subscribeToCollection<DepartmentDoc>(
    COLLECTIONS.DEPARTMENTS,
    [where('city', '==', city), orderBy('performanceScore', 'desc')],
    cb,
  );
}
