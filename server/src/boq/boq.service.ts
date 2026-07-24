import { boqRepository } from './boq.repository.js';
import { constructionStageRepository } from '../construction-stage/construction-stage.repository.js';
import { pricingService } from '../pricing/pricing.service.js';
import { NotFoundError, ForbiddenError } from '../shared/errors.js';
import { generateId } from '../shared/utils.js';
import type { Boq, BoqSection, BoqItem } from './boq.types.js';

export const boqService = {
  async generate(
    userId: string,
    projectId: string,
    title: string,
    drawingId?: string
  ): Promise<Boq> {
    const boq = await boqRepository.create({
      projectId,
      userId,
      title: title || 'Bill of Quantities',
      drawingId,
    });

    // Trigger async generation via job queue
    const { jobsService } = await import('../jobs/jobs.service.js');
    await jobsService.createJob('boq-generation', {
      boqId: boq.id,
      projectId,
      userId,
      drawingId,
    });

    return boq;
  },

  async getById(
    userId: string,
    boqId: string
  ): Promise<{ boq: Boq; sections: BoqSection[]; items: BoqItem[] }> {
    const boq = await boqRepository.findByIdAndUser(boqId, userId);
    if (!boq) throw new NotFoundError('BOQ not found');

    const [sections, items] = await Promise.all([
      boqRepository.getSections(boqId),
      boqRepository.getItems(boqId),
    ]);

    return { boq, sections, items };
  },

  async getByProject(userId: string, projectId: string): Promise<Boq[]> {
    return boqRepository.findByProjectForUser(projectId, userId);
  },

  async addSection(userId: string, boqId: string, stageCode: string): Promise<BoqSection> {
    const boq = await boqRepository.findByIdAndUser(boqId, userId);
    if (!boq) throw new NotFoundError('BOQ not found');

    const stages = await constructionStageRepository.findAll();
    const stage = stages.find((s) => s.code === stageCode);
    if (!stage) throw new NotFoundError(`Construction stage '${stageCode}' not found`);

    return boqRepository.createSection({
      boqId,
      stageId: stage.id,
      sectionCode: stage.code,
      sectionName: stage.name,
      displayOrder: stage.display_order,
    });
  },

  async addItem(
    userId: string,
    boqId: string,
    sectionId: string,
    input: {
      itemCode: string;
      description: string;
      unit: string;
      quantity: number;
      unitRate?: number;
      regionCode?: string;
    }
  ): Promise<BoqItem> {
    const boq = await boqRepository.findByIdAndUser(boqId, userId);
    if (!boq) throw new NotFoundError('BOQ not found');

    const sections = await boqRepository.getSections(boqId);
    const section = sections.find((s) => s.id === sectionId);
    if (!section) throw new NotFoundError('Section not found');

    const rate =
      input.unitRate ||
      (await pricingService.getRate(input.description, input.unit, input.regionCode || 'IB'));

    const amount = input.quantity * rate;

    return boqRepository.createItem({
      boqId,
      sectionId,
      stageId: section.stage_id,
      itemCode: input.itemCode,
      description: input.description,
      unit: input.unit,
      quantity: input.quantity,
      unitRate: rate,
      amount,
      displayOrder: 0,
    });
  },
};
