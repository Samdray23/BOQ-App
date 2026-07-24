import { onboardingRepository } from './onboarding.repository.js';
import type { UpdateOnboardingInput, OnboardingResponse } from './onboarding.types.js';

function toResponse(
  row: { completed: boolean; first_name: string | null; last_name: string | null; company_name: string | null; company_size: string | null; country: string | null; region: string | null; experience_level: string | null; estimation_standards: string[] | null; goals: string[] | null; ai_mode: string | null } | null,
  userRole: string
): OnboardingResponse {
  return {
    completed: row?.completed ?? false,
    firstName: row?.first_name ?? null,
    lastName: row?.last_name ?? null,
    role: userRole,
    companyName: row?.company_name ?? null,
    companySize: row?.company_size ?? null,
    country: row?.country ?? null,
    region: row?.region ?? null,
    experienceLevel: row?.experience_level ?? null,
    estimationStandards: row?.estimation_standards ?? [],
    goals: row?.goals ?? [],
    aiMode: row?.ai_mode ?? null,
  };
}

export const onboardingService = {
  async get(userId: string, userRole: string): Promise<OnboardingResponse> {
    let row;
    try {
      row = await onboardingRepository.findByUserId(userId);
    } catch {
      return {
        completed: true,
        firstName: null,
        lastName: null,
        role: userRole,
        companyName: null,
        companySize: null,
        country: null,
        region: null,
        experienceLevel: null,
        estimationStandards: [],
        goals: [],
        aiMode: null,
      };
    }
    if (!row) {
      return {
        completed: true,
        firstName: null,
        lastName: null,
        role: userRole,
        companyName: null,
        companySize: null,
        country: null,
        region: null,
        experienceLevel: null,
        estimationStandards: [],
        goals: [],
        aiMode: null,
      };
    }

    const isEmpty = !row.first_name && !row.last_name;
    if (!row.completed && isEmpty) {
      return {
        completed: true,
        firstName: null,
        lastName: null,
        role: userRole,
        companyName: null,
        companySize: null,
        country: null,
        region: null,
        experienceLevel: null,
        estimationStandards: [],
        goals: [],
        aiMode: null,
      };
    }

    return toResponse(row, userRole);
  },

  async update(userId: string, input: UpdateOnboardingInput, userRole: string): Promise<OnboardingResponse> {
    const dbData: Record<string, any> = {};
    if (input.firstName !== undefined) dbData.first_name = input.firstName;
    if (input.lastName !== undefined) dbData.last_name = input.lastName;
    if (input.companyName !== undefined) dbData.company_name = input.companyName;
    if (input.companySize !== undefined) dbData.company_size = input.companySize;
    if (input.country !== undefined) dbData.country = input.country;
    if (input.region !== undefined) dbData.region = input.region;
    if (input.experienceLevel !== undefined) dbData.experience_level = input.experienceLevel;
    if (input.estimationStandards !== undefined) dbData.estimation_standards = input.estimationStandards;
    if (input.goals !== undefined) dbData.goals = input.goals;
    if (input.aiMode !== undefined) dbData.ai_mode = input.aiMode;
    if (input.completed !== undefined) dbData.completed = input.completed;

    const row = await onboardingRepository.upsert(userId, dbData);
    return toResponse(row, userRole);
  },
};
