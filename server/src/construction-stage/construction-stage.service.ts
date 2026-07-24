import { constructionStageRepository } from './construction-stage.repository.js';
import { boqRepository } from '../boq/boq.repository.js';
import { NotFoundError, ForbiddenError } from '../shared/errors.js';
import type { ConstructionStage, StageSummary } from './construction-stage.types.js';

export const constructionStageService = {
  async getAllStages(): Promise<ConstructionStage[]> {
    return constructionStageRepository.findAll();
  },

  async getStageSummary(userId: string, boqId: string, stageId: string): Promise<StageSummary> {
    const boq = await boqRepository.findByIdAndUser(boqId, userId);
    if (!boq) throw new NotFoundError('BOQ not found');

    const stages = await constructionStageRepository.findAll();
    const stage = stages.find((s) => s.id === stageId);
    if (!stage) throw new NotFoundError('Stage not found');

    const items = await boqRepository.getItemsBySection(stageId);
    const section = (await boqRepository.getSections(boqId)).find((s) => s.stage_id === stageId);

    const materialQuantities: Record<string, number> = {};
    let labourCost = 0;
    let materialCost = 0;
    let stageTotal = 0;

    for (const item of items) {
      labourCost += item.labour_cost;
      materialCost += item.material_cost;
      stageTotal += item.amount;
      materialQuantities[item.description] =
        (materialQuantities[item.description] || 0) + item.quantity;
    }

    return {
      stage,
      materialQuantities,
      labourCost,
      materialCost,
      stageTotal,
      plainLanguageSummary: section?.plain_language_summary || '',
      itemCount: items.length,
    };
  },

  async getBoqStageBreakdown(userId: string, boqId: string): Promise<StageSummary[]> {
    const boq = await boqRepository.findByIdAndUser(boqId, userId);
    if (!boq) throw new NotFoundError('BOQ not found');

    const stages = await constructionStageRepository.findAll();
    const summaries: StageSummary[] = [];

    for (const stage of stages) {
      const items = await boqRepository.getItemsBySection(stage.id);
      const section = (await boqRepository.getSections(boqId)).find((s) => s.stage_id === stage.id);

      const materialQuantities: Record<string, number> = {};
      let labourCost = 0;
      let materialCost = 0;
      let stageTotal = 0;

      for (const item of items) {
        labourCost += item.labour_cost;
        materialCost += item.material_cost;
        stageTotal += item.amount;
        materialQuantities[item.description] =
          (materialQuantities[item.description] || 0) + item.quantity;
      }

      summaries.push({
        stage,
        materialQuantities,
        labourCost,
        materialCost,
        stageTotal,
        plainLanguageSummary: section?.plain_language_summary || '',
        itemCount: items.length,
      });
    }

    return summaries;
  },
};
