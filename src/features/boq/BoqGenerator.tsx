import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, Button, Badge, Select, EmptyState } from '@/components/shared';
import { useProjectStore } from '@/store/useProjectStore';
import { useBoqStore } from '@/store/useBoqStore';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { cn } from '@/lib/cn';
import {
  FileSpreadsheet,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Plus,
  RotateCcw,
  FileText,
} from 'lucide-react';
import type { BoqSection, BoqItem } from '@/types';

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

function BoqSectionRow({
  section,
  isExpanded,
  onToggle,
  onAddItem,
}: {
  section: BoqSection;
  isExpanded: boolean;
  onToggle: () => void;
  onAddItem: () => void;
}) {
  return (
    <div className="border border-[var(--sys-outline)] rounded-[var(--sys-corner-sm)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--sys-surface-container)] hover:bg-[var(--sys-surface-container)]/80 transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown className="size-4 shrink-0 text-[var(--sys-primary)]" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-[var(--sys-on-surface-variant)]" />
        )}
        <span className="text-xs font-mono font-medium text-[var(--sys-on-surface-variant)] w-10">
          {section.sectionCode}
        </span>
        <span className="flex-1 font-medium text-sm text-[var(--sys-on-surface)]">
          {section.sectionName}
        </span>
        {section.isEstimated && (
          <Badge variant="warning" className="text-[10px]">
            Estimated
          </Badge>
        )}
        <span className="text-sm font-semibold text-[var(--sys-on-surface)]">
          {formatCurrency(section.subtotal)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddItem();
          }}
          className="p-1 hover:bg-[var(--sys-surface)] rounded transition-colors text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-primary)]"
          title="Add item"
        >
          <Plus className="size-4" />
        </button>
      </button>
    </div>
  );
}

