import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, Button, EmptyState } from '@/components/shared';
import { Plus, Trash2, FileSpreadsheet, FileText, GripVertical, Ruler } from 'lucide-react';

interface DimensionRow {
  id: string;
  description: string;
  length: number;
  width: number;
  height: number;
  unit: string;
  calculationNotes: string;
}

interface SheetSection {
  id: string;
  name: string;
  rows: DimensionRow[];
}

const unitOptions = ['m³', 'm²', 'm', 'nr', 'kg', 'tonnes'];

function createRow(): DimensionRow {
  return {
    id: crypto.randomUUID(),
    description: '',
    length: 0,
    width: 0,
    height: 0,
    unit: 'm³',
    calculationNotes: '',
  };
}

function createSection(name: string): SheetSection {
  return { id: crypto.randomUUID(), name, rows: [createRow()] };
}

const defaultSections: SheetSection[] = [
  {
    id: 'sec-1',
    name: 'Excavation',
    rows: [
      {
        id: 'r1',
        description: 'Strip foundation excavation (600mm wide × 900mm deep)',
        length: 120,
        width: 0.6,
        height: 0.9,
        unit: 'm³',
        calculationNotes: 'Perimeter 120m, strip width 600mm, depth 900mm',
      },
    ],
  },
  {
    id: 'sec-2',
    name: 'Concrete Work',
    rows: [
      {
        id: 'r2',
        description: 'Ground floor slab (150mm thick)',
        length: 200,
        width: 150,
        height: 0.15,
        unit: 'm³',
        calculationNotes: 'Slab area 200m², thickness 150mm',
      },
    ],
  },
  {
    id: 'sec-3',
    name: 'Blockwork',
    rows: [
      {
        id: 'r3',
        description: 'External wall blockwork (225mm hollow blocks)',
        length: 85,
        width: 3.2,
        height: 1,
        unit: 'm²',
        calculationNotes: 'Wall length 85m, height 3.2m',
      },
    ],
  },
  {
    id: 'sec-4',
    name: 'Plastering',
    rows: [
      {
        id: 'r4',
        description: 'Internal wall plastering (12mm thick)',
        length: 75,
        width: 3.2,
        height: 1,
        unit: 'm²',
        calculationNotes: 'Wall length 75m, height 3.2m, both faces',
      },
    ],
  },
];

function calcQuantity(row: DimensionRow): number {
  return row.length * row.width * row.height;
}

function getUnitLabel(unit: string): string {
  return unit;
}

