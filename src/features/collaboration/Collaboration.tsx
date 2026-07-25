import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Mail,
  Calendar,
  Shield,
  Activity,
  X,
  Send,
  Building2,
} from 'lucide-react';
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

type Role = 'Owner' | 'Admin' | 'Member';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  joinedAt: Date;
  avatar: string;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
}

const roleVariants: Record<Role, 'default' | 'secondary' | 'outline'> = {
  Owner: 'default',
  Admin: 'secondary',
  Member: 'outline',
};

function formatActivityTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function formatJoinDate(date: Date): string {
  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div
      className="flex size-10 items-center justify-center rounded-full text-sm font-semibold"
      style={{
        backgroundColor: 'var(--sys-primary-container)',
        color: 'var(--sys-primary)',
      }}
    >
      {initials}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className="flex size-12 items-center justify-center rounded-xl"
          style={{
            backgroundColor: 'var(--sys-secondary-container)',
            color: 'var(--sys-secondary)',
          }}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--sys-on-surface)' }}>
            {value}
          </p>
          <p className="text-sm" style={{ color: 'var(--sys-on-surface-variant)' }}>
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityFeedItem({ activity }: { activity: ActivityItem }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className="mt-0.5 flex size-2 shrink-0 rounded-full"
        style={{ backgroundColor: 'var(--sys-primary)' }}
      />
      <div className="flex-1">
        <p className="text-sm" style={{ color: 'var(--sys-on-surface)' }}>
          <span className="font-semibold">{activity.user}</span> {activity.action}
        </p>
        <span className="mt-0.5 block text-xs" style={{ color: 'var(--sys-on-surface-variant)' }}>
          {formatActivityTime(activity.timestamp)}
        </span>
      </div>
    </div>
  );
}

const roleOptions = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Member', label: 'Member' },
];

export default function Collaboration() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [activities] = useState<ActivityItem[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Member'>('Member');

  const projects = useProjectStore((s) => s.projects);
  const activeProjects = useMemo(
    () => projects.filter((p) => p.status === 'processing' || p.status === 'draft').length,
    [projects],
  );

  const handleRoleChange = (memberId: string, newRole: Role) => {
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
    toast.success('Member role updated');
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    if (!inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      joinedAt: new Date(),
      avatar: getInitials(inviteEmail.split('@')[0]),
    };
    setMembers((prev) => [...prev, newMember]);

    toast.success(`Invitation sent to ${inviteEmail}`);
    setShowInviteDialog(false);
    setInviteEmail('');
    setInviteRole('Member');
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--sys-on-surface)' }}>
            Team Collaboration
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--sys-on-surface-variant)' }}>
            Manage your team and track project activity
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus size={16} />
          Invite Member
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Users size={24} />} label="Total Members" value={members.length} />
        <StatCard icon={<Building2 size={24} />} label="Active Projects" value={activeProjects} />
        <StatCard icon={<Activity size={24} />} label="Recent Activity" value={activities.length} />
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-lg"
              style={{ color: 'var(--sys-on-surface)' }}
            >
              <Users size={20} />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <EmptyState
                icon={<Users size={24} />}
                title="No team members yet"
                description="Invite members to collaborate on projects"
                action={
                  <Button onClick={() => setShowInviteDialog(true)}>
                    <UserPlus size={16} />
                    Invite Member
                  </Button>
                }
              />
            ) : (
              <div className="space-y-1">
                {members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className="flex items-center gap-4 rounded-xl p-3 transition-colors"
                    style={{ borderColor: 'var(--sys-outline-variant)' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = 'var(--sys-surface-variant)')
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Avatar initials={member.avatar} />
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-semibold"
                        style={{ color: 'var(--sys-on-surface)' }}
                      >
                        {member.name}
                      </p>
                      <p
                        className="flex items-center gap-1 truncate text-xs"
                        style={{ color: 'var(--sys-on-surface-variant)' }}
                      >
                        <Mail size={11} />
                        {member.email}
                      </p>
                    </div>
                    <div className="hidden items-center gap-3 sm:flex">
                      <span
                        className="flex items-center gap-1 text-xs"
                        style={{ color: 'var(--sys-on-surface-variant)' }}
                      >
                        <Calendar size={11} />
                        Joined {formatJoinDate(member.joinedAt)}
                      </span>
                    </div>
                    {member.role === 'Owner' ? (
                      <Badge
                        variant={roleVariants[member.role]}
                        className="flex items-center gap-1"
                      >
                        <Shield size={12} />
                        Owner
                      </Badge>
                    ) : (
                      <Select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                        options={[
                          { value: 'Admin', label: 'Admin' },
                          { value: 'Member', label: 'Member' },
                        ]}
                        className="w-28"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-lg"
              style={{ color: 'var(--sys-on-surface)' }}
            >
              <Activity size={20} />
              Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <EmptyState
                icon={<Activity size={24} />}
                title="No activity yet"
                description="Team activities will appear here"
              />
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--sys-outline-variant)' }}>
                {activities.map((activity) => (
                  <ActivityFeedItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showInviteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border p-6 shadow-xl"
            style={{
              backgroundColor: 'var(--sys-surface-container-high)',
              borderColor: 'var(--sys-outline-variant)',
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--sys-on-surface)' }}>
                Invite Member
              </h2>
              <Button size="icon" variant="ghost" onClick={() => setShowInviteDialog(false)}>
                <X size={18} />
              </Button>
            </div>

            <div className="mb-4">
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: 'var(--sys-on-surface)' }}
              >
                Email Address
              </label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
              />
            </div>

            <div className="mb-6">
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: 'var(--sys-on-surface)' }}
              >
                Role
              </label>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'Admin' | 'Member')}
                options={roleOptions}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--sys-on-surface-variant)' }}>
                Admins can manage projects and team members. Members can view and edit projects.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendInvite}>
                <Send size={14} />
                Send Invite
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
