import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, Button, EmptyState } from '@/components/shared';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useBoqStore } from '@/store/useBoqStore';
import { Plus, ChevronDown, ChevronRight, FileDown, ClipboardList, Search, Package } from 'lucide-react';

interface MaterialItem {
  id: string;
  materialType: string;
  description: string;
  unit: string;
  estQuantity: number;
  wastageFactor: number;
  unitPrice: number;
}

interface Schedule {
  id: string;
  projectName: string;
  date: string;
  items: MaterialItem[];
}

function calcAdjustedQty(qty: number, wastage: number) {
  return qty * (1 + wastage / 100);
}

function formatNgn(amount: number) {
  return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MaterialSchedules() {
  const { canExport, shouldWatermark } = useSubscriptionStore();
  const { projects, selectedProject, setSelectedProject } = useProjectStore();
  const { boqs } = useBoqStore();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('');

  const currentBoq = useMemo(
    () => (selectedProject ? boqs.find((b) => b.projectId === selectedProject.id) ?? null : null),
    [boqs, selectedProject]
  );

  const derivedMaterials = useMemo<MaterialItem[]>(() => {
    if (!currentBoq || currentBoq.items.length === 0) return [];
    return currentBoq.items
      .filter((item) => item.quantity > 0 && item.unit)
      .map((item) => ({
        id: item.id,
        materialType: item.description || item.itemCode || 'Unnamed Material',
        description: item.plainLanguageNote || item.description,
        unit: item.unit,
        estQuantity: item.quantity,
        wastageFactor: 5,
        unitPrice: item.unitRate,
      }));
  }, [currentBoq]);

  const filtered = useMemo(() => {
    const list = projectFilter
      ? schedules.filter((s) => {
          const proj = projects.find((p) => p.name === s.projectName);
          return proj?.id === projectFilter;
        })
      : schedules;
    return list.filter((s) =>
      s.projectName.toLowerCase().includes(search.toLowerCase())
    );
  }, [schedules, projectFilter, search, projects]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const updateWastage = (scheduleId: string, itemId: string, value: number) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              items: s.items.map((item) =>
                item.id === itemId ? { ...item, wastageFactor: value } : item
              ),
            }
          : s
      )
    );
  };

  const getScheduleTotal = (items: MaterialItem[]) => {
    return items.reduce((sum, item) => {
      const adjQty = calcAdjustedQty(item.estQuantity, item.wastageFactor);
      return sum + adjQty * item.unitPrice;
    }, 0);
  };

  const createScheduleFromBoq = () => {
    if (!currentBoq || !selectedProject) return;
    if (derivedMaterials.length === 0) {
      toast.error('No items with quantities found in BOQ');
      return;
    }
    const newSchedule: Schedule = {
      id: crypto.randomUUID(),
      projectName: selectedProject.name,
      date: new Date().toISOString(),
      items: derivedMaterials.map((m) => ({ ...m, id: crypto.randomUUID() })),
    };
    setSchedules((prev) => [newSchedule, ...prev]);
    toast.success('Material schedule created from BOQ');
  };

  const renderContent = () => {
    if (!selectedProject) {
      return (
        <EmptyState
          icon={<Package className="size-12" />}
          title="Select a project to view material schedules"
          description="Choose a project from the selector above to get started."
        />
      );
    }

    if (!currentBoq) {
      return (
        <EmptyState
          icon={<ClipboardList className="size-12" />}
          title="Generate a BOQ first to create material schedules"
          description="Go to BOQ Generator and create a bill of quantities for this project."
        />
      );
    }

    if (filtered.length === 0) {
      return (
        <EmptyState
          icon={<ClipboardList className="size-12" />}
          title="No material schedules"
          description={
            search
              ? 'Try a different search term.'
              : schedules.length === 0
                ? 'Create your first material schedule from the BOQ data.'
                : 'No schedules match your filter.'
          }
          action={
            !search ? (
              <Button onClick={createScheduleFromBoq}>
                <Plus className="size-4" />
                Create from BOQ
              </Button>
            ) : undefined
          }
        />
      );
    }

    return (
      <div className="space-y-3">
        {filtered.map((schedule, i) => {
          const total = getScheduleTotal(schedule.items);
          const isExpanded = expandedId === schedule.id;
          return (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card padding="none">
                <button
                  onClick={() => toggleExpand(schedule.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[var(--sys-surface-container)]/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="size-4 text-[var(--sys-on-surface-variant)]" />
                    ) : (
                      <ChevronRight className="size-4 text-[var(--sys-on-surface-variant)]" />
                    )}
                    <div>
                      <p className="font-semibold text-[var(--sys-on-surface)]">
                        {schedule.projectName}
                      </p>
                      <p className="text-xs text-[var(--sys-on-surface-variant)]">
                        {new Date(schedule.date).toLocaleDateString('en-NG', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {' · '}
                        {schedule.items.length} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[var(--sys-primary)]">
                      {formatNgn(total)}
                    </p>
                    <p className="text-xs text-[var(--sys-on-surface-variant)]">Total Value</p>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-[var(--sys-outline)]"
                    >
                      <div className="p-4 space-y-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-[var(--sys-outline)]">
                                <th className="text-left py-2 px-2 font-medium text-[var(--sys-on-surface-variant)] text-xs">
                                  Material Type
                                </th>
                                <th className="text-left py-2 px-2 font-medium text-[var(--sys-on-surface-variant)] text-xs">
                                  Description
                                </th>
                                <th className="text-center py-2 px-2 font-medium text-[var(--sys-on-surface-variant)] text-xs">
                                  Unit
                                </th>
                                <th className="text-right py-2 px-2 font-medium text-[var(--sys-on-surface-variant)] text-xs">
                                  Est. Qty
                                </th>
                                <th className="text-center py-2 px-2 font-medium text-[var(--sys-on-surface-variant)] text-xs">
                                  Wastage (%)
                                </th>
                                <th className="text-right py-2 px-2 font-medium text-[var(--sys-on-surface-variant)] text-xs">
                                  Adj. Qty
                                </th>
                                <th className="text-right py-2 px-2 font-medium text-[var(--sys-on-surface-variant)] text-xs">
                                  Unit Price (NGN)
                                </th>
                                <th className="text-right py-2 px-2 font-medium text-[var(--sys-on-surface-variant)] text-xs">
                                  Total (NGN)
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {schedule.items.map((item) => {
                                const adjQty = calcAdjustedQty(
                                  item.estQuantity,
                                  item.wastageFactor
                                );
                                const itemTotal = adjQty * item.unitPrice;
                                return (
                                  <tr
                                    key={item.id}
                                    className="border-b border-[var(--sys-outline)]/50 hover:bg-[var(--sys-surface-container)]/30 transition-colors"
                                  >
                                    <td className="py-2.5 px-2 font-medium text-[var(--sys-on-surface)]">
                                      {item.materialType}
                                    </td>
                                    <td className="py-2.5 px-2 text-[var(--sys-on-surface-variant)] text-xs max-w-[200px] truncate">
                                      {item.description}
                                    </td>
                                    <td className="py-2.5 px-2 text-center text-[var(--sys-on-surface-variant)]">
                                      {item.unit}
                                    </td>
                                    <td className="py-2.5 px-2 text-right text-[var(--sys-on-surface)]">
                                      {item.estQuantity.toLocaleString()}
                                    </td>
                                    <td className="py-2.5 px-2 text-center">
                                      <input
                                        type="number"
                                        value={item.wastageFactor}
                                        onChange={(e) =>
                                          updateWastage(
                                            schedule.id,
                                            item.id,
                                            Math.max(0, parseFloat(e.target.value) || 0)
                                          )
                                        }
                                        className="w-16 text-center rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-1.5 py-1 text-xs text-[var(--sys-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                        step="0.5"
                                        min="0"
                                      />
                                    </td>
                                    <td className="py-2.5 px-2 text-right text-[var(--sys-on-surface)] font-medium">
                                      {adjQty.toFixed(2)}
                                    </td>
                                    <td className="py-2.5 px-2 text-right text-[var(--sys-on-surface)]">
                                      {formatNgn(item.unitPrice)}
                                    </td>
                                    <td className="py-2.5 px-2 text-right text-[var(--sys-on-surface)] font-semibold">
                                      {formatNgn(itemTotal)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td
                                  colSpan={7}
                                  className="py-3 px-2 text-right font-semibold text-[var(--sys-on-surface)]"
                                >
                                  Grand Total
                                </td>
                                <td className="py-3 px-2 text-right font-bold text-[var(--sys-primary)]">
                                  {formatNgn(total)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>

                        <div className="flex justify-end">
                          {!canExport() ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toast.error(
                                  'Export is available on Professional and Enterprise plans'
                                )
                              }
                            >
                              <FileDown className="size-4 opacity-40" />
                              Export (Upgrade)
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toast.success(
                                  shouldWatermark()
                                    ? 'Exporting watermarked PDF...'
                                    : 'Exporting material schedule...'
                                )
                              }
                            >
                              <FileDown className="size-4" />
                              Export Material Schedule
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold text-[var(--sys-on-surface)]">Material Schedules</h1>
        {selectedProject && currentBoq && (
          <Button onClick={createScheduleFromBoq}>
            <Plus className="size-4" />
            New Schedule
          </Button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative max-w-xs">
          <label className="sr-only">Select project</label>
          <select
            value={selectedProject?.id ?? ''}
            onChange={(e) => {
              const proj = projects.find((p) => p.id === e.target.value) ?? null;
              setSelectedProject(proj);
              setExpandedId(null);
            }}
            className="flex h-10 w-full rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-3 py-2 text-sm text-[var(--sys-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors appearance-none"
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[var(--sys-on-surface-variant)] pointer-events-none" />
        </div>

        {schedules.length > 0 && (
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--sys-on-surface-variant)]" />
            <input
              className="flex h-10 w-full rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] pl-9 pr-3 py-2 text-sm text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
              placeholder="Search schedules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedProject?.id ?? 'empty'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
