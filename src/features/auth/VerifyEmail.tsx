import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/shared';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    api.auth
      .verify(token)
      .then((data) => {
        setStatus('success');
        setMessage(data.message);
        if (data.token && data.user) {
          login(data.user, data.token);
          const completed = data.onboardingCompleted ?? true;
          setOnboardingCompleted(completed);
          useOnboardingStore.setState((s) => ({ data: { ...s.data, completed } }));
          // Automatically navigate after 3 seconds
          setTimeout(() => {
            navigate(completed ? '/dashboard' : '/onboarding', { replace: true });
          }, 3000);
        }
      })
      .catch((err: Error) => {
        setStatus('error');
        setMessage(err.message || 'Verification failed.');
      });
  }, [token, login, navigate]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-6 sm:p-8 rounded-[0.125rem] border-0 shadow-md text-center">
        <CardHeader className="mb-6">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              status === 'loading'
                ? 'bg-[var(--sys-primary)]/10'
                : status === 'success'
                  ? 'bg-green-100'
                  : 'bg-red-100'
            }`}
          >
            {status === 'loading' ? (
              <Loader2 className="h-8 w-8 text-[var(--sys-primary)] animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
          </div>
          <CardTitle className="text-section-title text-[var(--sys-on-surface)]">
            {status === 'loading'
              ? 'Verifying...'
              : status === 'success'
                ? 'Email Verified'
                : 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-title-small text-[var(--sys-on-surface-variant)] mb-6">{message}</p>
          {status === 'success' ? (
            <Button onClick={() => navigate(onboardingCompleted ? '/dashboard' : '/onboarding')} className="w-full">
              {onboardingCompleted ? 'Go to Dashboard' : 'Go to Onboarding'}
            </Button>
          ) : (
            <div className="space-y-3">
              <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                Back to Sign In
              </Button>
              <p className="text-title-small text-[var(--sys-on-surface-variant)]">
                Need help?{' '}
                <Link
                  to="/register"
                  className="text-label-large text-[var(--sys-primary)] hover:underline"
                >
                  Create a new account
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
