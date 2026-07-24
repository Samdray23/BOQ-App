import { notificationsRepository } from './notifications.repository.js';
import { parsePagination } from '../shared/utils.js';
import type { NotificationType, NotificationCategory } from './notifications.types.js';

export const notificationsService = {
  async list(userId: string, queryParams: { page?: string; limit?: string }) {
    const { page, limit, offset } = parsePagination(queryParams);
    const [notifications, total, unreadCount] = await Promise.all([
      notificationsRepository.findByUser(userId, limit, offset),
      notificationsRepository.countUnread(userId),
      notificationsRepository.countUnread(userId),
    ]);
    return { notifications, total, page, limit, unreadCount };
  },

  async create(input: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    category?: NotificationCategory;
    link?: string;
  }) {
    return notificationsRepository.create(input);
  },

  async markAsRead(userId: string, notificationId: string) {
    await notificationsRepository.markAsRead(notificationId, userId);
  },

  async markAllAsRead(userId: string) {
    await notificationsRepository.markAllAsRead(userId);
  },

  async delete(userId: string, notificationId: string) {
    await notificationsRepository.delete(notificationId, userId);
  },
};
