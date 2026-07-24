import { reportsRepository } from './reports.repository.js';
import { projectsRepository } from '../projects/projects.repository.js';
import { storageService } from '../storage/storage.service.js';
import {
  createPdfDocument,
  addPdfSection,
  addPdfSummary,
  addPdfFooter,
  streamPdf,
} from '../utils/pdf.js';
import { createExcelWorkbook, streamExcel } from '../utils/excel.js';
import { NotFoundError, ForbiddenError } from '../shared/errors.js';
import type { ReportType, ReportFormat } from './reports.types.js';

const AI_DISCLAIMER =
  'This document is an AI-assisted preliminary quantity surveying estimate. It has not been reviewed by a licensed Quantity Surveyor. All quantities and costs should be verified by a qualified professional before use in procurement, tendering, or construction.';

export const reportsService = {
  async generate(input: {
    projectId: string;
    userId: string;
    boqId?: string;
    type: ReportType;
    format: ReportFormat;
    title?: string;
  }): Promise<{ id: string; status: string }> {
    const project = await projectsRepository.findByIdAndUser(input.projectId, input.userId);
    if (!project) throw new NotFoundError('Project not found');

    const report = await reportsRepository.create({
      projectId: input.projectId,
      boqId: input.boqId,
      userId: input.userId,
      title:
        input.title ||
        `${input.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} Report`,
      type: input.type,
      format: input.format,
    });

    // Trigger async report generation via job queue
    const { jobsService } = await import('../jobs/jobs.service.js');
    await jobsService.createJob('report-generation', {
      reportId: report.id,
      projectId: input.projectId,
      boqId: input.boqId,
      type: input.type,
      format: input.format,
      userId: input.userId,
    });

    return { id: report.id, status: 'generating' };
  },

  async getByProject(userId: string, projectId: string) {
    const project = await projectsRepository.findByIdAndUser(projectId, userId);
    if (!project) throw new NotFoundError('Project not found');
    return reportsRepository.findByProject(projectId);
  },

  async getById(userId: string, id: string) {
    const report = await reportsRepository.findById(id);
    if (!report) throw new NotFoundError('Report not found');
    const project = await projectsRepository.findByIdAndUser(report.project_id, userId);
    if (!project) throw new ForbiddenError('Access denied');
    return report;
  },
};
