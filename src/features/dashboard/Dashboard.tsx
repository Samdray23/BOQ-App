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
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { cn } from '@/lib/cn';
import {
  FolderKanban,
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
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

const kpiIcons = {
  projects: FolderKanban,
  boqs: FileText,
  members: Users,
  value: DollarSign,
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { projects } = useProjectStore();
  const onboarding = useOnboardingStore((s) => s.data);
  const [aiQuery, setAiQuery] = useState('');

  const activeProjects = projects.filter(
    (p) => p.status !== 'archived' && p.status !== 'complete'
  ).length;
  const totalBoqs = projects.length;
  const totalValue = projects.length * 45200000;
  const prevValue = (projects.length - 1) * 45200000;
  const valueChange = prevValue > 0 ? ((totalValue - prevValue) / prevValue) * 100 : 0;

  const kpis = [
    {
      key: 'projects',
      label: 'Active Projects',
      value: activeProjects,
      change: 12.5,
      trend: 'up' as const,
      icon: kpiIcons.projects,
    },
    {
      key: 'boqs',
      label: 'Total BOQs',
      value: totalBoqs,
      change: 8.3,
      trend: 'up' as const,
      icon: kpiIcons.boqs,
    },
    {
      key: 'members',
      label: 'Team Members',
      value: 6,
      change: 0,
      trend: 'neutral' as const,
      icon: kpiIcons.members,
    },
    {
      key: 'value',
      label: 'Total Value',
      value: `₦${(totalValue / 1000000).toFixed(1)}M`,
      change: valueChange,
      trend: valueChange >= 0 ? ('up' as const) : ('down' as const),
      icon: kpiIcons.value,
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
            {getGreeting()}, {user?.name || onboarding.firstName || 'there'}
          </h1>
          <p className="text-sm text-[var(--sys-on-surface-variant)]">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <Badge variant="info" className="capitalize">
          {user?.role?.replace(/_/g, ' ') ||
            onboarding.role?.replace(/_/g, ' ') ||
            'Quantity Surveyor'}
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
                    {kpi.trend !== 'neutral' && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-0.5 text-xs font-medium',
                          kpi.trend === 'up' ? 'text-green-600' : 'text-red-500'
                        )}
                      >
                        {kpi.trend === 'up' ? (
                          <TrendingUp className="size-3.5" />
                        ) : (
                          <TrendingDown className="size-3.5" />
                        )}
                        {kpi.change > 0 ? '+' : ''}
                        {kpi.change}%
                      </span>
                    )}
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
