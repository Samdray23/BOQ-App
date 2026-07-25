import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, Button, EmptyState } from '@/components/shared';
import { Plus, Trash2, FileSpreadsheet, FileText, GripVertical, Ruler, Lock } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useBoqStore } from '@/store/useBoqStore';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';

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

function calcQuantity(row: DimensionRow): number {
  return row.length * row.width * row.height;
}

function getUnitLabel(unit: string): string {
  return unit;
}

export default function MeasurementSheets() {
  const { projects } = useProjectStore();
  const { boqs } = useBoqStore();
  const { plan } = useSubscriptionStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [sheetName, setSheetName] = useState('Measurement Sheet');
  const [sections, setSections] = useState<SheetSection[]>([]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const projectBoq = useMemo(
    () => (selectedProjectId ? boqs.find((b) => b.projectId === selectedProjectId) || null : null),
    [boqs, selectedProjectId]
  );

  useEffect(() => {
    if (!selectedProject) {
      setSheetName('Measurement Sheet');
      setSections([]);
      return;
    }
    setSheetName(`Measurement Sheet - ${selectedProject.name}`);
  }, [selectedProject]);

  useEffect(() => {
    if (!projectBoq) {
      setSections([]);
      return;
    }
    const derived: SheetSection[] = projectBoq.sections.map((sec) => ({
      id: sec.id,
      name: sec.sectionName,
      rows: projectBoq.items
        .filter((item) => item.sectionId === sec.id)
        .map((item) => ({
          id: item.id,
          description: item.description,
          length: 0,
          width: 0,
          height: 0,
          unit: item.unit,
          calculationNotes: item.plainLanguageNote,
        })),
    }));
    setSections(derived.length > 0 ? derived : []);
  }, [projectBoq]);

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

  const canExport = plan.canExportExcel;

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
        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-3 py-2 text-sm text-[var(--sys-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
          >
            <option value="">Select project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Button onClick={() => toast.success('New measurement sheet created (demo)')}>
            <Plus className="size-4" />
            New Sheet
          </Button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!selectedProject ? (
          <motion.div
            key="no-project"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={<Ruler className="size-12" />}
              title="Select a project to view measurement sheets"
              description="Choose a project from the dropdown above to get started."
            />
          </motion.div>
        ) : !projectBoq ? (
          <motion.div
            key="no-boq"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={<FileText className="size-12" />}
              title="Generate a BOQ first to create measurement sheets"
              description="This project does not have a BOQ yet. Generate one to populate measurement sections."
            />
          </motion.div>
        ) : sections.length === 0 ? (
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
                onClick={() => {
                  if (!canExport) {
                    toast.error('Upgrade to Professional to export measurement sheets');
                    return;
                  }
                  toast.success('Measurement sheet exported to Excel (demo)');
                }}
              >
                {canExport ? (
                  <FileSpreadsheet className="size-4" />
                ) : (
                  <Lock className="size-4" />
                )}
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
