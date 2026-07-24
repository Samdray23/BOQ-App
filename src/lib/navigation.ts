import {
  LayoutDashboard,
  FolderKanban,
  FileSpreadsheet,
  Calculator,
  ClipboardList,
  BarChart3,
  Bot,
  Settings,
  Users,
  CreditCard,
  Bell,
  ShieldCheck,
  FileText,
  Layers,
  Palette,
} from 'lucide-react';

export interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  badge?: number;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    items: [{ icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' }],
  },
  {
    title: 'Projects',
    items: [
      { icon: FolderKanban, label: 'All Projects', path: '/projects' },
      { icon: FileSpreadsheet, label: 'BOQ Generator', path: '/projects/boq' },
      { icon: Calculator, label: 'Cost Estimation', path: '/projects/estimation' },
      { icon: ClipboardList, label: 'Material Schedules', path: '/projects/materials' },
      { icon: Layers, label: 'Measurement Sheets', path: '/projects/measurements' },
      { icon: BarChart3, label: 'Reports', path: '/projects/reports' },
      { icon: FileText, label: 'Rate Analysis', path: '/projects/rates' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { icon: Bot, label: 'AI Assistant', path: '/ai-assistant' },
      { icon: Palette, label: 'Templates', path: '/templates' },
    ],
  },
  {
    title: 'Team',
    items: [{ icon: Users, label: 'Collaboration', path: '/collaboration' }],
  },
  {
    title: 'Settings',
    items: [
      { icon: Settings, label: 'Settings', path: '/settings' },
      { icon: CreditCard, label: 'Subscription', path: '/subscription' },
      { icon: Bell, label: 'Notifications', path: '/notifications' },
      { icon: ShieldCheck, label: 'Admin', path: '/admin' },
    ],
  },
];
