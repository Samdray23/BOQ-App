import { useState } from 'react';
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
import { useAuthStore } from '@/store/useAuthStore';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/cn';
import {
  Shield,
  Users,
  FolderKanban,
  FileText,
  HardDrive,
  Database,
  Download,
  Search,
  Ban,
} from 'lucide-react';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
  joined: string;
}

const mockUsers: MockUser[] = [
  {
    id: 'u1',
    name: 'John Doe',
    email: 'john@buildright.com',
    role: 'quantity_surveyor',
    status: 'active',
    joined: '12 Jan 2026',
  },
  {
    id: 'u2',
    name: 'Sarah Adeyemi',
    email: 'sarah@buildright.com',
    role: 'project_manager',
    status: 'active',
    joined: '03 Mar 2026',
  },
  {
    id: 'u3',
    name: 'Chidi Okonkwo',
    email: 'chidi@greenfield.com',
    role: 'engineer',
    status: 'active',
    joined: '22 Apr 2026',
  },
  {
    id: 'u4',
    name: 'Funmi Ogunlade',
    email: 'funmi@archplus.com',
    role: 'architect',
    status: 'active',
    joined: '10 Feb 2026',
  },
  {
    id: 'u5',
    name: 'Musa Bello',
    email: 'musa@kanoconstruct.com',
    role: 'contractor',
    status: 'suspended',
    joined: '05 Jan 2026',
  },
  {
    id: 'u6',
    name: 'Adaobi Nwosu',
    email: 'adaobi@buildright.com',
    role: 'admin',
    status: 'active',
    joined: '01 Dec 2025',
  },
];

const roleOptions = [
  { value: 'quantity_surveyor', label: 'Quantity Surveyor' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'architect', label: 'Architect' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'admin', label: 'Admin' },
];

const auditLogs = [
  {
    id: 'a1',
    timestamp: '16 Jun 2026, 14:32',
    user: 'John Doe',
    action: 'User Login',
    details: 'john@buildright.com',
  },
  {
    id: 'a2',
    timestamp: '16 Jun 2026, 13:15',
    user: 'Sarah Adeyemi',
    action: 'BOQ Generated',
    details: 'Luxury Villa BOQ',
  },
  {
    id: 'a3',
    timestamp: '16 Jun 2026, 11:40',
    user: 'Chidi Okonkwo',
    action: 'Project Created',
    details: 'Greenfield Estate',
  },
  {
    id: 'a4',
    timestamp: '15 Jun 2026, 16:50',
    user: 'Funmi Ogunlade',
    action: 'Template Updated',
    details: 'Residential Template',
  },
  {
    id: 'a5',
    timestamp: '15 Jun 2026, 10:22',
    user: 'Musa Bello',
    action: 'Rate Modified',
    details: 'Cement rate updated',
  },
  {
    id: 'a6',
    timestamp: '14 Jun 2026, 09:00',
    user: 'Admin',
    action: 'User Suspended',
    details: 'musa@kanoconstruct.com',
  },
];

