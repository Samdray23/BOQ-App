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
  notifications: [
    {
      id: 'n1',
      title: 'BOQ Generated',
      message: 'Luxury Villa BOQ is ready',
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'n2',
      title: 'New Team Member',
      message: 'Chidi joined Greenfield Estate',
      type: 'info',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  unreadCount: 2,
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
