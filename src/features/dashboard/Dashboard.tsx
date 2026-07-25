import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  EmptyState,
} from '@/components/shared';
import { useAuthStore } from '@/store/useAuthStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useBoqStore } from '@/store/useBoqStore';
import { cn } from '@/lib/cn';
import {
  FolderKanban,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  Eye,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { ProjectStatus } from '@/types';

const statusBadge: Record<
  ProjectStatus,
  { variant: 'success' | 'warning' | 'info' | 'error'; label: string }
> = {
  draft: { variant: 'warning', label: 'Draft' },
  processing: { variant: 'info', label: 'Processing' },
  complete: { variant: 'success', label: 'Complete' },
  error: { variant: 'error', label: 'Error' },
  archived: { variant: 'default', label: 'Archived' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `₦${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${(value / 1_000).toFixed(1)}K`;
  return `₦${value.toLocaleString()}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { projects } = useProjectStore();
  const { boqs } = useBoqStore();
  const [aiQuery, setAiQuery] = useState('');

  const activeProjects = projects.filter(
    (p) => p.status === 'processing' || p.status === 'draft'
  ).length;
  const completedProjects = projects.filter((p) => p.status === 'complete').length;
  const totalBoqValue = boqs.reduce((sum, b) => sum + b.totalEstimatedCost, 0);

  const kpis = [
    {
      key: 'total',
      label: 'Total Projects',
      value: projects.length,
      icon: FolderKanban,
    },
    {
      key: 'active',
      label: 'Active Projects',
      value: activeProjects,
      icon: Clock,
    },
    {
      key: 'completed',
      label: 'Completed',
      value: completedProjects,
      icon: CheckCircle2,
    },
    {
      key: 'value',
      label: 'Total BOQ Value',
      value: formatCurrency(totalBoqValue),
      icon: DollarSign,
    },
  ];

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[var(--sys-on-surface)]">
            {getGreeting()}, {user?.name || 'there'}
          </h1>
          <p className="text-sm text-[var(--sys-on-surface-variant)]">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <Badge variant="info" className="capitalize">
          {user?.role?.replace(/_/g, ' ') || 'Quantity Surveyor'}
        </Badge>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="rounded-lg bg-[var(--sys-primary)]/10 p-2.5 text-[var(--sys-primary)]">
                      <Icon className="size-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--sys-on-surface)]">{kpi.value}</p>
                    <p className="text-sm text-[var(--sys-on-surface-variant)]">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                <Plus className="size-4" />
                New Project
              </Button>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <EmptyState
                  icon={<FolderKanban className="size-12" />}
                  title="No projects yet"
                  description="Create your first project to get started."
                  action={<Button onClick={() => navigate('/projects/new')}>Create Project</Button>}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--sys-outline)]">
                        <th className="text-left py-3 px-2 font-medium text-[var(--sys-on-surface-variant)]">
                          Project
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-[var(--sys-on-surface-variant)]">
                          Location
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-[var(--sys-on-surface-variant)]">
                          Status
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-[var(--sys-on-surface-variant)] hidden md:table-cell">
                          Date
                        </th>
                        <th className="text-right py-3 px-2 font-medium text-[var(--sys-on-surface-variant)]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.slice(0, 5).map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-[var(--sys-outline)]/50 hover:bg-[var(--sys-surface-container)]/50 transition-colors"
                        >
                          <td className="py-3 px-2 font-medium text-[var(--sys-on-surface)]">
                            {p.name}
                          </td>
                          <td className="py-3 px-2 text-[var(--sys-on-surface-variant)]">
                            {p.location}
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant={statusBadge[p.status].variant}>
                              {statusBadge[p.status].label}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-[var(--sys-on-surface-variant)] hidden md:table-cell">
                            {formatDate(p.createdAt)}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/projects/${p.id}`)}
                            >
                              <Eye className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="h-full flex flex-col">
            <CardHeader className="flex items-center gap-2 flex-row">
              <div className="rounded-lg bg-[var(--sys-primary)]/10 p-2 text-[var(--sys-primary)]">
                <Sparkles className="size-5" />
              </div>
              <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4">
              <p className="text-sm text-[var(--sys-on-surface-variant)]">
                Ask AI anything about your projects, estimates, or BOQs.
              </p>
              <div className="flex gap-2">
                <input
                  className={cn(
                    'flex h-10 flex-1 rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-3 py-2 text-sm text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors'
                  )}
                  placeholder="Ask AI..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && aiQuery.trim()) {
                      navigate('/ai-assistant');
                    }
                  }}
                />
                <Button
                  size="icon"
                  disabled={!aiQuery.trim()}
                  onClick={() => navigate('/ai-assistant')}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
