import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, Button, EmptyState } from '@/components/shared';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { Plus, ChevronDown, ChevronRight, FileDown, ClipboardList, Search } from 'lucide-react';

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

const defaultItems: MaterialItem[] = [
  {
    id: 'm1',
    materialType: 'Cement (OPC)',
    description: 'Portland cement for structural concrete',
    unit: 'bags',
    estQuantity: 500,
    wastageFactor: 5,
    unitPrice: 5500,
  },
  {
    id: 'm2',
    materialType: 'Sharp Sand',
    description: 'Washed sharp sand for concrete and blockwork',
    unit: 'tonnes',
    estQuantity: 30,
    wastageFactor: 10,
    unitPrice: 4200,
  },
  {
    id: 'm3',
    materialType: 'Granite (¾")',
    description: 'Crushed granite aggregate for concrete',
    unit: 'tonnes',
    estQuantity: 45,
    wastageFactor: 8,
    unitPrice: 8500,
  },
  {
    id: 'm4',
    materialType: 'Reinforcement (Y12)',
    description: '12mm high-yield steel reinforcement bars',
    unit: 'tonnes',
    estQuantity: 15,
    wastageFactor: 5,
    unitPrice: 620000,
  },
  {
    id: 'm5',
    materialType: 'Hollow Blocks (225mm)',
    description: '225mm sandcrete hollow blocks',
    unit: 'pieces',
    estQuantity: 3400,
    wastageFactor: 3,
    unitPrice: 350,
  },
  {
    id: 'm6',
    materialType: 'PVC Ceiling Sheets',
    description: 'PVC ceiling boards with accessories',
    unit: 'm²',
    estQuantity: 210,
    wastageFactor: 5,
    unitPrice: 3800,
  },
  {
    id: 'm7',
    materialType: 'Ceramic Tiles',
    description: '600x600mm ceramic floor tiles',
    unit: 'm²',
    estQuantity: 260,
    wastageFactor: 8,
    unitPrice: 4200,
  },
];

const mockSchedules: Schedule[] = [
  { id: 's1', projectName: 'Luxury Villa Ikoyi', date: '2026-06-10', items: defaultItems },
  {
    id: 's2',
    projectName: 'Greenfield Estate Phase 2',
    date: '2026-06-12',
    items: defaultItems.map((i) => ({
      ...i,
      estQuantity: Math.round(i.estQuantity * 2.5),
      id: crypto.randomUUID(),
    })),
  },
];

function calcAdjustedQty(qty: number, wastage: number) {
  return qty * (1 + wastage / 100);
}

function formatNgn(amount: number) {
  return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function MaterialSchedules() {
  const { canExport, shouldWatermark } = useSubscriptionStore();
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = schedules.filter((s) =>
    s.projectName.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold text-[var(--sys-on-surface)]">Material Schedules</h1>
        <Button onClick={() => toast.success('New schedule created (demo)')}>
          <Plus className="size-4" />
          New Schedule
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-xs"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--sys-on-surface-variant)]" />
        <input
          className="flex h-10 w-full rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] pl-9 pr-3 py-2 text-sm text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
          placeholder="Search schedules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={<ClipboardList className="size-12" />}
              title="No material schedules"
              description={
                search
                  ? 'Try a different search term.'
                  : 'Create your first material schedule to get started.'
              }
              action={
                !search ? (
                  <Button onClick={() => toast.success('New schedule created (demo)')}>
                    Create Schedule
                  </Button>
                ) : undefined
              }
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
