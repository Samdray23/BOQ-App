import { create } from 'zustand';
import type { Project, ProjectStatus } from '@/types';

interface ProjectStore {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setSelectedProject: (p: Project | null) => void;
  addProject: (p: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  archiveProject: (id: string) => void;
  duplicateProject: (id: string) => void;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Luxury Villa Ikoyi',
    client: 'Dr. Adebayo O.',
    type: 'residential',
    location: 'Lagos',
    currency: 'NGN',
    status: 'complete',
    startDate: '2026-01-15',
    completionDate: '2026-06-30',
    description: '4-bedroom luxury villa with swimming pool',
    createdAt: '2026-01-15',
    updatedAt: '2026-06-01',
  },
  {
    id: '2',
    name: 'Greenfield Estate Phase 2',
    client: 'Greenfield Dev. Co.',
    type: 'commercial',
    location: 'Abuja',
    currency: 'NGN',
    status: 'processing',
    startDate: '2026-03-01',
    completionDate: '2026-12-31',
    description: 'Mixed-use development with 12 units',
    createdAt: '2026-03-01',
    updatedAt: '2026-06-10',
  },
  {
    id: '3',
    name: 'Hilltop Residence',
    client: 'Engr. Musa K.',
    type: 'residential',
    location: 'Ibadan',
    currency: 'NGN',
    status: 'draft',
    startDate: '2026-05-01',
    completionDate: '2026-08-30',
    description: '3-bedroom bungalow on hilltop',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-01',
  },
  {
    id: '4',
    name: 'Riverside Plaza',
    client: 'Delta Investments',
    type: 'commercial',
    location: 'Port Harcourt',
    currency: 'NGN',
    status: 'draft',
    startDate: '2026-04-15',
    completionDate: '2027-02-28',
    description: '5-storey commercial plaza',
    createdAt: '2026-04-15',
    updatedAt: '2026-05-20',
  },
  {
    id: '5',
    name: 'Kano Industrial Hub',
    client: 'Northern Conglomerate',
    type: 'infrastructure',
    location: 'Kano',
    currency: 'NGN',
    status: 'complete',
    startDate: '2025-09-01',
    completionDate: '2026-04-30',
    description: 'Industrial warehouse complex',
    createdAt: '2025-09-01',
    updatedAt: '2026-04-30',
  },
];

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: mockProjects,
  selectedProject: null,
  loading: false,
  setLoading: (v) => set({ loading: v }),
  setSelectedProject: (p) => set({ selectedProject: p }),
  addProject: (p) => set((s) => ({ projects: [p, ...s.projects] })),
  updateProject: (id, data) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
      selectedProject:
        s.selectedProject?.id === id ? { ...s.selectedProject, ...data } : s.selectedProject,
    })),
  deleteProject: (id) =>
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      selectedProject: s.selectedProject?.id === id ? null : s.selectedProject,
    })),
  archiveProject: (id) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, status: 'archived' as ProjectStatus } : p
      ),
    })),
  duplicateProject: (id) =>
    set((s) => {
      const source = s.projects.find((p) => p.id === id);
      if (!source) return s;
      const dup: Project = {
        ...source,
        id: crypto.randomUUID(),
        name: `${source.name} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { projects: [dup, ...s.projects] };
    }),
}));
