import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge, EmptyState } from '@/components/shared';
import { useNotificationStore } from '@/store/useNotificationStore';
import { cn } from '@/lib/cn';
import { Bell, Info, CheckCircle, AlertTriangle, XCircle, CheckCheck } from 'lucide-react';

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'read', label: 'Read' },
] as const;

const typeConfig = {
  info: { icon: Info, bg: 'bg-[var(--sys-primary)]/10', color: 'text-[var(--sys-primary)]' },
  success: {
    icon: CheckCircle,
    bg: 'bg-[var(--sys-secondary)]/15',
    color: 'text-[var(--sys-secondary)]',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    color: 'text-yellow-800 dark:text-yellow-400',
  },
  error: { icon: XCircle, bg: 'bg-[var(--sys-error)]/15', color: 'text-[var(--sys-error)]' },
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
  };
  onMarkRead: (id: string) => void;
}) {
  const config = typeConfig[notification.type as keyof typeof typeConfig] || typeConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={() => !notification.read && onMarkRead(notification.id)}
        className={cn(
          'w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-[var(--sys-corner-sm)] transition-colors',
          !notification.read && 'bg-[var(--sys-primary)]/5',
          'hover:bg-[var(--sys-surface-container)]'
        )}
      >
        <div className={cn('rounded-lg p-2 shrink-0', config.bg, config.color)}>
          <Icon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-sm font-medium truncate',
                !notification.read
                  ? 'text-[var(--sys-on-surface)]'
                  : 'text-[var(--sys-on-surface-variant)]'
              )}
            >
              {notification.title}
            </span>
            {!notification.read && (
              <span className="size-2 shrink-0 rounded-full bg-[var(--sys-primary)]" />
            )}
          </div>
          <p className="text-sm text-[var(--sys-on-surface-variant)] mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <span className="text-xs text-[var(--sys-on-surface-variant)]/60 mt-1 block">
            {relativeTime(notification.createdAt)}
          </span>
        </div>
      </button>
    </motion.div>
  );
}

export default function Notifications() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter((n) => (filter === 'unread' ? !n.read : n.read));
  }, [notifications, filter]);

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--sys-on-surface)]">Notifications</h1>
          {unreadCount > 0 && <Badge variant="error">{unreadCount}</Badge>}
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
          <CheckCheck className="size-4" />
          Mark All Read
        </Button>
      </motion.div>

      <div className="flex gap-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-[var(--sys-corner-sm)] transition-colors',
              filter === tab.id
                ? 'bg-[var(--sys-primary)] text-white'
                : 'text-[var(--sys-on-surface-variant)] hover:bg-[var(--sys-surface-container)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card padding="none">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bell className="size-12" />}
            title="No notifications yet"
            description={
              filter !== 'all' ? 'No notifications match this filter.' : "You're all caught up!"
            }
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="divide-y divide-[var(--sys-outline)]/50">
              {filtered.map((n) => (
                <NotificationItem key={n.id} notification={n} onMarkRead={markRead} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </Card>
    </div>
  );
}
