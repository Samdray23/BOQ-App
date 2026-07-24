import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockBoqFindByIdAndUser,
  mockBoqGetSections,
  mockBoqGetItemsBySection,
  mockConstructionStageFindAll,
} = vi.hoisted(() => ({
  mockBoqFindByIdAndUser: vi.fn(),
  mockBoqGetSections: vi.fn(),
  mockBoqGetItemsBySection: vi.fn(),
  mockConstructionStageFindAll: vi.fn(),
}));

vi.mock('../boq/boq.repository.js', () => ({
  boqRepository: {
    findByIdAndUser: mockBoqFindByIdAndUser,
    getSections: mockBoqGetSections,
    getItemsBySection: mockBoqGetItemsBySection,
  },
}));

vi.mock('./construction-stage.repository.js', () => ({
  constructionStageRepository: {
    findAll: mockConstructionStageFindAll,
  },
}));

import { constructionStageService } from './construction-stage.service.js';
import { NotFoundError } from '../shared/errors.js';

const USER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const BOQ_ID = '22222222-2222-2222-2222-222222222222';

const mockStages = [
  { id: 'stage-a', code: 'A', name: 'Preliminaries', display_order: 1 },
];

describe('Construction Stage Ownership Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStageSummary', () => {
    it('allows access when user owns the BOQ', async () => {
      mockBoqFindByIdAndUser.mockResolvedValue({ id: BOQ_ID, user_id: USER_A });
      mockConstructionStageFindAll.mockResolvedValue(mockStages);
      mockBoqGetItemsBySection.mockResolvedValue([]);
      mockBoqGetSections.mockResolvedValue([]);

      const result = await constructionStageService.getStageSummary(USER_A, BOQ_ID, 'stage-a');
      expect(result).toBeDefined();
      expect(mockBoqFindByIdAndUser).toHaveBeenCalledWith(BOQ_ID, USER_A);
    });

    it('throws NotFoundError when user does not own the BOQ', async () => {
      mockBoqFindByIdAndUser.mockResolvedValue(null);

      await expect(
        constructionStageService.getStageSummary(USER_B, BOQ_ID, 'stage-a')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getBoqStageBreakdown', () => {
    it('allows access when user owns the BOQ', async () => {
      mockBoqFindByIdAndUser.mockResolvedValue({ id: BOQ_ID, user_id: USER_A });
      mockConstructionStageFindAll.mockResolvedValue(mockStages);
      mockBoqGetItemsBySection.mockResolvedValue([]);
      mockBoqGetSections.mockResolvedValue([]);

      const result = await constructionStageService.getBoqStageBreakdown(USER_A, BOQ_ID);
      expect(result).toBeDefined();
    });

    it('throws NotFoundError when user does not own the BOQ', async () => {
      mockBoqFindByIdAndUser.mockResolvedValue(null);

      await expect(
        constructionStageService.getBoqStageBreakdown(USER_B, BOQ_ID)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
