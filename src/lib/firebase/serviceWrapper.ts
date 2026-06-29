// FirebaseService — single entry point for Firebase Storage operations.
// Catches every failure and falls back to IndexedDB so the caller never sees an error.
// Components and hooks must use this module for uploads rather than calling storage.ts directly.

import { uploadIssueImages, uploadUserAvatar, type UploadProgressCallback } from './storage';
import { localStoreBlob } from './localDB';

// ── Health tracking ────────────────────────────────────────────────────────────

let _storageOnline = true;
let _firestoreOnline = true;

export function isStorageOnline(): boolean {
  return _storageOnline;
}

export function isFirestoreOnline(): boolean {
  return _firestoreOnline;
}

export function markFirestoreHealth(online: boolean): void {
  _firestoreOnline = online;
}

export type ServiceHealth = 'healthy' | 'degraded' | 'offline';

export function getServiceHealth(): ServiceHealth {
  if (_storageOnline && _firestoreOnline) return 'healthy';
  if (!_storageOnline && !_firestoreOnline) return 'offline';
  return 'degraded';
}

// ── Storage — Firebase first, IndexedDB blob fallback ─────────────────────────

/**
 * Uploads images for an issue report.
 * Returns Firebase Storage URLs on success, or persistent data URLs on failure.
 * Never throws — the report flow always continues.
 */
export async function uploadImages(
  issueId: string,
  files: File[],
  onProgress?: UploadProgressCallback,
): Promise<string[]> {
  try {
    const urls = await uploadIssueImages(issueId, files, onProgress);
    _storageOnline = true;
    return urls;
  } catch {
    _storageOnline = false;
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const key = `issue_${issueId}_img_${i}_${Date.now()}`;
      const dataUrl = await localStoreBlob(key, files[i]);
      urls.push(dataUrl);
      onProgress?.(Math.round(((i + 1) / files.length) * 100));
    }
    return urls;
  }
}

/**
 * Uploads a user avatar.
 * Returns a Firebase Storage URL on success, or a persistent data URL on failure.
 * Never throws.
 */
export async function uploadAvatar(
  uid: string,
  file: File,
  onProgress?: UploadProgressCallback,
): Promise<string> {
  try {
    const url = await uploadUserAvatar(uid, file, onProgress);
    _storageOnline = true;
    return url;
  } catch {
    _storageOnline = false;
    return localStoreBlob(`user_${uid}_avatar_${Date.now()}`, file);
  }
}

// ── Singleton export ───────────────────────────────────────────────────────────

export const firebaseService = {
  uploadImages,
  uploadAvatar,
  isStorageOnline,
  isFirestoreOnline,
  markFirestoreHealth,
  getServiceHealth,
} as const;
