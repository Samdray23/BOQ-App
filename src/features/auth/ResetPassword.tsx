import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input, Button, Card, CardHeader, CardTitle, CardContent } from '@/components/shared';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!token) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 sm:p-8 text-center">
          <CardContent>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <p className="text-title-small text-[var(--sys-on-surface-variant)] mb-4">
              Invalid reset link.
            </p>
            <Link
              to="/forgot-password"
              className="text-label-large text-[var(--sys-primary)] hover:underline"
            >
              Request a new reset link
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 sm:p-8 text-center">
          <CardContent>
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
            <p className="text-title-small text-[var(--sys-on-surface-variant)] mb-6">{message}</p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error('Please enter a new password');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await api.auth.resetPassword(token, password);
      setStatus('success');
      setMessage(data.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed';
      setStatus('error');
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <CardHeader className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--sys-corner-sm)] bg-[var(--sys-primary)]/10">
            <Lock className="h-6 w-6 text-[var(--sys-primary)]" />
          </div>
          <CardTitle className="text-section-title text-[var(--sys-on-surface)]">
            Set new password
          </CardTitle>
          <p className="mt-1 text-title-small text-[var(--sys-on-surface-variant)]">
            Enter your new password below.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="New Password"
              placeholder=""
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
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              }
            />
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              label="Confirm Password"
              placeholder=""
              icon={<Lock className="h-4 w-4" />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full">
              Reset Password
            </Button>
          </form>
          <p className="mt-6 text-center text-title-small text-[var(--sys-on-surface-variant)]">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-label-large text-[var(--sys-primary)] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
