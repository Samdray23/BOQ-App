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
  UserPlus,
} from 'lucide-react';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
  joined: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

const roleOptions = [
  { value: 'quantity_surveyor', label: 'Quantity Surveyor' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'architect', label: 'Architect' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'admin', label: 'Admin' },
];

export default function Admin() {
  const user = useAuthStore((s) => s.user);
  const { projects } = useProjectStore();
  const [users, setUsers] = useState<MockUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistrations, setAllowRegistrations] = useState(true);

  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('quantity_surveyor');

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

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const stats = [
    { key: 'users', label: 'Total Users', value: users.length, icon: Users },
    {
      key: 'projects',
      label: 'Active Projects',
      value: projects.filter((p) => p.status !== 'archived').length,
      icon: FolderKanban,
    },
    { key: 'boqs', label: 'Total BOQs Generated', value: 0, icon: FileText },
    { key: 'storage', label: 'Storage Used', value: '0 GB', icon: HardDrive },
  ];

  const handleSuspend = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'suspended' as const } : u))
    );
    toast.success(`User has been suspended`);
  };

  const handleReinstate = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'active' as const } : u))
    );
    toast.success('User reinstated');
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast.success('User role updated');
  };

  const handleInviteUser = () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    const newUser: MockUser = {
      id: crypto.randomUUID(),
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'active',
      joined: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    setUsers((prev) => [...prev, newUser]);
    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        user: user?.name ?? 'Admin',
        action: 'User Invited',
        details: inviteEmail.trim(),
      },
      ...prev,
    ]);
    setInviteName('');
    setInviteEmail('');
    setInviteRole('quantity_surveyor');
    toast.success('User invited successfully');
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
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-[var(--sys-on-surface-variant)] mb-1 block">
                Name
              </label>
              <input
                className="flex h-9 w-full rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-3 py-2 text-sm text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                placeholder="Full name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-[var(--sys-on-surface-variant)] mb-1 block">
                Email
              </label>
              <input
                className="flex h-9 w-full rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-3 py-2 text-sm text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-[var(--sys-on-surface-variant)] mb-1 block">
                Role
              </label>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                options={roleOptions}
                className="w-full"
              />
            </div>
            <Button onClick={handleInviteUser}>
              <UserPlus className="size-4" />
              Invite
            </Button>
          </div>

          <div className="overflow-x-auto">
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={<Users className="size-10" />}
                        title="No users registered yet"
                        description="Invite users to get started."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-[var(--sys-outline)]/50 hover:bg-[var(--sys-surface-container)]/50 transition-colors"
                    >
                      <td className="py-3 px-2 font-medium text-[var(--sys-on-surface)]">
                        {u.name}
                      </td>
                      <td className="py-3 px-2 text-[var(--sys-on-surface-variant)]">{u.email}</td>
                      <td className="py-3 px-2">
                        <Select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          options={roleOptions}
                          className="w-44"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant={u.status === 'active' ? 'success' : 'error'}>
                          {u.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-[var(--sys-on-surface-variant)] hidden md:table-cell">
                        {u.joined}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {u.status === 'active' ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleSuspend(u.id)}
                          >
                            <Ban className="size-3.5" />
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReinstate(u.id)}
                          >
                            Reinstate
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      icon={<FileText className="size-10" />}
                      title="No audit activity yet"
                      description="Audit events will appear here as users perform actions."
                    />
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
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
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
