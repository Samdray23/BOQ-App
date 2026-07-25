import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Select,
  EmptyState,
} from '@/components/shared';
import { useProjectStore } from '@/store/useProjectStore';
import { useBoqStore } from '@/store/useBoqStore';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { cn } from '@/lib/cn';
import {
  Download,
  Users,
  Package,
  Receipt,
  Percent,
  AlertTriangle,
  MapPin,
  FileSpreadsheet,
  Calculator,
  FileX,
} from 'lucide-react';
import type { CostEstimate } from '@/types';

const locationFactors: Record<string, number> = {
  Lagos: 1.0,
  Abuja: 0.95,
  'Port Harcourt': 1.05,
  Ibadan: 0.85,
  Kano: 0.8,
  'Benin City': 0.88,
  Enugu: 0.82,
  Kaduna: 0.78,
};

const LABOUR_RATIO = 0.25;
const EQUIPMENT_RATIO = 0.08;
const OVERHEADS_RATIO = 0.05;
const PROFIT_MARGIN_RATIO = 0.10;
const CONTINGENCIES_RATIO = 0.05;

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

const summaryCards = [
  { key: 'labourCost' as const, label: 'Labour Cost', icon: Users, color: 'var(--sys-primary)' },
  {
    key: 'materialCost' as const,
    label: 'Material Cost',
    icon: Package,
    color: 'var(--sys-secondary)',
  },
  { key: 'equipmentCost' as const, label: 'Equipment Cost', icon: Crane, color: '#fc7c2d' },
  { key: 'overheads' as const, label: 'Overheads', icon: Receipt, color: '#8b5cf6' },
  { key: 'profitMargin' as const, label: 'Profit Margin', icon: Percent, color: '#10b981' },
  { key: 'contingencies' as const, label: 'Contingencies', icon: AlertTriangle, color: '#f59e0b' },
];

function Crane({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M12 21V3" />
      <path d="M5 7l7-4 7 4" />
      <path d="M19 21V7" />
      <path d="M15 21V11" />
      <path d="M9 21V11" />
      <path d="M9 7h6" />
    </svg>
  );
}

function calculateEstimate(totalMaterial: number): CostEstimate {
  const materialCost = totalMaterial;
  const labourCost = totalMaterial * LABOUR_RATIO;
  const equipmentCost = totalMaterial * EQUIPMENT_RATIO;
  const overheads = totalMaterial * OVERHEADS_RATIO;
  const profitMargin = totalMaterial * PROFIT_MARGIN_RATIO;
  const contingencies = totalMaterial * CONTINGENCIES_RATIO;
  const total = materialCost + labourCost + equipmentCost + overheads + profitMargin + contingencies;
  return { materialCost, labourCost, equipmentCost, overheads, profitMargin, contingencies, total };
}

