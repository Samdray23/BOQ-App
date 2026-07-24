import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFindByIdAndUser, mockFindByUser, mockCountByUser, mockUpdate, mockDelete, mockCreate } = vi.hoisted(() => ({
  mockFindByIdAndUser: vi.fn(),
  mockFindByUser: vi.fn(),
  mockCountByUser: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock('./projects.repository.js', () => ({
  projectsRepository: {
    findById: vi.fn(),
    findByIdAndUser: mockFindByIdAndUser,
    findByUser: mockFindByUser,
    countByUser: mockCountByUser,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  },
}));

import { projectsService } from './projects.service.js';
import { NotFoundError } from '../shared/errors.js';

const USER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const PROJECT_ID = '11111111-1111-1111-1111-111111111111';

const mockProjectA = {
  id: PROJECT_ID,
  user_id: USER_A,
  name: 'User A Project',
  client: 'Client A',
  type: 'residential',
  currency: 'NGN',
  status: 'draft',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

describe('Projects Ownership Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getById', () => {
    it('returns project when user owns it', async () => {
      mockFindByIdAndUser.mockResolvedValue(mockProjectA);

      const result = await projectsService.getById(USER_A, PROJECT_ID);
      expect(result.id).toBe(PROJECT_ID);
      expect(mockFindByIdAndUser).toHaveBeenCalledWith(PROJECT_ID, USER_A);
    });

    it('throws NotFoundError when user does not own the project', async () => {
      mockFindByIdAndUser.mockResolvedValue(null);

      await expect(projectsService.getById(USER_B, PROJECT_ID)).rejects.toThrow(NotFoundError);
      expect(mockFindByIdAndUser).toHaveBeenCalledWith(PROJECT_ID, USER_B);
    });
  });

  describe('update', () => {
    it('allows update when user owns the project', async () => {
      mockFindByIdAndUser.mockResolvedValue(mockProjectA);
      mockUpdate.mockResolvedValue({ ...mockProjectA, name: 'Updated' });

      const result = await projectsService.update(USER_A, PROJECT_ID, { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('throws NotFoundError when non-owner tries to update', async () => {
      mockFindByIdAndUser.mockResolvedValue(null);

      await expect(projectsService.update(USER_B, PROJECT_ID, { name: 'Hacked' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('allows delete when user owns the project', async () => {
      mockFindByIdAndUser.mockResolvedValue(mockProjectA);
      mockDelete.mockResolvedValue(undefined);

      await expect(projectsService.delete(USER_A, PROJECT_ID)).resolves.toBeUndefined();
    });

    it('throws NotFoundError when non-owner tries to delete', async () => {
      mockFindByIdAndUser.mockResolvedValue(null);

      await expect(projectsService.delete(USER_B, PROJECT_ID)).rejects.toThrow(NotFoundError);
    });
  });

  describe('list', () => {
    it('only returns projects belonging to the requesting user', async () => {
      mockFindByUser.mockResolvedValue([mockProjectA]);
      mockCountByUser.mockResolvedValue(1);

      const result = await projectsService.list(USER_A, {});
      expect(mockFindByUser).toHaveBeenCalledWith(USER_A, expect.any(Number), expect.any(Number));
      expect(result.projects).toHaveLength(1);
      expect(result.projects[0].user_id).toBe(USER_A);
    });
  });
});
