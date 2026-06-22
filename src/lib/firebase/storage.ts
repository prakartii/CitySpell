import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type UploadTask,
  type StorageReference,
} from 'firebase/storage';
import { storage } from './config';

export type UploadProgressCallback = (progress: number) => void;

export interface UploadResult {
  downloadURL: string;
  storagePath: string;
}

// ─── Path builders ────────────────────────────────────────────────────────────

export const storagePaths = {
  issueImage: (issueId: string, fileName: string) =>
    `issues/${issueId}/${fileName}`,
  userAvatar: (uid: string, fileName: string) =>
    `users/${uid}/avatar/${fileName}`,
  reportAttachment: (reportId: string, fileName: string) =>
    `copilot_reports/${reportId}/${fileName}`,
  wardAsset: (wardId: string, fileName: string) =>
    `wards/${wardId}/${fileName}`,
} as const;

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadFile(
  path: string,
  file: File,
  onProgress?: UploadProgressCallback,
): Promise<UploadResult> {
  const storageRef: StorageReference = ref(storage, path);
  const task: UploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
    customMetadata: { originalName: file.name },
  });

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(pct));
      },
      reject,
      async () => {
        const downloadURL = await getDownloadURL(task.snapshot.ref);
        resolve({ downloadURL, storagePath: path });
      },
    );
  });
}

export async function uploadIssueImages(
  issueId: string,
  files: File[],
  onProgress?: UploadProgressCallback,
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = storagePaths.issueImage(issueId, `${Date.now()}_${file.name}`);
    const result = await uploadFile(path, file, (p) => {
      // aggregate progress across files
      const overall = ((i / files.length) + p / 100 / files.length) * 100;
      onProgress?.(Math.round(overall));
    });
    urls.push(result.downloadURL);
  }
  return urls;
}

export async function uploadUserAvatar(
  uid: string,
  file: File,
  onProgress?: UploadProgressCallback,
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = storagePaths.userAvatar(uid, `avatar.${ext}`);
  const result = await uploadFile(path, file, onProgress);
  return result.downloadURL;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteFile(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}

export async function deleteIssueImages(issueId: string): Promise<void> {
  const folderRef = ref(storage, `issues/${issueId}`);
  const list = await listAll(folderRef);
  await Promise.all(list.items.map((item) => deleteObject(item)));
}

// ─── URL helpers ──────────────────────────────────────────────────────────────

export async function getFileURL(storagePath: string): Promise<string> {
  return getDownloadURL(ref(storage, storagePath));
}