export default function CostEstimation() {
  const { projects } = useProjectStore();
  const { boqs } = useBoqStore();
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const project = projects.find((p) => p.id === selectedProjectId);
  const boq = boqs.find((b) => b.projectId === selectedProjectId);

  const locationFactor = project ? (locationFactors[project.location] ?? 1.0) : 1.0;

  const estimate = useMemo(() => {
    if (!boq || boq.items.length === 0) return null;
    const totalMaterial = boq.items.reduce((sum, item) => sum + item.amount, 0);
    return calculateEstimate(totalMaterial);
  }, [boq]);

  const adjustedEstimate = useMemo(() => {
    if (!estimate) return null;
    return {
      labourCost: estimate.labourCost * locationFactor,
      materialCost: estimate.materialCost * locationFactor,
      equipmentCost: estimate.equipmentCost * locationFactor,
      overheads: estimate.overheads * locationFactor,
      profitMargin: estimate.profitMargin * locationFactor,
      contingencies: estimate.contingencies * locationFactor,
      total: estimate.total * locationFactor,
    };
  }, [estimate, locationFactor]);

  const categories = useMemo(() => {
    if (!adjustedEstimate) return [];
    return [
      { key: 'labourCost' as const, label: 'Labour', amount: adjustedEstimate.labourCost },
      { key: 'materialCost' as const, label: 'Materials', amount: adjustedEstimate.materialCost },
      { key: 'equipmentCost' as const, label: 'Equipment', amount: adjustedEstimate.equipmentCost },
      { key: 'overheads' as const, label: 'Overheads', amount: adjustedEstimate.overheads },
      { key: 'profitMargin' as const, label: 'Profit Margin', amount: adjustedEstimate.profitMargin },
      { key: 'contingencies' as const, label: 'Contingencies', amount: adjustedEstimate.contingencies },
    ];
  }, [adjustedEstimate]);

  const adjustedTotal = adjustedEstimate?.total ?? 0;

  const { canExport } = useSubscriptionStore();

  const handleExport = () => {
    if (!canExport()) {
      toast.error('Export is available on Professional and Enterprise plans');
      return;
    }
    toast.success('Exporting cost estimate...');
  };

  const handleExportExcel = () => {
    if (!canExport()) {
      toast.error('Export is available on Professional and Enterprise plans');
      return;
    }
    toast.success('Exporting cost estimate to Excel...');
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[var(--sys-on-surface)]">Cost Estimation</h1>
          <div className="w-56">
            <Select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
              placeholder="Select a project..."
            />
          </div>
        </div>
        {estimate && (
          <>
            {!canExport() ? (
              <Button variant="outline" onClick={handleExport}>
                <Download className="size-4 opacity-40" />
                Export (Upgrade)
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleExportExcel}>
                  <FileSpreadsheet className="size-4" />
                  Export Excel
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="size-4" />
                  Export PDF
                </Button>
              </>
            )}
          </>
        )}
      </motion.div>

      {!selectedProjectId && (
        <EmptyState
          icon={<Calculator className="size-12" />}
          title="Select a project to view cost estimation"
          description="Choose a project from the dropdown above to calculate cost estimates based on its Bill of Quantities."
        />
      )}

      {selectedProjectId && !boq && (
        <EmptyState
          icon={<FileX className="size-12" />}
          title="Generate a BOQ first to see cost estimates"
          description="This project doesn't have a Bill of Quantities yet. Create one to automatically calculate cost estimates."
        />
      )}

      {selectedProjectId && boq && boq.items.length === 0 && (
        <EmptyState
          icon={<FileX className="size-12" />}
          title="Generate a BOQ first to see cost estimates"
          description="This project has an empty Bill of Quantities. Add items to generate cost estimates."
        />
      )}

      {estimate && adjustedEstimate && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {summaryCards.map((card, i) => {
              const Icon = card.icon;
              const value = adjustedEstimate[card.key];
              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card padding="sm">
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="rounded-lg p-1.5"
                          style={{ backgroundColor: `${card.color}15`, color: card.color }}
                        >
                          <Icon className="size-4" />
                        </div>
                        <span className="text-[11px] font-medium text-[var(--sys-on-surface-variant)] truncate">
                          {card.label}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-[var(--sys-on-surface)]">
                        {formatCurrency(value)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Cost Breakdown</CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-[var(--sys-on-surface-variant)]" />
                  {project ? (
                    <Badge variant="info">
                      {project.location} ({locationFactor}x)
                    </Badge>
                  ) : (
                    <span className="text-[var(--sys-on-surface-variant)]">No location set</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--sys-outline)]">
                        <th className="text-left py-3 px-2 font-medium text-[var(--sys-on-surface-variant)]">
                          Category
                        </th>
                        <th className="text-right py-3 px-2 font-medium text-[var(--sys-on-surface-variant)]">
                          Amount (NGN)
                        </th>
                        <th className="text-right py-3 px-2 font-medium text-[var(--sys-on-surface-variant)] hidden sm:table-cell">
                          % of Total
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-[var(--sys-on-surface-variant)] hidden md:table-cell">
                          Distribution
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => {
                        const pct = adjustedTotal > 0 ? (cat.amount / adjustedTotal) * 100 : 0;
                        return (
                          <tr
                            key={cat.key}
                            className="border-b border-[var(--sys-outline)]/50 hover:bg-[var(--sys-surface-container)]/30 transition-colors"
                          >
                            <td className="py-3 px-2 font-medium text-[var(--sys-on-surface)] capitalize">
                              {cat.label}
                            </td>
                            <td className="py-3 px-2 text-right font-mono text-[var(--sys-on-surface)]">
                              {formatCurrency(cat.amount)}
                            </td>
                            <td className="py-3 px-2 text-right text-[var(--sys-on-surface-variant)] hidden sm:table-cell">
                              {pct.toFixed(1)}%
                            </td>
                            <td className="py-3 px-2 hidden md:table-cell">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2.5 rounded-full bg-[var(--sys-surface-container)] overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${pct}%`,
                                      backgroundColor:
                                        summaryCards.find((c) => c.key === cat.key)?.color ||
                                        'var(--sys-primary)',
                                    }}
                                  />
                                </div>
                                <span className="text-[11px] text-[var(--sys-on-surface-variant)] w-10 text-right font-mono">
                                  {pct.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[var(--sys-outline)]">
                        <td className="py-3 px-2 font-bold text-[var(--sys-on-surface)]">Total</td>
                        <td className="py-3 px-2 text-right font-bold font-mono text-[var(--sys-primary)]">
                          {formatCurrency(adjustedTotal)}
                        </td>
                        <td className="py-3 px-2 text-right text-[var(--sys-on-surface-variant)] hidden sm:table-cell">
                          100%
                        </td>
                        <td className="py-3 px-2 hidden md:table-cell">
                          <div className="flex items-center gap-1 h-3">
                            {categories.map((cat) => {
                              const pct = adjustedTotal > 0 ? (cat.amount / adjustedTotal) * 100 : 0;
                              if (pct < 1) return null;
                              return (
                                <div
                                  key={cat.key}
                                  className="h-full rounded-sm first:rounded-l-full last:rounded-r-full"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor:
                                      summaryCards.find((c) => c.key === cat.key)?.color ||
                                      'var(--sys-primary)',
                                  }}
                                  title={`${cat.label}: ${pct.toFixed(1)}%`}
                                />
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {project && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Location Adjustment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                    {Object.entries(locationFactors).map(([loc, factor]) => (
                      <div
                        key={loc}
                        className={cn(
                          'rounded-[var(--sys-corner-sm)] border px-3 py-2 text-center transition-colors',
                          loc === project.location
                            ? 'border-[var(--sys-primary)] bg-[var(--sys-primary)]/10 text-[var(--sys-primary)]'
                            : 'border-[var(--sys-outline)] text-[var(--sys-on-surface-variant)]'
                        )}
                      >
                        <p className="text-xs font-medium">{loc}</p>
                        <p className="text-sm font-bold">{factor}x</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-[var(--sys-on-surface-variant)] bg-[var(--sys-surface-container)] rounded-[var(--sys-corner-sm)] px-4 py-3">
                    <MapPin className="size-4 shrink-0 text-[var(--sys-primary)]" />
                    <span>
                      <strong className="text-[var(--sys-on-surface)]">{project.location}</strong>{' '}
                      adjustment factor:{' '}
                      <strong className="text-[var(--sys-on-surface)]">{locationFactor}x</strong> — Base
                      estimate{' '}
                      <strong className="text-[var(--sys-on-surface)]">
                        {formatCurrency(estimate!.total)}
                      </strong>{' '}
                      → Adjusted{' '}
                      <strong className="text-[var(--sys-primary)]">
                        {formatCurrency(adjustedTotal)}
                      </strong>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
