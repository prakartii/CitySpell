"use client";

import { useState, useEffect, useCallback } from "react";
import {
  subscribeToUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificationDoc
} from "../services/notificationService";

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToUserNotifications(userId, (list) => {
      setNotifications(list);
      setLoading(false);
    });

    return unsub;
  }, [userId]);

  const markRead = useCallback(async (id: string) => {
    await markNotificationAsRead(id);
  }, []);

  const markAllRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (userId && unreadIds.length > 0) {
      await markAllNotificationsAsRead(unreadIds);
    }
  }, [userId, notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, loading, markRead, markAllRead };
}
