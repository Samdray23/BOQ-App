import { exportsRepository } from './exports.repository.js';
import type { ExportType, ExportFormat, Export as ExportRecord } from './exports.types.js';

export const exportsService = {
  async createExport(input: {
    userId: string;
    projectId: string;
    boqId?: string;
    type: ExportType;
    format: ExportFormat;
  }): Promise<ExportRecord> {
    const exportRecord = await exportsRepository.create(input);

    // Trigger async export generation via job queue
    const { jobsService } = await import('../jobs/jobs.service.js');
    await jobsService.createJob('export-generation', {
      exportId: exportRecord.id,
      projectId: input.projectId,
      boqId: input.boqId,
      type: input.type,
      format: input.format,
      userId: input.userId,
    });

    return exportRecord;
  },

  async getUserExports(userId: string) {
    return exportsRepository.findByUser(userId);
  },
};
