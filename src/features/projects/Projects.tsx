import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Input,
  Select,
  EmptyState,
} from '@/components/shared';
import { useProjectStore } from '@/store/useProjectStore';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { cn } from '@/lib/cn';
import { Plus, Search, X, MapPin, Calendar, Building2, Crown } from 'lucide-react';
import type { ProjectStatus, ProjectType, Project } from '@/types';
import { REGIONS } from '@/types';

const statusFilterTabs: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'processing', label: 'Processing' },
  { value: 'complete', label: 'Complete' },
  { value: 'archived', label: 'Archived' },
];

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

const typeBadge: Record<
  ProjectType,
  { variant: 'info' | 'default' | 'success' | 'warning'; label: string }
> = {
  residential: { variant: 'info', label: 'Residential' },
  commercial: { variant: 'default', label: 'Commercial' },
  mixed_use: { variant: 'success', label: 'Mixed Use' },
  infrastructure: { variant: 'warning', label: 'Infrastructure' },
  other: { variant: 'default', label: 'Other' },
};

const defaultForm = {
  name: '',
  client: '',
  type: '' as ProjectType | '',
  location: '',
  description: '',
  startDate: '',
  completionDate: '',
};

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function Projects() {
  const navigate = useNavigate();
  const { projects, addProject } = useProjectStore();
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState('');

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [projects, statusFilter, searchQuery]);

  const { canCreateProject, plan } = useSubscriptionStore();

  const handleCreate = () => {
    if (!canCreateProject(projects.length)) {
      toast.error(
        plan.name === 'free'
          ? `Free plan allows up to 2 projects per month. Upgrade to Professional for unlimited projects.`
          : 'Project limit reached for your current plan.'
      );
      return;
    }
    if (
      !form.name ||
      !form.client ||
      !form.type ||
      !form.location ||
      !form.startDate ||
      !form.completionDate
    ) {
      setFormError('Please fill in all required fields');
      return;
    }
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: form.name,
      client: form.client,
      type: form.type as ProjectType,
      location: form.location,
      currency: 'NGN',
      status: 'draft',
      startDate: form.startDate,
      completionDate: form.completionDate,
      description: form.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addProject(newProject);
    toast.success('Project created successfully');
    setForm(defaultForm);
    setFormError('');
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold text-[var(--sys-on-surface)]">Projects</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="size-4" />
          New Project
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex gap-1 flex-wrap">
          {statusFilterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-[var(--sys-corner-sm)] transition-colors',
                statusFilter === tab.value
                  ? 'bg-[var(--sys-primary)] text-white'
                  : 'text-[var(--sys-on-surface-variant)] hover:bg-[var(--sys-surface-container)]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--sys-on-surface-variant)]" />
          <input
            className="flex h-10 w-full rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] pl-9 pr-3 py-2 text-sm text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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
              icon={<FolderKanban className="size-12" />}
              title="No projects found"
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search query.'
                  : 'Create your first project to get started.'
              }
              action={
                !searchQuery && statusFilter === 'all' ? (
                  <Button onClick={() => setShowCreateForm(true)}>Create Project</Button>
                ) : undefined
              }
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
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  hover
                  className="cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardContent className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-semibold text-[var(--sys-on-surface)] truncate">
                          {project.name}
                        </h3>
                        <p className="text-sm text-[var(--sys-on-surface-variant)] flex items-center gap-1.5">
                          <Building2 className="size-3.5 shrink-0" />
                          {project.client}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Badge variant={typeBadge[project.type].variant}>
                          {typeBadge[project.type].label}
                        </Badge>
                        <Badge variant={statusBadge[project.status].variant}>
                          {statusBadge[project.status].label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--sys-on-surface-variant)]">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {project.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {formatDate(project.startDate)} - {formatDate(project.completionDate)}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-sm text-[var(--sys-on-surface-variant)] line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => {
                setShowCreateForm(false);
                setFormError('');
                setForm(defaultForm);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50 max-h-[90vh] overflow-y-auto"
            >
              <Card padding="lg" className="shadow-xl">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>New Project</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormError('');
                      setForm(defaultForm);
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formError && (
                    <p className="text-sm text-[var(--sys-error)] bg-[var(--sys-error)]/10 rounded-[var(--sys-corner-sm)] px-3 py-2">
                      {formError}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Project Name"
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Luxury Villa"
                      className="col-span-2 sm:col-span-1"
                    />
                    <Input
                      label="Client Name"
                      id="client"
                      value={form.client}
                      onChange={(e) => setForm({ ...form, client: e.target.value })}
                      placeholder="e.g. Dr. Adebayo"
                      className="col-span-2 sm:col-span-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Project Type"
                      id="type"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as ProjectType })}
                      options={[
                        { value: 'residential', label: 'Residential' },
                        { value: 'commercial', label: 'Commercial' },
                        { value: 'mixed_use', label: 'Mixed Use' },
                        { value: 'infrastructure', label: 'Infrastructure' },
                        { value: 'other', label: 'Other' },
                      ]}
                      placeholder="Select type"
                    />
                    <Select
                      label="Location/Region"
                      id="location"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      options={[
                        ...REGIONS.map((r) => ({ value: r, label: r })),
                        { value: 'other', label: 'Other' },
                      ]}
                      placeholder="Select region"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="desc"
                      className="text-sm font-medium text-[var(--sys-on-surface-variant)]"
                    >
                      Description
                    </label>
                    <textarea
                      id="desc"
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Brief description of the project..."
                      className="flex w-full rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-3 py-2 text-sm text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Start Date"
                      id="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                    <Input
                      label="Completion Date"
                      id="completionDate"
                      type="date"
                      value={form.completionDate}
                      onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setFormError('');
                        setForm(defaultForm);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreate}>Create Project</Button>
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

function FolderKanban({ className }: { className?: string }) {
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
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      <path d="M8 10v4" />
      <path d="M12 10v2" />
      <path d="M16 10v6" />
    </svg>
  );
}
