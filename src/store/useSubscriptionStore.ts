import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SubscriptionPlan } from '@/types';

interface SubscriptionStore {
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  invoices: { id: string; amount: number; status: string; date: string }[];
  setPlan: (p: SubscriptionPlan) => void;
  setBillingCycle: (c: 'monthly' | 'yearly') => void;
  canCreateProject: (currentProjectCount: number) => boolean;
  canExport: () => boolean;
  canExportExcel: () => boolean;
  canExportCleanPdf: () => boolean;
  shouldWatermark: () => boolean;
}

export const FREE_PLAN: SubscriptionPlan = {
  id: 'free',
  name: 'free',
  displayName: 'Free',
  priceMonthly: 0,
  priceYearly: 0,
  projectsPerMonth: 2,
  maxProjects: 2,
  features: [
    '2 projects per month',
    'Basic BOQ generation',
    'Limited project history',
    'Watermarked PDF reports',
    'Plain language explanations',
  ],
  canExport: false,
  canExportExcel: false,
  canExportCleanPdf: false,
  watermarkPdf: true,
  hasMaterialSchedules: false,
  hasRegionalPricing: false,
  hasTeamCollaboration: false,
  hasApiAccess: false,
  hasCustomRateLibraries: false,
  hasPriorityProcessing: false,
  targetAudience: 'Homeowners, Students',
};

export const PROFESSIONAL_PLAN: SubscriptionPlan = {
  id: 'professional',
  name: 'professional',
  displayName: 'Professional',
  priceMonthly: 15000,
  priceYearly: 144000,
  projectsPerMonth: null,
  maxProjects: null,
  features: [
    'Unlimited projects',
    'Advanced BOQ generation',
    'Material schedules',
    'Regional pricing',
    'Full project history',
    'Excel and clean PDF exports',
    'Priority processing',
    'Plain language explanations',
  ],
  canExport: true,
  canExportExcel: true,
  canExportCleanPdf: true,
  watermarkPdf: false,
  hasMaterialSchedules: true,
  hasRegionalPricing: true,
  hasTeamCollaboration: false,
  hasApiAccess: false,
  hasCustomRateLibraries: false,
  hasPriorityProcessing: true,
  targetAudience: 'Contractors, Architects, Quantity Surveyors',
};

export const ENTERPRISE_PLAN: SubscriptionPlan = {
  id: 'enterprise',
  name: 'enterprise',
  displayName: 'Enterprise',
  priceMonthly: 50000,
  priceYearly: 480000,
  projectsPerMonth: null,
  maxProjects: null,
  features: [
    'Everything in Professional, plus:',
    'Team collaboration',
    'API access',
    'Custom rate libraries',
    'Dedicated support',
    'Organisation dashboard',
  ],
  canExport: true,
  canExportExcel: true,
  canExportCleanPdf: true,
  watermarkPdf: false,
  hasMaterialSchedules: true,
  hasRegionalPricing: true,
  hasTeamCollaboration: true,
  hasApiAccess: true,
  hasCustomRateLibraries: true,
  hasPriorityProcessing: true,
  targetAudience: 'Construction Firms, Property Development Companies',
};

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      plan: FREE_PLAN,
      billingCycle: 'monthly',
      invoices: [],
      setPlan: (p) => set({ plan: p }),
      setBillingCycle: (c) => set({ billingCycle: c }),
      canCreateProject: (currentProjectCount) => {
        const { plan } = get();
        if (plan.maxProjects === null) return true;
        return currentProjectCount < plan.maxProjects;
      },
      canExport: () => get().plan.canExport,
      canExportExcel: () => get().plan.canExportExcel,
      canExportCleanPdf: () => get().plan.canExportCleanPdf,
      shouldWatermark: () => get().plan.watermarkPdf,
    }),
    { name: 'boq-subscription' }
  )
);
