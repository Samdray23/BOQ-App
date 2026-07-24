import { queryMany } from '../database/index.js';
import type { ConstructionStage } from './construction-stage.types.js';

export const constructionStageRepository = {
  async findAll(): Promise<ConstructionStage[]> {
    return queryMany<ConstructionStage>('SELECT * FROM construction_stages ORDER BY display_order');
  },

  async findByCode(code: string): Promise<ConstructionStage | null> {
    const stages = await queryMany<ConstructionStage>(
      'SELECT * FROM construction_stages WHERE code = $1',
      [code]
    );
    return stages[0] || null;
  },
};
