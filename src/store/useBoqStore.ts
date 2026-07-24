import { create } from 'zustand';
import type { Boq, BoqItem, BoqSection } from '@/types';
import { BOQ_SECTIONS } from '@/types';

const mockSections: BoqSection[] = BOQ_SECTIONS.map((s, i) => ({
  id: `sec-${s.code}`,
  sectionCode: s.code,
  sectionName: s.name,
  displayOrder: i + 1,
  subtotal: 0,
  isEstimated: s.code === 'C',
}));

const mockItems: BoqItem[] = [
  {
    id: 'i1',
    sectionId: 'sec-A',
    itemCode: 'A.01',
    description: 'Site Mobilization',
    plainLanguageNote: 'Moving equipment, materials, and setting up site offices and storage areas',
    unit: 'sum',
    quantity: 1,
    unitRate: 850000,
    amount: 850000,
    isProvisional: false,
    confidenceScore: 0.95,
  },
  {
    id: 'i2',
    sectionId: 'sec-A',
    itemCode: 'A.02',
    description: 'Project Insurance & Permits',
    plainLanguageNote:
      'Insurance coverage and government building permits for the construction period',
    unit: 'sum',
    quantity: 1,
    unitRate: 350000,
    amount: 350000,
    isProvisional: false,
    confidenceScore: 0.9,
  },
  {
    id: 'i3',
    sectionId: 'sec-A',
    itemCode: 'A.03',
    description: 'Setting Out & Survey',
    plainLanguageNote:
      'Professional surveyor to mark building lines and establish reference points',
    unit: 'sum',
    quantity: 1,
    unitRate: 280000,
    amount: 280000,
    isProvisional: false,
    confidenceScore: 0.88,
  },
  {
    id: 'i4',
    sectionId: 'sec-B',
    itemCode: 'B.01',
    description: 'Site Clearing & Topsoil Stripping',
    plainLanguageNote: 'Clearing vegetation, debris, and removing topsoil from the building area',
    unit: 'm²',
    quantity: 450,
    unitRate: 1800,
    amount: 810000,
    isProvisional: false,
    confidenceScore: 0.85,
  },
  {
    id: 'i5',
    sectionId: 'sec-B',
    itemCode: 'B.02',
    description: 'Trench Excavation (Foundation)',
    plainLanguageNote: 'Digging trenches for strip foundations to required depth and width',
    unit: 'm³',
    quantity: 98,
    unitRate: 5200,
    amount: 509600,
    isProvisional: false,
    confidenceScore: 0.82,
  },
  {
    id: 'i6',
    sectionId: 'sec-B',
    itemCode: 'B.03',
    description: 'Hardcore Filling & Compaction',
    plainLanguageNote:
      'Filling excavated areas with granite/stone base and compacting to specification',
    unit: 'm³',
    quantity: 35,
    unitRate: 18500,
    amount: 647500,
    isProvisional: false,
    confidenceScore: 0.8,
  },
  {
    id: 'i7',
    sectionId: 'sec-C',
    itemCode: 'C.01',
    description: 'Blinding Concrete (50mm)',
    plainLanguageNote:
      'Thin layer of lean concrete poured over the hardcore to provide a clean working surface',
    unit: 'm²',
    quantity: 120,
    unitRate: 8500,
    amount: 1020000,
    isProvisional: true,
    confidenceScore: 0.7,
  },
  {
    id: 'i8',
    sectionId: 'sec-C',
    itemCode: 'C.02',
    description: 'Reinforced Concrete Strip Foundation (1:2:4)',
    plainLanguageNote:
      'Main concrete strip foundation with steel reinforcement to support load-bearing walls',
    unit: 'm³',
    quantity: 40,
    unitRate: 125000,
    amount: 5000000,
    isProvisional: true,
    confidenceScore: 0.72,
  },
  {
    id: 'i9',
    sectionId: 'sec-C',
    itemCode: 'C.03',
    description: 'Reinforcement Steel (Y12/Y10)',
    plainLanguageNote:
      'Steel reinforcement bars placed in foundation concrete for structural strength',
    unit: 'kg',
    quantity: 2800,
    unitRate: 5200,
    amount: 14560000,
    isProvisional: true,
    confidenceScore: 0.65,
  },
  {
    id: 'i10',
    sectionId: 'sec-D',
    itemCode: 'D.01',
    description: '225mm Hollow Block Wall (External)',
    plainLanguageNote:
      'External load-bearing walls built with 225mm sandcrete hollow blocks in cement mortar',
    unit: 'm²',
    quantity: 310,
    unitRate: 19500,
    amount: 6045000,
    isProvisional: false,
    confidenceScore: 0.88,
  },
  {
    id: 'i11',
    sectionId: 'sec-D',
    itemCode: 'D.02',
    description: '150mm Hollow Block Wall (Internal)',
    plainLanguageNote: 'Internal partition walls built with 150mm hollow blocks',
    unit: 'm²',
    quantity: 165,
    unitRate: 14800,
    amount: 2442000,
    isProvisional: false,
    confidenceScore: 0.85,
  },
  {
    id: 'i12',
    sectionId: 'sec-D',
    itemCode: 'D.03',
    description: 'Reinforced Concrete Lintels',
    plainLanguageNote:
      'Concrete beams cast above doors and windows to support the wall above openings',
    unit: 'm',
    quantity: 65,
    unitRate: 9500,
    amount: 617500,
    isProvisional: false,
    confidenceScore: 0.83,
  },
  {
    id: 'i13',
    sectionId: 'sec-E',
    itemCode: 'E.01',
    description: 'Roof Timber Framework (Treated)',
    plainLanguageNote: 'Treated hardwood/softwood roof trusses, purlins, and structural framework',
    unit: 'm²',
    quantity: 185,
    unitRate: 12800,
    amount: 2368000,
    isProvisional: false,
    confidenceScore: 0.82,
  },
  {
    id: 'i14',
    sectionId: 'sec-E',
    itemCode: 'E.02',
    description: 'Longspan Aluminium Roofing Sheets (0.55mm)',
    plainLanguageNote: 'Premium aluminium roofing sheet covering with anti-corrosion coating',
    unit: 'm²',
    quantity: 205,
    unitRate: 14500,
    amount: 2972500,
    isProvisional: false,
    confidenceScore: 0.85,
  },
  {
    id: 'i15',
    sectionId: 'sec-E',
    itemCode: 'E.03',
    description: 'Roof Insulation (25mm Foil-Faced)',
    plainLanguageNote:
      'Thermal insulation layer installed beneath roofing sheets to reduce heat gain',
    unit: 'm²',
    quantity: 185,
    unitRate: 3500,
    amount: 647500,
    isProvisional: false,
    confidenceScore: 0.78,
  },
  {
    id: 'i16',
    sectionId: 'sec-E',
    itemCode: 'E.04',
    description: 'Rainwater Gutters & Downpipes (PVC)',
    plainLanguageNote:
      'PVC gutters and downpipes to channel rainwater from roof to drainage system',
    unit: 'm',
    quantity: 85,
    unitRate: 4500,
    amount: 382500,
    isProvisional: false,
    confidenceScore: 0.8,
  },
  {
    id: 'i17',
    sectionId: 'sec-F',
    itemCode: 'F.01',
    description: 'External Hardwood Door (Panel Type)',
    plainLanguageNote:
      'Main entrance and external doors made from premium hardwood with frame and ironmongery',
    unit: 'nr',
    quantity: 2,
    unitRate: 220000,
    amount: 440000,
    isProvisional: false,
    confidenceScore: 0.9,
  },
  {
    id: 'i18',
    sectionId: 'sec-F',
    itemCode: 'F.02',
    description: 'Internal Flush Doors (Skinned)',
    plainLanguageNote:
      'Internal room doors with hollow core, veneer finish, fitted with locks and hinges',
    unit: 'nr',
    quantity: 10,
    unitRate: 95000,
    amount: 950000,
    isProvisional: false,
    confidenceScore: 0.9,
  },
  {
    id: 'i19',
    sectionId: 'sec-F',
    itemCode: 'F.03',
    description: 'Stainless Steel Gate (Sliding)',
    plainLanguageNote: 'Compound entrance gate in stainless steel with sliding track mechanism',
    unit: 'nr',
    quantity: 1,
    unitRate: 580000,
    amount: 580000,
    isProvisional: false,
    confidenceScore: 0.85,
  },
  {
    id: 'i20',
    sectionId: 'sec-G',
    itemCode: 'G.01',
    description: 'Aluminium Sliding Windows (5mm Glass)',
    plainLanguageNote: 'Anodized aluminium framed sliding windows with 5mm clear glass panels',
    unit: 'nr',
    quantity: 7,
    unitRate: 145000,
    amount: 1015000,
    isProvisional: false,
    confidenceScore: 0.88,
  },
  {
    id: 'i21',
    sectionId: 'sec-G',
    itemCode: 'G.02',
    description: 'Casement Window (Louvre Type)',
    plainLanguageNote:
      'Glass louvre windows with aluminium frame for ventilation areas like kitchen and toilet',
    unit: 'nr',
    quantity: 4,
    unitRate: 85000,
    amount: 340000,
    isProvisional: false,
    confidenceScore: 0.86,
  },
  {
    id: 'i22',
    sectionId: 'sec-H',
    itemCode: 'H.01',
    description: 'Ceramic Floor Tiles (400x400mm)',
    plainLanguageNote: 'Vitrified ceramic floor tiles for living areas, bedrooms, and hallways',
    unit: 'm²',
    quantity: 220,
    unitRate: 9500,
    amount: 2090000,
    isProvisional: false,
    confidenceScore: 0.85,
  },
  {
    id: 'i23',
    sectionId: 'sec-H',
    itemCode: 'H.02',
    description: 'Anti-Slip Tiles (Bathroom/Kitchen)',
    plainLanguageNote:
      'Textured anti-slip ceramic tiles for wet areas including bathrooms and kitchen',
    unit: 'm²',
    quantity: 65,
    unitRate: 12000,
    amount: 780000,
    isProvisional: false,
    confidenceScore: 0.83,
  },
  {
    id: 'i24',
    sectionId: 'sec-I',
    itemCode: 'I.01',
    description: 'Internal Wall Plastering (Cement/Sand Render)',
    plainLanguageNote:
      'Cement and sand render applied to internal block walls to create a smooth finishing surface',
    unit: 'm²',
    quantity: 620,
    unitRate: 4800,
    amount: 2976000,
    isProvisional: false,
    confidenceScore: 0.84,
  },
  {
    id: 'i25',
    sectionId: 'sec-I',
    itemCode: 'I.02',
    description: 'External Wall Plastering (Waterproof)',
    plainLanguageNote: 'Waterproof cement render applied to external walls for weather protection',
    unit: 'm²',
    quantity: 310,
    unitRate: 5800,
    amount: 1798000,
    isProvisional: false,
    confidenceScore: 0.82,
  },
  {
    id: 'i26',
    sectionId: 'sec-J',
    itemCode: 'J.01',
    description: 'PVC Ceiling Board Installation',
    plainLanguageNote: 'PVC ceiling panels with aluminium framework installed for all rooms',
    unit: 'm²',
    quantity: 185,
    unitRate: 8500,
    amount: 1572500,
    isProvisional: false,
    confidenceScore: 0.84,
  },
  {
    id: 'i27',
    sectionId: 'sec-J',
    itemCode: 'J.02',
    description: 'Ceiling Cornice (PVC Patterned)',
    plainLanguageNote:
      'Decorative PVC cornices installed at ceiling-wall junctions for a finished look',
    unit: 'm',
    quantity: 185,
    unitRate: 2800,
    amount: 518000,
    isProvisional: false,
    confidenceScore: 0.8,
  },
  {
    id: 'i28',
    sectionId: 'sec-K',
    itemCode: 'K.01',
    description: 'Emulsion Paint (Internal Walls - 2 Coats)',
    plainLanguageNote:
      'Premium washable emulsion paint applied to all internal walls with primer coat',
    unit: 'm²',
    quantity: 620,
    unitRate: 3200,
    amount: 1984000,
    isProvisional: false,
    confidenceScore: 0.83,
  },
  {
    id: 'i29',
    sectionId: 'sec-K',
    itemCode: 'K.02',
    description: 'External Wall Paint (Weatherproof - 2 Coats)',
    plainLanguageNote:
      'Weather-resistant exterior paint with anti-mildew properties applied to external walls',
    unit: 'm²',
    quantity: 310,
    unitRate: 4200,
    amount: 1302000,
    isProvisional: false,
    confidenceScore: 0.81,
  },
  {
    id: 'i30',
    sectionId: 'sec-K',
    itemCode: 'K.03',
    description: 'Satin Paint (Woodwork/Doors)',
    plainLanguageNote: 'High-gloss satin paint for doors, window frames, and exposed woodwork',
    unit: 'm²',
    quantity: 95,
    unitRate: 3800,
    amount: 361000,
    isProvisional: false,
    confidenceScore: 0.8,
  },
  {
    id: 'i31',
    sectionId: 'sec-L',
    itemCode: 'L.01',
    description: 'Interlocking Paving Stones (Driveway)',
    plainLanguageNote: 'Concrete interlocking paving stones for driveway and car parking area',
    unit: 'm²',
    quantity: 75,
    unitRate: 12500,
    amount: 937500,
    isProvisional: false,
    confidenceScore: 0.82,
  },
  {
    id: 'i32',
    sectionId: 'sec-L',
    itemCode: 'L.02',
    description: 'Perimeter Fence Wall (225mm Block)',
    plainLanguageNote: 'Perimeter boundary fence with 225mm hollow block wall and concrete coping',
    unit: 'm',
    quantity: 85,
    unitRate: 28000,
    amount: 2380000,
    isProvisional: false,
    confidenceScore: 0.85,
  },
  {
    id: 'i33',
    sectionId: 'sec-L',
    itemCode: 'L.03',
    description: 'Soakaway Pit Construction',
    plainLanguageNote:
      'Underground soakaway pit with concrete rings and gravel filling for drainage',
    unit: 'nr',
    quantity: 2,
    unitRate: 180000,
    amount: 360000,
    isProvisional: false,
    confidenceScore: 0.78,
  },
  {
    id: 'i34',
    sectionId: 'sec-L',
    itemCode: 'L.04',
    description: 'Landscaping & Topsoil Spreading',
    plainLanguageNote:
      'Spreading of retained topsoil over compound area and planting of grass/plants',
    unit: 'm²',
    quantity: 120,
    unitRate: 3500,
    amount: 420000,
    isProvisional: false,
    confidenceScore: 0.75,
  },
];

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
      status: 'complete',
      totalEstimatedCost: mockItems.reduce((sum, i) => sum + i.amount, 0),
      currency: 'NGN',
      sections: mockSections.map((s) => ({
        ...s,
        subtotal: mockItems
          .filter((i) => i.sectionId === s.id)
          .reduce((sum, i) => sum + i.amount, 0),
      })),
      items: mockItems,
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
