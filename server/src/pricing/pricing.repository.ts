import { query, queryOne, queryMany } from '../database/index.js';
import { generateId } from '../shared/utils.js';
import type { Region, RateEntry } from './pricing.types.js';

export const pricingRepository = {
  async findAllRegions(): Promise<Region[]> {
    return queryMany<Region>('SELECT * FROM regions WHERE is_active = TRUE ORDER BY city');
  },

  async findRegionByCode(code: string): Promise<Region | null> {
    return queryOne<Region>('SELECT * FROM regions WHERE code = $1 AND is_active = TRUE', [code]);
  },

  async findRatesByRegion(regionId: string): Promise<RateEntry[]> {
    return queryMany<RateEntry>(
      `SELECT rl.*, rc.name as category_name FROM rate_library rl
       JOIN rate_categories rc ON rc.id = rl.category_id
       WHERE rl.region_id = $1 AND rl.is_active = TRUE
       AND (rl.effective_to IS NULL OR rl.effective_to >= CURRENT_DATE)
       ORDER BY rc.name, rl.item_description`,
      [regionId]
    );
  },

  async findRate(
    regionId: string,
    itemDescription: string,
    unit: string
  ): Promise<RateEntry | null> {
    return queryOne<RateEntry>(
      `SELECT * FROM rate_library
       WHERE region_id = $1 AND LOWER(item_description) = LOWER($2) AND unit = $3 AND is_active = TRUE
       AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
       ORDER BY effective_from DESC LIMIT 1`,
      [regionId, itemDescription, unit]
    );
  },

  async createRate(input: {
    regionId: string;
    categoryId: string;
    itemDescription: string;
    unit: string;
    rate: number;
    currency?: string;
    source?: string;
  }): Promise<RateEntry> {
    const id = generateId();
    await query(
      `INSERT INTO rate_library (id, region_id, category_id, item_description, unit, rate, currency, source, effective_from, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, NOW(), NOW())`,
      [
        id,
        input.regionId,
        input.categoryId,
        input.itemDescription,
        input.unit,
        input.rate,
        input.currency || 'NGN',
        input.source || null,
      ]
    );
    return (await queryOne<RateEntry>('SELECT * FROM rate_library WHERE id = $1', [id]))!;
  },

  async findCategoryByName(name: string): Promise<{ id: string; name: string } | null> {
    return queryOne<{ id: string; name: string }>(
      'SELECT id, name FROM rate_categories WHERE name = $1',
      [name]
    );
  },
};
