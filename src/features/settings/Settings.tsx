import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
} from '@/components/shared';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { cn } from '@/lib/cn';
import {
  User,
  Building2,
  Palette,
  CreditCard,
  Save,
  Sun,
  Moon,
  Monitor,
  Crown,
} from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

const currencies = [
  { value: 'NGN', label: 'NGN (₦)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)' },
];

const locations = [
  { value: 'Lagos', label: 'Lagos' },
  { value: 'Ibadan', label: 'Ibadan' },
  { value: 'Abuja', label: 'Abuja' },
  { value: 'Port Harcourt', label: 'Port Harcourt' },
  { value: 'Kano', label: 'Kano' },
];

const standards = [
  { value: 'NRM1', label: 'NRM1' },
  { value: 'NRM2', label: 'NRM2' },
  { value: 'CESMM4', label: 'CESMM4' },
  { value: 'PMM', label: 'PMM (Standard)' },
  { value: 'custom', label: 'Custom' },
];

const roles = [
  { value: 'quantity_surveyor', label: 'Quantity Surveyor' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'architect', label: 'Architect' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'admin', label: 'Admin' },
];

function ProfileTab() {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || 'quantity_surveyor');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    toast.success('Settings saved');
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. John Doe"
        />
        <Input label="Email" id="email" value={user?.email || ''} disabled />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Role"
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={roles}
        />
        <Input
          label="Company"
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. BuildRight Ltd"
        />
      </div>
      <Input
        label="Phone"
        id="phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="e.g. +234 801 234 5678"
        className="max-w-md"
      />
      <Button onClick={handleSave}>
        <Save className="size-4" />
        Save Changes
      </Button>
    </div>
  );
}

function WorkspaceTab() {
  const [companyName, setCompanyName] = useState('BuildRight Ltd');
  const [currency, setCurrency] = useState('NGN');
  const [location, setLocation] = useState('Lagos');
  const [standard, setStandard] = useState('PMM');

  const handleSave = () => {
    toast.success('Settings saved');
  };

  return (
    <div className="space-y-5">
      <Input
        label="Company Name"
        id="companyName"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        placeholder="e.g. BuildRight Ltd"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Default Currency"
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          options={currencies}
        />
        <Select
          label="Default Location"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          options={locations}
        />
      </div>
      <Select
        label="Default Estimation Standard"
        id="standard"
        value={standard}
        onChange={(e) => setStandard(e.target.value)}
        options={standards}
        className="max-w-md"
      />
      <Button onClick={handleSave}>
        <Save className="size-4" />
        Save Changes
      </Button>
    </div>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useThemeStore();
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>(theme);

  useEffect(() => {
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } else {
      setTheme(mode);
    }
  }, [mode, setTheme]);

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ] as const;

  const previewColors = {
    light: { primary: '#2563eb', surface: '#ffffff', background: '#f8fafc', onSurface: '#0f172a' },
    dark: { primary: '#60a5fa', surface: '#1e293b', background: '#0f172a', onSurface: '#f1f5f9' },
  };

  const effectiveTheme =
    mode === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : mode;

  const colors = previewColors[effectiveTheme as keyof typeof previewColors];

  return (
    <div className="space-y-6">
      <div className="flex gap-3 flex-wrap">
        {themeOptions.map((opt) => {
          const Icon = opt.icon;
          const isActive = mode === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setMode(opt.id)}
              className={cn(
                'flex items-center gap-2 rounded-[var(--sys-corner-sm)] border px-4 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'border-[var(--sys-primary)] bg-[var(--sys-primary)]/10 text-[var(--sys-primary)]'
                  : 'border-[var(--sys-outline)] text-[var(--sys-on-surface-variant)] hover:bg-[var(--sys-surface-container)]'
              )}
            >
              <Icon className="size-4" />
              {opt.label}
            </button>
          );
        })}
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--sys-on-surface-variant)] mb-3">Preview</p>
        <div
          className="rounded-[var(--sys-corner-md)] border border-[var(--sys-outline)] overflow-hidden max-w-sm"
          style={{ backgroundColor: colors.background }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3 border-b"
            style={{ borderColor: 'var(--sys-outline)', backgroundColor: colors.surface }}
          >
            <div className="size-3 rounded-full" style={{ backgroundColor: colors.primary }} />
            <span className="text-sm font-medium" style={{ color: colors.onSurface }}>
              Sample Header
            </span>
          </div>
          <div className="p-4 space-y-3">
            <div
              className="h-3 rounded-[var(--sys-corner-sm)] w-3/4"
              style={{ backgroundColor: colors.primary }}
            />
            <div
              className="h-3 rounded-[var(--sys-corner-sm)] w-1/2"
              style={{ backgroundColor: colors.primary, opacity: 0.6 }}
            />
            <div
              className="h-20 rounded-[var(--sys-corner-sm)] w-full"
              style={{ backgroundColor: colors.surface }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingTab() {
  const navigate = useNavigate();
  const { plan, billingCycle } = useSubscriptionStore();

  const price = plan.priceMonthly;
  const displayPrice =
    price === 0 ? 'Free' : `₦${price.toLocaleString()}/${billingCycle === 'yearly' ? 'yr' : 'mo'}`;

  return (
    <div className="space-y-5">
      <Card padding="lg" className="border-[var(--sys-primary)]/30 bg-[var(--sys-primary)]/5">
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[var(--sys-primary)]/10 p-2.5 text-[var(--sys-primary)]">
              <Crown className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-[var(--sys-on-surface)] capitalize">
                {plan.displayName}
              </p>
              <p className="text-sm text-[var(--sys-on-surface-variant)]">{displayPrice}</p>
            </div>
          </div>
          <ul className="space-y-1.5 text-sm text-[var(--sys-on-surface-variant)]">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-[var(--sys-primary)]">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <Button variant="outline" onClick={() => navigate('/subscription')}>
            Manage Subscription
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6 p-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[var(--sys-on-surface)]">Settings</h1>
        <p className="text-sm text-[var(--sys-on-surface-variant)] mt-1">
          Manage your account and application preferences.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex lg:flex-col gap-1 overflow-x-auto lg:w-48 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-[var(--sys-corner-sm)] text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-[var(--sys-primary)] text-white'
                    : 'text-[var(--sys-on-surface-variant)] hover:bg-[var(--sys-surface-container)]'
                )}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              <Card padding="lg">
                <CardHeader>
                  <CardTitle className="capitalize">
                    {tabs.find((t) => t.id === activeTab)?.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeTab === 'profile' && <ProfileTab />}
                  {activeTab === 'workspace' && <WorkspaceTab />}
                  {activeTab === 'appearance' && <AppearanceTab />}
                  {activeTab === 'billing' && <BillingTab />}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
