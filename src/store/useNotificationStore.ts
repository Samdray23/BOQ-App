import { create } from 'zustand';

interface NotificationState {
  notifications: {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
  }[];
  unreadCount: number;
  addNotification: (n: { title: string; message: string; type: string }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (n) =>
    set((s) => {
      const newN = {
        id: crypto.randomUUID(),
        ...n,
        read: false,
        createdAt: new Date().toISOString(),
      };
      return { notifications: [newN, ...s.notifications], unreadCount: s.unreadCount + 1 };
    }),
  markRead: (id) =>
    set((s) => {
      const notifs = s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return { notifications: notifs, unreadCount: notifs.filter((n) => !n.read).length };
    }),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));
