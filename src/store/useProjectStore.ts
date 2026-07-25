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

const mockProjects: Project[] = [];

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
