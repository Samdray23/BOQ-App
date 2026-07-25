import { useState, useRef, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import {
  Bell,
  LogOut,
  Menu,
  X,
  User,
  LayoutDashboard,
  FolderKanban,
  Bot,
  Settings,
  Home,
  Info,
  Mail,
  Camera,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

const publicLinks = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Info, label: 'About', path: '/about' },
  { icon: Mail, label: 'Contact', path: '/contact' },
];

const authLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: Bot, label: 'AI Assistant', path: '/ai-assistant' },
];

export default function RootLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount, notifications, markRead } = useNotificationStore();
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    if (notifDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifDropdownOpen]);

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  const handleLogoutConfirm = () => {
    setLogoutModalOpen(false);
    logout();
    resetOnboarding();
    toast.success('Logged out');
    navigate('/login');
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileImage(ev.target?.result as string);
      toast.success('Profile picture updated');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const navLinks = isAuthenticated ? authLinks : publicLinks;
  const isMarketingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[var(--sys-background)] text-[var(--sys-on-surface)] flex">
      {isAuthenticated && !isMarketingPage && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-[var(--sys-surface)]/80 backdrop-blur-md border-b border-[var(--sys-outline)] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="h-full px-2 sm:px-24 flex items-center justify-between">
            {isAuthenticated && !isMarketingPage ? (
              <div />
            ) : (
              location.pathname !== '/login' && (
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-3 ml-0 sm:ml-0"
                >
                  <img
                    src="/logo.png"
                    alt="BOQ"
                    className="h-12 w-12 hover:opacity-80 transition-opacity duration-200"
                  />
                </button>
              )
            )}

            {location.pathname !== '/register' && location.pathname !== '/login' && (
              <>
                {(isMarketingPage || !isAuthenticated) && (
                  <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                    {publicLinks.map((link) => {
                      const isActive = location.pathname === link.path;
                      return (
                        <button
                          key={link.path}
                          onClick={() => navigate(link.path)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 text-label-large rounded-[var(--sys-corner-sm)] transition-colors',
                            isActive
                              ? 'text-[var(--sys-primary)] bg-[var(--sys-primary)]/10'
                              : 'text-[var(--sys-outline)] hover:text-[var(--sys-on-surface)] hover:bg-[var(--sys-surface-container)]'
                          )}
                        >
                          {'icon' in link && link.icon && <link.icon className="h-4 w-4" />}
                          <span className="hidden sm:inline">{link.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                )}

                <div className="hidden lg:flex items-center gap-2">
                  {(isMarketingPage || !isAuthenticated) && (
                    <>
                      <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 text-label-large text-[var(--sys-outline)] hover:text-[var(--sys-on-surface)]"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => navigate('/register')}
                        className="px-4 py-2 text-label-large rounded-[var(--sys-corner-sm)] bg-[var(--sys-primary)] text-white hover:bg-[var(--sys-primary-container)] hover:text-[var(--sys-on-primary-container)] shadow-lg transition-all duration-200"
                      >
                        Get Started
                      </button>
                    </>
                  )}
                  {isAuthenticated && !isMarketingPage && (
                    <>
                      <div className="relative" ref={notifDropdownRef}>
                        <button
                          onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                          className="relative p-2 rounded-[var(--sys-corner-sm)] text-[var(--sys-on-surface-variant)] hover:bg-[var(--sys-surface-container)]"
                        >
                          <Bell className="h-5 w-5" />
                          {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-[var(--sys-error)] text-white text-label-small rounded-full h-4 w-4 flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </button>

                        {notifDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--sys-surface)] border border-[var(--sys-outline)] rounded-[var(--sys-corner-md)] shadow-lg z-50 py-1 max-h-96 overflow-y-auto">
                              <div className="px-4 py-3 border-b border-[var(--sys-outline)] flex items-center justify-between">
                                <p className="text-label-large text-[var(--sys-on-surface)]">Notifications</p>
                                {unreadCount > 0 && (
                                  <span className="text-micro text-[var(--sys-primary)]">{unreadCount} unread</span>
                                )}
                              </div>
                              {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                  <Bell className="size-8 mx-auto text-[var(--sys-on-surface-variant)]/40 mb-2" />
                                  <p className="text-title-small text-[var(--sys-on-surface-variant)]">No notifications yet</p>
                                </div>
                              ) : (
                                <div className="divide-y divide-[var(--sys-outline)]/50">
                                  {notifications.slice(0, 5).map((n) => (
                                    <button
                                      key={n.id}
                                      onClick={() => {
                                        markRead(n.id);
                                        setNotifDropdownOpen(false);
                                        navigate('/notifications');
                                      }}
                                      className={cn(
                                        'w-full text-left px-4 py-3 hover:bg-[var(--sys-surface-container)] transition-colors',
                                        !n.read && 'bg-[var(--sys-primary)]/5'
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-title-small text-[var(--sys-on-surface)] truncate">{n.title}</span>
                                        {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-[var(--sys-primary)]" />}
                                      </div>
                                      <p className="text-micro text-[var(--sys-on-surface-variant)] mt-0.5 line-clamp-1">{n.message}</p>
                                    </button>
                                  ))}
                                </div>
                              )}
                              {notifications.length > 0 && (
                                <div className="border-t border-[var(--sys-outline)]">
                                  <button
                                    onClick={() => {
                                      setNotifDropdownOpen(false);
                                      navigate('/notifications');
                                    }}
                                    className="w-full px-4 py-2.5 text-label-large text-[var(--sys-primary)] hover:bg-[var(--sys-surface-container)] text-center transition-colors"
                                  >
                                    View all notifications
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="relative" ref={dropdownRef}>
                        <button
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="flex items-center p-1 rounded-[var(--sys-corner-sm)] hover:bg-[var(--sys-surface-container)] transition-colors"
                        >
                          <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[1000px] bg-[var(--sys-on-primary-container)] border-[10px] border-[var(--sys-primary)] text-[var(--sys-primary-container)]">
                            <User className="size-6" />
                          </div>
                        </button>

                        {dropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={closeDropdown} />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--sys-on-primary)] rounded-[0.625rem] shadow-lg z-50 py-1">
                              <div className="px-4 py-3 border-b border-white/20">
                                <p className="text-label-large text-[var(--sys-primary)]">
                                  {user?.name}
                                </p>
                                <p className="text-micro text-[var(--sys-on-surface-variant)]">
                                  {user?.email}
                                </p>
                              </div>

                              <button
                                onClick={() => {
                                  closeDropdown();
                                  fileInputRef.current?.click();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-label-large text-[var(--sys-on-surface-variant)] hover:bg-white/10 transition-colors"
                              >
                                <Camera className="h-4 w-4" />
                                Change Profile Picture
                              </button>

                              <button
                                onClick={() => {
                                  closeDropdown();
                                  navigate('/settings');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-label-large text-[var(--sys-on-surface-variant)] hover:bg-white/10 transition-colors"
                              >
                                <Settings className="h-4 w-4" />
                                Settings
                              </button>

                              <div className="border-t border-white/20 my-1" />

                              <button
                                onClick={() => {
                                  closeDropdown();
                                  setLogoutModalOpen(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-label-large text-[var(--sys-error)] hover:bg-white/10 transition-colors"
                              >
                                <LogOut className="h-4 w-4" />
                                Logout
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageUpload}
                      />
                    </>
                  )}
                </div>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-[var(--sys-corner-sm)] text-[var(--sys-on-surface-variant)] hover:bg-[var(--sys-surface-container)]"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </>
            )}
          </div>
        </header>

        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed top-16 left-0 right-0 z-20 bg-[var(--sys-surface)] border-b border-[var(--sys-outline)] shadow-lg lg:hidden">
              <div className="px-2 py-4 flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <button
                      key={link.path}
                      onClick={() => {
                        navigate(link.path);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-label-large rounded-[var(--sys-corner-sm)] transition-colors',
                        isActive
                          ? 'text-[var(--sys-primary)] bg-[var(--sys-primary)]/10'
                          : 'text-[var(--sys-outline)] hover:text-[var(--sys-on-surface)] hover:bg-[var(--sys-surface-container)]'
                      )}
                    >
                      {'icon' in link && link.icon && <link.icon className="h-5 w-5" />}
                      {link.label}
                    </button>
                  );
                })}
                <div className="border-t border-[var(--sys-outline)] my-2" />
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-label-large text-[var(--sys-outline)] hover:text-[var(--sys-on-surface)] hover:bg-[var(--sys-surface-container)] rounded-[var(--sys-corner-sm)]"
                    >
                      <User className="h-5 w-5" />
                      Login
                    </button>
                    <button
                      onClick={() => {
                        navigate('/register');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-3 px-4 py-3 text-label-large rounded-[var(--sys-corner-sm)] bg-[var(--sys-primary)] text-white hover:bg-[var(--sys-primary-container)] hover:text-[var(--sys-on-primary-container)] mt-1 shadow-lg transition-all duration-200"
                    >
                      Get Started
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover border-2 border-[var(--sys-outline)]"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[var(--sys-primary)]/20 flex items-center justify-center text-label-large text-[var(--sys-primary)]">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="text-label-large">{user?.name}</p>
                        <p className="text-micro text-[var(--sys-on-surface-variant)]">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-label-large text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-on-surface)] hover:bg-[var(--sys-surface-container)] rounded-[var(--sys-corner-sm)]"
                    >
                      <Camera className="h-5 w-5" />
                      Change Profile Picture
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/notifications');
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-label-large text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-on-surface)] hover:bg-[var(--sys-surface-container)] rounded-[var(--sys-corner-sm)]"
                    >
                      <Bell className="h-5 w-5" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-[var(--sys-error)] text-white text-label-small rounded-full h-4 w-4 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-label-large text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-on-surface)] hover:bg-[var(--sys-surface-container)] rounded-[var(--sys-corner-sm)]"
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLogoutModalOpen(true);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-label-large text-[var(--sys-error)] hover:bg-[var(--sys-surface-container)] rounded-[var(--sys-corner-sm)]"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {logoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setLogoutModalOpen(false)}
          />
          <div className="relative bg-[var(--sys-on-primary)] rounded-[1.25rem] shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-title-small text-[var(--sys-on-surface)] mb-2">
              Confirm Logout
            </h3>
            <p className="text-body-small text-[var(--sys-on-surface-variant)] mb-6">
              Are you sure you want to log out? You will need to sign in again to access your account.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="px-4 py-2 text-label-large rounded-[var(--sys-corner-sm)] text-[var(--sys-on-surface-variant)] hover:bg-[var(--sys-surface-container)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 text-label-large rounded-[var(--sys-corner-sm)] bg-[var(--sys-error)] text-white hover:opacity-90 transition-opacity"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
