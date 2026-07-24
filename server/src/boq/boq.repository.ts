import { query, queryOne, queryMany } from '../database/index.js';
import { generateId } from '../shared/utils.js';
import type { Boq, BoqSection, BoqItem } from './boq.types.js';

export const boqRepository = {
  async findById(id: string): Promise<Boq | null> {
    return queryOne<Boq>('SELECT * FROM boqs WHERE id = $1', [id]);
  },

  async findByIdAndUser(id: string, userId: string): Promise<Boq | null> {
    return queryOne<Boq>('SELECT * FROM boqs WHERE id = $1 AND user_id = $2', [id, userId]);
  },

  async findByProject(projectId: string): Promise<Boq[]> {
    return queryMany<Boq>('SELECT * FROM boqs WHERE project_id = $1 ORDER BY version DESC', [
      projectId,
    ]);
  },

  async findByProjectForUser(projectId: string, userId: string): Promise<Boq[]> {
    return queryMany<Boq>(
      'SELECT * FROM boqs WHERE project_id = $1 AND user_id = $2 ORDER BY version DESC',
      [projectId, userId]
    );
  },

  async create(input: {
    projectId: string;
    userId: string;
    title: string;
    currency?: string;
    drawingId?: string;
  }): Promise<Boq> {
    const id = generateId();
    const version = 1;
    await query(
      `INSERT INTO boqs (id, project_id, user_id, title, version, currency, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'generating', NOW(), NOW())`,
      [id, input.projectId, input.userId, input.title, version, input.currency || 'NGN']
    );
    return (await this.findById(id))!;
  },

  async createSection(input: {
    boqId: string;
    stageId: string;
    sectionCode: string;
    sectionName: string;
    displayOrder: number;
  }): Promise<BoqSection> {
    const id = generateId();
    await query(
      `INSERT INTO boq_sections (id, boq_id, stage_id, section_code, section_name, display_order, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [id, input.boqId, input.stageId, input.sectionCode, input.sectionName, input.displayOrder]
    );
    return (await queryOne<BoqSection>('SELECT * FROM boq_sections WHERE id = $1', [id]))!;
  },

  async createItem(input: {
    boqId: string;
    sectionId: string;
    stageId: string;
    itemCode: string;
    description: string;
    unit: string;
    quantity: number;
    unitRate: number;
    amount: number;
    materialCost?: number;
    labourCost?: number;
    equipmentCost?: number;
    wastageFactor?: number;
    isProvisional?: boolean;
    confidenceScore?: number;
    plainLanguageNote?: string;
    displayOrder: number;
  }): Promise<BoqItem> {
    const id = generateId();
    await query(
      `INSERT INTO boq_items (id, boq_id, section_id, stage_id, item_code, description, unit, quantity, unit_rate, amount, material_cost, labour_cost, equipment_cost, wastage_factor, is_provisional, confidence_score, plain_language_note, display_order, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())`,
      [
        id,
        input.boqId,
        input.sectionId,
        input.stageId,
        input.itemCode,
        input.description,
        input.unit,
        input.quantity,
        input.unitRate,
        input.amount,
        input.materialCost || 0,
        input.labourCost || 0,
        input.equipmentCost || 0,
        input.wastageFactor || 0,
        input.isProvisional || false,
        input.confidenceScore || null,
        input.plainLanguageNote || null,
        input.displayOrder,
      ]
    );
    return (await queryOne<BoqItem>('SELECT * FROM boq_items WHERE id = $1', [id]))!;
  },

  async updateStatus(
    id: string,
    status: string,
    totals?: {
      totalEstimatedCost: number;
      materialCostTotal: number;
      labourCostTotal: number;
      equipmentCostTotal: number;
      contingencies: number;
      profitMargin: number;
      grandTotal: number;
      confidenceScore?: number;
      plainLanguageSummary?: string;
      aiDisclaimer?: string;
      aiProvider?: string;
      aiModel?: string;
    }
  ): Promise<void> {
    if (totals) {
      await query(
        `UPDATE boqs SET status = $1, total_estimated_cost = $2, material_cost_total = $3,
         labour_cost_total = $4, equipment_cost_total = $5, contingencies = $6,
         profit_margin = $7, grand_total = $8, confidence_score = $9,
         plain_language_summary = $10, ai_disclaimer = $11, ai_provider = $12,
         ai_model = $13, generated_at = NOW(), updated_at = NOW()
         WHERE id = $14`,
        [
          status,
          totals.totalEstimatedCost,
          totals.materialCostTotal,
          totals.labourCostTotal,
          totals.equipmentCostTotal,
          totals.contingencies,
          totals.profitMargin,
          totals.grandTotal,
          totals.confidenceScore || null,
          totals.plainLanguageSummary || null,
          totals.aiDisclaimer || null,
          totals.aiProvider || null,
          totals.aiModel || null,
          id,
        ]
      );
    } else {
      await query('UPDATE boqs SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
    }
  },

  async getSections(boqId: string): Promise<BoqSection[]> {
    return queryMany<BoqSection>(
      'SELECT * FROM boq_sections WHERE boq_id = $1 ORDER BY display_order',
      [boqId]
    );
  },

  async getItems(boqId: string): Promise<BoqItem[]> {
    return queryMany<BoqItem>('SELECT * FROM boq_items WHERE boq_id = $1 ORDER BY display_order', [
      boqId,
    ]);
  },

  async getItemsBySection(sectionId: string): Promise<BoqItem[]> {
    return queryMany<BoqItem>(
      'SELECT * FROM boq_items WHERE section_id = $1 ORDER BY display_order',
      [sectionId]
    );
  },
};
