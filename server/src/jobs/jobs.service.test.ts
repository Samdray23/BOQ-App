import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockJobsFindById, mockJobsCreate } = vi.hoisted(() => ({
  mockJobsFindById: vi.fn(),
  mockJobsCreate: vi.fn(),
}));

vi.mock('./jobs.repository.js', () => ({
  jobsRepository: {
    findById: mockJobsFindById,
    create: mockJobsCreate,
  },
}));

import { jobsService } from './jobs.service.js';
import { ForbiddenError } from '../shared/errors.js';

const USER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const JOB_ID = '66666666-6666-6666-6666-666666666666';

describe('Jobs Ownership Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getJobStatus', () => {
    it('returns status when job belongs to the requesting user', async () => {
      mockJobsFindById.mockResolvedValue({
        id: JOB_ID,
        type: 'boq-generation',
        status: 'completed',
        progress: 100,
        error: null,
        payload: { userId: USER_A, boqId: 'some-id' },
      });

      const result = await jobsService.getJobStatus(JOB_ID, USER_A);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(JOB_ID);
    });

    it('throws ForbiddenError when job belongs to a different user', async () => {
      mockJobsFindById.mockResolvedValue({
        id: JOB_ID,
        type: 'boq-generation',
        status: 'completed',
        progress: 100,
        error: null,
        payload: { userId: USER_A, boqId: 'some-id' },
      });

      await expect(jobsService.getJobStatus(JOB_ID, USER_B)).rejects.toThrow(ForbiddenError);
    });

    it('returns null when job does not exist', async () => {
      mockJobsFindById.mockResolvedValue(null);

      const result = await jobsService.getJobStatus(JOB_ID, USER_A);
      expect(result).toBeNull();
    });
  });
});
