import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockMarkAsRead,
  mockDelete,
  mockFindByUser,
  mockCountUnread,
  mockCreate,
  mockMarkAllAsRead,
} = vi.hoisted(() => ({
  mockMarkAsRead: vi.fn(),
  mockDelete: vi.fn(),
  mockFindByUser: vi.fn(),
  mockCountUnread: vi.fn(),
  mockCreate: vi.fn(),
  mockMarkAllAsRead: vi.fn(),
}));

vi.mock('./notifications.repository.js', () => ({
  notificationsRepository: {
    markAsRead: mockMarkAsRead,
    delete: mockDelete,
    findByUser: mockFindByUser,
    countUnread: mockCountUnread,
    create: mockCreate,
    markAllAsRead: mockMarkAllAsRead,
  },
}));

vi.mock('../shared/utils.js', () => ({
  parsePagination: vi.fn((params: { page?: string; limit?: string }) => ({
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 20,
    offset: ((Number(params.page) || 1) - 1) * (Number(params.limit) || 20),
  })),
}));

import { notificationsService } from './notifications.service.js';

const USER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const NOTIF_ID = '55555555-5555-5555-5555-555555555555';

describe('Notifications Ownership Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('markAsRead', () => {
    it('passes userId to repository for ownership enforcement', async () => {
      mockMarkAsRead.mockResolvedValue(undefined);

      await notificationsService.markAsRead(USER_A, NOTIF_ID);
      expect(mockMarkAsRead).toHaveBeenCalledWith(NOTIF_ID, USER_A);
    });

    it('uses the correct userId for User B', async () => {
      mockMarkAsRead.mockResolvedValue(undefined);

      await notificationsService.markAsRead(USER_B, NOTIF_ID);
      expect(mockMarkAsRead).toHaveBeenCalledWith(NOTIF_ID, USER_B);
    });
  });

  describe('delete', () => {
    it('passes userId to repository for ownership enforcement', async () => {
      mockDelete.mockResolvedValue(undefined);

      await notificationsService.delete(USER_A, NOTIF_ID);
      expect(mockDelete).toHaveBeenCalledWith(NOTIF_ID, USER_A);
    });

    it('uses the correct userId for User B', async () => {
      mockDelete.mockResolvedValue(undefined);

      await notificationsService.delete(USER_B, NOTIF_ID);
      expect(mockDelete).toHaveBeenCalledWith(NOTIF_ID, USER_B);
    });
  });

  describe('list', () => {
    it('only returns notifications belonging to the requesting user', async () => {
      mockFindByUser.mockResolvedValue([]);
      mockCountUnread.mockResolvedValue(0);

      await notificationsService.list(USER_A, {});
      expect(mockFindByUser).toHaveBeenCalledWith(USER_A, expect.any(Number), expect.any(Number));
      expect(mockCountUnread).toHaveBeenCalledWith(USER_A);
    });
  });
});
