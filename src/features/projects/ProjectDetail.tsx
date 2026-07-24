import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/shared';
import { useProjectStore } from '@/store/useProjectStore';
import { useBoqStore } from '@/store/useBoqStore';
import { cn } from '@/lib/cn';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  FileText,
  BarChart3,
  Package,
  PieChart,
  Copy,
  Archive,
  Sparkles,
  Eye,
} from 'lucide-react';
import type { ProjectStatus } from '@/types';

const statusBadge: Record<
  ProjectStatus,
  { variant: 'success' | 'warning' | 'info' | 'error' | 'default'; label: string }
> = {
  draft: { variant: 'warning', label: 'Draft' },
  processing: { variant: 'info', label: 'Processing' },
  complete: { variant: 'success', label: 'Complete' },
  error: { variant: 'error', label: 'Error' },
  archived: { variant: 'default', label: 'Archived' },
};

const tabs = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'boq', label: 'BOQ', icon: BarChart3 },
  { id: 'cost-estimate', label: 'Cost Estimate', icon: PieChart },
  { id: 'materials', label: 'Materials', icon: Package },
  { id: 'reports', label: 'Reports', icon: Eye },
] as const;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, archiveProject, duplicateProject } = useProjectStore();
  const { createBoq } = useBoqStore();
  const [activeTab, setActiveTab] = useState('overview');

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="p-6">
        <Card padding="lg">
          <div className="text-center py-12">
            <h2 className="text-lg font-semibold text-[var(--sys-on-surface)]">
              Project not found
            </h2>
            <p className="text-sm text-[var(--sys-on-surface-variant)] mt-1">
              The project you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button className="mt-4" onClick={() => navigate('/projects')}>
              Back to Projects
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleGenerateBoq = () => {
    createBoq(project.id);
    toast.success('BOQ generated successfully');
    navigate('/projects/boq');
  };

  const handleDuplicate = () => {
    duplicateProject(project.id);
    toast.success('Project duplicated');
  };

  const handleArchive = () => {
    archiveProject(project.id);
    toast.success('Project archived');
    navigate('/projects');
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--sys-on-surface)]">{project.name}</h1>
            <Badge variant={statusBadge[project.status].variant}>
              {statusBadge[project.status].label}
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-1 border-b border-[var(--sys-outline)] overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-[var(--sys-primary)] text-[var(--sys-primary)]'
                  : 'border-transparent text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-on-surface)]'
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-[var(--sys-on-surface-variant)]">Type</p>
                        <p className="font-medium text-[var(--sys-on-surface)] capitalize">
                          {project.type.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[var(--sys-on-surface-variant)]">Client</p>
                        <p className="font-medium text-[var(--sys-on-surface)]">{project.client}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[var(--sys-on-surface-variant)]">Location</p>
                        <p className="font-medium text-[var(--sys-on-surface)] flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          {project.location}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[var(--sys-on-surface-variant)]">Currency</p>
                        <p className="font-medium text-[var(--sys-on-surface)]">
                          {project.currency}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[var(--sys-on-surface-variant)]">Start Date</p>
                        <p className="font-medium text-[var(--sys-on-surface)] flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          {formatDate(project.startDate)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[var(--sys-on-surface-variant)]">Completion Date</p>
                        <p className="font-medium text-[var(--sys-on-surface)] flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          {formatDate(project.completionDate)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[var(--sys-on-surface-variant)] leading-relaxed">
                      {project.description || 'No description provided.'}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" onClick={handleGenerateBoq}>
                      <Sparkles className="size-4" />
                      Generate BOQ
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigate('/reports')}
                    >
                      <Eye className="size-4" />
                      View Report
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={handleDuplicate}
                    >
                      <Copy className="size-4" />
                      Duplicate
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={handleArchive}
                    >
                      <Archive className="size-4" />
                      Archive
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'boq' && (
          <motion.div
            key="boq"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <BarChart3 className="size-12 mx-auto mb-4 text-[var(--sys-on-surface-variant)]/40" />
                  <h3 className="text-lg font-semibold text-[var(--sys-on-surface)]">BOQ</h3>
                  <p className="text-sm text-[var(--sys-on-surface-variant)] mt-1">
                    View and manage the Bill of Quantities for this project.
                  </p>
                  <Button className="mt-4" onClick={handleGenerateBoq}>
                    <Sparkles className="size-4" />
                    Generate BOQ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'cost-estimate' && (
          <motion.div
            key="cost-estimate"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <PieChart className="size-12 mx-auto mb-4 text-[var(--sys-on-surface-variant)]/40" />
                  <h3 className="text-lg font-semibold text-[var(--sys-on-surface)]">
                    Cost Estimate
                  </h3>
                  <p className="text-sm text-[var(--sys-on-surface-variant)] mt-1">
                    View detailed cost estimation breakdown.
                  </p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => navigate('/cost-estimation')}
                  >
                    View Full Estimate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'materials' && (
          <motion.div
            key="materials"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Package className="size-12 mx-auto mb-4 text-[var(--sys-on-surface-variant)]/40" />
                  <h3 className="text-lg font-semibold text-[var(--sys-on-surface)]">Materials</h3>
                  <p className="text-sm text-[var(--sys-on-surface-variant)] mt-1">
                    Material takeoff and schedule for this project.
                  </p>
                  <Button className="mt-4" variant="outline" onClick={() => navigate('/materials')}>
                    View Materials
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Eye className="size-12 mx-auto mb-4 text-[var(--sys-on-surface-variant)]/40" />
                  <h3 className="text-lg font-semibold text-[var(--sys-on-surface)]">Reports</h3>
                  <p className="text-sm text-[var(--sys-on-surface-variant)] mt-1">
                    Generate and download project reports.
                  </p>
                  <Button className="mt-4" variant="outline" onClick={() => navigate('/reports')}>
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
