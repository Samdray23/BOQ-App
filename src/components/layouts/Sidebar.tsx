import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { navigation } from '@/lib/navigation';
import { X } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-[var(--sys-surface)] border-r border-[var(--sys-outline)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-[var(--sys-outline)]">
          <span className="text-lg font-bold text-[var(--sys-primary)] tracking-tight">BOQ AI</span>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-on-surface)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navigation.map((section, i) => (
            <div key={i}>
              {section.title && (
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--sys-on-surface-variant)]/60">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    location.pathname.startsWith(item.path + '/');
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-[var(--sys-corner-sm)] text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-[var(--sys-primary)]/10 text-[var(--sys-primary)]'
                            : 'text-[var(--sys-on-surface-variant)] hover:bg-[var(--sys-surface-container)] hover:text-[var(--sys-on-surface)]'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-[var(--sys-primary)] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-[var(--sys-outline)]">
          <p className="text-[10px] text-[var(--sys-on-surface-variant)]/50 text-center">
            v1.0.0 | BOQ AI SaaS
          </p>
        </div>
      </aside>
    </>
  );
}
