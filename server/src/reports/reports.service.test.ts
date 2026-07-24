import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockProjectsFindByIdAndUser,
  mockReportsFindByProject,
  mockReportsFindById,
  mockReportsCreate,
} = vi.hoisted(() => ({
  mockProjectsFindByIdAndUser: vi.fn(),
  mockReportsFindByProject: vi.fn(),
  mockReportsFindById: vi.fn(),
  mockReportsCreate: vi.fn(),
}));

vi.mock('../projects/projects.repository.js', () => ({
  projectsRepository: {
    findByIdAndUser: mockProjectsFindByIdAndUser,
  },
}));

vi.mock('./reports.repository.js', () => ({
  reportsRepository: {
    findByProject: mockReportsFindByProject,
    findById: mockReportsFindById,
    create: mockReportsCreate,
  },
}));

vi.mock('../storage/storage.service.js', () => ({
  storageService: {
    upload: vi.fn().mockResolvedValue({ key: 'test-key' }),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../utils/pdf.js', () => ({
  createPdfDocument: vi.fn(),
  addPdfSection: vi.fn(),
  addPdfSummary: vi.fn(),
  addPdfFooter: vi.fn(),
  streamPdf: vi.fn(),
}));

vi.mock('../utils/excel.js', () => ({
  createExcelWorkbook: vi.fn(),
  streamExcel: vi.fn(),
}));

vi.mock('../jobs/jobs.service.js', () => ({
  jobsService: {
    createJob: vi.fn().mockResolvedValue({ id: 'job-1' }),
  },
}));

import { reportsService } from './reports.service.js';
import { NotFoundError, ForbiddenError } from '../shared/errors.js';

const USER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const PROJECT_ID = '11111111-1111-1111-1111-111111111111';
const REPORT_ID = '44444444-4444-4444-4444-444444444444';

const mockProjectA = { id: PROJECT_ID, user_id: USER_A };
const mockReportA = {
  id: REPORT_ID,
  project_id: PROJECT_ID,
  user_id: USER_A,
  title: 'Cost Report',
  type: 'cost_estimate',
  format: 'pdf',
  status: 'complete',
};

describe('Reports Ownership Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getByProject', () => {
    it('returns reports when user owns the project', async () => {
      mockProjectsFindByIdAndUser.mockResolvedValue(mockProjectA);
      mockReportsFindByProject.mockResolvedValue([mockReportA]);

      const result = await reportsService.getByProject(USER_A, PROJECT_ID);
      expect(result).toHaveLength(1);
      expect(mockProjectsFindByIdAndUser).toHaveBeenCalledWith(PROJECT_ID, USER_A);
    });

    it('throws NotFoundError when user does not own the project', async () => {
      mockProjectsFindByIdAndUser.mockResolvedValue(null);

      await expect(reportsService.getByProject(USER_B, PROJECT_ID)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getById', () => {
    it('returns report when user owns the parent project', async () => {
      mockReportsFindById.mockResolvedValue(mockReportA);
      mockProjectsFindByIdAndUser.mockResolvedValue(mockProjectA);

      const result = await reportsService.getById(USER_A, REPORT_ID);
      expect(result.id).toBe(REPORT_ID);
    });

    it('throws ForbiddenError when user does not own the parent project', async () => {
      mockReportsFindById.mockResolvedValue(mockReportA);
      mockProjectsFindByIdAndUser.mockResolvedValue(null);

      await expect(reportsService.getById(USER_B, REPORT_ID)).rejects.toThrow(ForbiddenError);
    });

    it('throws NotFoundError when report does not exist', async () => {
      mockReportsFindById.mockResolvedValue(null);

      await expect(reportsService.getById(USER_A, 'nonexistent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('generate', () => {
    it('allows generation when user owns the project', async () => {
      mockProjectsFindByIdAndUser.mockResolvedValue(mockProjectA);
      mockReportsCreate.mockResolvedValue({ id: REPORT_ID });

      const result = await reportsService.generate({
        projectId: PROJECT_ID,
        userId: USER_A,
        type: 'executive_summary',
        format: 'pdf',
      });
      expect(result.id).toBe(REPORT_ID);
    });

    it('throws NotFoundError when user does not own the project', async () => {
      mockProjectsFindByIdAndUser.mockResolvedValue(null);

      await expect(reportsService.generate({
        projectId: PROJECT_ID,
        userId: USER_B,
        type: 'executive_summary',
        format: 'pdf',
      })).rejects.toThrow(NotFoundError);
    });
  });
});