export function MeasurementSheets() {
  const [sheetName, setSheetName] = useState('Measurement Sheet - Luxury Villa Ikoyi');
  const [sections, setSections] = useState<SheetSection[]>(defaultSections);

  const addSection = () => {
    setSections((prev) => [...prev, createSection(`Section ${prev.length + 1}`)]);
  };

  const updateSectionName = (sectionId: string, name: string) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, name } : s)));
  };

  const addRow = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, rows: [...s.rows, createRow()] } : s))
    );
  };

  const removeRow = (sectionId: string, rowId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, rows: s.rows.filter((r) => r.id !== rowId) } : s
      )
    );
  };

  const updateRow = (sectionId: string, rowId: string, data: Partial<DimensionRow>) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, rows: s.rows.map((r) => (r.id === rowId ? { ...r, ...data } : r)) }
          : s
      )
    );
  };

  const getSectionTotal = (rows: DimensionRow[]) => {
    return rows.reduce((sum, r) => sum + calcQuantity(r), 0);
  };

  const getGrandTotal = () => {
    return sections.reduce((sum, s) => sum + getSectionTotal(s.rows), 0);
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[var(--sys-on-surface)]">Measurement Sheets</h1>
          <input
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            className="text-sm text-[var(--sys-on-surface-variant)] bg-transparent border-none outline-none focus:underline underline-offset-2 px-0 py-0 w-auto max-w-md"
          />
        </div>
        <Button onClick={() => toast.success('New measurement sheet created (demo)')}>
          <Plus className="size-4" />
          New Sheet
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {sections.length === 0 && sections.every((s) => s.rows.length === 0) ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={<Ruler className="size-12" />}
              title="No measurement data"
              description="Add dimensions to start your measurement sheet."
              action={<Button onClick={addSection}>Add Section</Button>}
            />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {sections.map((section, si) => {
              const sectionTotal = getSectionTotal(section.rows);
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.06 }}
                >
                  <Card padding="none">
                    <div className="flex items-center gap-3 p-4 border-b border-[var(--sys-outline)]">
                      <GripVertical className="size-4 text-[var(--sys-on-surface-variant)] shrink-0" />
                      <input
                        value={section.name}
                        onChange={(e) => updateSectionName(section.id, e.target.value)}
                        className="font-semibold text-[var(--sys-on-surface)] bg-transparent border-none outline-none flex-1 text-base"
                      />
                      <span className="text-sm text-[var(--sys-on-surface-variant)]">
                        Section subtotal:{' '}
                        <span className="font-semibold text-[var(--sys-primary)]">
                          {sectionTotal.toFixed(2)} {getUnitLabel(section.rows[0]?.unit || 'm³')}
                        </span>
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => addRow(section.id)}>
                        <Plus className="size-4" />
                        Add Row
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--sys-outline)]">
                            <th className="text-left py-2.5 px-3 font-medium text-[var(--sys-on-surface-variant)] text-xs w-10">
                              No.
                            </th>
                            <th className="text-left py-2.5 px-2 font-medium text-[var(--sys-on-surface-variant)] text-xs min-w-[200px]">
                              Description
                            </th>
                            <th className="text-center py-2.5 px-2 font-medium text-[var(--sys-on-surface-variant)] text-xs">
                              Length (m)
                            </th>
                            <th className="text-center py-2.5 px-2 font-medium text-[var(--sys-on-surface-variant)] text-xs">
                              Width (m)
                            </th>
                            <th className="text-center py-2.5 px-2 font-medium text-[var(--sys-on-surface-variant)] text-xs">
                              Height (m)
                            </th>
                            <th className="text-right py-2.5 px-2 font-medium text-[var(--sys-on-surface-variant)] text-xs">
                              Quantity
                            </th>
                            <th className="text-center py-2.5 px-2 font-medium text-[var(--sys-on-surface-variant)] text-xs">
                              Unit
                            </th>
                            <th className="text-left py-2.5 px-2 font-medium text-[var(--sys-on-surface-variant)] text-xs min-w-[160px]">
                              Calculation Notes
                            </th>
                            <th className="py-2.5 px-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.rows.map((row, ri) => {
                            const qty = calcQuantity(row);
                            return (
                              <tr
                                key={row.id}
                                className="border-b border-[var(--sys-outline)]/50 hover:bg-[var(--sys-surface-container)]/30 transition-colors"
                              >
                                <td className="py-2 px-3 text-[var(--sys-on-surface-variant)] text-xs">
                                  {ri + 1}
                                </td>
                                <td className="py-2 px-2">
                                  <textarea
                                    value={row.description}
                                    onChange={(e) =>
                                      updateRow(section.id, row.id, { description: e.target.value })
                                    }
                                    rows={2}
                                    className="w-full rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-2.5 py-1.5 text-xs text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors resize-none"
                                    placeholder="Describe the work item..."
                                  />
                                </td>
                                <td className="py-2 px-2">
                                  <input
                                    type="number"
                                    value={row.length || ''}
                                    onChange={(e) =>
                                      updateRow(section.id, row.id, {
                                        length: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="w-20 text-center rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-2 py-1.5 text-xs text-[var(--sys-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td className="py-2 px-2">
                                  <input
                                    type="number"
                                    value={row.width || ''}
                                    onChange={(e) =>
                                      updateRow(section.id, row.id, {
                                        width: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="w-20 text-center rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-2 py-1.5 text-xs text-[var(--sys-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td className="py-2 px-2">
                                  <input
                                    type="number"
                                    value={row.height || ''}
                                    onChange={(e) =>
                                      updateRow(section.id, row.id, {
                                        height: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="w-20 text-center rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-2 py-1.5 text-xs text-[var(--sys-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td className="py-2 px-2 text-right font-medium text-[var(--sys-on-surface)]">
                                  {qty.toFixed(2)}
                                </td>
                                <td className="py-2 px-2">
                                  <select
                                    value={row.unit}
                                    onChange={(e) =>
                                      updateRow(section.id, row.id, { unit: e.target.value })
                                    }
                                    className="w-16 text-center rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-1 py-1.5 text-xs text-[var(--sys-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                  >
                                    {unitOptions.map((u) => (
                                      <option key={u} value={u}>
                                        {u}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-2 px-2">
                                  <input
                                    value={row.calculationNotes}
                                    onChange={(e) =>
                                      updateRow(section.id, row.id, {
                                        calculationNotes: e.target.value,
                                      })
                                    }
                                    className="w-full rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-2 py-1.5 text-xs text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                    placeholder="e.g. L×W×H calculation"
                                  />
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <button
                                    onClick={() => removeRow(section.id, row.id)}
                                    className="text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-error)] transition-colors p-1"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-[var(--sys-surface-container)]/50">
                            <td
                              colSpan={5}
                              className="py-2.5 px-3 text-right font-semibold text-[var(--sys-on-surface)] text-xs"
                            >
                              Section Total
                            </td>
                            <td className="py-2.5 px-2 text-right font-bold text-[var(--sys-primary)]">
                              {sectionTotal.toFixed(2)}
                            </td>
                            <td colSpan={3}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={addSection}>
                <Plus className="size-4" />
                Add Section
              </Button>

              <Card padding="sm" className="inline-flex items-center gap-4">
                <span className="text-sm text-[var(--sys-on-surface-variant)]">Grand Total:</span>
                <span className="text-lg font-bold text-[var(--sys-primary)]">
                  {getGrandTotal().toFixed(2)} m³
                </span>
              </Card>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => toast.success('Measurement sheet exported to Excel (demo)')}
              >
                <FileSpreadsheet className="size-4" />
                Export to Excel
              </Button>
              <Button onClick={() => toast.success('Measurement sent to BOQ generator (demo)')}>
                <FileText className="size-4" />
                Send to BOQ
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
