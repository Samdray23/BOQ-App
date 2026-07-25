import { useState } from 'react';
import { Card, CardContent, Button } from '@/components/shared';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  BarChart3,
  BookOpen,
  Plus,
  Upload,
  Flag,
  Sparkles,
} from 'lucide-react';
import type { UserRole, ExperienceLevel, EstimationStandard, ProjectType } from '@/types';
import { REGIONS } from '@/types';

const steps = [
  { label: 'Welcome', icon: User },
  { label: 'Location', icon: MapPin },
  { label: 'Expertise', icon: BarChart3 },
  { label: 'Project', icon: Plus },
  { label: 'Upload', icon: Upload },
  { label: 'Finish', icon: Flag },
];

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'quantity_surveyor', label: 'Quantity Surveyor' },
  { value: 'architect', label: 'Architect' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'builder', label: 'Builder' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'developer', label: 'Developer' },
  { value: 'student', label: 'Student' },
];

const experienceOptions: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const standardOptions: { value: EstimationStandard; label: string }[] = [
  { value: 'nrm', label: 'NRM' },
  { value: 'cesmm', label: 'CESMM' },
  { value: 'smm7', label: 'SMM7' },
  { value: 'local', label: 'Local Standards' },
];

const projectTypeOptions: { value: ProjectType; label: string }[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'mixed_use', label: 'Mixed Use' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'other', label: 'Other' },
];

const regionOptions = REGIONS.map((r) => ({ value: r, label: r }));

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
};

