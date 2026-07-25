import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Input, Button, Card, CardHeader, CardTitle, CardContent } from '@/components/shared';
import { useAuthStore } from '@/store/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      login({ id: crypto.randomUUID(), name, email, role: 'quantity_surveyor' }, crypto.randomUUID());
      setLoading(false);
      toast.success('Welcome back!');
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 sm:p-8 rounded-[0.125rem] border-0 shadow-md">
        <CardHeader className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[var(--sys-primary-container)]">
            <Lock className="h-6 w-6 text-[var(--sys-on-primary-container)]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[var(--sys-on-surface)]">
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Enter your password"
              icon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-on-surface)] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[var(--sys-on-surface-variant)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--sys-outline)] text-[var(--sys-primary)] focus:ring-[var(--sys-primary)]/50"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-[var(--sys-primary)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--sys-on-surface-variant)]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-[var(--sys-primary)] hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
