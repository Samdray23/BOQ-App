import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockFindByIdAndUser,
  mockFindByProjectForUser,
  mockCreateSection,
  mockCreateItem,
  mockGetSections,
  mockGetItemsBySection,
} = vi.hoisted(() => ({
  mockFindByIdAndUser: vi.fn(),
  mockFindByProjectForUser: vi.fn(),
  mockCreateSection: vi.fn(),
  mockCreateItem: vi.fn(),
  mockGetSections: vi.fn(),
  mockGetItemsBySection: vi.fn(),
}));

vi.mock('./boq.repository.js', () => ({
  boqRepository: {
    findById: vi.fn(),
    findByIdAndUser: mockFindByIdAndUser,
    findByProject: vi.fn(),
    findByProjectForUser: mockFindByProjectForUser,
    create: vi.fn(),
    createSection: mockCreateSection,
    createItem: mockCreateItem,
    getSections: mockGetSections,
    getItems: vi.fn().mockResolvedValue([]),
    getItemsBySection: mockGetItemsBySection,
    updateStatus: vi.fn(),
  },
}));

vi.mock('../construction-stage/construction-stage.repository.js', () => ({
  constructionStageRepository: {
    findAll: vi.fn().mockResolvedValue([
      { id: 'stage-a', code: 'A', name: 'Preliminaries', display_order: 1 },
    ]),
  },
}));

vi.mock('../pricing/pricing.service.js', () => ({
  pricingService: {
    getRate: vi.fn().mockResolvedValue(100),
  },
}));

import { boqService } from './boq.service.js';
import { NotFoundError } from '../shared/errors.js';

const USER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const BOQ_ID = '22222222-2222-2222-2222-222222222222';
const PROJECT_ID = '11111111-1111-1111-1111-111111111111';

const mockBoqA = {
  id: BOQ_ID,
  project_id: PROJECT_ID,
  user_id: USER_A,
  title: 'User A BOQ',
  version: 1,
  status: 'complete',
};

describe('BOQ Ownership Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getById', () => {
    it('returns BOQ when user owns it', async () => {
      mockFindByIdAndUser.mockResolvedValue(mockBoqA);
      mockGetSections.mockResolvedValue([]);

      const result = await boqService.getById(USER_A, BOQ_ID);
      expect(result.boq.id).toBe(BOQ_ID);
      expect(mockFindByIdAndUser).toHaveBeenCalledWith(BOQ_ID, USER_A);
    });

    it('throws NotFoundError when user does not own the BOQ', async () => {
      mockFindByIdAndUser.mockResolvedValue(null);

      await expect(boqService.getById(USER_B, BOQ_ID)).rejects.toThrow(NotFoundError);
      expect(mockFindByIdAndUser).toHaveBeenCalledWith(BOQ_ID, USER_B);
    });
  });

  describe('getByProject', () => {
    it('uses ownership-scoped query', async () => {
      mockFindByProjectForUser.mockResolvedValue([mockBoqA]);

      const result = await boqService.getByProject(USER_A, PROJECT_ID);
      expect(mockFindByProjectForUser).toHaveBeenCalledWith(PROJECT_ID, USER_A);
      expect(result).toHaveLength(1);
    });

    it('queries with the correct user for User B', async () => {
      mockFindByProjectForUser.mockResolvedValue([]);

      await boqService.getByProject(USER_B, PROJECT_ID);
      expect(mockFindByProjectForUser).toHaveBeenCalledWith(PROJECT_ID, USER_B);
    });
  });

  describe('addSection', () => {
    it('allows adding section when user owns the BOQ', async () => {
      mockFindByIdAndUser.mockResolvedValue(mockBoqA);
      mockCreateSection.mockResolvedValue({ id: 'sec-1', boq_id: BOQ_ID });

      const result = await boqService.addSection(USER_A, BOQ_ID, 'A');
      expect(result.id).toBe('sec-1');
    });

    it('throws NotFoundError when non-owner tries to add section', async () => {
      mockFindByIdAndUser.mockResolvedValue(null);

      await expect(boqService.addSection(USER_B, BOQ_ID, 'A')).rejects.toThrow(NotFoundError);
    });
  });

  describe('addItem', () => {
    it('allows adding item when user owns the BOQ', async () => {
      mockFindByIdAndUser.mockResolvedValue(mockBoqA);
      mockGetSections.mockResolvedValue([
        { id: 'sec-1', boq_id: BOQ_ID, stage_id: 'stage-a' },
      ]);
      mockGetItemsBySection.mockResolvedValue([]);
      mockCreateItem.mockResolvedValue({ id: 'item-1' });

      const result = await boqService.addItem(USER_A, BOQ_ID, 'sec-1', {
        itemCode: 'A.1',
        description: 'Test item',
        unit: 'nr',
        quantity: 10,
      });
      expect(result.id).toBe('item-1');
    });

    it('throws NotFoundError when non-owner tries to add item', async () => {
      mockFindByIdAndUser.mockResolvedValue(null);

      await expect(boqService.addItem(USER_B, BOQ_ID, 'sec-1', {
        itemCode: 'A.1',
        description: 'Test item',
        unit: 'nr',
        quantity: 10,
      })).rejects.toThrow(NotFoundError);
    });
  });
});
