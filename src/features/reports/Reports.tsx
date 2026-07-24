import { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
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
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { Plus, FileText, Download, Eye, X, FileBarChart, Calendar, FileSpreadsheet } from 'lucide-react';

type ReportType = 'boq' | 'cost_estimate' | 'material_schedule';
type ReportStatus = 'generating' | 'complete' | 'error';

interface Report {
  id: string;
  projectName: string;
  type: ReportType;
  generatedDate: string;
  status: ReportStatus;
}

const reportTypeLabels: Record<ReportType, string> = {
  boq: 'BOQ',
  cost_estimate: 'Cost Estimate',
  material_schedule: 'Material Schedule',
};

const statusBadge: Record<ReportStatus, { variant: 'info' | 'success' | 'error'; label: string }> =
  {
    generating: { variant: 'info', label: 'Generating' },
    complete: { variant: 'success', label: 'Complete' },
    error: { variant: 'error', label: 'Error' },
  };

const mockReports: Report[] = [
  {
    id: 'r1',
    projectName: 'Luxury Villa Ikoyi',
    type: 'boq',
    generatedDate: '2026-06-10',
    status: 'complete',
  },
  {
    id: 'r2',
    projectName: 'Greenfield Estate Phase 2',
    type: 'cost_estimate',
    generatedDate: '2026-06-12',
    status: 'complete',
  },
  {
    id: 'r3',
    projectName: 'Hilltop Residence',
    type: 'material_schedule',
    generatedDate: '2026-06-13',
    status: 'generating',
  },
  {
    id: 'r4',
    projectName: 'Luxury Villa Ikoyi',
    type: 'boq',
    generatedDate: '2026-06-14',
    status: 'error',
  },
];

const generateReportTypes = [
  { value: 'boq_summary', label: 'BOQ Summary' },
  { value: 'cost_breakdown', label: 'Cost Breakdown' },
  { value: 'material_schedule', label: 'Material Schedule' },
  { value: 'full_report', label: 'Full Report' },
];

const formatOptions = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
];

const formatOptionsUpgrade = [
  { value: 'pdf', label: 'PDF (Professional+)' },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function Reports() {
  const { projects } = useProjectStore();
  const { canExport, canExportExcel, canExportCleanPdf, shouldWatermark } = useSubscriptionStore();
  const [reports] = useState<Report[]>(mockReports);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ projectId: '', reportType: 'boq_summary', format: 'pdf' });

  const handleGenerate = () => {
    if (!form.projectId) {
      toast.error('Please select a project');
      return;
    }
    if (form.format === 'excel' && !canExportExcel()) {
      toast.error('Excel export is available on Professional and Enterprise plans');
      return;
    }
    if (form.format === 'pdf' && !canExportCleanPdf() && !shouldWatermark()) {
      toast.error('PDF export is available on Professional and Enterprise plans');
      return;
    }
    toast.success(
      shouldWatermark() ? 'Generating watermarked report...' : 'Report generation started...'
    );
    setShowDialog(false);
    setForm({ projectId: '', reportType: 'boq_summary', format: 'pdf' });
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold text-[var(--sys-on-surface)]">Reports</h1>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="size-4" />
          Generate Report
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {reports.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={<FileBarChart className="size-12" />}
              title="No reports yet"
              description="Generate your first report to get started."
              action={<Button onClick={() => setShowDialog(true)}>Generate Report</Button>}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {reports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card>
                  <CardContent className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-[var(--sys-on-surface)]">
                          {report.projectName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[var(--sys-on-surface-variant)]">
                          <FileText className="size-3.5" />
                          {reportTypeLabels[report.type]}
                        </div>
                      </div>
                      <Badge variant={statusBadge[report.status].variant}>
                        {statusBadge[report.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--sys-on-surface-variant)]">
                      <Calendar className="size-3.5" />
                      {formatDate(report.generatedDate)}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success('Opening report view (demo)')}
                      >
                        <Eye className="size-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={report.status === 'generating'}
                        onClick={() => {
                          if (!canExport()) {
                            toast.error(
                              'Export is available on Professional and Enterprise plans'
                            );
                            return;
                          }
                          toast.success('Report download started');
                        }}
                      >
                        <Download className="size-4" />
                        {!canExport() ? 'Upgrade' : 'Download'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => {
                setShowDialog(false);
                setForm({ projectId: '', reportType: 'boq_summary', format: 'pdf' });
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-50"
            >
              <Card padding="lg" className="shadow-xl">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Generate Report</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowDialog(false);
                      setForm({ projectId: '', reportType: 'boq_summary', format: 'pdf' });
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    label="Project"
                    id="project"
                    value={form.projectId}
                    onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                    options={projects.map((p) => ({ value: p.id, label: p.name }))}
                    placeholder="Select a project"
                  />
                  <Select
                    label="Report Type"
                    id="reportType"
                    value={form.reportType}
                    onChange={(e) => setForm({ ...form, reportType: e.target.value })}
                    options={generateReportTypes}
                  />
                  <Select
                    label="Format"
                    id="format"
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                    options={canExportExcel() ? formatOptions : formatOptionsUpgrade}
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDialog(false);
                        setForm({ projectId: '', reportType: 'boq_summary', format: 'pdf' });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleGenerate}>Generate</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
