import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockProjectsFindByIdAndUser,
  mockDrawingsFindByProject,
  mockDrawingsFindById,
  mockDrawingsDelete,
  mockDrawingsCreate,
  mockDrawingsFindLatestVersion,
  mockDrawingsUpdateStatus,
} = vi.hoisted(() => ({
  mockProjectsFindByIdAndUser: vi.fn(),
  mockDrawingsFindByProject: vi.fn(),
  mockDrawingsFindById: vi.fn(),
  mockDrawingsDelete: vi.fn(),
  mockDrawingsCreate: vi.fn(),
  mockDrawingsFindLatestVersion: vi.fn(),
  mockDrawingsUpdateStatus: vi.fn(),
}));

vi.mock('../projects/projects.repository.js', () => ({
  projectsRepository: {
    findByIdAndUser: mockProjectsFindByIdAndUser,
  },
}));

vi.mock('./drawings.repository.js', () => ({
  drawingsRepository: {
    findByProject: mockDrawingsFindByProject,
    findById: mockDrawingsFindById,
    create: mockDrawingsCreate,
    delete: mockDrawingsDelete,
    findLatestVersion: mockDrawingsFindLatestVersion,
    updateStatus: mockDrawingsUpdateStatus,
  },
}));

vi.mock('../storage/storage.service.js', () => ({
  storageService: {
    upload: vi.fn().mockResolvedValue({ key: 'test-key' }),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../config/index.js', () => ({
  env: { STORAGE_PROVIDER: 'local' },
}));

import { drawingsService } from './drawings.service.js';
import { NotFoundError, ForbiddenError } from '../shared/errors.js';

const USER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const PROJECT_ID = '11111111-1111-1111-1111-111111111111';
const DRAWING_ID = '33333333-3333-3333-3333-333333333333';

const mockProjectA = { id: PROJECT_ID, user_id: USER_A };
const mockDrawingA = {
  id: DRAWING_ID,
  project_id: PROJECT_ID,
  user_id: USER_A,
  filename: 'drawing.pdf',
  storage_key: 'test-key',
};

describe('Drawings Ownership Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getByProject', () => {
    it('returns drawings when user owns the project', async () => {
      mockProjectsFindByIdAndUser.mockResolvedValue(mockProjectA);
      mockDrawingsFindByProject.mockResolvedValue([mockDrawingA]);

      const result = await drawingsService.getByProject(USER_A, PROJECT_ID);
      expect(result).toHaveLength(1);
      expect(mockProjectsFindByIdAndUser).toHaveBeenCalledWith(PROJECT_ID, USER_A);
    });

    it('throws NotFoundError when user does not own the project', async () => {
      mockProjectsFindByIdAndUser.mockResolvedValue(null);

      await expect(drawingsService.getByProject(USER_B, PROJECT_ID)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getById', () => {
    it('returns drawing when user owns the parent project', async () => {
      mockDrawingsFindById.mockResolvedValue(mockDrawingA);
      mockProjectsFindByIdAndUser.mockResolvedValue(mockProjectA);

      const result = await drawingsService.getById(USER_A, DRAWING_ID);
      expect(result.id).toBe(DRAWING_ID);
    });

    it('throws ForbiddenError when user does not own the parent project', async () => {
      mockDrawingsFindById.mockResolvedValue(mockDrawingA);
      mockProjectsFindByIdAndUser.mockResolvedValue(null);

      await expect(drawingsService.getById(USER_B, DRAWING_ID)).rejects.toThrow(ForbiddenError);
    });

    it('throws NotFoundError when drawing does not exist', async () => {
      mockDrawingsFindById.mockResolvedValue(null);

      await expect(drawingsService.getById(USER_A, 'nonexistent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('allows delete when user owns the parent project', async () => {
      mockDrawingsFindById.mockResolvedValue(mockDrawingA);
      mockProjectsFindByIdAndUser.mockResolvedValue(mockProjectA);
      mockDrawingsDelete.mockResolvedValue(undefined);

      await expect(drawingsService.delete(USER_A, DRAWING_ID)).resolves.toBeUndefined();
    });

    it('throws ForbiddenError when non-owner tries to delete', async () => {
      mockDrawingsFindById.mockResolvedValue(mockDrawingA);
      mockProjectsFindByIdAndUser.mockResolvedValue(null);

      await expect(drawingsService.delete(USER_B, DRAWING_ID)).rejects.toThrow(ForbiddenError);
    });
  });
});
