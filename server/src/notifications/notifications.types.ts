export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  category: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory =
  | 'project'
  | 'boq'
  | 'report'
  | 'payment'
  | 'system'
  | 'collaboration';
