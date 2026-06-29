import {
  COLLECTIONS,
  createDocument,
  updateDocument,
  subscribeToCollection,
  Timestamp,
  where,
  orderBy,
  limit,
} from '../firebase/firestore';
import type { UnsubscribeFn } from '../types/collections';

export interface NotificationDoc {
  id: string;
  userId: string;
  issueId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
}

export async function createNotification(
  userId: string,
  issueId: string,
  status: string,
  department: string,
  note: string,
): Promise<string> {
  if (!userId || userId === 'anonymous') return '';

  let title = 'Issue Update';
  let message = 'Your report is being reviewed.';

  const s = status?.toLowerCase();
  if (s === 'assigned') {
    title = 'Issue Assigned to Dept';
    message = `Your report has been dispatched to ${department}. Note: ${note}`;
  } else if (s === 'in_progress' || s === 'in progress') {
    title = 'Work Commenced';
    message = `Crew deployed on site to resolve your report. Note: ${note}`;
  } else if (s === 'resolved') {
    title = 'Issue Resolved!';
    message = `Your report has been marked as Resolved. Thank you for reporting! Note: ${note}`;
  } else {
    title = `Issue Status: ${status}`;
    message = note || 'Officer updated your reported issue status.';
  }

  return createDocument(COLLECTIONS.NOTIFICATIONS, {
    userId,
    issueId,
    title,
    message,
    read: false,
  });
}

export function subscribeToUserNotifications(
  userId: string,
  cb: (notifications: NotificationDoc[]) => void,
): UnsubscribeFn {
  return subscribeToCollection<NotificationDoc>(
    COLLECTIONS.NOTIFICATIONS,
    [where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(20)],
    cb,
  );
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await updateDocument(COLLECTIONS.NOTIFICATIONS, notificationId, { read: true });
}

export async function markAllNotificationsAsRead(notificationIds: string[]): Promise<void> {
  await Promise.all(notificationIds.map((id) => markNotificationAsRead(id)));
}
