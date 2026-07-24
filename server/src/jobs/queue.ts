import { jobsRepository } from './jobs.repository.js';
import { drawingAnalysisHandler } from './handlers/drawing-analysis.js';
import { boqGenerationHandler } from './handlers/boq-generation.js';
import { reportGenerationHandler } from './handlers/report-generation.js';
import { exportGenerationHandler } from './handlers/export-generation.js';
import { emailNotificationHandler } from './handlers/email-notifications.js';
import type { JobHandler, JobType } from './jobs.types.js';

const handlers: Record<string, JobHandler> = {
  'drawing-analysis': drawingAnalysisHandler,
  'boq-generation': boqGenerationHandler,
  'report-generation': reportGenerationHandler,
  'export-generation': exportGenerationHandler,
  'email-notification': emailNotificationHandler,
};

let isRunning = false;
let pollTimer: ReturnType<typeof setTimeout> | null = null;

const BASE_INTERVAL_MS = 2000;
const MAX_INTERVAL_MS = 30000;
const BACKOFF_MULTIPLIER = 1.5;

let currentInterval = BASE_INTERVAL_MS;
let consecutiveEmptyPolls = 0;
let consecutiveErrors = 0;

async function processNextJob(): Promise<void> {
  if (!isRunning) return;

  try {
    const job = await jobsRepository.claimNext();
    if (!job) {
      consecutiveEmptyPolls++;
      currentInterval = Math.min(
        BASE_INTERVAL_MS * Math.pow(BACKOFF_MULTIPLIER, consecutiveEmptyPolls),
        MAX_INTERVAL_MS
      );
      scheduleNext();
      return;
    }

    // Found a job — reset to base interval
    consecutiveEmptyPolls = 0;
    consecutiveErrors = 0;
    currentInterval = BASE_INTERVAL_MS;

    console.log(`Processing job: ${job.id} (${job.type})`);

    const handler = handlers[job.type];
    if (!handler) {
      await jobsRepository.fail(job.id, `No handler registered for job type: ${job.type}`);
      scheduleNext();
      return;
    }

    try {
      await handler(job.payload);
      await jobsRepository.complete(job.id, {});
      console.log(`Job completed: ${job.id} (${job.type})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await jobsRepository.fail(job.id, errorMessage);
      console.error(`Job failed: ${job.id} (${job.type}): ${errorMessage}`);
    }

    // Check for more jobs immediately
    scheduleNext(0);
  } catch (error) {
    consecutiveErrors++;
    currentInterval = Math.min(
      BASE_INTERVAL_MS * Math.pow(BACKOFF_MULTIPLIER, consecutiveErrors),
      MAX_INTERVAL_MS
    );
    console.error(
      `[JOB QUEUE] Poll error (attempt ${consecutiveErrors}), backing off to ${currentInterval}ms:`,
      error
    );
    scheduleNext();
  }
}

function scheduleNext(delayMs?: number): void {
  if (!isRunning) return;
  if (pollTimer) clearTimeout(pollTimer);
  pollTimer = setTimeout(processNextJob, delayMs ?? currentInterval);
}

export function startQueue(pollIntervalMs = BASE_INTERVAL_MS): void {
  if (isRunning) return;
  isRunning = true;
  currentInterval = pollIntervalMs;

  console.log(`[JOB QUEUE] Started (base interval: ${pollIntervalMs}ms, backoff up to ${MAX_INTERVAL_MS}ms)`);
  scheduleNext(0);
}

export function stopQueue(): void {
  isRunning = false;
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
  console.log('[JOB QUEUE] Stopped');
}