export function Admin() {
  const user = useAuthStore((s) => s.user);
  const { projects } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistrations, setAllowRegistrations] = useState(true);

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Shield className="size-12" />}
          title="Access Denied"
          description="You do not have the required permissions to access the Admin Portal."
        />
      </div>
    );
  }

  const filteredUsers = mockUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const stats = [
    { key: 'users', label: 'Total Users', value: mockUsers.length, icon: Users },
    {
      key: 'projects',
      label: 'Active Projects',
      value: projects.filter((p) => p.status !== 'archived').length,
      icon: FolderKanban,
    },
    { key: 'boqs', label: 'Total BOQs Generated', value: projects.length, icon: FileText },
    { key: 'storage', label: 'Storage Used', value: '2.4 GB', icon: HardDrive },
  ];

  const handleSuspend = (userId: string) => {
    toast.success(`User ${userId} has been suspended`);
  };

  const handleRoleChange = () => {
    toast.success('User role updated');
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="rounded-lg bg-[var(--sys-primary)]/10 p-2.5 text-[var(--sys-primary)]">
          <Shield className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--sys-on-surface)]">Admin Portal</h1>
          <p className="text-sm text-[var(--sys-on-surface-variant)]">
            Manage users, settings, and platform operations.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card>
                <CardContent className="space-y-3">
                  <div className="rounded-lg bg-[var(--sys-primary)]/10 p-2.5 text-[var(--sys-primary)] w-fit">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--sys-on-surface)]">{stat.value}</p>
                    <p className="text-sm text-[var(--sys-on-surface-variant)]">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card padding="lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--sys-on-surface-variant)]" />
            <input
              className="flex h-9 w-full rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] pl-9 pr-3 py-2 text-sm text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--sys-outline)]">
                <th className="text-left py-3 px-2 font-medium text-[var(--sys-on-surface-variant)]">
                  Name
                </th>
                <th className="text-left py-3 px-2 font-medium text-[var(--sys-on-surface-variant)]">
                  Email
                </th>
                <th className="text-left py-3 px-2 font-medium text-[var(--sys-on-surface-variant)]">
                  Role
                </th>
                <th className="text-left py-3 px-2 font-medium text-[var(--sys-on-surface-variant)]">
                  Status
                </th>
                <th className="text-left py-3 px-2 font-medium text-[var(--sys-on-surface-variant)] hidden md:table-cell">
                  Joined
                </th>
                <th className="text-right py-3 px-2 font-medium text-[var(--sys-on-surface-variant)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-[var(--sys-outline)]/50 hover:bg-[var(--sys-surface-container)]/50 transition-colors"
                >
                  <td className="py-3 px-2 font-medium text-[var(--sys-on-surface)]">{u.name}</td>
                  <td className="py-3 px-2 text-[var(--sys-on-surface-variant)]">{u.email}</td>
                  <td className="py-3 px-2">
                    <Select
                      value={u.role}
                      onChange={handleRoleChange}
                      options={roleOptions}
                      className="w-44"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant={u.status === 'active' ? 'success' : 'error'}>{u.status}</Badge>
                  </td>
                  <td className="py-3 px-2 text-[var(--sys-on-surface-variant)] hidden md:table-cell">
                    {u.joined}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {u.status === 'active' ? (
                      <Button variant="destructive" size="sm" onClick={() => handleSuspend(u.id)}>
                        <Ban className="size-3.5" />
                        Suspend
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success('User reinstated')}
                      >
                        Reinstate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="lg" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--sys-on-surface)]">Maintenance Mode</p>
                <p className="text-xs text-[var(--sys-on-surface-variant)]">
                  Prevent user access during maintenance
                </p>
              </div>
              <button
                onClick={() => {
                  setMaintenanceMode(!maintenanceMode);
                  toast.success('Maintenance mode toggled');
                }}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  maintenanceMode ? 'bg-[var(--sys-primary)]' : 'bg-[var(--sys-outline)]'
                )}
              >
                <span
                  className={cn(
                    'inline-block size-5 rounded-full bg-white shadow-sm transition-transform',
                    maintenanceMode ? 'translate-x-[22px]' : 'translate-x-[2px]'
                  )}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--sys-on-surface)]">
                  Allow New Registrations
                </p>
                <p className="text-xs text-[var(--sys-on-surface-variant)]">
                  Let new users sign up for the platform
                </p>
              </div>
              <button
                onClick={() => setAllowRegistrations(!allowRegistrations)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  allowRegistrations ? 'bg-[var(--sys-primary)]' : 'bg-[var(--sys-outline)]'
                )}
              >
                <span
                  className={cn(
                    'inline-block size-5 rounded-full bg-white shadow-sm transition-transform',
                    allowRegistrations ? 'translate-x-[22px]' : 'translate-x-[2px]'
                  )}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <CardTitle>Rate Library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[var(--sys-on-surface-variant)]">
              Manage default material rates for BOQ generation.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toast.success('Rate library management coming soon')}
            >
              <Database className="size-4" />
              Manage Rates
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toast.success('Rate library management coming soon')}
            >
              <Download className="size-4" />
              Import Rates
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--sys-outline)]">
                <th className="text-left py-3 px-2 font-medium text-[var(--sys-on-surface-variant)]">
                  Timestamp
                </th>
                <th className="text-left py-3 px-2 font-medium text-[var(--sys-on-surface-variant)]">
                  User
                </th>
                <th className="text-left py-3 px-2 font-medium text-[var(--sys-on-surface-variant)]">
                  Action
                </th>
                <th className="text-left py-3 px-2 font-medium text-[var(--sys-on-surface-variant)] hidden md:table-cell">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-[var(--sys-outline)]/50 hover:bg-[var(--sys-surface-container)]/50 transition-colors"
                >
                  <td className="py-3 px-2 text-[var(--sys-on-surface)]">{log.timestamp}</td>
                  <td className="py-3 px-2 font-medium text-[var(--sys-on-surface)]">{log.user}</td>
                  <td className="py-3 px-2">
                    <Badge variant="info">{log.action}</Badge>
                  </td>
                  <td className="py-3 px-2 text-[var(--sys-on-surface-variant)] hidden md:table-cell">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
