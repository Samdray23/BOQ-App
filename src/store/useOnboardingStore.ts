import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  OnboardingData,
  UserRole,
  ExperienceLevel,
  EstimationStandard,
  OnboardingGoal,
  AiAssistantMode,
} from '@/types';
import type { Project } from '@/types';

interface OnboardingState {
  data: Partial<OnboardingData>;
  firstProject: Partial<Project>;
  uploadedFileName: string | null;
  step: number;
  setStep: (step: number) => void;
  updateData: (partial: Partial<OnboardingData>) => void;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setRole: (v: UserRole) => void;
  setCompanyName: (v: string) => void;
  setCompanySize: (v: string) => void;
  setCountry: (v: string) => void;
  setRegion: (v: string) => void;
  setExperienceLevel: (v: ExperienceLevel) => void;
  setEstimationStandards: (v: EstimationStandard[]) => void;
  setGoals: (v: OnboardingGoal[]) => void;
  setAiMode: (v: AiAssistantMode) => void;
  setFirstProject: (p: Partial<Project>) => void;
  setUploadedFileName: (name: string | null) => void;
  setCompleted: () => void;
  reset: () => void;
}

const initialState: Partial<OnboardingData> = {
  firstName: '',
  lastName: '',
  role: undefined,
  companyName: '',
  companySize: '',
  country: '',
  region: '',
  experienceLevel: undefined,
  estimationStandards: [],
  goals: [],
  aiMode: undefined,
  completed: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      data: { ...initialState },
      firstProject: { name: '', type: 'residential', location: '', description: '' },
      uploadedFileName: null,
      step: 0,
      setStep: (step) => set({ step }),
      updateData: (partial) => set((s) => ({ data: { ...s.data, ...partial } })),
      setFirstName: (v) => set((s) => ({ data: { ...s.data, firstName: v } })),
      setLastName: (v) => set((s) => ({ data: { ...s.data, lastName: v } })),
      setRole: (v) => set((s) => ({ data: { ...s.data, role: v } })),
      setCompanyName: (v) => set((s) => ({ data: { ...s.data, companyName: v } })),
      setCompanySize: (v) => set((s) => ({ data: { ...s.data, companySize: v } })),
      setCountry: (v) => set((s) => ({ data: { ...s.data, country: v } })),
      setRegion: (v) => set((s) => ({ data: { ...s.data, region: v } })),
      setExperienceLevel: (v) => set((s) => ({ data: { ...s.data, experienceLevel: v } })),
      setEstimationStandards: (v) => set((s) => ({ data: { ...s.data, estimationStandards: v } })),
      setGoals: (v) => set((s) => ({ data: { ...s.data, goals: v } })),
      setAiMode: (v) => set((s) => ({ data: { ...s.data, aiMode: v } })),
      setFirstProject: (p) => set({ firstProject: p }),
      setUploadedFileName: (name) => set({ uploadedFileName: name }),
      setCompleted: () => set((s) => ({ data: { ...s.data, completed: true } })),
      reset: () => set({ data: { ...initialState }, step: 0, firstProject: { name: '', type: 'residential', location: '', description: '' }, uploadedFileName: null }),
    }),
    { name: 'boq-onboarding' }
  )
);