function EditableCell({
  value,
  onSave,
  className,
}: {
  value: number;
  onSave: (val: number) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = useCallback(() => {
    const parsed = parseFloat(local);
    if (!isNaN(parsed) && parsed >= 0) {
      onSave(parsed);
    } else {
      setLocal(String(value));
    }
    setEditing(false);
  }, [local, onSave, value]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        className={cn(
          'w-full h-7 px-1.5 text-sm text-right bg-[var(--sys-surface)] border border-[var(--sys-primary)] rounded-[var(--sys-corner-sm)] outline-none text-[var(--sys-on-surface)]',
          className
        )}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') {
            setLocal(String(value));
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <span
      className={cn(
        'cursor-pointer hover:bg-[var(--sys-primary)]/10 rounded px-1 -mx-1 transition-colors',
        className
      )}
      onClick={() => {
        setLocal(String(value));
        setEditing(true);
      }}
      title="Click to edit"
    >
      {value.toLocaleString('en-NG')}
    </span>
  );
}

export default function BoqGenerator() {
  const { projects } = useProjectStore();
  const { boqs, currentBoq, setCurrentBoq, createBoq, updateItem, addItem, recalculate } =
    useBoqStore();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const projectBoqs = useMemo(() => {
    if (!selectedProjectId) return [];
    return boqs.filter((b) => b.projectId === selectedProjectId);
  }, [boqs, selectedProjectId]);

  const activeBoq =
    currentBoq && currentBoq.projectId === selectedProjectId
      ? currentBoq
      : projectBoqs[projectBoqs.length - 1] || null;

  const handleGenerateBoq = () => {
    if (!selectedProjectId) {
      toast.error('Please select a project first');
      return;
    }
    createBoq(selectedProjectId);
    toast.success('New BOQ generated');
  };

  const handleRegenerate = () => {
    if (!selectedProjectId) {
      toast.error('Please select a project first');
      return;
    }
    createBoq(selectedProjectId);
    toast.success('BOQ regenerated with AI');
  };

  const { canExport, canExportExcel, canExportCleanPdf, shouldWatermark, plan } =
    useSubscriptionStore();

  const handleExport = () => {
    if (!canExport()) {
      toast.error('Export is available on Professional and Enterprise plans');
      return;
    }
    toast.success(
      shouldWatermark()
        ? 'Exporting watermarked PDF...'
        : 'Exporting clean PDF...'
    );
  };

  const handleExportExcel = () => {
    if (!canExportExcel()) {
      toast.error('Excel export is available on Professional and Enterprise plans');
      return;
    }
    toast.success('Exporting to Excel...');
  };

  const handleUpdateItem = (itemId: string, data: Partial<BoqItem>) => {
    if (!activeBoq) return;
    updateItem(activeBoq.id, itemId, data);
    recalculate(activeBoq.id);
  };

  const handleAddItem = (sectionId: string) => {
    if (!activeBoq) return;
    addItem(activeBoq.id, sectionId);
    recalculate(activeBoq.id);
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.add(sectionId);
      return next;
    });
    toast.success('New item added');
  };

  const groupedItems = useMemo(() => {
    if (!activeBoq) return [];
    return activeBoq.sections.map((sec) => ({
      section: sec,
      items: activeBoq.items.filter((i) => i.sectionId === sec.id),
    }));
  }, [activeBoq]);

  const grandTotal = activeBoq?.totalEstimatedCost ?? 0;

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[var(--sys-on-surface)]">BOQ Generator</h1>
          <div className="w-64">
            <Select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                if (e.target.value) {
                  const found = boqs.find((b) => b.projectId === e.target.value);
                  if (found) setCurrentBoq(found);
                }
              }}
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
              placeholder="Select a project..."
            />
          </div>
        </div>
        <div className="flex gap-2">
          {!canExport() && activeBoq && (
            <Button
              variant="outline"
              onClick={handleExport}
              title="Upgrade to Professional for export"
            >
              <FileSpreadsheet className="size-4 opacity-40" />
              Export (Upgrade)
            </Button>
          )}
          {canExport() && (
            <>
              <Button variant="outline" onClick={handleExportExcel} disabled={!activeBoq}>
                <FileSpreadsheet className="size-4" />
                Export Excel
              </Button>
              <Button variant="outline" onClick={handleExport} disabled={!activeBoq}>
                <FileText className="size-4" />
                {shouldWatermark() ? 'Export PDF (Watermarked)' : 'Export PDF'}
              </Button>
            </>
          )}
          <Button onClick={handleGenerateBoq} disabled={!selectedProjectId}>
            <Sparkles className="size-4" />
            Generate New BOQ
          </Button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!selectedProjectId ? (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card padding="lg">
              <EmptyState
                icon={<FileText className="size-12" />}
                title="Select a project"
                description="Choose a project from the dropdown to view or generate its Bill of Quantities."
              />
            </Card>
          </motion.div>
        ) : !activeBoq ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card padding="lg">
              <EmptyState
                icon={<FileText className="size-12" />}
                title="No BOQ generated yet"
                description="Generate a Bill of Quantities for this project using AI."
                action={
                  <Button onClick={handleGenerateBoq}>
                    <Sparkles className="size-4" />
                    Generate BOQ
                  </Button>
                }
              />
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="boq"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-semibold text-[var(--sys-on-surface)]">
                  {activeBoq.title}
                </h2>
                <Badge variant="info">v{activeBoq.version}</Badge>
                <Badge variant={activeBoq.status === 'complete' ? 'success' : 'warning'}>
                  {activeBoq.status.charAt(0).toUpperCase() + activeBoq.status.slice(1)}
                </Badge>
              </div>
              <div className="mt-2 rounded-[var(--sys-corner-sm)] border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-900/40 dark:bg-amber-900/10">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                  AI-Assisted Preliminary BOQ
                </p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400/70 mt-0.5">
                  This BOQ has been generated by BOQ AI as a preliminary estimate based on the
                  uploaded architectural drawings. It should be treated as indicative only and is
                  not a substitute for a formal Bill of Quantities prepared by a certified Quantity
                  Surveyor.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRegenerate}>
                <RotateCcw className="size-4" />
                Regenerate with AI
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddItem(activeBoq.sections[0]?.id || '')}
              >
                <Plus className="size-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {groupedItems.map(({ section, items }) => (
                <div key={section.id} className="space-y-1">
                  <BoqSectionRow
                    section={section}
                    isExpanded={expandedSections.has(section.id)}
                    onToggle={() => toggleSection(section.id)}
                    onAddItem={() => handleAddItem(section.id)}
                  />

                  <AnimatePresence>
                    {expandedSections.has(section.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-x border-b border-[var(--sys-outline)] rounded-b-[var(--sys-corner-sm)] overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-[var(--sys-outline)] bg-[var(--sys-surface-container)]/50">
                                <th className="text-left py-2 px-3 font-medium text-[var(--sys-on-surface-variant)] text-[11px] uppercase tracking-wider w-16">
                                  Code
                                </th>
                                <th className="text-left py-2 px-3 font-medium text-[var(--sys-on-surface-variant)] text-[11px] uppercase tracking-wider">
                                  Description
                                </th>
                                <th className="text-left py-2 px-3 font-medium text-[var(--sys-on-surface-variant)] text-[11px] uppercase tracking-wider w-16">
                                  Unit
                                </th>
                                <th className="text-right py-2 px-3 font-medium text-[var(--sys-on-surface-variant)] text-[11px] uppercase tracking-wider w-24">
                                  Quantity
                                </th>
                                <th className="text-right py-2 px-3 font-medium text-[var(--sys-on-surface-variant)] text-[11px] uppercase tracking-wider w-28">
                                  Unit Rate
                                </th>
                                <th className="text-right py-2 px-3 font-medium text-[var(--sys-on-surface-variant)] text-[11px] uppercase tracking-wider w-28">
                                  Amount
                                </th>
                                <th className="text-center py-2 px-3 font-medium text-[var(--sys-on-surface-variant)] text-[11px] uppercase tracking-wider w-20">
                                  Confidence
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item) => (
                                <tr
                                  key={item.id}
                                  className={cn(
                                    'border-b border-[var(--sys-outline)]/50 hover:bg-[var(--sys-surface-container)]/30 transition-colors',
                                    item.isProvisional && 'bg-yellow-50/40 dark:bg-yellow-900/10'
                                  )}
                                >
                                  <td className="py-2 px-3 text-xs font-mono text-[var(--sys-on-surface-variant)]">
                                    {item.itemCode || '—'}
                                  </td>
                                  <td className="py-2 px-3">
                                    <div>
                                      <p className="text-[var(--sys-on-surface)]">
                                        {item.description || 'Untitled item'}
                                      </p>
                                      {item.plainLanguageNote && (
                                        <p className="text-[11px] text-[var(--sys-on-surface-variant)] mt-0.5 italic">
                                          {item.plainLanguageNote}
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 text-[var(--sys-on-surface-variant)]">
                                    {item.unit}
                                  </td>
                                  <td className="py-2 px-3 text-right">
                                    <EditableCell
                                      value={item.quantity}
                                      onSave={(val) => handleUpdateItem(item.id, { quantity: val })}
                                      className="text-right font-mono"
                                    />
                                  </td>
                                  <td className="py-2 px-3 text-right">
                                    <EditableCell
                                      value={item.unitRate}
                                      onSave={(val) => handleUpdateItem(item.id, { unitRate: val })}
                                      className="text-right font-mono"
                                    />
                                  </td>
                                  <td className="py-2 px-3 text-right font-mono font-medium text-[var(--sys-on-surface)]">
                                    {formatCurrency(item.amount)}
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <span
                                      className={cn(
                                        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium',
                                        item.confidenceScore >= 0.9
                                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                          : item.confidenceScore >= 0.7
                                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                      )}
                                    >
                                      {Math.round(item.confidenceScore * 100)}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {items.length === 0 && (
                                <tr>
                                  <td
                                    colSpan={7}
                                    className="py-8 text-center text-sm text-[var(--sys-on-surface-variant)]"
                                  >
                                    No items in this section.
                                    <button
                                      onClick={() => handleAddItem(section.id)}
                                      className="ml-2 text-[var(--sys-primary)] hover:underline font-medium"
                                    >
                                      Add one
                                    </button>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <Card className="sticky bottom-4">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm">
                    {groupedItems.map(({ section }) => (
                      <span key={section.id} className="text-[var(--sys-on-surface-variant)]">
                        {section.sectionCode}:{' '}
                        <strong className="text-[var(--sys-on-surface)]">
                          {formatCurrency(section.subtotal)}
                        </strong>
                      </span>
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--sys-on-surface-variant)]">Grand Total</p>
                    <p className="text-xl font-bold text-[var(--sys-primary)]">
                      {formatCurrency(grandTotal)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