export default function Onboarding() {
  const navigate = useNavigate();
  const {
    data,
    firstProject,
    uploadedFileName,
    step,
    setStep,
    setFirstName,
    setLastName,
    setRole,
    setCountry,
    setRegion,
    setExperienceLevel,
    setEstimationStandards,
    setFirstProject,
    setUploadedFileName,
    setCompleted,
  } = useOnboardingStore();
  const { addProject } = useProjectStore();

  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const toggleStandard = (s: EstimationStandard) => {
    const current = data.estimationStandards || [];
    const next = current.includes(s) ? current.filter((x) => x !== s) : [...current, s];
    setEstimationStandards(next);
  };

  const goNext = () => {
    if (step < 5) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return data.firstName && data.lastName && data.role;
      case 1:
        return data.country && data.region;
      case 2:
        return !!data.experienceLevel;
      case 3:
        return firstProject.name && firstProject.location;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleComplete = () => {
    const newProject = {
      id: crypto.randomUUID(),
      name: firstProject.name || 'My First Project',
      client: `${data.firstName} ${data.lastName}`,
      type: (firstProject.type as ProjectType) || 'residential',
      location: firstProject.location || data.region || data.country || '',
      currency: 'NGN',
      status: 'draft' as const,
      startDate: new Date().toISOString().split('T')[0],
      completionDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      description: firstProject.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addProject(newProject);
    setCompleted();
    toast.success('Onboarding complete! Your first project is ready.');
    navigate('/projects/boq');
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFileName(file.name);
      toast.success(`"${file.name}" uploaded successfully`);
    } else if (file) {
      toast.error('Please upload a PDF file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFileName(file.name);
      toast.success(`"${file.name}" uploaded successfully`);
    } else if (file) {
      toast.error('Please upload a PDF file');
    }
  };

  const renderStep = () => {
    const muted = 'text-[var(--sys-on-surface-variant)]';

    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-[var(--sys-on-surface)]">
                Welcome to BOQ AI
              </h2>
              <p className={cn('text-sm mt-1', muted)}>Let&apos;s get to know you a bit.</p>
            </div>
            <Input
              id="firstName"
              label="First Name"
              placeholder="John"
              value={data.firstName || ''}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              id="lastName"
              label="Last Name"
              placeholder="Doe"
              value={data.lastName || ''}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Select
              id="role"
              label="I am a..."
              placeholder="Select your role"
              options={roleOptions}
              value={data.role || ''}
              onChange={(e) => setRole(e.target.value as UserRole)}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-[var(--sys-on-surface)]">
                Your Location
              </h2>
              <p className={cn('text-sm mt-1', muted)}>
                Where are you based? This helps us set regional pricing.
              </p>
            </div>
            <Input
              id="country"
              label="Country"
              placeholder="Nigeria"
              value={data.country || ''}
              onChange={(e) => setCountry(e.target.value)}
            />
            <Select
              id="region"
              label="Preferred Region"
              placeholder="Select your region"
              options={regionOptions}
              value={data.region || ''}
              onChange={(e) => setRegion(e.target.value)}
            />
            <p className="text-xs text-[var(--sys-on-surface-variant)]">
              Regional pricing is available for: Lagos, Ibadan, Abuja, Port Harcourt, Kano.
              <br />
              Your estimates will use rates specific to your selected region.
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-[var(--sys-on-surface)]">Your Expertise</h2>
              <p className={cn('text-sm mt-1', muted)}>
                How experienced are you in construction estimation?
              </p>
            </div>
            <Select
              id="experienceLevel"
              label="Experience Level"
              placeholder="Select level"
              options={experienceOptions}
              value={data.experienceLevel || ''}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
            />
            <div>
              <p className="text-sm font-medium text-[var(--sys-on-surface-variant)] mb-2">
                Estimation Standards
              </p>
              <div className="space-y-2">
                {standardOptions.map((opt) => {
                  const selected = data.estimationStandards?.includes(opt.value) ?? false;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleStandard(opt.value)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-[var(--sys-corner-sm)] border px-4 py-3 text-sm text-left transition-all',
                        selected
                          ? 'border-[var(--sys-primary)] bg-[var(--sys-primary)]/5 text-[var(--sys-primary)]'
                          : 'border-[var(--sys-outline)] text-[var(--sys-on-surface)] hover:border-[var(--sys-primary)]/40'
                      )}
                    >
                      <div
                        className={cn(
                          'size-5 rounded border-2 flex items-center justify-center transition-all',
                          selected
                            ? 'border-[var(--sys-primary)] bg-[var(--sys-primary)]'
                            : 'border-[var(--sys-outline)]'
                        )}
                      >
                        {selected && <Check className="size-3.5 text-white" />}
                      </div>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-[var(--sys-on-surface)]">
                Your First Project
              </h2>
              <p className={cn('text-sm mt-1', muted)}>
                Create your first project to get started with BOQ AI.
              </p>
            </div>
            <Input
              id="projectName"
              label="Project Name"
              placeholder="e.g. Luxury Villa"
              value={firstProject.name || ''}
              onChange={(e) => setFirstProject({ ...firstProject, name: e.target.value })}
            />
            <Select
              id="projectType"
              label="Project Type"
              placeholder="Select type"
              options={projectTypeOptions}
              value={firstProject.type || ''}
              onChange={(e) => setFirstProject({ ...firstProject, type: e.target.value as ProjectType })}
            />
            <Input
              id="projectLocation"
              label="Project Location"
              placeholder="e.g. Lagos"
              value={firstProject.location || ''}
              onChange={(e) => setFirstProject({ ...firstProject, location: e.target.value })}
            />
            <div className="space-y-1.5">
              <label htmlFor="desc" className="text-sm font-medium text-[var(--sys-on-surface-variant)]">
                Description (optional)
              </label>
              <textarea
                id="desc"
                rows={2}
                value={firstProject.description || ''}
                onChange={(e) => setFirstProject({ ...firstProject, description: e.target.value })}
                placeholder="Brief description..."
                className="flex w-full rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-3 py-2 text-sm text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors resize-none"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-[var(--sys-on-surface)]">
                Upload Architectural Drawing
              </h2>
              <p className={cn('text-sm mt-1', muted)}>
                Upload a PDF of your architectural drawing to generate a BOQ.
              </p>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById('pdf-upload')?.click()}
              className={cn(
                'border-2 border-dashed rounded-[var(--sys-corner-md)] p-8 text-center cursor-pointer transition-all',
                isDragging
                  ? 'border-[var(--sys-primary)] bg-[var(--sys-primary)]/5'
                  : uploadedFileName
                    ? 'border-green-400 bg-green-50/50 dark:border-green-700 dark:bg-green-900/10'
                    : 'border-[var(--sys-outline)] hover:border-[var(--sys-primary)]/40'
              )}
            >
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              {uploadedFileName ? (
                <div className="space-y-2">
                  <div className="size-10 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="size-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-[var(--sys-on-surface)]">
                    {uploadedFileName}
                  </p>
                  <p className="text-xs text-[var(--sys-on-surface-variant)]">
                    Click to change file
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="size-10 mx-auto text-[var(--sys-on-surface-variant)]/40" />
                  <p className="text-sm font-medium text-[var(--sys-on-surface)]">
                    Drop your PDF here, or click to browse
                  </p>
                  <p className="text-xs text-[var(--sys-on-surface-variant)]">
                    Supported: Floor Plans, Site Plans, Roof Plans, Elevations, Sections
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-[var(--sys-on-surface)]">All Set!</h2>
              <p className={cn('text-sm mt-1', muted)}>
                Review your choices. We&apos;ll create your first project and take you to the BOQ
                Generator.
              </p>
            </div>
            <Card>
              <CardContent className="space-y-3 divide-y divide-[var(--sys-outline)]/50">
                <SummaryRow label="Name" value={`${data.firstName} ${data.lastName}`} />
                <SummaryRow
                  label="Role"
                  value={roleOptions.find((r) => r.value === data.role)?.label || data.role || ''}
                />
                <SummaryRow label="Country" value={data.country || ''} />
                <SummaryRow label="Region" value={data.region || ''} />
                <SummaryRow
                  label="Experience"
                  value={
                    experienceOptions.find((e) => e.value === data.experienceLevel)?.label ||
                    data.experienceLevel ||
                    ''
                  }
                />
                <SummaryRow label="Project" value={firstProject.name || ''} />
                <SummaryRow label="Project Location" value={firstProject.location || ''} />
                <SummaryRow
                  label="Drawing"
                  value={uploadedFileName || 'None (you can upload later)'}
                />
              </CardContent>
            </Card>
            <Button className="w-full h-12 text-base" onClick={handleComplete}>
              <Sparkles className="size-5" />
              Create Project & Start
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--sys-surface)]">
      <div className="w-full max-w-lg mx-auto p-6">
        <Card padding="none" className="overflow-hidden">
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-8">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === step;
                const isCompleted = i < step;
                return (
                  <div key={s.label} className="flex flex-col items-center gap-1.5 relative">
                    <div
                      className={cn(
                        'size-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300',
                        isCompleted &&
                          'bg-[var(--sys-primary)] border-[var(--sys-primary)] text-white',
                        isActive &&
                          'border-[var(--sys-primary)] text-[var(--sys-primary)] bg-[var(--sys-primary)]/10',
                        !isActive &&
                          !isCompleted &&
                          'border-[var(--sys-outline)] text-[var(--sys-on-surface-variant)]'
                      )}
                    >
                      {isCompleted ? <Check className="size-4" /> : <Icon className="size-4" />}
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-medium text-center leading-tight max-w-14',
                        isActive || isCompleted
                          ? 'text-[var(--sys-primary)]'
                          : 'text-[var(--sys-on-surface-variant)]'
                      )}
                    >
                      {s.label}
                    </span>
                    {i < steps.length - 1 && (
                      <div
                        className={cn(
                          'absolute top-[18px] -right-[calc(50%+12px)] w-[calc(100%-24px)] h-0.5 -z-10 transition-colors duration-300',
                          i < step ? 'bg-[var(--sys-primary)]' : 'bg-[var(--sys-outline)]'
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <CardContent className="p-6">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {step < 5 && (
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-[var(--sys-outline)]/50">
                <Button variant="outline" onClick={goBack} disabled={step === 0}>
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
                <Button onClick={goNext} disabled={!canProceed()}>
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
      <span className="text-sm text-[var(--sys-on-surface-variant)]">{label}</span>
      <span className="text-sm font-medium text-[var(--sys-on-surface)] capitalize">
        {value || '—'}
      </span>
    </div>
  );
}
