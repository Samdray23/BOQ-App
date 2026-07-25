import { create } from 'zustand';
import type { Boq, BoqItem, BoqSection } from '@/types';
import { BOQ_SECTIONS } from '@/types';

const emptySections: BoqSection[] = BOQ_SECTIONS.map((s, i) => ({
  id: `sec-${s.code}`,
  sectionCode: s.code,
  sectionName: s.name,
  displayOrder: i + 1,
  subtotal: 0,
  isEstimated: false,
}));

interface BoqStore {
  boqs: Boq[];
  currentBoq: Boq | null;
  setCurrentBoq: (b: Boq | null) => void;
  createBoq: (projectId: string) => void;
  updateItem: (boqId: string, itemId: string, data: Partial<BoqItem>) => void;
  addItem: (boqId: string, sectionId: string) => void;
  removeItem: (boqId: string, itemId: string) => void;
  recalculate: (boqId: string) => void;
}

export const useBoqStore = create<BoqStore>((set) => ({
  boqs: [],
  currentBoq: null,
  setCurrentBoq: (b) => set({ currentBoq: b }),
  createBoq: (projectId) => {
    const newBoq: Boq = {
      id: crypto.randomUUID(),
      projectId,
      title: 'AI-Assisted Preliminary BOQ',
      version: 1,
      status: 'generating',
      totalEstimatedCost: 0,
      currency: 'NGN',
      sections: emptySections.map((s) => ({ ...s })),
      items: [],
      generatedAt: new Date().toISOString(),
    };
    set((s) => ({ boqs: [...s.boqs, newBoq], currentBoq: newBoq }));
  },
  updateItem: (boqId, itemId, data) =>
    set((s) => ({
      boqs: s.boqs.map((b) =>
        b.id === boqId
          ? { ...b, items: b.items.map((i) => (i.id === itemId ? { ...i, ...data } : i)) }
          : b
      ),
      currentBoq:
        s.currentBoq?.id === boqId
          ? {
              ...s.currentBoq,
              items: s.currentBoq.items.map((i) => (i.id === itemId ? { ...i, ...data } : i)),
            }
          : s.currentBoq,
    })),
  addItem: (boqId, sectionId) =>
    set((s) => {
      const newItem: BoqItem = {
        id: crypto.randomUUID(),
        sectionId,
        itemCode: '',
        description: '',
        plainLanguageNote: '',
        unit: 'm²',
        quantity: 0,
        unitRate: 0,
        amount: 0,
        isProvisional: false,
        confidenceScore: 1,
      };
      return {
        boqs: s.boqs.map((b) => (b.id === boqId ? { ...b, items: [...b.items, newItem] } : b)),
        currentBoq:
          s.currentBoq?.id === boqId
            ? { ...s.currentBoq, items: [...s.currentBoq.items, newItem] }
            : s.currentBoq,
      };
    }),
  removeItem: (boqId, itemId) =>
    set((s) => ({
      boqs: s.boqs.map((b) =>
        b.id === boqId ? { ...b, items: b.items.filter((i) => i.id !== itemId) } : b
      ),
      currentBoq:
        s.currentBoq?.id === boqId
          ? { ...s.currentBoq, items: s.currentBoq.items.filter((i) => i.id !== itemId) }
          : s.currentBoq,
    })),
  recalculate: (boqId) =>
    set((s) => ({
      boqs: s.boqs.map((b) => {
        if (b.id !== boqId) return b;
        const items = b.items.map((i) => ({ ...i, amount: i.quantity * i.unitRate }));
        const sections = b.sections.map((sec) => ({
          ...sec,
          subtotal: items
            .filter((i) => i.sectionId === sec.id)
            .reduce((sum, i) => sum + i.amount, 0),
        }));
        return {
          ...b,
          items,
          sections,
          totalEstimatedCost: items.reduce((sum, i) => sum + i.amount, 0),
        };
      }),
      currentBoq:
        s.currentBoq?.id === boqId
          ? (() => {
              const items = s.currentBoq.items.map((i) => ({
                ...i,
                amount: i.quantity * i.unitRate,
              }));
              const sections = s.currentBoq.sections.map((sec) => ({
                ...sec,
                subtotal: items
                  .filter((i) => i.sectionId === sec.id)
                  .reduce((sum, i) => sum + i.amount, 0),
              }));
              return {
                ...s.currentBoq,
                items,
                sections,
                totalEstimatedCost: items.reduce((sum, i) => sum + i.amount, 0),
              };
            })()
          : s.currentBoq,
    })),
}));
